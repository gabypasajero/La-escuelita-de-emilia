/**
 * Rutinas de la vida diaria en "modo acompañante": la app guía con la voz de
 * Emilia mientras el niño lo hace de verdad (ver docs/VIDA_DIARIA.md).
 */
export interface PasoRutina {
  emoji: string;
  frase: string;
  segundos: number;
  /** Pasos de frotado o cepillado, los que cuentan para el tiempo recomendado. */
  principal: boolean;
}

export interface Rutina {
  id: "manos" | "dientes";
  titulo: string;
  pasos: PasoRutina[];
  cierre: string;
}

export const RUTINA_MANOS: Rutina = {
  id: "manos",
  titulo: "Manos limpias",
  pasos: [
    { emoji: "💧", frase: "Mojamos las manos con agua.", segundos: 3, principal: false },
    { emoji: "🧼", frase: "Un poquito de jabón.", segundos: 3, principal: false },
    { emoji: "👐", frase: "Frotamos las palmas.", segundos: 5, principal: true },
    { emoji: "🤚", frase: "Ahora arriba de las manos.", segundos: 5, principal: true },
    { emoji: "🖐️", frase: "Entre los dedos.", segundos: 5, principal: true },
    { emoji: "💅", frase: "Las uñas y los pulgares.", segundos: 5, principal: true },
    { emoji: "🚿", frase: "Enjuagamos con agua.", segundos: 3, principal: false },
    { emoji: "🧻", frase: "Y secamos muy bien.", segundos: 3, principal: false },
  ],
  cierre: "¡Chao, bichitos! ¡Manos limpias!",
};

export const RUTINA_DIENTES: Rutina = {
  id: "dientes",
  titulo: "Dientes brillantes",
  pasos: [
    { emoji: "⬆️", frase: "Cepillamos los dientes de arriba.", segundos: 24, principal: true },
    { emoji: "⬇️", frase: "Ahora los de abajo.", segundos: 24, principal: true },
    { emoji: "😁", frase: "Los de adelante, con una sonrisa.", segundos: 24, principal: true },
    { emoji: "🦷", frase: "Las muelas de atrás.", segundos: 24, principal: true },
    { emoji: "👅", frase: "Y la lengua, suavecito.", segundos: 24, principal: true },
  ],
  cierre: "¡Dientes brillantes! ¡Sonríe!",
};

export const duracionPrincipal = (r: Rutina) => r.pasos.filter((p) => p.principal).reduce((a, p) => a + p.segundos, 0);
export const duracionTotal = (r: Rutina) => r.pasos.reduce((a, p) => a + p.segundos, 0);

/** Qué paso corresponde a los segundos transcurridos (null cuando terminó). */
export function pasoEn(r: Rutina, segundos: number): number | null {
  let acumulado = 0;
  for (let i = 0; i < r.pasos.length; i++) {
    acumulado += r.pasos[i]!.segundos;
    if (segundos < acumulado) return i;
  }
  return null;
}
