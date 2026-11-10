import * as THREE from "three";
import { ANIMALES_3D, crearAnimal, type Animal } from "../animal";
import { caja, disco, fusionar, grupo, letrero } from "../base";
import type { Constructor } from "../motor";
import { crearPersona, ELENCO, type Persona } from "../personaje";

/**
 * Galería de prueba: todo el elenco y todos los animales en fila, pasando por
 * sus movimientos (quietos, hablando, saludando, celebrando y caminando en
 * su lugar). Sirve para revisar los modelos; no es parte del juego.
 */
export const galeria: Constructor = () => {
  const raiz = new THREE.Group();
  const piso = grupo();
  piso.add(caja("#F3E5F5", 30, 0.6, 14, [0, -0.3, 5], 0.25));
  piso.add(caja("#E1BEE7", 30, 7, 0.5, [0, 3.2, -1.2], 0.2));
  raiz.add(fusionar(piso, { sombra: false }));
  raiz.add(disco("#FFFFFF", 12, [0, 0.02, 5], [1, 0.42]));

  const personas: Persona[] = Object.keys(ELENCO).map((id, i, todos) => {
    const p = crearPersona(ELENCO[id]!);
    p.raiz.position.set((i - (todos.length - 1) / 2) * 2.05, 0, 2.6);
    const n = letrero(id, { alto: 0.34 });
    n.position.y = p.alto + 0.35;
    p.raiz.add(n);
    raiz.add(p.raiz);
    return p;
  });
  const animales: Animal[] = ANIMALES_3D.map((id, i, todos) => {
    const a = crearAnimal(id);
    a.raiz.position.set((i - (todos.length - 1) / 2) * 1.45, id === "mariposa" || id === "pajaro" ? 1.1 : 0, 6.2);
    a.rumbo = 0.5;
    const n = letrero(id, { alto: 0.26, fondo: "#5C6BC0" });
    n.position.y = a.alto + 0.4;
    a.raiz.add(n);
    raiz.add(a.raiz);
    return a;
  });

  return {
    id: "galeria", titulo: "Galería", exterior: false, raiz,
    inicio: { x: 0, z: 9.4 },
    limites: { x0: -13, x1: 13, z0: 0.5, z1: 10.5 },
    solidos: [],
    interactivos: [],
    camara: { modo: "sala", ancho: 25, alto: 6.4, fondo: 10, inclina: 22 },
    fondo: ["#D1C4E9", "#F3E5F5"],
    salida: "barrio",
    actualizar(dt, t) {
      const fase = Math.floor(t / 3.2) % 5;
      for (const p of personas) {
        p.hablando = fase === 1;
        p.saludando = fase === 2;
        p.celebrando = fase === 3;
        p.velocidad = fase === 4 ? 3 : 0;
        p.rumbo = fase === 4 ? 0.9 : 0;
        p.actualizar(dt, t);
      }
      for (const a of animales) {
        a.contento = fase === 3;
        a.velocidad = fase === 4 ? 1.2 : 0;
        a.actualizar(dt, t);
      }
    },
  };
};
