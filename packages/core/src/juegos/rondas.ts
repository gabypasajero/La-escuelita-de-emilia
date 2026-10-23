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

/** "¿Quién hace ¡Muuu!?" */
export function rondaSonidoAnimal(nivel: Nivel, azar: Aleatorio = Math.random): Ronda<Animal> {
  const correcta = elegir(ANIMALES, azar);
  return {
    enunciado: `¿Quién hace ${correcta.sonido}?`,
    opciones: opcionesCon(correcta, ANIMALES, OPCIONES_POR_NIVEL[nivel], azar),
    correcta,
  };
}
