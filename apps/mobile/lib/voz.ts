import * as Speech from "expo-speech";

/**
 * Voz de Emilia. Usa TTS del sistema como respaldo; en producción se
 * reemplaza por audios grabados (ver docs/ESTUDIO.md §8).
 */
export function hablar(texto: string) {
  Speech.stop();
  Speech.speak(texto, { language: "es-ES", rate: 0.85, pitch: 1.15 });
}
