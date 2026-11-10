import type { Constructor } from "../motor";
import { galeria } from "./galeria";

/** Todos los escenarios del mundo 3D, por nombre. */
export const ESCENAS: Record<string, Constructor> = {
  galeria,
};
