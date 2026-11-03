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
let turno = 0;

const esWeb = Platform.OS === "web" && typeof window !== "undefined" && "speechSynthesis" in window;
const sintetizador = () => (esWeb ? window.speechSynthesis : null);

// --- Voces del navegador por idioma (español: prefiere latinoamericanas; inglés: EE. UU.) ---
export type Idioma = "es" | "en";
const PREFERENCIAS: Record<Idioma, string[]> = {
  es: ["es-cl", "es-419", "es-us", "es-mx", "es-ar", "es-co", "es-es", "es"],
  en: ["en-us", "en-gb", "en-au", "en-ca", "en"],
};
const LENGUA: Record<Idioma, string> = { es: "es-ES", en: "en-US" };
const vozElegida: Record<Idioma, SpeechSynthesisVoice | null> = { es: null, en: null };
function elegirVoz() {
  const s = sintetizador();
  if (!s) return;
  const todas = s.getVoices();
  for (const idioma of ["es", "en"] as Idioma[]) {
    const orden = PREFERENCIAS[idioma];
    const voces = todas.filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith(idioma));
    voces.sort((a, b) => {
      const ia = orden.findIndex((o) => a.lang.toLowerCase().replace("_", "-").startsWith(o));
      const ib = orden.findIndex((o) => b.lang.toLowerCase().replace("_", "-").startsWith(o));
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || Number(b.localService) - Number(a.localService);
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
  // Algunos navegadores solo permiten hablar después del primer toque: se "despierta" la voz ahí.
  const despertar = () => {
    try {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis.speak(u);
    } catch { /* sin voz disponible */ }
    window.removeEventListener("pointerdown", despertar);
  };
  window.addEventListener("pointerdown", despertar);
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
    u.rate = idioma === "en" ? 0.8 : 0.85;
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
    u.onerror = (e) => fin(e.error === "interrupted" || e.error === "canceled" ? "cortada" : "fin");
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
    Speech.speak(texto, { language: LENGUA[idioma], rate: idioma === "en" ? 0.8 : 0.85, pitch: 1.15, onDone: () => fin("fin"), onStopped: () => fin("cortada"), onError: () => fin("fin") });
  });
}

const decir = (texto: string, miTurno: number, idioma: Idioma = "es") => (esWeb ? decirWeb(texto, miTurno, idioma) : decirNativo(texto, idioma));

/** Dice una frase (en español, o en inglés para los amigos de otros países). */
export async function hablar(texto: string, idioma: Idioma = "es"): Promise<void> {
  const miTurno = ++turno;
  if (!esWeb) Speech.stop();
  hablando = true;
  let como = await decir(texto, miTurno, idioma);
  // Si terminó de forma natural y hay un anuncio esperando, se dice a continuación.
  while (como === "fin" && pendiente && miTurno === turno) {
    const anuncio = pendiente;
    pendiente = null;
    como = await decir(anuncio, miTurno);
  }
  if (miTurno === turno) hablando = false;
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
  hablando = false;
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
