import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Rebote } from "./Rebote";
import { Icono } from "./Iconos";
import { TOQUE_MINIMO } from "../lib/tema";
import { useEnVentana } from "../lib/ventana";
import { useMusica } from "../lib/ambiente";

/**
 * Botones fijos arriba a la izquierda, en cada pantalla:
 * - ⬅️ Volver: a la pantalla anterior (por ejemplo, de un juego de Max a la casa de Max).
 * - 🏠 Inicio: directo al barrio.
 */
export function BotonCasa() {
  const ventana = useEnVentana();
  const [musica, alternar] = useMusica();
  const volver = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };
  return (
    <View style={estilos.fila} pointerEvents="box-none">
      {!ventana && (
        <Rebote accessibilityLabel="Volver al inicio" onPress={() => router.replace("/")} style={estilos.boton}>
          <Icono e="🏠" tam={50} sinSombra />
        </Rebote>
      )}
      <Rebote accessibilityLabel="Volver atrás" onPress={volver} style={estilos.boton}>
        <Icono e="⬅️" tam={50} sinSombra />
      </Rebote>
      <Rebote accessibilityLabel={musica ? "Apagar la música" : "Encender la música"} onPress={alternar} style={[estilos.boton, estilos.musica, !musica && { opacity: 0.5 }]}>
        <Text style={estilos.nota}>{musica ? "🎵" : "🔇"}</Text>
      </Rebote>
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
  musica: { width: 48, height: 48, borderRadius: 24, alignSelf: "center" },
  nota: { fontSize: 22 },
});
