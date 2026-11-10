import { caja, cilindro, esfera, girar } from "../base";
import { alfombra, cuadro, estante, mesa, planta, salaConMural, silla, ventanal, type Tarjeta } from "../sala";

/**
 * La Escuelita en 3D: la sala de la tía Carla. En la pared del fondo está el
 * diario mural con una tarjeta por cada juego; al tocar una, el niño camina
 * hasta ella y el juego se abre en una ventana sobre la sala.
 */
const JUEGOS: Tarjeta[] = [
  { ruta: "/mi-nombre", nombre: "Mi nombre", icono: "✍️", color: "#EF5350", frase: "¡Vamos a aprender a escribir tu nombre!" },
  { ruta: "/trazar", nombre: "Escribir", icono: "✏️", color: "#5C6BC0", frase: "¡Vamos a aprender a escribir con el dedo!" },
  { ruta: "/letras", nombre: "Letras", icono: "🔤", color: "#29B6F6", frase: "¡Vamos a jugar con las letras y sus sonidos!" },
  { ruta: "/numeros", nombre: "Números", icono: "🔢", color: "#66BB6A", frase: "¡A contar!" },
  { ruta: "/sumas", nombre: "Sumas", icono: "➕", color: "#FFA726", frase: "¡Vamos a sumar con frutas!" },
  { ruta: "/letra-animal", nombre: "Letra y animal", icono: "🐒", color: "#FFCA28", frase: "¿Qué animal empieza con esta letra?" },
  { ruta: "/animales", nombre: "Sonidos", icono: "🐄", color: "#8D6E63", frase: "¿Quién hace este sonido?" },
  { ruta: "/juegos/memoria", nombre: "Memoria", icono: "🃏", color: "#AB47BC", frase: "¡A buscar parejas!" },
  { ruta: "/descubrir/colores", nombre: "Colores", icono: "🎨", color: "#EC407A", frase: "¡A jugar con los colores!" },
  { ruta: "/descubrir/formas", nombre: "Formas", icono: "🔺", color: "#7E57C2", frase: "¡Círculos, cuadrados y triángulos!" },
  { ruta: "/descubrir/mas-menos", nombre: "Más y menos", icono: "⚖️", color: "#26A69A", frase: "¿Dónde hay más?" },
  { ruta: "/descubrir/patrones", nombre: "¿Qué sigue?", icono: "🔴", color: "#FFB300", frase: "¡A descubrir patrones!" },
  { ruta: "/descubrir/verduras", nombre: "Verduras", icono: "🥕", color: "#7CB342", frase: "¡Busquemos verduras del huerto!" },
];

