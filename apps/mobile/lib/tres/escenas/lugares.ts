import * as THREE from "three";
import { accesorioDeVitrina } from "../accesorios";
import { crearAnimal, crearPaseo, crearVuelo, type AnimalId3D } from "../animal";
import { caja, cilindro, cono, esfera, girar, grupo, mat, toro } from "../base";
import type { Ctx } from "../motor";
import { alfombra, cuadro, estante, mesa, patioConCarteles, planta, salaConMural, silla, ventanal } from "../sala";
import { arbusto, banca, cerca, techo } from "../utileria";

/**
 * Los demás lugares del barrio en 3D. Cada uno tiene su anfitrión, su
 * decoración y las tarjetas de sus juegos (que se abren en ventana flotante).
 */

type Extra = { actualizar?: (dt: number, t: number) => void; solidos?: Array<{ x0: number; x1: number; z0: number; z1: number }> };

/** Animales que pasean por el lugar. */
function animales(raiz: THREE.Group, lista: Array<[AnimalId3D, number, number, number?]>): (dt: number, t: number) => void {
  const vivos = lista.map(([id, x, z, radio]) => {
    const a = crearAnimal(id);
    a.raiz.position.set(x, 0, z);
    raiz.add(a.raiz);
    return { a, pasear: radio ? crearPaseo(a, { x, z }, radio, { vel: 0.6 }) : null };
  });
  return (dt, t) => {
    for (const v of vivos) {
      v.pasear?.(dt);
      v.a.actualizar(dt, t);
    }
  };
}

function ventanas(raiz: THREE.Group, c: Ctx, xs: number[], y = 3.6, w = 1.7, h = 2.2) {
  for (const x of xs) {
    const v = ventanal(c, w, h);
    v.position.set(x, y, 0.05);
    raiz.add(v);
  }
}

