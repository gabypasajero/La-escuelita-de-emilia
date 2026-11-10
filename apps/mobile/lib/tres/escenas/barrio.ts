import * as THREE from "three";
import { ARBOLES, LUGARES, VECINOS, type Lugar } from "../../lugares";
import { crearAnimal, crearPaseo, crearVuelo, type Animal } from "../animal";
import { aparte, azar, caja, cilindro, cono, disco, esfera, fusionar, girar, grupo, letrero, lienzo, mat, matTextura, toro } from "../base";
import type { Constructor, Escena } from "../motor";
import { arbol, arbusto, banca, cartel, cerca, cerro, charcoDeLuz, farol, flor, puerta, techo, ventana } from "../utileria";

/**
 * El barrio de Emilia en 3D, como una maqueta de juguete: las diez casas y
 * lugares, caminos de tierra, laguna con pato, árboles, animales que pasean y
 * la luz de la hora real. Usa las mismas posiciones del barrio 2D
 * (40 unidades de diseño = 1 unidad 3D; el barrio mide 45 × 31).
 */
const A = (v: number) => v / 40;
const ANCHO = 45, FONDO = 31.25;

const COLORES: Record<string, { pared: string; techo: string; puerta: string }> = {
  casa: { pared: "#FDD835", techo: "#E57373", puerta: "#8D6E63" },
  escuelita: { pared: "#4FC3F7", techo: "#1E88E5", puerta: "#1565C0" },
  taller: { pared: "#FFB74D", techo: "#EF6C00", puerta: "#6D4C41" },
  tiendita: { pared: "#FFE082", techo: "#FFF8E1", puerta: "#8D6E63" },
  disfraces: { pared: "#F48FB1", techo: "#AD1457", puerta: "#880E4F" },
  granja: { pared: "#E53935", techo: "#8E2A2A", puerta: "#FFFFFF" },
  veterinaria: { pared: "#E0F2F1", techo: "#00897B", puerta: "#00695C" },
};

