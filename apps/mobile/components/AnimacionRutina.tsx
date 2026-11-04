import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { useJuego } from "../lib/juego";

/**
 * Animaciones que muestran cómo se hace cada paso de la rutina, para que el
 * niño lo imite: manos dibujadas con su color de piel que se frotan de verdad,
 * agua, jabón y espuma; y la cara de Emilia en el espejo con el cepillo haciendo
 * circulitos. En los dos, los "bichitos" se van achicando y desaparecen
 * mientras el niño frota o cepilla: así ve que lo está haciendo bien.
 *
 * `progreso` va de 0 a 1 dentro del paso actual (para borrar bichitos de a poco).
 */
export function AnimacionRutina({ rutina, paso, progreso = 0, escala = 1.45 }: { rutina: "manos" | "dientes"; paso: number | null; progreso?: number; escala?: number }) {
  const avance = useAvance(progreso);
  return (
    <View style={{ width: 300 * escala, height: 260 * escala, alignItems: "center", justifyContent: "center" }}>
      <View style={{ transform: [{ scale: escala }] }}>
        {rutina === "manos" ? <Manos paso={paso} avance={avance} /> : <Dientes paso={paso} avance={avance} />}
      </View>
    </View>
  );
}

// ---------- Utilidades de animación ----------

/** El progreso del paso, suavizado (avanza parejo entre segundo y segundo). */
function useAvance(progreso: number) {
  const v = useRef(new Animated.Value(progreso)).current;
  const anterior = useRef(progreso);
  useEffect(() => {
    // Paso nuevo: parte de cero de inmediato (sin "devolver" los bichitos de a poco).
    if (progreso < anterior.current) v.setValue(0);
    anterior.current = progreso;
    if (progreso <= 0.001) {
      v.setValue(0);
      return;
    }
    const a = Animated.timing(v, { toValue: progreso, duration: 950, easing: Easing.linear, useNativeDriver: false });
    a.start();
    return () => a.stop();
  }, [progreso, v]);
  return v;
}

/** Un valor que da vueltas de 0 a 1 sin parar (para movimientos circulares y de vaivén). */
function useCiclo(ms: number, activo = true) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!activo) return;
    v.setValue(0);
    const bucle = Animated.loop(Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.linear, useNativeDriver: false }));
    bucle.start();
    return () => bucle.stop();
  }, [ms, activo, v]);
  return v;
}

const PUNTOS = Array.from({ length: 17 }, (_, i) => i / 16);
/** Seno/coseno de un ciclo, como movimiento de -amp a amp (circulitos y vaivenes suaves). */
const seno = (c: Animated.Value, amp: number, fase = 0) =>
  c.interpolate({ inputRange: PUNTOS, outputRange: PUNTOS.map((t) => amp * Math.sin(2 * Math.PI * t + fase)) });
const coseno = (c: Animated.Value, amp: number) => seno(c, amp, Math.PI / 2);

/** Un bichito verde con carita que se mueve. */
function Bichito({ tam = 26, color = "#7CB342" }: { tam?: number; color?: string }) {
  return (
    <Svg width={tam} height={tam} viewBox="0 0 40 40">
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <Circle key={a} cx={20 + 15 * Math.cos((a * Math.PI) / 180)} cy={20 + 15 * Math.sin((a * Math.PI) / 180)} r="4" fill={color} />
      ))}
      <Circle cx="20" cy="20" r="14" fill={color} />
      <Circle cx="15" cy="17" r="4" fill="#fff" />
      <Circle cx="25" cy="17" r="4" fill="#fff" />
      <Circle cx="15.8" cy="17.6" r="2" fill="#263238" />
      <Circle cx="25.8" cy="17.6" r="2" fill="#263238" />
      <Path d="M14 25 Q20 29 26 25" stroke="#263238" strokeWidth="2" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** Destellos de limpio que titilan. */