// ---------- Taller de arte ----------
export const taller = salaConMural({
  id: "taller", titulo: "Taller de arte",
  ancho: 19, fondo: 9, alto: 6.4, pared: "#FFD9E4", piso: "#C9976B", franja: "#F48FB1",
  filas: 1, tam: [2.3, 2.0], yMural: 2.5,
  tarjetas: [
    { ruta: "/pintar", nombre: "Pintar", icono: "🖌️", color: "#EC407A", frase: "¡Al caballete! Pinta lo que tú quieras." },
    { ruta: "/descubrir/colores", nombre: "Colores", icono: "🎨", color: "#FB8C00", frase: "¡A jugar con los colores de los frascos!" },
    { ruta: "/descubrir/formas", nombre: "Formas", icono: "🔺", color: "#7E57C2", frase: "¡Círculos, cuadrados y triángulos de papel!" },
    { ruta: "/descubrir/patrones", nombre: "¿Qué sigue?", icono: "🔴", color: "#26A69A", frase: "¡Armemos collares! ¿Qué cuenta sigue?" },
    { ruta: "/trazar", nombre: "Trazar", icono: "✏️", color: "#5C6BC0", frase: "¡Toma un lápiz y dibuja letras con el dedo!" },
  ],
  anfitrion: { quien: "artista", x: 7.7, z: 2.8, saludo: "¡Bienvenidos al taller! Elige una tarjeta y a crear." },
  decorar(fijo, raiz, c): Extra {
    ventanas(raiz, c, [-8.2, 8.2]);
    // Caballetes con cuadros
    for (const [x, z, col] of [[-6.6, 5.2, "#FFF59D"], [-4.3, 6.4, "#B3E5FC"]] as const) {
      for (const l of [-1, 1]) fijo.add(girar(cilindro("#A1887F", 0.05, 0.05, 2.5, [x + l * 0.45, 1.2, z], 6), 0.12, 0, l * -0.14));
      fijo.add(girar(cilindro("#A1887F", 0.05, 0.05, 2.4, [x, 1.15, z - 0.5], 6), -0.3), caja("#A1887F", 1.3, 0.08, 0.16, [x, 1.0, z + 0.1], 0.02));
      const q = cuadro(1.15, 0.95, (g, w, h) => {
        g.fillStyle = col; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 7; i++) { g.fillStyle = ["#EF5350", "#42A5F5", "#66BB6A", "#AB47BC", "#FF7043"][i % 5]!; g.beginPath(); g.arc(30 + ((i * 67) % (w - 50)), 30 + ((i * 41) % (h - 50)), 16 + (i % 3) * 8, 0, 7); g.fill(); }
      });
      q.position.set(x, 1.55, z + 0.12);
      q.rotation.x = -0.12;
      raiz.add(q);
    }
    // Mesa de trabajo con frascos de pintura
    const m = mesa("#FFCC80", 3.2, 1.4, 0.9);
    m.position.set(3.4, 0, 6.2);
    fijo.add(m);
    ["#E53935", "#FDD835", "#1E88E5", "#43A047", "#8E24AA"].forEach((col, i) => {
      fijo.add(cilindro(mat("#FFFFFF", { rug: 0.2, opacidad: 0.55 }), 0.14, 0.14, 0.3, [2.3 + i * 0.5, 1.12, 6.0], 10), cilindro(col, 0.12, 0.12, 0.2, [2.3 + i * 0.5, 1.08, 6.0], 10));
    });
    for (const l of [-1, 1]) {
      const si = silla("#4DB6AC");
      si.position.set(3.4 + l * 0.9, 0, 5.2);
      fijo.add(si);
    }
    const e = estante(2.2, 2.2, "#D7A86E", 3);
    e.position.set(-8.3, 0, 0.5);
    fijo.add(e, alfombra("#CE93D8", 1.8, [0, 0, 6.6]));
    const p = planta(1.2);
    p.position.set(9.0, 0, 5.6);
    fijo.add(p);
    // Manchas de pintura en el piso
    for (let i = 0; i < 6; i++) fijo.add(esfera(["#EF5350", "#42A5F5", "#FFEE58", "#66BB6A"][i % 4]!, 1, [-7 + i * 2.9, 0.012, 3.6 + (i % 3) * 1.7], [0.3 + (i % 2) * 0.15, 0.012, 0.24], 0));
    return { solidos: [{ x0: 1.7, x1: 5.1, z0: 4.6, z1: 7 }, { x0: -7.4, x1: -3.6, z0: 4.6, z1: 6.9 }, { x0: -9.5, x1: -7.1, z0: 0, z1: 1.3 }] };
  },
});

