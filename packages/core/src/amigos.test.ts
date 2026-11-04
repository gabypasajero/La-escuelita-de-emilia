import { describe, expect, it } from "vitest";
import { LENGUAS, PALABRAS_INGLES, palabraEn, rondaAmigo, type IdiomaAmigo, type TemaIngles } from "./index";

const TEMAS: TemaIngles[] = ["saludos", "colores", "numeros", "animales", "cuerpo", "acciones"];
const IDIOMAS: IdiomaAmigo[] = ["en", "pt", "fr", "zh"];

describe("amigos de otros países", () => {
  it("portugués, francés y chino tienen las 41 palabras", () => {
    for (const l of Object.values(LENGUAS)) for (const p of PALABRAS_INGLES) expect(l.palabras[p.id], p.id).toBeTruthy();
  });

  it("cada amigo arma rondas válidas en su idioma, sin la palabra en español", () => {
    for (let i = 0; i < 60; i++)
      for (const idioma of IDIOMAS)
        for (const t of TEMAS)
          for (const n of [1, 2, 3] as const) {
            const r = rondaAmigo(idioma, t, n);
            expect(r.opciones).toContain(r.correcta);
            expect(new Set(r.opciones).size).toBe(r.opciones.length);
            expect(r.enunciado.length).toBeGreaterThan(0);
            expect(r.felicitacion).not.toContain("undefined");
            expect(r.enunciado).not.toContain("undefined");
            if (t !== "numeros" || idioma !== "zh") expect(r.enunciado).toContain(palabraEn(idioma, r.correcta.id).replace(/ ?[!！]$/, ""));
          }
  });

  it("en chino, «dos estrellas» se dice 两颗 (no 二)", () => {
    let visto = false;
    for (let i = 0; i < 300 && !visto; i++) {
      const r = rondaAmigo("zh", "numeros", 3);
      if (r.correcta.id === "two") { expect(r.enunciado).toBe("哪里有两颗星星？"); visto = true; }
    }
    expect(visto).toBe(true);
  });

  it("la ayuda de Emilia nombra al amigo correcto", () => {
    expect(rondaAmigo("pt", "colores", 1).ayuda).toContain("Bia");
    expect(rondaAmigo("fr", "colores", 1).ayuda).toContain("Léa");
    expect(rondaAmigo("zh", "colores", 1).ayuda).toContain("Xiao Lin");
    expect(rondaAmigo("en", "colores", 1).ayuda).toContain("Max");
  });
});
