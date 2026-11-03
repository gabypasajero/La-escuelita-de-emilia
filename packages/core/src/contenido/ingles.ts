import type { Aleatorio, Nivel, Ronda } from "../tipos";
import { elegir, opcionesCon } from "../juegos/azar";
import { OPCIONES_POR_NIVEL } from "../juegos/dificultad";

/**
 * Inglés con Max, nivel 1 «Hello» (ver docs/IDIOMAS.md §4).
 * Inmersión: Max pide en inglés y el niño responde tocando un dibujo.
 * `es` solo se usa para la ayuda de Emilia (y para la zona de padres).
 */
export type TemaIngles = "saludos" | "colores" | "numeros" | "animales" | "cuerpo" | "acciones";

export interface PalabraIngles {
  id: string;
  tema: TemaIngles;
  /** La palabra o frase en inglés (lo que se escucha). */
  en: string;
  /** Su significado, para la ayuda de Emilia. */
  es: string;
  emoji: string;
  /** Color real, para el tema de colores. */
  hex?: string;
  /** Cantidad, para el tema de números. */
  valor?: number;
}

const p = (tema: TemaIngles, id: string, en: string, es: string, emoji: string, extra: Partial<PalabraIngles> = {}): PalabraIngles => ({ id, tema, en, es, emoji, ...extra });

export const PALABRAS_INGLES: PalabraIngles[] = [
  // Saludos y frases de cortesía
  p("saludos", "hello", "Hello!", "¡Hola!", "👋"),
  p("saludos", "good-morning", "Good morning!", "¡Buenos días!", "🌅"),
  p("saludos", "good-night", "Good night!", "¡Buenas noches!", "🌙"),
  p("saludos", "thank-you", "Thank you!", "¡Gracias!", "🎁"),
  p("saludos", "i-love-you", "I love you!", "¡Te quiero!", "❤️"),
  p("saludos", "happy-birthday", "Happy birthday!", "¡Feliz cumpleaños!", "🎂"),
  // Colores
  p("colores", "red", "red", "rojo", "🔴", { hex: "#E53935" }),
  p("colores", "blue", "blue", "azul", "🔵", { hex: "#1E88E5" }),
  p("colores", "yellow", "yellow", "amarillo", "🟡", { hex: "#FDD835" }),
  p("colores", "green", "green", "verde", "🟢", { hex: "#43A047" }),
  p("colores", "orange", "orange", "naranjo", "🟠", { hex: "#FB8C00" }),
  p("colores", "purple", "purple", "morado", "🟣", { hex: "#8E24AA" }),
  p("colores", "pink", "pink", "rosado", "🌸", { hex: "#F06292" }),
  p("colores", "black", "black", "negro", "⚫", { hex: "#212121" }),
  p("colores", "white", "white", "blanco", "⚪", { hex: "#FFFFFF" }),
  // Números 1 a 5
  p("numeros", "one", "one", "uno", "1️⃣", { valor: 1 }),
  p("numeros", "two", "two", "dos", "2️⃣", { valor: 2 }),
  p("numeros", "three", "three", "tres", "3️⃣", { valor: 3 }),
  p("numeros", "four", "four", "cuatro", "4️⃣", { valor: 4 }),
  p("numeros", "five", "five", "cinco", "5️⃣", { valor: 5 }),
  // Animales de la granja (con su sonido en inglés)
  p("animales", "cow", "cow", "la vaca", "🐮"),
  p("animales", "dog", "dog", "el perro", "🐶"),
  p("animales", "cat", "cat", "el gato", "🐱"),
  p("animales", "duck", "duck", "el pato", "🦆"),
  p("animales", "pig", "pig", "el chancho", "🐷"),
  p("animales", "horse", "horse", "el caballo", "🐴"),
  p("animales", "sheep", "sheep", "la oveja", "🐑"),
  p("animales", "chicken", "chicken", "la gallina", "🐔"),
  // Partes del cuerpo y de la cara
  p("cuerpo", "nose", "nose", "tu nariz", "👃"),
  p("cuerpo", "eyes", "eyes", "tus ojos", "👀"),
  p("cuerpo", "ears", "ears", "tus orejas", "👂"),
  p("cuerpo", "mouth", "mouth", "tu boca", "👄"),
  p("cuerpo", "hands", "hands", "tus manos", "🙌"),
  p("cuerpo", "feet", "feet", "tus pies", "🦶"),
  // Acciones (Max says…)
  p("acciones", "clap", "Clap your hands!", "aplaudir", "👏"),
  p("acciones", "jump", "Jump!", "saltar", "🦘"),
  p("acciones", "wave", "Wave goodbye!", "decir chao con la mano", "👋"),
  p("acciones", "dance", "Dance!", "bailar", "💃"),
  p("acciones", "sleep", "Sleep!", "dormir", "😴"),
  p("acciones", "run", "Run!", "correr", "🏃"),
  p("acciones", "eat", "Eat!", "comer", "🍽️"),
];

