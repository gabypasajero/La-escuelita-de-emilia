import { useEffect, useId, useRef, type ReactNode } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";

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

// ---------- Sombreado común ----------

/**
 * Degradados de volumen que sirven para cualquier color (son luces blancas y
 * sombras negras transparentes): la luz viene de arriba a la izquierda.
 * Se dibuja la forma con su color y encima la misma forma con `url(#vol)`.
 */
export function Sombreado({ suf }: { suf: string }) {
  return (
    <Defs>
      <RadialGradient id={`vol${suf}`} cx="34%" cy="28%" r="78%">
        <Stop offset="0" stopColor="#fff" stopOpacity="0.32" />
        <Stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        <Stop offset="0.85" stopColor="#B35A2E" stopOpacity="0.05" />
        <Stop offset="1" stopColor="#B35A2E" stopOpacity="0.12" />
      </RadialGradient>
      <LinearGradient id={`volL${suf}`} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#fff" stopOpacity="0.26" />
        <Stop offset="0.55" stopColor="#fff" stopOpacity="0" />
        <Stop offset="1" stopColor="#8A4B2A" stopOpacity="0.12" />
      </LinearGradient>
      <LinearGradient id={`volV${suf}`} x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#fff" stopOpacity="0.2" />
        <Stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        <Stop offset="1" stopColor="#8A4B2A" stopOpacity="0.12" />
      </LinearGradient>
    </Defs>
  );
}
/**
 * Nombres únicos para los degradados de cada personaje. En la web, cuando una
 * pantalla queda oculta debajo de otra, el navegador no pinta degradados que
 * apunten a ella; con nombres únicos cada personaje usa los suyos.
 */
export function useSombreado() {
  const suf = useId().replace(/[^a-zA-Z0-9]/g, "");
  return { suf, vol: `url(#vol${suf})`, volL: `url(#volL${suf})`, volV: `url(#volV${suf})` };
}
/**
 * Ojo tierno de dibujo animado: grande, con iris café, brillo grande y
 * brillo chico. Sirve para todos los personajes.
 */
export function ojoTierno(cx: number, cy: number, r = 4.6, iris = "#6D4C41") {
  return (
    <G key={`ojo${cx}`}>
      <Ellipse cx={cx} cy={cy} rx={r} ry={r * 1.12} fill="#2B1D16" />
      <Ellipse cx={cx} cy={cy + r * 0.28} rx={r * 0.72} ry={r * 0.7} fill={iris} />
      <Ellipse cx={cx} cy={cy + r * 0.55} rx={r * 0.45} ry={r * 0.28} fill="#fff" opacity="0.18" />
      <Circle cx={cx - r * 0.32} cy={cy - r * 0.38} r={r * 0.42} fill="#fff" />
      <Circle cx={cx + r * 0.4} cy={cy + r * 0.36} r={r * 0.17} fill="#fff" opacity="0.9" />
    </G>
  );
}

/** Contorno suave (más oscuro que el color de relleno, sin importar cuál sea). */
export const CONTORNO = { stroke: "#6D3B1F", strokeOpacity: 0.12, strokeWidth: 0.9 } as const;

// ---------- Emilia ----------

const PIEL = "#F6D3B3";
const PIEL_BRAZO = "#F1C7A5";
const PELO = "#5D4037";
const VESTIDO = "#FDD835";
/** Pelo con flequillo ondulado (mechones sobre la frente), en vez de un casco liso. */
const PELO_FLEQUILLO = "M22 46 Q20 14 50 12 Q80 14 78 46 Q76 36 70 31 Q66 37 60 34 Q56 39 50 35 Q44 39 40 34 Q34 37 30 31 Q24 36 22 46 Z";

