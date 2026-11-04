import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";

/**
 * Los amigos de otros países que llegan en bus al paradero (Max está en
 * Personajes.tsx). Lienzo de 100×160, igual que Emilia.
 */
interface Props {
  alto?: number;
  saludando?: boolean;
}

/** Brazo derecho: saludando (arriba) o abajo. */
function Brazos({ piel, saludando }: { piel: string; saludando?: boolean }) {
  return (
    <>
      <Path d="M34 78 Q20 92 24 108" stroke={piel} strokeWidth="8" strokeLinecap="round" fill="none" />
      {saludando ? (
        <Path d="M66 78 Q84 66 84 50" stroke={piel} strokeWidth="8" strokeLinecap="round" fill="none" />
      ) : (
        <Path d="M66 78 Q80 92 76 108" stroke={piel} strokeWidth="8" strokeLinecap="round" fill="none" />
      )}
      <Circle cx={saludando ? 84 : 76} cy={saludando ? 47 : 110} r="5.5" fill={piel} />
    </>
  );
}

function Cara({ ojos = "#2E1A12", mejillas = "#F48FB1" }: { ojos?: string; mejillas?: string }) {
  return (
    <>
      <Circle cx="41" cy="47" r="3.5" fill={ojos} />
      <Circle cx="59" cy="47" r="3.5" fill={ojos} />
      <Circle cx="42" cy="46" r="1.2" fill="#fff" />
      <Circle cx="60" cy="46" r="1.2" fill="#fff" />
      <Circle cx="34" cy="56" r="4" fill={mejillas} opacity="0.5" />
      <Circle cx="66" cy="56" r="4" fill={mejillas} opacity="0.5" />
      <Path d="M42 57 Q50 65 58 57" stroke={ojos} strokeWidth="2.5" strokeLinecap="round" fill="#fff" />
    </>
  );
}

/** Bia: de Brasil, habla portugués. Pelo crespo grande con flor, vestido verde y amarillo. Le encanta cantar y bailar. */
export function BiaDibujo({ alto = 160, saludando = false }: Props) {
  const piel = "#9C6644";
  return (
    <Svg width={(alto * 100) / 160} height={alto} viewBox="0 0 100 160">
      {/* Pelo crespo (detrás) */}
      <G fill="#2B1B14">
        {[[22, 38], [30, 22], [44, 14], [58, 14], [72, 22], [80, 38], [20, 54], [82, 54], [26, 66], [76, 66]].map(([x, y]) => (
          <Circle key={`${x}-${y}`} cx={x} cy={y} r="13" />
        ))}
      </G>
      {/* Piernas y sandalias */}
      <Rect x="39" y="122" width="8" height="24" rx="4" fill={piel} />
      <Rect x="54" y="122" width="8" height="24" rx="4" fill={piel} />
      <Ellipse cx="42" cy="148" rx="9" ry="4.5" fill="#FDD835" />
      <Ellipse cx="59" cy="148" rx="9" ry="4.5" fill="#FDD835" />
      {/* Vestido verde con vuelo amarillo */}
      <Path d="M36 72 L64 72 L80 124 L20 124 Z" fill="#43A047" />
      <Path d="M22 116 L78 116 L80 126 L20 126 Z" fill="#FDD835" />
      <Circle cx="50" cy="96" r="7" fill="#FDD835" />
      <Circle cx="50" cy="96" r="3" fill="#1E88E5" />
      <Brazos piel={piel} saludando={saludando} />
      {/* Cabeza */}
      <Circle cx="50" cy="46" r="25" fill="#B07850" />
      <Path d="M27 40 Q32 22 50 22 Q68 22 73 40 Q62 30 50 31 Q38 30 27 40 Z" fill="#2B1B14" />
      {/* Flor */}
      <G>
        {[0, 72, 144, 216, 288].map((a) => (
          <Circle key={a} cx={74 + 6 * Math.cos((a * Math.PI) / 180)} cy={24 + 6 * Math.sin((a * Math.PI) / 180)} r="4.5" fill="#F06292" />
        ))}
        <Circle cx="74" cy="24" r="3.5" fill="#FFEB3B" />
      </G>
      <Cara />
    </Svg>
  );
}