/** Sonido de cada animal en inglés (los animales "hablan" distinto en cada idioma). */
export const SONIDO_EN_INGLES: Record<string, string> = {
  cow: "Moo!", dog: "Woof woof!", cat: "Meow!", duck: "Quack quack!", pig: "Oink oink!", horse: "Neigh!", sheep: "Baa!", chicken: "Cluck cluck!",
};

export const palabrasDelTema = (tema: TemaIngles) => PALABRAS_INGLES.filter((x) => x.tema === tema);

export interface RondaIngles extends Ronda<PalabraIngles> {
  /** Lo que Emilia dice en español si el niño pide ayuda. */
  ayuda: string;
  /** Lo que dice Max al acertar (en inglés). */
  felicitacion: string;
}

const ELOGIOS = ["Great job!", "Yes!", "Very good!", "Awesome!", "Well done!"];

/**
 * Una ronda de "escucha y toca" en inglés. Lo que Max dice nunca trae la
 * traducción: el niño entiende por el dibujo (inmersión).
 */
export function rondaIngles(tema: TemaIngles, nivel: Nivel, azar: Aleatorio = Math.random): RondaIngles {
  const universo = palabrasDelTema(tema);
  const correcta = elegir(universo, azar);
  const opciones = opcionesCon(correcta, universo, OPCIONES_POR_NIVEL[nivel] + 1, azar);
  const bien = elegir(ELOGIOS, azar);
  switch (tema) {
    case "saludos":
      return { enunciado: correcta.en, opciones, correcta, ayuda: `Max dijo «${correcta.es}». ¿Qué dibujo es?`, felicitacion: `${bien} ${correcta.en}` };
    case "colores":
      return { enunciado: `Touch ${correcta.en}!`, opciones, correcta, ayuda: `Max quiere que toques el ${correcta.es}.`, felicitacion: `${bien} ${cap(correcta.en)}!` };
    case "numeros":
      return { enunciado: `Show me ${correcta.en}!`, opciones, correcta, ayuda: `Max quiere ${correcta.es}. ¡Cuenta las estrellas!`, felicitacion: `${bien} ${cap(correcta.en)}!` };
    case "animales":
      return { enunciado: `Where is the ${correcta.en}?`, opciones, correcta, ayuda: `Max busca ${correcta.es}.`, felicitacion: `${bien} The ${correcta.en}! ${SONIDO_EN_INGLES[correcta.id] ?? ""}`.trim() };
    case "cuerpo":
      return { enunciado: `Touch your ${correcta.en}!`, opciones, correcta, ayuda: `Max dice: toca ${correcta.es}.`, felicitacion: `${bien} Your ${correcta.en}!` };
    case "acciones":
      return { enunciado: `Max says: ${correcta.en}`, opciones, correcta, ayuda: `Max dice que hay que ${correcta.es}. ¡Hazlo tú también!`, felicitacion: `${bien} Let's ${correcta.en.replace(/!$/, "").toLowerCase()} together!` };
  }
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
