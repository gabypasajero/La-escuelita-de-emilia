import * as THREE from "three";
import { lienzo } from "./base";

/**
 * Caras de los personajes 3D: ojos y boca pintados sobre la cabeza, como en
 * los muñecos, pero con varios "cuadros" para pestañear, hablar, reír y
 * sorprenderse. Los ojos son grandes y brillantes (iris de color, un brillo
 * grande y uno chico) y las mejillas rosadas van difuminadas.
 *
 * Cada textura es una tira de cuadros; para cambiar de expresión solo se
 * corre la textura (no se vuelve a pintar).
 */

export const OJOS = { abierto: 0, medio: 1, cerrado: 2, feliz: 3, sorpresa: 4 } as const;
export const BOCAS = { sonrisa: 0, chica: 1, grande: 2, o: 3, risa: 4 } as const;
export type CuadroOjos = keyof typeof OJOS;
export type CuadroBoca = keyof typeof BOCAS;
export const N_CUADROS = 5;
const CW = 256, CH = 128;

export interface OpCara {
  piel: string;
  iris?: string;
  cejas?: string;
  pestanas?: boolean;
  adulto?: boolean;
  /** Color del bigote (Don Pedro). */
  bigote?: string;
  /** Color de las mejillas. */
  mejillas?: string;
}

const CACHE = new Map<string, THREE.CanvasTexture>();

function elipse(g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) {
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fill();
}

function pintarOjo(g: CanvasRenderingContext2D, cx: number, cy: number, cuadro: CuadroOjos, o: OpCara, lado: -1 | 1) {
  const rx = o.adulto ? 17 : 23, ry = o.adulto ? 20 : 27;
  const trazo = "#3A2418";
  // Ceja
  const sube = cuadro === "sorpresa" ? 9 : cuadro === "feliz" ? 4 : 0;
  g.strokeStyle = o.cejas ?? "#5D4037";
  g.lineCap = "round";
  g.lineWidth = o.adulto ? 5 : 4.5;
  g.globalAlpha = 0.75;
  g.beginPath();
  g.moveTo(cx - rx * 0.75, cy - ry - 9 - sube);
  g.quadraticCurveTo(cx, cy - ry - 16 - sube, cx + rx * 0.75, cy - ry - 9 - sube);
  g.stroke();
  g.globalAlpha = 1;
  if (cuadro === "cerrado" || cuadro === "feliz") {
    g.strokeStyle = trazo;
    g.lineWidth = 6;
    g.beginPath();
    if (cuadro === "feliz") {
      g.moveTo(cx - rx * 0.85, cy + 7);
      g.quadraticCurveTo(cx, cy - ry * 0.75, cx + rx * 0.85, cy + 7);
    } else {
      g.moveTo(cx - rx * 0.85, cy + 2);
      g.quadraticCurveTo(cx, cy + ry * 0.5, cx + rx * 0.85, cy + 2);
    }
    g.stroke();
    return;
  }
  const e = cuadro === "sorpresa" ? 1.1 : 1;
  g.fillStyle = "#2B1D16";
  elipse(g, cx, cy, rx * e, ry * e);
  const iris = g.createLinearGradient(0, cy - ry * 0.4, 0, cy + ry);
  iris.addColorStop(0, o.iris ?? "#6D4C41");
  iris.addColorStop(1, aclarar(o.iris ?? "#6D4C41", 0.35));
  g.fillStyle = iris;
  elipse(g, cx, cy + ry * 0.2 * e, rx * 0.76 * e, ry * 0.74 * e);
  g.fillStyle = "#1A100B";
  elipse(g, cx, cy + ry * 0.08, rx * 0.4 * e, ry * 0.42 * e);
  g.fillStyle = "rgba(255,255,255,0.25)";
  elipse(g, cx, cy + ry * 0.62 * e, rx * 0.42, ry * 0.18);
  g.fillStyle = "#ffffff";
  elipse(g, cx - rx * 0.32, cy - ry * 0.36, rx * 0.36, rx * 0.36);
  elipse(g, cx + rx * 0.4, cy + ry * 0.34, rx * 0.15, rx * 0.15);
  if (cuadro === "medio") {
    // Párpado a medio cerrar (del color de la piel) con su línea.
    g.fillStyle = o.piel;
    g.fillRect(cx - rx * 1.4, cy - ry * 1.5, rx * 2.8, ry * 1.42);
    g.strokeStyle = trazo;
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(cx - rx * 0.98, cy - ry * 0.02);
    g.quadraticCurveTo(cx, cy - ry * 0.2, cx + rx * 0.98, cy - ry * 0.02);
    g.stroke();
  }
  if (o.pestanas) {
    g.strokeStyle = trazo;
    g.lineWidth = 3.5;
    g.beginPath();
    g.moveTo(cx + lado * rx * 0.78, cy - ry * 0.55);
    g.lineTo(cx + lado * rx * 1.18, cy - ry * 0.86);
    g.moveTo(cx + lado * rx * 0.94, cy - ry * 0.3);
    g.lineTo(cx + lado * rx * 1.34, cy - ry * 0.46);
    g.stroke();
  }
}

