import * as THREE from "three";
import { azar, capsula, cilindro, cono, esfera, fusionarEsqueleto, girar, mat, pivote, suave, suaveAngulo, toro, type V3 } from "./base";

/**
 * Animales 3D articulados, estilo juguete: cuerpo redondeado, patas que dan
 * pasos, cabeza que mira y pasta, cola que se mueve, ojos de botón brillantes
 * que pestañean. Cada uno tiene su manera de moverse: la gallina picotea, el
 * conejo y la rana saltan, el pato nada, la mariposa y el pájaro aletean.
 * Miran hacia +Z. Tito, el pudú, también vive aquí.
 */
export type AnimalId3D = "vaca" | "oveja" | "caballo" | "cerdo" | "gato" | "perro" | "oso" | "panda" | "zorro" | "llama" | "conejo" | "rana" | "gallina" | "pato" | "mariposa" | "pajaro" | "pudu";

export interface Animal {
  tipo: "animal";
  id: AnimalId3D;
  raiz: THREE.Group;
  alto: number;
  /** Rapidez a la que se desplaza (anima los pasos). */
  velocidad: number;
  rumbo: number;
  /** Contento: salta y mueve la cola rápido. */
  contento: boolean;
  /** Solo el pato: flota en el agua. */
  nadando: boolean;
  /** Donde se engancha un accesorio (el moño o la corona de Tito). */
  ranuraCabeza?: THREE.Group;
  saltar(): void;
  actualizar(dt: number, t: number): void;
}

interface DefCuad {
  esc: number;
  largo: number; alto: number; ancho: number;
  color: string; panza?: string;
  patas: { largo: number; r: number; color: string; pezuna?: string; sep: number; zDel: number; zTras: number };
  cuello: { largo: number; r: number; ang: number; color?: string };
  cabeza: { r: number; esc: V3; color: string };
  hocico?: { r: number; esc: V3; color: string; z: number; y: number; nariz?: string; rNariz?: number };
  orejas: { forma: "punta" | "caida" | "redonda" | "larga" | "hoja"; color: string; dentro?: string; tam: number; sep: number; y: number; z?: number };
  ojos: { sep: number; y: number; z: number; r: number };
  cola: { forma: "pompon" | "cuerda" | "mechon" | "rizo" | "zorro" | "corta"; color: string; punta?: string; largo?: number };
  /** Baja la cabeza a pastar de vez en cuando. */
  pasta?: boolean;
  /** Se desplaza a saltitos (conejo, rana). */
  salta?: boolean;
  extras?: (p: PartesCuad, d: DefCuad) => void;
}

interface PartesCuad { cuerpo: THREE.Group; cuello: THREE.Group; cabeza: THREE.Group; cola: THREE.Group; patas: THREE.Group[]; cy: number; cz: number }

const OJO = () => mat("#2B2118", { rug: 0.2 });
const BRILLO = () => mat("#ffffff", { rug: 0.2 });

/** Par de ojos de botón con brillo, en una articulación propia (para pestañear). */
function ojos(sep: number, y: number, z: number, r: number): THREE.Group {
  const p = pivote([0, y, 0]);
  for (const l of [-1, 1]) {
    p.add(esfera(OJO(), r, [l * sep, 0, z], [1, 1.1, 0.8], 1));
    p.add(esfera(BRILLO(), r * 0.34, [l * sep - r * 0.28, r * 0.36, z + r * 0.62], [1, 1, 0.7], 0));
  }
  return p;
}

