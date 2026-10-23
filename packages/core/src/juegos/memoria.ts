import { ANIMALES } from "../contenido/animales";
import { LETRAS } from "../contenido/letras";
import type { Aleatorio } from "../tipos";
import { mezclar } from "./azar";

/**
 * Memoria (parejas) con temas y 6 niveles. En frutas y animales las dos
 * cartas son iguales; en letras y números la pareja enseña algo: la letra va
 * con un dibujo que empieza con ella, y el número con su cantidad de objetos.
 */
export type TemaMemoria = "frutas" | "animales" | "letras" | "numeros" | "mezcla";

export const TEMAS_MEMORIA: Array<{ id: TemaMemoria; nombre: string; emoji: string }> = [
  { id: "frutas", nombre: "Frutas", emoji: "🍓" },
  { id: "animales", nombre: "Animales", emoji: "🐶" },
  { id: "letras", nombre: "Letras", emoji: "🔤" },
  { id: "numeros", nombre: "Números", emoji: "🔢" },
  { id: "mezcla", nombre: "Todo mezclado", emoji: "🎁" },
];

/** Parejas por nivel: del 1 (2 parejas) al 6 (10 parejas). */
export const PAREJAS_POR_NIVEL = [2, 3, 4, 6, 8, 10] as const;
export const NIVELES_MEMORIA = PAREJAS_POR_NIVEL.length;

export const FRUTAS = ["🍎", "🍌", "🍇", "🍓", "🍐", "🍊", "🍉", "🍍", "🥝", "🍒", "🍑", "🥑"];

export interface CartaMemoria {
  id: number;
  /** Las dos cartas de una pareja comparten este valor. */
  par: string;
  /** Lo que muestra la carta al darla vuelta. */
  cara: string;
  /** Lo que dice Emilia al encontrar la pareja. */
  frase: string;
}

type Pareja = { par: string; caras: [string, string]; frase: string };

function parejasDe(tema: Exclude<TemaMemoria, "mezcla">, cantidad: number, azar: Aleatorio): Pareja[] {
  switch (tema) {
    case "frutas":
      return mezclar(FRUTAS, azar).slice(0, cantidad).map((f) => ({ par: f, caras: [f, f], frase: "¡Pareja de frutas!" }));
    case "animales":
      return mezclar(ANIMALES, azar)
        .slice(0, cantidad)
        .map((a) => ({ par: a.id, caras: [a.emoji, a.emoji], frase: `¡Pareja! ${a.nombre}: ${a.sonido}` }));
    case "letras":
      return mezclar(LETRAS, azar)
        .slice(0, cantidad)
        .map((l) => ({ par: l.letra, caras: [l.letra, l.emoji], frase: `¡${l.letra} de ${l.palabra}!` }));
    case "numeros": {
      const objetos = ["⭐", "🍎", "🎈", "🐟", "🌼"];
      // Números chicos en los primeros niveles: del 1 a la cantidad de parejas + 2 (máximo 10).
      const tope = Math.min(10, cantidad + 2);
      return mezclar(Array.from({ length: tope }, (_, k) => k + 1), azar)
        .slice(0, cantidad)
        .map((n, k) => ({ par: `n${n}`, caras: [String(n), objetos[k % objetos.length]!.repeat(n)], frase: `¡Sí! Hay ${n}.` }));
    }
  }
}

export function tableroMemoria(nivel: number, tema: TemaMemoria = "animales", azar: Aleatorio = Math.random): CartaMemoria[] {
  const indice = Math.min(Math.max(nivel, 1), NIVELES_MEMORIA) - 1;
  const cantidad = PAREJAS_POR_NIVEL[indice]!;
  let parejas: Pareja[];
  if (tema === "mezcla") {
    const temas = ["frutas", "animales", "letras", "numeros"] as const;
    parejas = temas.flatMap((t) => parejasDe(t, Math.ceil(cantidad / 4), azar));
    parejas = mezclar(parejas, azar).slice(0, cantidad);
  } else {
    parejas = parejasDe(tema, cantidad, azar);
  }
  const cartas = parejas.flatMap((p) => p.caras.map((cara) => ({ par: p.par, cara, frase: p.frase })));
  return mezclar(cartas, azar).map((c, id) => ({ id, ...c }));
}
