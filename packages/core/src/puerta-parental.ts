import type { Aleatorio } from "./tipos";

export interface PuertaParental {
  /** Texto para el adulto, p. ej. "¿Cuánto es 7 × 3?". */
  pregunta: string;
  verificar: (respuesta: string) => boolean;
}

/**
 * Puerta parental exigida por Apple Kids / Google Families antes de ajustes,
 * compras o enlaces externos: una multiplicación que un niño de 3–6 años no resuelve.
 */
export function crearPuertaParental(azar: Aleatorio = Math.random): PuertaParental {
  const a = 3 + Math.floor(azar() * 7);
  const b = 3 + Math.floor(azar() * 7);
  return {
    pregunta: `¿Cuánto es ${a} × ${b}?`,
    verificar: (respuesta) => Number(respuesta.trim()) === a * b,
  };
}
