import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Ellipse, Line, Path, Rect } from "react-native-svg";

/**
 * Detalles que dan vida a los escenarios de cada lugar: sol con rayos que
 * giran, abejas que zumban, lámparas que se mecen, reloj con manecillas que
 * avanzan y acuario con peces. Posiciones en unidades de diseño × `k`.
 */
export { Bandada, MariposaVolando, Nube } from "./BarrioVivo";

function useBucle(ms: number, retraso = 0, idaYVuelta = false) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const ir = Animated.timing(v, { toValue: 1, duration: ms, easing: idaYVuelta ? Easing.inOut(Easing.sin) : Easing.linear, useNativeDriver: false });
    const b = Animated.loop(idaYVuelta
      ? Animated.sequence([Animated.delay(retraso), ir, Animated.timing(v, { toValue: 0, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: false })])
      : Animated.sequence([Animated.delay(retraso), ir, Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: false })]));
    b.start();
    return () => b.stop();
  }, [ms, retraso, idaYVuelta, v]);
  return v;
}

export function Sol({ k, x, y, r = 50 }: { k: number; x: number; y: number; r?: number }) {
  const giro = useBucle(30000);
  const t = r * 2.6;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: (x - t / 2) * k, top: (y - t / 2) * k, width: t * k, height: t * k }}>
      <Animated.View style={{ position: "absolute", width: t * k, height: t * k, transform: [{ rotate: giro.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) as never }] }}>
        <Svg width={t * k} height={t * k} viewBox={`${-t / 2} ${-t / 2} ${t} ${t}`}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            return <Line key={i} x1={Math.cos(a) * r * 1.1} y1={Math.sin(a) * r * 1.1} x2={Math.cos(a) * r * 1.25} y2={Math.sin(a) * r * 1.25} stroke="#FFE082" strokeWidth={r * 0.12} strokeLinecap="round" />;
          })}
        </Svg>
      </Animated.View>
      <Svg width={t * k} height={t * k} viewBox={`${-t / 2} ${-t / 2} ${t} ${t}`} style={{ position: "absolute" }}>
        <Circle r={r} fill="#FFEB3B" />
        <Circle r={r * 0.8} fill="#FFF176" />
      </Svg>
    </View>
  );
}

export function Abeja({ k, x, y, fase = 0, radio = 60 }: { k: number; x: number; y: number; fase?: number; radio?: number }) {
  const t = useBucle(7000 + fase * 900, fase * 300);
  const ala = useBucle(90);
  const n = 32, pts = Array.from({ length: n + 1 }, (_, i) => i / n);
  const dx = t.interpolate({ inputRange: pts, outputRange: pts.map((p) => Math.sin(2 * Math.PI * p + fase) * radio * k) });
  const dy = t.interpolate({ inputRange: pts, outputRange: pts.map((p) => Math.sin(4 * Math.PI * p + fase) * radio * 0.4 * k) });
  const mira = t.interpolate({ inputRange: pts, outputRange: pts.map((p) => (Math.cos(2 * Math.PI * p + fase) >= 0 ? -1 : 1)) });
  return (
    <Animated.View pointerEvents="none" style={{ position: "absolute", left: x * k, top: y * k, zIndex: 900, transform: [{ translateX: dx as never }, { translateY: dy as never }, { scaleX: mira as never }] }}>
      <Animated.View style={{ position: "absolute", left: 6 * k, top: -6 * k, opacity: 0.75, transform: [{ scaleY: ala.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.3, 1] }) as never }] }}>
        <Svg width={14 * k} height={10 * k} viewBox="0 0 14 10"><Ellipse cx="4" cy="6" rx="4" ry="5" fill="#E3F2FD" /><Ellipse cx="10" cy="6" rx="4" ry="5" fill="#E3F2FD" /></Svg>
      </Animated.View>
      <Svg width={22 * k} height={14 * k} viewBox="0 0 22 14">
        <Ellipse cx="12" cy="8" rx="8" ry="5.5" fill="#FFCA28" />
        <Path d="M10 3 L10 13 M14 3 L14 13" stroke="#3E2723" strokeWidth="2" />
        <Circle cx="4.5" cy="8" r="3.5" fill="#3E2723" />
        <Circle cx="3.6" cy="7.2" r="0.9" fill="#fff" />
        <Path d="M20 8 L22 8" stroke="#3E2723" strokeWidth="1.5" />
      </Svg>
    </Animated.View>
  );
}

