import * as THREE from "three";
import type { Apariencia } from "../juego";
import { GRADOS, azar, caja, capsula, cilindro, cupula, esfera, fusionarEsqueleto, geo, girar, grupo, pieza, pivote, prisma, puntosEstrella, suave, suaveAngulo, toro, type V3 } from "./base";
import { BOCAS, OJOS, calcomania, oscurecer, texturaBoca, texturaOjos, type CuadroBoca, type CuadroOjos } from "./caras";

/**
 * Personajes 3D articulados, estilo muñeco tierno: cabeza grande, cuerpo
 * redondeado, brazos y piernas con codo y rodilla. Caminan moviendo brazos
 * y piernas, respiran, pestañean, mueven la boca al hablar, saludan,
 * celebran saltando y se sientan. Miran hacia +Z.
 *
 * "I" y "D" son la izquierda y la derecha DE LA PANTALLA cuando el personaje
 * mira a la cámara (D = +X): con la mano D saluda y lleva sus accesorios,
 * igual que en los dibujos 2D.
 */

export type EstiloPelo = "corto" | "colitas" | "largo" | "rizado" | "afro" | "melena" | "liso" | "cola" | "mono" | "rapado" | "canas" | "crespo";

export interface DefPersona {
  id: string;
  adulto?: boolean;
  escala?: number;
  piel: string;
  iris?: string;
  pestanas?: boolean;
  mejillas?: string;
  bigote?: string;
  pelo: { color: string; estilo: EstiloPelo; adorno?: string };
  /** `largo` = mangas largas (suéter, chaqueta, camisa, delantal blanco). */
  arriba: { tipo: "polera" | "vestido" | "largo"; color: string; cuello?: string; ribete?: string };
  abajo: { tipo: "short" | "pantalon" | "falda" | "nada"; color: string };
  zapatos: { color: string; suela?: string; calcetin?: string };
  /** Piezas propias del personaje (sombrero, delantal, lentes…), antes de fusionar. */
  extras?: (p: Partes, m: Medidas) => void;
}

export interface Medidas {
  R: number; yCadera: number; xCadera: number; muslo: number; pierna: number; rPierna: number;
  yHombro: number; xHombro: number; brazo: number; antebrazo: number; rBrazo: number;
  yCuello: number; yCabeza: number; fondo: number; mano: number; pie: number;
}
const NINO: Medidas = { R: 0.5, yCadera: 0.5, xCadera: 0.125, muslo: 0.21, pierna: 0.2, rPierna: 0.085, yHombro: 0.9, xHombro: 0.265, brazo: 0.2, antebrazo: 0.17, rBrazo: 0.07, yCuello: 0.98, yCabeza: 0.45, fondo: 0.2, mano: 0.085, pie: 0.16 };
const ADULTO: Medidas = { R: 0.43, yCadera: 0.94, xCadera: 0.15, muslo: 0.43, pierna: 0.41, rPierna: 0.112, yHombro: 1.66, xHombro: 0.33, brazo: 0.36, antebrazo: 0.32, rBrazo: 0.095, yCuello: 1.8, yCabeza: 0.4, fondo: 0.25, mano: 0.095, pie: 0.2 };

export interface Partes {
  raiz: THREE.Group; cuerpo: THREE.Group; torso: THREE.Group; cabeza: THREE.Group;
  /** Centro de la cabeza (el pelo, la cara y los gorros se ubican desde aquí). */
  cg: THREE.Group;
  brazoI: THREE.Group; brazoD: THREE.Group; codoI: THREE.Group; codoD: THREE.Group;
  piernaI: THREE.Group; piernaD: THREE.Group; rodillaI: THREE.Group; rodillaD: THREE.Group;
  coletas: THREE.Group[];
  /** Donde se enganchan los accesorios de la tienda. */
  ranuras: { cabeza: THREE.Group; cuello: THREE.Group; mano: THREE.Group };
  /** La forma del tronco, para pegarle encima delantales, pecheras y botones. */
  forma: Forma;
}

export interface Forma {
  centro: V3;
  radios: V3;
  falda?: { rArr: number; rAbj: number; h: number; y: number; ez: number };
  /** Punto sobre el tronco: `az` 0 = al frente, `el` = altura en grados desde su centro. */
  enTorso: (az: number, el: number, k?: number) => V3;
}

/** Trozo del tronco, apenas más grande (pechera de delantal u overol, franja de camisa). */
export function pechera(f: Forma, color: string, ancho: number, elArriba: number, elAbajo: number, giro = 0, k = 1.04): THREE.Mesh {
  const a = (90 - elArriba) * GRADOS, b = (90 - elAbajo) * GRADOS;
  const g = geo(`pech${ancho}|${a.toFixed(3)}|${b.toFixed(3)}|${giro}`, () => new THREE.SphereGeometry(1, 16, 10, Math.PI / 2 + giro - ancho, ancho * 2, a, b - a));
  const m = pieza(g, color, f.centro);
  m.scale.set(f.radios[0] * k, f.radios[1] * k, f.radios[2] * k);
  return m;
}

/** Paño delantero de la falda o el vestido (la parte de abajo del delantal). */
export function panelFalda(f: Forma, color: string, ancho: number, k = 1.04): THREE.Mesh | null {
  const fa = f.falda;
  if (!fa) return null;
  const g = geo(`panel${fa.rArr.toFixed(3)}|${fa.rAbj.toFixed(3)}|${fa.h.toFixed(3)}|${ancho}`, () => new THREE.CylinderGeometry(fa.rArr, fa.rAbj, fa.h * 0.94, 14, 1, true, -ancho, ancho * 2));
  const m = pieza(g, color, [0, fa.y, 0]);
  m.scale.set(k, 1, fa.ez * k);
  return m;
}