// ---------- Almacén de Doña Rosa ----------
export const tiendita = salaConMural({
  id: "tiendita", titulo: "Almacén",
  ancho: 17, fondo: 8.6, alto: 6.2, pared: "#FFF3C4", piso: "#B0BEC5", baldosa: true, franja: "#EF5350",
  filas: 1, tam: [2.6, 2.2], yMural: 3.2,
  tarjetas: [{ ruta: "/juegos/tiendita", nombre: "Ayudar a vender", icono: "🛒", color: "#EF5350", frase: "¡Qué bueno que llegaron! Ayúdenme a atender el almacén." }],
  anfitrion: { quien: "rosa", x: 3.6, z: 2.3, saludo: "¡Buenas! Soy Doña Rosa. Toca la tarjeta y me ayudas a vender." },
  decorar(fijo, raiz, c): Extra {
    ventanas(raiz, c, [7.0], 3.6, 1.5, 2.0);
    // Mostrador con balanza y caja
    fijo.add(caja("#A1887F", 6.5, 1.15, 1.0, [3.4, 0.58, 3.5], 0.08), caja("#EFEBE9", 6.7, 0.12, 1.2, [3.4, 1.2, 3.5], 0.05));
    fijo.add(caja("#546E7A", 0.8, 0.5, 0.6, [5.7, 1.5, 3.5], 0.08), caja("#B0BEC5", 0.6, 0.3, 0.1, [5.7, 1.9, 3.3], 0.03), cilindro("#CFD8DC", 0.4, 0.3, 0.12, [1.4, 1.4, 3.5], 14));
    // Estantes con productos y cajones de fruta
    for (const x of [-6.4, -3.6]) {
      const e = estante(2.5, 3.2, "#C8A27A", 4);
      e.position.set(x, 0, 0.5);
      fijo.add(e);
    }
    const FRUTAS = ["#E53935", "#FB8C00", "#FDD835", "#7CB342", "#8E24AA"];
    FRUTAS.forEach((col, i) => {
      const x = -6.6 + i * 1.5, z = 5.6;
      fijo.add(girar(caja("#BC8F5F", 1.25, 0.5, 0.9, [x, 0.5, z], 0.05), -0.25));
      for (let k = 0; k < 9; k++) fijo.add(esfera(col, 0.17, [x - 0.36 + (k % 3) * 0.36, 0.82 - Math.floor(k / 3) * 0.08, z - 0.25 + Math.floor(k / 3) * 0.26]));
    });
    // Sacos y toldo
    for (const [x, col] of [[7.3, "#D7CCC8"], [6.4, "#BCAAA4"]] as const) fijo.add(esfera(col, 1, [x, 0.5, 6.2], [0.5, 0.6, 0.45], 1));
    for (let i = 0; i < 12; i++) fijo.add(caja(i % 2 ? "#FFFFFF" : "#EF5350", 0.56, 0.08, 1.3, [0.3 + i * 0.56, 4.9, 0.7], 0.02));
    return { solidos: [{ x0: 0, x1: 6.8, z0: 1.3, z1: 4.1 }, { x0: -7.7, x1: -2.3, z0: 0, z1: 1.3 }, { x0: -7.4, x1: 0.2, z0: 5.0, z1: 6.2 }] };
  },
});

// ---------- Tienda de disfraces ----------
export const disfraces = salaConMural({
  id: "disfraces", titulo: "Disfraces",
  ancho: 17, fondo: 8.6, alto: 6.2, pared: "#E6D9FF", piso: "#C59B76", franja: "#BA68C8",
  filas: 1, tam: [2.6, 2.2], yMural: 3.2,
  tarjetas: [{ ruta: "/disfraces", nombre: "Probarse disfraces", icono: "👑", color: "#8E24AA", frase: "¡La tienda de disfraces! ¿Qué te quieres probar?" }],
  decorar(fijo, raiz, c): Extra {
    ventanas(raiz, c, [-7.0, 7.0], 3.6, 1.5, 2.0);
    // Vitrinas con los accesorios de verdad, girando despacio
    const giran: THREE.Object3D[] = [];
    ["corona", "sombrero", "gorro", "flores", "varita", "osito"].forEach((id, i) => {
      const x = -6.2 + i * 2.5 + (i > 2 ? 0.0 : 0), z = i % 2 ? 5.9 : 4.7;
      fijo.add(cilindro("#FFFFFF", 0.5, 0.56, 1.0, [x, 0.5, z], 18), cilindro("#CE93D8", 0.56, 0.56, 0.08, [x, 1.04, z], 18));
      const a = accesorioDeVitrina(id, c.nino);
      if (a) {
        const g = grupo([a], [x, id === "varita" ? 1.15 : id === "osito" ? 1.45 : 1.05, z]);
        raiz.add(g);
        giran.push(g);
      }
    });
    // Espejo y perchero
    fijo.add(caja("#FFD54F", 1.5, 2.8, 0.12, [-4.6, 1.6, 0.1], 0.1), caja(mat("#E3F2FD", { rug: 0.08, metal: 0.5 }), 1.25, 2.5, 0.06, [-4.6, 1.6, 0.17], 0.08));
    fijo.add(cilindro("#90A4AE", 0.04, 0.04, 3.4, [4.9, 2.3, 0.6], 6).rotateZ(Math.PI / 2));
    for (const l of [-1, 1]) fijo.add(cilindro("#90A4AE", 0.05, 0.05, 2.3, [4.9 + l * 1.7, 1.15, 0.6], 6));
    ["#EF5350", "#42A5F5", "#FFCA28", "#66BB6A", "#EC407A", "#7E57C2"].forEach((col, i) => fijo.add(caja(col, 0.42, 1.3, 0.16, [3.5 + i * 0.56, 1.55, 0.6], 0.1)));
    fijo.add(alfombra("#F8BBD0", 2.0, [0, 0, 6.9]));
    return {
      actualizar: (_dt, t) => { for (const [i, g] of giran.entries()) g.rotation.y = t * 0.5 + i; },
      solidos: [0, 1, 2, 3, 4, 5].map((i) => ({ x0: -6.8 + i * 2.5, x1: -5.6 + i * 2.5, z0: (i % 2 ? 5.9 : 4.7) - 0.6, z1: (i % 2 ? 5.9 : 4.7) + 0.6 })),
    };
  },
});

