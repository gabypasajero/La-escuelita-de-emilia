import Fastify from "fastify";
import { z } from "zod";
import { AlmacenMemoria } from "./almacen";

const MODULOS = ["pintar", "letras", "numeros", "animales", "juegos"] as const;

const esquemaPerfil = z.object({
  alias: z.string().trim().min(1).max(20),
  avatar: z.string().min(1).max(8),
  rangoEdad: z.enum(["3-4", "4-5", "5-6"]),
});

const esquemaIntentos = z
  .array(
    z.object({
      perfilId: z.string().uuid(),
      modulo: z.enum(MODULOS),
      actividad: z.string().min(1).max(50),
      item: z.string().min(1).max(50),
      acierto: z.boolean(),
      duracionMs: z.number().int().nonnegative(),
      fecha: z.string().datetime(),
    }),
  )
  .max(500);

export function construirApp(almacen = new AlmacenMemoria()) {
  const app = Fastify({ logger: process.env.NODE_ENV !== "test" });

  // TODO(fase 2): validar el JWT de Supabase y tomar el id del adulto del token.
  const adultoDe = (headers: Record<string, unknown>) => String(headers["x-adulto-id"] ?? "demo");

  app.get("/health", async () => ({ ok: true }));

  app.get("/v1/perfiles", async (req) => almacen.listarPerfiles(adultoDe(req.headers)));

  app.post("/v1/perfiles", async (req, reply) => {
    const datos = esquemaPerfil.safeParse(req.body);
    if (!datos.success) return reply.code(400).send({ error: datos.error.flatten() });
    return reply.code(201).send(almacen.crearPerfil({ ...datos.data, adultoId: adultoDe(req.headers) }));
  });

  app.post("/v1/intentos", async (req, reply) => {
    const lote = esquemaIntentos.safeParse(req.body);
    if (!lote.success) return reply.code(400).send({ error: lote.error.flatten() });
    const adultoId = adultoDe(req.headers);
    const ajeno = lote.data.find((i) => almacen.obtenerPerfil(i.perfilId)?.adultoId !== adultoId);
    if (ajeno) return reply.code(403).send({ error: "Perfil no pertenece al adulto" });
    almacen.agregarIntentos(lote.data);
    return reply.code(202).send({ recibidos: lote.data.length });
  });

  /** Resumen para el panel de padres: aciertos por módulo. */
  app.get<{ Params: { perfilId: string } }>("/v1/perfiles/:perfilId/resumen", async (req, reply) => {
    const perfil = almacen.obtenerPerfil(req.params.perfilId);
    if (!perfil || perfil.adultoId !== adultoDe(req.headers)) return reply.code(404).send({ error: "No encontrado" });
    const resumen: Record<string, { intentos: number; aciertos: number }> = {};
    for (const i of almacen.intentosDe(perfil.id)) {
      const m = (resumen[i.modulo] ??= { intentos: 0, aciertos: 0 });
      m.intentos++;
      if (i.acierto) m.aciertos++;
    }
    return { perfil, resumen };
  });

  return app;
}