export interface Persona {
  tipo: "persona";
  raiz: THREE.Group;
  partes: Partes;
  def: DefPersona;
  medidas: Medidas;
  /** Alto total (para ubicar el letrero con su nombre). */
  alto: number;
  /** Rapidez a la que se desplaza (la pone el motor): anima la caminata. */
  velocidad: number;
  /** Hacia dónde quiere mirar (ángulo en Y; 0 = hacia la cámara). */
  rumbo: number;
  hablando: boolean;
  saludando: boolean;
  celebrando: boolean;
  sentado: boolean;
  sorprendido: boolean;
  feliz: boolean;
  saltar(): void;
  mirarA(x: number, z: number): void;
  actualizar(dt: number, t: number): void;
}

/** Punto sobre la cabeza: `az` 0 = al frente, 90 = hacia +X; `el` = altura en grados. */
export function enCabeza(R: number, az: number, el: number, k = 1): V3 {
  const a = az * GRADOS, e = el * GRADOS;
  return [R * k * Math.sin(a) * Math.cos(e), R * k * Math.sin(e), R * k * Math.cos(a) * Math.cos(e)];
}

/** Lentes sobre la cara (redondos, o de sol si `oscuros`). */
export function lentes3d(R: number, color: string, oscuros = false): THREE.Group {
  const g = new THREE.Group();
  for (const l of [-1, 1]) {
    const aro = toro(color, R * 0.2, R * 0.03, enCabeza(R, l * 20, -6, 1.06));
    aro.rotation.set(0, l * 20 * GRADOS, 0);
    g.add(aro);
    if (oscuros) {
      const vidrio = esfera("#263238", R * 0.19, enCabeza(R, l * 20, -6, 1.06), [1, 1, 0.22], 1);
      vidrio.rotation.y = l * 20 * GRADOS;
      g.add(vidrio);
    }
    const pata = cilindro(color, R * 0.022, R * 0.022, R * 1.02, [l * R * 0.765, -R * 0.05, R * 0.515], 8);
    pata.rotation.order = "YXZ";
    pata.rotation.set(Math.PI / 2, -l * 0.415, 0);
    g.add(pata);
  }
  g.add(girar(cilindro(color, R * 0.026, R * 0.026, R * 0.2, [0, -R * 0.08, R * 1.05], 8), 0, 0, Math.PI / 2));
  return g;
}

function peinar(cg: THREE.Group, R: number, d: DefPersona["pelo"], coletas: THREE.Group[]) {
  const c = d.color;
  // Casquete que cubre la coronilla y la nuca, y deja libre la frente.
  const casco = (inclina = 0.585, abertura = 1.6, k = 1.05) => cg.add(girar(cupula(c, R * k, [0, 0, 0], [1, 1, 1], abertura), -inclina));
  const mechon = (az: number, el: number, rx: number, ry: number, rz: number, k = 1) => {
    const m = esfera(c, 1, enCabeza(R, az, el, k), [R * rx, R * ry, R * rz], 1);
    m.rotation.order = "YXZ";
    m.rotation.set(-el * GRADOS, az * GRADOS, 0);
    cg.add(m);
  };
  const flequillo = (el = 38, liso = false) =>
    [-54, -28, 0, 28, 54].forEach((az, i) => mechon(az, el + (liso ? 0 : i % 2 ? 2.5 : 0), liso ? 0.27 : 0.25, liso ? 0.2 : 0.19 + (i % 2) * 0.02, 0.12));
  const patillas = (largo = 0.3) => { for (const l of [-1, 1]) mechon(l * 84, 10, 0.2, largo, 0.1); };
  // Bolitas repartidas sobre la coronilla y la nuca (pelo crespo).
  const racimo = (n: number, r: number, k: number, elMin: number, semilla: number, elMax = 90) => {
    for (let i = 0; i < n; i++) {
      const el = 90 - ((i + 0.5) / n) * (90 - elMin), az = i * 137.5 + semilla;
      if ((Math.cos(az * GRADOS) > 0.2 && el < 42) || el > elMax) continue; // la cara queda libre (y la coronilla, si lleva boina)
      cg.add(esfera(c, R * r * (0.85 + azar(i + semilla) * 0.3), enCabeza(R, az, el, k), [1, 1, 1], 1));
    }
  };
  const rulos = (r: number, el: number) => [-52, -26, 0, 26, 52].forEach((az) => cg.add(esfera(c, R * r, enCabeza(R, az, el, 1.02), [1, 1, 1], 1)));
  const coleta = (pos: V3, piezas: Array<{ r: number; p: V3; e: V3 }>) => {
    const p = pivote(pos);
    if (d.adorno && d.adorno.startsWith("#")) p.add(esfera(d.adorno, R * 0.11, [0, 0, 0], [1, 1, 1], 0));
    for (const x of piezas) p.add(esfera(c, R * x.r, [x.p[0] * R, x.p[1] * R, x.p[2] * R], x.e, 1));
    cg.add(p);
    coletas.push(p);
  };
  switch (d.estilo) {
    case "corto": casco(); flequillo(); patillas(); break;
    case "colitas":
      casco(); flequillo(); patillas();
      for (const l of [-1, 1]) coleta(enCabeza(R, l * 82, 14, 1.02), [{ r: 0.3, p: [l * 0.24, -0.12, 0], e: [0.85, 1.1, 0.85] }, { r: 0.2, p: [l * 0.34, -0.44, 0], e: [0.9, 1.15, 0.9] }]);
      break;
    case "largo":
      casco(); flequillo(); patillas(0.5);
      cg.add(esfera(c, 1, [0, -R * 0.5, -R * 0.42], [R * 0.98, R * 0.95, R * 0.6], 2));
      for (const l of [-1, 1]) cg.add(capsula(c, R * 0.16, R * 0.6, [l * R * 0.86, -R * 0.55, R * 0.02]));
      break;
    case "rizado": casco(0.585, 1.6, 1.02); racimo(28, 0.3, 0.98, -30, 7, d.adorno === "boina" ? 48 : 90); rulos(0.2, 37); break;
    case "afro": casco(0.585, 1.6, 1.02); racimo(36, 0.42, 1.1, -38, 3); rulos(0.26, 40); break;
    case "crespo": casco(0.585, 1.6, 1.02); racimo(26, 0.27, 0.99, -22, 11); rulos(0.2, 38); break;
    case "melena":
      casco(); flequillo();
      for (const l of [-1, 1]) cg.add(esfera(c, 1, [l * R * 0.8, -R * 0.35, -R * 0.05], [R * 0.36, R * 0.62, R * 0.6], 1));
      cg.add(esfera(c, 1, [0, -R * 0.4, -R * 0.5], [R * 0.9, R * 0.75, R * 0.55], 1));
      break;
    case "liso": casco(); flequillo(34, true); patillas(0.42); break;
    case "cola":
      casco(); flequillo(40); patillas();
      coleta(enCabeza(R, 150, 35, 1.02), [{ r: 0.26, p: [0.1, -0.25, -0.2], e: [0.8, 1.3, 0.8] }, { r: 0.18, p: [0.16, -0.6, -0.26], e: [0.85, 1.2, 0.85] }]);
      break;
    case "mono":
      casco(); flequillo(42); patillas();
      cg.add(esfera(c, R * 0.34, enCabeza(R, 180, 62, 1.12), [1, 0.9, 1], 1));
      break;
    case "rapado": casco(0.5, 1.45, 1.03); break;
    case "canas": casco(0.75, 1.5, 1.04); patillas(0.24); break;
  }
}

