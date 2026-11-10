import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { momentoDelDia, horaActual } from "./hora";
import { audio } from "./sonidos";
import { alCambiarVoz } from "./voz";

/**
 * Música suave y sonidos de ambiente según el lugar: pajaritos afuera,
 * grillos de noche, una melodía tranquila adentro. Todo se toca con el
 * sintetizador del navegador (no pesa nada y funciona sin internet), muy
 * bajito, y se baja más cuando alguien habla.
 */
export type Entorno = "barrio" | "campo" | "sala" | "taller" | "casa";

const TEMAS: Record<Entorno | "noche", { pulso: number; escala: number[]; base: number; motivo: number[]; onda: OscillatorType }> = {
  barrio: { pulso: 0.36, escala: [0, 2, 4, 7, 9, 12, 14, 16], base: 261.6, motivo: [0, 2, 4, 2, 5, 4, 2, -1, 0, 2, 4, 5, 7, 5, 4, -1], onda: "triangle" },
  campo: { pulso: 0.42, escala: [0, 2, 4, 7, 9, 12, 14, 16], base: 293.7, motivo: [4, -1, 2, 0, 2, 4, 5, -1, 4, 2, 0, -1, 2, 4, 2, -1], onda: "triangle" },
  sala: { pulso: 0.46, escala: [0, 2, 4, 5, 7, 9, 12, 14], base: 261.6, motivo: [0, 4, 2, 4, 5, -1, 4, -1, 2, 4, 0, 2, 4, -1, 0, -1], onda: "sine" },
  taller: { pulso: 0.4, escala: [0, 2, 4, 7, 9, 12, 14, 16], base: 329.6, motivo: [0, 2, 5, 4, -1, 2, 4, 6, 5, -1, 4, 2, 0, 2, 4, -1], onda: "triangle" },
  casa: { pulso: 0.5, escala: [0, 2, 4, 5, 7, 9, 12, 14], base: 220, motivo: [4, 2, 0, -1, 2, 4, 5, -1, 4, 2, 4, -1, 0, -1, -1, -1], onda: "sine" },
  noche: { pulso: 0.62, escala: [0, 2, 4, 7, 9, 12, 14, 16], base: 196, motivo: [4, -1, 2, -1, 0, -1, 2, -1, 4, -1, 5, -1, 4, -1, -1, -1], onda: "sine" },
};

const CLAVE = "escuelita:musica";
let encendida = true;
try { if (typeof localStorage !== "undefined") encendida = localStorage.getItem(CLAVE) !== "no"; } catch { /* sin memoria: queda encendida */ }
const oyentes = new Set<(v: boolean) => void>();

let salida: GainNode | null = null;
let actual: Entorno | null = null;
let reloj: ReturnType<typeof setInterval> | null = null;
let paso = 0, proximo = 0, proximoBicho = 0, vuelta = 0;
let hablando = false;

function canal(a: AudioContext): GainNode {
  if (!salida || salida.context !== a) {
    salida = a.createGain();
    salida.gain.value = 0;
    salida.connect(a.destination);
  }
  return salida;
}
function volumen() {
  const a = audio();
  if (!a) return;
  const v = !encendida || !actual ? 0 : hablando ? 0.25 : 1;
  canal(a).gain.setTargetAtTime(v, a.currentTime, 0.25);
}

function nota(a: AudioContext, frec: number, cuando: number, dura: number, vol: number, onda: OscillatorType, hasta?: number) {
  const o = a.createOscillator(), g = a.createGain();
  o.type = onda;
  o.frequency.setValueAtTime(frec, cuando);
  if (hasta) o.frequency.exponentialRampToValueAtTime(hasta, cuando + dura);
  g.gain.setValueAtTime(0.0001, cuando);
  g.gain.exponentialRampToValueAtTime(vol, cuando + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, cuando + dura);
  o.connect(g).connect(canal(a));
  o.start(cuando);
  o.stop(cuando + dura + 0.05);
}

function tocar() {
  const a = audio();
  if (!a || !actual || !encendida || a.state !== "running") return;
  const noche = momentoDelDia(horaActual()) === "noche";
  const afuera = actual === "barrio" || actual === "campo";
  const t = TEMAS[noche && afuera ? "noche" : actual];
  if (proximo < a.currentTime) proximo = a.currentTime + 0.1;
  // Se agenda un poquito por adelantado para que el ritmo no tiemble.
  while (proximo < a.currentTime + 0.6) {
    const i = paso % 16;
    let grado = t.motivo[i]!;
    // Cada vuelta cambia un par de notas, para que no canse.
    if (grado >= 0 && vuelta % 2 === 1 && i % 5 === 3) grado = (grado + 2) % t.escala.length;
    if (grado >= 0) nota(a, t.base * Math.pow(2, t.escala[grado]! / 12), proximo, t.pulso * 1.7, 0.035, t.onda);
    if (i % 8 === 0) nota(a, (t.base / 2) * Math.pow(2, t.escala[i === 0 ? 0 : 3]! / 12), proximo, t.pulso * 7, 0.03, "sine");
    proximo += t.pulso;
    paso++;
    if (paso % 16 === 0) vuelta++;
  }
  // Los bichos del lugar: pajaritos de día, grillos de noche.
  if (afuera && a.currentTime > proximoBicho) {
    const c = a.currentTime + 0.05;
    if (noche) {
      for (let k = 0; k < 3; k++) nota(a, 4300, c + k * 0.07, 0.045, 0.012, "sine");
      proximoBicho = a.currentTime + 0.9 + Math.random() * 1.2;
    } else {
      const n = 2 + Math.floor(Math.random() * 3), f = 2200 + Math.random() * 1400;
      for (let k = 0; k < n; k++) nota(a, f, c + k * 0.13, 0.09, 0.02, "sine", f * (1.25 + Math.random() * 0.3));
      proximoBicho = a.currentTime + 2.5 + Math.random() * (actual === "campo" ? 3 : 6);
    }
  }
}

/** Cambia la música al lugar donde se está (o la apaga con `null`). */
export function ponerAmbiente(entorno: Entorno | null) {
  if (Platform.OS !== "web") return;
  if (entorno !== actual) { paso = 0; vuelta = 0; proximo = 0; }
  actual = entorno;
  volumen();
  if (entorno && !reloj) reloj = setInterval(tocar, 200);
  if (!entorno && reloj) { clearInterval(reloj); reloj = null; }
}

export const musicaEncendida = () => encendida;
export function alternarMusica() {
  encendida = !encendida;
  try { localStorage.setItem(CLAVE, encendida ? "si" : "no"); } catch { /* no importa */ }
  volumen();
  oyentes.forEach((f) => f(encendida));
}

if (Platform.OS === "web") alCambiarVoz((v) => { hablando = v; volumen(); });

/** Pone la música del lugar mientras la pantalla está abierta. */
export function useAmbiente(entorno: Entorno | null) {
  useEffect(() => {
    if (!entorno) return;
    ponerAmbiente(entorno);
    // Al salir no se corta: la pantalla siguiente pone la suya.
  }, [entorno]);
}

/** Para el botón de música: si está encendida y cómo cambiarla. */
export function useMusica(): [boolean, () => void] {
  const [v, setV] = useState(encendida);
  useEffect(() => { oyentes.add(setV); return () => void oyentes.delete(setV); }, []);
  return [v, alternarMusica];
}