// ---------- Veterinaria ----------
export const veterinaria = salaConMural({
  id: "veterinaria", titulo: "Veterinaria",
  ancho: 17, fondo: 8.6, alto: 6.2, pared: "#D5F5EC", piso: "#CFD8DC", baldosa: true, franja: "#26A69A",
  filas: 1, tam: [2.6, 2.2], yMural: 3.2,
  tarjetas: [{ ruta: "/veterinaria", nombre: "Cuidar animales", icono: "🩺", color: "#26A69A", frase: "¡Hay pacientes esperando! Vamos a cuidarlos." }],
  anfitrion: { quien: "lucas", x: 3.4, z: 2.6, saludo: "¡Hola! Soy el doctor Lucas. ¿Me ayudas a cuidar a los animales?" },
  decorar(fijo, raiz, c): Extra {
    ventanas(raiz, c, [-7.0, 7.0], 3.6, 1.5, 2.0);
    // Camilla
    fijo.add(caja("#ECEFF1", 2.6, 0.14, 1.3, [-0.2, 1.05, 5.4], 0.06), caja("#80CBC4", 2.3, 0.1, 1.1, [-0.2, 1.15, 5.4], 0.05));
    for (const x of [-1, 1]) for (const z of [-1, 1]) fijo.add(cilindro("#B0BEC5", 0.06, 0.06, 1.0, [-0.2 + x * 1.1, 0.5, 5.4 + z * 0.5], 8));
    // Botiquín y estante
    fijo.add(caja("#FFFFFF", 1.4, 1.2, 0.3, [-4.6, 3.4, 0.2], 0.08), caja("#EF5350", 0.5, 0.14, 0.04, [-4.6, 3.4, 0.37], 0.02), caja("#EF5350", 0.14, 0.5, 0.04, [-4.6, 3.4, 0.37], 0.02));
    const e = estante(2.2, 2.0, "#B0BEC5", 2);
    e.position.set(6.6, 0, 0.5);
    fijo.add(e);
    // Sala de espera
    const b = banca("#80CBC4");
    b.position.set(-6.2, 0, 3.4);
    b.rotation.y = 0.5;
    fijo.add(b);
    const p = planta(1.2);
    p.position.set(7.8, 0, 5.8);
    fijo.add(p);
    const mover = animales(raiz, [["gato", -5.6, 5.6, 1.2], ["perro", 5.2, 6.2, 1.4], ["conejo", -0.2, 0, 0]]);
    raiz.children[raiz.children.length - 1]!.position.set(-0.2, 1.2, 5.4);
    return { actualizar: mover, solidos: [{ x0: -1.6, x1: 1.2, z0: 4.6, z1: 6.2 }, { x0: 5.4, x1: 7.8, z0: 0, z1: 1.3 }] };
  },
});