/** Arma un personaje a partir de su definición. */
export function crearPersona(def: DefPersona): Persona {
  const M = def.adulto ? ADULTO : NINO;
  const Y = (abs: number) => abs - M.yCadera;
  const raiz = new THREE.Group();
  const cuerpo = pivote([0, M.yCadera, 0]);
  const torso = pivote();
  raiz.add(cuerpo);
  cuerpo.add(torso);
  const altoT = M.yHombro - M.yCadera;
  const cA = def.arriba.color, cB = def.abajo.color, largas = def.arriba.tipo === "largo", pant = def.abajo.tipo === "pantalon";

  // Tronco y ropa
  const forma: Forma = {
    centro: [0, 0, 0], radios: [0, 0, 0],
    enTorso: (az, el, k = 1.03) => {
      const a = az * GRADOS, b = el * GRADOS;
      return [forma.centro[0] + forma.radios[0] * k * Math.sin(a) * Math.cos(b), forma.centro[1] + forma.radios[1] * k * Math.sin(b), forma.centro[2] + forma.radios[2] * k * Math.cos(a) * Math.cos(b)];
    },
  };
  const falda = (color: string, rArr: number, rAbj: number, yAbajo: number, yArriba: number, ribete?: string) => {
    const h = yArriba - yAbajo, ez = def.adulto ? 0.82 : 0.9;
    forma.falda = { rArr, rAbj, h, y: yAbajo + h / 2, ez };
    const m = cilindro(color, rArr, rAbj, h, [0, yAbajo + h / 2, 0], 24);
    m.scale.z = ez;
    torso.add(m);
    if (ribete) {
      const r = toro(ribete, rAbj, 0.03, [0, yAbajo, 0]);
      r.scale.y = ez;
      torso.add(r);
    }
  };
  if (def.arriba.tipo === "vestido") {
    const yAbajo = Y(M.yCadera - M.muslo * (def.adulto ? 0.75 : 0.5)), yArriba = Y(M.yHombro - altoT * 0.12);
    falda(cA, M.xHombro * 0.72, M.xHombro * (def.adulto ? 1.25 : 1.6), yAbajo, yArriba, def.arriba.ribete ?? oscurecer(cA, 0.14));
    forma.centro = [0, yArriba - 0.02, 0];
    forma.radios = [M.xHombro * 0.82, M.xHombro * 0.5, M.fondo * 0.82];
    torso.add(esfera(cA, 1, forma.centro, forma.radios, 1));
  } else {
    forma.centro = [0, Y(M.yCadera + altoT * 0.56), 0];
    forma.radios = [M.xHombro * 0.98, altoT * 0.64, M.fondo];
    torso.add(esfera(cA, 1, forma.centro, forma.radios, 2));
    if (def.abajo.tipo === "falda") falda(cB, M.xHombro * 0.8, M.xHombro * (def.adulto ? 1.2 : 1.45), Y(M.yCadera - M.muslo * (def.adulto ? 0.8 : 0.55)), Y(M.yCadera + altoT * 0.2));
    else torso.add(esfera(cB, 1, [0, Y(M.yCadera + altoT * 0.08), 0], [M.xHombro * 0.94, altoT * 0.34, M.fondo * 0.98], 1));
  }
  // Hombros: una barra redondeada une el tronco con los brazos.
  torso.add(girar(capsula(cA, M.rBrazo * 1.12, M.xHombro * 1.75, [0, Y(M.yHombro - M.rBrazo * 0.35), 0]), 0, 0, Math.PI / 2));
  torso.add(cilindro(def.piel, M.R * 0.2, M.R * 0.22, M.yCuello - M.yHombro + 0.1, [0, Y((M.yCuello + M.yHombro) / 2 + 0.02), 0], 14));
  if (def.arriba.cuello) torso.add(toro(def.arriba.cuello, M.R * 0.25, 0.03, [0, Y(M.yHombro + 0.045), 0]));

  // Brazos: hombro → codo → mano
  const brazo = (lado: -1 | 1) => {
    const hombro = pivote([lado * M.xHombro, Y(M.yHombro), 0]);
    const cArr = largas ? cA : def.piel;
    hombro.add(capsula(cArr, M.rBrazo, M.brazo - M.rBrazo, [0, -M.brazo / 2, 0]));
    hombro.add(esfera(cA, M.rBrazo * (largas ? 1.12 : def.arriba.tipo === "vestido" ? 1.7 : 1.45), [0, -M.rBrazo * (largas ? 0.15 : 0.5), 0], [1, 0.95, 1], 1));
    const codo = pivote([0, -M.brazo, 0]);
    codo.add(capsula(cArr, M.rBrazo * 0.93, M.antebrazo - M.rBrazo, [0, -M.antebrazo / 2, 0]));
    if (largas) codo.add(cilindro(oscurecer(cA, 0.1), M.rBrazo * 1.02, M.rBrazo * 1.02, 0.04, [0, -M.antebrazo + 0.02, 0], 12));
    codo.add(esfera(def.piel, M.mano, [0, -M.antebrazo - M.mano * 0.55, 0], [1, 1.05, 0.9], 1));
    hombro.add(codo);
    torso.add(hombro);
    return { hombro, codo };
  };
  const bI = brazo(-1), bD = brazo(1);

  // Piernas: cadera → rodilla → zapato
  const pierna = (lado: -1 | 1) => {
    const cadera = pivote([lado * M.xCadera, 0, 0]);
    cadera.add(capsula(pant ? cB : def.piel, M.rPierna, M.muslo - M.rPierna, [0, -M.muslo / 2, 0]));
    if (def.abajo.tipo === "short") cadera.add(cilindro(cB, M.rPierna * 1.22, M.rPierna * 1.3, M.muslo * 0.62, [0, -M.muslo * 0.3, 0], 14));
    const rodilla = pivote([0, -M.muslo, 0]);
    rodilla.add(capsula(pant ? cB : def.piel, M.rPierna * 0.92, M.pierna - M.rPierna, [0, -M.pierna / 2, 0]));
    if (!pant && def.zapatos.calcetin) rodilla.add(cilindro(def.zapatos.calcetin, M.rPierna, M.rPierna * 0.98, M.pierna * 0.34, [0, -M.pierna * 0.8, 0], 14));
    rodilla.add(esfera(def.zapatos.color, 1, [0, -M.pierna - 0.035, M.pie * 0.32], [M.rPierna * 1.28, 0.058, M.pie], 1));
    if (def.zapatos.suela) rodilla.add(esfera(def.zapatos.suela, 1, [0, -M.pierna - 0.068, M.pie * 0.32], [M.rPierna * 1.32, 0.026, M.pie * 1.03], 1));
    cadera.add(rodilla);
    cuerpo.add(cadera);
    return { cadera, rodilla };
  };
  const pI = pierna(-1), pD = pierna(1);

  // Cabeza: cráneo, orejas, nariz, pelo y la cara pintada
  const cabeza = pivote([0, Y(M.yCuello), 0]);
  torso.add(cabeza);
  const R = M.R;
  const cg = grupo([], [0, M.yCabeza, 0.02]);
  cabeza.add(cg);
  cg.add(esfera(def.piel, R, [0, 0, 0], [1, 1, 1], 3));
  for (const l of [-1, 1]) cg.add(esfera(def.piel, R * 0.17, [l * R * 0.97, -R * 0.06, 0], [0.55, 1, 0.8], 0));
  cg.add(esfera(oscurecer(def.piel, 0.09), R * 0.07, [0, -R * 0.27, R * 0.965], [1.1, 0.8, 0.7], 0));
  const coletas: THREE.Group[] = [];
  peinar(cg, R, def.pelo, coletas);
  const opCara = { piel: def.piel, iris: def.iris, cejas: oscurecer(def.pelo.color === "#F5F5F5" || def.pelo.color === "#E0E0E0" ? "#9E9E9E" : def.pelo.color, 0.15), pestanas: def.pestanas, adulto: def.adulto, bigote: def.bigote, mejillas: def.mejillas };
  const ojos = calcomania(texturaOjos(opCara), R * 1.006, 0.78, 1.21, 1.99);
  const boca = calcomania(texturaBoca(opCara), R * 1.008, 0.78, 1.82, 2.46);
  cg.add(ojos.malla, boca.malla);

  const ranuras = { cabeza: pivote(), cuello: pivote([0, Y(M.yHombro + 0.03), 0]), mano: pivote([0, -M.antebrazo - M.mano * 0.55, 0]) };
  cg.add(ranuras.cabeza);
  torso.add(ranuras.cuello);
  bD.codo.add(ranuras.mano);

  const partes: Partes = {
    raiz, cuerpo, torso, cabeza, cg, brazoI: bI.hombro, brazoD: bD.hombro, codoI: bI.codo, codoD: bD.codo,
    piernaI: pI.cadera, piernaD: pD.cadera, rodillaI: pI.rodilla, rodillaD: pD.rodilla, coletas, ranuras, forma,
  };
  def.extras?.(partes, M);
  fusionarEsqueleto(raiz);
  raiz.scale.setScalar(def.escala ?? 1);

  // ---------- Animación ----------
  const d = azar(def.id.length * 7.3 + def.id.charCodeAt(0)) * 6.28;
  const e = { camina: 0, habla: 0, saluda: 0, celebra: 0, sienta: 0, fase: d, salto: 0, tParpadeo: 1.5 + azar(d) * 3, tBoca: 0, boca: 0 };
  const zancada = def.adulto ? 4.4 : 6.6;
  const mezcla = (a: number, b: number, k: number) => a + (b - a) * k;

  const persona: Persona = {
    tipo: "persona", raiz, partes, def, medidas: M,
    alto: (M.yCuello + M.yCabeza + M.R) * (def.escala ?? 1),
    velocidad: 0, rumbo: 0,
    hablando: false, saludando: false, celebrando: false, sentado: false, sorprendido: false, feliz: false,
    saltar() { e.salto = 1; },
    mirarA(x, z) {
      const dx = x - raiz.position.x, dz = z - raiz.position.z;
      if (Math.abs(dx) + Math.abs(dz) > 0.01) persona.rumbo = Math.atan2(dx, dz);
    },
    actualizar(dt, t) {
      e.camina = suave(e.camina, persona.velocidad > 0.05 ? 1 : 0, dt, 9);
      e.habla = suave(e.habla, persona.hablando ? 1 : 0, dt, 8);
      e.saluda = suave(e.saluda, persona.saludando ? 1 : 0, dt, 7);
      e.celebra = suave(e.celebra, persona.celebrando ? 1 : 0, dt, 8);
      e.sienta = suave(e.sienta, persona.sentado ? 1 : 0, dt, 8);
      e.fase += persona.velocidad * zancada * dt;
      const s = Math.sin(e.fase), c = Math.cos(e.fase);
      const w = e.camina * (1 - e.sienta), h = e.habla, sa = e.saluda, ce = e.celebra, si = e.sienta;
      const resp = Math.sin(t * 2.1 + d);
      raiz.rotation.y = suaveAngulo(raiz.rotation.y, persona.rumbo, dt, 9);

      // Cuerpo: rebota al caminar, salta al celebrar y se estira y aplasta en los saltos
      let y = M.yCadera + w * Math.abs(s) * (def.adulto ? 0.09 : 0.07);
      let estira = 1;
      const brinco = Math.abs(Math.sin(t * 7 + d));
      if (ce > 0.01) {
        y += ce * brinco * 0.32;
        estira += ce * (brinco - 0.5) * 0.09;
      }
      if (e.salto > 0) {
        e.salto = Math.max(0, e.salto - dt / 0.5);
        const u = 1 - e.salto, arco = Math.sin(u * Math.PI);
        y += arco * 0.38;
        estira += u < 0.15 ? -0.12 * (1 - u / 0.15) : u > 0.85 ? -0.14 * ((u - 0.85) / 0.15) : 0.07 * arco;
      }
      cuerpo.position.y = mezcla(y, M.pierna + 0.09, si);
      const ancho = 1 / Math.sqrt(estira);
      cuerpo.scale.set(ancho, estira, ancho);
      torso.scale.set(1, 1 + resp * 0.014, 1 + resp * 0.012);
      torso.rotation.set(w * 0.07 - ce * 0.05, w * s * 0.1, 0);

      // Piernas (la rodilla se dobla cuando la pierna va hacia adelante)
      const A = 0.62, aire = ce * brinco;
      partes.piernaI.rotation.x = mezcla(-A * s * w - aire * 0.15, -1.5, si);
      partes.rodillaI.rotation.x = mezcla(w * 0.95 * Math.max(0, c) + aire * 0.4, 1.5, si);
      partes.piernaD.rotation.x = mezcla(A * s * w - aire * 0.15, -1.5, si);
      partes.rodillaD.rotation.x = mezcla(w * 0.95 * Math.max(0, -c) + aire * 0.4, 1.5, si);

      // Brazos: se balancean al revés que las piernas; gesticulan al hablar
      let ix = A * 0.8 * s * w, iz = -0.16 - resp * 0.02, icx = -(0.12 + w * (0.25 + 0.3 * Math.max(0, -s))), icz = 0;
      let dx = -A * 0.8 * s * w, dz = 0.16 + resp * 0.02, dcx = -(0.12 + w * (0.25 + 0.3 * Math.max(0, s))), dcz = 0;
      if (h > 0.01) {
        const g1 = Math.sin(t * 5.2 + d), g2 = Math.sin(t * 3.4 + d * 2);
        dx -= h * (0.55 + 0.25 * g1);
        dcx -= h * (0.75 + 0.3 * g2);
        dz += h * 0.12;
        ix -= h * (0.18 + 0.12 * g2);
        icx -= h * (0.35 + 0.2 * g1);
      }
      if (si > 0.01) {
        ix = mezcla(ix, -0.5, si); icx = mezcla(icx, -0.7, si);
        dx = mezcla(dx, -0.5, si); dcx = mezcla(dcx, -0.7, si);
      }
      if (sa > 0.01) {
        dx = mezcla(dx, 0, sa);
        dz = mezcla(dz, 2.45, sa);
        dcx = mezcla(dcx, 0, sa);
        dcz = sa * (0.35 + 0.45 * Math.sin(t * 9));
      }
      if (ce > 0.01) {
        const agita = Math.sin(t * 9 + d) * 0.18;
        ix = mezcla(ix, 0, ce); iz = mezcla(iz, -2.55 - agita, ce); icx = mezcla(icx, 0, ce); icz = -ce * 0.25;
        dx = mezcla(dx, 0, ce); dz = mezcla(dz, 2.55 + agita, ce); dcx = mezcla(dcx, 0, ce); dcz = mezcla(dcz, 0.25, ce);
      }
      partes.brazoI.rotation.set(ix, 0, iz);
      partes.codoI.rotation.set(icx, 0, icz);
      partes.brazoD.rotation.set(dx, 0, dz);
      partes.codoD.rotation.set(dcx, 0, dcz);

      // Cabeza: se mece suave, asiente al hablar, se ladea al saludar
      cabeza.rotation.set(
        w * 0.04 * Math.cos(e.fase * 2) + h * 0.06 * Math.sin(t * 7.3 + d) - ce * 0.12,
        Math.sin(t * 0.6 + d) * 0.07 * (1 - w) - w * s * 0.06,
        Math.sin(t * 0.9 + d) * 0.035 - sa * 0.1,
      );
      coletas.forEach((p, i) => {
        const l = p.position.x < 0 ? -1 : 1;
        p.rotation.set(w * c * 0.3 + ce * Math.sin(t * 14) * 0.2, 0, l * (Math.sin(t * 1.7 + d + i) * 0.06 + w * Math.abs(s) * 0.22 + ce * brinco * 0.3));
      });

      // Ojos: pestañeo, carita feliz al celebrar, sorpresa
      e.tParpadeo -= dt;
      let cuadroOjos: CuadroOjos = "abierto";
      if (ce > 0.5 || persona.feliz) cuadroOjos = "feliz";
      else if (persona.sorprendido) cuadroOjos = "sorpresa";
      else if (e.tParpadeo < 0) {
        const u = -e.tParpadeo;
        cuadroOjos = u < 0.05 ? "medio" : u < 0.13 ? "cerrado" : u < 0.18 ? "medio" : "abierto";
        if (u >= 0.18) e.tParpadeo = 2.2 + Math.random() * 3.2;
      }
      ojos.cuadro(OJOS[cuadroOjos]);
      // Boca: se mueve al hablar
      let cuadroBoca: CuadroBoca = "sonrisa";
      if (persona.hablando) {
        e.tBoca -= dt;
        if (e.tBoca <= 0) {
          e.tBoca = 0.09 + Math.random() * 0.07;
          e.boca = (e.boca + 1 + Math.floor(Math.random() * 2)) % 3;
        }
        cuadroBoca = (["chica", "grande", "sonrisa"] as const)[e.boca]!;
      } else if (ce > 0.5) cuadroBoca = "risa";
      else if (persona.sorprendido) cuadroBoca = "o";
      boca.cuadro(BOCAS[cuadroBoca]);
    },
  };
  return persona;
}

