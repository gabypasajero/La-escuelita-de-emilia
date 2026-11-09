import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Icono } from "./Iconos";
import { TOQUE_MINIMO } from "../lib/tema";

/**
 * Botones fijos arriba a la izquierda, en cada pantalla:
 * - ⬅️ Volver: a la pantalla anterior (por ejemplo, de un juego de Max a la casa de Max).
 * - 🏠 Inicio: directo al barrio.
 */
export function BotonCasa() {
  const volver = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };
  return (
    <View style={estilos.fila} pointerEvents="box-none">
      <Pressable accessibilityLabel="Volver al inicio" onPress={() => router.replace("/")} style={estilos.boton}>
        <Icono e="🏠" tam={50} sinSombra />
      </Pressable>
      <Pressable accessibilityLabel="Volver atrás" onPress={volver} style={estilos.boton}>
        <Icono e="⬅️" tam={50} sinSombra />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { position: "absolute", top: 16, left: 16, flexDirection: "row", gap: 12, zIndex: 10 },
  boton: {
    width: TOQUE_MINIMO,
    height: TOQUE_MINIMO,
    borderRadius: TOQUE_MINIMO / 2,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  icono: { fontSize: 40 },
});
