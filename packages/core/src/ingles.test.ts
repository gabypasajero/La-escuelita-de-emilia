import { describe, expect, it } from "vitest";
import { PALABRAS_INGLES, palabrasDelTema, rondaIngles, type TemaIngles } from "./index";

const TEMAS: TemaIngles[] = ["saludos", "colores", "numeros", "animales", "cuerpo", "acciones"];

describe("inglés con Max", () => {
  it("nivel Hello: unas 40-60 palabras, sin ids repetidos y con dibujo", () => {
    expect(PALABRAS_INGLES.length).toBeGreaterThanOrEqual(40);
    expect(new Set(PALABRAS_INGLES.map((x) => x.id)).size).toBe(PALABRAS_INGLES.length);
    for (const x of PALABRAS_INGLES) expect(x.emoji.length).toBeGreaterThan(0);
  });

  it("cada tema tiene al menos 5 palabras para jugar", () => {
    for (const t of TEMAS) expect(palabrasDelTema(t).length).toBeGreaterThanOrEqual(5);
  });

  it("las rondas traen la correcta, sin repetidas, con cantidad según nivel y del mismo tema", () => {
    for (let i = 0; i < 100; i++)
      for (const t of TEMAS)
        for (const n of [1, 2, 3] as const) {
          const r = rondaIngles(t, n);
          expect(r.opciones).toContain(r.correcta);
          expect(new Set(r.opciones).size).toBe(r.opciones.length);
          expect(r.opciones.length).toBe(n + 2);
          expect(r.opciones.every((o) => o.tema === t)).toBe(true);
        }
  });

  it("Max habla solo inglés: el enunciado no trae la palabra en español; la ayuda sí", () => {
    for (let i = 0; i < 100; i++)
      for (const t of TEMAS) {
        const r = rondaIngles(t, 3);
        expect(r.enunciado).toContain(r.correcta.en.replace(/!$/, ""));
        expect(r.ayuda).toContain(r.correcta.es);
        expect(r.ayuda).not.toContain("tu s");
      }
  });
});
