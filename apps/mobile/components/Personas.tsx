import { Animated, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { angulo, CONTORNO, onda, Pieza, Sombreado, useCiclo, useParpadeo } from "./Articulados";

/**
 * Adultos del barrio, articulados como Emilia: Don Pedro (granja y huerto),
 * Doña Rosa (almacén) y el Dr. Lucas (veterinaria). Pestañean, respiran,
 * gesticulan y mueven la boca cuando hablan, y pueden saludar.
 * Lienzo de 100×180 unidades, de frente.
 */
export type AdultoId = "pedro" | "rosa" | "lucas" | "tia" | "artista" | "nina";

interface Estilo {
  piel: string;
  pelo: string;
  camisa: string;
  piernas: string;
  zapatos: string;
  /** Prenda encima (overol, delantal, delantal blanco). */
  encima: (s: number) => React.ReactNode;
  /** Peinado y accesorios de la cabeza (delante de la cara: sombrero, lentes, bigote…). */
  cabeza: React.ReactNode;
  /** Pelo detrás de la cabeza (moño, nuca). */
  peloAtras?: React.ReactNode;
  falda?: boolean;
}

const ESTILOS: Record<AdultoId, Estilo> = {
  // La abuela Nina: pelo blanco crespito, lentes redondos, chaleco coral y delantal de cuadritos.
  nina: {
    piel: "#F5D0B5", pelo: "#F5F5F5", camisa: "#E57373", piernas: "#8D6E63", zapatos: "#6D4C41", falda: true,
    encima: () => (
      <G>
        <Path d="M38 86 L62 86 L66 134 L34 134 Z" fill="#FFF59D" />
        {[0, 1, 2, 3].map((f) => <Path key={`h${f}`} d={`M${35 + f * 0.5} ${96 + f * 10} H${65 - f * 0.5}`} stroke="#FFB300" strokeWidth="1.5" opacity="0.7" />)}
        {[42, 50, 58].map((x) => <Path key={x} d={`M${x} 86 V134`} stroke="#FFB300" strokeWidth="1.5" opacity="0.7" />)}
        <Path d="M38 86 Q50 80 62 86" stroke="#F9A825" strokeWidth="2" fill="none" />
        <Rect x="43" y="112" width="14" height="10" rx="3" fill="#FFCA28" />
        {[[34, 80], [66, 80]].map(([x, y]) => <Circle key={x} cx={x} cy={y} r="2" fill="#fff" />)}
      </G>
    ),
    peloAtras: <G>{[[24, 44], [76, 44], [26, 56], [74, 56]].map(([x, y]) => <Circle key={`${x}${y}`} cx={x} cy={y} r="7" fill="#F5F5F5" />)}</G>,
    cabeza: (
      <G>
        {[26, 34, 42, 50, 58, 66, 74].map((x, i) => <Circle key={x} cx={x} cy={i % 2 ? 18 : 24} r="9" fill="#F5F5F5" stroke="#E0E0E0" strokeWidth="1" />)}
        <Circle cx="40" cy="41" r="7.5" fill="#E3F2FD" fillOpacity="0.35" stroke="#8D6E63" strokeWidth="2" />
        <Circle cx="60" cy="41" r="7.5" fill="#E3F2FD" fillOpacity="0.35" stroke="#8D6E63" strokeWidth="2" />
        <Path d="M47.5 41 L52.5 41" stroke="#8D6E63" strokeWidth="2" />
        <Circle cx="25" cy="52" r="2.4" fill="#fff" stroke="#E0E0E0" strokeWidth="0.8" />
        <Circle cx="75" cy="52" r="2.4" fill="#fff" stroke="#E0E0E0" strokeWidth="0.8" />
      </G>
    ),
  },
  // El profe Tomás del taller de arte: pelo crespo, boina roja y cotona manchada de pintura.
  artista: {
    piel: "#C68B59", pelo: "#212121", camisa: "#FFB300", piernas: "#455A64", zapatos: "#3E2723",
    encima: () => (
      <G>
        <Path d="M32 80 L68 80 L70 132 L30 132 Z" fill="#ECEFF1" />
        {([[40, 94, "#E53935"], [58, 100, "#1E88E5"], [46, 116, "#43A047"], [62, 122, "#FDD835"], [36, 124, "#8E24AA"]] as const).map(([x, y, c]) => <Circle key={x} cx={x} cy={y} r="3.2" fill={c} />)}
        <Path d="M50 80 L50 132" stroke="#CFD8DC" strokeWidth="1.5" />
      </G>
    ),
    cabeza: (
      <G>
        {[28, 36, 44, 52, 60, 68, 72].map((x, i) => <Circle key={x} cx={x} cy={i % 2 ? 22 : 26} r="8" fill="#212121" />)}
        <Circle cx="26" cy="36" r="6" fill="#212121" />
        <Circle cx="74" cy="36" r="6" fill="#212121" />
        <Ellipse cx="46" cy="14" rx="26" ry="8" fill="#D32F2F" />
        <Rect x="44" y="3" width="4" height="5" rx="2" fill="#D32F2F" />
      </G>
    ),
  },
  // La tía de la escuelita: cola de caballo, chaleco verde y delantal con estrellitas.
  tia: {
    piel: "#F1C7A5", pelo: "#6D4C41", camisa: "#26A69A", piernas: "#5C6BC0", zapatos: "#5D4037", falda: true,
    encima: () => (
      <G>
        <Path d="M38 84 L62 84 L66 128 L34 128 Z" fill="#FFF8E1" />
        {([[44, 96], [56, 104], [46, 116]] as const).map(([x, y]) => <Path key={x} d={`M${x} ${y - 4} L${x + 1.4} ${y - 1} L${x + 4.5} ${y - 1} L${x + 2} ${y + 1} L${x + 3} ${y + 4} L${x} ${y + 2} L${x - 3} ${y + 4} L${x - 2} ${y + 1} L${x - 4.5} ${y - 1} L${x - 1.4} ${y - 1} Z`} fill="#FFCA28" />)}
        <Rect x="44" y="76" width="12" height="6" rx="2" fill="#FF7043" />
      </G>
    ),
    peloAtras: <Path d="M70 24 Q90 30 84 60 Q78 46 70 40 Z" fill="#6D4C41" />,
    cabeza: (
      <G>
        <Path d="M25 38 Q24 12 50 12 Q76 12 75 38 Q70 22 50 22 Q34 22 30 30 Q28 34 25 38 Z" fill="#6D4C41" />
        <Circle cx="70" cy="22" r="4" fill="#FF7043" />
      </G>
    ),
  },
  pedro: {
    piel: "#E0A878", pelo: "#9E9E9E", camisa: "#C62828", piernas: "#1565C0", zapatos: "#4E342E",
    encima: () => (
      <G>
        <Path d="M36 84 L64 84 L66 124 L34 124 Z" fill="#1E88E5" />
        <Rect x="40" y="74" width="5" height="14" fill="#1E88E5" />
        <Rect x="55" y="74" width="5" height="14" fill="#1E88E5" />
        <Circle cx="42.5" cy="86" r="2" fill="#FFD54F" />
        <Circle cx="57.5" cy="86" r="2" fill="#FFD54F" />
        <Rect x="43" y="96" width="14" height="9" rx="2" fill="#1976D2" />
        {[78, 90, 102].map((y) => <Path key={y} d={`M30 ${y} L36 ${y}`} stroke="#8E0000" strokeWidth="1.5" />)}
      </G>
    ),
    cabeza: (
      <G>
        <Ellipse cx="50" cy="20" rx="34" ry="7" fill="#F9D56E" />
        <Path d="M30 20 Q32 2 50 2 Q68 2 70 20 Z" fill="#FBC02D" />
        <Rect x="31" y="14" width="38" height="5" fill="#8D6E63" />
        <Path d="M22 22 Q50 30 78 22" stroke="#E0B84E" strokeWidth="1.5" fill="none" />
      </G>
    ),
  },
  rosa: {
    piel: "#F3D2B8", pelo: "#E0E0E0", camisa: "#7E57C2", piernas: "#7E57C2", zapatos: "#5D4037", falda: true,
    encima: () => (
      <G>
        <Path d="M38 86 L62 86 L68 136 L32 136 Z" fill="#F8BBD0" />
        <Path d="M38 86 Q50 92 62 86" stroke="#EC407A" strokeWidth="2" fill="none" />
        <Rect x="42" y="106" width="16" height="11" rx="3" fill="#F48FB1" />
        <Path d="M32 136 Q50 142 68 136" stroke="#EC407A" strokeWidth="2" fill="none" />
      </G>
    ),
    peloAtras: <Circle cx="50" cy="8" r="11" fill="#E0E0E0" />,
    cabeza: (
      <G>
        <Path d="M25 36 Q26 12 50 12 Q74 12 75 36 Q66 22 50 23 Q34 22 25 36 Z" fill="#E0E0E0" />
        <Circle cx="40" cy="40" r="7" fill="none" stroke="#8D6E63" strokeWidth="2" />
        <Circle cx="60" cy="40" r="7" fill="none" stroke="#8D6E63" strokeWidth="2" />
        <Path d="M47 40 L53 40" stroke="#8D6E63" strokeWidth="2" />
      </G>
    ),
  },
  lucas: {
    piel: "#8D5A3B", pelo: "#212121", camisa: "#4FC3F7", piernas: "#37474F", zapatos: "#212121",
    encima: () => (
      <G>
        <Path d="M30 74 L44 74 L46 134 L28 134 Z" fill="#FAFAFA" />
        <Path d="M56 74 L70 74 L72 134 L54 134 Z" fill="#FAFAFA" />
        <Path d="M44 74 L40 90 M56 74 L60 90" stroke="#E0E0E0" strokeWidth="2" />
        <Rect x="58" y="96" width="9" height="7" rx="1.5" fill="#E0E0E0" />
        <Path d="M42 80 Q38 100 46 104 Q52 106 54 98" stroke="#455A64" strokeWidth="2.2" fill="none" />
        <Circle cx="54" cy="97" r="3" fill="#90A4AE" />
      </G>
    ),
    cabeza: (
      <G>
        <Path d="M25 36 Q24 12 50 12 Q76 12 75 36 Q72 22 50 21 Q30 21 25 36 Z" fill="#212121" />
      </G>
    ),
  },
};

export function Adulto({ id, alto = 180, hablando = false, saludando = false }: { id: AdultoId; alto?: number; hablando?: boolean; saludando?: boolean }) {
  const e = ESTILOS[id];
  const s = alto / 180;
  const calma = useCiclo(2800 + Math.random() * 600);
  const charla = useCiclo(900, hablando);
  const boca = useCiclo(260, hablando);
  const saludo = useCiclo(700, saludando);
  const ojo = useParpadeo(3000);
  const bote = onda(calma, 0.8 * s);
  const brazoIzq = angulo(10, hablando ? onda(charla, 14) : onda(calma, 3));
  const brazoDer = saludando ? angulo(-125, onda(saludo, 18)) : angulo(-10, hablando ? onda(charla, 18, Math.PI) : onda(calma, 3, Math.PI));
  const cabeza = angulo(0, hablando ? onda(charla, 4, Math.PI / 2) : onda(calma, 2));
  const C = { px: 50, py: 72, w: 110, h: 110 };
  const ox = C.px - C.w / 2, oy = C.py - C.h / 2;
  const aberturaBoca = hablando ? boca.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.25, 1, 0.25] }) : new Animated.Value(0.25);

  return (
    <Animated.View pointerEvents="none" style={{ width: 100 * s, height: 180 * s, transform: [{ translateY: bote as never }] }}>
      {/* Piernas y zapatos (o falda) */}
      <Svg width={100 * s} height={180 * s} viewBox="0 0 100 180" style={{ position: "absolute" }}>
        <Sombreado />
        {e.falda ? (
          <G>
            <Path d="M34 120 L66 120 L72 150 L28 150 Z" fill={e.camisa} />
            <Rect x="39" y="148" width="8" height="20" rx="4" fill={e.piel} />
            <Rect x="53" y="148" width="8" height="20" rx="4" fill={e.piel} />
          </G>
        ) : (
          <G>
            <Rect x="37" y="120" width="11" height="50" rx="5" fill={e.piernas} />
            <Rect x="52" y="120" width="11" height="50" rx="5" fill={e.piernas} />
          </G>
        )}
        {[42, 58].map((x) => (
          <G key={x}>
            <Ellipse cx={x} cy="172" rx="9" ry="5" fill={e.zapatos} />
            <Ellipse cx={x} cy="172" rx="9" ry="5" fill="url(#vol)" {...CONTORNO} />
            <Path d={`M${x - 5} 169.5 Q${x - 1} 167.8 ${x + 3} 169`} stroke="#fff" strokeOpacity="0.45" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </G>
        ))}
        {/* Torso con volumen */}
        <Path d="M32 76 Q50 70 68 76 L70 124 L30 124 Z" fill={e.camisa} />
        <Path d="M32 76 Q50 70 68 76 L70 124 L30 124 Z" fill="url(#volL)" {...CONTORNO} />
        <Ellipse cx="50" cy="75" rx="10" ry="3.5" fill="#000" opacity="0.18" />
        {e.encima(s)}
      </Svg>
      {/* Brazos */}
      <Pieza s={s} px={33} py={80} w={84} h={84} rot={brazoIzq}>
        <Path d="M33 80 Q24 98 26 116" stroke="#000" strokeOpacity="0.18" strokeWidth="11.6" strokeLinecap="round" fill="none" />
        <Path d="M33 80 Q24 98 26 116" stroke={e.camisa} strokeWidth="10" strokeLinecap="round" fill="none" />
        <Path d="M31 84 Q24 98 25 112" stroke="#fff" strokeOpacity="0.25" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <Circle cx="26" cy="119" r="5.5" fill={e.piel} {...CONTORNO} />
        <Circle cx="24.6" cy="117.6" r="2" fill="#fff" opacity="0.3" />
      </Pieza>
      <Pieza s={s} px={67} py={80} w={84} h={84} rot={brazoDer}>
        <Path d="M67 80 Q76 98 74 116" stroke="#000" strokeOpacity="0.18" strokeWidth="11.6" strokeLinecap="round" fill="none" />
        <Path d="M67 80 Q76 98 74 116" stroke={id === "lucas" ? "#FAFAFA" : e.camisa} strokeWidth="10" strokeLinecap="round" fill="none" />
        <Path d="M69 86 Q75 98 74.5 110" stroke="#000" strokeOpacity="0.1" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <Circle cx="74" cy="119" r="5.5" fill={e.piel} {...CONTORNO} />
      </Pieza>
      {/* Cabeza */}
      <Animated.View style={{ position: "absolute", left: ox * s, top: oy * s, width: C.w * s, height: C.h * s, transform: [{ rotate: cabeza as never }] }}>
        <View style={{ position: "absolute", left: (0 - ox) * s, top: (0 - oy) * s }}>
          <Svg width={100 * s} height={80 * s} viewBox="0 0 100 80">
            <Sombreado />
            {e.peloAtras}
            <Rect x="44" y="60" width="12" height="14" fill={e.piel} />
            <Rect x="44" y="60" width="12" height="8" fill="#000" opacity="0.15" />
            <Ellipse cx="25" cy="44" rx="4" ry="6" fill={e.piel} {...CONTORNO} />
            <Ellipse cx="75" cy="44" rx="4" ry="6" fill={e.piel} {...CONTORNO} />
            <Ellipse cx="50" cy="42" rx="25" ry="27" fill={e.piel} />
            <Ellipse cx="50" cy="42" rx="25" ry="27" fill="url(#vol)" {...CONTORNO} />
            <Path d="M47 44 Q50 52 53 48" stroke="#00000033" strokeWidth="2" fill="none" strokeLinecap="round" />
            <Circle cx="35" cy="52" r="4" fill="#F48FB1" opacity="0.35" />
            <Circle cx="65" cy="52" r="4" fill="#F48FB1" opacity="0.35" />
            <G stroke="#00000066" strokeWidth="1.8" strokeLinecap="round" fill="none"><Path d="M35 33 Q40 31 45 33" /><Path d="M55 33 Q60 31 65 33" /></G>
            {e.cabeza}
          </Svg>
        </View>
        {/* Ojos que pestañean */}
        {[40, 60].map((cx) => (
          <Animated.View key={cx} style={{ position: "absolute", left: (cx - 4 - ox) * s, top: (40 - 4 - oy) * s, width: 8 * s, height: 8 * s, transform: [{ scaleY: ojo as never }] }}>
            <Svg width={8 * s} height={8 * s} viewBox={`${cx - 4} 36 8 8`}>
              <Circle cx={cx} cy="40" r="3" fill="#3B2F5C" />
              <Circle cx={cx + 0.9} cy="39" r="1" fill="#fff" />
            </Svg>
          </Animated.View>
        ))}
        {/* Boca: se abre y cierra al hablar */}
        <Animated.View style={{ position: "absolute", left: (43 - ox) * s, top: (54 - oy) * s, width: 14 * s, height: 10 * s, transform: [{ scaleY: aberturaBoca as never }] }}>
          <Svg width={14 * s} height={10 * s} viewBox="0 0 14 10">
            <Path d="M1 1 Q7 2 13 1 Q12 9 7 9 Q2 9 1 1 Z" fill="#7B1F3A" />
            <Path d="M4 6 Q7 8 10 6" fill="#F06292" />
          </Svg>
        </Animated.View>
        {id === "pedro" && (
          <View style={{ position: "absolute", left: (36 - ox) * s, top: (49 - oy) * s }}>
            <Svg width={28 * s} height={8 * s} viewBox="36 49 28 8"><Path d="M37 54 Q43 49 50 53 Q57 49 63 54 Q57 56 50 55 Q43 56 37 54 Z" fill="#BDBDBD" /></Svg>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}