/** Tira de ojos: abierto, medio, cerrado, feliz y sorpresa. */
export function texturaOjos(o: OpCara): THREE.CanvasTexture {
  const clave = `ojos|${o.piel}|${o.iris}|${o.cejas}|${o.pestanas}|${o.adulto}`;
  let t = CACHE.get(clave);
  if (!t) {
    t = lienzo(CW * N_CUADROS, CH, (g) => {
      (Object.keys(OJOS) as CuadroOjos[]).forEach((cuadro, i) => {
        const x0 = i * CW, sep = o.adulto ? 0.2 : 0.225;
        pintarOjo(g, x0 + CW * (0.5 - sep), 76, cuadro, o, -1);
        pintarOjo(g, x0 + CW * (0.5 + sep), 76, cuadro, o, 1);
      });
    });
    CACHE.set(clave, t);
  }
  return t;
}

function pintarBoca(g: CanvasRenderingContext2D, cx: number, cy: number, cuadro: CuadroBoca, o: OpCara) {
  const k = o.adulto ? 0.82 : 1;
  const labio = "#8E3B46", lengua = "#F48FB1";
  // Mejillas difuminadas
  for (const lado of [-1, 1]) {
    const mx = cx + lado * (o.adulto ? 80 : 86), my = cy - 26;
    const rad = g.createRadialGradient(mx, my, 2, mx, my, o.adulto ? 26 : 32);
    const c = o.mejillas ?? "#FF8A80";
    rad.addColorStop(0, color(c, o.adulto ? 0.42 : 0.55));
    rad.addColorStop(1, color(c, 0));
    g.fillStyle = rad;
    g.fillRect(mx - 36, my - 36, 72, 72);
  }
  g.fillStyle = labio;
  g.strokeStyle = labio;
  g.lineCap = "round";
  g.lineJoin = "round";
  if (cuadro === "sonrisa") {
    g.beginPath();
    g.moveTo(cx - 22 * k, cy - 7);
    g.quadraticCurveTo(cx, cy + 20 * k, cx + 22 * k, cy - 7);
    g.quadraticCurveTo(cx, cy + 1, cx - 22 * k, cy - 7);
    g.fill();
    g.lineWidth = 4;
    g.stroke();
    g.fillStyle = lengua;
    elipse(g, cx, cy + 6 * k, 8 * k, 3.6 * k);
  } else if (cuadro === "chica" || cuadro === "grande" || cuadro === "o") {
    const rx = (cuadro === "chica" ? 13 : cuadro === "grande" ? 17 : 10) * k, ry = (cuadro === "chica" ? 9 : cuadro === "grande" ? 16 : 11) * k;
    elipse(g, cx, cy + 2, rx, ry);
    if (cuadro !== "o") {
      g.fillStyle = lengua;
      elipse(g, cx, cy + 2 + ry * 0.5, rx * 0.62, ry * 0.36);
    }
    if (cuadro === "grande") {
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.ellipse(cx, cy + 2 - ry * 0.62, rx * 0.6, ry * 0.26, 0, 0, Math.PI * 2);
      g.fill();
    }
  } else {
    // Risa: boca bien abierta en forma de D acostada.
    g.beginPath();
    g.moveTo(cx - 27 * k, cy - 9);
    g.quadraticCurveTo(cx, cy - 3, cx + 27 * k, cy - 9);
    g.quadraticCurveTo(cx + 23 * k, cy + 25 * k, cx, cy + 27 * k);
    g.quadraticCurveTo(cx - 23 * k, cy + 25 * k, cx - 27 * k, cy - 9);
    g.fill();
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.moveTo(cx - 19 * k, cy - 6);
    g.quadraticCurveTo(cx, cy - 1, cx + 19 * k, cy - 6);
    g.quadraticCurveTo(cx, cy + 5, cx - 19 * k, cy - 6);
    g.fill();
    g.fillStyle = lengua;
    elipse(g, cx, cy + 17 * k, 12 * k, 6 * k);
  }
  if (o.bigote) {
    g.fillStyle = o.bigote;
    for (const lado of [-1, 1]) {
      g.beginPath();
      g.moveTo(cx, cy - 20);
      g.quadraticCurveTo(cx + lado * 20, cy - 26, cx + lado * 38, cy - 8);
      g.quadraticCurveTo(cx + lado * 18, cy - 8, cx, cy - 10);
      g.fill();
    }
  }
}

