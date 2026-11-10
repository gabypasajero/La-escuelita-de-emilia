import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { Monedas, useJuego } from "../lib/juego";
import { COLORES } from "../lib/tema";
import { useAmbiente } from "../lib/ambiente";
import { BotonCasa } from "./BotonCasa";
import { FondoJuego, type TemaFondo } from "./FondosJuego";

/** `fondo`: el lugar donde ocurre el juego, dibujado detrás (sigue la luz de la hora real). */
export function Pantalla({ children, color = COLORES.fondo, fondo, acento }: { children: ReactNode; color?: string; fondo?: TemaFondo; acento?: string }) {
  // Si se abrió una pantalla sin elegir jugador (por ejemplo, al recargar), primero se pregunta quién juega.
  const { cargado, jugadores, activoId } = useJuego();
  useAmbiente(fondo === "campo" || fondo === "huerto" || fondo === "arenero" ? "campo" : "sala");
  if (cargado && jugadores.length && !activoId) return <Redirect href="/quien-juega" />;
  return (
    <SafeAreaView style={[estilos.fondo, { backgroundColor: color }]}>
      {fondo && <FondoJuego tema={fondo} acento={acento} />}
      <BotonCasa />
      <Monedas />
      <View style={estilos.contenido}>{children}</View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: { flex: 1, paddingTop: 104, paddingHorizontal: 16, alignItems: "center" },
});
