import * as Speech from "expo-speech";

/**
 * Voz de Emilia. Usa TTS del sistema como respaldo; en producción se
 * reemplaza por audios grabados (ver docs/ESTUDIO.md §8).
 *
 * Devuelve una promesa que se cumple cuando termina de hablar, para que el
 * juego no avance (ni corte la frase) antes de tiempo. Si el sistema no avisa
 * el final, se cumple igual tras un tiempo estimado según el largo del texto.
 */
export function hablar(texto: string): Promise<void> {
  Speech.stop();
  return new Promise((resolver) => {
    let listo = false;
    const fin = () => {
      if (listo) return;
      listo = true;
      clearTimeout(respaldo);
      resolver();
    };
    const respaldo = setTimeout(fin, 1200 + texto.length * 85);
    Speech.speak(texto, { language: "es-ES", rate: 0.85, pitch: 1.15, onDone: fin, onStopped: fin, onError: fin });
  });
}

/** Espera a que termine la frase y luego una pausa breve. */
export async function hablarYEsperar(texto: string, pausaMs = 400) {
  await hablar(texto);
  await new Promise((r) => setTimeout(r, pausaMs));
}
