import { describe, expect, it } from "vitest";
import { CUIDADOS, PACIENTES, VERDURAS, rondaColor, rondaForma, rondaMasMenos, rondaPatron, rondaVerdura, rondaVeterinaria } from "./index";

const nivelesYVeces = (f: (n: 1 | 2 | 3) => void) => { for (let i = 0; i < 150; i++) for (const n of [1, 2, 3] as const) f(n); };

describe("juegos de descubrir", () => {
  it("color, forma, verdura y veterinaria: la correcta está y no hay repetidas", () => {
    nivelesYVeces((n) => {
      for (const r of [rondaColor(n), rondaForma(n), rondaVerdura(n), rondaVeterinaria(n)] as Array<{ opciones: unknown[]; correcta: unknown }>) {
        expect(r.opciones).toContain(r.correcta);
        expect(new Set(r.opciones).size).toBe(r.opciones.length);
      }
    });
  });

  it("más y menos: las cantidades son distintas y la respuesta es la mayor o la menor", () => {
    nivelesYVeces((n) => {
      const r = rondaMasMenos(n);
      expect(r.opciones[0]).not.toBe(r.opciones[1]);
      expect(r.correcta).toBe(r.pregunta === "mas" ? Math.max(...r.opciones) : Math.min(...r.opciones));
    });
  });

  it("el patrón continúa con la ficha correcta", () => {
    nivelesYVeces((n) => {
      const r = rondaPatron(n);
      const periodo = n === 2 ? 3 : 2 + (n === 3 ? 1 : 0);
      expect(r.correcta).toBe(r.secuencia[r.secuencia.length - periodo]);
      expect(r.opciones).toContain(r.correcta);
    });
  });

  it("cada paciente tiene un cuidado que existe", () => {
    for (const p of PACIENTES) expect(CUIDADOS.map((c) => c.id)).toContain(p.necesita);
    expect(new Set(VERDURAS.map((v) => v.id)).size).toBe(VERDURAS.length);
  });
});
