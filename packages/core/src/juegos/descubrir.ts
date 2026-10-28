import type { Aleatorio, Nivel, Ronda } from "../tipos";
import { elegir, mezclar, opcionesCon } from "./azar";
import { MAXIMO_CONTEO, OPCIONES_POR_NIVEL } from "./dificultad";

/** Colores, formas, cantidades, patrones, verduras y veterinaria: juegos de la Escuelita y del barrio. */

export interface Color { id: string; nombre: string; hex: string }
export const COLORES_BASICOS: Color[] = [
  { id: "rojo", nombre: "rojo", hex: "#E53935" },
  { id: "azul", nombre: "azul", hex: "#1E88E5" },
  { id: "amarillo", nombre: "amarillo", hex: "#FDD835" },
  { id: "verde", nombre: "verde", hex: "#43A047" },
  { id: "naranjo", nombre: "naranjo", hex: "#FB8C00" },
  { id: "morado", nombre: "morado", hex: "#8E24AA" },
  { id: "rosado", nombre: "rosado", hex: "#F06292" },
  { id: "cafe", nombre: "café", hex: "#6D4C41" },
];

export function rondaColor(nivel: Nivel, azar: Aleatorio = Math.random): Ronda<Color> {
  const correcta = elegir(COLORES_BASICOS, azar);
  return { enunciado: `¿Cuál es el ${correcta.nombre}?`, opciones: opcionesCon(correcta, COLORES_BASICOS, OPCIONES_POR_NIVEL[nivel] + 1, azar), correcta };
}

export interface Forma { id: "circulo" | "cuadrado" | "triangulo" | "estrella" | "corazon" | "rectangulo"; nombre: string; articulo: "el" | "la" }
export const FORMAS: Forma[] = [
  { id: "circulo", nombre: "círculo", articulo: "el" },
  { id: "cuadrado", nombre: "cuadrado", articulo: "el" },
  { id: "triangulo", nombre: "triángulo", articulo: "el" },
  { id: "estrella", nombre: "estrella", articulo: "la" },
  { id: "corazon", nombre: "corazón", articulo: "el" },
  { id: "rectangulo", nombre: "rectángulo", articulo: "el" },
];

export function rondaForma(nivel: Nivel, azar: Aleatorio = Math.random): Ronda<Forma> {
  const correcta = elegir(FORMAS, azar);
  return { enunciado: `¿Dónde está ${correcta.articulo} ${correcta.nombre}?`, opciones: opcionesCon(correcta, FORMAS, OPCIONES_POR_NIVEL[nivel] + 1, azar), correcta };
}

/** "¿Dónde hay más?": dos grupos de objetos con cantidades distintas. */
export function rondaMasMenos(nivel: Nivel, azar: Aleatorio = Math.random): Ronda<number> & { objeto: string; pregunta: "mas" | "menos" } {
  const max = MAXIMO_CONTEO[nivel] + 1;
  const a = 1 + Math.floor(azar() * max);
  let b = 1 + Math.floor(azar() * max);
  if (b === a) b = a === max ? a - 1 : a + 1;
  const pregunta = nivel === 1 || azar() < 0.6 ? "mas" : "menos";
  return {
    enunciado: pregunta === "mas" ? "¿Dónde hay más?" : "¿Dónde hay menos?",
    objeto: elegir(["🍎", "⭐", "🐟", "🎈", "🌼"], azar),
    pregunta,
    opciones: [a, b],
    correcta: pregunta === "mas" ? Math.max(a, b) : Math.min(a, b),
  };
}

/** "¿Qué sigue?": patrones AB (nivel 1), ABC (nivel 2) y AAB (nivel 3). */
export function rondaPatron(nivel: Nivel, azar: Aleatorio = Math.random): Ronda<string> & { secuencia: string[] } {
  const fichas = mezclar(["🔴", "🔵", "🟡", "🟢", "🟣", "🟠"], azar);
  const base = nivel === 1 ? [fichas[0]!, fichas[1]!] : nivel === 2 ? [fichas[0]!, fichas[1]!, fichas[2]!] : [fichas[0]!, fichas[0]!, fichas[1]!];
  const largo = base.length * 2 + 1;
  const completa = Array.from({ length: largo + 1 }, (_, i) => base[i % base.length]!);
  const correcta = completa[largo]!;
  const opciones = opcionesCon(correcta, fichas, OPCIONES_POR_NIVEL[nivel], azar);
  return { enunciado: "¿Qué sigue?", secuencia: completa.slice(0, largo), opciones, correcta };
}