export function EmiliaAnimada({ alto = 160, caminando = false, expresion = "feliz" }: { alto?: number; caminando?: boolean; expresion?: Expresion }) {
  const sh = useSombreado();
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
    <Animated.View style={{ position: "absolute", left: (cx - 7 - ox) * s, top: (47 - 7 - oy) * s, width: 14 * s, height: 14 * s, transform: [{ scaleY: ojosCerrados ? 1 : (ojo as never) }] }}>
      <Svg width={14 * s} height={14 * s} viewBox={`${cx - 7} 40 14 14`}>
        {ojosCerrados ? (
          <Path d={`M${cx - 4.2} 48 Q${cx} 42.5 ${cx + 4.2} 48`} stroke="#4E2C1E" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        ) : (
          <>
            {ojoTierno(cx + mirar.dx, 47 + mirar.dy, expresion === "sorprendida" ? 5.2 : 4.7)}
            <Path d={cx < 50 ? `M${cx - 4.2} 43.2 Q${cx - 5.6} 42.4 ${cx - 6.2} 41.2` : `M${cx + 4.2} 43.2 Q${cx + 5.6} 42.4 ${cx + 6.2} 41.2`} stroke="#4E2C1E" strokeWidth="0.9" strokeLinecap="round" fill="none" />
          </>
        )}
      </Svg>
    </Animated.View>
  );

  return (
    <Animated.View style={{ width: 100 * s, height: 160 * s, transformOrigin: "bottom", transform: [{ translateY: bote as never }, { scaleY: calma.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.022, 1] }) as never }, { scaleX: calma.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.99, 1] }) as never }] }} pointerEvents="none">
      {/* Piernas (giran desde la cadera) */}
      <Pieza s={s} px={42} py={122} w={44} h={66} rot={piernaIzq}>
        <Pierna x={38} />
      </Pieza>
      <Pieza s={s} px={58} py={122} w={44} h={66} rot={piernaDer}>
        <Pierna x={54} />
      </Pieza>
      {/* Vestido */}
      <Svg width={100 * s} height={160 * s} viewBox="0 0 100 160" style={{ position: "absolute" }}>
        <Sombreado suf={sh.suf} />
        <Path d="M35 72 Q50 69 65 72 L79 124 Q50 131 21 124 Z" fill={VESTIDO} />
        <Path d="M35 72 Q50 69 65 72 L79 124 Q50 131 21 124 Z" fill={sh.volL} {...CONTORNO} />
        {/* Pliegues de la falda */}
        {[[38, 96, 32, 124], [50, 98, 50, 127], [62, 96, 68, 124]].map(([a, b, c, d]) => <Path key={a} d={`M${a} ${b} Q${(a! + c!) / 2 + 2} ${(b! + d!) / 2} ${c} ${d}`} stroke="#E6A800" strokeWidth="1.3" fill="none" opacity="0.6" />)}
        <Path d="M21 124 Q50 131 79 124" stroke="#F9A825" strokeWidth="3.5" fill="none" />
        <Path d="M22 121 Q50 128 78 121" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.6" strokeDasharray="2 3" />
        {/* Sombra del cuello y cuello blanco */}
        <Ellipse cx="50" cy="72" rx="10" ry="3.5" fill="#000" opacity="0.18" />
        <Path d="M40 72 Q44 80 50 74 Q56 80 60 72 Q50 75 40 72 Z" fill="#fff" {...CONTORNO} />
        <Circle cx="50" cy="96" r="5" fill="#fff" {...CONTORNO} />
        <Circle cx="48.5" cy="94.5" r="1.6" fill="#FFF59D" />
      </Svg>
      {/* Brazos (giran desde el hombro) */}
      <Pieza s={s} px={36} py={78} w={80} h={80} rot={brazoIzq}>
        <Brazo hombro={[36, 78]} codo={[24, 92]} mano={[25, 108]} piel={PIEL_BRAZO} manga={VESTIDO} />
      </Pieza>
      <Pieza s={s} px={64} py={78} w={80} h={80} rot={brazoDer}>
        <Brazo hombro={[64, 78]} codo={[76, 92]} mano={[75, 108]} piel={PIEL_BRAZO} manga={VESTIDO} />
      </Pieza>
      {/* Cabeza (gira desde el cuello) con colitas, cara y ojos */}
      <Animated.View style={{ position: "absolute", left: ox * s, top: oy * s, width: C.w * s, height: C.h * s, transform: [{ rotate: inclinacion as never }] }}>
        <Pieza s={s} px={26} py={34} w={50} h={50} rot={colitaIzq}>
          <Sombreado suf={sh.suf} />
          <Path d="M24 32 Q12 26 8 36 Q4 46 12 50 Q8 56 16 56 Q24 54 22 46 Q28 40 24 32 Z" fill={PELO} />
          <Path d="M24 32 Q12 26 8 36 Q4 46 12 50 Q8 56 16 56 Q24 54 22 46 Q28 40 24 32 Z" fill={sh.vol} {...CONTORNO} />
          <Path d="M12 38 Q14 34 19 34 M11 46 Q14 44 17 45" stroke="#A1887F" strokeWidth="1.3" fill="none" opacity="0.6" strokeLinecap="round" />
        </Pieza>
        <Pieza s={s} px={74} py={34} w={50} h={50} rot={colitaDer}>
          <Sombreado suf={sh.suf} />
          <Path d="M76 32 Q88 26 92 36 Q96 46 88 50 Q92 56 84 56 Q76 54 78 46 Q72 40 76 32 Z" fill={PELO} />
          <Path d="M76 32 Q88 26 92 36 Q96 46 88 50 Q92 56 84 56 Q76 54 78 46 Q72 40 76 32 Z" fill={sh.vol} {...CONTORNO} />
          <Path d="M81 34 Q86 34 88 38 M83 45 Q86 44 89 46" stroke="#A1887F" strokeWidth="1.3" fill="none" opacity="0.6" strokeLinecap="round" />
        </Pieza>
        <View style={{ position: "absolute", left: (0 - ox) * s, top: (0 - oy) * s }}>
          <Svg width={100 * s} height={80 * s} viewBox="0 0 100 80">
            <Sombreado suf={sh.suf} />
            {/* Orejas */}
            <Ellipse cx="23.5" cy="48" rx="4" ry="5.5" fill={PIEL} {...CONTORNO} />
            <Ellipse cx="76.5" cy="48" rx="4" ry="5.5" fill={PIEL} {...CONTORNO} />
            <Circle cx="50" cy="44" r="27" fill={PIEL} />
            <Circle cx="50" cy="44" r="27" fill={sh.vol} {...CONTORNO} />
            {/* Sombra del pelo sobre la frente */}
            <Path d={PELO_FLEQUILLO} fill={PELO} />
            <Path d={PELO_FLEQUILLO} fill={sh.volL} {...CONTORNO} />
            {/* Brillo y mechones del pelo */}
            <Path d="M33 22 Q42 16 54 17" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.28" />
            <Path d="M38 31 Q41 26 45 24 M55 24 Q59 26 62 31" stroke="#3E2723" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.35" />
            {[25, 75].map((x) => <G key={x}><Circle cx={x} cy="30" r="4" fill="#E53935" {...CONTORNO} /><Circle cx={x - 1.3} cy="28.7" r="1.3" fill="#fff" opacity="0.7" /></G>)}
            {/* Nariz */}
            <Ellipse cx="50" cy="52" rx="1.6" ry="1.1" fill="#E3A07F" />
            {/* Cejas */}
            {expresion === "sorprendida" ? (
              <G stroke={PELO} strokeWidth="2" strokeLinecap="round" fill="none"><Path d="M35 36 Q40 32 45 35" /><Path d="M55 35 Q60 32 65 36" /></G>
            ) : expresion === "pensativa" ? (
              <G stroke={PELO} strokeWidth="2" strokeLinecap="round" fill="none"><Path d="M35 39 Q40 38 45 39" /><Path d="M55 37 Q60 34 65 36" /></G>
            ) : (
              <G stroke="#7B5141" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.7"><Path d="M36 38.5 Q40 37 44 38.5" /><Path d="M56 38.5 Q60 37 64 38.5" /></G>
            )}
            <Ellipse cx="32.5" cy="55.5" rx="6" ry="4.2" fill="#FF8A80" opacity={expresion === "celebrando" ? 0.55 : 0.38} />
            <Ellipse cx="67.5" cy="55.5" rx="6" ry="4.2" fill="#FF8A80" opacity={expresion === "celebrando" ? 0.55 : 0.38} />
            {/* Boca según la expresión */}
            {expresion === "celebrando" ? (
              <G><Path d="M40 55 Q50 71 60 55 Z" fill="#7B1F3A" /><Path d="M44 63 Q50 67 56 63 Q50 60 44 63 Z" fill="#F06292" /></G>
            ) : expresion === "sorprendida" ? (
              <Ellipse cx="50" cy="59" rx="3.6" ry="4.6" fill="#7B1F3A" />
            ) : expresion === "pensativa" ? (
              <Path d="M44 59 Q49 57.5 56 60" stroke="#3B2F5C" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            ) : (
              <G><Path d="M42.5 57 Q50 66 57.5 57 Q50 59.5 42.5 57 Z" fill="#8E3B46" /><Ellipse cx="50" cy="61.6" rx="3.4" ry="1.7" fill="#F48FB1" /></G>
            )}
          </Svg>
        </View>
        <Ojo cx={40} />
        <Ojo cx={60} />
      </Animated.View>
    </Animated.View>
  );
}

