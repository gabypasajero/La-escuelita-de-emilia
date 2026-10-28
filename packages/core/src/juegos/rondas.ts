import { ANIMALES } from "../contenido/animales";
import { LETRAS } from "../contenido/letras";
import { OBJETOS_PARA_CONTAR } from "../contenido/numeros";
import type { Aleatorio, Animal, Letra, Nivel, Ronda } from "../tipos";
import { elegir, opcionesCon } from "./azar";
import { MAXIMO_CONTEO, OPCIONES_POR_NIVEL } from "./dificultad";

/** "¿Con qué letra empieza Gato?" */
export function rondaLetraInicial(nivel: Nivel, azar: Aleatorio = Math.random): Ronda<Letra> & { palabra: Letra } {
  const correcta = elegir(LETRAS, azar);
  return {
    enunciado: `¿Con qué letra empieza ${correcta.palabra}?`,
    palabra: correcta,
    opciones: opcionesCon(correcta, LETRAS, OPCIONES_POR_NIVEL[nivel], azar),
    correcta,
  };
}

/** "¿Cuántas manzanas hay?" — devuelve los objetos a dibujar y las opciones numéricas. */
export function rondaContar(
  nivel: Nivel,
  azar: Aleatorio = Math.random,
): Ronda<number> & { objeto: string; cantidad: number } {
  const maximo = MAXIMO_CONTEO[nivel];
  const cantidad = 1 + Math.floor(azar() * maximo);
  const objeto = elegir(OBJETOS_PARA_CONTAR, azar);
  const universo = Array.from({ length: Math.max(maximo, OPCIONES_POR_NIVEL[nivel]) }, (_, i) => i + 1);
  return {
    enunciado: "¿Cuántos hay?",
    objeto,
    cantidad,
    opciones: opcionesCon(cantidad, universo, OPCIONES_POR_NIVEL[nivel], azar).sort((a, b) => a - b),
    correcta: cantidad,
  };
}

/**
 * Conciencia fonológica sin leer: "¿Cuál empieza con mmm?" y el niño elige
 * entre dibujos. La H no participa porque no suena.
 */
export function rondaSonidoInicial(nivel: Nivel, azar: Aleatorio = Math.random): Ronda<Letra> {
  const conSonido = LETRAS.filter((l) => l.sonido);
  const correcta = elegir(conSonido, azar);
  // Distractores con un sonido inicial distinto: C, K y Q suenan /k/; B y V, /b/; S, X y Z, /s/.
  const distintos = conSonido.filter((l) => l === correcta || fonema(l) !== fonema(correcta));
  return {
    enunciado: `¿Cuál empieza con ${correcta.sonido}?`,
    opciones: opcionesCon(correcta, distintos, OPCIONES_POR_NIVEL[nivel], azar),
    correcta,
  };
}

const MISMO_SONIDO: Record<string, string> = { C: "k", K: "k", Q: "k", B: "b", V: "b", S: "s", X: "s", Z: "s" };
export const fonema = (l: Letra) => MISMO_SONIDO[l.letra] ?? l.letra;

/** "¿Quién hace ¡Muuu!?" */
export function rondaSonidoAnimal(nivel: Nivel, azar: Aleatorio = Math.random): Ronda<Animal> {
  const correcta = elegir(ANIMALES, azar);
  return {
    enunciado: `¿Quién hace ${correcta.sonido}?`,
    opciones: opcionesCon(correcta, ANIMALES, OPCIONES_POR_NIVEL[nivel], azar),
    correcta,
  };
}

/** "¿Cuánto es 2 + 1?" con objetos: nivel 1 suma hasta 3, nivel 2 hasta 5, nivel 3 hasta 10. */
export function rondaSuma(nivel: Nivel, azar: Aleatorio = Math.random): Ronda<number> & { a: number; b: number; objeto: string } {
  const maximo = MAXIMO_CONTEO[nivel];
  const total = 2 + Math.floor(azar() * (maximo - 1));
  const a = 1 + Math.floor(azar() * (total - 1));
  const b = total - a;
  const universo = Array.from({ length: Math.max(maximo, OPCIONES_POR_NIVEL[nivel] + 1) }, (_, i) => i + 1);
  return {
    enunciado: `¿Cuánto es ${a} más ${b}?`,
    a,
    b,
    objeto: elegir(OBJETOS_PARA_CONTAR, azar),
    opciones: opcionesCon(total, universo, OPCIONES_POR_NIVEL[nivel], azar).sort((x, y) => x - y),
    correcta: total,
  };
}

/** "¿Qué animal empieza con mmm?": se muestra la letra y se elige el animal. */
export function rondaAnimalPorLetra(nivel: Nivel, azar: Aleatorio = Math.random): Ronda<Animal> & { letra: Letra } {
  const inicial = (a: Animal) => a.nombre[0]!.toUpperCase();
  const conLetra = ANIMALES.filter((a) => LETRAS.some((l) => l.letra === inicial(a) && l.sonido));
  const correcta = elegir(conLetra, azar);
  const letra = LETRAS.find((l) => l.letra === inicial(correcta))!;
  const distintos = ANIMALES.filter((a) => a === correcta || fonemaDeLetra(inicial(a)) !== fonema(letra));
  return {
    enunciado: `¿Qué animal empieza con ${letra.sonido}? Es la ${letra.nombre}.`,
    letra,
    opciones: opcionesCon(correcta, distintos, OPCIONES_POR_NIVEL[nivel], azar),
    correcta,
  };
}
const fonemaDeLetra = (letra: string) => MISMO_SONIDO[letra] ?? letra;
