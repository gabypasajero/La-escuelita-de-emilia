import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { Monedas, useJuego } from "../lib/juego";
import { COLORES } from "../lib/tema";
import { BotonCasa } from "./BotonCasa";

export function Pantalla({ children, color = COLORES.fondo }: { children: ReactNode; color?: string }) {
  // Si se abrió una pantalla sin elegir jugador (por ejemplo, al recargar), primero se pregunta quién juega.
  const { cargado, jugadores, activoId } = useJuego();
  if (cargado && jugadores.length && !activoId) return <Redirect href="/quien-juega" />;
  return (
    <SafeAreaView style={[estilos.fondo, { backgroundColor: color }]}>
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