/** Verduras que se pueden cultivar en casa, con la parte que comemos. */
export interface Verdura { id: string; nombre: string; emoji: string; articulo: "el" | "la"; parte: string; dato: string; dias: number }
export const VERDURAS: Verdura[] = [
  { id: "zanahoria", nombre: "zanahoria", emoji: "🥕", articulo: "la", parte: "la raíz", dato: "La zanahoria crece escondida bajo la tierra: ¡comemos su raíz!", dias: 2 },
  { id: "lechuga", nombre: "lechuga", emoji: "🥬", articulo: "la", parte: "las hojas", dato: "De la lechuga comemos las hojas. ¡Crece rapidito!", dias: 1 },
  { id: "tomate", nombre: "tomate", emoji: "🍅", articulo: "el", parte: "el fruto", dato: "El tomate cuelga de la planta y se pone rojo cuando está listo.", dias: 2 },
  { id: "papa", nombre: "papa", emoji: "🥔", articulo: "la", parte: "el tubérculo", dato: "Las papas crecen bajo la tierra, ¡como un tesoro escondido!", dias: 3 },
  { id: "choclo", nombre: "choclo", emoji: "🌽", articulo: "el", parte: "los granos", dato: "El choclo crece alto, ¡más alto que un niño! Comemos sus granitos.", dias: 3 },
  { id: "zapallo", nombre: "zapallo", emoji: "🎃", articulo: "el", parte: "el fruto", dato: "El zapallo crece en el suelo y puede ponerse enorme.", dias: 3 },
  { id: "pimenton", nombre: "pimentón", emoji: "🫑", articulo: "el", parte: "el fruto", dato: "El pimentón puede ser verde, rojo o amarillo.", dias: 2 },
  { id: "cebolla", nombre: "cebolla", emoji: "🧅", articulo: "la", parte: "el bulbo", dato: "La cebolla crece bajo la tierra. ¡A veces hace llorar al cortarla!", dias: 2 },
  { id: "porotos", nombre: "porotos", emoji: "🫘", articulo: "el", parte: "las semillas", dato: "Los porotos crecen dentro de unas vainas largas.", dias: 2 },
  { id: "brocoli", nombre: "brócoli", emoji: "🥦", articulo: "el", parte: "las flores", dato: "El brócoli parece un arbolito. ¡Comemos sus florcitas!", dias: 2 },
  { id: "pepino", nombre: "pepino", emoji: "🥒", articulo: "el", parte: "el fruto", dato: "El pepino crece en una planta que trepa.", dias: 2 },
  { id: "frutilla", nombre: "frutilla", emoji: "🍓", articulo: "la", parte: "el fruto", dato: "Las frutillas crecen cerca del suelo y son dulces.", dias: 2 },
];

export function rondaVerdura(nivel: Nivel, azar: Aleatorio = Math.random): Ronda<Verdura> {
  const correcta = elegir(VERDURAS, azar);
  const nombre = correcta.id === "porotos" ? "los porotos" : `${correcta.articulo} ${correcta.nombre}`;
  return { enunciado: `¿Dónde está${correcta.id === "porotos" ? "n" : ""} ${nombre}?`, opciones: opcionesCon(correcta, VERDURAS, OPCIONES_POR_NIVEL[nivel] + 1, azar), correcta };
}

/** Veterinaria del Dr. Lucas: cada paciente necesita un cuidado. */
export interface Cuidado { id: string; nombre: string; emoji: string }
export const CUIDADOS: Cuidado[] = [
  { id: "venda", nombre: "venda", emoji: "🩹" },
  { id: "bano", nombre: "baño", emoji: "🛁" },
  { id: "comida", nombre: "comida", emoji: "🥕" },
  { id: "agua", nombre: "agua", emoji: "💧" },
  { id: "estetoscopio", nombre: "estetoscopio", emoji: "🩺" },
  { id: "vacuna", nombre: "vacuna", emoji: "💉" },
  { id: "cama", nombre: "camita", emoji: "🛏️" },
];

export interface Paciente { emoji: string; problema: string; necesita: string; gracias: string }
export const PACIENTES: Paciente[] = [
  { emoji: "🐶", problema: "Este perrito tiene la patita lastimada.", necesita: "venda", gracias: "Limpiamos y ponemos la venda, con cuidado y con cariño." },
  { emoji: "🐱", problema: "Este gatito se ensució jugando en el barro.", necesita: "bano", gracias: "Agua tibia y jabón suave. ¡Quedó limpiecito!" },
  { emoji: "🐰", problema: "Este conejito tiene mucha hambre.", necesita: "comida", gracias: "¡Ñam! A los conejos les encantan las zanahorias." },
  { emoji: "🐦", problema: "Este pajarito tiene sed.", necesita: "agua", gracias: "Un poquito de agua fresca. ¡Pío, pío, gracias!" },
  { emoji: "🐄", problema: "Hoy revisamos el corazón de la vaca.", necesita: "estetoscopio", gracias: "¡Pum-pum, pum-pum! Su corazón está sanito." },
  { emoji: "🐷", problema: "Al cerdito le toca su vacuna.", necesita: "vacuna", gracias: "Pincha un poquito, pero lo protege. ¡Qué valiente!" },
  { emoji: "🐻", problema: "Este osito está muy cansado.", necesita: "cama", gracias: "Shhh… a dormir en su camita. Descansar ayuda a sanar." },
];

export function rondaVeterinaria(nivel: Nivel, azar: Aleatorio = Math.random): Ronda<Cuidado> & { paciente: Paciente } {
  const paciente = elegir(PACIENTES, azar);
  const correcta = CUIDADOS.find((c) => c.id === paciente.necesita)!;
  return { enunciado: `${paciente.problema} ¿Qué necesita?`, paciente, opciones: opcionesCon(correcta, CUIDADOS, OPCIONES_POR_NIVEL[nivel] + 1, azar), correcta };
}
