import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

/**
 * Emilia y Tito "articulados": cada parte del cuerpo (piernas, brazos, cabeza,
 * colitas, ojos, cola) es una pieza aparte que gira desde su articulación
 * (cadera, hombro, cuello). Así caminan moviendo brazos y piernas, pestañean,
 * respiran y cambian de expresión, en vez de ser un dibujo quieto que se desliza.
 *
 * Todo se dibuja en "unidades": Emilia en un lienzo de 100×160 y Tito en 100×80,
 * igual que los dibujos anteriores, para que calcen en los mismos lugares.
 */
export type Expresion = "feliz" | "saludando" | "celebrando" | "sorprendida" | "pensativa";

// ---------- Animación ----------

const PUNTOS = Array.from({ length: 17 }, (_, i) => i / 16);

/** Valor que va de 0 a 1 en bucle mientras `activo`. */
export function useCiclo(ms: number, activo = true) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!activo) {
      v.stopAnimation();
      v.setValue(0);
      return;
    }
    v.setValue(0);
    const bucle = Animated.loop(Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: false }));
    bucle.start();
    return () => bucle.stop();
  }, [ms, activo, v]);
  return v;
}

/** Seno de un ciclo, de -amp a amp (o |seno| si `rebote`). */
export function onda(c: Animated.Value, amp: number, fase = 0, rebote = false) {
  return c.interpolate({ inputRange: PUNTOS, outputRange: PUNTOS.map((t) => {
    const s = Math.sin(2 * Math.PI * t + fase);
    return amp * (rebote ? -Math.abs(s) : s);
  }) });
}

/** Ángulo base + oscilación, como "deg". */
export function angulo(base: number, oscilacion?: Animated.AnimatedInterpolation<number>) {
  const a = oscilacion ? Animated.add(base, oscilacion) : new Animated.Value(base);
  return a.interpolate({ inputRange: [-360, 360], outputRange: ["-360deg", "360deg"] });
}

/** Pestañeo cada unos segundos (escala vertical del ojo). */
export function useParpadeo(cada = 3200) {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const bucle = Animated.loop(Animated.sequence([
      Animated.delay(cada + Math.random() * 1500),
      Animated.timing(v, { toValue: 0.1, duration: 80, useNativeDriver: false }),
      Animated.timing(v, { toValue: 1, duration: 110, useNativeDriver: false }),
    ]));
    bucle.start();
    return () => bucle.stop();
  }, [cada, v]);
  return v;
}

/**
 * Una pieza que gira alrededor de su articulación (px, py). Su lienzo (w×h
 * unidades) está centrado en la articulación, así el giro de la vista es el
 * giro de la pieza. Los hijos se dibujan en coordenadas del personaje.
 */
export function Pieza({ s, px, py, w, h, rot, children, encima }: {
  s: number; px: number; py: number; w: number; h: number;
  rot?: Animated.AnimatedInterpolation<string | number>; children: ReactNode; encima?: ReactNode;
}) {
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: "absolute", left: (px - w / 2) * s, top: (py - h / 2) * s, width: w * s, height: h * s, transform: rot ? [{ rotate: rot as never }] : [] }}
    >
      <Svg width={w * s} height={h * s} viewBox={`${px - w / 2} ${py - h / 2} ${w} ${h}`}>{children}</Svg>
      {encima}
    </Animated.View>
  );
}

// ---------- Emilia ----------

const PIEL = "#F6D3B3";
const PIEL_BRAZO = "#F1C7A5";
const PELO = "#5D4037";

