import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";
import { AnimalVivo } from "./AnimalesVivos";
import { TINTE, useMomento } from "../lib/hora";
import { Resplandor } from "./LuzDelDia";

/**
 * Lo que hace que el barrio se sienta vivo: nubes que pasan con su sombra,
 * pájaros que cruzan, mariposas que revolotean, humo en la chimenea de Emilia,
 * ondas en la laguna y la luz del día según la hora real (amanecer, día,
 * tarde y noche con luciérnagas). Todo en unidades del mundo × `escala`.
 */
interface Props {
  escala: number;
  ancho: number;
  alto: number;
  /** Punto de la chimenea de la casa de Emilia (unidades del mundo). */
  chimenea: { x: number; y: number };
  /** Donde nada el pato (centro de las ondas). */
  laguna: { x: number; y: number };
  /** Lugares con flores donde revolotean las mariposas. */
  flores: Array<{ x: number; y: number }>;
  /** Ventanas y faroles que se encienden de tarde y de noche (brillan sobre la oscuridad). */
  luces?: Array<{ x: number; y: number; r?: number }>;
}

/** Bucle 0→1 con duración y retraso inicial. */
function useBucle(ms: number, retraso = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const b = Animated.loop(Animated.sequence([Animated.delay(retraso), Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: false }), Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: false })]));
    b.start();
    return () => b.stop();
  }, [ms, retraso, v]);
  return v;
}

export function Nube({ escala, ancho, y, ms, retraso, tam, sombra = true }: { escala: number; ancho: number; y: number; ms: number; retraso: number; tam: number; sombra?: boolean }) {
  const t = useBucle(ms, retraso);
  const x = t.interpolate({ inputRange: [0, 1], outputRange: [-tam * 1.5 * escala, (ancho + tam) * escala] });
  const w = tam * escala, h = tam * 0.55 * escala;
  return (
    <>
      {/* Sombra de la nube en el suelo (solo en el barrio visto desde arriba) */}
      {sombra && <Animated.View pointerEvents="none" style={{ position: "absolute", top: (y + tam * 1.1) * escala, transform: [{ translateX: Animated.add(x, 30 * escala) as never }], zIndex: 1 }}>
        <Svg width={w} height={h * 0.7} viewBox="0 0 100 40"><Ellipse cx="50" cy="20" rx="48" ry="18" fill="#000" opacity="0.07" /></Svg>
      </Animated.View>}
      <Animated.View pointerEvents="none" style={{ position: "absolute", top: y * escala, transform: [{ translateX: x as never }], zIndex: 2000 }}>
        <Svg width={w} height={h} viewBox="0 0 100 55">
          <Path d="M10 45 Q0 45 4 34 Q6 24 18 26 Q20 10 38 12 Q48 0 64 8 Q80 4 84 20 Q98 22 96 36 Q96 47 84 47 Z" fill="#fff" opacity="0.88" />
          <Path d="M14 44 Q40 50 86 44" stroke="#E3F2FD" strokeWidth="3" fill="none" />
        </Svg>
      </Animated.View>
    </>
  );
}

export function Bandada({ escala, ancho, y, ms, retraso }: { escala: number; ancho: number; y: number; ms: number; retraso: number }) {
  const momento = useMomento();
  const t = useBucle(ms, retraso);
  // Vuelan de derecha a izquierda (así miran los pájaros), con una ondulación suave.
  const x = t.interpolate({ inputRange: [0, 1], outputRange: [(ancho + 100) * escala, -200 * escala] });
  const ondula = t.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -18 * escala, 0, 18 * escala, 0] });
  if (momento === "noche") return null; // de noche duermen
  return (
    <Animated.View pointerEvents="none" style={{ position: "absolute", top: y * escala, transform: [{ translateX: x as never }, { translateY: ondula as never }], zIndex: 2100 }}>
      {[[0, 0], [38, -22], [44, 26]].map(([dx, dy], i) => (
        <View key={i} style={{ position: "absolute", left: dx! * escala, top: dy! * escala }}>
          <AnimalVivo id="pajaro" alto={26 * escala} />
        </View>
      ))}
    </Animated.View>
  );
}

export function MariposaVolando({ escala, x, y, fase }: { escala: number; x: number; y: number; fase: number }) {
  const momento = useMomento();
  const t = useBucle(9000 + fase * 1300, fase * 400);
  const n = 24;
  const pts = Array.from({ length: n + 1 }, (_, i) => i / n);
  const dx = t.interpolate({ inputRange: pts, outputRange: pts.map((p) => Math.sin(2 * Math.PI * p + fase) * 70 * escala) });
  const dy = t.interpolate({ inputRange: pts, outputRange: pts.map((p) => (Math.sin(4 * Math.PI * p + fase) * 26 - Math.abs(Math.sin(12 * Math.PI * p)) * 8) * escala) });
  if (momento === "noche") return null; // de noche duermen
  return (
    <Animated.View pointerEvents="none" style={{ position: "absolute", left: x * escala, top: y * escala, transform: [{ translateX: dx as never }, { translateY: dy as never }], zIndex: Math.round(y / 25) + 40 }}>
      <AnimalVivo id="mariposa" alto={26 * escala} />
    </Animated.View>
  );
}

