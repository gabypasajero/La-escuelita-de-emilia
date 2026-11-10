import { describe, expect, it } from "vitest";
import { ABECEDARIO_TRAZO, marcarPuntos, GLIFOS, LETRAS, NUMEROS_TRAZO, VOCALES_TRAZO, avanzarTrazo, puntosDeControl } from "./index";

describe("trazos para escribir", () => {
  it("hay trazo para cada letra del abecedario, las vocales minúsculas y los números", () => {
    for (const c of [...LETRAS.map((l) => l.letra), ...VOCALES_TRAZO, ...NUMEROS_TRAZO]) expect(GLIFOS[c], c).toBeDefined();
  });

  it("todos los puntos caben en la caja de dibujo", () => {
    for (const [c, trazos] of Object.entries(GLIFOS))
      for (const t of trazos) for (const [x, y] of t) {
        expect(x, c).toBeGreaterThanOrEqual(0);
        expect(x, c).toBeLessThanOrEqual(100);
        expect(y, c).toBeGreaterThanOrEqual(-15);
        expect(y, c).toBeLessThanOrEqual(140);
      }
  });

  it("los puntos de control quedan separados y siguiendo el trazo", () => {
    const control = puntosDeControl([[0, 0], [0, 110]]);
    expect(control).toHaveLength(11);
    expect(control.at(-1)).toEqual([0, 110]);
  });

  it("recorrer el trazo completa todos los puntos, aunque se salte uno", () => {
    const control = puntosDeControl(GLIFOS.L![0]!);
    let logrados = 0;
    control.forEach((p, i) => { if (i !== 3) logrados = avanzarTrazo(control, logrados, p); });
    expect(logrados).toBe(control.length);
    expect(avanzarTrazo(control, 0, [90, 0])).toBe(0);
  });

  it("el abecedario para escribir trae mayúscula y minúscula de todo, con Ñ y doble ele", () => {
    expect(ABECEDARIO_TRAZO).toHaveLength(56);
    for (const c of ["Ñ", "ñ", "LL", "ll", "b", "z"]) expect(ABECEDARIO_TRAZO).toContain(c);
    for (const c of ABECEDARIO_TRAZO) expect(GLIFOS[c], c).toBeDefined();
  });

  it("la escritura libre marca los puntos en cualquier orden", () => {
    const puntos = puntosDeControl(GLIFOS.L![0]!);
    const hechos = puntos.map(() => false);
    for (const p of [...puntos].reverse()) marcarPuntos(puntos, hechos, p);
    expect(hechos.every(Boolean)).toBe(true);
    expect(marcarPuntos(puntos, puntos.map(() => false), [95, 20])).toBe(0);
  });
});
