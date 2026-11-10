import { AMIGOS, TEMAS_AMIGO } from "../../amigos";
import { caja, cilindro, esfera } from "../base";
import type { Constructor } from "../motor";
import { alfombra, cuadro, estante, patioConCarteles, planta, salaConMural, ventanal } from "../sala";
import { arbusto, techo } from "../utileria";

/**
 * Las casas de los amigos de otros países y el patio de Tito, en 3D.
 * En cada casa el amigo recibe al niño y en la pared están sus seis juegos,
 * que se anuncian en su idioma.
 */
const BANDERAS: Record<string, (g: CanvasRenderingContext2D, w: number, h: number) => void> = {
  max: (g, w, h) => { for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? "#FFFFFF" : "#D32F2F"; g.fillRect(0, (i * h) / 7, w, h / 7 + 1); } g.fillStyle = "#1A3A8A"; g.fillRect(0, 0, w * 0.42, h * 0.56); g.fillStyle = "#fff"; for (let i = 0; i < 9; i++) g.fillRect(10 + (i % 3) * 32, 10 + Math.floor(i / 3) * 28, 8, 8); },
  bia: (g, w, h) => { g.fillStyle = "#2E9E4F"; g.fillRect(0, 0, w, h); g.fillStyle = "#FDD835"; g.beginPath(); g.moveTo(w / 2, 12); g.lineTo(w - 16, h / 2); g.lineTo(w / 2, h - 12); g.lineTo(16, h / 2); g.fill(); g.fillStyle = "#1A3A8A"; g.beginPath(); g.arc(w / 2, h / 2, h * 0.22, 0, 7); g.fill(); },
  lea: (g, w, h) => { ["#1A3A8A", "#FFFFFF", "#D32F2F"].forEach((c, i) => { g.fillStyle = c; g.fillRect((i * w) / 3, 0, w / 3 + 1, h); }); },
  xiaolin: (g, w, h) => { g.fillStyle = "#D32F2F"; g.fillRect(0, 0, w, h); g.fillStyle = "#FDD835"; g.beginPath(); g.arc(w * 0.22, h * 0.3, h * 0.14, 0, 7); g.fill(); for (let i = 0; i < 4; i++) g.fillRect(w * 0.4 + (i % 2) * 14, h * 0.12 + i * 16, 8, 8); },
};

function casaDeAmigo(id: string): Constructor {
  const a = AMIGOS.find((x) => x.id === id)!;
  return salaConMural({
    id: `amigo-${a.id}`, titulo: `Casa de ${a.nombre}`, salida: "paradero",
    ancho: 18, fondo: 9, alto: 6.4, pared: a.fondo, piso: "#D2A679", franja: a.color,
    filas: 2, tam: [2.2, 1.8], yMural: 2.0,
    tarjetas: TEMAS_AMIGO.map((t) => ({ ruta: `/amigo/${a.id}/${t.tema}`, nombre: a.juegos[t.tema].nombre, icono: t.emoji, color: t.color, frase: a.juegos[t.tema].frase, idioma: a.idioma })),
    anfitrion: { quien: a.id, x: 7.2, z: 2.8, saludo: `¡Llegamos a la casa de ${a.nombre}! Aquí jugamos en ${a.lengua}. Toca una tarjeta.` },
    decorar(fijo, raiz, c) {
      for (const x of [-7.6, 7.6]) {
        const v = ventanal(c, 1.4, 2.0);
        v.position.set(x, 3.8, 0.05);
        raiz.add(v);
      }
      const b = cuadro(1.5, 1.0, BANDERAS[a.id] ?? ((g, w, h) => { g.fillStyle = a.color; g.fillRect(0, 0, w, h); }));
      b.position.set(-7.6, 1.6, 0.06);
      raiz.add(b);
      const e = estante(2.0, 2.0, "#D7A86E", 2);
      e.position.set(7.4, 0, 0.5);
      // Sillón del color del amigo, alfombra, pelota y planta
      fijo.add(e, alfombra(a.color, 1.9, [0, 0, 6.4]));
      fijo.add(caja(a.color, 2.6, 0.6, 1.1, [-5.6, 0.45, 5.6], 0.2), caja(a.color, 2.6, 1.0, 0.4, [-5.6, 0.95, 5.1], 0.18), esfera("#FFFFFF", 1, [-5.6, 0.95, 5.6], [0.4, 0.32, 0.2], 1));
      fijo.add(esfera("#FDD835", 0.3, [4.6, 0.3, 6.8]), cilindro("#8D6E63", 0.5, 0.5, 0.5, [5.8, 0.25, 6.2], 14), esfera("#EF5350", 0.2, [5.8, 0.62, 6.2]));
      const p = planta(1.15);
      p.position.set(-8.4, 0, 4.2);
      fijo.add(p);
      return { solidos: [{ x0: -7, x1: -4.2, z0: 4.8, z1: 6.3 }, { x0: 6.2, x1: 8.6, z0: 0, z1: 1.3 }, { x0: 5.2, x1: 6.4, z0: 5.6, z1: 6.8 }] };
    },
  });
}

export const AMIGOS_3D: Record<string, Constructor> = Object.fromEntries(AMIGOS.map((a) => [`amigo-${a.id}`, casaDeAmigo(a.id)]));

/** El patio de la casa de Emilia: la casita de Tito, sus juguetes y su juego. */
export const patio = patioConCarteles({
  id: "patio", titulo: "Patio de Tito", salida: "casa", ancho: 18, fondo: 9.5, suelo: "#8BC34A", claro: "#C5E1A5",
  carteles: [{ x: 0, z: 2.2, ruta: "/casa/patio", nombre: "Jugar con Tito", icono: "🦌", color: "#66BB6A", frase: "¡Tito quiere jugar! Vamos a cuidarlo." }],
  decorar(fijo) {
    // La casita de Tito con su nombre, su plato y su pelota
    fijo.add(caja("#FFCC80", 2.4, 1.7, 2.0, [-6, 0.85, 2.4], 0.1), caja("#5D4037", 1.0, 1.1, 0.1, [-6, 0.55, 3.42], 0.4));
    const t = techo(2.9, 2.6, 1.1, "#EF5350");
    t.position.set(-6, 1.65, 2.4);
    fijo.add(t);
    fijo.add(cilindro("#42A5F5", 0.42, 0.32, 0.2, [-4.2, 0.1, 4.2], 14), cilindro("#B3E5FC", 0.34, 0.34, 0.04, [-4.2, 0.2, 4.2], 14));
    fijo.add(esfera("#EF5350", 0.36, [4.4, 0.36, 5.6]), esfera("#FFFFFF", 0.37, [4.4, 0.36, 5.6], [1, 0.3, 1], 1));
    // Túnel para saltar y arbustos con flores
    for (const x of [5.6, 7.0]) fijo.add(cilindro("#FFB300", 0.08, 0.08, 1.2, [x, 0.6, 3.2], 8));
    fijo.add(caja("#FF7043", 1.7, 0.12, 0.12, [6.3, 0.9, 3.2], 0.04));
    for (const [x, col] of [[-8, "#F48FB1"], [8.2, "#FFEE58"]] as const) {
      const ar = arbusto(1.2, col);
      ar.position.set(x, 0, 7.6);
      fijo.add(ar);
    }
    return { solidos: [{ x0: -7.4, x1: -4.6, z0: 1.2, z1: 3.6 }, { x0: 5.4, x1: 7.2, z0: 2.9, z1: 3.5 }] };
  },
});
