import type { Nivel } from "../tipos";

/** Cantidad de opciones en pantalla según el nivel: menos opciones = más fácil. */
export const OPCIONES_POR_NIVEL: Record<Nivel, number> = { 1: 2, 2: 3, 3: 4 };

/** Número máximo usado en actividades de conteo por nivel. */
export const MAXIMO_CONTEO: Record<Nivel, number> = { 1: 3, 2: 5, 3: 10 };

export interface EstadoDificultad {
  nivel: Nivel;
  aciertosSeguidos: number;
  erroresSeguidos: number;
}

export const ESTADO_INICIAL: EstadoDificultad = { nivel: 1, aciertosSeguidos: 0, erroresSeguidos: 0 };

const ACIERTOS_PARA_SUBIR = 3;
const ERRORES_PARA_BAJAR = 2;

/**
 * Dificultad adaptativa: sube tras 3 aciertos seguidos y baja tras 2 errores
 * seguidos. Nunca castiga: un error solo hace el juego más fácil.
 */
export function registrarRespuesta(estado: EstadoDificultad, acierto: boolean): EstadoDificultad {
  if (acierto) {
    const aciertosSeguidos = estado.aciertosSeguidos + 1;
    if (aciertosSeguidos >= ACIERTOS_PARA_SUBIR && estado.nivel < 3) {
      return { nivel: (estado.nivel + 1) as Nivel, aciertosSeguidos: 0, erroresSeguidos: 0 };
    }
    return { ...estado, aciertosSeguidos, erroresSeguidos: 0 };
  }
  const erroresSeguidos = estado.erroresSeguidos + 1;
  if (erroresSeguidos >= ERRORES_PARA_BAJAR && estado.nivel > 1) {
    return { nivel: (estado.nivel - 1) as Nivel, aciertosSeguidos: 0, erroresSeguidos: 0 };
  }
  return { ...estado, erroresSeguidos, aciertosSeguidos: 0 };
}

/** Estrellas (1–3) al terminar una actividad según el porcentaje de aciertos. */
export function calcularEstrellas(aciertos: number, total: number): 1 | 2 | 3 {
  if (total === 0) return 1;
  const ratio = aciertos / total;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}
