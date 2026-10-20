import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORES } from "../lib/tema";
import { BotonCasa } from "./BotonCasa";

export function Pantalla({ children, color = COLORES.fondo }: { children: ReactNode; color?: string }) {
  return (
    <SafeAreaView style={[estilos.fondo, { backgroundColor: color }]}>
      <BotonCasa />
      <View style={estilos.contenido}>{children}</View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: { flex: 1, paddingTop: 104, paddingHorizontal: 16, alignItems: "center" },
});
