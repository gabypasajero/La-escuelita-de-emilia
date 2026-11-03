import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Ellipse, Path, Rect } from "react-native-svg";

/**
 * Animaciones que muestran cómo se hace cada paso de la rutina (no solo un
 * dibujo): las manos se frotan, cae el agua, salen burbujas; el cepillo
 * recorre los dientes de arriba, de abajo, de adelante, las muelas y la lengua.
 */
export function AnimacionRutina({ rutina, paso, escala = 1.45 }: { rutina: "manos" | "dientes"; paso: number | null; escala?: number }) {
  // Se dibuja en 300×260 y se agranda para que se vea bien en tablet.
  return (
    <View style={{ width: 300 * escala, height: 260 * escala, alignItems: "center", justifyContent: "center" }}>
      <View style={{ transform: [{ scale: escala }] }}>
        {rutina === "manos" ? <Manos paso={paso} /> : <Dientes paso={paso} />}
      </View>
    </View>
  );
}

/** Un valor que va y viene entre -1 y 1 mientras `activo` sea verdadero. */
function useVaiven(activo: boolean, ms = 260) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!activo) {
      v.setValue(0);
      return;
    }
    const bucle = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      Animated.timing(v, { toValue: -1, duration: ms * 2, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      Animated.timing(v, { toValue: 0, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
    ]));
    bucle.start();
    return () => bucle.stop();
  }, [activo, ms, v]);
  return v;
}

/** Valor que sube de 0 a 1 en bucle (gotas de agua, burbujas). */
function useCaida(activo: boolean, ms = 900) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!activo) return;
    const bucle = Animated.loop(Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: false }));
    v.setValue(0);
    bucle.start();
    return () => bucle.stop();
  }, [activo, ms, v]);
  return v;
}

// ---------- Lavado de manos ----------
// Pasos: 0 mojar, 1 jabón, 2 palmas, 3 dorso, 4 entre los dedos, 5 uñas, 6 enjuagar, 7 secar.
function Manos({ paso }: { paso: number | null }) {
  const p = paso ?? -1;
  const agua = p === 0 || p === 6;
  const frotando = p >= 2 && p <= 5;
  const vaiven = useVaiven(frotando || p === 7, p === 5 ? 200 : 280);
  const gotas = useCaida(agua, 700);
  const burbujas = useCaida(p >= 1 && p <= 5, 1600);

  // Movimiento de cada mano según el paso.
  const izq = p === 2 ? { translateX: vaiven.interpolate({ inputRange: [-1, 1], outputRange: [-22, 22] }) }
    : p === 4 ? { translateY: vaiven.interpolate({ inputRange: [-1, 1], outputRange: [-16, 16] }) }
    : { translateX: 0 };
  const der = p === 2 ? { translateX: vaiven.interpolate({ inputRange: [-1, 1], outputRange: [22, -22] }) }
    : p === 3 ? { translateX: vaiven.interpolate({ inputRange: [-1, 1], outputRange: [-26, 26] }) }
    : p === 4 ? { translateY: vaiven.interpolate({ inputRange: [-1, 1], outputRange: [16, -16] }) }
    : p === 5 ? { rotate: vaiven.interpolate({ inputRange: [-1, 1], outputRange: ["-25deg", "25deg"] }) }
    : { translateX: 0 };
  const juntas = frotando;

  return (
    <View style={estilos.escena}>
      {/* Llave y lavamanos */}
      <Svg width={300} height={260} viewBox="0 0 300 260" style={StyleSheet.absoluteFill}>
        <Rect x="120" y="10" width="60" height="18" rx="8" fill="#B0BEC5" />
        <Path d="M170 28 h22 v26 h-14 v-12 h-8 z" fill="#90A4AE" />
        <Ellipse cx="150" cy="235" rx="135" ry="22" fill="#E3F2FD" stroke="#90CAF9" strokeWidth="4" />
      </Svg>
      {agua && [0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          style={[estilos.gota, {
            left: 178 + i * 4,
            transform: [{ translateY: gotas.interpolate({ inputRange: [0, 1], outputRange: [50 + i * 25, 220 + i * 25] }) }],
            opacity: gotas.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
          }]}
        />
      ))}
      {/* Las manos */}
      <Animated.Text style={[estilos.mano, { left: juntas ? 92 : 50, top: 100, transform: [izq] }]}>🫱</Animated.Text>
      <Animated.Text style={[estilos.mano, { left: juntas ? 128 : 170, top: p === 3 ? 82 : 100, transform: [der] }]}>🫲</Animated.Text>
      {p === 1 && <Text style={[estilos.objeto, { left: 125, top: 60 }]}>🧼</Text>}
      {p === 7 && (
        <Animated.View style={[estilos.toalla, { transform: [{ translateX: vaiven.interpolate({ inputRange: [-1, 1], outputRange: [-40, 40] }) }] }]} />
      )}
      {/* Burbujas de jabón */}
      {p >= 1 && p <= 5 && [0, 1, 2, 3, 4].map((i) => (
        <Animated.View
          key={`b${i}`}
          style={[estilos.burbuja, {
            left: 90 + i * 28,
            width: 14 + (i % 3) * 8,
            height: 14 + (i % 3) * 8,
            transform: [{ translateY: burbujas.interpolate({ inputRange: [0, 1], outputRange: [170 - (i % 2) * 20, 40 + i * 6] }) }],
            opacity: burbujas.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.9, 0.9, 0] }),
          }]}
        />
      ))}
    </View>
  );
}

