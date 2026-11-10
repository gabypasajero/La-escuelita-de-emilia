import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { usePantalla } from "../lib/pantalla";

/**
 * En un celular parado los escenarios quedan muy chicos: se invita a girarlo.
 * Es solo una sugerencia; se puede seguir así.
 */
export function GiraElTelefono() {
  const { angosto } = usePantalla();
  const [seguir, setSeguir] = useState(false);
  const giro = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!angosto) return;
    const ciclo = Animated.loop(Animated.sequence([
      Animated.delay(500),
      Animated.timing(giro, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.delay(900),
      Animated.timing(giro, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]));
    ciclo.start();
    return () => ciclo.stop();
  }, [angosto, giro]);
  if (!angosto || seguir) return null;
  return (
    <View style={estilos.velo}>
      <Animated.View style={[estilos.telefono, { transform: [{ rotate: giro.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-90deg"] }) }] }]}>
        <View style={estilos.pantalla} />
        <View style={estilos.boton} />
      </Animated.View>
      <Text style={estilos.texto}>Gira el teléfono para jugar mejor</Text>
      <Pressable style={estilos.seguir} onPress={() => setSeguir(true)} accessibilityLabel="Seguir así">
        <Text style={estilos.seguirTexto}>Seguir así</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  velo: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(59,47,92,0.94)", alignItems: "center", justifyContent: "center", gap: 28, zIndex: 1000, padding: 24 },
  telefono: { width: 96, height: 170, borderRadius: 18, backgroundColor: "#fff", alignItems: "center", padding: 8, gap: 6 },
  pantalla: { flex: 1, alignSelf: "stretch", borderRadius: 10, backgroundColor: "#FFD54F" },
  boton: { width: 26, height: 6, borderRadius: 3, backgroundColor: "#B0BEC5" },
  texto: { fontSize: 24, fontWeight: "900", color: "#fff", textAlign: "center" },
  seguir: { backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10 },
  seguirTexto: { fontSize: 16, fontWeight: "800", color: "#fff" },
});
