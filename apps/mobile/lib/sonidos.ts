import { Platform } from "react-native";

/**
 * Sonidos cortitos de juego (tocar, acertar, casi, fiesta), hechos con el
 * sintetizador del navegador: no pesan nada y funcionan sin internet.
 */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  try {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx ??= new C();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function nota(frec: number, desde: number, dura: number, vol = 0.16, tipo: OscillatorType = "sine", hasta?: number) {
  const a = audio();
  if (!a) return;
  const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + desde;
  o.type = tipo;
  o.frequency.setValueAtTime(frec, t);
  if (hasta) o.frequency.exponentialRampToValueAtTime(hasta, t + dura);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dura);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dura + 0.03);
}

export const sonido = {
  /** Al tocar un botón. */
  toque: () => nota(520, 0, 0.09, 0.1, "triangle", 760),
  /** ¡Bien! Tres notas que suben. */
  acierto: () => [523, 659, 784].forEach((f, i) => nota(f, i * 0.09, 0.22, 0.16, "triangle")),
  /** Casi: un "bup" suave, nunca feo. */
  casi: () => nota(330, 0, 0.2, 0.1, "sine", 250),
  /** Fiesta: completó sus estrellas. */
  fiesta: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => nota(f, i * 0.1, 0.28, 0.15, "triangle")),
};
