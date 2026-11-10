import type { Constructor } from "../motor";
import { barrio, CON_ESCENA } from "./barrio";
import { escuelita } from "./escuelita";
import { AMIGOS_3D, patio } from "./amigos";
import { casa } from "./casa";
import { disfraces, granja, huerto, paradero, plaza, taller, tiendita, veterinaria } from "./lugares";
import { galeria } from "./galeria";

/** Todos los escenarios del mundo 3D, por nombre. */
export const ESCENAS: Record<string, Constructor> = {
  barrio,
  galeria,
  patio, ...AMIGOS_3D,
  escuelita, taller, tiendita, disfraces, casa, plaza, huerto, granja, veterinaria, paradero,
};

// El barrio entra en 3D a los lugares que ya tienen escenario; a los demás, por su pantalla 2D.
for (const id of Object.keys(ESCENAS)) CON_ESCENA.add(id);
