import type { Numero } from "../tipos";

const palabras = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"];

export const NUMEROS: Numero[] = palabras.map((palabra, valor) => ({ valor, palabra }));

/** Objetos que se usan para contar en pantalla. */
export const OBJETOS_PARA_CONTAR = ["🍎", "⭐", "🎈", "🐟", "🌼", "🚗", "🍓", "🦋"];