export function EmiliaAnimada({ alto = 160, caminando = false, expresion = "feliz" }: { alto?: number; caminando?: boolean; expresion?: Expresion }) {
  const s = alto / 160;
  const paso = useCiclo(560, caminando);
  const calma = useCiclo(2600);
  const fiesta = useCiclo(480, expresion === "celebrando");
  const saludo = useCiclo(700, expresion === "saludando");
  const ojo = useParpadeo();

  // Cuerpo: rebota al caminar, respira quieta, salta al celebrar.
  const bote = caminando ? onda(paso, 3.2 * s, 0, true) : expresion === "celebrando" ? onda(fiesta, 9 * s, 0, true) : onda(calma, 1 * s);
  // Piernas y brazos opuestos al caminar; balanceo suave quieta.
  const piernaIzq = angulo(0, caminando ? onda(paso, 24) : undefined);
  const piernaDer = angulo(0, caminando ? onda(paso, 24, Math.PI) : undefined);
  const brazoIzq = expresion === "celebrando" ? angulo(118, onda(fiesta, 12))
    : angulo(12, caminando ? onda(paso, 20, Math.PI) : onda(calma, 3));
  const brazoDer = expresion === "celebrando" ? angulo(-118, onda(fiesta, 12, Math.PI))
    : expresion === "saludando" ? angulo(-125, onda(saludo, 18))
    : angulo(-12, caminando ? onda(paso, 20) : onda(calma, 3, Math.PI));
  const inclinacion = expresion === "pensativa" ? angulo(-7) : angulo(0, caminando ? onda(paso, 2.5, Math.PI / 2) : onda(calma, 2));
  const colitaIzq = angulo(0, caminando ? onda(paso, 10, Math.PI / 2) : onda(calma, 4));
  const colitaDer = angulo(0, caminando ? onda(paso, 10, Math.PI * 1.5) : onda(calma, 4, Math.PI));

  // Cabeza: lienzo centrado en el cuello (50, 70), de 110×110 unidades.
  const C = { px: 50, py: 70, w: 110, h: 110 };
  const ox = C.px - C.w / 2, oy = C.py - C.h / 2;
  const ojosCerrados = expresion === "celebrando";
  const mirar = expresion === "pensativa" ? { dx: 1.6, dy: -1.8 } : { dx: 0, dy: 0 };
  const Ojo = ({ cx }: { cx: number }) => (
    <Animated.View style={{ position: "absolute", left: (cx - 5 - ox) * s, top: (46 - 5 - oy) * s, width: 10 * s, height: 10 * s, transform: [{ scaleY: ojosCerrados ? 1 : (ojo as never) }] }}>
      <Svg width={10 * s} height={10 * s} viewBox={`${cx - 5} 41 10 10`}>
        {ojosCerrados ? (
          <Path d={`M${cx - 3.5} 47 Q${cx} 42 ${cx + 3.5} 47`} stroke="#3B2F5C" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        ) : (
          <>
            <Circle cx={cx + mirar.dx} cy={46 + mirar.dy} r={expresion === "sorprendida" ? 4.2 : 3.6} fill="#3B2F5C" />
            <Circle cx={cx + 1.1 + mirar.dx} cy={44.9 + mirar.dy} r="1.3" fill="#fff" />
          </>
        )}
      </Svg>
    </Animated.View>
  );

  return (
    <Animated.View style={{ width: 100 * s, height: 160 * s, transform: [{ translateY: bote as never }] }} pointerEvents="none">
      {/* Piernas (giran desde la cadera) */}
      <Pieza s={s} px={42} py={122} w={44} h={66} rot={piernaIzq}>
        <Rect x="38" y="120" width="8" height="26" rx="4" fill={PIEL_BRAZO} />
        <Ellipse cx="41" cy="148" rx="9" ry="5" fill="#E53935" />
      </Pieza>
      <Pieza s={s} px={58} py={122} w={44} h={66} rot={piernaDer}>
        <Rect x="54" y="120" width="8" height="26" rx="4" fill={PIEL_BRAZO} />
        <Ellipse cx="59" cy="148" rx="9" ry="5" fill="#E53935" />
      </Pieza>
      {/* Vestido */}
      <Svg width={100 * s} height={160 * s} viewBox="0 0 100 160" style={{ position: "absolute" }}>
        <Path d="M35 72 L65 72 L80 126 L20 126 Z" fill="#FDD835" />
        <Path d="M33 74 L67 74 L69 82 L31 82 Z" fill="#FBC02D" opacity="0.5" />
        <Path d="M20 126 L80 126" stroke="#F9A825" strokeWidth="4" />
        <Circle cx="50" cy="96" r="5" fill="#fff" />
        <Path d="M28 110 Q50 116 72 110" stroke="#F9A825" strokeWidth="1.5" fill="none" opacity="0.6" />
      </Svg>
      {/* Brazos (giran desde el hombro) */}
      <Pieza s={s} px={36} py={78} w={80} h={80} rot={brazoIzq}>
        <Path d="M36 78 Q24 92 25 108" stroke={PIEL_BRAZO} strokeWidth="8" strokeLinecap="round" fill="none" />
        <Circle cx="25" cy="110" r="5" fill={PIEL_BRAZO} />
      </Pieza>
      <Pieza s={s} px={64} py={78} w={80} h={80} rot={brazoDer}>
        <Path d="M64 78 Q76 92 75 108" stroke={PIEL_BRAZO} strokeWidth="8" strokeLinecap="round" fill="none" />
        <Circle cx="75" cy="110" r="5" fill={PIEL_BRAZO} />
      </Pieza>
      {/* Cabeza (gira desde el cuello) con colitas, cara y ojos */}
      <Animated.View style={{ position: "absolute", left: ox * s, top: oy * s, width: C.w * s, height: C.h * s, transform: [{ rotate: inclinacion as never }] }}>
        <Pieza s={s} px={26} py={34} w={40} h={40} rot={colitaIzq}>
          <Circle cx="18" cy="38" r="12" fill={PELO} />
        </Pieza>
        <Pieza s={s} px={74} py={34} w={40} h={40} rot={colitaDer}>
          <Circle cx="82" cy="38" r="12" fill={PELO} />
        </Pieza>
        <View style={{ position: "absolute", left: (0 - ox) * s, top: (0 - oy) * s }}>
          <Svg width={100 * s} height={80 * s} viewBox="0 0 100 80">
            <Circle cx="50" cy="44" r="27" fill={PIEL} />
            <Path d="M23 42 Q26 14 50 14 Q76 14 77 42 Q66 26 50 28 Q34 26 23 42 Z" fill={PELO} />
            <Path d="M34 22 Q44 17 56 19" stroke="#8D6E63" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
            <Circle cx="25" cy="30" r="4" fill="#E53935" />
            <Circle cx="75" cy="30" r="4" fill="#E53935" />
            {/* Cejas */}
            {expresion === "sorprendida" ? (
              <G stroke={PELO} strokeWidth="2" strokeLinecap="round" fill="none"><Path d="M35 36 Q40 32 45 35" /><Path d="M55 35 Q60 32 65 36" /></G>
            ) : expresion === "pensativa" ? (
              <G stroke={PELO} strokeWidth="2" strokeLinecap="round" fill="none"><Path d="M35 39 Q40 38 45 39" /><Path d="M55 37 Q60 34 65 36" /></G>
            ) : (
              <G stroke={PELO} strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8"><Path d="M35 38 Q40 36 45 38" /><Path d="M55 38 Q60 36 65 38" /></G>
            )}
            <Circle cx="33" cy="55" r="4.5" fill="#F48FB1" opacity={expresion === "celebrando" ? 0.85 : 0.6} />
            <Circle cx="67" cy="55" r="4.5" fill="#F48FB1" opacity={expresion === "celebrando" ? 0.85 : 0.6} />
            {/* Boca según la expresión */}
            {expresion === "celebrando" ? (
              <G><Path d="M40 55 Q50 71 60 55 Z" fill="#7B1F3A" /><Path d="M44 63 Q50 67 56 63 Q50 60 44 63 Z" fill="#F06292" /></G>
            ) : expresion === "sorprendida" ? (
              <Ellipse cx="50" cy="59" rx="3.6" ry="4.6" fill="#7B1F3A" />
            ) : expresion === "pensativa" ? (
              <Path d="M44 59 Q49 57.5 56 60" stroke="#3B2F5C" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            ) : (
              <Path d="M42 57 Q50 65 58 57" stroke="#3B2F5C" strokeWidth="2.5" strokeLinecap="round" fill="#fff" />
            )}
          </Svg>
        </View>
        <Ojo cx={40} />
        <Ojo cx={60} />
      </Animated.View>
    </Animated.View>
  );
}

