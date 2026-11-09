import * as Speech from "expo-speech";
import { Platform } from "react-native";

/**
 * Voz de Emilia. Usa la voz del sistema como respaldo; en producción se
 * reemplaza por audios grabados (ver docs/ESTUDIO.md §8).
 *
 * `hablar` devuelve una promesa que se cumple cuando termina de hablar, para
 * que el juego no avance (ni corte la frase) antes de tiempo. Si el sistema no
 * avisa el final, se cumple igual tras un tiempo estimado según el largo.
 *
 * `anunciarDespues` deja una frase en espera (por ejemplo, "te ganaste una
 * moneda") que se dice apenas termine la frase actual, sin cortarla.
 *
 * En web se usa la voz del navegador directamente, con protecciones para fallas
 * conocidas de Chrome en tablets (sobre todo Android):
 * - Se guarda la frase en curso: si el navegador la "olvida", nunca avisa que
 *   terminó y deja trabadas las siguientes.
 * - Después de cortar una frase se espera un instante antes de decir la nueva
 *   (si no, Chrome a veces descarta la nueva en silencio).
 * - Si la voz queda pausada o trabada, se reactiva sola; y `reactivarVoz()`
 *   permite reactivarla a mano (botón 🔊 del barrio).
 */
let pendiente: string | null = null;
let hablando = false;
/** Quienes quieren saber cuándo la voz empieza y termina (bocas que se mueven, escenas que esperan). */
const oyentesVoz = new Set<(sonando: boolean) => void>();
function marcarHablando(v: boolean) {
  if (hablando === v) return;
  hablando = v;
  oyentesVoz.forEach((f) => f(v));
}
export const vozSonando = () => hablando;
export function alCambiarVoz(f: (sonando: boolean) => void) {
  oyentesVoz.add(f);
  return () => { oyentesVoz.delete(f); };
}
let turno = 0;

const esWeb = Platform.OS === "web" && typeof window !== "undefined" && "speechSynthesis" in window;
const sintetizador = () => (esWeb ? window.speechSynthesis : null);