function Humo({ escala, x, y }: { escala: number; x: number; y: number }) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: x * escala, top: y * escala, zIndex: 1500 }}>
      {[0, 1, 2, 3].map((i) => <Bocanada key={i} escala={escala} retraso={i * 900} />)}
    </View>
  );
}
function Bocanada({ escala, retraso }: { escala: number; retraso: number }) {
  const t = useBucle(3600, retraso);
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: -12 * escala,
        top: -12 * escala,
        opacity: t.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.75, 0] }) as never,
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -110 * escala] }) as never },
          { translateX: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 14 * escala, 32 * escala] }) as never },
          { scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.9] }) as never },
        ],
      }}
    >
      <Svg width={24 * escala} height={24 * escala} viewBox="0 0 24 24"><Circle cx="12" cy="12" r="11" fill="#ECEFF1" /></Svg>
    </Animated.View>
  );
}

function Onda({ escala, x, y, retraso }: { escala: number; x: number; y: number; retraso: number }) {
  const t = useBucle(2600, retraso);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute", left: (x - 40) * escala, top: (y - 14) * escala, zIndex: Math.round(y / 25) - 1,
        opacity: t.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.8, 0] }) as never,
        transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.6] }) as never }],
      }}
    >
      <Svg width={80 * escala} height={28 * escala} viewBox="0 0 80 28"><Ellipse cx="40" cy="14" rx="36" ry="11" fill="none" stroke="#E1F5FE" strokeWidth="2.5" /></Svg>
    </Animated.View>
  );
}

export function Luciernaga({ escala, x, y, fase }: { escala: number; x: number; y: number; fase: number }) {
  const t = useBucle(5000 + fase * 700, fase * 300);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute", left: x * escala, top: y * escala, zIndex: 2300,
        opacity: t.interpolate({ inputRange: [0, 0.3, 0.5, 0.7, 1], outputRange: [0.1, 1, 0.2, 1, 0.1] }) as never,
        transform: [
          { translateX: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 30 * escala, 0] }) as never },
          { translateY: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -20 * escala, 0] }) as never },
        ],
      }}
    >
      <Svg width={14 * escala} height={14 * escala} viewBox="0 0 14 14">
        <Circle cx="7" cy="7" r="7" fill="#FFF59D" opacity="0.35" />
        <Circle cx="7" cy="7" r="2.6" fill="#FFF176" />
      </Svg>
    </Animated.View>
  );
}

export function BarrioVivo({ escala, ancho, alto, chimenea, laguna, flores, luces = [] }: Props) {
  const momento = useMomento();
  const tinte = { color: TINTE[momento].color, opacidad: TINTE[momento].exterior };
  const luciernagas = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ x: (i * 397) % ancho, y: 220 + ((i * 613) % (alto - 260)), f: i })), [ancho, alto]);

  return (
    <>
      {[{ y: 120, ms: 70000, r: 0, tam: 220 }, { y: 520, ms: 95000, r: 15000, tam: 180 }, { y: 880, ms: 82000, r: 40000, tam: 240 }, { y: 300, ms: 110000, r: 60000, tam: 160 }].map((n, i) => (
        <Nube key={i} escala={escala} ancho={ancho} y={n.y} ms={n.ms} retraso={n.r} tam={n.tam} />
      ))}
      {/* De noche los pájaros y las mariposas duermen: salen las luciérnagas */}
      {momento !== "noche" && <Bandada escala={escala} ancho={ancho} y={260} ms={16000} retraso={3000} />}
      {momento !== "noche" && <Bandada escala={escala} ancho={ancho} y={760} ms={19000} retraso={14000} />}
      {momento !== "noche" && flores.map((f, i) => <MariposaVolando key={i} escala={escala} x={f.x} y={f.y} fase={i} />)}
      <Humo escala={escala} x={chimenea.x} y={chimenea.y} />
      {[0, 1300].map((r) => <Onda key={r} escala={escala} x={laguna.x} y={laguna.y} retraso={r} />)}
      {tinte.opacidad > 0 && (
        <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: ancho * escala, height: alto * escala, backgroundColor: tinte.color, opacity: tinte.opacidad, zIndex: 2200 }} />
      )}
      {(momento === "noche" || momento === "tarde") && (
        <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, zIndex: 2250 }}>
          {luces.map((l, i) => <Resplandor key={i} k={escala} x={l.x} y={l.y} r={l.r ?? 70} fuerte={momento === "noche"} />)}
        </View>
      )}
      {momento === "noche" && luciernagas.map((l) => <Luciernaga key={l.f} escala={escala} x={l.x} y={l.y} fase={l.f} />)}
    </>
  );
}