// ---------- Tito, el pudú ----------

export function TitoAnimado({ alto = 70, caminando = false, contento = false }: { alto?: number; caminando?: boolean; contento?: boolean }) {
  const s = alto / 80;
  const paso = useCiclo(420, caminando);
  const calma = useCiclo(2200);
  const colaRapida = useCiclo(260, contento || caminando);
  const ojo = useParpadeo(2800);

  const pata = (fase: number) => angulo(0, caminando ? onda(paso, 22, fase) : undefined);
  const cola = angulo(0, contento || caminando ? onda(colaRapida, 26) : onda(calma, 10));
  const cabeza = angulo(0, caminando ? onda(paso, 5, Math.PI / 2) : onda(calma, 4));
  const bote = caminando ? onda(paso, 2 * s, 0, true) : contento ? onda(colaRapida, 4 * s, 0, true) : onda(calma, 0.6 * s);

  const C = { px: 34, py: 40, w: 64, h: 64 };
  const ox = C.px - C.w / 2, oy = C.py - C.h / 2;

  return (
    <Animated.View style={{ width: 100 * s, height: 80 * s, transform: [{ translateY: bote as never }] }} pointerEvents="none">
      {/* Patas de atrás (más oscuras, detrás) */}
      <Pieza s={s} px={45} py={54} w={30} h={50} rot={pata(Math.PI)}><Rect x="42" y="52" width="6" height="22" rx="3" fill="#5D4037" /></Pieza>
      <Pieza s={s} px={63} py={54} w={30} h={50} rot={pata(0)}><Rect x="60" y="52" width="6" height="22" rx="3" fill="#5D4037" /></Pieza>
      {/* Cola (se mueve feliz) */}
      <Pieza s={s} px={80} py={42} w={24} h={24} rot={cola}><Circle cx="84" cy="38" r="5.5" fill="#8D5524" /></Pieza>
      {/* Cuerpo */}
      <Svg width={100 * s} height={80 * s} viewBox="0 0 100 80" style={{ position: "absolute" }}>
        <Ellipse cx="54" cy="46" rx="28" ry="16" fill="#A1673F" />
        <Ellipse cx="56" cy="52" rx="20" ry="7" fill="#C8936A" opacity="0.45" />
        {[46, 56, 66].map((x) => <Circle key={x} cx={x} cy={40} r="1.6" fill="#E8C9A8" opacity="0.6" />)}
      </Svg>
      {/* Patas de adelante */}
      <Pieza s={s} px={33} py={52} w={30} h={50} rot={pata(0)}><Rect x="30" y="50" width="6" height="24" rx="3" fill="#6D4C41" /></Pieza>
      <Pieza s={s} px={73} py={52} w={30} h={50} rot={pata(Math.PI)}><Rect x="70" y="50" width="6" height="24" rx="3" fill="#6D4C41" /></Pieza>
      {/* Cabeza (gira desde el cuello) */}
      <Animated.View style={{ position: "absolute", left: ox * s, top: oy * s, width: C.w * s, height: C.h * s, transform: [{ rotate: cabeza as never }] }}>
        <View style={{ position: "absolute", left: (0 - ox) * s, top: (0 - oy) * s }}>
          <Svg width={60 * s} height={60 * s} viewBox="0 0 60 60">
            <Ellipse cx="30" cy="14" rx="5" ry="9" fill="#8D5524" transform="rotate(20 30 14)" />
            <Ellipse cx="20" cy="15" rx="5" ry="9" fill="#8D5524" transform="rotate(-20 20 15)" />
            <Ellipse cx="30" cy="15" rx="2.2" ry="5" fill="#D7A27A" transform="rotate(20 30 15)" />
            <Path d="M24 16 L23 6 M28 16 L30 7" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
            <Ellipse cx="26" cy="30" rx="15" ry="13" fill="#A1673F" />
            <Ellipse cx="14" cy="34" rx="8" ry="6" fill="#C8936A" />
            <Circle cx="8" cy="33" r="3" fill="#3E2723" />
            <Path d="M11 38 Q14 40 17 38" stroke="#5D4037" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </Svg>
        </View>
        <Animated.View style={{ position: "absolute", left: (24 - 5 - ox) * s, top: (28 - 5 - oy) * s, width: 10 * s, height: 10 * s, transform: [{ scaleY: ojo as never }] }}>
          <Svg width={10 * s} height={10 * s} viewBox="19 23 10 10">
            <Circle cx="24" cy="28" r="3.5" fill="#3B2F5C" />
            <Circle cx="25" cy="27" r="1.2" fill="#fff" />
          </Svg>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