/** Lámpara que cuelga del techo y se mece suave. */
export function LamparaColgante({ k, x, y, largo = 70, color = "#FFB300" }: { k: number; x: number; y: number; largo?: number; color?: string }) {
  const t = useBucle(2600, 0, true);
  const w = 70, h = largo * 2 + 40;
  return (
    <Animated.View pointerEvents="none" style={{ position: "absolute", left: (x - w / 2) * k, top: (y - h / 2) * k, width: w * k, height: h * k, transform: [{ rotate: t.interpolate({ inputRange: [0, 1], outputRange: ["-4deg", "4deg"] }) as never }] }}>
      <Svg width={w * k} height={h * k} viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`}>
        <Line x1="0" y1="0" x2="0" y2={largo} stroke="#5D4037" strokeWidth="2" />
        <Path d={`M-22 ${largo + 22} Q0 ${largo - 6} 22 ${largo + 22} Z`} fill={color} />
        <Ellipse cx="0" cy={largo + 24} rx="8" ry="5" fill="#FFF9C4" />
        <Ellipse cx="0" cy={largo + 30} rx="30" ry="10" fill="#FFF59D" opacity="0.25" />
      </Svg>
    </Animated.View>
  );
}

/** Reloj de pared: el minutero marca la hora real y el segundero da la vuelta. */
export function Reloj({ k, x, y, r = 30 }: { k: number; x: number; y: number; r?: number }) {
  const seg = useBucle(60000);
  const ahora = new Date();
  const min = ahora.getMinutes(), hora = ahora.getHours() % 12;
  const t = r * 2 + 8;
  const Mano = ({ ang, largo, grosor, color }: { ang: number | Animated.AnimatedInterpolation<string>; largo: number; grosor: number; color: string }) => (
    <Animated.View style={{ position: "absolute", width: t * k, height: t * k, transform: [{ rotate: (typeof ang === "number" ? `${ang}deg` : ang) as never }] }}>
      <Svg width={t * k} height={t * k} viewBox={`${-t / 2} ${-t / 2} ${t} ${t}`}><Line x1="0" y1="2" x2="0" y2={-largo} stroke={color} strokeWidth={grosor} strokeLinecap="round" /></Svg>
    </Animated.View>
  );
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: (x - t / 2) * k, top: (y - t / 2) * k, width: t * k, height: t * k }}>
      <Svg width={t * k} height={t * k} viewBox={`${-t / 2} ${-t / 2} ${t} ${t}`} style={{ position: "absolute" }}>
        <Circle r={r + 3} fill="#8D6E63" />
        <Circle r={r} fill="#FFFDE7" />
        {Array.from({ length: 12 }, (_, i) => <Circle key={i} cx={Math.sin((i * Math.PI) / 6) * r * 0.82} cy={-Math.cos((i * Math.PI) / 6) * r * 0.82} r={i % 3 === 0 ? 2.4 : 1.4} fill="#5D4037" />)}
      </Svg>
      <Mano ang={hora * 30 + min / 2} largo={r * 0.5} grosor={3.5} color="#3E2723" />
      <Mano ang={min * 6} largo={r * 0.72} grosor={2.5} color="#3E2723" />
      <Mano ang={seg.interpolate({ inputRange: [0, 1], outputRange: [`${ahora.getSeconds() * 6}deg`, `${ahora.getSeconds() * 6 + 360}deg`] })} largo={r * 0.8} grosor={1.2} color="#E53935" />
      <Svg width={t * k} height={t * k} viewBox={`${-t / 2} ${-t / 2} ${t} ${t}`} style={{ position: "absolute" }}><Circle r="2.5" fill="#E53935" /></Svg>
    </View>
  );
}

function Pez({ k, w, h, y, color, ms, retraso }: { k: number; w: number; h: number; y: number; color: string; ms: number; retraso: number }) {
  const t = useBucle(ms, retraso, true);
  const cola = useBucle(300, 0, true);
  return (
    <Animated.View style={{ position: "absolute", top: y * k, transform: [
      { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [8 * k, (w - 36) * k] }) as never },
      { scaleX: t.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [-1, -1, 1, 1] }) as never },
    ] }}>
      <Svg width={28 * k} height={16 * k} viewBox="0 0 28 16">
        <Ellipse cx="12" cy="8" rx="10" ry="6" fill={color} />
        <Circle cx="7" cy="7" r="1.6" fill="#212121" />
        <Path d="M20 8 L28 2 L28 14 Z" fill={color} opacity="0.85" />
      </Svg>
    </Animated.View>
  );
}

/** Pecera con peces que nadan y burbujas que suben. */
export function Acuario({ k, x, y, w = 160, h = 100 }: { k: number; x: number; y: number; w?: number; h?: number }) {
  const burbuja = useBucle(2400);
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: x * k, top: y * k, width: w * k, height: h * k }}>
      <Svg width={w * k} height={h * k} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute" }}>
        <Rect x="0" y="0" width={w} height={h} rx="8" fill="#B3E5FC" stroke="#78909C" strokeWidth="5" />
        <Rect x="4" y="10" width={w - 8} height={h - 14} fill="#4FC3F7" opacity="0.6" />
        <Path d={`M10 ${h - 6} Q${w / 2} ${h - 18} ${w - 10} ${h - 6} Z`} fill="#FFE082" />
        <Path d={`M30 ${h - 10} Q26 ${h - 40} 34 ${h - 56} M40 ${h - 10} Q46 ${h - 34} 40 ${h - 48}`} stroke="#43A047" strokeWidth="4" fill="none" strokeLinecap="round" />
      </Svg>
      <Pez k={k} w={w} h={h} y={20} color="#FF7043" ms={5200} retraso={0} />
      <Pez k={k} w={w} h={h} y={46} color="#FFEE58" ms={6800} retraso={900} />
      <Pez k={k} w={w} h={h} y={62} color="#BA68C8" ms={4600} retraso={400} />
      {[0, 1, 2].map((i) => (
        <Animated.View key={i} style={{ position: "absolute", left: (w - 40 + i * 8) * k, top: 0,
          opacity: burbuja.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.9, 0.9, 0] }) as never,
          transform: [{ translateY: burbuja.interpolate({ inputRange: [0, 1], outputRange: [(h - 14 - i * 10) * k, 12 * k] }) as never }] }}>
          <Svg width={8 * k} height={8 * k} viewBox="0 0 8 8"><Circle cx="4" cy="4" r="3" fill="none" stroke="#E1F5FE" strokeWidth="1.2" /></Svg>
        </Animated.View>
      ))}
    </View>
  );
}

