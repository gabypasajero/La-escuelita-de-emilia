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

/**
 * Abre un juego como ventana flotante sobre el lugar donde se está (igual
 * en el mundo 2D que en el 3D): el escenario queda asomado por los bordes.
 */
let ultima = 0;
export function abrirVentana(ruta: unknown) {
  // Un doble toque no debe abrir dos veces el mismo juego (el de atrás seguiría hablando).
  if (Date.now() - ultima < 1200) return;
  ultima = Date.now();
  router.push(conVentana(String(ruta)) as Href);
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
