import type { Href } from "expo-router";
import type { LugarId } from "../components/Lugares";
import type { AnimalId } from "../components/AnimalesVivos";
import { DESBLOQUEOS } from "./juego";

/** Lugares del barrio (compartidos por el barrio 2D y la prueba 3D). Unidades de mundo: 1800 × 1250. */
export interface Lugar {
  id: LugarId;
  nombre: string;
  frase: string;
  ruta?: Href;
  x: number;
  /** Línea del suelo donde se apoya el edificio (define qué se dibuja delante). */
  y: number;
  /** Estrellas necesarias para entrar (lugar desbloqueable). */
  estrellas?: number;
}

export const LUGARES: Lugar[] = [
  { id: "escuelita", nombre: "La Escuelita", frase: "¡A la escuelita! Letras y números.", ruta: "/escuelita", x: 430, y: 360 },
  { id: "taller", nombre: "Taller de arte", frase: "¡Qué entretenido! ¿Pintamos?", ruta: "/taller", x: 780, y: 360 },
  { id: "tiendita", nombre: "Almacén", frase: "Doña Rosa necesita ayuda en el almacén.", ruta: "/juegos/tiendita", x: 1130, y: 360 },
  { id: "disfraces", nombre: "Disfraces", frase: "¡La tienda de disfraces! ¿Qué te compras?", ruta: "/disfraces", x: 1480, y: 360 },
  { id: "casa", nombre: "Casa de Emilia", frase: "¡Esta es mi casa! Ven, te muestro el patio.", ruta: "/casa", x: 300, y: 770 },
  { id: "plaza", nombre: "Parque", frase: "¡Al parque de juegos! Columpio, resbalín y balancín.", ruta: "/plaza", x: 700, y: 770 },
  { id: "huerto", nombre: "Huerto", frase: "Don Pedro nos espera en el huerto.", ruta: "/huerto", x: 1100, y: 770 },
  { id: "granja", nombre: "Granja", frase: "¡Vamos a ver a los animales de la granja!", ruta: "/granja", x: 1480, y: 770 },
  { id: "veterinaria", nombre: "Veterinaria", frase: "¡La veterinaria del Dr. Lucas! Vamos a cuidar animales.", ruta: "/veterinaria", x: 560, y: 1150, estrellas: DESBLOQUEOS.veterinaria },
  { id: "paradero", nombre: "Paradero", frase: "¡Al paradero! Llega el bus con un amigo de otro país.", ruta: "/paradero", x: 1300, y: 1150 },
];

export const ARBOLES: Array<[number, number]> = [
  [90, 230], [220, 190], [1680, 210], [1760, 560], [80, 1080], [330, 1170], [1720, 1120],
  [610, 560], [1290, 560], [990, 1010], [180, 640], [1600, 960], [760, 1060],
];

export const VECINOS: Array<{ emoji: string; animal: AnimalId; paseo: number; x: number; y: number; frase: string }> = [
  { emoji: "🐄", animal: "vaca", paseo: 40, x: 1620, y: 850, frase: "¡Muuu!" },
  { emoji: "🐑", animal: "oveja", paseo: 35, x: 1350, y: 870, frase: "¡Beee!" },
  { emoji: "🐔", animal: "gallina", paseo: 45, x: 1560, y: 900, frase: "¡Kikirikí!" },
  { emoji: "🐱", animal: "gato", paseo: 60, x: 470, y: 900, frase: "¡Miau! Es el gato del barrio." },
  { emoji: "🦆", animal: "pato", paseo: 45, x: 230, y: 540, frase: "¡Cuac, cuac! Los patos nadan en la laguna." },
  { emoji: "🦋", animal: "mariposa", paseo: 0, x: 950, y: 640, frase: "¡Una mariposa!" },
];