function Destello({ x, y, tam, ciclo, fase }: { x: number; y: number; tam: number; ciclo: Animated.Value; fase: number }) {
  const s = ciclo.interpolate({ inputRange: PUNTOS, outputRange: PUNTOS.map((t) => 0.5 + 0.5 * Math.abs(Math.sin(2 * Math.PI * t + fase))) });
  return (
    <Animated.View style={{ position: "absolute", left: x - tam / 2, top: y - tam / 2, transform: [{ scale: s }] }} pointerEvents="none">
      <Svg width={tam} height={tam} viewBox="0 0 20 20">
        <Path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="#FFF59D" stroke="#FBC02D" strokeWidth="1" />
      </Svg>
    </Animated.View>
  );
}

/** Burbujas de espuma (un grupo de círculos blancos). */
function Espuma({ ancho = 70, alto = 34 }: { ancho?: number; alto?: number }) {
  const b: Array<[number, number, number]> = [[0.2, 0.6, 0.22], [0.42, 0.4, 0.28], [0.65, 0.55, 0.24], [0.85, 0.65, 0.16], [0.35, 0.8, 0.18], [0.55, 0.85, 0.2]];
  return (
    <Svg width={ancho} height={alto} viewBox="0 0 100 50">
      {b.map(([x, y, r], i) => (
        <Circle key={i} cx={x * 100} cy={y * 50} r={r * 50} fill="#fff" stroke="#B3E5FC" strokeWidth="2" />
      ))}
    </Svg>
  );
}

// ---------- Lavado de manos ----------
// Pasos: 0 mojar, 1 jabón, 2 palmas, 3 dorso, 4 entre los dedos, 5 uñas, 6 enjuagar, 7 secar.

/** Una mano abierta vista de frente (palma), con el color de piel del niño. */
function ManoDibujo({ piel, espejo = false, tam = 96 }: { piel: string; espejo?: boolean; tam?: number }) {
  return (
    <Svg width={tam} height={tam * 1.2} viewBox="0 0 100 120" style={espejo ? { transform: [{ scaleX: -1 }] } : undefined}>
      {/* Dedos */}
      {[22, 40, 58, 74].map((x, i) => (
        <Rect key={x} x={x - 7} y={[18, 8, 12, 24][i]} width="15" height={[52, 60, 56, 44][i]} rx="7.5" fill={piel} stroke="#00000022" strokeWidth="1.5" />
      ))}
      {/* Pulgar */}
      <Rect x="70" y="62" width="15" height="40" rx="7.5" fill={piel} stroke="#00000022" strokeWidth="1.5" transform="rotate(-48 78 82)" />
      {/* Palma y muñeca */}
      <Rect x="14" y="52" width="68" height="52" rx="22" fill={piel} stroke="#00000022" strokeWidth="1.5" />
      <Rect x="28" y="96" width="40" height="24" rx="8" fill={piel} />
      <Path d="M30 78 Q48 86 66 74" stroke="#00000018" strokeWidth="2.5" fill="none" />
    </Svg>
  );
}