// ---------- El elenco ----------

/** El personaje del niño, con su piel, pelo, peinado y ropa. */
export function defNino(a: Apariencia): DefPersona {
  return {
    id: "nino", piel: a.piel, pelo: { color: a.pelo, estilo: a.peinado, adorno: a.peinado === "colitas" ? "#F06292" : undefined },
    arriba: { tipo: "polera", color: a.ropa, cuello: "#ffffff" }, abajo: { tipo: "short", color: "#5C6BC0" },
    zapatos: { color: "#3E2723", suela: "#ffffff", calcetin: "#ffffff" },
  };
}

/** Delantal completo: pechera sobre el tronco y paño sobre la falda. */
const delantal = (p: Partes, color: string, ancho = 0.62) => {
  p.torso.add(pechera(p.forma, color, ancho, 38, -70));
  const paño = panelFalda(p.forma, color, ancho * 0.95);
  if (paño) p.torso.add(paño);
};

export const ELENCO: Record<string, DefPersona> = {
  emilia: {
    id: "emilia", escala: 0.95, piel: "#F6D3B3", pestanas: true, pelo: { color: "#5D4037", estilo: "colitas", adorno: "#E53935" },
    arriba: { tipo: "vestido", color: "#FDD835", cuello: "#ffffff", ribete: "#F9A825" }, abajo: { tipo: "nada", color: "#FDD835" },
    zapatos: { color: "#E53935", calcetin: "#ffffff" },
    extras: (p) => p.torso.add(esfera("#ffffff", 0.045, [0, p.forma.centro[1] - 0.13, 0.2], [1, 1, 0.6], 0)),
  },
  // Don Pedro: sombrero de paja, bigote canoso, camisa roja y overol azul.
  pedro: {
    id: "pedro", adulto: true, piel: "#E0A878", bigote: "#BDBDBD", pelo: { color: "#9E9E9E", estilo: "canas" },
    arriba: { tipo: "largo", color: "#C62828" }, abajo: { tipo: "pantalon", color: "#1565C0" }, zapatos: { color: "#4E342E" },
    extras: (p, m) => {
      p.torso.add(pechera(p.forma, "#1E88E5", 0.6, 22, -90));
      for (const l of [-1, 1]) {
        p.torso.add(pechera(p.forma, "#1E88E5", 0.13, 80, 20, l * 0.42));
        p.torso.add(esfera("#FFD54F", 0.03, p.forma.enTorso(l * 24, 20, 1.06), [1, 1, 0.5], 0));
      }
      p.torso.add(pechera(p.forma, "#1976D2", 0.22, 4, -16, 0, 1.07));
      p.cg.add(girar(cilindro("#F9D56E", m.R * 1.5, m.R * 1.55, 0.05, [0, m.R * 0.6, -m.R * 0.05], 28), 0.08));
      p.cg.add(girar(cupula("#FBC02D", m.R * 0.86, [0, m.R * 0.6, -m.R * 0.05], [1, 0.85, 1]), 0.08));
      p.cg.add(girar(cilindro("#8D6E63", m.R * 0.88, m.R * 0.88, 0.09, [0, m.R * 0.68, -m.R * 0.05], 28), 0.08));
    },
  },
  // Doña Rosa: moño canoso, lentes, vestido morado y delantal rosado.
  rosa: {
    id: "rosa", adulto: true, piel: "#F3D2B8", pestanas: true, pelo: { color: "#E0E0E0", estilo: "mono" },
    arriba: { tipo: "largo", color: "#7E57C2" }, abajo: { tipo: "falda", color: "#7E57C2" }, zapatos: { color: "#5D4037" },
    extras: (p, m) => {
      delantal(p, "#F8BBD0");
      p.torso.add(pechera(p.forma, "#F48FB1", 0.2, -22, -46, 0, 1.08));
      p.cg.add(lentes3d(m.R, "#8D6E63"));
    },
  },
  // Dr. Lucas: delantal blanco, camisa celeste y estetoscopio.
  lucas: {
    id: "lucas", adulto: true, piel: "#8D5A3B", pelo: { color: "#212121", estilo: "rapado" },
    arriba: { tipo: "largo", color: "#FAFAFA", cuello: "#4FC3F7" }, abajo: { tipo: "pantalon", color: "#37474F" }, zapatos: { color: "#212121" },
    extras: (p, m) => {
      p.torso.add(pechera(p.forma, "#4FC3F7", 0.2, 85, -55, 0, 1.03));
      const colgante = toro("#455A64", m.R * 0.42, 0.022, [0, p.forma.centro[1] + p.forma.radios[1] * 0.62, m.fondo * 0.5]);
      colgante.rotation.x = Math.PI / 2 - 1.0;
      p.torso.add(colgante);
      p.torso.add(esfera("#90A4AE", 0.055, p.forma.enTorso(14, -8, 1.07), [1, 1, 0.5], 0));
      p.torso.add(pechera(p.forma, "#E0E0E0", 0.12, 6, -8, 0.5, 1.05));
    },
  },
  // La tía de la escuelita: cola de caballo, chaleco verde agua y delantal con estrellas.
  tia: {
    id: "tia", adulto: true, piel: "#F1C7A5", pestanas: true, pelo: { color: "#6D4C41", estilo: "cola", adorno: "#FF7043" },
    arriba: { tipo: "largo", color: "#26A69A" }, abajo: { tipo: "falda", color: "#26A69A" }, zapatos: { color: "#5D4037" },
    extras: (p) => {
      delantal(p, "#FFF8E1", 0.55);
      ([[-12, 14], [14, -8], [-8, -32]] as const).forEach(([az, el]) => p.torso.add(prisma("#FFCA28", puntosEstrella(0.05), 0.02, p.forma.enTorso(az, el, 1.07), 0.004)));
      p.torso.add(caja("#FF7043", 0.14, 0.06, 0.05, p.forma.enTorso(0, 62, 1.05), 0.02));
    },
  },
  // El profe Tomás: pelo crespo, boina roja y cotona manchada de pintura.
  artista: {
    id: "artista", adulto: true, piel: "#C68B59", pelo: { color: "#212121", estilo: "rizado", adorno: "boina" },
    arriba: { tipo: "largo", color: "#ECEFF1", cuello: "#FFB300" }, abajo: { tipo: "pantalon", color: "#455A64" }, zapatos: { color: "#3E2723" },
    extras: (p, m) => {
      ([[-22, 26, "#E53935"], [20, 10, "#1E88E5"], [-6, -14, "#43A047"], [26, -30, "#FDD835"], [-30, -34, "#8E24AA"], [4, 40, "#FB8C00"]] as const)
        .forEach(([az, el, c]) => p.torso.add(esfera(c, 0.04, p.forma.enTorso(az, el, 1.0), [1, 1, 0.5], 0)));
      p.cg.add(girar(esfera("#D32F2F", 1, [-m.R * 0.1, m.R * 0.88, 0], [m.R * 1.0, m.R * 0.3, m.R * 0.95], 1), 0, 0, 0.18));
      p.cg.add(cilindro("#D32F2F", 0.02, 0.02, 0.08, [-m.R * 0.2, m.R * 1.18, 0], 8));
    },
  },
  // La abuela Nina: pelo blanco crespito, lentes redondos, chaleco coral y delantal amarillo.
  nina: {
    id: "nina", adulto: true, escala: 0.93, piel: "#F5D0B5", pestanas: true, pelo: { color: "#F5F5F5", estilo: "crespo" },
    arriba: { tipo: "largo", color: "#E57373" }, abajo: { tipo: "falda", color: "#E57373" }, zapatos: { color: "#6D4C41" },
    extras: (p, m) => {
      delantal(p, "#FFF59D", 0.58);
      for (const giro of [-0.3, 0, 0.3]) p.torso.add(pechera(p.forma, "#FFB300", 0.022, 36, -68, giro, 1.055));
      for (const el of [16, -10, -36, -60]) p.torso.add(pechera(p.forma, "#FFB300", 0.56, el + 1.6, el - 1.6, 0, 1.055));
      p.cg.add(lentes3d(m.R, "#8D6E63"));
      for (const l of [-1, 1]) p.cg.add(esfera("#ffffff", 0.035, [l * m.R * 1.0, -m.R * 0.3, 0], [1, 1, 1], 0));
    },
  },
  // Max (Estados Unidos): jockey azul y polera roja con estrella.
  max: {
    id: "max", piel: "#C68B5E", pelo: { color: "#2E1A12", estilo: "rapado" },
    arriba: { tipo: "polera", color: "#E53935" }, abajo: { tipo: "short", color: "#1565C0" }, zapatos: { color: "#FAFAFA", suela: "#E53935", calcetin: "#ffffff" },
    extras: (p, m) => {
      p.torso.add(prisma("#ffffff", puntosEstrella(0.09), 0.02, p.forma.enTorso(0, 0, 1.0), 0.005));
      p.cg.add(girar(cupula("#1E88E5", m.R * 1.08, [0, m.R * 0.08, 0], [1, 0.95, 1], 1.5), -0.25));
      p.cg.add(girar(esfera("#1565C0", 1, [0, m.R * 0.42, m.R * 1.12], [m.R * 0.6, m.R * 0.06, m.R * 0.5], 1), 0.12));
      p.cg.add(esfera("#1565C0", m.R * 0.08, [0, m.R * 1.1, -m.R * 0.26], [1, 0.6, 1], 0));
    },
  },
  // Bia (Brasil): pelo crespo grande con flor, vestido verde y amarillo.
  bia: {
    id: "bia", piel: "#A9714B", pestanas: true, pelo: { color: "#2B1B14", estilo: "afro" },
    arriba: { tipo: "vestido", color: "#43A047", ribete: "#FDD835" }, abajo: { tipo: "nada", color: "#43A047" }, zapatos: { color: "#FDD835" },
    extras: (p, m) => {
      p.torso.add(esfera("#FDD835", 0.075, [0, p.forma.centro[1] - 0.15, 0.215], [1, 1, 0.4], 1));
      p.torso.add(esfera("#1E88E5", 0.035, [0, p.forma.centro[1] - 0.15, 0.24], [1, 1, 0.4], 0));
      const flor = grupo([], enCabeza(m.R, 48, 48, 1.42));
      for (let i = 0; i < 5; i++) flor.add(esfera("#F06292", m.R * 0.11, [Math.cos(i * 1.257) * m.R * 0.13, Math.sin(i * 1.257) * m.R * 0.13, 0], [1, 1, 0.5], 0));
      flor.add(esfera("#FFEB3B", m.R * 0.08, [0, 0, m.R * 0.03], [1, 1, 0.6], 0));
      flor.rotation.y = 0.6;
      p.cg.add(flor);
    },
  },
  // Léa (Francia): boina roja, melena, polera a rayas y falda roja. Le encanta pintar.
  lea: {
    id: "lea", piel: "#F6D3B3", iris: "#1E3A8A", pestanas: true, pelo: { color: "#C68B3E", estilo: "melena" },
    arriba: { tipo: "polera", color: "#ffffff" }, abajo: { tipo: "falda", color: "#E53935" }, zapatos: { color: "#1A237E", calcetin: "#ffffff" },
    extras: (p, m) => {
      for (const el of [38, 14, -10]) p.torso.add(pechera(p.forma, "#1E3A8A", Math.PI, el + 5, el - 5, 0, 1.02));
      p.cg.add(girar(esfera("#C62828", 1, [-m.R * 0.08, m.R * 0.9, 0], [m.R * 1.0, m.R * 0.3, m.R * 0.95], 1), 0, 0, 0.16));
      p.cg.add(cilindro("#C62828", 0.02, 0.02, 0.08, [-m.R * 0.18, m.R * 1.2, 0], 8));
      p.codoI.add(girar(cilindro("#8D6E63", 0.014, 0.014, 0.3, [0, -m.antebrazo - 0.1, 0.06], 8), 0.5));
      p.codoI.add(esfera("#7E57C2", 0.03, [0, -m.antebrazo + 0.02, 0.13], [0.8, 1.4, 0.8], 0));
    },
  },
  // Xiao Lin (China): flequillo liso, chaqueta roja con botones dorados.
  xiaolin: {
    id: "xiaolin", piel: "#F3D2A2", iris: "#3E2723", mejillas: "#EF9A9A", pelo: { color: "#111111", estilo: "liso" },
    arriba: { tipo: "largo", color: "#D32F2F", cuello: "#FFC107" }, abajo: { tipo: "pantalon", color: "#2E7D32" }, zapatos: { color: "#212121" },
    extras: (p) => {
      for (const el of [-28, 0, 28]) p.torso.add(esfera("#FFC107", 0.028, p.forma.enTorso(0, el, 1.01), [1, 1, 0.6], 0));
      p.torso.add(pechera(p.forma, "#B71C1C", 0.03, 60, -60, 0, 1.01));
    },
  },
};