function crearCuadrupedo(id: AnimalId3D, d: DefCuad): Animal {
  const raiz = new THREE.Group();
  const yC = d.alto * 0.25 + d.patas.largo + d.patas.r * 0.3;
  const cuerpo = pivote([0, yC, 0]);
  raiz.add(cuerpo);
  cuerpo.add(esfera(d.color, 1, [0, 0, 0], [d.ancho / 2, d.alto / 2, d.largo / 2], 2));
  if (d.panza) cuerpo.add(esfera(d.panza, 1, [0, -d.alto * 0.13, 0], [d.ancho * 0.45, d.alto * 0.42, d.largo * 0.43], 1));
  const patas = ([[-1, d.patas.zDel], [1, d.patas.zDel], [-1, d.patas.zTras], [1, d.patas.zTras]] as const).map(([l, z]) => {
    const p = pivote([l * d.patas.sep, -d.alto * 0.25, z]);
    p.add(capsula(d.patas.color, d.patas.r, d.patas.largo - d.patas.r * 1.2, [0, -d.patas.largo / 2 + d.patas.r * 0.1, 0]));
    if (d.patas.pezuna) p.add(cilindro(d.patas.pezuna, d.patas.r * 1.06, d.patas.r * 1.1, d.patas.r * 0.9, [0, -d.patas.largo + d.patas.r * 0.15, 0], 12));
    cuerpo.add(p);
    return p;
  });
  const cuello = pivote([0, d.alto * 0.18, d.largo * 0.36]);
  cuello.rotation.x = d.cuello.ang;
  if (d.cuello.largo > 0.01) cuello.add(capsula(d.cuello.color ?? d.color, d.cuello.r, d.cuello.largo, [0, d.cuello.largo / 2, 0]));
  const cabeza = pivote([0, d.cuello.largo + d.cuello.r * 0.2, 0]);
  cabeza.rotation.x = -d.cuello.ang;
  cuello.add(cabeza);
  cuerpo.add(cuello);
  const c = d.cabeza, cy = c.r * 0.2, cz = c.r * c.esc[2] * 0.35;
  cabeza.add(esfera(c.color, c.r, [0, cy, cz], c.esc, 2));
  if (d.hocico) {
    const h = d.hocico;
    cabeza.add(esfera(h.color, h.r, [0, cy + h.y, cz + h.z], h.esc, 1));
    if (h.nariz) cabeza.add(esfera(mat(h.nariz, { rug: 0.3 }), h.rNariz ?? h.r * 0.3, [0, cy + h.y + h.r * h.esc[1] * 0.3, cz + h.z + h.r * h.esc[2] * 0.88], [1.2, 0.85, 0.8], 1));
  }
  const o = d.orejas;
  for (const l of [-1, 1]) {
    const pos: V3 = [l * o.sep, cy + o.y, cz + (o.z ?? 0)];
    if (o.forma === "punta") {
      cabeza.add(girar(cono(o.color, o.tam * 0.5, o.tam, pos, 12), 0, 0, -l * 0.28));
      if (o.dentro) cabeza.add(girar(cono(o.dentro, o.tam * 0.3, o.tam * 0.66, [pos[0], pos[1] - o.tam * 0.1, pos[2] + o.tam * 0.2], 10), 0, 0, -l * 0.28));
    } else if (o.forma === "caida") {
      cabeza.add(girar(esfera(o.color, o.tam, [pos[0] + l * o.tam * 0.25, pos[1] - o.tam * 0.55, pos[2]], [0.34, 1, 0.7], 1), 0, 0, l * 0.5));
    } else if (o.forma === "redonda") {
      cabeza.add(esfera(o.color, o.tam, pos, [1, 1, 0.5], 1));
      if (o.dentro) cabeza.add(esfera(o.dentro, o.tam * 0.6, [pos[0], pos[1], pos[2] + o.tam * 0.25], [1, 1, 0.4], 1));
    } else if (o.forma === "larga") {
      cabeza.add(girar(esfera(o.color, o.tam, [pos[0] + l * o.tam * 0.12, pos[1] + o.tam * 0.9, pos[2]], [0.3, 1, 0.22], 1), -0.12, 0, -l * 0.16));
      if (o.dentro) cabeza.add(girar(esfera(o.dentro, o.tam * 0.72, [pos[0] + l * o.tam * 0.12, pos[1] + o.tam * 0.88, pos[2] + o.tam * 0.12], [0.24, 1, 0.14], 1), -0.12, 0, -l * 0.16));
    } else {
      cabeza.add(girar(esfera(o.color, o.tam, [pos[0] + l * o.tam * 0.45, pos[1] + o.tam * 0.25, pos[2]], [0.5, 0.92, 0.28], 1), 0, 0, -l * 0.75));
      if (o.dentro) cabeza.add(girar(esfera(o.dentro, o.tam * 0.6, [pos[0] + l * o.tam * 0.45, pos[1] + o.tam * 0.22, pos[2] + o.tam * 0.14], [0.45, 0.9, 0.2], 1), 0, 0, -l * 0.75));
    }
  }
  const ojosP = ojos(d.ojos.sep, cy + d.ojos.y, cz + d.ojos.z, d.ojos.r);
  cabeza.add(ojosP);
  const ranura = pivote([0, cy + c.r * c.esc[1] * 0.95, cz]);
  cabeza.add(ranura);

  const cola = pivote([0, d.alto * 0.16, -d.largo * 0.47]);
  const q = d.cola, lc = q.largo ?? 0.14;
  if (q.forma === "pompon") cola.add(esfera(q.color, lc, [0, 0, -lc * 0.4], [1, 1, 1], 1));
  else if (q.forma === "cuerda") {
    cola.add(girar(capsula(q.color, 0.028, lc, [0, -lc * 0.45, -lc * 0.2]), 0.4));
    cola.add(esfera(q.punta ?? q.color, 0.06, [0, -lc * 0.95, -lc * 0.42], [0.8, 1.3, 0.8], 1));
  } else if (q.forma === "mechon") {
    cola.add(girar(esfera(q.color, 1, [0, -lc * 0.45, -lc * 0.22], [0.09, lc * 0.6, 0.1], 1), 0.45));
    cola.add(girar(esfera(q.color, 1, [0, -lc * 0.8, -lc * 0.3], [0.07, lc * 0.35, 0.08], 1), 0.2));
  } else if (q.forma === "rizo") cola.add(girar(toro(q.color, 0.07, 0.022, [0, 0.03, -0.06], Math.PI * 1.6), 0, Math.PI / 2, 0));
  else if (q.forma === "zorro") {
    cola.add(girar(esfera(q.color, 1, [0, lc * 0.2, -lc * 0.55], [0.13, 0.14, lc * 0.6], 1), -0.5));
    cola.add(esfera(q.punta ?? "#ffffff", 0.1, [0, lc * 0.5, -lc * 1.0], [1, 1, 1.1], 1));
  } else {
    cola.add(girar(esfera(q.color, 1, [0, lc * 0.3, -lc * 0.3], [0.06, lc * 0.6, 0.05], 1), -0.6));
    if (q.punta) cola.add(girar(esfera(q.punta, 1, [0, lc * 0.22, -lc * 0.38], [0.045, lc * 0.5, 0.03], 1), -0.6));
  }
  cuerpo.add(cola);

  const partes: PartesCuad = { cuerpo, cuello, cabeza, cola, patas, cy, cz };
  d.extras?.(partes, d);
  fusionarEsqueleto(raiz);
  raiz.scale.setScalar(d.esc);

  const des = azar(id.length * 3.7 + id.charCodeAt(0) + id.charCodeAt(1)) * 6.28;
  const e = { camina: 0, feliz: 0, fase: des, salto: 0, tParpadeo: 1 + azar(des) * 3, pasto: 0, tPasto: 4 + azar(des + 1) * 6 };
  const zancada = 5.2 / d.esc / Math.max(0.4, d.patas.largo * 2.2);
  const animal: Animal = {
    tipo: "animal", id, raiz, velocidad: 0, rumbo: 0, contento: false, nadando: false, ranuraCabeza: ranura,
    alto: (yC + d.alto * 0.4 + d.cuello.largo * Math.cos(d.cuello.ang) + c.r * 1.5) * d.esc,
    saltar() { e.salto = 1; },
    actualizar(dt, t) {
      e.camina = suave(e.camina, animal.velocidad > 0.03 ? 1 : 0, dt, 8);
      e.feliz = suave(e.feliz, animal.contento ? 1 : 0, dt, 8);
      e.fase += animal.velocidad * zancada * dt;
      const w = e.camina, s = Math.sin(e.fase), f = e.feliz;
      raiz.rotation.y = suaveAngulo(raiz.rotation.y, animal.rumbo, dt, 7);
      const resp = Math.sin(t * 2.4 + des);
      let y = yC, estira = 1 + resp * 0.012;
      if (d.salta) {
        // A saltitos: un arco por cada paso, con las patas recogidas en el aire.
        const arco = Math.abs(Math.sin(e.fase * 0.5));
        y += w * arco * 0.3;
        estira += w * (arco - 0.4) * 0.12;
        patas.forEach((p, i) => { p.rotation.x = w * (i < 2 ? -0.5 : 0.7) * arco; });
      } else {
        y += w * Math.abs(s) * 0.035;
        patas.forEach((p, i) => { p.rotation.x = w * 0.55 * s * (i === 0 || i === 3 ? 1 : -1); });
      }
      const brinco = Math.abs(Math.sin(t * 8 + des));
      if (f > 0.01) {
        y += f * brinco * 0.28;
        estira += f * (brinco - 0.5) * 0.1;
      }
      if (e.salto > 0) {
        e.salto = Math.max(0, e.salto - dt / 0.45);
        const u = 1 - e.salto, arco = Math.sin(u * Math.PI);
        y += arco * 0.35;
        estira += u < 0.15 ? -0.12 * (1 - u / 0.15) : u > 0.85 ? -0.12 * ((u - 0.85) / 0.15) : 0.06 * arco;
      }
      cuerpo.position.y = y;
      cuerpo.scale.set(1 / Math.sqrt(estira), estira, 1 / Math.sqrt(estira));
      cuerpo.rotation.z = w * s * 0.035;
      // Pastar: de vez en cuando baja la cabeza un rato (solo quieto).
      if (d.pasta) {
        e.tPasto -= dt;
        const quiere = e.tPasto < 0 && e.tPasto > -3.2 && w < 0.2 && f < 0.2;
        if (e.tPasto < -3.2) e.tPasto = 5 + Math.random() * 7;
        e.pasto = suave(e.pasto, quiere ? 1 : 0, dt, 4);
      }
      const g = e.pasto;
      cuello.rotation.x = d.cuello.ang + g * (1.25 - d.cuello.ang * 0.5) + w * Math.sin(e.fase * 2) * 0.05;
      cabeza.rotation.set(-d.cuello.ang - g * 0.25 + g * Math.sin(t * 9) * 0.05, Math.sin(t * 0.7 + des) * 0.28 * (1 - w) * (1 - g), f * Math.sin(t * 10) * 0.12);
      cola.rotation.set(d.cola.forma === "zorro" ? Math.sin(t * 1.3 + des) * 0.12 : 0, Math.sin(t * (2.2 + w * 4 + f * 12) + des) * (0.3 + f * 0.5 + w * 0.15), 0);
      e.tParpadeo -= dt;
      if (e.tParpadeo < -0.12) e.tParpadeo = 2 + Math.random() * 3.5;
      ojosP.scale.y = e.tParpadeo < 0 ? 0.12 : 1;
    },
  };
  return animal;
}

