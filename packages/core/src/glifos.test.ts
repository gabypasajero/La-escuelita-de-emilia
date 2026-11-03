import { describe, expect, it } from "vitest";
import { GLIFOS, LETRAS, NUMEROS_TRAZO, VOCALES_TRAZO, avanzarTrazo, puntosDeControl } from "./index";

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
});
