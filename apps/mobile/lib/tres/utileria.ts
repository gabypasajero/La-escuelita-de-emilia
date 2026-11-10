import * as THREE from "three";
import { aparte, azar, caja, capsula, cilindro, cono, cupula, disco, esfera, fusionar, girar, grupo, lienzo, mat, matTextura, plano, prisma, toro, type V3 } from "./base";

/**
 * Utilería del mundo 3D: las cosas con que se arman los escenarios (árboles,
 * arbustos, cercas, faroles, bancas, ventanas, puertas, carteles pintados…).
 * Todo redondeado y de colores suaves, como piezas de una casa de juguetes.
 */

/** Vidrio de ventana: de día refleja el cielo; de tarde y noche brilla con luz cálida. */
export const vidrio = (luces: boolean) => (luces ? mat("#FFE9A8", { emis: "#FFC44D", emisI: 1.15 }) : mat("#BFE3FA", { rug: 0.12 }));

/** Ventana con marco, cruz y alféizar, mirando a +Z. */
export function ventana(w: number, h: number, pos: V3, luces: boolean, marco = "#FFFFFF"): THREE.Group {
  const g = grupo([], pos);
  g.add(caja(marco, w + 0.22, h + 0.22, 0.12, [0, 0, 0], 0.05));
  g.add(aparte(caja(vidrio(luces), w, h, 0.06, [0, 0, 0.05], 0.02)));
  g.add(caja(marco, 0.07, h, 0.05, [0, 0, 0.09], 0.01), caja(marco, w, 0.07, 0.05, [0, 0, 0.09], 0.01));
  g.add(caja(marco, w + 0.4, 0.1, 0.22, [0, -h / 2 - 0.14, 0.06], 0.04));
  return g;
}

/** Puerta con marco, manilla y peldaño (el origen queda en el suelo). */
export function puerta(w: number, h: number, color: string, pos: V3, marco = "#FFFFFF"): THREE.Group {
  const g = grupo([], pos);
  g.add(caja(marco, w + 0.24, h + 0.12, 0.1, [0, h / 2 + 0.06, 0], 0.05));
  g.add(caja(color, w, h, 0.1, [0, h / 2, 0.04], 0.06));
  g.add(caja(color, w * 0.66, h * 0.3, 0.04, [0, h * 0.7, 0.09], 0.03), caja(color, w * 0.66, h * 0.3, 0.04, [0, h * 0.28, 0.09], 0.03));
  g.add(esfera(mat("#FFD54F", { rug: 0.3, metal: 0.4 }), 0.07, [w * 0.32, h * 0.48, 0.14]));
  g.add(caja("#CFD8DC", w + 0.5, 0.1, 0.45, [0, 0.05, 0.25], 0.04));
  return g;
}