/** Pierna de Emilia con volumen, calcetín y zapato con brillo. */
function Pierna({ x }: { x: number }) {
  const sh = useSombreado();
  return (
    <G>
      <Sombreado suf={sh.suf} />
      <Rect x={x} y="120" width="8" height="26" rx="4" fill={PIEL_BRAZO} />
      <Rect x={x} y="120" width="8" height="26" rx="4" fill={sh.volL} />
      <Rect x={x - 0.5} y="138" width="9" height="6" rx="2" fill="#fff" {...CONTORNO} />
      <Ellipse cx={x + 3} cy="148" rx="9" ry="5" fill="#E53935" />
      <Ellipse cx={x + 3} cy="148" rx="9" ry="5" fill={sh.vol} {...CONTORNO} />
      <Path d={`M${x - 2} 145.5 Q${x + 2} 143.5 ${x + 6} 145`} stroke="#fff" strokeWidth="1.3" fill="none" opacity="0.6" strokeLinecap="round" />
      <Path d={`M${x - 3} 146 H${x + 9}`} stroke="#B71C1C" strokeWidth="1.2" opacity="0.6" />
    </G>
  );
}

/** Brazo con manga abullonada, sombra y luz (gira junto con la manga). */
function Brazo({ hombro, codo, mano, piel, manga }: { hombro: [number, number]; codo: [number, number]; mano: [number, number]; piel: string; manga: string }) {
  const sh = useSombreado();
  const d = `M${hombro[0]} ${hombro[1]} Q${codo[0]} ${codo[1]} ${mano[0]} ${mano[1]}`;
  const lado = codo[0] < hombro[0] ? -1 : 1;
  return (
    <G>
      <Sombreado suf={sh.suf} />
      <Path d={d} stroke="#6D3B1F" strokeOpacity="0.08" strokeWidth="8.6" strokeLinecap="round" fill="none" />
      <Path d={d} stroke={piel} strokeWidth="7.4" strokeLinecap="round" fill="none" />
      <Path d={`M${hombro[0] - lado * 1.5} ${hombro[1] + 2} Q${codo[0] - lado * 2} ${codo[1]} ${mano[0] - lado * 2} ${mano[1] - 2}`} stroke="#fff" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Circle cx={mano[0]} cy={mano[1] + 2} r="5" fill={piel} {...CONTORNO} />
      <Circle cx={mano[0] - 1.3} cy={mano[1] + 0.6} r="1.8" fill="#fff" opacity="0.3" />
      {/* Manga */}
      {/* Manga corta que sigue la dirección del brazo (no una bola) */}
      <G transform={`rotate(${(Math.atan2(codo[0] - hombro[0], codo[1] - hombro[1]) * -180 * 0.6) / Math.PI} ${hombro[0]} ${hombro[1]})`}>
        <Path d={`M${hombro[0] - 6} ${hombro[1] - 3} Q${hombro[0]} ${hombro[1] - 6} ${hombro[0] + 6} ${hombro[1] - 3} Q${hombro[0] + 9} ${hombro[1] + 3} ${hombro[0] + 6.5} ${hombro[1] + 8} Q${hombro[0]} ${hombro[1] + 11.5} ${hombro[0] - 6.5} ${hombro[1] + 8} Q${hombro[0] - 9} ${hombro[1] + 3} ${hombro[0] - 6} ${hombro[1] - 3} Z`} fill={manga} />
        <Path d={`M${hombro[0] - 6} ${hombro[1] - 3} Q${hombro[0]} ${hombro[1] - 6} ${hombro[0] + 6} ${hombro[1] - 3} Q${hombro[0] + 9} ${hombro[1] + 3} ${hombro[0] + 6.5} ${hombro[1] + 8} Q${hombro[0]} ${hombro[1] + 11.5} ${hombro[0] - 6.5} ${hombro[1] + 8} Q${hombro[0] - 9} ${hombro[1] + 3} ${hombro[0] - 6} ${hombro[1] - 3} Z`} fill={sh.volL} {...CONTORNO} />
        <Path d={`M${hombro[0] - 6} ${hombro[1] + 7} Q${hombro[0]} ${hombro[1] + 10} ${hombro[0] + 6} ${hombro[1] + 7}`} stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2" fill="none" />
      </G>
    </G>
  );
}

