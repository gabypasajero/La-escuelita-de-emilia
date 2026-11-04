import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { alBloquearVoz, empezarConToque, necesitaToque } from "../lib/voz";
import { EmiliaDibujo, TitoDibujo } from "./Personajes";

/**
 * Pantalla "¡A jugar!" al abrir la app (solo web). El navegador no deja que
 * Emilia hable hasta el primer toque; con este botón el primer toque es a
 * propósito y Emilia saluda de inmediato, sin silencios ni voces que llegan
 * de golpe.
 */
export function TocarParaEmpezar() {
  const [visible, setVisible] = useState(() => Platform.OS === "web" && necesitaToque());
  useEffect(() => alBloquearVoz(() => setVisible(true)), []);
  if (!visible) return null;
  return (
    <Pressable
      style={estilos.velo}
      accessibilityLabel="A jugar"
      onPress={() => {
        setVisible(false);
        empezarConToque();
      }}
    >
      <View style={estilos.personajes}>
        <EmiliaDibujo alto={190} />
        <TitoDibujo alto={72} />
      </View>
      <View style={estilos.boton}>
        <Text style={estilos.botonTexto}>▶️ ¡A jugar!</Text>
      </View>
      <Text style={estilos.nota}>Toca para escuchar a Emilia</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  velo: { ...StyleSheet.absoluteFillObject, zIndex: 100, backgroundColor: "#FFE082", alignItems: "center", justifyContent: "center", gap: 20 },
  personajes: { flexDirection: "row", alignItems: "flex-end" },
  boton: { backgroundColor: "#43A047", borderRadius: 40, paddingHorizontal: 44, paddingVertical: 20, borderWidth: 5, borderColor: "#fff" },
  botonTexto: { color: "#fff", fontSize: 36, fontWeight: "900" },
  nota: { fontSize: 18, color: "#3B2F5C", fontWeight: "700" },
});
