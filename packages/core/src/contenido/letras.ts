import type { Letra } from "../tipos";

const VOCALES = new Set(["A", "E", "I", "O", "U"]);

// [letra, palabra, dibujo, nombre de la letra, sonido inicial para la voz]
const datos: Array<[string, string, string, string, string]> = [
  ["A", "Abeja", "🐝", "a", "aaa"],
  ["B", "Ballena", "🐋", "be", "ba"],
  ["C", "Casa", "🏠", "ce", "ca"],
  ["D", "Dado", "🎲", "de", "da"],
  ["E", "Elefante", "🐘", "e", "eee"],
  ["F", "Flor", "🌸", "efe", "fff"],
  ["G", "Gato", "🐱", "ge", "ga"],
  ["H", "Helado", "🍦", "hache", ""],
  ["I", "Iglú", "🛖", "i", "iii"],
  ["J", "Jirafa", "🦒", "jota", "ji"],
  ["K", "Koala", "🐨", "ka", "ko"],
  ["L", "León", "🦁", "ele", "lll"],
  ["M", "Mono", "🐒", "eme", "mmm"],
  ["N", "Nube", "☁️", "ene", "nnn"],
  ["Ñ", "Ñandú", "🐦", "eñe", "ña"],
  ["O", "Oso", "🐻", "o", "ooo"],
  ["P", "Pato", "🦆", "pe", "pa"],
  ["Q", "Queso", "🧀", "cu", "que"],
  ["R", "Ratón", "🐭", "erre", "rrr"],
  ["S", "Sol", "☀️", "ese", "sss"],
  ["T", "Tortuga", "🐢", "te", "to"],
  ["U", "Uva", "🍇", "u", "uuu"],
  ["V", "Vaca", "🐄", "ve", "va"],
  ["W", "Wafle", "🧇", "doble ve", "gua"],
  ["X", "Xilófono", "🎶", "equis", "sss"],
  ["Y", "Yoyó", "🪀", "ye", "yo"],
  ["Z", "Zapato", "👟", "zeta", "sss"],
];

export const LETRAS: Letra[] = datos.map(([letra, palabra, emoji, nombre, sonido]) => ({
  letra,
  palabra,
  emoji,
  nombre,
  sonido,
  esVocal: VOCALES.has(letra),
}));

/**
 * Lo que dice Emilia al presentar una letra, pensado para quien todavía no
 * lee: nombre, sonido y el inicio de la palabra alargado.
 * Ej.: "Eme. Suena mmm. Mmm… mono."
 */
export function presentarLetra(l: Letra): string {
  const nombre = l.nombre[0]!.toUpperCase() + l.nombre.slice(1);
  if (!l.sonido) return `${nombre}. La hache no suena. ${l.palabra}.`;
  const sonido = l.sonido[0]!.toUpperCase() + l.sonido.slice(1);
  return `${nombre}. Suena ${l.sonido}. ${sonido}… ${l.palabra.toLowerCase()}.`;
}