// ---------- Tito, el pudú ----------

export function TitoAnimado({ alto = 70, caminando = false, contento = false }: { alto?: number; caminando?: boolean; contento?: boolean }) {
  const sh = useSombreado();
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
      <Pieza s={s} px={45} py={54} w={30} h={50} rot={pata(Math.PI)}><Pata x={42} color="#5D4037" /></Pieza>
      <Pieza s={s} px={63} py={54} w={30} h={50} rot={pata(0)}><Pata x={60} color="#5D4037" /></Pieza>
      {/* Cola (se mueve feliz) */}
      <Pieza s={s} px={80} py={42} w={24} h={24} rot={cola}><Sombreado suf={sh.suf} /><Circle cx="84" cy="38" r="5.5" fill="#8D5524" /><Circle cx="84" cy="38" r="5.5" fill={sh.vol} {...CONTORNO} /><Circle cx="86" cy="40" r="2.2" fill="#F5E6D3" opacity="0.8" /></Pieza>
      {/* Cuerpo */}
      <Svg width={100 * s} height={80 * s} viewBox="0 0 100 80" style={{ position: "absolute" }}>
        <Sombreado suf={sh.suf} />
        <Ellipse cx="54" cy="46" rx="28" ry="16" fill="#A1673F" />
        <Ellipse cx="56" cy="53" rx="20" ry="7" fill="#D9AE85" opacity="0.6" />
        <Ellipse cx="54" cy="46" rx="28" ry="16" fill={sh.vol} {...CONTORNO} />
        {[[44, 40], [52, 37], [60, 39], [68, 42], [48, 45], [64, 46]].map(([x, y]) => <Circle key={`${x}${y}`} cx={x} cy={y} r="1.7" fill="#F0DCC2" opacity="0.75" />)}
        <Path d="M34 40 Q44 32 62 33" stroke="#fff" strokeWidth="2" strokeOpacity="0.22" fill="none" strokeLinecap="round" />
      </Svg>
      {/* Patas de adelante */}
      <Pieza s={s} px={33} py={52} w={30} h={50} rot={pata(0)}><Pata x={30} color="#6D4C41" largo={24} /></Pieza>
      <Pieza s={s} px={73} py={52} w={30} h={50} rot={pata(Math.PI)}><Pata x={70} color="#6D4C41" largo={24} /></Pieza>
      {/* Cabeza (gira desde el cuello) */}
      <Animated.View style={{ position: "absolute", left: ox * s, top: oy * s, width: C.w * s, height: C.h * s, transform: [{ rotate: cabeza as never }] }}>
        <View style={{ position: "absolute", left: (0 - ox) * s, top: (0 - oy) * s }}>
          <Svg width={60 * s} height={60 * s} viewBox="0 0 60 60">
            <Sombreado suf={sh.suf} />
            <Ellipse cx="30" cy="14" rx="5" ry="9" fill="#8D5524" transform="rotate(20 30 14)" {...CONTORNO} />
            <Ellipse cx="20" cy="15" rx="5" ry="9" fill="#7A4720" transform="rotate(-20 20 15)" {...CONTORNO} />
            <Ellipse cx="30" cy="15" rx="2.2" ry="5" fill="#E8B996" transform="rotate(20 30 15)" />
            <Path d="M24 16 L23 6 M28 16 L30 7" stroke="#4E342E" strokeWidth="2.6" strokeLinecap="round" />
            <Path d="M23.5 13 L22.8 8 M28.4 13 L29.6 9" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.9" strokeLinecap="round" />
            <Ellipse cx="26" cy="30" rx="15" ry="13" fill="#A1673F" />
            <Ellipse cx="26" cy="30" rx="15" ry="13" fill={sh.vol} {...CONTORNO} />
            <Ellipse cx="14" cy="34" rx="8" ry="6" fill="#D2A07A" />
            <Ellipse cx="14" cy="34" rx="8" ry="6" fill={sh.vol} />
            <Circle cx="8" cy="33" r="3.2" fill="#3E2723" />
            <Circle cx="7" cy="32" r="1" fill="#fff" opacity="0.7" />
            <Path d="M11 38 Q14 40 17 38" stroke="#5D4037" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </Svg>
        </View>
        <Animated.View style={{ position: "absolute", left: (24 - 5 - ox) * s, top: (28 - 5 - oy) * s, width: 10 * s, height: 10 * s, transform: [{ scaleY: ojo as never }] }}>
          <Svg width={10 * s} height={10 * s} viewBox="19 23 10 10">
            {ojoTierno(24, 28, 4.1)}
          </Svg>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

/** Pata de Tito con volumen y pezuña oscura. */
function Pata({ x, color, largo = 22 }: { x: number; color: string; largo?: number }) {
  const sh = useSombreado();
  const y = 74 - largo + (largo === 22 ? 0 : 0);
  return (
    <G>
      <Sombreado suf={sh.suf} />
      <Rect x={x} y={y} width="6" height={largo} rx="3" fill={color} />
      <Rect x={x} y={y} width="6" height={largo} rx="3" fill={sh.volL} />
      <Rect x={x - 0.4} y={y + largo - 4} width="6.8" height="4.5" rx="1.6" fill="#2B1F1A" />
    </G>
  );
}