function Manos({ paso, avance }: { paso: number | null; avance: Animated.Value }) {
  const { perfil } = useJuego();
  const piel = perfil?.apariencia.piel ?? "#F1C7A5";
  const p = paso ?? -1;
  const frotando = p >= 2 && p <= 5;
  const ciclo = useCiclo(p === 5 ? 520 : 760);
  const agua = useCiclo(420, p === 0 || p === 6);
  const lento = useCiclo(2200);

  // Movimiento de cada mano según el paso (circulitos, vaivenes, palmaditas).
  let izq: object[] = [];
  let der: object[] = [];
  if (p === 0 || p === 6) {
    izq = [{ translateY: seno(ciclo, 6) }];
    der = [{ translateY: seno(ciclo, 6, Math.PI) }];
  } else if (p === 2) {
    // Palma con palma, en círculos
    izq = [{ translateX: seno(ciclo, 12) }, { translateY: coseno(ciclo, 8) }];
    der = [{ translateX: seno(ciclo, -12) }, { translateY: coseno(ciclo, -8) }];
  } else if (p === 3) {
    // Una mano sobre el dorso de la otra
    der = [{ translateX: seno(ciclo, 22) }, { rotate: "-10deg" }];
  } else if (p === 4) {
    // Dedos entrelazados, arriba y abajo
    izq = [{ translateY: seno(ciclo, 10) }];
    der = [{ translateY: seno(ciclo, -10) }];
  } else if (p === 5) {
    // Puntas de los dedos en circulitos sobre la palma
    der = [{ translateX: seno(ciclo, 8) }, { translateY: coseno(ciclo, 8) }, { rotate: "35deg" }];
  } else if (p === 7) {
    izq = [{ translateY: seno(lento, 3) }];
    der = [{ translateY: seno(lento, 3, Math.PI) }];
  }

  // Posición base: separadas al mojar/secar, juntas al frotar.
  const juntas = frotando;
  const posIzq = { left: juntas ? 62 : 40, top: p === 0 || p === 6 ? 92 : 100 };
  const posDer = { left: juntas ? (p === 3 ? 90 : 130) : 166, top: p === 3 ? 82 : p === 0 || p === 6 ? 92 : 100 };

  // Bichitos: se achican mientras se frota (pasos 2 a 5) y desaparecen al enjuagar.
  const limpieza = frotando ? Animated.add(avance, p - 2).interpolate({ inputRange: [0, 4], outputRange: [1, 0], extrapolate: "clamp" }) : p < 2 ? 1 : 0;
  // Espuma: aparece con el jabón, crece al frotar y se va por el desagüe al enjuagar.
  const espuma = p === 1 ? avance : frotando ? Animated.add(avance, p - 2).interpolate({ inputRange: [0, 4], outputRange: [0.6, 1.25] }) : p === 6 ? avance.interpolate({ inputRange: [0, 1], outputRange: [1.1, 0] }) : 0;
  const espumaBaja = p === 6 ? avance.interpolate({ inputRange: [0, 1], outputRange: [0, 110] }) : 0;

  return (
    <View style={estilos.escena}>
      {/* Pared de azulejos, lavamanos y llave */}
      <Svg width={300} height={260} viewBox="0 0 300 260" style={StyleSheet.absoluteFill}>
        {Array.from({ length: 6 }, (_, f) => Array.from({ length: 8 }, (_, c) => (
          <Rect key={`${f}-${c}`} x={c * 38} y={f * 34} width="36" height="32" rx="3" fill={(f + c) % 2 ? "#E1F5FE" : "#F1F8FE"} />
        )))}
        <Rect x="122" y="4" width="56" height="16" rx="8" fill="#B0BEC5" />
        <Path d="M150 18 v14 h34 q10 0 10 10 v8 h-16 v-6 h-28 z" fill="#90A4AE" />
        {/* Dispensador de jabón */}
        <Rect x="18" y="30" width="34" height="50" rx="8" fill="#F48FB1" stroke="#EC407A" strokeWidth="3" />
        <Rect x="28" y={p === 1 ? 22 : 16} width="14" height="14" rx="3" fill="#EC407A" />
        <Rect x="40" y={p === 1 ? 24 : 18} width="18" height="6" rx="3" fill="#EC407A" />
        {/* Lavamanos */}
        <Path d="M10 214 Q150 290 290 214 Z" fill="#E3F2FD" stroke="#90CAF9" strokeWidth="4" />
        <Ellipse cx="150" cy="218" rx="138" ry="16" fill="#F5FBFF" stroke="#90CAF9" strokeWidth="4" />
        <Ellipse cx="150" cy="224" rx="12" ry="4" fill="#90A4AE" />
      </Svg>

      {/* Chorro de agua (ondula) */}
      {(p === 0 || p === 6) && (
        <Animated.View style={[estilos.chorro, { transform: [{ scaleX: agua.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.25, 1] }) }] }]}>
          <View style={estilos.chorroBrillo} />
        </Animated.View>
      )}
      {/* Gota de jabón que cae a la mano */}
      {p === 1 && (
        <Animated.View style={[estilos.gotaJabon, { transform: [{ translateY: avance.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 64, 64] }) }], opacity: avance.interpolate({ inputRange: [0, 0.65, 0.8], outputRange: [1, 1, 0] }) }]} />
      )}

      {/* Las manos */}
      <Animated.View style={[estilos.absoluto, posIzq, { transform: izq as never }]}>
        <ManoDibujo piel={piel} />
      </Animated.View>
      <Animated.View style={[estilos.absoluto, posDer, { transform: der as never }]}>
        <ManoDibujo piel={piel} espejo />
      </Animated.View>

      {/* Espuma sobre las manos */}
      {p >= 1 && p <= 6 && (
        <Animated.View style={[estilos.absoluto, { left: 92, top: 132, transform: [{ scale: espuma as never }, { translateY: espumaBaja as never }] }]} pointerEvents="none">
          <Espuma ancho={120} alto={56} />
        </Animated.View>
      )}

      {/* Bichitos que se van con el jabón */}
      {p <= 5 &&
        ([[78, 120, 0], [190, 112, 1.3], [118, 168, 2.1], [168, 160, 0.7], [150, 100, 2.8]] as const).map(([x, y, f], i) => (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={[estilos.absoluto, {
              left: x - 13, top: y - 13,
              opacity: limpieza as never,
              transform: [{ scale: limpieza as never }, { translateX: seno(lento, 4, f) }, { translateY: coseno(lento, 3) }],
            }]}
          >
            <Bichito tam={26} color={i % 2 ? "#8BC34A" : "#AED581"} />
          </Animated.View>
        ))}

      {/* Toalla y brillo de manos limpias */}
      {p === 7 && (
        <>
          <Animated.View style={[estilos.toalla, { transform: [{ translateX: seno(ciclo, 50) }, { rotate: "-6deg" }] }]}>
            {[0, 1, 2].map((i) => <View key={i} style={[estilos.rayaToalla, { top: 12 + i * 16 }]} />)}
          </Animated.View>
          {[[60, 90, 0], [230, 96, 1], [150, 70, 2], [110, 200, 3], [200, 190, 4]].map(([x, y, f]) => (
            <Destello key={f} x={x!} y={y!} tam={22} ciclo={lento} fase={f!} />
          ))}
        </>
      )}
    </View>
  );
}