/** Tira de bocas (con mejillas): sonrisa, hablando chica, hablando grande, "o" y risa. */
export function texturaBoca(o: OpCara): THREE.CanvasTexture {
  const clave = `boca|${o.adulto}|${o.bigote}|${o.mejillas}`;
  let t = CACHE.get(clave);
  if (!t) {
    t = lienzo(CW * N_CUADROS, CH, (g) => {
      (Object.keys(BOCAS) as CuadroBoca[]).forEach((cuadro, i) => pintarBoca(g, i * CW + CW / 2, 70, cuadro, o));
    });
    CACHE.set(clave, t);
  }
  return t;
}

const GEO_CAL = new Map<string, THREE.SphereGeometry>();

/**
 * Calcomanía sobre la cabeza: un trozo de esfera apenas más grande que el
 * cráneo, centrado al frente. `ancho` es el medio ángulo hacia los lados;
 * `arriba` y `abajo`, los ángulos desde la coronilla.
 */
export function calcomania(base: THREE.CanvasTexture, radio: number, ancho: number, arriba: number, abajo: number): { malla: THREE.Mesh; cuadro: (i: number) => void } {
  const clave = `${radio.toFixed(3)}|${ancho}|${arriba}|${abajo}`;
  let g = GEO_CAL.get(clave);
  if (!g) {
    g = new THREE.SphereGeometry(radio, 20, 10, Math.PI / 2 - ancho, ancho * 2, arriba, abajo - arriba);
    GEO_CAL.set(clave, g);
  }
  const t = base.clone();
  t.repeat.set(1 / N_CUADROS, 1);
  t.needsUpdate = true;
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({
    map: t, transparent: true, depthWrite: false, roughness: 0.5,
    polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
  }));
  m.userData.aparte = true;
  m.renderOrder = 2;
  let actual = 0;
  return {
    malla: m,
    cuadro(i) {
      if (i === actual) return;
      actual = i;
      t.offset.x = i / N_CUADROS;
    },
  };
}

function color(hex: string, alfa: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alfa})`;
}

function aclarar(hex: string, cuanto: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v + (255 - v) * cuanto);
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

/** Oscurece un color (para cejas a partir del pelo, sombras de ropa…). */
export function oscurecer(hex: string, cuanto: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * (1 - cuanto)).toString(16).padStart(2, "0");
  return `#${f((n >> 16) & 255)}${f((n >> 8) & 255)}${f(n & 255)}`;
}