/** Una casa o lugar del barrio. El origen queda en el suelo, al centro del frente. */
function lugar3d(id: string, luces: boolean): THREE.Group {
  const g = grupo();
  const c = COLORES[id];
  if (c) {
    const W = 6, H = 3.3, D = 4.2, plano = id === "tiendita";
    g.add(caja(c.pared, W, H, D, [0, H / 2, -D / 2], 0.2));
    g.add(caja("#00000022", W + 0.06, 0.3, D + 0.06, [0, 0.15, -D / 2], 0.1));
    if (plano) {
      g.add(caja(c.techo, W + 0.4, 0.45, D + 0.4, [0, H + 0.2, -D / 2], 0.14));
    } else {
      const t = techo(W + 0.7, D + 0.9, id === "granja" ? 2.3 : 2.0, c.techo);
      t.position.set(0, H - 0.05, -D / 2);
      g.add(t);
    }
    const xPuerta = id === "tiendita" ? 1.5 : id === "disfraces" ? 1.4 : 0;
    g.add(puerta(id === "granja" ? 1.9 : 1.25, id === "granja" ? 2.5 : 2.2, c.puerta, [xPuerta, 0, 0.02], id === "granja" ? "#FFFFFF" : "#FFF8E1"));
    if (id === "granja") {
      for (const s of [-1, 1]) g.add(girar(caja("#E53935", 0.14, 3.0, 0.06, [0, 1.25, 0.13], 0.02), 0, 0, s * 0.62));
      g.add(ventana(1.0, 0.7, [0, 3.6, 0.03], luces));
      const paja = grupo([esfera("#FFD54F", 0.55, [-3.9, 0.45, 0.6], [1.2, 0.8, 0.9]), esfera("#FFCA28", 0.4, [-3.2, 0.34, 1.1], [1.2, 0.8, 0.9])]);
      g.add(paja);
    } else if (id === "tiendita") {
      g.add(ventana(2.2, 1.3, [-1.3, 1.5, 0.03], luces));
      // Toldo a rayas y cajones de fruta
      for (let i = 0; i < 8; i++) g.add(girar(caja(i % 2 ? "#FFFFFF" : "#E53935", 0.78, 0.08, 1.2, [-2.73 + i * 0.78, 2.72, 0.5], 0.03), 0.42));
      g.add(cartel("ALMACÉN", 3.4, 0.7, [0, 3.95, 0.12], { color: "#8D6E63" }));
      for (const [x, col] of [[-2.2, "#E53935"], [-1.3, "#FDD835"], [-0.4, "#FB8C00"]] as const) {
        g.add(caja("#A1887F", 0.75, 0.4, 0.55, [x, 0.2, 0.55], 0.05));
        for (let k = 0; k < 4; k++) g.add(esfera(col, 0.15, [x - 0.2 + (k % 2) * 0.4, 0.47, 0.42 + Math.floor(k / 2) * 0.28]));
      }
    } else {
      g.add(ventana(1.05, 1.1, [-1.85, 1.75, 0.03], luces), ventana(1.05, 1.1, [id === "disfraces" ? -0.3 : 1.85, 1.75, 0.03], luces));
    }
    if (id === "casa") {
      g.add(caja("#A1665E", 0.6, 1.5, 0.6, [1.6, H + 1.25, -D / 2 - 0.4], 0.06), caja("#8D5049", 0.75, 0.2, 0.75, [1.6, H + 2.0, -D / 2 - 0.4], 0.05));
      for (const x of [-1.85, 1.85]) {
        g.add(caja("#8D6E63", 1.3, 0.25, 0.3, [x, 1.0, 0.22], 0.06));
        for (let k = 0; k < 4; k++) g.add(esfera(["#F06292", "#BA68C8", "#FF7043", "#FFF176"][k]!, 0.13, [x - 0.45 + k * 0.3, 1.2, 0.26]));
      }
    } else if (id === "escuelita") {
      g.add(caja("#81D4FA", 1.1, 1.3, 1.1, [0, H + 2.2, -D / 2], 0.08));
      const tt = techo(1.5, 1.5, 0.8, "#1565C0");
      tt.position.set(0, H + 2.85, -D / 2);
      g.add(tt, esfera(mat("#FFCA28", { rug: 0.3, metal: 0.4 }), 0.26, [0, H + 2.15, -D / 2 + 0.6], [1, 1.1, 1]));
      g.add(cartel("ABC 123", 2.6, 0.62, [0, 2.9, 0.1]));
    } else if (id === "taller") {
      const paleta = grupo([], [0, H + 1.1, 0.32]);
      paleta.add(esfera("#FFF3E0", 1, [0, 0, 0], [1.0, 0.7, 0.1]));
      ([[-0.5, 0.15, "#E53935"], [-0.1, 0.3, "#1E88E5"], [0.35, 0.22, "#43A047"], [-0.4, -0.2, "#FDD835"]] as const).forEach(([x, y, col]) => paleta.add(esfera(col, 0.16, [x, y, 0.1], [1, 1, 0.5])));
      g.add(paleta);
      // Caballete junto a la puerta
      g.add(caja("#FFFFFF", 0.9, 0.7, 0.06, [-2.3, 1.0, 0.7], 0.02), girar(cilindro("#6D4C41", 0.04, 0.04, 1.5, [-2.6, 0.7, 0.72], 6), 0, 0, 0.2), girar(cilindro("#6D4C41", 0.04, 0.04, 1.5, [-2.0, 0.7, 0.72], 6), 0, 0, -0.2));
      g.add(esfera("#FDD835", 0.14, [-2.1, 1.15, 0.74], [1, 1, 0.3]), esfera("#81C784", 0.3, [-2.4, 0.82, 0.74], [1.2, 0.5, 0.2]));
    } else if (id === "disfraces") {
      g.add(cartel("DISFRACES", 3.2, 0.62, [0, 3.0, 0.1], { color: "#AD1457", borde: "#AD1457" }));
      g.add(cono(mat("#FDD835", { rug: 0.3, metal: 0.3 }), 0.22, 0.4, [-1.85, 1.9, 0.2], 5));
    } else if (id === "veterinaria") {
      g.add(caja("#FFFFFF", 1.1, 1.1, 0.14, [0, H + 0.95, 0.3], 0.1), caja("#E53935", 0.26, 0.8, 0.06, [0, H + 0.95, 0.4], 0.03), caja("#E53935", 0.8, 0.26, 0.06, [0, H + 0.95, 0.4], 0.03));
      g.add(esfera("#4DB6AC", 0.22, [1.85, 0.75, 0.06], [1, 1, 0.3]));
    }
    for (const x of id === "tiendita" ? [2.7] : [-2.7, 2.7]) g.add(grupo([arbusto(0.8, id === "casa" ? "#F06292" : undefined)], [x, 0, 0.5]));
  } else if (id === "plaza") {
    g.add(disco("#C5E1A5", 3.6, [0, 0.03, -1], [1, 0.6]));
    for (const x of [-2.6, -0.6]) g.add(girar(cilindro("#E53935", 0.09, 0.09, 2.9, [x, 1.4, -1], 8), 0, 0, x < -1 ? -0.14 : 0.14));
    g.add(girar(cilindro("#C62828", 0.1, 0.1, 2.5, [-1.6, 2.8, -1], 8), 0, 0, Math.PI / 2));
    for (const x of [-1.9, -1.3]) g.add(cilindro("#795548", 0.02, 0.02, 1.9, [x, 1.85, -1], 5));
    g.add(caja("#FDD835", 0.8, 0.1, 0.35, [-1.6, 0.9, -1], 0.04));
    g.add(caja("#1E88E5", 0.1, 2.2, 0.1, [1.0, 1.1, -1.3], 0.03), caja("#1E88E5", 0.1, 2.2, 0.1, [1.0, 1.1, -0.7], 0.03), caja("#1565C0", 0.9, 0.12, 0.8, [1.3, 2.2, -1], 0.04));
    for (let i = 0; i < 5; i++) g.add(caja("#1E88E5", 0.08, 0.08, 0.6, [1.0, 0.4 + i * 0.4, -1], 0.02));
    g.add(girar(caja("#43A047", 2.9, 0.12, 0.75, [2.75, 1.15, -1], 0.05), 0, 0, -0.78));
  } else if (id === "huerto") {
    for (let i = 0; i < 3; i++) {
      g.add(caja("#8D6E63", 5.2, 0.3, 0.8, [0, 0.15, -2.4 + i * 1.1], 0.12));
      for (let k = 0; k < 6; k++) g.add(cono(k % 2 ? "#66BB6A" : "#43A047", 0.16, 0.42, [-2.1 + k * 0.84, 0.5, -2.4 + i * 1.1], 6));
    }
    g.add(cilindro("#8D6E63", 0.06, 0.06, 2.0, [2.3, 1.0, -3.4], 6), girar(cilindro("#8D6E63", 0.05, 0.05, 1.3, [2.3, 1.45, -3.4], 6), 0, 0, Math.PI / 2));
    g.add(esfera("#FFE0B2", 0.3, [2.3, 2.15, -3.4]), cono("#FDD835", 0.5, 0.3, [2.3, 2.45, -3.4], 14), caja("#42A5F5", 0.6, 0.7, 0.3, [2.3, 1.35, -3.4], 0.08));
  } else if (id === "paradero") {
    for (const x of [-1.6, 1.6]) g.add(caja("#7986CB", 0.14, 2.5, 0.14, [x, 1.25, -0.8], 0.04));
    g.add(caja("#3F51B5", 3.9, 0.18, 1.7, [0, 2.6, -0.5], 0.07), caja("#8D6E63", 2.8, 0.12, 0.5, [0, 0.6, -0.7], 0.05));
    g.add(aparte(caja(mat("#E8EAF6", { opacidad: 0.45 }), 3.1, 1.6, 0.05, [0, 1.6, -1.1], 0.01)));
    g.add(cilindro("#9E9E9E", 0.06, 0.06, 2.6, [2.6, 1.3, 0]), aparte(esfera(luces ? mat("#FDD835", { emis: "#FFC107", emisI: 0.8 }) : "#FDD835", 0.5, [2.6, 2.75, 0], [1, 1, 0.25])));
  }
  return g;
}

