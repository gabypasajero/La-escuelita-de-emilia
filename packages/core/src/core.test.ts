import { describe, expect, it } from "vitest";
import {
  ANIMALES,
  ESTADO_INICIAL,
  LETRAS,
  type Ronda,
  calcularEstrellas,
  crearPuertaParental,
  registrarRespuesta,
  rondaContar,
  rondaLetraInicial,
  rondaSonidoAnimal,
  tableroMemoria,
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

  it("el tablero de memoria tiene cada carta exactamente dos veces", () => {
    const tablero = tableroMemoria(2, semilla(3));
    expect(tablero).toHaveLength(8);
    const conteo = new Map<string, number>();
    for (const c of tablero) conteo.set(c.valor, (conteo.get(c.valor) ?? 0) + 1);
    for (const n of conteo.values()) expect(n).toBe(2);
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