// ---------- Manchas, lana y otros detalles ----------

/** Mancha aplastada sobre el cuerpo (vaca, panda, cervatillo). */
const mancha = (p: THREE.Group, color: string, pos: V3, r: number, esc: V3 = [1, 0.45, 1]) => p.add(esfera(color, r, pos, esc, 1));

const DEFS: Record<string, DefCuad> = {
  vaca: {
    esc: 1.05, largo: 1.5, alto: 0.86, ancho: 0.82, color: "#FAFAFA", pasta: true,
    patas: { largo: 0.5, r: 0.09, color: "#FAFAFA", pezuna: "#3E2723", sep: 0.24, zDel: 0.45, zTras: -0.45 },
    cuello: { largo: 0.2, r: 0.2, ang: 0.75 },
    cabeza: { r: 0.3, esc: [0.95, 0.95, 1.05], color: "#FAFAFA" },
    hocico: { r: 0.2, esc: [1.1, 0.75, 0.8], color: "#F8BBD0", z: 0.26, y: -0.12 },
    orejas: { forma: "hoja", color: "#FAFAFA", dentro: "#F8BBD0", tam: 0.16, sep: 0.24, y: 0.14, z: -0.08 },
    ojos: { sep: 0.13, y: 0.06, z: 0.24, r: 0.045 },
    cola: { forma: "cuerda", color: "#FAFAFA", punta: "#263238", largo: 0.5 },
    extras: (p, d) => {
      const n = "#263238";
      mancha(p.cuerpo, n, [0.2, d.alto * 0.34, 0.25], 0.26);
      mancha(p.cuerpo, n, [-0.26, d.alto * 0.24, -0.2], 0.24, [0.5, 0.9, 1]);
      mancha(p.cuerpo, n, [0.1, d.alto * 0.38, -0.42], 0.2);
      mancha(p.cuerpo, n, [-0.12, d.alto * 0.38, 0.5], 0.14);
      mancha(p.cabeza, n, [0.14, p.cy + 0.16, p.cz + 0.08], 0.14, [0.8, 0.8, 0.8]);
      p.cuerpo.add(esfera("#F8BBD0", 0.15, [0, -d.alto * 0.44, -0.3], [1, 0.7, 1], 1));
      for (const l of [-1, 1]) p.cabeza.add(girar(cono("#D7CCC8", 0.045, 0.16, [l * 0.14, p.cy + 0.3, p.cz - 0.04], 8), 0, 0, -l * 0.5));
      for (const l of [-1, 1]) p.cabeza.add(esfera("#AD1457", 0.022, [l * 0.07, p.cy - 0.1, p.cz + 0.42], [1, 1, 0.6], 0));
    },
  },
  oveja: {
    esc: 0.92, largo: 1.15, alto: 0.8, ancho: 0.8, color: "#F5F5F5", pasta: true,
    patas: { largo: 0.42, r: 0.065, color: "#424242", sep: 0.2, zDel: 0.3, zTras: -0.3 },
    cuello: { largo: 0.12, r: 0.16, ang: 0.8, color: "#F5F5F5" },
    cabeza: { r: 0.22, esc: [0.9, 1, 1.15], color: "#424242" },
    orejas: { forma: "caida", color: "#303030", tam: 0.13, sep: 0.19, y: 0.1 },
    ojos: { sep: 0.1, y: 0.06, z: 0.2, r: 0.04 },
    cola: { forma: "pompon", color: "#F5F5F5", largo: 0.13 },
    extras: (p, d) => {
      // Lana: bolitas alrededor del cuerpo y un copete en la cabeza.
      for (let i = 0; i < 22; i++) {
        const a = i * 2.4, v = ((i * 0.618) % 1) * 2 - 1, r = Math.sqrt(1 - v * v * 0.8);
        p.cuerpo.add(esfera("#FAFAFA", 0.2 + azar(i) * 0.06, [Math.cos(a) * r * d.ancho * 0.42, Math.sin(a) * r * d.alto * 0.36 + 0.03, v * d.largo * 0.42], [1, 1, 1], 1));
      }
      for (const x of [-0.08, 0.08, 0]) p.cabeza.add(esfera("#FAFAFA", 0.1, [x, p.cy + 0.2, p.cz - 0.02 + Math.abs(x)], [1, 1, 1], 1));
    },
  },
  caballo: {
    esc: 1.12, largo: 1.45, alto: 0.74, ancho: 0.66, color: "#8D5524", pasta: true,
    patas: { largo: 0.72, r: 0.075, color: "#6D3F1A", pezuna: "#2B1D16", sep: 0.2, zDel: 0.46, zTras: -0.46 },
    cuello: { largo: 0.5, r: 0.17, ang: 0.6 },
    cabeza: { r: 0.22, esc: [0.85, 0.9, 1.25], color: "#8D5524" },
    hocico: { r: 0.16, esc: [0.95, 0.85, 1.1], color: "#6D3F1A", z: 0.3, y: -0.08 },
    orejas: { forma: "punta", color: "#6D3F1A", tam: 0.14, sep: 0.11, y: 0.22, z: -0.06 },
    ojos: { sep: 0.12, y: 0.06, z: 0.16, r: 0.04 },
    cola: { forma: "mechon", color: "#3E2723", largo: 0.7 },
    extras: (p, d) => {
      for (let i = 0; i < 6; i++) p.cuello.add(esfera("#3E2723", 0.085, [0, 0.02 + i * 0.1, -d.cuello.r * 0.82], [0.7, 1, 1], 0));
      p.cabeza.add(esfera("#3E2723", 0.09, [0, p.cy + 0.2, p.cz + 0.02], [0.8, 0.8, 1.3], 0));
      p.cabeza.add(esfera("#FAFAFA", 0.05, [0, p.cy + 0.06, p.cz + 0.25], [0.8, 1.6, 0.4], 0));
    },
  },
  cerdo: {
    esc: 0.9, largo: 1.15, alto: 0.74, ancho: 0.74, color: "#F8BBD0",
    patas: { largo: 0.3, r: 0.075, color: "#F48FB1", pezuna: "#AD1457", sep: 0.2, zDel: 0.32, zTras: -0.32 },
    cuello: { largo: 0.02, r: 0.2, ang: 1.1 },
    cabeza: { r: 0.3, esc: [1, 0.95, 0.95], color: "#F8BBD0" },
    hocico: { r: 0.13, esc: [1.15, 0.9, 0.7], color: "#F48FB1", z: 0.3, y: -0.06 },
    orejas: { forma: "hoja", color: "#F48FB1", tam: 0.15, sep: 0.15, y: 0.2, z: 0 },
    ojos: { sep: 0.13, y: 0.08, z: 0.25, r: 0.04 },
    cola: { forma: "rizo", color: "#F48FB1" },
    extras: (p) => { for (const l of [-1, 1]) p.cabeza.add(esfera("#AD1457", 0.024, [l * 0.05, p.cy - 0.06, p.cz + 0.4], [1, 1.3, 0.5], 0)); },
  },
  gato: {
    esc: 0.62, largo: 1.0, alto: 0.56, ancho: 0.52, color: "#FB8C00", panza: "#FFE0B2",
    patas: { largo: 0.36, r: 0.07, color: "#FB8C00", sep: 0.15, zDel: 0.3, zTras: -0.3 },
    cuello: { largo: 0.06, r: 0.14, ang: 0.5 },
    cabeza: { r: 0.3, esc: [1.05, 0.92, 0.92], color: "#FB8C00" },
    hocico: { r: 0.12, esc: [1.2, 0.75, 0.6], color: "#FFF3E0", z: 0.24, y: -0.08, nariz: "#F06292", rNariz: 0.03 },
    orejas: { forma: "punta", color: "#FB8C00", dentro: "#F8BBD0", tam: 0.18, sep: 0.17, y: 0.26, z: -0.04 },
    ojos: { sep: 0.12, y: 0.04, z: 0.25, r: 0.055 },
    cola: { forma: "zorro", color: "#FB8C00", punta: "#E65100", largo: 0.5 },
    extras: (p, d) => { for (const z of [-0.25, 0, 0.25]) p.cuerpo.add(esfera("#E65100", 1, [0, d.alto * 0.36, z], [d.ancho * 0.36, 0.06, 0.05], 0)); },
  },
  perro: {
    esc: 0.72, largo: 1.05, alto: 0.6, ancho: 0.56, color: "#C8936A", panza: "#F5E6D3",
    patas: { largo: 0.4, r: 0.075, color: "#C8936A", sep: 0.16, zDel: 0.32, zTras: -0.32 },
    cuello: { largo: 0.1, r: 0.16, ang: 0.45 },
    cabeza: { r: 0.3, esc: [1, 0.95, 0.95], color: "#C8936A" },
    hocico: { r: 0.15, esc: [1.05, 0.8, 0.95], color: "#F5E6D3", z: 0.26, y: -0.08, nariz: "#2B1D16", rNariz: 0.045 },
    orejas: { forma: "caida", color: "#8D5524", tam: 0.2, sep: 0.26, y: 0.16 },
    ojos: { sep: 0.12, y: 0.06, z: 0.25, r: 0.05 },
    cola: { forma: "corta", color: "#C8936A", largo: 0.3 },
    extras: (p) => mancha(p.cabeza, "#8D5524", [0.13, p.cy + 0.08, p.cz + 0.2], 0.1, [1, 1.1, 0.5]),
  },
  oso: {
    esc: 1.0, largo: 1.25, alto: 0.92, ancho: 0.9, color: "#8D6E63", panza: "#A1887F",
    patas: { largo: 0.4, r: 0.13, color: "#795548", sep: 0.26, zDel: 0.36, zTras: -0.36 },
    cuello: { largo: 0.06, r: 0.26, ang: 0.6 },
    cabeza: { r: 0.36, esc: [1.05, 0.95, 0.95], color: "#8D6E63" },
    hocico: { r: 0.17, esc: [1.1, 0.8, 0.85], color: "#D7CCC8", z: 0.3, y: -0.1, nariz: "#2B1D16", rNariz: 0.05 },
    orejas: { forma: "redonda", color: "#795548", dentro: "#D7CCC8", tam: 0.12, sep: 0.26, y: 0.3, z: -0.04 },
    ojos: { sep: 0.14, y: 0.06, z: 0.3, r: 0.045 },
    cola: { forma: "pompon", color: "#795548", largo: 0.1 },
  },
  panda: {
    esc: 0.95, largo: 1.2, alto: 0.92, ancho: 0.9, color: "#FAFAFA",
    patas: { largo: 0.38, r: 0.13, color: "#212121", sep: 0.26, zDel: 0.36, zTras: -0.36 },
    cuello: { largo: 0.06, r: 0.26, ang: 0.6 },
    cabeza: { r: 0.36, esc: [1.08, 0.95, 0.95], color: "#FAFAFA" },
    hocico: { r: 0.15, esc: [1.1, 0.8, 0.8], color: "#FAFAFA", z: 0.3, y: -0.1, nariz: "#212121", rNariz: 0.045 },
    orejas: { forma: "redonda", color: "#212121", tam: 0.12, sep: 0.27, y: 0.3, z: -0.04 },
    ojos: { sep: 0.15, y: 0.05, z: 0.31, r: 0.04 },
    cola: { forma: "pompon", color: "#FAFAFA", largo: 0.1 },
    extras: (p, d) => {
      for (const l of [-1, 1]) p.cabeza.add(girar(esfera("#212121", 0.1, [l * 0.15, p.cy + 0.04, p.cz + 0.27], [0.85, 1.15, 0.4], 1), 0, 0, l * 0.4));
      p.cuerpo.add(esfera("#212121", 1, [0, 0.02, d.largo * 0.3], [d.ancho * 0.51, d.alto * 0.5, d.largo * 0.16], 1));
    },
  },
  zorro: {
    esc: 0.74, largo: 1.05, alto: 0.56, ancho: 0.5, color: "#EF6C00", panza: "#FFF3E0",
    patas: { largo: 0.4, r: 0.065, color: "#4E342E", sep: 0.14, zDel: 0.32, zTras: -0.32 },
    cuello: { largo: 0.1, r: 0.14, ang: 0.5 },
    cabeza: { r: 0.28, esc: [1.05, 0.9, 0.95], color: "#EF6C00" },
    hocico: { r: 0.14, esc: [0.9, 0.7, 1.25], color: "#FFF3E0", z: 0.26, y: -0.08, nariz: "#2B1D16", rNariz: 0.04 },
    orejas: { forma: "punta", color: "#4E342E", dentro: "#FFE0B2", tam: 0.2, sep: 0.16, y: 0.24, z: -0.04 },
    ojos: { sep: 0.12, y: 0.05, z: 0.23, r: 0.045 },
    cola: { forma: "zorro", color: "#EF6C00", punta: "#FFFFFF", largo: 0.6 },
  },
  llama: {
    esc: 1.0, largo: 1.15, alto: 0.74, ancho: 0.66, color: "#EFE3D0", pasta: true,
    patas: { largo: 0.66, r: 0.07, color: "#D7C4A5", pezuna: "#5D4037", sep: 0.18, zDel: 0.34, zTras: -0.34 },
    cuello: { largo: 0.72, r: 0.15, ang: 0.16 },
    cabeza: { r: 0.2, esc: [0.9, 0.95, 1.15], color: "#EFE3D0" },
    hocico: { r: 0.12, esc: [1, 0.85, 1], color: "#D7C4A5", z: 0.2, y: -0.06, nariz: "#5D4037", rNariz: 0.03 },
    orejas: { forma: "punta", color: "#D7C4A5", tam: 0.16, sep: 0.1, y: 0.2, z: -0.06 },
    ojos: { sep: 0.1, y: 0.05, z: 0.15, r: 0.04 },
    cola: { forma: "pompon", color: "#EFE3D0", largo: 0.11 },
    extras: (p, d) => {
      // Manta de colores sobre el lomo y un copete de lana.
      p.cuerpo.add(esfera("#E53935", 1, [0, d.alto * 0.1, 0], [d.ancho * 0.53, d.alto * 0.46, d.largo * 0.24], 1));
      for (const z of [-0.14, 0.14]) p.cuerpo.add(esfera("#FDD835", 1, [0, d.alto * 0.12, z], [d.ancho * 0.54, d.alto * 0.45, 0.035], 1));
      p.cabeza.add(esfera("#FAFAFA", 0.1, [0, p.cy + 0.2, p.cz - 0.02], [1, 0.9, 1], 1));
    },
  },
  conejo: {
    esc: 0.6, largo: 0.8, alto: 0.62, ancho: 0.56, color: "#A1887F", panza: "#EFEBE9", salta: true,
    patas: { largo: 0.2, r: 0.075, color: "#8D6E63", sep: 0.16, zDel: 0.24, zTras: -0.22 },
    cuello: { largo: 0.04, r: 0.16, ang: 0.35 },
    cabeza: { r: 0.3, esc: [1, 0.95, 0.95], color: "#A1887F" },
    hocico: { r: 0.12, esc: [1.2, 0.75, 0.6], color: "#EFEBE9", z: 0.25, y: -0.08, nariz: "#EC407A", rNariz: 0.03 },
    orejas: { forma: "larga", color: "#A1887F", dentro: "#F8BBD0", tam: 0.3, sep: 0.1, y: 0.16, z: -0.06 },
    ojos: { sep: 0.13, y: 0.05, z: 0.25, r: 0.055 },
    cola: { forma: "pompon", color: "#FAFAFA", largo: 0.11 },
  },
  rana: {
    esc: 0.55, largo: 0.75, alto: 0.5, ancho: 0.72, color: "#66BB6A", panza: "#C5E1A5", salta: true,
    patas: { largo: 0.16, r: 0.09, color: "#43A047", sep: 0.3, zDel: 0.22, zTras: -0.2 },
    cuello: { largo: 0.0, r: 0.2, ang: 0.2 },
    cabeza: { r: 0.3, esc: [1.2, 0.8, 0.9], color: "#66BB6A" },
    orejas: { forma: "redonda", color: "#66BB6A", tam: 0.11, sep: 0.17, y: 0.22, z: 0.02 },
    ojos: { sep: 0.17, y: 0.24, z: 0.1, r: 0.06 },
    cola: { forma: "pompon", color: "#66BB6A", largo: 0.01 },
    extras: (p) => {
      p.cabeza.add(girar(toro("#2E7D32", 0.16, 0.014, [0, p.cy - 0.02, p.cz + 0.1], Math.PI), Math.PI / 2 + 0.25, 0, Math.PI));
      for (const l of [-1, 1]) p.cuerpo.add(esfera("#43A047", 0.16, [l * 0.3, -0.12, -0.22], [0.7, 0.6, 1.3], 1));
    },
  },
  // Tito, el pudú: el ciervo más pequeño del mundo, con manchitas y cuernitos.
  pudu: {
    esc: 0.62, largo: 1.0, alto: 0.6, ancho: 0.54, color: "#A1673F", panza: "#D9AE85", pasta: true,
    patas: { largo: 0.4, r: 0.06, color: "#6D4C41", pezuna: "#2B1F1A", sep: 0.15, zDel: 0.3, zTras: -0.3 },
    cuello: { largo: 0.16, r: 0.14, ang: 0.42 },
    cabeza: { r: 0.3, esc: [1, 0.95, 0.98], color: "#A1673F" },
    hocico: { r: 0.15, esc: [1, 0.78, 1.0], color: "#D2A07A", z: 0.26, y: -0.08, nariz: "#3E2723", rNariz: 0.05 },
    orejas: { forma: "hoja", color: "#8D5524", dentro: "#E8B996", tam: 0.2, sep: 0.16, y: 0.2, z: -0.06 },
    ojos: { sep: 0.13, y: 0.06, z: 0.25, r: 0.062 },
    cola: { forma: "corta", color: "#8D5524", punta: "#F5E6D3", largo: 0.2 },
    extras: (p, d) => {
      ([[0.1, 0.26], [-0.12, 0.1], [0.14, -0.08], [-0.08, -0.26], [0.02, 0.0], [-0.16, -0.12]] as const).forEach(([x, z]) =>
        p.cuerpo.add(esfera("#F0DCC2", 0.045, [x, Math.sqrt(Math.max(0.02, 1 - (x / (d.ancho / 2)) ** 2 - (z / (d.largo / 2)) ** 2)) * d.alto * 0.5, z], [1, 0.4, 1], 0)));
      for (const l of [-1, 1]) p.cabeza.add(girar(cono("#4E342E", 0.03, 0.14, [l * 0.07, p.cy + 0.32, p.cz - 0.02], 8), 0, 0, -l * 0.2));
    },
  },
};

