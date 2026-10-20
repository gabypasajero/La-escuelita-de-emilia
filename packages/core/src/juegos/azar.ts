import type { Aleatorio } from "../tipos";

export function mezclar<T>(lista: readonly T[], azar: Aleatorio = Math.random): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j]!, copia[i]!];
  }
  return copia;
}

export function elegir<T>(lista: readonly T[], azar: Aleatorio = Math.random): T {
  if (lista.length === 0) throw new Error("No se puede elegir de una lista vacía");
  return lista[Math.floor(azar() * lista.length)]!;
}

/** Devuelve `cantidad` elementos distintos de `correcta` mezclados con ella. */
export function opcionesCon<T>(
  correcta: T,
  universo: readonly T[],
  cantidad: number,
  azar: Aleatorio = Math.random,
): T[] {
  const distractores = mezclar(
    universo.filter((x) => x !== correcta),
    azar,
  ).slice(0, cantidad - 1);
  return mezclar([correcta, ...distractores], azar);
}
