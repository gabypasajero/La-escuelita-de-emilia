import * as THREE from "three";
import type { Ranura } from "../juego";
import type { Animal } from "./animal";
import { caja, cilindro, cono, cupula, esfera, fusionar, girar, grupo, mat, prisma, puntosEstrella, toro } from "./base";
import { enCabeza, lentes3d, type Persona } from "./personaje";

/**
 * Los accesorios de la Tienda de disfraces, en 3D: se enganchan en la
 * cabeza, la cara, el cuello o la mano del personaje (y en la cabeza de
 * Tito). El globo flota derecho aunque el brazo se mueva.
 */

const DORADO = () => mat("#FDD835", { rug: 0.3, metal: 0.35 });

function corona(R: number): THREE.Group {
  const g = grupo();
  g.add(cilindro(DORADO(), R * 0.56, R * 0.6, R * 0.2, [0, 0, 0], 20));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    g.add(cono(DORADO(), R * 0.14, R * 0.34, [Math.sin(a) * R * 0.5, R * 0.24, Math.cos(a) * R * 0.5], 4));
    g.add(esfera(["#E53935", "#1E88E5", "#43A047", "#AB47BC", "#FB8C00"][i]!, R * 0.055, [Math.sin(a + 0.63) * R * 0.59, 0, Math.cos(a + 0.63) * R * 0.59], [1, 1, 0.6], 0));
  }
  return g;
}

function mono(R: number, color: string): THREE.Group {
  const g = grupo();
  for (const l of [-1, 1]) g.add(girar(esfera(color, 1, [l * R * 0.2, 0, 0], [R * 0.22, R * 0.15, R * 0.09], 1), 0, 0, l * 0.35));
  g.add(esfera(color, R * 0.09, [0, 0, R * 0.03], [1, 1, 1], 0));
  for (const l of [-1, 1]) g.add(girar(caja(color, R * 0.1, R * 0.26, R * 0.04, [l * R * 0.08, -R * 0.18, 0], 0.01), 0, 0, l * 0.3));
  return g;
}

/** Arma el accesorio para una persona (o `null` si no existe). */
function crear(id: string, p: Persona): THREE.Group | null {
  const R = p.medidas.R;
  const g = grupo();
  switch (id) {
    case "gorro":
      g.add(girar(cupula("#1E88E5", R * 1.09, [0, R * 0.08, 0], [1, 0.95, 1], 1.5), -0.25));
      g.add(girar(esfera("#1565C0", 1, [0, R * 0.42, R * 1.12], [R * 0.6, R * 0.06, R * 0.5], 1), 0.12));
      g.add(esfera("#1565C0", R * 0.08, [0, R * 1.11, -R * 0.26], [1, 0.6, 1], 0));
      break;
    case "mono": {
      const m = mono(R, "#EC407A");
      m.position.set(...enCabeza(R, 28, 66, 1.16));
      m.rotation.set(-0.3, 0.3, -0.25);
      g.add(m);
      break;
    }
    case "flores": {
      const aro = toro("#66BB6A", R * 0.8, R * 0.05, [0, R * 0.62, -R * 0.02]);
      g.add(aro);
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2, c = ["#F06292", "#FFF176", "#FFFFFF", "#BA68C8", "#FF8A65"][i % 5]!;
        const x = Math.sin(a) * R * 0.8, z = Math.cos(a) * R * 0.8 - R * 0.02;
        for (let k = 0; k < 5; k++) g.add(esfera(c, R * 0.065, [x + Math.cos(k * 1.257) * R * 0.07, R * 0.66, z + Math.sin(k * 1.257) * R * 0.07], [1, 0.6, 1], 0));
        g.add(esfera("#FFB300", R * 0.05, [x, R * 0.69, z], [1, 0.7, 1], 0));
      }
      g.rotation.x = -0.12;
      break;
    }
    case "sombrero":
      g.add(cilindro("#37474F", R * 1.02, R * 1.06, R * 0.07, [0, R * 0.74, 0], 28));
      g.add(cilindro("#455A64", R * 0.6, R * 0.64, R * 0.7, [0, R * 1.1, 0], 24));
      g.add(cilindro("#E53935", R * 0.655, R * 0.66, R * 0.14, [0, R * 0.86, 0], 24));
      g.rotation.set(-0.1, 0, 0.06);
      break;
    case "corona": {
      const c = corona(R);
      c.position.set(0, R * 0.9, 0);
      c.rotation.x = -0.08;
      g.add(c);
      break;
    }
    case "lentes": g.add(lentes3d(R, "#5D4037")); break;
    case "gafas": g.add(lentes3d(R, "#263238", true)); break;
    case "bufanda": {
      const a = toro("#E53935", R * 0.3, 0.075, [0, 0.02, 0]);
      a.scale.y = 0.85;
      g.add(a);
      g.add(girar(caja("#E53935", 0.13, 0.34, 0.05, [0.1, -0.16, R * 0.33], 0.02), 0.1, 0, -0.12));
      for (const y of [-0.24, -0.3]) g.add(girar(caja("#FDD835", 0.135, 0.022, 0.055, [0.1 - (y + 0.16) * 0.12, y, R * 0.33 - (y + 0.16) * 0.1], 0.005), 0.1, 0, -0.12));
      break;
    }
    case "medalla": {
      for (const l of [-1, 1]) g.add(girar(caja("#1E88E5", 0.05, 0.32, 0.02, [l * 0.07, -0.14, 0.14], 0.005), 0.5, 0, l * 0.42));
      g.add(girar(cilindro(DORADO(), 0.085, 0.085, 0.025, [0, -0.3, 0.215], 20), Math.PI / 2 - 0.25));
      g.add(prisma("#FFF59D", puntosEstrella(0.045), 0.01, [0, -0.3, 0.232], 0));
      break;
    }
    case "globo": {
      g.add(cilindro("#90A4AE", 0.006, 0.006, 0.8, [0, 0.4, 0], 5));
      g.add(esfera(mat("#E53935", { rug: 0.25 }), 1, [0, 1.02, 0], [0.24, 0.29, 0.24], 2));
      g.add(cono("#C62828", 0.035, 0.05, [0, 0.72, 0], 8));
      g.add(esfera(mat("#FFFFFF", { rug: 0.25 }), 1, [-0.08, 1.13, 0.17], [0.045, 0.07, 0.02], 0));
      fusionar(g);
      const q = new THREE.Quaternion();
      g.userData.animar = (t: number) => {
        // Siempre derecho hacia arriba, meciéndose un poco.
        g.parent!.getWorldQuaternion(q);
        g.quaternion.copy(q.invert());
        g.rotateZ(Math.sin(t * 1.3) * 0.1);
        g.rotateX(Math.sin(t * 0.9) * 0.07);
      };
      return g;
    }
    case "osito": {
      const c = "#A1673F", claro = "#D7A27A";
      g.add(esfera(c, 0.11, [0, -0.12, 0.02], [1, 1.1, 0.9], 1));
      g.add(esfera(claro, 0.07, [0, -0.13, 0.08], [1, 1.1, 0.6], 0));
      g.add(esfera(c, 0.095, [0, 0.04, 0.02], [1, 1, 1], 1));
      g.add(esfera(claro, 0.04, [0, 0.02, 0.1], [1, 0.8, 0.8], 0));
      g.add(esfera("#3E2723", 0.014, [0, 0.03, 0.135], [1, 1, 1], 0));
      for (const l of [-1, 1]) {
        g.add(esfera(c, 0.038, [l * 0.075, 0.115, 0.01], [1, 1, 0.6], 0));
        g.add(esfera("#2B2118", 0.013, [l * 0.035, 0.065, 0.105], [1, 1, 1], 0));
        g.add(esfera(c, 0.04, [l * 0.11, -0.08, 0.03], [0.8, 1.3, 0.8], 0));
        g.add(esfera(c, 0.045, [l * 0.06, -0.24, 0.04], [0.9, 1.1, 1.1], 0));
      }
      g.position.set(0.02, -0.1, 0.06);
      break;
    }
    case "varita": {
      g.add(girar(cilindro("#37474F", 0.016, 0.016, 0.5, [0, 0.2, 0.1], 8), 0.45));
      g.add(girar(cilindro("#FFFFFF", 0.018, 0.018, 0.07, [0, 0.39, 0.19], 8), 0.45));
      const e = prisma(DORADO(), puntosEstrella(0.11), 0.03, [0, 0.5, 0.25], 0.008);
      g.add(e);
      for (const [x, y, r] of [[-0.14, 0.62, 0.02], [0.15, 0.58, 0.016], [0.06, 0.7, 0.013]] as const) g.add(esfera("#FFF59D", r, [x, y, 0.25], [1, 1, 1], 0));
      break;
    }
    default: return null;
  }
  return fusionar(g);
}