// ---------- Aves ----------

function crearAve(id: "gallina" | "pato"): Animal {
  const pato = id === "pato";
  const col = pato ? "#FAFAFA" : "#D7A26A", colAla = pato ? "#ECEFF1" : "#B9844A", naranja = pato ? "#FB8C00" : "#FB8C00";
  const raiz = new THREE.Group();
  const yC = 0.44;
  const cuerpo = pivote([0, yC, 0]);
  raiz.add(cuerpo);
  cuerpo.add(esfera(col, 1, [0, 0, 0], [0.27, 0.27, 0.36], 2));
  cuerpo.add(esfera(pato ? "#FFFFFF" : "#E6BE8A", 1, [0, -0.06, 0.04], [0.23, 0.22, 0.3], 1));
  if (pato) cuerpo.add(girar(cono(col, 0.1, 0.22, [0, 0.1, -0.36], 10), -0.9));
  else for (const [x, a] of [[-0.07, -0.25], [0, 0], [0.07, 0.25]] as const) cuerpo.add(girar(esfera("#8D6E63", 1, [x, 0.2, -0.3], [0.05, 0.2, 0.09], 1), -0.7, 0, -a));
  const alas = [-1, 1].map((l) => {
    const a = pivote([l * 0.25, 0.08, 0.04]);
    a.add(esfera(colAla, 1, [l * 0.02, -0.1, -0.06], [0.06, 0.18, 0.26], 1));
    cuerpo.add(a);
    return a;
  });
  const patas = [-1, 1].map((l) => {
    const p = pivote([l * 0.11, -0.2, 0]);
    p.add(cilindro(naranja, 0.022, 0.022, 0.24, [0, -0.12, 0], 8));
    p.add(esfera(naranja, 1, [0, -0.235, 0.05], [0.07, 0.016, 0.1], 0));
    cuerpo.add(p);
    return p;
  });
  const cuello = pivote([0, 0.14, 0.24]);
  cuello.rotation.x = 0.3;
  cuello.add(capsula(col, 0.1, 0.16, [0, 0.1, 0]));
  const cabeza = pivote([0, 0.24, 0]);
  cabeza.rotation.x = -0.3;
  cabeza.add(esfera(col, 0.16, [0, 0.04, 0.02], [1, 1, 1], 2));
  if (pato) cabeza.add(esfera(naranja, 1, [0, 0, 0.2], [0.085, 0.03, 0.12], 1));
  else {
    cabeza.add(girar(cono("#FFB300", 0.05, 0.13, [0, 0.02, 0.2], 10), Math.PI / 2));
    for (const [z, r] of [[-0.06, 0.05], [0.01, 0.06], [0.08, 0.05]] as const) cabeza.add(esfera("#E53935", r, [0, 0.2, z], [0.6, 1, 1], 0));
    cabeza.add(esfera("#E53935", 0.04, [0, -0.07, 0.15], [0.7, 1.3, 0.7], 0));
  }
  const ojosP = ojos(0.1, 0.07, 0.1, 0.033);
  cabeza.add(ojosP);
  cuello.add(cabeza);
  cuerpo.add(cuello);
  fusionarEsqueleto(raiz);
  const esc = pato ? 0.85 : 0.8;
  raiz.scale.setScalar(esc);

  const des = pato ? 1.3 : 4.1;
  const e = { camina: 0, feliz: 0, nada: 0, fase: des, salto: 0, tParpadeo: 2, tPico: 3 + Math.random() * 3 };
  const animal: Animal = {
    tipo: "animal", id, raiz, alto: 0.95 * esc, velocidad: 0, rumbo: 0, contento: false, nadando: false,
    saltar() { e.salto = 1; },
    actualizar(dt, t) {
      e.camina = suave(e.camina, animal.velocidad > 0.03 ? 1 : 0, dt, 8);
      e.feliz = suave(e.feliz, animal.contento ? 1 : 0, dt, 8);
      e.nada = suave(e.nada, animal.nadando ? 1 : 0, dt, 5);
      e.fase += animal.velocidad * 12 * dt;
      const w = e.camina * (1 - e.nada), s = Math.sin(e.fase), f = e.feliz, n = e.nada;
      raiz.rotation.y = suaveAngulo(raiz.rotation.y, animal.rumbo, dt, 7);
      const brinco = Math.abs(Math.sin(t * 9));
      let y = yC + w * Math.abs(s) * 0.03 + f * brinco * 0.22 - n * 0.2 + n * Math.sin(t * 1.8 + des) * 0.02;
      if (e.salto > 0) {
        e.salto = Math.max(0, e.salto - dt / 0.4);
        y += Math.sin((1 - e.salto) * Math.PI) * 0.3;
      }
      cuerpo.position.y = y;
      cuerpo.rotation.set(n * Math.sin(t * 1.8 + des) * 0.04, 0, w * s * 0.1 + n * Math.sin(t * 1.3) * 0.03);
      patas.forEach((p, i) => {
        p.rotation.x = w * 0.7 * s * (i ? -1 : 1);
        p.visible = n < 0.6;
      });
      alas.forEach((a, i) => { a.rotation.z = (i ? 1 : -1) * (f * (0.7 + Math.sin(t * 26) * 0.6) + Math.max(0, Math.sin(t * 0.5 + des) - 0.95) * 6); });
      // La gallina picotea el suelo dos veces seguidas; el pato solo mira.
      let pico = 0;
      if (!pato && w < 0.2 && f < 0.2) {
        e.tPico -= dt;
        if (e.tPico < 0) {
          const u = -e.tPico;
          pico = u < 0.7 ? Math.abs(Math.sin(u * Math.PI / 0.35)) : 0;
          if (u > 0.7) e.tPico = 2.5 + Math.random() * 3.5;
        }
      }
      cuello.rotation.x = 0.3 + pico * 1.2 + w * Math.sin(e.fase) * 0.22;
      cabeza.rotation.set(-0.3 - w * Math.sin(e.fase) * 0.2 + pico * 0.2, Math.sin(t * 0.8 + des) * 0.3 * (1 - w) * (1 - pico), 0);
      e.tParpadeo -= dt;
      if (e.tParpadeo < -0.12) e.tParpadeo = 2 + Math.random() * 3;
      ojosP.scale.y = e.tParpadeo < 0 ? 0.12 : 1;
    },
  };
  return animal;
}

