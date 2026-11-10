import { router, useLocalSearchParams, type Href } from "expo-router";
import { useCallback } from "react";

/**
 * Ventanas flotantes: en el mundo 3D los juegos se abren como una ventana
 * sobre el escenario (que sigue vivo detrás), en vez de cambiar de pantalla.
 * La ruta lleva `ventana=1` y el marco lo pone `Pantalla`.
 */
export function conVentana(ruta: string): string {
  return ruta + (ruta.includes("?") ? "&" : "?") + "ventana=1";
}

/** ¿Esta pantalla se está mostrando como ventana flotante? */
export function useEnVentana(): boolean {
  return useLocalSearchParams<{ ventana?: string }>().ventana === "1";
}

/** Para ir a otra pantalla: si estamos en una ventana, la siguiente también lo es. */
export function useIr(): (ruta: string) => void {
  const ventana = useEnVentana();
  return useCallback((ruta: string) => router.push((ventana ? conVentana(ruta) : ruta) as Href), [ventana]);
}