/** Texto pintado en una tabla (carteles de fachada, pizarras). */
export function cartel(texto: string, w: number, h: number, pos: V3, o: { fondo?: string; color?: string; borde?: string } = {}): THREE.Group {
  const g = grupo([], pos);
  const px = 256 / h;
  const t = lienzo(Math.round(w * px), 256, (c, cw, ch) => {
    c.fillStyle = o.fondo ?? "#FFFFFF";
    c.fillRect(0, 0, cw, ch);
    c.fillStyle = o.color ?? "#3B2F5C";
    c.font = `900 ${Math.round(ch * 0.56)}px system-ui, "Segoe UI", Roboto, sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(texto, cw / 2, ch / 2 + ch * 0.03, cw * 0.9);
  });
  g.add(caja(o.borde ?? "#8D6E63", w + 0.16, h + 0.16, 0.1, [0, 0, 0], 0.06));
  g.add(plano(matTextura(t), w, h, [0, 0, 0.056]));
  return g;
}

/** Árbol de copa redonda en racimos. `tipo` 2 lleva manzanas. */
export function arbol(tipo = 0, esc = 1): THREE.Group {
  const g = grupo();
  const copa = ["#43A047", "#2E7D32", "#66BB6A"][tipo % 3]!, clara = ["#66BB6A", "#43A047", "#9CCC65"][tipo % 3]!;
  g.add(cilindro("#795548", 0.2, 0.3, 1.5, [0, 0.75, 0], 10));
  g.add(esfera(copa, 1.15, [0, 2.4, 0], [1, 0.95, 1], 2));
  g.add(esfera(copa, 0.8, [-0.75, 1.95, 0.15], [1, 1, 1], 1), esfera(copa, 0.78, [0.78, 2.0, -0.1], [1, 1, 1], 1), esfera(copa, 0.7, [0.1, 1.95, 0.75], [1, 1, 1], 1));
  g.add(esfera(clara, 0.7, [-0.3, 3.0, 0.25], [1, 0.9, 1], 1), esfera(clara, 0.5, [0.55, 2.85, 0.4], [1, 0.9, 1], 1));
  if (tipo % 3 === 2) for (let i = 0; i < 6; i++) g.add(esfera(mat("#E53935", { rug: 0.35 }), 0.13, [Math.cos(i * 1.1) * 0.95, 1.9 + azar(i) * 1.0, Math.sin(i * 1.1) * 0.6 + 0.55]));
  g.scale.setScalar(esc);
  return fusionar(g, { ao: 0.12 });
}

export function arbusto(esc = 1, flores?: string): THREE.Group {
  const g = grupo();
  g.add(esfera("#388E3C", 0.45, [-0.3, 0.32, 0]), esfera("#2E7D32", 0.5, [0.25, 0.36, -0.05]), esfera("#43A047", 0.42, [0, 0.55, 0.1]));
  if (flores) for (let i = 0; i < 5; i++) g.add(esfera(flores, 0.09, [Math.cos(i * 1.4) * 0.38, 0.55 + azar(i) * 0.3, 0.28 + Math.sin(i * 1.4) * 0.15]));
  g.scale.setScalar(esc);
  return fusionar(g, { ao: 0.15 });
}

/** Flor suelta (tallo, pétalos y centro). */
export function flor(color: string, esc = 1): THREE.Group {
  const g = grupo();
  g.add(cilindro("#558B2F", 0.025, 0.025, 0.4, [0, 0.2, 0], 6));
  for (let i = 0; i < 5; i++) g.add(esfera(color, 0.09, [Math.cos(i * 1.257) * 0.1, 0.43, Math.sin(i * 1.257) * 0.1], [1, 0.5, 1], 0));
  g.add(esfera("#FFB300", 0.07, [0, 0.46, 0], [1, 0.6, 1], 0));
  g.scale.setScalar(esc);
  return g;
}

/** Cerca de estacas a lo largo de X. */
export function cerca(largo: number, color = "#D7CCC8", alto = 0.9): THREE.Group {
  const g = grupo();
  const n = Math.max(2, Math.round(largo / 0.5));
  for (let i = 0; i <= n; i++) {
    const x = -largo / 2 + (i / n) * largo;
    g.add(caja(color, 0.16, alto, 0.08, [x, alto / 2, 0], 0.04), girar(cono(color, 0.11, 0.16, [x, alto + 0.07, 0], 4), 0, Math.PI / 4, 0));
  }
  g.add(caja("#BCAAA4", largo, 0.09, 0.05, [0, alto * 0.72, -0.05], 0.02), caja("#BCAAA4", largo, 0.09, 0.05, [0, alto * 0.32, -0.05], 0.02));
  return fusionar(g);
}

/** Farol de calle: de noche brilla y deja un charco de luz en el suelo. */
export function farol(luces: boolean): THREE.Group {
  const g = grupo();
  const p = grupo();
  p.add(cilindro("#455A64", 0.07, 0.1, 3.2, [0, 1.6, 0], 10), cilindro("#37474F", 0.2, 0.26, 0.2, [0, 0.1, 0], 12), cono("#37474F", 0.34, 0.22, [0, 3.62, 0], 12));
  g.add(fusionar(p));
  g.add(esfera(luces ? mat("#FFF3B0", { emis: "#FFD54F", emisI: 1.6 }) : mat("#FFFDE7", { rug: 0.2 }), 0.2, [0, 3.36, 0]));
  if (luces) g.add(charcoDeLuz(2.6, [0, 0.04, 0]));
  return g;
}

let TEX_LUZ: THREE.Texture | null = null;
/** Mancha de luz cálida en el suelo (bajo faroles y ventanas encendidas). */
export function charcoDeLuz(r: number, pos: V3, color = "#FFE082"): THREE.Mesh {
  TEX_LUZ ??= lienzo(128, 128, (c) => {
    const grad = c.createRadialGradient(64, 64, 2, 64, 64, 62);
    grad.addColorStop(0, "rgba(255,255,255,0.75)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = grad;
    c.fillRect(0, 0, 128, 128);
  });
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 24), new THREE.MeshBasicMaterial({ map: TEX_LUZ, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7 }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(pos[0], pos[1], pos[2]);
  m.renderOrder = 1;
  return m;
}

export function banca(color = "#A1887F"): THREE.Group {
  const g = grupo();
  g.add(caja(color, 1.9, 0.12, 0.55, [0, 0.55, 0], 0.05), caja(color, 1.9, 0.5, 0.1, [0, 0.95, -0.24], 0.05));
  for (const x of [-0.8, 0.8]) g.add(caja("#6D4C41", 0.12, 0.55, 0.5, [x, 0.27, 0], 0.04));
  return fusionar(g);
}

/** Nube esponjosa. */
export function nube(esc = 1): THREE.Group {
  const g = grupo();
  const b = mat("#FFFFFF", { rug: 1 });
  g.add(esfera(b, 0.9, [0, 0, 0]), esfera(b, 0.7, [-0.9, -0.1, 0]), esfera(b, 0.75, [0.9, -0.05, 0.1]), esfera(b, 0.6, [0.35, 0.45, 0]), esfera(b, 0.5, [-0.45, 0.35, 0.1]));
  g.scale.setScalar(esc);
  fusionar(g, { sombra: false, recibe: false });
  return g;
}

/** Cerro con nieve en la punta (para el fondo). */
export function cerro(alto: number, ancho: number, nieve = true, color = "#8FA6B5"): THREE.Group {
  const g = grupo();
  g.add(cono(color, ancho / 2, alto, [0, alto / 2, 0], 7));
  if (nieve) g.add(cono("#FFFFFF", ancho * 0.16, alto * 0.3, [0, alto * 0.86, 0], 7));
  return fusionar(g, { sombra: false });
}

/** Techo a dos aguas con la cumbrera a lo largo de X (el origen queda en la base, al centro). */
export function techo(ancho: number, fondo: number, alto: number, color: string): THREE.Group {
  const g = grupo();
  const m = prisma(color, [[-fondo / 2, 0], [fondo / 2, 0], [0, alto]], ancho, [0, 0, 0], 0.07);
  m.rotation.y = Math.PI / 2;
  g.add(m);
  // Hileras de tejas y cumbrera, para que el techo no se vea plano.
  const sombra = "#" + new THREE.Color(color).multiplyScalar(0.8).getHexString();
  const luz = "#" + new THREE.Color(color).lerp(new THREE.Color("#FFFFFF"), 0.22).getHexString();
  const ang = Math.atan2(alto, fondo / 2), largo = Math.hypot(alto, fondo / 2);
  const filas = Math.max(3, Math.round(largo / 0.55));
  for (const l of [-1, 1]) {
    for (let i = 0; i < filas; i++) {
      const k = (i + 0.5) / filas, d = largo * (1 - k);
      const teja = caja(i % 2 ? sombra : color, ancho + 0.06, 0.07, largo / filas + 0.06, [0, alto - Math.sin(ang) * d + 0.05, l * Math.cos(ang) * d], 0.03);
      teja.rotation.x = l * (ang - 0.07);
      g.add(teja);
    }
  }
  const cumbre = cilindro(luz, 0.13, 0.13, ancho + 0.16, [0, alto + 0.03, 0], 10);
  cumbre.rotation.z = Math.PI / 2;
  g.add(cumbre);
  return g;
}

export { capsula, cupula, disco, toro };
