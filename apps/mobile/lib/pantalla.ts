import { useWindowDimensions } from "react-native";

/**
 * Tamaño de pantalla: `compacto` es un celular acostado (poca altura), donde
 * la cabecera y los botones se achican para dejarle el espacio al juego;
 * `angosto` es un celular parado.
 */
export function usePantalla() {
  const { width, height } = useWindowDimensions();
  return { ancho: width, alto: height, compacto: height < 520, angosto: width < 600 && height > width };
}