// ---------- Cepillado de dientes ----------
// Pasos: 0 arriba, 1 abajo, 2 adelante, 3 muelas, 4 lengua.
function Dientes({ paso }: { paso: number | null }) {
  const p = paso ?? -1;
  const vaiven = useVaiven(p >= 0, 230);
  const espuma = useCaida(p >= 0, 1400);
  // Dónde está el cepillo y hacia dónde se mueve en cada zona.
  const zona = [
    { left: 150, top: 92, eje: "x" as const, amp: 46 },
    { left: 150, top: 160, eje: "x" as const, amp: 46 },
    { left: 150, top: 126, eje: "y" as const, amp: 22 },
    { left: 62, top: 126, eje: "x" as const, amp: 14 },
    { left: 150, top: 150, eje: "y" as const, amp: 12 },
  ][Math.max(0, p)]!;
  const mov = vaiven.interpolate({ inputRange: [-1, 1], outputRange: [-zona.amp, zona.amp] });

  return (
    <View style={estilos.escena}>
      <Svg width={300} height={260} viewBox="0 0 300 260" style={StyleSheet.absoluteFill}>
        {/* Boca abierta */}
        <Ellipse cx="150" cy="130" rx="128" ry="92" fill="#F48FB1" />
        <Ellipse cx="150" cy="130" rx="108" ry="74" fill="#880E4F" />
        {p === 4 && <Ellipse cx="150" cy="165" rx="58" ry="30" fill="#F06292" stroke="#FDD835" strokeWidth="4" />}
        {p !== 4 && <Ellipse cx="150" cy="168" rx="58" ry="26" fill="#F06292" />}
        {/* Dientes de arriba */}
        {Array.from({ length: 8 }, (_, i) => (
          <Rect key={`a${i}`} x={58 + i * 23} y={i === 0 || i === 7 ? 68 : 62} width="20" height={i === 0 || i === 7 ? 22 : 30} rx="5"
            fill={(p === 0) || (p === 2 && i >= 3 && i <= 4) || (p === 3 && (i < 2 || i > 5)) ? "#FFFDE7" : "#fff"} stroke={(p === 0) || (p === 2 && i >= 3 && i <= 4) || (p === 3 && (i < 2 || i > 5)) ? "#FDD835" : "#E0E0E0"} strokeWidth="2" />
        ))}
        {/* Dientes de abajo */}
        {Array.from({ length: 8 }, (_, i) => (
          <Rect key={`b${i}`} x={58 + i * 23} y={i === 0 || i === 7 ? 172 : 168} width="20" height={i === 0 || i === 7 ? 22 : 28} rx="5"
            fill={(p === 1) || (p === 2 && i >= 3 && i <= 4) || (p === 3 && (i < 2 || i > 5)) ? "#FFFDE7" : "#fff"} stroke={(p === 1) || (p === 2 && i >= 3 && i <= 4) || (p === 3 && (i < 2 || i > 5)) ? "#FDD835" : "#E0E0E0"} strokeWidth="2" />
        ))}
      </Svg>
      {/* Cepillo moviéndose en la zona */}
      {p >= 0 && (
        <Animated.Text style={[estilos.cepillo, { left: zona.left - 30, top: zona.top - 36, transform: [zona.eje === "x" ? { translateX: mov } : { translateY: mov }, { rotate: p === 2 ? "90deg" : "0deg" }] }]}>🪥</Animated.Text>
      )}
      {/* Espuma */}
      {p >= 0 && [0, 1, 2].map((i) => (
        <Animated.View key={i} style={[estilos.burbuja, {
          left: zona.left - 20 + i * 18, width: 14, height: 14,
          transform: [{ translateY: espuma.interpolate({ inputRange: [0, 1], outputRange: [zona.top, zona.top - 40 - i * 10] }) }],
          opacity: espuma.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
        }]} />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  escena: { width: 300, height: 260 },
  gota: { position: "absolute", top: 0, width: 8, height: 14, borderRadius: 4, backgroundColor: "#29B6F6" },
  mano: { position: "absolute", fontSize: 76 },
  objeto: { position: "absolute", fontSize: 50 },
  toalla: { position: "absolute", left: 105, top: 110, width: 90, height: 60, borderRadius: 10, backgroundColor: "#FFCC80", borderWidth: 4, borderColor: "#FB8C00" },
  burbuja: { position: "absolute", top: 0, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.85)", borderWidth: 2, borderColor: "#B3E5FC" },
  cepillo: { position: "absolute", fontSize: 60 },
});