// --- Voces del navegador por idioma (español: prefiere latinoamericanas; inglés: EE. UU.) ---
export type Idioma = "es" | "en" | "pt" | "fr" | "zh";
const PREFERENCIAS: Record<Idioma, string[]> = {
  es: ["es-cl", "es-419", "es-us", "es-mx", "es-ar", "es-co", "es-es", "es"],
  en: ["en-us", "en-gb", "en-au", "en-ca", "en"],
  pt: ["pt-br", "pt-pt", "pt"],
  fr: ["fr-fr", "fr-ca", "fr-be", "fr"],
  zh: ["zh-cn", "cmn-cn", "cmn-hans", "zh-hans", "zh-tw", "cmn", "zh"],
};
const LENGUA: Record<Idioma, string> = { es: "es-ES", en: "en-US", pt: "pt-BR", fr: "fr-FR", zh: "zh-CN" };
const IDIOMAS: Idioma[] = ["es", "en", "pt", "fr", "zh"];
const vozElegida: Record<Idioma, SpeechSynthesisVoice | null> = { es: null, en: null, pt: null, fr: null, zh: null };
/** ¿Hay una voz instalada en la tablet para este idioma? (si no, el navegador intenta igual). */
export const hayVoz = (idioma: Idioma) => !esWeb || !!vozElegida[idioma];
function elegirVoz() {
  const s = sintetizador();
  if (!s) return;
  const todas = s.getVoices();
  for (const idioma of IDIOMAS) {
    const orden = PREFERENCIAS[idioma];
    const voces = todas.filter((v) => orden.some((o) => v.lang.toLowerCase().replace("_", "-").startsWith(o)));
    voces.sort((a, b) => {
      const ia = orden.findIndex((o) => a.lang.toLowerCase().replace("_", "-").startsWith(o));
      const ib = orden.findIndex((o) => b.lang.toLowerCase().replace("_", "-").startsWith(o));
      return Number(b.localService) - Number(a.localService) || (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    vozElegida[idioma] = voces[0] ?? null;
  }
}
if (esWeb) {
  elegirVoz();
  window.speechSynthesis.addEventListener?.("voiceschanged", elegirVoz);
  // Al volver a la app (o desbloquear la tablet), se limpia cualquier frase trabada.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") reactivarVoz(false);
  });
}

/** Última frase pedida: se repite al tocar «A jugar» si el navegador la bloqueó. */
let ultima: { texto: string; idioma: Idioma } | null = null;
let bloqueada = false;
const avisosBloqueo = new Set<() => void>();
/** Aviso cuando el navegador no deja hablar hasta que se toque la pantalla. */
export function alBloquearVoz(f: () => void) {
  avisosBloqueo.add(f);
  return () => void avisosBloqueo.delete(f);
}
/**
 * ¿Hace falta un primer toque para que suene? En la web, el navegador no deja
 * hablar hasta que el niño toca la pantalla (por eso al abrir no se escuchaba
 * nada y después la voz llegaba de golpe).
 */
export function necesitaToque(): boolean {
  if (!esWeb) return false;
  const activacion = (navigator as unknown as { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return activacion ? !activacion.hasBeenActive : false;
}
/** Después del primer toque: repite la última frase para que el niño la escuche. */
export function empezarConToque() {
  bloqueada = false;
  const s = sintetizador();
  if (s) {
    s.cancel();
    if (s.paused) s.resume();
    elegirVoz();
  }
  if (ultima) void hablar(ultima.texto, ultima.idioma);
}

/** Guarda la frase en curso para que el navegador no la pierda. */
let fraseActual: SpeechSynthesisUtterance | null = null;
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function decirWeb(texto: string, miTurno: number, idioma: Idioma): Promise<"fin" | "cortada"> {
  const s = sintetizador()!;
  if (s.speaking || s.pending) {
    s.cancel();
    await espera(80);
  }
  if (miTurno !== turno) return "cortada";
  if (s.paused) s.resume();
  return new Promise((resolver) => {
    let listo = false;
    const u = new SpeechSynthesisUtterance(texto);
    const voz = vozElegida[idioma];
    u.lang = voz?.lang ?? LENGUA[idioma];
    if (voz) u.voice = voz;
    u.rate = idioma === "es" ? 0.85 : 0.8;
    u.pitch = 1.15;
    fraseActual = u;
    const fin = (como: "fin" | "cortada") => {
      if (listo) return;
      listo = true;
      clearTimeout(vigilante);
      if (fraseActual === u) fraseActual = null;
      resolver(como);
    };
    // Si el navegador no avisa que terminó, se da por terminada y se destraba la voz.
    const vigilante = setTimeout(() => {
      if (s.speaking && fraseActual === u) s.cancel();
      fin("fin");
    }, 2500 + texto.length * 95);
    u.onend = () => fin(miTurno === turno ? "fin" : "cortada");
    u.onerror = (e) => {
      if (e.error === "not-allowed") {
        bloqueada = true;
        avisosBloqueo.forEach((f) => f());
      }
      fin(e.error === "interrupted" || e.error === "canceled" ? "cortada" : "fin");
    };
    try {
      s.speak(u);
    } catch {
      fin("fin");
    }
  });
}

function decirNativo(texto: string, idioma: Idioma): Promise<"fin" | "cortada"> {
  return new Promise((resolver) => {
    let listo = false;
    const fin = (como: "fin" | "cortada") => {
      if (listo) return;
      listo = true;
      clearTimeout(respaldo);
      resolver(como);
    };
    const respaldo = setTimeout(() => fin("fin"), 1200 + texto.length * 85);
    Speech.speak(texto, { language: LENGUA[idioma], rate: idioma === "es" ? 0.85 : 0.8, pitch: 1.15, onDone: () => fin("fin"), onStopped: () => fin("cortada"), onError: () => fin("fin") });
  });
}

const decir = (texto: string, miTurno: number, idioma: Idioma = "es") => (esWeb ? decirWeb(texto, miTurno, idioma) : decirNativo(texto, idioma));

/** Dice una frase (en español, o en inglés para los amigos de otros países). */
export async function hablar(texto: string, idioma: Idioma = "es"): Promise<void> {
  ultima = { texto, idioma };
  const miTurno = ++turno;
  if (!esWeb) Speech.stop();
  marcarHablando(true);
  let como = await decir(texto, miTurno, idioma);
  // Si terminó de forma natural y hay un anuncio esperando, se dice a continuación.
  while (como === "fin" && pendiente && miTurno === turno) {
    const anuncio = pendiente;
    pendiente = null;
    como = await decir(anuncio, miTurno);
  }
  if (miTurno === turno) marcarHablando(false);
}

/** Dice una frase después de la actual (o enseguida, si nadie está hablando). */
export function anunciarDespues(texto: string) {
  pendiente = texto;
  if (hablando) return;
  // Muchas veces la felicitación del juego empieza justo después de entregar la moneda:
  // se espera un instante para decir el anuncio después de ella y no cortarla.
  setTimeout(() => {
    if (pendiente === texto && !hablando) {
      pendiente = null;
      void hablar(texto);
    }
  }, 250);
}

/** Espera a que termine la frase (y el anuncio que venga después) y luego una pausa breve. */
export async function hablarYEsperar(texto: string, pausaMs = 400, idioma: Idioma = "es") {
  await hablar(texto, idioma);
  await espera(pausaMs);
}

/** Destraba la voz si quedó en silencio (y opcionalmente dice algo para comprobarla). */
export function reactivarVoz(probar = true) {
  turno++;
  pendiente = null;
  marcarHablando(false);
  const s = sintetizador();
  if (s) {
    s.cancel();
    if (s.paused) s.resume();
    elegirVoz();
  } else {
    Speech.stop();
  }
  if (probar) setTimeout(() => void hablar("¡Hola! Ya me escuchas otra vez."), 150);
}

/**
 * Hace algo cuando la voz termina la frase actual (por ejemplo, entrar a un
 * juego), sin cortarla. Espera al menos `minMs` para que se alcance a leer el
 * globo y nunca más de `maxMs`, por si la voz no avisa.
 */
export function despuesDeHablar(accion: () => void, { minMs = 900, maxMs = 9000, pausaMs = 250 } = {}) {
  const inicio = Date.now();
  let listo = false;
  const terminar = () => {
    if (listo) return;
    listo = true;
    clearInterval(revisar);
    clearTimeout(tope);
    quitar();
    setTimeout(accion, pausaMs);
  };
  // Sin voz en español (o con la voz bloqueada) no se espera a que "termine": basta con el mínimo.
  const sinVoz = !hayVoz("es") || bloqueada;
  const probar = () => { if ((sinVoz || !hablando) && Date.now() - inicio >= minMs) terminar(); };
  const quitar = alCambiarVoz(() => probar());
  const revisar = setInterval(probar, 150);
  const tope = setTimeout(terminar, maxMs);
}