/** Pájaro que vuela aleteando (el motor lo lleva por su recorrido). */
function crearPajaro(): Animal {
  const raiz = new THREE.Group();
  const cuerpo = pivote();
  raiz.add(cuerpo);
  cuerpo.add(esfera("#546E7A", 1, [0, 0, 0], [0.11, 0.1, 0.2], 1));
  cuerpo.add(esfera("#FFAB91", 1, [0, -0.03, 0.03], [0.09, 0.07, 0.14], 1));
  cuerpo.add(esfera("#546E7A", 0.085, [0, 0.05, 0.19], [1, 1, 1], 1));
  cuerpo.add(girar(cono("#FFB300", 0.03, 0.08, [0, 0.04, 0.29], 8), Math.PI / 2));
  cuerpo.add(girar(esfera("#37474F", 1, [0, 0.02, -0.24], [0.06, 0.015, 0.12], 0), 0.2));
  for (const l of [-1, 1]) cuerpo.add(esfera(OJO(), 0.02, [l * 0.055, 0.075, 0.23], [1, 1, 1], 0));
  const alas = [-1, 1].map((l) => {
    const a = pivote([l * 0.07, 0.04, 0]);
    a.add(esfera("#37474F", 1, [l * 0.15, 0, -0.02], [0.17, 0.014, 0.1], 1));
    cuerpo.add(a);
    return a;
  });
  fusionarEsqueleto(raiz);
  const animal: Animal = {
    tipo: "animal", id: "pajaro", raiz, alto: 0.3, velocidad: 0, rumbo: 0, contento: false, nadando: false,
    saltar() { /* no salta: vuela */ },
    actualizar(dt, t) {
      raiz.rotation.y = suaveAngulo(raiz.rotation.y, animal.rumbo, dt, 5);
      const aleteo = Math.sin(t * 16);
      alas.forEach((a, i) => { a.rotation.z = (i ? 1 : -1) * (0.15 + aleteo * 0.75); });
      cuerpo.position.y = Math.sin(t * 16 + 1.5) * 0.03;
      cuerpo.rotation.x = -0.08;
    },
  };
  return animal;
}