// ---------- Parque ----------
export const plaza = patioConCarteles({
  id: "plaza", titulo: "Parque", ancho: 22, fondo: 10, suelo: "#8BC34A", claro: "#C5E1A5",
  carteles: [
    { x: -5.5, z: 2.2, ruta: "/plaza", nombre: "Juegos del parque", icono: "🛝", color: "#42A5F5", frase: "¡Al parque de juegos! Columpio, resbalín y balancín." },
    { x: 5.5, z: 2.2, ruta: "/arenero", nombre: "Arenero", icono: "🏖️", color: "#FFB300", frase: "¡Al arenero! Vamos a jugar con la arena." },
  ],
  decorar(fijo, raiz): Extra {
    // Columpio
    for (const l of [-1, 1]) for (const k of [-1, 1]) fijo.add(girar(cilindro("#E53935", 0.08, 0.08, 3.3, [-8.5 + l * 1.5, 1.6, 6 + k * 0.5], 8), k * 0.3));
    fijo.add(cilindro("#E53935", 0.08, 0.08, 3.2, [-8.5, 3.15, 6], 8).rotateZ(Math.PI / 2));
    const col = grupo([], [-8.5, 3.15, 6]);
    col.add(cilindro("#795548", 0.02, 0.02, 2.2, [-0.35, -1.1, 0], 4), cilindro("#795548", 0.02, 0.02, 2.2, [0.35, -1.1, 0], 4), caja("#FFCA28", 0.9, 0.08, 0.4, [0, -2.2, 0], 0.03));
    raiz.add(col);
    // Resbalín
    fijo.add(caja("#1E88E5", 1.2, 0.12, 1.2, [-2.5, 2.2, 5.2], 0.05), girar(caja("#43A047", 1.0, 0.1, 3.6, [-2.5, 1.1, 7.2], 0.05), 0.62));
    for (const l of [-1, 1]) fijo.add(cilindro("#1E88E5", 0.07, 0.07, 2.2, [-2.5 + l * 0.5, 1.1, 4.7], 8), girar(caja("#43A047", 0.08, 0.3, 3.6, [-2.5 + l * 0.52, 1.25, 7.2], 0.03), 0.62));
    for (let i = 0; i < 5; i++) fijo.add(caja("#FFCA28", 1.0, 0.07, 0.1, [-2.5, 0.4 + i * 0.4, 4.6 - 0.02 * i], 0.02));
    // Arenero
    fijo.add(caja("#BC8F5F", 4.2, 0.3, 3.0, [8, 0.15, 6.6], 0.1), caja("#FFE0A3", 3.8, 0.32, 2.6, [8, 0.17, 6.6], 0.08), cilindro("#EF5350", 0.22, 0.17, 0.3, [7.2, 0.48, 6.2], 12), cono("#FFD180", 0.4, 0.5, [8.8, 0.58, 7], 12));
    const b = banca();
    b.position.set(3.8, 0, 2.0);
    fijo.add(b);
    const mariposas = [0, 1, 2].map((i) => {
      const m = crearAnimal("mariposa");
      raiz.add(m.raiz);
      return { m, volar: crearVuelo(m, { x: -4 + i * 5, y: 1.6 + i * 0.3, z: 5 }, 2.2, 0.5, i * 2) };
    });
    return {
      actualizar: (dt, t) => {
        col.rotation.x = Math.sin(t * 1.6) * 0.35;
        for (const x of mariposas) { x.volar(dt, t); x.m.actualizar(dt, t); }
      },
      solidos: [{ x0: -10.3, x1: -6.7, z0: 5.2, z1: 6.8 }, { x0: -3.3, x1: -1.7, z0: 4.4, z1: 8.6 }, { x0: 5.8, x1: 10.2, z0: 5, z1: 8.2 }, { x0: 2.8, x1: 4.8, z0: 1.6, z1: 2.5 }],
    };
  },
});

