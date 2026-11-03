import * as Speech from "expo-speech";

/**
 * Voz de Emilia. Usa TTS del sistema como respaldo; en producción se
 * reemplaza por audios grabados (ver docs/ESTUDIO.md §8).
 *
 * `hablar` devuelve una promesa que se cumple cuando termina de hablar, para
 * que el juego no avance (ni corte la frase) antes de tiempo. Si el sistema no
 * avisa el final, se cumple igual tras un tiempo estimado según el largo.
 *
 * `anunciarDespues` deja una frase en espera (por ejemplo, "te ganaste una
 * moneda") que se dice apenas termine la frase actual, sin cortarla. La
 * promesa de esa frase actual espera también al anuncio, así el juego no
 * pasa a la siguiente ronda en medio del reconocimiento.
 */
let pendiente: string | null = null;
let hablando = false;

function decir(texto: string): Promise<"fin" | "cortada"> {
  return new Promise((resolver) => {
    let listo = false;
    const fin = (como: "fin" | "cortada") => {
      if (listo) return;
      listo = true;
      clearTimeout(respaldo);
      resolver(como);
    };
    const respaldo = setTimeout(() => fin("fin"), 1200 + texto.length * 85);
    Speech.speak(texto, { language: "es-ES", rate: 0.85, pitch: 1.15, onDone: () => fin("fin"), onStopped: () => fin("cortada"), onError: () => fin("fin") });
  });
}

export async function hablar(texto: string): Promise<void> {
  Speech.stop();
  hablando = true;
  let como = await decir(texto);
  // Si terminó de forma natural y hay un anuncio esperando, se dice a continuación.
  while (como === "fin" && pendiente) {
    const anuncio = pendiente;
    pendiente = null;
    como = await decir(anuncio);
  }
  if (como === "fin") hablando = false;
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
export async function hablarYEsperar(texto: string, pausaMs = 400) {
  await hablar(texto);
  await new Promise((r) => setTimeout(r, pausaMs));
}
