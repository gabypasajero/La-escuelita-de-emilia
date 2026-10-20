import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { TOQUE_MINIMO } from "../lib/tema";

/** Botón fijo para volver al inicio: siempre visible en cada pantalla. */
export function BotonCasa() {
  return (
    <Pressable accessibilityLabel="Volver al inicio" onPress={() => router.replace("/")} style={estilos.boton}>
      <Text style={estilos.icono}>🏠</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: TOQUE_MINIMO,
    height: TOQUE_MINIMO,
    borderRadius: TOQUE_MINIMO / 2,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 4,
  },
  icono: { fontSize: 40 },
});