// ---------- Huerto ----------
export const huerto = patioConCarteles({
  id: "huerto", titulo: "Huerto", ancho: 22, fondo: 10, suelo: "#7CB342",
  carteles: [
    { x: -6, z: 2.0, ruta: "/huerto", nombre: "Cuidar el huerto", icono: "🌱", color: "#43A047", frase: "¡A sembrar, regar y cosechar!" },
    { x: 6, z: 2.0, ruta: "/descubrir/verduras", nombre: "Verduras", icono: "🥕", color: "#FB8C00", frase: "¡Busquemos verduras del huerto!" },
  ],
  anfitrion: { quien: "pedro", x: -2.4, z: 2.8, saludo: "¡Hola, niños! Soy Don Pedro. Vengan a ver cómo crece el huerto." },
  decorar(fijo, raiz): Extra {
    // Surcos de tierra con verduras
    for (let f = 0; f < 3; f++) {
      const z = 5.0 + f * 1.5;
      for (const lado of [-1, 1]) {
        const x0 = lado * 5.6;
        fijo.add(caja("#795548", 7.4, 0.3, 0.9, [x0, 0.1, z], 0.14));
        for (let i = 0; i < 7; i++) {
          const x = x0 - 3.1 + i * 1.03, tipo = (f + (lado > 0 ? 1 : 0)) % 3;
          if (tipo === 0) { fijo.add(cono("#FB8C00", 0.13, 0.3, [x, 0.3, z], 8).rotateX(Math.PI)); for (let k = 0; k < 3; k++) fijo.add(esfera("#66BB6A", 1, [x + (k - 1) * 0.1, 0.62, z], [0.07, 0.24, 0.07], 0)); }
          else if (tipo === 1) { fijo.add(esfera("#9CCC65", 0.26, [x, 0.42, z], [1, 0.85, 1], 1), esfera("#C5E1A5", 0.17, [x, 0.52, z], [1, 0.8, 1], 0)); }
          else { fijo.add(cilindro("#558B2F", 0.03, 0.03, 0.8, [x, 0.6, z], 5), esfera("#E53935", 0.14, [x + 0.1, 0.7, z + 0.05]), esfera("#E53935", 0.12, [x - 0.1, 0.52, z + 0.06]), esfera("#43A047", 1, [x, 0.95, z], [0.2, 0.14, 0.2], 0)); }
        }
      }
    }
    // Regadera, carretilla y espantapájaros
    fijo.add(cilindro("#4FC3F7", 0.3, 0.3, 0.5, [-4.6, 0.25, 8.8], 12), girar(cilindro("#4FC3F7", 0.05, 0.07, 0.6, [-4.15, 0.45, 8.8], 6), 0, 0, -0.9));
    fijo.add(caja("#EF5350", 1.3, 0.5, 0.9, [4.8, 0.6, 8.8], 0.1), cilindro("#37474F", 0.3, 0.3, 0.12, [5.6, 0.3, 8.8], 14).rotateX(Math.PI / 2));
    fijo.add(cilindro("#8D6E63", 0.06, 0.06, 2.6, [0, 1.3, 4.2], 6), cilindro("#8D6E63", 0.05, 0.05, 1.8, [0, 1.9, 4.2], 6).rotateZ(Math.PI / 2), caja("#1E88E5", 1.0, 0.9, 0.3, [0, 1.75, 4.2], 0.1), esfera("#FFE0B2", 0.34, [0, 2.6, 4.2]), cono("#FFB300", 0.5, 0.4, [0, 3.0, 4.2], 12));
    const mover = animales(raiz, [["gallina", 9.6, 3.2, 1.2], ["conejo", -9.6, 3.4, 1.0]]);
    const aves = [0, 1].map((i) => {
      const m = crearAnimal(i ? "pajaro" : "mariposa");
      raiz.add(m.raiz);
      return { m, volar: crearVuelo(m, { x: -3 + i * 6, y: 2.4 + i, z: 5.5 }, 3, 0.45, i * 3) };
    });
    return {
      actualizar: (dt, t) => { mover(dt, t); for (const x of aves) { x.volar(dt, t); x.m.actualizar(dt, t); } },
      solidos: [0, 1, 2].flatMap((f) => [-1, 1].map((l) => ({ x0: l * 5.6 - 3.8, x1: l * 5.6 + 3.8, z0: 4.6 + f * 1.5, z1: 5.4 + f * 1.5 }))),
    };
  },
});

