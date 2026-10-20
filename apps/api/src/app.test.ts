import { describe, expect, it } from "vitest";
import { construirApp } from "./app";

describe("API", () => {
  it("crea un perfil, registra intentos y devuelve el resumen", async () => {
    const app = construirApp();
    const headers = { "x-adulto-id": "mama-1" };

    const creado = await app.inject({
      method: "POST",
      url: "/v1/perfiles",
      headers,
      payload: { alias: "Emi", avatar: "🦄", rangoEdad: "4-5" },
    });
    expect(creado.statusCode).toBe(201);
    const perfil = creado.json();

    const intento = { perfilId: perfil.id, modulo: "letras", actividad: "letra-inicial", item: "G", duracionMs: 1200, fecha: new Date().toISOString() };
    const enviados = await app.inject({
      method: "POST",
      url: "/v1/intentos",
      headers,
      payload: [
        { ...intento, acierto: true },
        { ...intento, acierto: false },
      ],
    });
    expect(enviados.statusCode).toBe(202);

    const resumen = await app.inject({ method: "GET", url: `/v1/perfiles/${perfil.id}/resumen`, headers });
    expect(resumen.json().resumen.letras).toEqual({ intentos: 2, aciertos: 1 });
  });

  it("no permite registrar intentos en el perfil de otro adulto", async () => {
    const app = construirApp();
    const perfil = (
      await app.inject({ method: "POST", url: "/v1/perfiles", headers: { "x-adulto-id": "a" }, payload: { alias: "Emi", avatar: "🦄", rangoEdad: "3-4" } })
    ).json();
    const res = await app.inject({
      method: "POST",
      url: "/v1/intentos",
      headers: { "x-adulto-id": "b" },
      payload: [{ perfilId: perfil.id, modulo: "letras", actividad: "x", item: "A", acierto: true, duracionMs: 1, fecha: new Date().toISOString() }],
    });
    expect(res.statusCode).toBe(403);
  });

  it("rechaza perfiles inválidos", async () => {
    const res = await construirApp().inject({ method: "POST", url: "/v1/perfiles", payload: { alias: "", avatar: "x", rangoEdad: "9-10" } });
    expect(res.statusCode).toBe(400);
  });
});
