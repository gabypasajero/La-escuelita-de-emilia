import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

/** Emilia: 6 años, vestido amarillo como su casa, dos colitas. Dibujada en un lienzo de 100×160. */
export function EmiliaDibujo({ alto = 160, feliz = true }: { alto?: number; feliz?: boolean }) {
  const ancho = (alto * 100) / 160;
  return (
    <Svg width={ancho} height={alto} viewBox="0 0 100 160">
      {/* Colitas */}
      <Circle cx="18" cy="38" r="12" fill="#5D4037" />
      <Circle cx="82" cy="38" r="12" fill="#5D4037" />
      <Circle cx="25" cy="30" r="4" fill="#E53935" />
      <Circle cx="75" cy="30" r="4" fill="#E53935" />
      {/* Piernas y zapatos */}
      <Rect x="38" y="122" width="8" height="24" rx="4" fill="#F1C7A5" />
      <Rect x="54" y="122" width="8" height="24" rx="4" fill="#F1C7A5" />
      <Ellipse cx="41" cy="148" rx="9" ry="5" fill="#E53935" />
      <Ellipse cx="59" cy="148" rx="9" ry="5" fill="#E53935" />
      {/* Vestido */}
      <Path d="M35 72 L65 72 L80 126 L20 126 Z" fill="#FDD835" />
      <Path d="M20 126 L80 126" stroke="#F9A825" strokeWidth="4" />
      <Circle cx="50" cy="96" r="5" fill="#fff" />
      {/* Brazos */}
      <Path d="M36 78 Q20 92 22 108" stroke="#F1C7A5" strokeWidth="8" strokeLinecap="round" fill="none" />
      <Path d="M64 78 Q82 84 86 70" stroke="#F1C7A5" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* Cabeza */}
      <Circle cx="50" cy="44" r="27" fill="#F6D3B3" />
      <Path d="M23 42 Q26 14 50 14 Q76 14 77 42 Q66 26 50 28 Q34 26 23 42 Z" fill="#5D4037" />
      {/* Cara */}
      <Circle cx="40" cy="46" r="3.5" fill="#3B2F5C" />
      <Circle cx="60" cy="46" r="3.5" fill="#3B2F5C" />
      <Circle cx="41" cy="45" r="1.2" fill="#fff" />
      <Circle cx="61" cy="45" r="1.2" fill="#fff" />
      <Circle cx="33" cy="55" r="4.5" fill="#F48FB1" opacity="0.6" />
      <Circle cx="67" cy="55" r="4.5" fill="#F48FB1" opacity="0.6" />
      {feliz ? (
        <Path d="M42 57 Q50 65 58 57" stroke="#3B2F5C" strokeWidth="2.5" strokeLinecap="round" fill="#fff" />
      ) : (
        <Path d="M43 59 Q50 62 57 59" stroke="#3B2F5C" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}
    </Svg>
  );
}

/** Tito, el pudú: el ciervo más pequeño del mundo. Lienzo de 100×80. */
export function TitoDibujo({ alto = 70 }: { alto?: number }) {
  const ancho = (alto * 100) / 80;
  return (
    <Svg width={ancho} height={alto} viewBox="0 0 100 80">
      <G>
        {/* Patas */}
        <Rect x="30" y="52" width="6" height="22" rx="3" fill="#6D4C41" />
        <Rect x="42" y="54" width="6" height="20" rx="3" fill="#5D4037" />
        <Rect x="60" y="54" width="6" height="20" rx="3" fill="#5D4037" />
        <Rect x="70" y="52" width="6" height="22" rx="3" fill="#6D4C41" />
        {/* Cuerpo y colita */}
        <Ellipse cx="54" cy="46" rx="28" ry="16" fill="#A1673F" />
        <Circle cx="82" cy="40" r="5" fill="#8D5524" />
        {/* Cabeza */}
        <Ellipse cx="26" cy="30" rx="15" ry="13" fill="#A1673F" />
        <Ellipse cx="14" cy="34" rx="8" ry="6" fill="#C8936A" />
        <Circle cx="8" cy="33" r="3" fill="#3E2723" />
        {/* Orejas y cuernitos */}
        <Ellipse cx="30" cy="14" rx="5" ry="9" fill="#8D5524" transform="rotate(20 30 14)" />
        <Ellipse cx="20" cy="15" rx="5" ry="9" fill="#8D5524" transform="rotate(-20 20 15)" />
        <Path d="M24 16 L23 6 M28 16 L30 7" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
        {/* Ojo */}
        <Circle cx="24" cy="28" r="3.5" fill="#3B2F5C" />
        <Circle cx="25" cy="27" r="1.2" fill="#fff" />
      </G>
    </Svg>
  );
}

/** Movimiento suave de "respirar" para que los personajes se sientan vivos. */
export function useRespirar(amplitud = 4, duracion = 1400) {
  const valor = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const bucle = Animated.loop(
      Animated.sequence([
        Animated.timing(valor, { toValue: 1, duration: duracion, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(valor, { toValue: 0, duration: duracion, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ]),
    );
    bucle.start();
    return () => bucle.stop();
  }, [valor, duracion]);
  return valor.interpolate({ inputRange: [0, 1], outputRange: [0, -amplitud] });
}

/** Salto corto (Tito al tocarlo, celebraciones). */
export function useSalto() {
  const valor = useRef(new Animated.Value(0)).current;
  const saltar = () =>
    Animated.sequence([
      Animated.timing(valor, { toValue: -28, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(valor, { toValue: 0, duration: 220, easing: Easing.bounce, useNativeDriver: false }),
    ]).start();
  return { y: valor, saltar };
}

/** Globo de diálogo de Emilia. */
export function Globo({ texto, alLado = "abajo" }: { texto: string; alLado?: "abajo" | "izquierda" }) {
  return (
    <View style={[estilos.globo, alLado === "izquierda" && estilos.globoIzquierda]}>
      <Text style={estilos.globoTexto}>{texto}</Text>
    </View>
  );
}

/** Emilia y Tito juntos, con su animación. Tocar a Tito lo hace saltar. */
export function EmiliaYTito({ alto = 170, alTocarEmilia, alTocarTito }: { alto?: number; alTocarEmilia?: () => void; alTocarTito?: () => void }) {
  const respirar = useRespirar();
  const { y, saltar } = useSalto();
  return (
    <View style={estilos.pareja}>
      <Pressable onPress={alTocarEmilia} accessibilityLabel="Emilia">
        <Animated.View style={{ transform: [{ translateY: respirar }] }}>
          <EmiliaDibujo alto={alto} />
        </Animated.View>
      </Pressable>
      <Pressable
        accessibilityLabel="Tito"
        onPress={() => {
          saltar();
          alTocarTito?.();
        }}
      >
        <Animated.View style={{ transform: [{ translateY: y }] }}>
          <TitoDibujo alto={alto * 0.42} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  pareja: { flexDirection: "row", alignItems: "flex-end" },
  globo: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: 280,
    borderWidth: 3,
    borderColor: "#3B2F5C",
  },
  globoIzquierda: { borderBottomLeftRadius: 4 },
  globoTexto: { fontSize: 18, fontWeight: "700", color: "#3B2F5C" },
});