// ---------- Granja ----------
export const granja = patioConCarteles({
  id: "granja", titulo: "Granja", ancho: 24, fondo: 10.5, suelo: "#8BC34A", claro: "#DCE775", sinCerca: true,
  carteles: [
    { x: -3.2, z: 2.4, ruta: "/granja", nombre: "Los animales", icono: "🐄", color: "#8D6E63", frase: "¡Vamos a ver a los animales de la granja!" },
    { x: 0, z: 2.4, ruta: "/animales", nombre: "Sonidos", icono: "🐔", color: "#FB8C00", frase: "¿Quién hace este sonido?" },
    { x: 3.2, z: 2.4, ruta: "/letra-animal", nombre: "Letra y animal", icono: "🐷", color: "#EC407A", frase: "¿Qué animal empieza con esta letra?" },
  ],
  decorar(fijo, raiz): Extra {
    // El granero rojo
    fijo.add(caja("#D84343", 5.6, 3.6, 3.4, [-8.6, 1.8, -2.4], 0.12), caja("#FFFFFF", 2.0, 2.4, 0.1, [-8.6, 1.2, -0.68], 0.06), caja("#8D3B3B", 1.7, 2.1, 0.1, [-8.6, 1.1, -0.64], 0.05));
    for (const s of [-1, 1]) fijo.add(girar(caja("#FFFFFF", 0.12, 2.6, 0.06, [-8.6, 1.1, -0.57], 0.02), 0, 0, s * 0.62));
    const t = techo(6.2, 4.2, 2.0, "#7B2D2D");
    t.position.set(-8.6, 3.55, -2.4);
    fijo.add(t);
    // Corral, fardos de paja y bebedero
    for (const [x, z, largo, giro] of [[7.4, 0.6, 8, 0], [7.4, 4.4, 8, 0], [3.4, 2.5, 3.8, Math.PI / 2], [11.4, 2.5, 3.8, Math.PI / 2]] as const) {
      const v = cerca(largo, "#D7B899", 0.9);
      v.position.set(x, 0, z);
      v.rotation.y = giro;
      raiz.add(v);
    }
    for (const [x, y, z, r] of [[-5.4, 0.5, 1.0, 0], [-4.4, 0.5, 1.2, 0.5], [-4.9, 1.4, 1.1, 0.2]] as const) fijo.add(girar(cilindro("#F2D16B", 0.5, 0.5, 0.9, [x, y, z], 14), 0, r, Math.PI / 2));
    fijo.add(caja("#8D6E63", 2.0, 0.4, 0.7, [-9.5, 0.2, 5.6], 0.08), caja("#4FC3F7", 1.8, 0.1, 0.5, [-9.5, 0.38, 5.6], 0.04));
    for (let i = 0; i < 3; i++) {
      const a = arbusto(1.1, "#FFEE58");
      a.position.set(i === 1 ? 6.5 : -11 + i * 11, 0, 10.4);
      fijo.add(a);
    }
    const mover = animales(raiz, [["vaca", 7.4, 2.5, 1.3], ["oveja", 9.4, 2.4, 1.0], ["cerdo", -7.4, 6.2, 1.6], ["caballo", -9.8, 3.4, 1.2], ["gallina", 2.0, 7.4, 1.6], ["pato", -3.0, 8.2, 1.4], ["perro", 6.0, 7.2, 2.0]]);
    return { actualizar: mover, solidos: [{ x0: 3.2, x1: 11.6, z0: 0.4, z1: 4.6 }, { x0: -6.2, x1: -3.8, z0: 0.4, z1: 1.8 }, { x0: -10.6, x1: -8.4, z0: 5.1, z1: 6.1 }] };
  },
});