// ---------- Cepillado de dientes ----------
// Pasos: 0 arriba, 1 abajo, 2 adelante, 3 muelas, 4 lengua.

/** Qué dientes cepilla cada paso (8 arriba: 0-7, 8 abajo: 8-15). */
const ZONA_DIENTES: number[][] = [
  [0, 1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14, 15],
  [2, 3, 4, 5, 10, 11, 12, 13],
  [0, 1, 6, 7, 8, 9, 14, 15],
  [],
];
/** Dónde va el cepillo y cómo se mueve en cada paso. */
const CEPILLO = [
  { x: 150, y: 120, ancho: 70, rot: "0deg" },
  { x: 150, y: 172, ancho: 70, rot: "180deg" },
  { x: 150, y: 146, ancho: 22, rot: "0deg" },
  { x: 96, y: 140, ancho: 12, rot: "0deg" },
  { x: 150, y: 196, ancho: 16, rot: "0deg" },
];
const dienteX = (i: number) => 70 + (i % 8) * 20;

function Dientes({ paso, avance }: { paso: number | null; avance: Animated.Value }) {
  const p = paso ?? -1;
  const ciclo = useCiclo(420);
  const lento = useCiclo(2400);
  const parpadeo = useParpadeo();
  const zona = p >= 0 ? ZONA_DIENTES[p]! : [];
  const hechos = new Set(ZONA_DIENTES.slice(0, Math.max(0, p)).flat());
  const c = CEPILLO[Math.max(0, p)]!;
  // Circulitos: un poco a cada lado (ancho de la zona) y un poco arriba y abajo.
  const mx = Animated.add(seno(lento, c.ancho / 2), seno(ciclo, 6));
  const my = coseno(ciclo, 6);
  const manchas = avance.interpolate({ inputRange: [0, 0.9], outputRange: [1, 0], extrapolate: "clamp" });

  return (
    <View style={estilos.escena}>
      <Svg width={300} height={260} viewBox="0 0 300 260" style={StyleSheet.absoluteFill}>
        {/* Marco del espejo */}
        <Rect x="4" y="4" width="292" height="252" rx="40" fill="#E1F5FE" stroke="#81D4FA" strokeWidth="6" />
        {/* Colitas y pelo de Emilia */}
        <Circle cx="44" cy="76" r="30" fill="#5D4037" />
        <Circle cx="256" cy="76" r="30" fill="#5D4037" />
        <Circle cx="62" cy="58" r="8" fill="#E53935" />
        <Circle cx="238" cy="58" r="8" fill="#E53935" />
        {/* Cara */}
        <Ellipse cx="150" cy="140" rx="110" ry="112" fill="#F6D3B3" />
        <Path d="M42 110 Q50 26 150 24 Q250 26 258 110 Q226 60 150 64 Q74 60 42 110 Z" fill="#5D4037" />
        <Circle cx="70" cy="150" r="14" fill="#F48FB1" opacity="0.55" />
        <Circle cx="230" cy="150" r="14" fill="#F48FB1" opacity="0.55" />
        {/* Boca muy abierta */}
        <Ellipse cx="150" cy="160" rx="92" ry="66" fill="#E57373" />
        <Ellipse cx="150" cy="160" rx="82" ry="56" fill="#7B1F3A" />
        {/* Lengua (sale en el paso de la lengua) */}
        <Ellipse cx="150" cy={p === 4 ? 206 : 192} rx={p === 4 ? 44 : 50} ry={p === 4 ? 32 : 20} fill="#F06292" />
        <Path d={`M150 ${p === 4 ? 186 : 180} v${p === 4 ? 30 : 14}`} stroke="#D81B60" strokeWidth="2.5" />
        {/* Dientes: los de la zona que se cepilla se marcan; los ya cepillados quedan blancos y brillantes */}
        {Array.from({ length: 16 }, (_, i) => {
          const arriba = i < 8;
          const enZona = zona.includes(i);
          const lado = i % 8 === 0 || i % 8 === 7;
          return (
            <Rect
              key={i}
              x={dienteX(i)}
              y={arriba ? (lado ? 112 : 106) : 186 - (lado ? 18 : 24)}
              width="18"
              height={lado ? 18 : 24}
              rx="5"
              fill="#fff"
              stroke={enZona ? "#29B6F6" : hechos.has(i) ? "#C5E1A5" : "#E0E0E0"}
              strokeWidth={enZona ? 3 : 2}
            />
          );
        })}
      </Svg>

      {/* Ojos que pestañean (por encima de la boca) */}
      {[112, 188].map((x) => (
        <Animated.View key={x} style={[estilos.ojo, { left: x - 9, transform: [{ scaleY: parpadeo }] }]}>
          <View style={estilos.brilloOjo} />
        </Animated.View>
      ))}

      {/* Manchitas y bichitos en los dientes de la zona: se borran al cepillar */}
      {zona.map((i, k) => (
        <Animated.View
          key={`m${i}`}
          pointerEvents="none"
          style={[estilos.absoluto, { left: dienteX(i) + 1, top: i < 8 ? 112 : 166, opacity: manchas as never, transform: [{ scale: manchas as never }] }]}
        >
          {k % 3 === 0 ? <Bichito tam={16} color="#C0CA33" /> : <View style={estilos.mancha} />}
        </Animated.View>
      ))}
      {p === 4 &&
        [130, 170].map((x, k) => (
          <Animated.View key={x} pointerEvents="none" style={[estilos.absoluto, { left: x - 8, top: 196 + k * 4, opacity: manchas as never, transform: [{ scale: manchas as never }] }]}>
            <Bichito tam={16} color="#C0CA33" />
          </Animated.View>
        ))}

      {/* Brillos en los dientes ya limpios */}
      {[...hechos].filter((i) => i % 3 === 1).map((i) => (
        <Destello key={`d${i}`} x={dienteX(i) + 9} y={i < 8 ? 112 : 176} tam={14} ciclo={lento} fase={i} />
      ))}

      {/* Espuma en las comisuras, crece mientras se cepilla */}
      {p >= 0 &&
        [56, 222].map((x) => (
          <Animated.View key={x} pointerEvents="none" style={[estilos.absoluto, { left: x, top: 150, transform: [{ scale: avance.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.1] }) as never }] }]}>
            <Espuma ancho={30} alto={18} />
          </Animated.View>
        ))}

      {/* El cepillo con pasta, haciendo circulitos */}
      {p >= 0 && (
        <Animated.View
          pointerEvents="none"
          style={[estilos.absoluto, { left: c.x - 70, top: c.y - 20, transform: [{ translateX: mx as never }, { translateY: my as never }, { rotate: c.rot }] }]}
        >
          <Cepillo />
        </Animated.View>
      )}
    </View>
  );
}

