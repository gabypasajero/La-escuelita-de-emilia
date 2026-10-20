import type { Letra } from "../tipos";

const VOCALES = new Set(["A", "E", "I", "O", "U"]);

const datos: Array<[string, string, string]> = [
  ["A", "Abeja", "🐝"],
  ["B", "Ballena", "🐋"],
  ["C", "Casa", "🏠"],
  ["D", "Dado", "🎲"],
  ["E", "Elefante", "🐘"],
  ["F", "Flor", "🌸"],
  ["G", "Gato", "🐱"],
  ["H", "Helado", "🍦"],
  ["I", "Iglú", "🛖"],
  ["J", "Jirafa", "🦒"],
  ["K", "Koala", "🐨"],
  ["L", "León", "🦁"],
  ["M", "Mono", "🐒"],
  ["N", "Nube", "☁️"],
  ["Ñ", "Ñandú", "🐦"],
  ["O", "Oso", "🐻"],
  ["P", "Pato", "🦆"],
  ["Q", "Queso", "🧀"],
  ["R", "Ratón", "🐭"],
  ["S", "Sol", "☀️"],
  ["T", "Tortuga", "🐢"],
  ["U", "Uva", "🍇"],
  ["V", "Vaca", "🐄"],
  ["W", "Wafle", "🧇"],
  ["X", "Xilófono", "🎶"],
  ["Y", "Yoyó", "🪀"],
  ["Z", "Zapato", "👟"],
];

export const LETRAS: Letra[] = datos.map(([letra, palabra, emoji]) => ({
  letra,
  palabra,
  emoji,
  esVocal: VOCALES.has(letra),
}));