// ---------- Paradero ----------
export const paradero = patioConCarteles({
  id: "paradero", titulo: "Paradero", ancho: 24, fondo: 10, suelo: "#9CCC65", claro: "#CFD8DC", sinCerca: true, tam: [2.4, 2.1],
  carteles: [
    { x: -9.6, z: 2.2, ruta: "/paradero", nombre: "Esperar el bus", icono: "🚌", color: "#FBC02D", frase: "¡Al paradero! Llega el bus con un amigo de otro país." },
    { x: -5.2, z: 2.2, ruta: "/amigo/max", nombre: "Casa de Max", icono: "🇺🇸", color: "#1E88E5", frase: "Max habla inglés. ¡Vamos a su casa!" },
    { x: -0.8, z: 2.2, ruta: "/amigo/bia", nombre: "Casa de Bia", icono: "🇧🇷", color: "#43A047", frase: "Bia habla portugués. ¡Vamos a su casa!" },
    { x: 3.6, z: 2.2, ruta: "/amigo/lea", nombre: "Casa de Léa", icono: "🇫🇷", color: "#C62828", frase: "Léa habla francés. ¡Vamos a su casa!" },
    { x: 8.0, z: 2.2, ruta: "/amigo/xiaolin", nombre: "Casa de Xiao Lin", icono: "🇨🇳", color: "#D32F2F", frase: "Xiao Lin habla chino. ¡Vamos a su casa!" },
  ],
  decorar(fijo, raiz, c): Extra {
    // La calle y el bus que llega y se va
    fijo.add(caja("#78909C", 60, 0.06, 2.8, [0, 0.02, 7.6], 0.02));
    for (let i = 0; i < 14; i++) fijo.add(caja("#FFFFFF", 1.1, 0.02, 0.14, [-19 + i * 3, 0.06, 7.6], 0.005));
    const bus = grupo();
    bus.add(caja("#FBC02D", 5.4, 2.0, 2.0, [0, 1.55, 0], 0.3), caja("#F9A825", 5.5, 0.3, 2.06, [0, 0.95, 0], 0.08), caja("#FFFFFF", 5.0, 0.12, 1.9, [0, 2.6, 0], 0.05));
    for (let i = 0; i < 4; i++) bus.add(caja(mat("#B3E5FC", { rug: 0.15 }), 0.9, 0.75, 0.06, [-1.8 + i * 1.15, 1.9, 1.0], 0.08));
    for (const x of [-1.6, 1.6]) bus.add(cilindro("#263238", 0.45, 0.45, 0.3, [x, 0.5, 0.95], 16).rotateX(Math.PI / 2), cilindro("#B0BEC5", 0.2, 0.2, 0.32, [x, 0.5, 0.96], 10).rotateX(Math.PI / 2));
    bus.add(esfera(mat("#FFF59D", c.luces ? { emis: "#FFEE58", emisI: 1.2 } : {}), 0.16, [2.7, 1.0, 0.6]), esfera("#EF5350", 0.12, [-2.7, 1.0, 0.6]));
    bus.position.set(-30, 0, 7.6);
    raiz.add(bus);
    // El refugio del paradero con su banca
    fijo.add(caja("#4FC3F7", 3.4, 0.14, 1.5, [-9.6, 3.0, 4.9], 0.06), caja(mat("#E1F5FE", { opacidad: 0.5, rug: 0.1 }), 3.2, 2.2, 0.06, [-9.6, 1.8, 4.3], 0.03));
    for (const l of [-1, 1]) fijo.add(cilindro("#0288D1", 0.06, 0.06, 3.0, [-9.6 + l * 1.6, 1.5, 4.3], 8), cilindro("#0288D1", 0.06, 0.06, 3.0, [-9.6 + l * 1.6, 1.5, 5.5], 8));
    const b = banca("#FFCC80");
    b.position.set(-9.6, 0, 4.8);
    fijo.add(b);
    return {
      actualizar: (_dt, t) => {
        // Llega, espera y parte, una y otra vez.
        const u = (t % 22) / 22;
        const x = u < 0.25 ? -30 + (u / 0.25) ** 0.6 * 24 : u < 0.7 ? -6 : -6 + ((u - 0.7) / 0.3) ** 2 * 40;
        bus.position.x = x;
        bus.position.y = Math.abs(Math.sin(t * 9)) * (u < 0.25 || u > 0.7 ? 0.03 : 0.008);
      },
      solidos: [{ x0: -11.4, x1: -7.8, z0: 4.2, z1: 5.3 }],
    };
  },
});
