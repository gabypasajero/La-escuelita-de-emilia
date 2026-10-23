import { describe, expect, it } from "vitest";
import {
  HERRAMIENTAS,
  PASOS_HUERTO,
  RUTINA_DIENTES,
  RUTINA_MANOS,
  duracionPrincipal,
  duracionTotal,
  pasoEn,
  usarHerramienta,
  type EtapaPlanta,
} from "./index";

describe("huerto", () => {
  it("con las herramientas correctas la semilla llega a flor", () => {
    let etapa: EtapaPlanta = "tierra";
    for (const h of ["pala", "semilla", "manos", "regadera", "sol", "regadera"] as const) {
      const r = usarHerramienta(etapa, h);
      expect(r.acierto).toBe(true);
      etapa = r.etapa;
    }
    expect(etapa).toBe("flor");
  });

  it("un error da pista y nunca hace retroceder la planta", () => {
    const r = usarHerramienta("tapada", "pala");
    expect(r.acierto).toBe(false);
    expect(r.etapa).toBe("tapada");
    expect(r.frase).toBe(PASOS_HUERTO.tapada.pista);
  });

  it("cada etapa se resuelve con una herramienta disponible", () => {
    for (const paso of Object.values(PASOS_HUERTO)) expect(HERRAMIENTAS).toContain(paso.necesita);
  });
});

describe("rutinas", () => {
  it("las manos se frotan al menos 20 segundos", () => {
    expect(duracionPrincipal(RUTINA_MANOS)).toBeGreaterThanOrEqual(20);
  });

  it("los dientes se cepillan 2 minutos", () => {
    expect(duracionTotal(RUTINA_DIENTES)).toBe(120);
  });

  it("calcula el paso según el tiempo", () => {
    expect(pasoEn(RUTINA_DIENTES, 0)).toBe(0);
    expect(pasoEn(RUTINA_DIENTES, 25)).toBe(1);
    expect(pasoEn(RUTINA_DIENTES, 119)).toBe(4);
    expect(pasoEn(RUTINA_DIENTES, 120)).toBeNull();
  });
});