/** Mariposa: revolotea abriendo y cerrando las alas. */
function crearMariposa(colorArriba = "#BA68C8", colorAbajo = "#F06292"): Animal {
  const raiz = new THREE.Group();
  const cuerpo = pivote();
  raiz.add(cuerpo);
  cuerpo.add(girar(capsula("#4A148C", 0.02, 0.14, [0, 0, 0]), Math.PI / 2));
  for (const l of [-1, 1]) cuerpo.add(girar(cilindro("#4A148C", 0.004, 0.004, 0.09, [l * 0.02, 0.03, 0.12], 5), 0.9, 0, -l * 0.3));
  const alas = [-1, 1].map((l) => {
    const a = pivote([l * 0.012, 0, 0]);
    a.add(esfera(colorArriba, 1, [l * 0.1, 0, 0.05], [0.1, 0.008, 0.09], 1));
    a.add(esfera(colorAbajo, 1, [l * 0.08, 0, -0.07], [0.075, 0.008, 0.065], 1));
    a.add(esfera("#FFF59D", 1, [l * 0.11, 0.006, 0.05], [0.03, 0.006, 0.03], 0));
    cuerpo.add(a);
    return a;
  });
  fusionarEsqueleto(raiz);
  const des = Math.random() * 6;
  const animal: Animal = {
    tipo: "animal", id: "mariposa", raiz, alto: 0.2, velocidad: 0, rumbo: 0, contento: false, nadando: false,
    saltar() { /* vuela */ },
    actualizar(dt, t) {
      raiz.rotation.y = suaveAngulo(raiz.rotation.y, animal.rumbo, dt, 4);
      const aleteo = Math.abs(Math.sin(t * 9 + des));
      alas.forEach((a, i) => { a.rotation.z = (i ? 1 : -1) * (0.15 + aleteo * 1.15); });
      cuerpo.position.y = Math.sin(t * 9 + des) * 0.025;
    },
  };
  return animal;
}