const DONDE: Record<string, "cabeza" | "cuello" | "mano"> = {
  gorro: "cabeza", mono: "cabeza", flores: "cabeza", sombrero: "cabeza", corona: "cabeza", lentes: "cabeza", gafas: "cabeza",
  bufanda: "cuello", medalla: "cuello", globo: "mano", osito: "mano", varita: "mano",
};

/** Pone al personaje los accesorios que lleva puestos (y saca los demás). */
export function ponerAccesorios(p: Persona, puestos: Partial<Record<Ranura, string>>) {
  const r = p.partes.ranuras;
  const clave = [puestos.cabeza, puestos.cara, puestos.cuello, puestos.mano].join("|");
  if (r.cabeza.userData.clave === clave) return;
  r.cabeza.userData.clave = clave;
  for (const ranura of [r.cabeza, r.cuello, r.mano]) ranura.clear();
  for (const id of [puestos.cabeza, puestos.cara, puestos.cuello, puestos.mano]) {
    if (!id) continue;
    const a = crear(id, p);
    if (a) r[DONDE[id] ?? "cabeza"].add(a);
  }
}

/** Mueve los accesorios que se animan solos (el globo). */
export function animarAccesorios(p: Persona, t: number) {
  for (const a of p.partes.ranuras.mano.children) a.userData.animar?.(t);
}

/** El moño o la corona de Tito. */
export function ponerAccesorioTito(tito: Animal, id: string | undefined) {
  const r = tito.ranuraCabeza;
  if (!r || r.userData.clave === (id ?? "")) return;
  r.userData.clave = id ?? "";
  r.clear();
  if (id === "tito-corona") {
    const c = corona(0.34);
    c.position.y = 0.04;
    r.add(fusionar(grupo([c])));
  } else if (id === "tito-mono") {
    const m = mono(0.5, "#EC407A");
    m.position.set(0.08, 0.02, 0.06);
    m.rotation.set(-0.5, 0.2, -0.2);
    r.add(fusionar(grupo([m])));
  }
}

/** Solo para la tienda: el accesorio suelto, como objeto de vitrina. */
export function accesorioDeVitrina(id: string, p: Persona): THREE.Group | null {
  return crear(id, p);
}
