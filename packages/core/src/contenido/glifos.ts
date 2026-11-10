/**
 * Trazos para aprender a escribir con el dedo (letras y números).
 * Cada carácter es una lista de trazos en el orden en que se escriben; cada
 * trazo es una línea de puntos en una caja de 100 × 140 (y crece hacia abajo).
 * Las minúsculas ocupan la mitad de abajo (y de 60 a 130).
 */
export type Punto = [number, number];
export type Trazo = Punto[];

/** Arco de elipse: ángulos en grados, 0 = derecha, 90 = abajo, 270 = arriba. */
function arco(cx: number, cy: number, rx: number, ry: number, desde: number, hasta: number, pasos = 16): Trazo {
  return Array.from({ length: pasos + 1 }, (_, i) => {
    const a = ((desde + ((hasta - desde) * i) / pasos) * Math.PI) / 180;
    return [Math.round(cx + rx * Math.cos(a)), Math.round(cy + ry * Math.sin(a))] as Punto;
  });
}

const O = arco(50, 70, 38, 58, 270, -90, 24);

export const GLIFOS: Record<string, Trazo[]> = {
  A: [[[50, 10], [15, 130]], [[50, 10], [85, 130]], [[30, 85], [70, 85]]],
  B: [[[20, 10], [20, 130]], [[20, 10], [58, 10], [76, 24], [76, 50], [58, 66], [20, 66]], [[20, 66], [62, 66], [84, 84], [84, 112], [62, 130], [20, 130]]],
  C: [arco(55, 70, 40, 58, 315, 45, 20)],
  D: [[[20, 10], [20, 130]], [[20, 10], [50, 10], [80, 40], [80, 100], [50, 130], [20, 130]]],
  E: [[[80, 10], [20, 10], [20, 130], [80, 130]], [[20, 70], [70, 70]]],
  F: [[[80, 10], [20, 10], [20, 130]], [[20, 70], [70, 70]]],
  G: [[...arco(55, 70, 40, 58, 315, 45, 20), [83, 78], [60, 78]]],
  H: [[[20, 10], [20, 130]], [[80, 10], [80, 130]], [[20, 70], [80, 70]]],
  I: [[[50, 10], [50, 130]]],
  J: [[[70, 10], ...arco(45, 100, 25, 30, 0, 180, 12)]],
  K: [[[20, 10], [20, 130]], [[80, 10], [20, 78]], [[42, 60], [82, 130]]],
  L: [[[20, 10], [20, 130], [80, 130]]],
  M: [[[15, 130], [15, 10], [50, 80], [85, 10], [85, 130]]],
  N: [[[20, 130], [20, 10], [80, 130], [80, 10]]],
  Ñ: [[[20, 130], [20, 22], [80, 130], [80, 22]], [[26, 2], [38, -8], [62, 6], [74, -4]]],
  O: [O],
  P: [[[20, 130], [20, 10]], [[20, 10], [60, 10], [80, 28], [80, 52], [60, 70], [20, 70]]],
  Q: [O, [[60, 100], [88, 136]]],
  R: [[[20, 130], [20, 10]], [[20, 10], [60, 10], [80, 28], [80, 52], [60, 70], [20, 70]], [[45, 70], [82, 130]]],
  S: [[[78, 25], [60, 10], [38, 10], [20, 28], [25, 52], [50, 68], [75, 85], [80, 110], [62, 130], [38, 130], [20, 115]]],
  T: [[[15, 10], [85, 10]], [[50, 10], [50, 130]]],
  U: [[[20, 10], ...arco(50, 95, 30, 35, 180, 0, 14), [80, 10]]],
  V: [[[15, 10], [50, 130], [85, 10]]],
  W: [[[10, 10], [30, 130], [50, 50], [70, 130], [90, 10]]],
  X: [[[15, 10], [85, 130]], [[85, 10], [15, 130]]],
  Y: [[[15, 10], [50, 70]], [[85, 10], [50, 70], [50, 130]]],
  Z: [[[15, 10], [85, 10], [15, 130], [85, 130]]],
  // Vocales minúsculas
  a: [arco(45, 98, 27, 32, 330, -30, 20), [[73, 66], [73, 130]]],
  e: [[[20, 97], [78, 97], ...arco(49, 97, 29, 33, 0, -315, 18)]],
  i: [[[50, 66], [50, 130]], [[50, 38], [50, 46]]],
  o: [arco(50, 98, 28, 32, 270, -90, 20)],
  u: [[[22, 66], ...arco(47, 104, 25, 26, 180, 0, 10), [72, 66]], [[72, 66], [72, 130]]],
  // Consonantes minúsculas (los palitos altos suben hasta arriba; las colitas bajan del renglón)
  b: [[[26, 10], [26, 130]], arco(53, 98, 27, 32, 180, 540, 20)],
  c: [arco(52, 98, 28, 32, 315, 45, 16)],
  d: [arco(47, 98, 27, 32, 0, 360, 20), [[74, 10], [74, 130]]],
  f: [[[72, 18], [60, 10], [48, 14], [42, 28], [42, 130]], [[24, 66], [64, 66]]],
  g: [arco(47, 98, 27, 32, 0, 360, 20), [[74, 66], [74, 125], [64, 138], [46, 140], [30, 134]]],
  h: [[[26, 10], [26, 130]], [[26, 90], ...arco(50, 92, 24, 26, 180, 360, 10), [74, 130]]],
  j: [[[58, 66], [58, 125], [50, 137], [36, 140], [26, 134]], [[58, 38], [58, 46]]],
  k: [[[28, 10], [28, 130]], [[70, 66], [28, 104]], [[42, 92], [74, 130]]],
  l: [[[50, 10], [50, 130]]],
  m: [[[14, 66], [14, 130]], [[14, 86], ...arco(32, 86, 18, 20, 180, 360, 8), [50, 130]], [[50, 86], ...arco(68, 86, 18, 20, 180, 360, 8), [86, 130]]],
  n: [[[26, 66], [26, 130]], [[26, 90], ...arco(50, 92, 24, 26, 180, 360, 10), [74, 130]]],
  ñ: [[[26, 66], [26, 130]], [[26, 90], ...arco(50, 92, 24, 26, 180, 360, 10), [74, 130]], [[30, 46], [42, 38], [58, 50], [70, 42]]],
  p: [[[26, 66], [26, 140]], arco(53, 98, 27, 32, 180, 540, 20)],
  q: [arco(47, 98, 27, 32, 0, 360, 20), [[74, 66], [74, 140]]],
  r: [[[30, 66], [30, 130]], [[30, 90], [42, 72], [58, 66], [72, 72]]],
  s: [[[70, 76], [58, 66], [40, 66], [30, 76], [34, 90], [50, 98], [66, 106], [70, 120], [60, 130], [40, 130], [28, 120]]],
  t: [[[46, 24], [46, 116], [56, 130], [70, 128]], [[26, 66], [68, 66]]],
  v: [[[22, 66], [50, 130], [78, 66]]],
  w: [[[12, 66], [30, 130], [50, 80], [70, 130], [88, 66]]],
  x: [[[24, 66], [76, 130]], [[76, 66], [24, 130]]],
  y: [[[24, 66], [50, 118]], [[76, 66], [40, 140]]],
  z: [[[24, 66], [76, 66], [24, 130], [76, 130]]],
  // La doble ele
  LL: [[[10, 10], [10, 130], [42, 130]], [[56, 10], [56, 130], [90, 130]]],
  ll: [[[38, 10], [38, 130]], [[62, 10], [62, 130]]],
  // Números
  "0": [O],
  "1": [[[30, 38], [56, 10], [56, 130]]],
  "2": [[...arco(50, 42, 28, 30, 200, 380, 12), [20, 130], [82, 130]]],
  "3": [[...arco(48, 40, 28, 28, 200, 450, 14), ...arco(48, 98, 32, 32, 270, 520, 14)]],
  "4": [[[60, 10], [15, 95], [85, 95]], [[62, 40], [62, 130]]],
  "5": [[[78, 10], [28, 10], [24, 62], ...arco(48, 96, 32, 34, 250, 520, 14)]],
  "6": [[[70, 12], [45, 30], [25, 68], ...arco(50, 100, 27, 30, 180, 540, 18)]],
  "7": [[[18, 10], [82, 10], [40, 130]]],
  "8": [arco(50, 40, 24, 30, 270, -90, 18), arco(50, 100, 30, 30, 270, -90, 18)],
  "9": [arco(50, 42, 28, 30, 0, -360, 18), [[78, 42], [74, 130]]],
};