/** Cepillo de dientes de costado: cabezal con cerdas y pasta a la izquierda, mango hacia la derecha. */
function Cepillo() {
  return (
    <Svg width={170} height={44} viewBox="0 0 170 44">
      <Rect x="30" y="20" width="136" height="14" rx="7" fill="#26C6DA" stroke="#00838F" strokeWidth="2" />
      <Rect x="4" y="18" width="40" height="16" rx="6" fill="#26C6DA" stroke="#00838F" strokeWidth="2" />
      {Array.from({ length: 7 }, (_, i) => (
        <Rect key={i} x={7 + i * 5} y="4" width="3.5" height="15" rx="1.5" fill="#fff" stroke="#B0BEC5" strokeWidth="0.8" />
      ))}
      <Path d="M6 6 Q14 -2 22 5 Q30 -2 40 6 Q34 10 22 9 Q12 10 6 6 Z" fill="#E1F5FE" stroke="#4FC3F7" strokeWidth="1.5" />
    </Svg>
  );
}

/** Pestañeo cada unos segundos. */
function useParpadeo() {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const bucle = Animated.loop(
      Animated.sequence([
        Animated.delay(2600),
        Animated.timing(v, { toValue: 0.1, duration: 90, useNativeDriver: false }),
        Animated.timing(v, { toValue: 1, duration: 120, useNativeDriver: false }),
      ]),
    );
    bucle.start();
    return () => bucle.stop();
  }, [v]);
  return v;
}

const estilos = StyleSheet.create({
  escena: { width: 300, height: 260, overflow: "hidden", borderRadius: 24 },
  absoluto: { position: "absolute" },
  chorro: { position: "absolute", left: 172, top: 50, width: 14, height: 168, borderRadius: 7, backgroundColor: "rgba(41,182,246,0.75)" },
  chorroBrillo: { position: "absolute", left: 3, top: 0, width: 3, height: 168, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.7)" },
  gotaJabon: { position: "absolute", left: 50, top: 40, width: 12, height: 16, borderRadius: 8, backgroundColor: "#F48FB1" },
  toalla: { position: "absolute", left: 100, top: 112, width: 104, height: 66, borderRadius: 12, backgroundColor: "#FFCC80", borderWidth: 4, borderColor: "#FB8C00", overflow: "hidden" },
  rayaToalla: { position: "absolute", left: 0, right: 0, height: 5, backgroundColor: "#FFB74D" },
  ojo: { position: "absolute", top: 82, width: 18, height: 20, borderRadius: 9, backgroundColor: "#3B2F5C" },
  brilloOjo: { position: "absolute", left: 4, top: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  mancha: { width: 12, height: 9, borderRadius: 5, backgroundColor: "#D4C25A", opacity: 0.85 },
});
