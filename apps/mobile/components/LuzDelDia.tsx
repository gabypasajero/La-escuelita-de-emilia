import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { TINTE, useMomento } from "../lib/hora";
import { Luciernaga } from "./BarrioVivo";

/**
 * Capa de luz según la hora real, encima del escenario (pero debajo de los
 * globos de diálogo y botones). Afuera: velo de color, estrellas que titilan
 * y luciérnagas de noche. Adentro: un velo más suave. Las `luces` (faroles,
 * lámparas, ventanas) brillan con luz cálida de tarde y de noche.
 * Todo en unidades de diseño × `k`.
 */
interface Props {
  k: number;
  ancho: number;
  alto: number;
  interior?: boolean;
  /** Hasta qué altura llega el cielo (para las estrellas). Solo exterior. */
  cielo?: number;
  /** Zona del suelo donde vuelan las luciérnagas. Solo exterior. */
  suelo?: { yMin: number; yMax: number };
  luces?: Array<{ x: number; y: number; r?: number }>;
  zIndex?: number;
}

export function LuzDelDia({ k, ancho, alto, interior = false, cielo = 0, suelo, luces = [], zIndex = 5000 }: Props) {
  const momento = useMomento();
  const t = TINTE[momento];
  const opacidad = interior ? t.interior : t.exterior;
  const noche = momento === "noche";
  const encendidas = noche || momento === "tarde";
  const estrellas = useMemo(() => Array.from({ length: 22 }, (_, i) => ({ x: (i * 211 + 37) % ancho, y: 10 + ((i * 97) % Math.max(20, cielo - 20)), f: i })), [ancho, cielo]);
  const bichitos = useMemo(() => suelo ? Array.from({ length: 10 }, (_, i) => ({ x: (i * 313 + 60) % ancho, y: suelo.yMin + ((i * 151) % Math.max(10, suelo.yMax - suelo.yMin)), f: i })) : [], [ancho, suelo]);
  if (!opacidad && !encendidas) return null;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: ancho * k, height: alto * k, zIndex }}>
      {opacidad > 0 && <View style={{ position: "absolute", left: 0, top: 0, width: ancho * k, height: alto * k, backgroundColor: t.color, opacity: opacidad }} />}
      {!interior && noche && cielo > 0 && estrellas.map((e) => <Estrella key={e.f} k={k} x={e.x} y={e.y} fase={e.f} />)}
      {encendidas && luces.map((l, i) => <Resplandor key={i} k={k} x={l.x} y={l.y} r={l.r ?? 60} fuerte={noche} />)}
      {!interior && noche && bichitos.map((l) => <Luciernaga key={l.f} escala={k} x={l.x} y={l.y} fase={l.f} />)}
    </View>
  );
}

function Estrella({ k, x, y, fase }: { k: number; x: number; y: number; fase: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const b = Animated.loop(Animated.sequence([
      Animated.delay((fase % 5) * 400),
      Animated.timing(v, { toValue: 1, duration: 1400 + (fase % 3) * 500, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      Animated.timing(v, { toValue: 0, duration: 1400 + (fase % 3) * 500, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
    ]));
    b.start();
    return () => b.stop();
  }, [v, fase]);
  const r = 2 + (fase % 3);
  return (
    <Animated.View style={{ position: "absolute", left: (x - r * 2) * k, top: (y - r * 2) * k, opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) as never }}>
      <Svg width={r * 4 * k} height={r * 4 * k} viewBox={`0 0 ${r * 4} ${r * 4}`}>
        <Circle cx={r * 2} cy={r * 2} r={r * 2} fill="#FFF9C4" opacity="0.25" />
        <Circle cx={r * 2} cy={r * 2} r={r * 0.8} fill="#FFFDE7" />
      </Svg>
    </Animated.View>
  );
}

/** Luz cálida y redonda de un farol, lámpara o ventana encendida. */
export function Resplandor({ k, x, y, r, fuerte }: { k: number; x: number; y: number; r: number; fuerte: boolean }) {
  const id = `luz${Math.round(x)}-${Math.round(y)}`;
  return (
    <View style={{ position: "absolute", left: (x - r) * k, top: (y - r) * k }}>
      <Svg width={r * 2 * k} height={r * 2 * k} viewBox={`0 0 ${r * 2} ${r * 2}`}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFF59D" stopOpacity={fuerte ? 0.75 : 0.4} />
            <Stop offset="0.4" stopColor="#FFE082" stopOpacity={fuerte ? 0.35 : 0.18} />
            <Stop offset="1" stopColor="#FFE082" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={r} cy={r} r={r} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** Velo de color para toda la pantalla (cubre los bordes que quedan fuera del escenario). */
export function VeloPantalla({ interior = false }: { interior?: boolean }) {
  const t = TINTE[useMomento()];
  const o = interior ? t.interior : t.exterior;
  if (!o) return null;
  return <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, backgroundColor: t.color, opacity: o }} />;
}