/** Crea cualquier animal por su nombre. */
export function crearAnimal(id: AnimalId3D): Animal {
  if (id === "gallina" || id === "pato") return crearAve(id);
  if (id === "pajaro") return crearPajaro();
  if (id === "mariposa") return crearMariposa();
  return crearCuadrupedo(id, DEFS[id]!);
}

export const ANIMALES_3D: AnimalId3D[] = ["vaca", "oveja", "caballo", "cerdo", "gato", "perro", "oso", "panda", "zorro", "llama", "conejo", "rana", "gallina", "pato", "mariposa", "pajaro", "pudu"];

/**
 * Hace pasear a un animal cerca de su lugar: camina a un punto, se detiene a
 * mirar (o a pastar) y elige otro. Devuelve la función que lo mueve cada cuadro.
 */
export function crearPaseo(a: Animal, hogar: { x: number; z: number }, radio: number, o: { vel?: number; libre?: (x: number, z: number) => boolean } = {}) {
  let objetivo = { x: a.raiz.position.x, z: a.raiz.position.z };
  let espera = 0.5 + Math.random() * 3;
  const vel = o.vel ?? 0.7;
  return (dt: number) => {
    if (a.contento) {
      a.velocidad = 0;
      return;
    }
    const dx = objetivo.x - a.raiz.position.x, dz = objetivo.z - a.raiz.position.z, dist = Math.hypot(dx, dz);
    if (dist < 0.06) {
      a.velocidad = 0;
      espera -= dt;
      if (espera <= 0) {
        for (let i = 0; i < 6; i++) {
          const ang = Math.random() * 6.28, r = radio * (0.3 + Math.random() * 0.7);
          const x = hogar.x + Math.cos(ang) * r, z = hogar.z + Math.sin(ang) * r;
          if (!o.libre || o.libre(x, z)) {
            objetivo = { x, z };
            break;
          }
        }
        espera = 2.5 + Math.random() * 5;
      }
      return;
    }
    a.rumbo = Math.atan2(dx, dz);
    a.velocidad = vel;
    const paso = Math.min(dist, vel * dt);
    a.raiz.position.x += (dx / dist) * paso;
    a.raiz.position.z += (dz / dist) * paso;
  };
}

/** Recorrido de vuelo en círculos suaves (mariposas y pájaros). */
export function crearVuelo(a: Animal, centro: { x: number; y: number; z: number }, radio: number, rapidez = 0.5, fase = Math.random() * 6) {
  return (_dt: number, t: number) => {
    const u = t * rapidez + fase;
    const x = centro.x + Math.sin(u) * radio, z = centro.z + Math.sin(u * 2) * radio * 0.45;
    const dx = Math.cos(u) * radio, dz = Math.cos(u * 2) * radio * 0.9;
    a.raiz.position.set(x, centro.y + Math.sin(u * 3.1) * radio * 0.18, z);
    a.rumbo = Math.atan2(dx, dz);
  };
}
