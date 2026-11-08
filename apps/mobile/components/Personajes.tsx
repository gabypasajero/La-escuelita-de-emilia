import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { EmiliaAnimada, TitoAnimado, type Expresion } from "./Articulados";
export type { Expresion } from "./Articulados";

/**
 * Emilia: 6 años, vestido amarillo como su casa, dos colitas. Ahora articulada
 * (ver Articulados.tsx): pestañea, respira, camina moviendo brazos y piernas y
 * cambia de expresión. Lienzo de 100×160.
 */
export function EmiliaDibujo({ alto = 160, feliz = true, caminando = false, expresion }: { alto?: number; feliz?: boolean; caminando?: boolean; expresion?: Expresion }) {
  return <EmiliaAnimada alto={alto} caminando={caminando} expresion={expresion ?? (feliz ? "feliz" : "pensativa")} />;
}

/** Max: amigo de Estados Unidos, deportista. Habla inglés. Jockey azul y polera roja. Lienzo de 100×160. */
export function MaxDibujo({ alto = 160, saludando = false }: { alto?: number; saludando?: boolean }) {
  const ancho = (alto * 100) / 160;
  return (
    <Svg width={ancho} height={alto} viewBox="0 0 100 160">
      {/* Piernas, short y zapatillas */}
      <Rect x="38" y="118" width="9" height="26" rx="4" fill="#B97A50" />
      <Rect x="54" y="118" width="9" height="26" rx="4" fill="#B97A50" />
      <Path d="M33 104 L67 104 L68 124 L52 124 L50 114 L48 124 L32 124 Z" fill="#1565C0" />
      <Ellipse cx="41" cy="148" rx="10" ry="5" fill="#fff" stroke="#90A4AE" strokeWidth="1.5" />
      <Ellipse cx="60" cy="148" rx="10" ry="5" fill="#fff" stroke="#90A4AE" strokeWidth="1.5" />
      <Path d="M34 147 L47 147 M53 147 L66 147" stroke="#E53935" strokeWidth="2" />
      {/* Polera roja con estrella */}
      <Path d="M32 72 Q50 66 68 72 L70 106 L30 106 Z" fill="#E53935" />
      <Path d="M50 80 L53 87 L60 87 L54.5 91.5 L56.5 98.5 L50 94 L43.5 98.5 L45.5 91.5 L40 87 L47 87 Z" fill="#fff" />
      {/* Brazos */}
      <Path d="M34 76 Q20 90 24 106" stroke="#B97A50" strokeWidth="8" strokeLinecap="round" fill="none" />
      {saludando ? (
        <Path d="M66 76 Q84 66 84 48" stroke="#B97A50" strokeWidth="8" strokeLinecap="round" fill="none" />
      ) : (
        <Path d="M66 76 Q80 90 76 106" stroke="#B97A50" strokeWidth="8" strokeLinecap="round" fill="none" />
      )}
      <Circle cx={saludando ? 84 : 76} cy={saludando ? 45 : 108} r="5.5" fill="#B97A50" />
      {/* Cabeza, pelo crespo y jockey */}
      <Circle cx="50" cy="46" r="26" fill="#C68B5E" />
      <Circle cx="27" cy="44" r="6" fill="#2E1A12" />
      <Circle cx="73" cy="44" r="6" fill="#2E1A12" />
      <Path d="M24 36 Q26 14 50 14 Q74 14 76 36 Z" fill="#1E88E5" />
      <Path d="M50 30 Q78 28 92 36 Q78 40 62 36 Z" fill="#1565C0" />
      <Circle cx="50" cy="15" r="3" fill="#1565C0" />
      {/* Cara */}
      <Circle cx="41" cy="47" r="3.5" fill="#2E1A12" />
      <Circle cx="59" cy="47" r="3.5" fill="#2E1A12" />
      <Circle cx="42" cy="46" r="1.2" fill="#fff" />
      <Circle cx="60" cy="46" r="1.2" fill="#fff" />
      <Circle cx="34" cy="56" r="4" fill="#E57373" opacity="0.45" />
      <Circle cx="66" cy="56" r="4" fill="#E57373" opacity="0.45" />
      <Path d="M41 57 Q50 66 59 57" stroke="#2E1A12" strokeWidth="2.5" strokeLinecap="round" fill="#fff" />
    </Svg>
  );
}

/** Tito, el pudú: el ciervo más pequeño del mundo. Articulado: mueve patas, cola y cabeza. Lienzo de 100×80. */
export function TitoDibujo({ alto = 70, caminando = false, contento = false }: { alto?: number; caminando?: boolean; contento?: boolean }) {
  return <TitoAnimado alto={alto} caminando={caminando} contento={contento} />;
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