/** Léa: de Francia, habla francés. Boina roja, polera a rayas y pincel: le encanta pintar. */
export function LeaDibujo({ alto = 160, saludando = false }: Props) {
  const piel = "#F6D3B3";
  return (
    <Svg width={(alto * 100) / 160} height={alto} viewBox="0 0 100 160">
      {/* Pelo corto (melena) */}
      <Path d="M22 44 Q20 18 50 16 Q80 18 78 44 L78 66 Q70 70 66 62 L34 62 Q30 70 22 66 Z" fill="#C68B3E" />
      {/* Piernas y zapatos */}
      <Rect x="39" y="122" width="8" height="24" rx="4" fill={piel} />
      <Rect x="54" y="122" width="8" height="24" rx="4" fill={piel} />
      <Ellipse cx="42" cy="148" rx="9" ry="5" fill="#1A237E" />
      <Ellipse cx="59" cy="148" rx="9" ry="5" fill="#1A237E" />
      {/* Falda roja y polera a rayas */}
      <Path d="M30 100 L70 100 L78 126 L22 126 Z" fill="#E53935" />
      <Path d="M33 72 Q50 66 67 72 L69 104 L31 104 Z" fill="#fff" />
      {[78, 86, 94].map((y) => (
        <Rect key={y} x="32" y={y} width="36" height="4" fill="#1E3A8A" />
      ))}
      <Brazos piel={piel} saludando={saludando} />
      {/* Pincel en la mano izquierda */}
      <Path d="M24 108 L14 92" stroke="#8D6E63" strokeWidth="3" strokeLinecap="round" />
      <Path d="M14 92 L10 85 L16 88 Z" fill="#7E57C2" />
      {/* Cabeza */}
      <Circle cx="50" cy="46" r="25" fill={piel} />
      <Path d="M26 42 Q30 24 50 24 Q70 24 74 42 Q66 32 56 34 Q48 30 40 34 Q32 34 26 42 Z" fill="#C68B3E" />
      {/* Boina */}
      <Ellipse cx="46" cy="24" rx="26" ry="9" fill="#C62828" />
      <Circle cx="46" cy="15" r="3" fill="#C62828" />
      <Cara ojos="#1E3A8A" />
    </Svg>
  );
}

/** Xiao Lin: de China, habla chino mandarín. Flequillo, chaqueta roja con botones dorados. Le encantan los números. */
export function XiaoLinDibujo({ alto = 160, saludando = false }: Props) {
  const piel = "#F3D2A2";
  return (
    <Svg width={(alto * 100) / 160} height={alto} viewBox="0 0 100 160">
      {/* Piernas, pantalón y zapatillas */}
      <Path d="M34 102 L66 102 L64 140 L53 140 L50 112 L47 140 L36 140 Z" fill="#2E7D32" />
      <Ellipse cx="41" cy="146" rx="9" ry="5" fill="#212121" />
      <Ellipse cx="59" cy="146" rx="9" ry="5" fill="#212121" />
      {/* Chaqueta roja con botones dorados */}
      <Path d="M32 72 Q50 66 68 72 L70 106 L30 106 Z" fill="#D32F2F" />
      <Path d="M50 70 V106" stroke="#B71C1C" strokeWidth="2" />
      {[80, 89, 98].map((y) => (
        <Circle key={y} cx="50" cy={y} r="2.6" fill="#FFC107" />
      ))}
      <Path d="M42 70 Q50 76 58 70" stroke="#FFC107" strokeWidth="3" fill="none" />
      <Brazos piel={piel} saludando={saludando} />
      {/* Cabeza con pelo liso y flequillo */}
      <Circle cx="50" cy="46" r="25" fill={piel} />
      <Path d="M24 46 Q22 18 50 17 Q78 18 76 46 Q74 34 70 32 L30 32 Q26 34 24 46 Z" fill="#111" />
      <Path d="M30 32 Q34 42 40 36 Q44 42 50 36 Q56 42 60 36 Q66 42 70 32 Z" fill="#111" />
      <Cara ojos="#111" mejillas="#EF9A9A" />
    </Svg>
  );
}
