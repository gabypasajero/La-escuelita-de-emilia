import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const COLORES = ["#EF5350", "#FFCA28", "#66BB6A", "#42A5F5", "#AB47BC", "#FF7043", "#26C6DA"];

/**
 * Lluvia de papel picado y estrellas al acertar. `clave` cambia en cada
 * festejo; `grande` es para cuando se completan las estrellas.
 */
export function Festejo({ clave, grande = false }: { clave: number; grande?: boolean }) {
  const n = grande ? 46 : 22;
  const avance = useRef(new Animated.Value(0)).current;
  const piezas = useMemo(
    () => Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5, fuerza = (grande ? 260 : 170) * (0.45 + Math.random() * 0.75);
      return { dx: Math.cos(a) * fuerza, dy: Math.sin(a) * fuerza - 60, giro: (Math.random() - 0.5) * 900, color: COLORES[i % COLORES.length]!, tam: 10 + Math.random() * 10, redondo: i % 3 === 0 };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clave],
  );
  useEffect(() => {
    if (!clave) return;
    avance.setValue(0);
    Animated.timing(avance, { toValue: 1, duration: grande ? 1900 : 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [clave, grande, avance]);
  if (!clave) return null;
  return (
    <View style={estilos.capa} pointerEvents="none">
      {piezas.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute", width: p.tam, height: p.redondo ? p.tam : p.tam * 0.6, borderRadius: p.redondo ? p.tam : 3, backgroundColor: p.color,
            opacity: avance.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateX: avance.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] }) },
              { translateY: avance.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, p.dy, p.dy + 190] }) },
              { rotate: avance.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${p.giro}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  capa: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", zIndex: 30 },
});