export const escuelita = salaConMural({
  id: "escuelita", titulo: "La Escuelita",
  ancho: 21, fondo: 9.5, alto: 6.6, pared: "#FFE9B8", piso: "#D9A066", franja: "#81D4FA",
  tarjetas: JUEGOS, filas: 2, tam: [1.95, 1.75], yMural: 2.05,
  anfitrion: { quien: "tia", x: 8.6, z: 2.6, saludo: "¡Hola! Bienvenidos a la escuelita. Toca una tarjeta del diario mural para jugar." },
  decorar(fijo, raiz, c) {
    // Ventanas a los lados del mural
    for (const l of [-1, 1]) {
      const v = ventanal(c, 1.7, 2.3);
      v.position.set(l * 9.5, 3.5, 0.05);
      raiz.add(v);
    }
    // Rincón de lectura (izquierda)
    const libros = estante(2.3, 2.3, "#D7A86E", 3);
    libros.position.set(-8.9, 0, 0.5);
    fijo.add(libros, alfombra("#F48FB1", 1.7, [-7.6, 0, 5.4]));
    for (const [x, z, col] of [[-8.3, 5.2, "#7E57C2"], [-7.0, 5.9, "#26A69A"]] as const) fijo.add(esfera(col, 1, [x, 0.22, z], [0.5, 0.22, 0.5], 1));
    // Mesitas con sillas (derecha y centro)
    for (const [x, z, col] of [[5.6, 6.0, "#4FC3F7"], [-2.6, 6.6, "#AED581"]] as const) {
      const m = mesa(col, 2.3, 1.3, 0.9);
      m.position.set(x, 0, z);
      fijo.add(m);
      for (const s of [-1, 1]) {
        const si = silla(s > 0 ? "#FF8A65" : "#FFD54F");
        si.position.set(x + s * 0.65, 0, z - 0.95);
        fijo.add(si);
      }
      // Lápices y hojas sobre la mesa
      fijo.add(caja("#FFFFFF", 0.5, 0.02, 0.36, [x - 0.4, 0.98, z + 0.1], 0.005), cilindro("#EF5350", 0.035, 0.035, 0.4, [x + 0.3, 1.0, z], 6));
      fijo.add(girar(cilindro("#42A5F5", 0.035, 0.035, 0.4, [x + 0.5, 1.0, z + 0.2], 6), Math.PI / 2, 0.6));
    }
    // Globo terráqueo, plantas y caja de juguetes
    fijo.add(cilindro("#8D6E63", 0.26, 0.3, 0.1, [9.6, 0.05, 5.2], 12), cilindro("#8D6E63", 0.04, 0.04, 0.7, [9.6, 0.4, 5.2], 6), esfera("#4FC3F7", 0.42, [9.6, 1.05, 5.2]), esfera("#81C784", 0.2, [9.75, 1.15, 5.5], [1, 1, 0.5], 0));
    for (const x of [-10, 10]) {
      const p = planta(1.15);
      p.position.set(x * 0.985, 0, 1.0);
      fijo.add(p);
    }
    fijo.add(caja("#FF8A65", 1.3, 0.7, 0.9, [1.8, 0.35, 7.6], 0.1), esfera("#FFEB3B", 0.28, [1.5, 0.92, 7.6]), esfera("#7E57C2", 0.22, [2.1, 0.86, 7.7]));
    // Banderines y dibujos arriba del mural
    const COL = ["#EF5350", "#FFCA28", "#66BB6A", "#42A5F5", "#AB47BC", "#FF7043"];
    for (let i = 0; i < 24; i++) {
      const x = -9.6 + i * 0.835;
      const b = girar(caja(COL[i % COL.length]!, 0.42, 0.5, 0.03, [x, 6.05 - Math.cos(((i % 8) - 3.5) * 0.5) * 0.12, 0.1], 0.01), 0, 0, Math.PI / 4);
      b.scale.set(0.8, 1, 1);
      fijo.add(b);
    }
    for (const [x, col] of [[-9.5, "#FFF59D"], [9.5, "#B3E5FC"]] as const) {
      const d = cuadro(1.2, 0.9, (g, w, h) => {
        g.fillStyle = col; g.fillRect(0, 0, w, h);
        g.fillStyle = "#FFB300"; g.beginPath(); g.arc(w * 0.75, h * 0.3, 26, 0, 7); g.fill();
        g.fillStyle = "#66BB6A"; g.fillRect(0, h * 0.75, w, h);
        g.fillStyle = "#EF5350"; g.fillRect(w * 0.2, h * 0.45, 60, 60);
        g.beginPath(); g.moveTo(w * 0.15, h * 0.47); g.lineTo(w * 0.2 + 30, h * 0.2); g.lineTo(w * 0.2 + 76, h * 0.47); g.fillStyle = "#8D6E63"; g.fill();
      });
      d.position.set(x, 1.55, 0.06);
      raiz.add(d);
    }
    return {
      solidos: [
        { x0: -10.2, x1: -7.6, z0: 0, z1: 1.3 },
        { x0: 4.3, x1: 6.9, z0: 4.6, z1: 6.8 }, { x0: -3.9, x1: -1.3, z0: 5.2, z1: 7.4 },
        { x0: 1.0, x1: 2.6, z0: 7.0, z1: 8.2 }, { x0: 9.1, x1: 10.1, z0: 4.7, z1: 5.7 },
      ],
    };
  },
});
