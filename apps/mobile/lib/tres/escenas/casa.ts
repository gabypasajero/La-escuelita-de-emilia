import * as THREE from "three";
import { caja, cilindro, cono, esfera, fusionar, girar, grupo, letrero, mat, toro } from "../base";
import type { Constructor, Hud, Interactivo } from "../motor";
import { crearPersona, ELENCO } from "../personaje";
import { alfombra, cascaron, mesa, planta, silla, ventanal } from "../sala";
import { puerta } from "../utileria";

/**
 * La casa de Emilia en 3D, como una casa de muñecas abierta: baño,
 * dormitorio, cocina y la puerta al patio. Al entrar a cada pieza aparecen
 * abajo las cosas que se pueden hacer ahí; también se puede tocar el mueble.
 */
type Accion = { id: string; icono: string; texto: string; x: number; z: number; mira: number; hacer: () => void };

export const casa: Constructor = (c) => {
  const W = 25, D = 9.4, H = 6.4;
  const raiz = new THREE.Group();
  raiz.add(cascaron({ ancho: W, fondo: D, alto: H, pared: "#FFF1D6", piso: "#D2A679" }));
  const fijo = grupo();

  // ---- Las piezas: cada una con su color de pared y su piso ----
  const PIEZAS = [
    { id: "bano", nombre: "el baño", x0: -12.5, x1: -6.2, pared: "#BFE8F2", piso: "#E3F6FA" },
    { id: "pieza", nombre: "el dormitorio", x0: -6.2, x1: 1.4, pared: "#E3D5FA", piso: "" },
    { id: "cocina", nombre: "la cocina", x0: 1.4, x1: 9.0, pared: "#FFE7A6", piso: "#F3E3C8" },
    { id: "entrada", nombre: "la puerta del patio", x0: 9.0, x1: 12.5, pared: "#D9F0C9", piso: "" },
  ];
  for (const p of PIEZAS) {
    const w = p.x1 - p.x0, cx = (p.x0 + p.x1) / 2;
    fijo.add(caja(p.pared, w - 0.05, H - 0.5, 0.06, [cx, H / 2 + 0.1, 0.02], 0.02));
    if (p.piso) {
      // Baldosas
      const n = Math.round(w / 0.9);
      for (let i = 0; i < n; i++) for (let j = 0; j < 9; j++) {
        fijo.add(caja((i + j) % 2 ? p.piso : "#FFFFFF", w / n - 0.04, 0.02, D / 9 - 0.04, [p.x0 + (i + 0.5) * (w / n), 0.012, (j + 0.5) * (D / 9)], 0.005));
      }
    }
  }
  // Tabiques entre piezas (cortos, para pasar caminando por delante)
  const solidos = [-6.2, 1.4, 9.0].map((x) => {
    fijo.add(caja("#FFFFFF", 0.3, H, 2.7, [x, H / 2, 1.35], 0.08), caja("#F2E2C4", 0.34, 0.36, 2.74, [x, 0.18, 1.35], 0.05));
    return { x0: x - 0.4, x1: x + 0.4, z0: 0, z1: 2.9 };
  });
  for (const x of [-9.3, -2.4, 7.4]) {
    const v = ventanal(c, 1.5, 1.7);
    v.position.set(x, 4.5, 0.06);
    raiz.add(v);
  }

  // ---- Muebles que se usan (cada uno es un objeto para tocar) ----
  const mueble = (piezas: THREE.Object3D[], x: number, z: number, cartel: string, alto: number) => {
    const g = fusionar(grupo(piezas), { ao: 0.1 });
    const cont = grupo([g], [x, 0, z]);
    const l = letrero(cartel, { alto: 0.52, fondo: "#5C6BC0" });
    l.position.set(0, alto, 0.2);
    cont.add(l);
    raiz.add(cont);
    return cont;
  };
  const blanco = mat("#FFFFFF", { rug: 0.25 }), metal = mat("#B0BEC5", { rug: 0.25, metal: 0.6 });

  const lavamanos = mueble([
    cilindro(blanco, 0.22, 0.3, 1.0, [0, 0.5, 0], 14), esfera(blanco, 1, [0, 1.1, 0.05], [0.75, 0.3, 0.55], 2),
    esfera("#81D4FA", 1, [0, 1.2, 0.08], [0.55, 0.12, 0.38], 1),
    cilindro(metal, 0.04, 0.04, 0.4, [0, 1.45, -0.3], 8), girar(cilindro(metal, 0.035, 0.035, 0.3, [0, 1.62, -0.18], 8), Math.PI / 2),
    caja("#F48FB1", 0.22, 0.1, 0.14, [0.5, 1.33, -0.2], 0.04),
    caja("#FFF59D", 0.7, 0.9, 0.08, [1.1, 1.9, -0.55], 0.04), cilindro(metal, 0.02, 0.02, 0.9, [1.1, 2.4, -0.5], 6).rotateZ(Math.PI / 2),
  ], -10.6, 0.9, "Lavar manos", 2.75);

  const dientes = mueble([
    caja("#FFD54F", 1.5, 1.9, 0.1, [0, 2.55, -0.6], 0.1), caja(mat("#E3F2FD", { rug: 0.08, metal: 0.5 }), 1.25, 1.65, 0.06, [0, 2.55, -0.54], 0.08),
    caja(blanco, 1.6, 0.9, 0.6, [0, 0.5, -0.35], 0.06), caja("#80DEEA", 1.7, 0.1, 0.7, [0, 1.0, -0.33], 0.04),
    cilindro("#4FC3F7", 0.13, 0.1, 0.28, [-0.3, 1.2, -0.3], 12),
    girar(cilindro("#EF5350", 0.025, 0.025, 0.42, [-0.33, 1.42, -0.3], 6), 0, 0, 0.25), girar(cilindro("#66BB6A", 0.025, 0.025, 0.42, [-0.25, 1.42, -0.3], 6), 0, 0, -0.25),
    caja(blanco, 0.09, 0.07, 0.05, [-0.39, 1.63, -0.3], 0.01), caja(blanco, 0.09, 0.07, 0.05, [-0.2, 1.63, -0.3], 0.01),
    cilindro("#FFFFFF", 0.07, 0.07, 0.3, [0.35, 1.2, -0.3], 10), cono("#26A69A", 0.07, 0.1, [0.35, 1.4, -0.3], 10),
  ], -7.9, 1.0, "Cepillar dientes", 3.85);

  const ropero = mueble([
    caja("#B98A5A", 2.3, 3.4, 0.9, [0, 1.7, -0.3], 0.08), caja("#D7A86E", 1.05, 3.0, 0.08, [-0.56, 1.75, 0.17], 0.04), caja("#D7A86E", 1.05, 3.0, 0.08, [0.56, 1.75, 0.17], 0.04),
    esfera("#FFD54F", 0.07, [-0.12, 1.7, 0.24]), esfera("#FFD54F", 0.07, [0.12, 1.7, 0.24]),
    caja("#EC407A", 0.5, 0.2, 0.5, [-0.5, 3.52, -0.3], 0.06), caja("#42A5F5", 0.6, 0.25, 0.5, [0.4, 3.55, -0.3], 0.06),
  ], -4.6, 0.9, "Ropero", 4.3);

  const cama = mueble([
    caja("#8D6E63", 2.2, 1.5, 0.2, [0, 0.95, -0.55], 0.1), caja("#A1887F", 2.2, 0.45, 3.2, [0, 0.35, 1.0], 0.1),
    caja("#FFFFFF", 2.1, 0.3, 3.1, [0, 0.7, 1.0], 0.12), caja("#F48FB1", 2.16, 0.34, 2.1, [0, 0.74, 1.55], 0.14),
    esfera("#FFFFFF", 1, [0, 0.98, -0.1], [0.7, 0.2, 0.4], 1),
    esfera("#FFEB3B", 0.1, [0, 1.95, -0.5]),
  ], -0.9, 1.0, "Hora de dormir", 2.6);

  const comedor = mueble([
    mesa("#BC8F5F", 2.8, 1.6, 1.0), cilindro(blanco, 0.42, 0.28, 0.16, [0, 1.15, 0], 14),
    esfera("#E53935", 0.15, [-0.14, 1.3, 0]), esfera("#FDD835", 0.15, [0.14, 1.3, 0]), esfera("#FB8C00", 0.15, [0, 1.32, 0.14]),
    ...[-1, 1].flatMap((l) => { const s = silla("#8D6E63"); s.position.set(l * 0.8, 0, -1.1); return [s, cilindro(blanco, 0.26, 0.26, 0.03, [l * 0.8, 1.09, 0.35], 14)]; }),
  ], 5.6, 5.6, "A la mesa", 2.1);

  const puertaPatio = mueble([
    puerta(1.5, 2.9, "#66BB6A", [0, 0, 0]), caja(mat("#B3E5FC", { rug: 0.1 }), 0.8, 0.8, 0.05, [0, 2.1, 0.12], 0.06),
  ], 10.8, 0.1, "Patio de Tito", 3.6);

  // ---- Decoración fija ----
  // Baño: tina y alfombrita
  fijo.add(caja(blanco, 1.5, 0.9, 2.6, [-11.5, 0.45, 4.6], 0.3), caja("#81D4FA", 1.2, 0.1, 2.3, [-11.5, 0.86, 4.6], 0.2), esfera("#FFEB3B", 0.16, [-11.4, 0.98, 4.2]), cono("#FB8C00", 0.06, 0.12, [-11.4, 0.98, 4.38], 6).rotateX(Math.PI / 2));
  fijo.add(alfombra("#80DEEA", 1.0, [-9.2, 0.02, 3.2]));
  // Dormitorio: velador con lámpara, alfombra y juguetes
  fijo.add(caja("#B98A5A", 0.8, 0.9, 0.7, [-2.6, 0.45, 0.7], 0.06), cilindro("#5D4037", 0.05, 0.05, 0.5, [-2.6, 1.15, 0.7], 6), cono(mat("#FFE082", c.luces ? { emis: "#FFCA28", emisI: 0.9 } : {}), 0.32, 0.4, [-2.6, 1.55, 0.7], 14));
  fijo.add(alfombra("#CE93D8", 1.5, [-3.4, 0, 5.4]), esfera("#EF5350", 0.28, [-4.6, 0.28, 6.0]), caja("#42A5F5", 0.4, 0.4, 0.4, [-2.6, 0.2, 6.3], 0.05), caja("#FFCA28", 0.36, 0.36, 0.36, [-2.5, 0.58, 6.3], 0.05));
  // Cocina: mesón, cocina, refrigerador y repisa
  fijo.add(caja("#FFFFFF", 3.4, 1.15, 0.9, [4.6, 0.58, 0.6], 0.06), caja("#8D6E63", 3.5, 0.1, 1.0, [4.6, 1.2, 0.6], 0.04));
  fijo.add(caja("#CFD8DC", 1.2, 0.06, 0.8, [5.4, 1.27, 0.6], 0.02), cilindro("#EF5350", 0.3, 0.26, 0.3, [5.1, 1.45, 0.6], 14), cilindro("#37474F", 0.3, 0.3, 0.04, [5.75, 1.3, 0.6], 14));
  for (const x of [3.4, 4.2]) fijo.add(esfera(metal, 0.06, [x, 0.85, 1.07]));
  fijo.add(caja("#E3F2FD", 1.3, 3.2, 1.0, [2.7, 1.6, 0.6], 0.12), caja(metal, 0.06, 0.8, 0.06, [3.2, 2.2, 1.12], 0.02), caja("#B0BEC5", 1.3, 0.04, 1.02, [2.7, 1.3, 0.6], 0.01));
  fijo.add(caja("#8D6E63", 2.4, 0.1, 0.5, [5.0, 3.2, 0.3], 0.03));
  ["#EF5350", "#66BB6A", "#FFCA28", "#42A5F5"].forEach((col, i) => fijo.add(cilindro(col, 0.17, 0.17, 0.4, [4.1 + i * 0.6, 3.45, 0.3], 10)));
  fijo.add(toro("#8D6E63", 0.6, 0.2, [7.9, 0.2, 7.4]), cilindro("#FFCCBC", 0.58, 0.58, 0.16, [7.9, 0.1, 7.4], 16));
  for (const [x, z] of [[11.8, 1.0], [-12, 7.8]] as const) {
    const p = planta(1.2);
    p.position.set(x, 0, z);
    fijo.add(p);
  }
  fijo.add(alfombra("#A5D6A7", 0.9, [10.8, 0, 1.9], [1, 0.5]));
  raiz.add(fusionar(fijo, { ao: 0.1 }));

  // ---- La abuela Nina ----
  const nina = crearPersona(ELENCO.nina!);
  nina.raiz.position.set(7.6, 0, 2.6);
  raiz.add(nina.raiz);

  // ---- Qué se hace en cada pieza ----
  const abrir = (frase: string, ruta: string, titulo: string, quien = c.emilia) => () => {
    void c.decirYEsperar(frase, quien).then(() => { if (c.vigente("casa")) c.ventana(ruta, titulo); });
  };
  const ACCIONES: Record<string, Accion[]> = {
    bano: [
      { id: "manos", icono: "🧼", texto: "Lavar manos", x: -10.6, z: 2.3, mira: -10.6, hacer: abrir("¡Vamos a lavarnos las manos!", "/casa/rutina?r=manos", "Lavar manos") },
      { id: "dientes", icono: "🪥", texto: "Dientes", x: -7.9, z: 2.3, mira: -7.9, hacer: abrir("¡A cepillarnos los dientes!", "/casa/rutina?r=dientes", "Dientes") },
    ],
    pieza: [
      { id: "ropero", icono: "👕", texto: "Ropero", x: -4.6, z: 2.4, mira: -4.6, hacer: abrir("Veamos qué ropa nos ponemos según el clima.", "/casa/ropero", "Ropero") },
      { id: "cama", icono: "🛏️", texto: "Dormir", x: -2.6, z: 3.4, mira: -0.9, hacer: () => {
        c.efecto("zzz", [-0.9, 1.6, 1.6]);
        c.decir("Para dormir: pijama, dientes limpios, un cuento… y a la cama. ¡Buenas noches, Tito!");
      } },
    ],
    cocina: [
      { id: "plato", icono: "🍽️", texto: "A la mesa", x: 5.6, z: 7.2, mira: 5.6, hacer: abrir("¡A la mesa! Vamos a ver qué le hace bien a tu cuerpo.", "/casa/plato", "A la mesa", nina) },
    ],
    entrada: [
      { id: "patio", icono: "🦌", texto: "Patio de Tito", x: 10.8, z: 1.7, mira: 10.8, hacer: () => { void c.decirYEsperar("¡Vamos al patio a jugar con Tito!").then(() => { if (c.vigente("casa")) c.irA("patio"); }); } },
    ],
  };
  const todas = Object.values(ACCIONES).flat();
  const usar = (id: string) => {
    const a = todas.find((x) => x.id === id);
    if (!a) return;
    c.caminarA(a.x, a.z, () => {
      c.nino.mirarA(a.mira, a.id === "plato" ? 5.6 : 0);
      a.hacer();
    });
  };
  const objetos: Array<[THREE.Object3D, string]> = [[lavamanos, "manos"], [dientes, "dientes"], [ropero, "ropero"], [cama, "cama"], [comedor, "plato"], [puertaPatio, "patio"]];
  const interactivos: Interactivo[] = objetos.map(([objeto, id]) => {
    const a = todas.find((x) => x.id === id)!;
    return { objeto, llegada: { x: a.x, z: a.z }, mira: { x: a.mira, z: id === "plato" ? 5.6 : 0 }, alLlegar: a.hacer };
  });

  let pieza = "";
  const mostrar = (id: string, avisar: boolean) => {
    pieza = id;
    const hud: Hud = { botones: ACCIONES[id]!.map((a) => ({ id: a.id, icono: a.icono, texto: a.texto })) };
    c.hud(hud);
    if (avisar) c.decir(`Estamos en ${PIEZAS.find((p) => p.id === id)!.nombre}. ¿Qué hacemos?`);
  };

  return {
    id: "casa", titulo: "Casa de Emilia", exterior: false, raiz,
    inicio: { x: 10.8, z: 3.4 },
    limites: { x0: -11.6, x1: 11.7, z0: 1.4, z1: D - 0.7 },
    solidos: [
      ...solidos,
      { x0: -12.3, x1: -10.7, z0: 3.2, z1: 6 }, { x0: -2.1, x1: 0.3, z0: 0, z1: 3.0 }, { x0: -5.8, x1: -3.4, z0: 0, z1: 1.5 },
      { x0: 1.9, x1: 6.4, z0: 0, z1: 1.3 }, { x0: 4.1, x1: 7.1, z0: 4.2, z1: 6.5 }, { x0: 7.0, x1: 8.2, z0: 2.1, z1: 3.1 }, { x0: 7.2, x1: 8.6, z0: 6.7, z1: 8.1 },
    ],
    interactivos,
    camara: { modo: "sala", ancho: W, alto: H, fondo: D, inclina: 21 },
    fondo: ["#B79B78", "#D9C3A0"],
    salida: "barrio",
    actualizar(dt, t) {
      const x = c.nino.raiz.position.x;
      const p = PIEZAS.find((q) => x >= q.x0 && x < q.x1);
      if (p && p.id !== pieza) mostrar(p.id, pieza !== "");
      nina.mirarA(c.nino.raiz.position.x, c.nino.raiz.position.z);
      nina.actualizar(dt, t);
    },
    alEntrar() {
      pieza = "";
      nina.saludando = true;
      c.luego(2.2, () => { nina.saludando = false; });
      c.decir("¡Hola, mis niños! Pasen. Recorran la casa: en cada pieza hay algo que hacer.", nina);
    },
    alAccion: usar,
    alEvento(ev) {
      if (ev === "ventana-cerrada") c.enfocar(null);
    },
  };
};