export const barrio: Constructor = (c) => {
  const raiz = new THREE.Group();
  // ---------- Suelo pintado: pasto, caminos, orilla de la laguna y flores ----------
  const PX = 32, X0 = -10, Z0 = -9, SW = 65, SD = 50;
  const px = (x: number) => (x - X0) * PX, pz = (z: number) => (z - Z0) * PX;
  const sueloTex = lienzo(SW * PX, SD * PX, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#B8DC76");
    grad.addColorStop(0.5, "#9CCB5E");
    grad.addColorStop(1, "#7FB548");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) {
      const x = azar(i) * w, y = azar(i + 50) * h, r = 120 + azar(i + 9) * 200;
      const m = g.createRadialGradient(x, y, 4, x, y, r);
      m.addColorStop(0, i % 3 ? "rgba(214,238,160,0.5)" : "rgba(60,120,40,0.22)");
      m.addColorStop(1, "rgba(214,238,160,0)");
      g.fillStyle = m;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    const camino = (pts: Array<[number, number]>, ancho: number) => {
      for (const [col, k] of [["#B08D57", 1.16], ["#D8BC92", 1], ["#E4CFA8", 0.5]] as const) {
        g.strokeStyle = col;
        g.lineWidth = ancho * PX * k;
        g.lineCap = "round";
        g.beginPath();
        pts.forEach(([x, z], i) => (i ? g.lineTo(px(x), pz(z)) : g.moveTo(px(x), pz(z))));
        g.stroke();
      }
    };
    camino([[-12, A(427)], [58, A(427)]], 1.9);
    camino([[-12, A(837)], [58, A(837)]], 1.9);
    camino([[A(904), A(427)], [A(904), A(1185)]], 1.7);
    camino([[A(510), A(1185)], [A(1400), A(1185)]], 1.4);
    for (let i = 0; i < 260; i++) {
      const enH = i % 3, x = azar(i + 300) * w;
      const y = enH === 0 ? pz(A(427)) + (azar(i) - 0.5) * 44 : enH === 1 ? pz(A(837)) + (azar(i) - 0.5) * 44 : pz(A(1185)) + (azar(i) - 0.5) * 30;
      g.fillStyle = i % 2 ? "#A88B5E" : "#EFE0C2";
      g.beginPath();
      g.ellipse(x, y, 2 + azar(i + 5) * 4, 1.5 + azar(i + 6) * 2.5, 0, 0, 7);
      g.fill();
    }
    // Orilla de arena de la laguna
    g.fillStyle = "#DCC99B";
    g.beginPath();
    g.ellipse(px(A(210)), pz(A(540)), 3.7 * PX, 2.25 * PX, 0, 0, 7);
    g.fill();
    // Matas de pasto y florcitas
    for (let i = 0; i < 1500; i++) {
      const x = azar(i + 1000) * w, y = azar(i + 2000) * h;
      g.strokeStyle = i % 2 ? "#5E9A2E" : "#79B142";
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(x - 5, y);
      g.lineTo(x - 7, y - 11);
      g.moveTo(x, y);
      g.lineTo(x, y - 14);
      g.moveTo(x + 5, y);
      g.lineTo(x + 8, y - 10);
      g.stroke();
    }
    for (let i = 0; i < 420; i++) {
      const x = azar(i + 4000) * w, y = azar(i + 5000) * h;
      g.fillStyle = ["#F06292", "#FFF176", "#FFFFFF", "#BA68C8", "#FF8A65"][i % 5]!;
      for (let k = 0; k < 5; k++) {
        g.beginPath();
        g.arc(x + Math.cos(k * 1.257) * 4.5, y + Math.sin(k * 1.257) * 4.5, 3.6, 0, 7);
        g.fill();
      }
      g.fillStyle = "#FFB300";
      g.beginPath();
      g.arc(x, y, 2.6, 0, 7);
      g.fill();
    }
  });
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(SW, SD), matTextura(sueloTex, { rug: 0.95 }));
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.set(X0 + SW / 2, 0, Z0 + SD / 2);
  suelo.receiveShadow = true;
  raiz.add(suelo);

  // ---------- Laguna ----------
  const lx = A(210), lz = A(540);
  const agua = disco(mat("#4FC3F7", { rug: 0.08 }), 3.15, [lx, 0.05, lz], [1, 0.56]);
  agua.receiveShadow = true;
  raiz.add(aparte(agua));
  const orilla = grupo();
  for (const [x, z] of [[-3.2, 0.3], [-2.9, -0.6], [3.2, 0.5], [3.0, -0.4]] as const) {
    orilla.add(cilindro("#558B2F", 0.03, 0.03, 1.1, [lx + x, 0.55, lz + z], 5), esfera("#6D4C41", 0.07, [lx + x, 1.1, lz + z], [1, 2.4, 1]));
  }
  for (const [x, z] of [[-1.2, 0.8], [1.5, -0.5], [0.4, 1.0]] as const) orilla.add(disco("#43A047", 0.28, [lx + x, 0.07, lz + z]), esfera("#F8BBD0", 0.09, [lx + x, 0.12, lz + z]));
  orilla.add(esfera("#90A4AE", 0.35, [lx + 3.3, 0.15, lz + 1.5], [1, 0.6, 0.8]), esfera("#B0BEC5", 0.25, [lx - 3.4, 0.1, lz + 1.2], [1, 0.6, 0.8]));
  raiz.add(fusionar(orilla));

  // ---------- Casas y lugares ----------
  const solidos: Escena["solidos"] = [];
  const ocultables: NonNullable<Escena["ocultables"]> = [];
  const interactivos: Escena["interactivos"] = [];
  const puntos: Record<string, { x: number; z: number }> = {};
  const entrar = (l: Lugar) => {
    if (l.estrellas && c.estrellas() < l.estrellas) {
      return c.decir(`La ${l.nombre.toLowerCase()} está en construcción. Se abre con ${l.estrellas} estrellas: ¡te faltan ${l.estrellas - c.estrellas()}!`);
    }
    void c.decirYEsperar(l.frase).then(() => {
      if (!c.vigente("barrio")) return;
      if (CON_ESCENA.has(l.id)) c.irA(l.id);
      else if (l.ruta) c.ruta2d(l.ruta as string);
    });
  };
  for (const l of LUGARES) {
    const x = A(l.x), z = A(l.y);
    const casa = lugar3d(l.id, c.luces);
    casa.position.set(x, 0, z);
    fusionar(casa, { ao: 0.1 });
    const nombre = letrero(l.estrellas && c.estrellas() < l.estrellas ? `${l.nombre} ⭐${l.estrellas}` : l.nombre, { alto: 0.62 });
    nombre.position.set(0, COLORES[l.id] ? 6.4 : 3.9, 0.4);
    casa.add(nombre);
    raiz.add(casa);
    if (COLORES[l.id]) {
      solidos.push({ x0: x - 3.4, x1: x + 3.4, z0: z - 4.6, z1: z + 0.35 });
      // Cada casa con su propio material, para poder transparentarla cuando tapa al niño.
      const mallas: THREE.Mesh[] = [];
      casa.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.material = (m.material as THREE.Material).clone();
          mallas.push(m);
        }
      });
      ocultables.push({
        x0: x - 3.4, x1: x + 3.4, z0: z - 4.6, z1: z,
        opacidad: (v) => mallas.forEach((m) => {
          const mt = m.material as THREE.Material;
          mt.transparent = v < 0.99;
          mt.opacity = v * (m.userData.opacidadBase ?? 1);
          mt.depthWrite = v > 0.9;
        }),
      });
      if (c.luces) raiz.add(charcoDeLuz(2.4, [x, 0.04, z + 1.2]));
    }
    puntos[l.id] = { x: x + (l.id === "tiendita" ? 1.5 : l.id === "disfraces" ? 1.4 : 0), z: z + 1.5 };
    interactivos.push({ objeto: casa, llegada: { x: puntos[l.id]!.x, z: z + 1.1 }, mira: { x: puntos[l.id]!.x, z: z - 2 }, alLlegar: () => entrar(l) });
  }

  // ---------- Árboles, cerca de la granja, faroles, bancas y cerros ----------
  ARBOLES.forEach(([x, y], k) => {
    const a = arbol(k, 1.1 + azar(k) * 0.35);
    a.position.set(A(x), 0, A(y));
    a.rotation.y = azar(k + 3) * 6;
    raiz.add(a);
    solidos.push({ x0: A(x) - 0.45, x1: A(x) + 0.45, z0: A(y) - 0.45, z1: A(y) + 0.45 });
  });
  const cg = cerca(9, "#D7CCC8");
  cg.position.set(A(1517), 0, A(925));
  raiz.add(cg);
  for (const [x, z] of [[A(904) + 1.6, A(427) + 1.6], [A(904) - 1.6, A(837) + 1.6], [A(300) + 4.2, A(770) + 1.4], [A(1300) - 3.6, A(1150) + 1.2]] as const) {
    const f = farol(c.luces);
    f.position.set(x, 0, z);
    raiz.add(f);
  }
  for (const [x, z, r] of [[A(904) + 2.6, A(640), -Math.PI / 2], [A(540), A(837) + 1.7, Math.PI]] as const) {
    const b = banca();
    b.position.set(x, 0, z);
    b.rotation.y = r;
    raiz.add(b);
  }
  const floresG = grupo();
  for (let i = 0; i < 46; i++) {
    const x = azar(i + 70) * ANCHO, z = 5.5 + azar(i + 170) * (FONDO - 6);
    if (Math.abs(z - A(427)) < 1.6 || Math.abs(z - A(837)) < 1.6 || Math.abs(x - A(904)) < 1.5 || solidos.some((b) => x > b.x0 - 0.5 && x < b.x1 + 0.5 && z > b.z0 - 0.5 && z < b.z1 + 0.5)) continue;
    const f = flor(["#F06292", "#FFF176", "#FFFFFF", "#BA68C8", "#FF8A65"][i % 5]!, 0.9 + azar(i) * 0.5);
    f.position.set(x, 0, z);
    floresG.add(f);
  }
  raiz.add(fusionar(floresG, { sombra: false }));
  for (let i = 0; i < 11; i++) {
    const m = cerro(9 + (i % 3) * 3, 13, true, i % 2 ? "#8FA6B5" : "#A3B8C6");
    m.position.set(-6 + i * 5.7, -0.5, -5 - (i % 2) * 3);
    raiz.add(m);
  }

  // ---------- Animales del barrio ----------
  const animales: Array<{ a: Animal; mover: (dt: number, t: number) => void }> = [];
  for (const v of VECINOS) {
    const a = crearAnimal(v.animal === "mariposa" ? "mariposa" : (v.animal as Parameters<typeof crearAnimal>[0]));
    const x = A(v.x), z = A(v.y);
    a.raiz.position.set(x, 0, z);
    raiz.add(a.raiz);
    if (v.animal === "pato") {
      a.nadando = true;
      a.raiz.position.set(lx, 0.12, lz);
      const paseo = crearPaseo(a, { x: lx, z: lz }, 1.4, { vel: 0.45, libre: (px2, pz2) => ((px2 - lx) / 2.5) ** 2 + ((pz2 - lz) / 1.2) ** 2 < 1 });
      animales.push({ a, mover: (dt) => paseo(dt) });
    } else if (v.animal === "mariposa") {
      animales.push({ a, mover: crearVuelo(a, { x, y: 1.3, z }, 2.2, 0.45) });
    } else {
      animales.push({ a, mover: crearPaseo(a, { x, z }, v.paseo / 28, { vel: 0.65, libre: (px2, pz2) => !solidos.some((b) => px2 > b.x0 && px2 < b.x1 && pz2 > b.z0 && pz2 < b.z1) }) });
    }
    interactivos.push({ objeto: a.raiz, llegada: { x: x - 1.2, z: z + 0.8 }, alLlegar: () => { a.saltar(); c.decir(v.frase, null); } });
  }
  for (const [x, z, f] of [[A(560), A(980), 1], [A(1230), A(1030), 3]] as const) {
    const m = crearAnimal("mariposa");
    raiz.add(m.raiz);
    animales.push({ a: m, mover: crearVuelo(m, { x, y: 1.4, z }, 2.4, 0.4, f) });
  }
  const pajaros = [0, 1, 2].map((i) => {
    const p = crearAnimal("pajaro");
    raiz.add(p.raiz);
    return { a: p, mover: crearVuelo(p, { x: 22 + i * 1.2, y: 7.5 + i * 0.4, z: 14 + i }, 16, 0.16, i * 0.25) };
  });
  // De noche: luciérnagas (y los pájaros y mariposas duermen).
  const luciernagas = c.noche ? Array.from({ length: 16 }, (_, i) => {
    const m = aparte(esfera(mat("#FFF59D", { emis: "#FFEE58", emisI: 2 }), 0.07, [azar(i + 20) * ANCHO, 0.8 + azar(i) * 0.9, 6 + azar(i + 40) * (FONDO - 7)]));
    m.castShadow = false;
    raiz.add(m);
    return { m, x: m.position.x, y: m.position.y, z: m.position.z, f: i * 1.7 };
  }) : [];
  // Humo de la chimenea de Emilia y sombras de nubes que pasan.
  const casaE = LUGARES.find((l) => l.id === "casa")!;
  const humo = [0, 1, 2].map((i) => {
    const m = aparte(esfera(mat("#ECEFF1", { opacidad: 0.6, rug: 1 }), 0.3, [0, 0, 0]));
    m.castShadow = false;
    raiz.add(m);
    return { m, f: i / 3 };
  });
  const sombraNube = lienzo(128, 128, (g) => {
    const r = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    r.addColorStop(0, "rgba(20,50,20,0.16)");
    r.addColorStop(1, "rgba(20,50,20,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
  });
  const nubes = [0, 1, 2].map((i) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(4.5 + i, 20), new THREE.MeshBasicMaterial({ map: sombraNube, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.scale.y = 0.6;
    m.position.set(i * 17, 0.06, 6 + i * 9);
    raiz.add(m);
    return m;
  });
  const onda = aparte(toro(mat("#E1F5FE", { opacidad: 0.7 }), 0.5, 0.025, [lx, 0.08, lz]));
  raiz.add(onda);
  const pato = animales.find((x) => x.a.id === "pato")!.a;
  const cx = A(casaE.x) + 1.6, cz = A(casaE.y) - 2.5;

  return {
    id: "barrio", titulo: "El barrio", exterior: true, raiz,
    inicio: { x: A(casaE.x) + 1.6, z: A(casaE.y) + 2.2 },
    puntos,
    limites: { x0: 1, x1: ANCHO - 1, z0: 4.6, z1: FONDO - 0.6 },
    solidos,
    libre: (x, z) => ((x - lx) / 3.3) ** 2 + ((z - lz) / 1.9) ** 2 > 1,
    interactivos, ocultables,
    camara: { modo: "sigue", dist: 24, inclina: 44, zoom: [0.55, 1.6] },
    actualizar(dt, t) {
      for (const x of animales) {
        if (c.noche && (x.a.id === "mariposa")) { x.a.raiz.visible = false; continue; }
        x.mover(dt, t);
        x.a.actualizar(dt, t);
      }
      for (const p of pajaros) {
        p.a.raiz.visible = !c.noche;
        if (!c.noche) { p.mover(dt, t); p.a.actualizar(dt, t); }
      }
      luciernagas.forEach((l) => {
        l.m.position.set(l.x + Math.sin(t * 0.7 + l.f) * 0.8, l.y + Math.sin(t * 1.1 + l.f) * 0.3, l.z + Math.cos(t * 0.5 + l.f) * 0.6);
        l.m.visible = Math.sin(t * 2.2 + l.f) > -0.3;
      });
      humo.forEach((h) => {
        const u = (t * 0.22 + h.f) % 1;
        h.m.position.set(cx + u * 0.9, 5.4 + u * 2.6, cz);
        h.m.scale.setScalar(0.25 + u * 0.55);
        (h.m.material as THREE.Material).opacity = 0.55 * (1 - u);
      });
      nubes.forEach((n, i) => { n.position.x = ((t * (0.5 + i * 0.15) + i * 17) % 70) - 12; });
      const u = (t * 0.5) % 1;
      onda.position.set(pato.raiz.position.x, 0.08, pato.raiz.position.z);
      onda.scale.set(0.6 + u * 1.6, 0.6 + u * 1.6, 1);
      (onda.material as THREE.Material).opacity = 0.7 * (1 - u);
    },
    alEntrar() {
      const saludo = c.momento === "noche" ? "¡Buenas noches" : c.momento === "tarde" ? "¡Buenas tardes" : "¡Buenos días";
      c.decir(`${saludo}, ${c.nombre}! Toca el suelo para caminar o una casa para entrar.`);
    },
  };
};

/** Lugares que ya existen en 3D (los demás abren su pantalla 2D por ahora). */
export const CON_ESCENA = new Set<string>();