/** Puntos de control cada ~11 unidades a lo largo de un trazo (para revisar el dibujo del niño). */
export function puntosDeControl(trazo: Trazo, cada = 11): Punto[] {
  const puntos: Punto[] = [trazo[0]!];
  for (let i = 1; i < trazo.length; i++) {
    const [x0, y0] = trazo[i - 1]!;
    const [x1, y1] = trazo[i]!;
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / cada));
    for (let k = 1; k <= n; k++) puntos.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  return puntos;
}

/**
 * Avanza el progreso de un trazo según la posición del dedo: se acepta llegar
 * al siguiente punto o saltarse uno (para no frustrar), dentro de un radio generoso.
 */
export function avanzarTrazo(control: Punto[], logrados: number, dedo: Punto, radio = 16): number {
  for (const salto of [1, 0]) {
    const p = control[logrados + salto];
    if (p && Math.hypot(p[0] - dedo[0], p[1] - dedo[1]) <= radio) return logrados + salto + 1;
  }
  return logrados;
}

export const VOCALES_TRAZO = ["A", "a", "E", "e", "I", "i", "O", "o", "U", "u"];
export const NUMEROS_TRAZO = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** El abecedario completo para escribir: cada letra en mayúscula y minúscula, con la Ñ y la doble ele. */
export const ABECEDARIO_TRAZO = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("").flatMap((l) => (l === "L" ? ["L", "l", "LL", "ll"] : [l, l.toLowerCase()]));

/**
 * Escritura libre: marca los puntitos que el dedo va tocando, sin importar
 * por dónde se empieza ni hacia dónde se va. Devuelve cuántos puntos nuevos marcó.
 */
export function marcarPuntos(puntos: Punto[], hechos: boolean[], dedo: Punto, radio = 13): number {
  let nuevos = 0;
  puntos.forEach((p, i) => {
    if (!hechos[i] && Math.hypot(p[0] - dedo[0], p[1] - dedo[1]) <= radio) {
      hechos[i] = true;
      nuevos += 1;
    }
  });
  return nuevos;
}
