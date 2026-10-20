import type { Intento, RangoEdad } from "@escuelita/core";

export interface Perfil {
  id: string;
  adultoId: string;
  /** Solo alias: nunca el nombre real del niño. */
  alias: string;
  avatar: string;
  rangoEdad: RangoEdad;
}

/**
 * Almacén en memoria para desarrollo. Se reemplaza por Postgres (Supabase)
 * implementando la misma interfaz — ver supabase/migrations.
 */
export class AlmacenMemoria {
  private perfiles = new Map<string, Perfil>();
  private intentos: Intento[] = [];

  listarPerfiles(adultoId: string): Perfil[] {
    return [...this.perfiles.values()].filter((p) => p.adultoId === adultoId);
  }

  crearPerfil(datos: Omit<Perfil, "id">): Perfil {
    const perfil = { ...datos, id: crypto.randomUUID() };
    this.perfiles.set(perfil.id, perfil);
    return perfil;
  }

  obtenerPerfil(id: string): Perfil | undefined {
    return this.perfiles.get(id);
  }

  agregarIntentos(lote: Intento[]): void {
    this.intentos.push(...lote);
  }

  intentosDe(perfilId: string): Intento[] {
    return this.intentos.filter((i) => i.perfilId === perfilId);
  }
}
