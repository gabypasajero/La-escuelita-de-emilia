import { describe, expect, it } from "vitest";
import {
  ANIMALES,
  ESTADO_INICIAL,
  LETRAS,
  presentarLetra,
  rondaSonidoInicial,
  rondaSuma,
  rondaAnimalPorLetra,
  fonema,
  type Ronda,
  calcularEstrellas,
  crearPuertaParental,
  registrarRespuesta,
  rondaContar,
  rondaLetraInicial,
  rondaSonidoAnimal,
  tableroMemoria,
  NIVELES_MEMORIA,
  PAREJAS_POR_NIVEL,
} from "./index";

/** Generador determinista para tests reproducibles. */
function semilla(n: number) {
  let s = n;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

describe("contenido", () => {
  it("incluye el alfabeto español con Ñ", () => {
    expect(LETRAS).toHaveLength(27);
    expect(LETRAS.map((l) => l.letra)).toContain("Ñ");
    for (const l of LETRAS) expect(l.palabra.toUpperCase().startsWith(l.letra)).toBe(true);
  });

  it("los animales tienen ids únicos", () => {
    expect(new Set(ANIMALES.map((a) => a.id)).size).toBe(ANIMALES.length);
  });
});

describe("rondas", () => {
  it("la opción correcta siempre está entre las opciones, sin repetidos", () => {
    const azar = semilla(42);
    for (let i = 0; i < 200; i++) {
      for (const nivel of [1, 2, 3] as const) {
        for (const ronda of [rondaLetraInicial(nivel, azar), rondaContar(nivel, azar), rondaSonidoAnimal(nivel, azar)] as Array<Ronda<unknown>>) {
          expect(ronda.opciones).toContain(ronda.correcta);
          expect(new Set(ronda.opciones).size).toBe(ronda.opciones.length);
        }
      }
    }
  });

  it("más nivel = más opciones", () => {
    expect(rondaSonidoAnimal(1, semilla(1)).opciones).toHaveLength(2);
    expect(rondaSonidoAnimal(3, semilla(1)).opciones).toHaveLength(4);
  });

  it("contar en nivel 1 nunca pasa de 3", () => {
    const azar = semilla(7);
    for (let i = 0; i < 100; i++) expect(rondaContar(1, azar).cantidad).toBeLessThanOrEqual(3);
  });

  it("cada tablero de memoria tiene parejas completas en todos los temas y niveles", () => {
    for (const tema of ["frutas", "animales", "letras", "numeros", "mezcla"] as const) {
      for (let nivel = 1; nivel <= NIVELES_MEMORIA; nivel++) {
        const tablero = tableroMemoria(nivel, tema, semilla(nivel * 7));
        expect(tablero).toHaveLength(PAREJAS_POR_NIVEL[nivel - 1]! * 2);
        const conteo = new Map<string, number>();
        for (const c of tablero) conteo.set(c.par, (conteo.get(c.par) ?? 0) + 1);
        for (const n of conteo.values()) expect(n).toBe(2);
      }
    }
  });

  it("en letras la pareja es la letra con su dibujo", () => {
    const tablero = tableroMemoria(1, "letras", semilla(5));
    const par = tablero.filter((c) => c.par === tablero[0]!.par);
    const letra = LETRAS.find((l) => l.letra === par[0]!.par)!;
    expect(par.map((c) => c.cara).sort()).toEqual([letra.letra, letra.emoji].sort());
  });
});

describe("dificultad adaptativa", () => {
  it("sube tras 3 aciertos y baja tras 2 errores", () => {
    let e = ESTADO_INICIAL;
    e = registrarRespuesta(e, true);
    e = registrarRespuesta(e, true);
    expect(e.nivel).toBe(1);
    e = registrarRespuesta(e, true);
    expect(e.nivel).toBe(2);
    e = registrarRespuesta(e, false);
    e = registrarRespuesta(e, false);
    expect(e.nivel).toBe(1);
  });

  it("nunca baja de 1 ni sube de 3", () => {
    let e = ESTADO_INICIAL;
    for (let i = 0; i < 5; i++) e = registrarRespuesta(e, false);
    expect(e.nivel).toBe(1);
    for (let i = 0; i < 20; i++) e = registrarRespuesta(e, true);
    expect(e.nivel).toBe(3);
  });

  it("calcula estrellas", () => {
    expect(calcularEstrellas(10, 10)).toBe(3);
    expect(calcularEstrellas(7, 10)).toBe(2);
    expect(calcularEstrellas(2, 10)).toBe(1);
  });
});

describe("puerta parental", () => {
  it("acepta solo la respuesta correcta", () => {
    const puerta = crearPuertaParental(() => 0); // 3 × 3
    expect(puerta.pregunta).toBe("¿Cuánto es 3 × 3?");
    expect(puerta.verificar(" 9 ")).toBe(true);
    expect(puerta.verificar("6")).toBe(false);
  });
});

describe("letras por sonido", () => {
  it("cada letra tiene nombre, y sonido salvo la H", () => {
    for (const l of LETRAS) {
      expect(l.nombre).not.toBe("");
      expect(l.sonido === "").toBe(l.letra === "H");
    }
  });

  it("presenta la letra con nombre, sonido y palabra", () => {
    expect(presentarLetra(LETRAS.find((l) => l.letra === "M")!)).toBe("Eme. Suena mmm. Mmm… mono.");
    expect(presentarLetra(LETRAS.find((l) => l.letra === "H")!)).toContain("no suena");
  });

  it("en el juego de sonidos ninguna opción incorrecta suena igual que la correcta", () => {
    const azar = semilla(11);
    for (let i = 0; i < 300; i++) {
      const r = rondaSonidoInicial(3, azar);
      expect(r.opciones).toContain(r.correcta);
      for (const o of r.opciones) if (o !== r.correcta) expect(fonema(o)).not.toBe(fonema(r.correcta));
      expect(r.correcta.sonido).not.toBe("");
    }
  });
});

describe("sumas y animal por letra", () => {
  it("la suma es correcta y está entre las opciones", () => {
    const azar = semilla(21);
    for (let i = 0; i < 200; i++) for (const n of [1, 2, 3] as const) {
      const r = rondaSuma(n, azar);
      expect(r.a + r.b).toBe(r.correcta);
      expect(r.a).toBeGreaterThan(0);
      expect(r.b).toBeGreaterThan(0);
      expect(r.opciones).toContain(r.correcta);
      expect(new Set(r.opciones).size).toBe(r.opciones.length);
    }
  });

  it("solo un animal empieza con el sonido pedido", () => {
    const azar = semilla(5);
    for (let i = 0; i < 200; i++) {
      const r = rondaAnimalPorLetra(3, azar);
      const ini = (a: { nombre: string }) => a.nombre[0]!.toUpperCase();
      expect(ini(r.correcta)).toBe(r.letra.letra);
      expect(r.opciones.filter((o) => fonema({ ...r.letra, letra: ini(o) }) === fonema(r.letra))).toHaveLength(1);
    }
  });
});
