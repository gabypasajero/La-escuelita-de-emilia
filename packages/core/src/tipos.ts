export type Modulo = "pintar" | "letras" | "numeros" | "animales" | "juegos";

export type RangoEdad = "3-4" | "4-5" | "5-6";

/** Nivel de dificultad de una actividad: 1 = fácil, 3 = difícil. */
export type Nivel = 1 | 2 | 3;

export interface Letra {
  letra: string;
  /** Palabra de ejemplo que empieza con la letra. */
  palabra: string;
  emoji: string;
  esVocal: boolean;
}

export interface Numero {
  valor: number;
  palabra: string;
}

export type Habitat = "granja" | "selva" | "mar" | "bosque" | "montaña" | "sabana" | "humedal";

export interface Animal {
  id: string;
  nombre: string;
  emoji: string;
  habitat: Habitat;
  /** Onomatopeya en español, se usa mientras no exista el audio real. */
  sonido: string;
  /** Animal de fauna latinoamericana (diferenciador del producto). */
  regional: boolean;
}

/** Una pregunta de opción múltiple lista para mostrar en pantalla. */
export interface Ronda<T> {
  /** Lo que la voz de Emilia dice en voz alta. */
  enunciado: string;
  opciones: T[];
  correcta: T;
}

export interface Intento {
  perfilId: string;
  modulo: Modulo;
  actividad: string;
  item: string;
  acierto: boolean;
  duracionMs: number;
  fecha: string;
}

/** Generador de números aleatorios inyectable para poder testear. */
export type Aleatorio = () => number;
