import type { ReactNode } from "react";
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Polygon, Rect, Stop, Text as SvgText } from "react-native-svg";
import { useMomento } from "../lib/hora";

/**
 * Dibujos de los lugares del barrio en vista 3/4 (se ve el frente y el lado
 * derecho): paredes con volumen, techos con tejas, ventanas con vidrio y
 * reflejo que se encienden de tarde y de noche. La luz viene de arriba a la
 * izquierda, así que el lado derecho queda en sombra.
 * Todos usan un lienzo de 200×200 con el suelo abajo (y = 190).
 */
export type LugarId = "casa" | "escuelita" | "taller" | "tiendita" | "plaza" | "granja" | "huerto" | "paradero" | "disfraces" | "veterinaria";

const SUELO = 190;
const KY = 0.55; // inclinación de la profundidad (hacia arriba a la derecha)

export function LugarDibujo({ id, tamano }: { id: LugarId; tamano: number }) {
  const momento = useMomento();
  const luz = momento === "noche" || momento === "tarde";
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 200 200">
      <Defs>
        <LinearGradient id="vidrio" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E3F2FD" />
          <Stop offset="0.55" stopColor="#90CAF9" />
          <Stop offset="1" stopColor="#5C8DB8" />
        </LinearGradient>
        <LinearGradient id="vidrioLuz" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFF8E1" />
          <Stop offset="1" stopColor="#FFCA28" />
        </LinearGradient>
        <LinearGradient id="sombraPared" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000" stopOpacity="0.18" />
          <Stop offset="0.12" stopColor="#000" stopOpacity="0" />
          <Stop offset="0.85" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.16" />
        </LinearGradient>
        <LinearGradient id="luzTecho" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </LinearGradient>
      </Defs>
      {DIBUJOS[id](luz)}
    </Svg>
  );
}

// ---------- Piezas comunes ----------

/** Ventana con marco, vidrio con reflejo y alféizar; de noche brilla con luz cálida. */
function Ventana({ x, y, w = 26, h = 28, luz, marco = "#fff", cortina }: { x: number; y: number; w?: number; h?: number; luz: boolean; marco?: string; cortina?: string }) {
  return (
    <G>
      {luz && <Rect x={x - 6} y={y - 6} width={w + 12} height={h + 12} rx="8" fill="#FFE082" opacity="0.35" />}
      <Rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx="4" fill={marco} />
      <Rect x={x} y={y} width={w} height={h} rx="2" fill={luz ? "url(#vidrioLuz)" : "url(#vidrio)"} />
      {cortina && <Path d={`M${x} ${y} Q${x + w * 0.2} ${y + h * 0.5} ${x + 2} ${y + h} H${x} Z M${x + w} ${y} Q${x + w * 0.8} ${y + h * 0.5} ${x + w - 2} ${y + h} H${x + w} Z`} fill={cortina} opacity="0.85" />}
      {!luz && <Path d={`M${x + 3} ${y + h * 0.75} L${x + w * 0.55} ${y + 3} L${x + w * 0.75} ${y + 3} L${x + 3} ${y + h * 0.98} Z`} fill="#fff" opacity="0.45" />}
      <Line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={marco} strokeWidth="2.5" />
      <Line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={marco} strokeWidth="2" />
      <Rect x={x - 5} y={y + h + 2} width={w + 10} height="4" rx="1.5" fill={marco} />
      <Rect x={x - 5} y={y + h + 5} width={w + 10} height="2" fill="#000" opacity="0.15" />
    </G>
  );
}

/** Puerta con marco, peldaño y manilla. */
function Puerta({ x, w = 30, h = 56, color, arco = false, marco = "#fff", doble = false }: { x: number; w?: number; h?: number; color: string; arco?: boolean; marco?: string; doble?: boolean }) {
  const y = SUELO - h;
  const trazo = (x: number, w: number, h: number) => {
    const yy = SUELO - h;
    return arco ? `M${x} ${SUELO} V${yy + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${yy + w / 2} V${SUELO} Z` : `M${x} ${SUELO} V${yy} H${x + w} V${SUELO} Z`;
  };
  const forma = trazo(x, w, h);
  return (
    <G>
      <Path d={trazo(x - 3, w + 6, h + 3)} fill={marco} />
      <Path d={forma} fill={color} />
      <Path d={forma} fill="url(#sombraPared)" />
      {doble ? <Line x1={x + w / 2} y1={y + 2} x2={x + w / 2} y2={SUELO} stroke="#000" strokeOpacity="0.25" strokeWidth="1.5" /> : null}
      {[0.28, 0.62].map((f) => <Rect key={f} x={x + 5} y={y + h * f} width={doble ? w / 2 - 8 : w - 10} height={h * 0.22} rx="2" fill="#000" opacity="0.1" />)}
      <Circle cx={doble ? x + w / 2 - 4 : x + w - 7} cy={y + h * 0.58} r="2.4" fill="#FFD54F" />
      <Rect x={x - 6} y={SUELO - 1} width={w + 12} height="5" rx="1.5" fill="#BDBDBD" />
    </G>
  );
}

interface EdificioProps {
  x0?: number;
  w?: number;
  /** Altura de la pared (desde el suelo). */
  hp?: number;
  d?: number;
  /** Altura del techo inclinado sobre la pared (0 = techo plano). */
  r?: number;
  pared: string;
  lado: string;
  techo: string;
  techoLado?: string;
  /** Lo que va encima del techo (chimenea, campanario, letrero). */
  sobreTecho?: ReactNode;
  children?: ReactNode;
}

/**
 * Edificio en 3/4: pared de frente, lado derecho en sombra y techo a dos
 * aguas con la cumbrera paralela al frente (o techo plano con parapeto).
 */
function Edificio({ x0 = 18, w = 134, hp = 92, d = 34, r = 46, pared, lado, techo, techoLado, sobreTecho, children }: EdificioProps) {
  const top = SUELO - hp;
  const dy = d * KY;
  const x1 = x0 + w;
  const plano = r === 0;
  return (
    <G>
      {/* Lado derecho (en sombra) con su triángulo del techo */}
      <Path d={plano
        ? `M${x1} ${SUELO} V${top} L${x1 + d} ${top - dy} V${SUELO - dy} Z`
        : `M${x1} ${SUELO} V${top} L${x1 + d / 2} ${top - dy / 2 - r} L${x1 + d} ${top - dy} V${SUELO - dy} Z`} fill={lado} />
      <Path d={`M${x1} ${SUELO} L${x1 + d} ${SUELO - dy} V${SUELO - dy - 6} L${x1} ${SUELO - 6} Z`} fill="#000" opacity="0.12" />
      {/* Frente */}
      <Rect x={x0} y={top} width={w} height={hp} fill={pared} />
      <Rect x={x0} y={top} width={w} height={hp} fill="url(#sombraPared)" />
      {/* Arista iluminada de la esquina */}
      <Line x1={x1} y1={top} x2={x1} y2={SUELO} stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
      {plano ? (
        <G>
          <Path d={`M${x0 - 4} ${top} L${x1 + 4} ${top} L${x1 + 4 + d} ${top - dy} L${x0 - 4 + d} ${top - dy} Z`} fill={techoLado ?? lado} />
          <Rect x={x0 - 4} y={top - 4} width={w + 8} height="12" fill={techo} />
          <Path d={`M${x1 + 4} ${top - 4} L${x1 + 4 + d} ${top - 4 - dy} V${top + 8 - dy} L${x1 + 4} ${top + 8} Z`} fill={techoLado ?? lado} />
          <Rect x={x0 - 4} y={top + 8} width={w + 8} height="4" fill="#000" opacity="0.15" />
        </G>
      ) : (
        <G>
          {/* Sombra del alero sobre la pared */}
          <Rect x={x0} y={top} width={w} height="9" fill="#000" opacity="0.18" />
          {/* Faldón de atrás que asoma por el lado */}
          <Path d={`M${x1 + d / 2} ${top - dy / 2 - r} L${x1 + d + 6} ${top - dy + 4} L${x1 + d + 1} ${top - dy + 8} L${x1 + d / 2 - 2} ${top - dy / 2 - r + 6} Z`} fill={techoLado ?? techo} />
          {/* Faldón de adelante con tejas */}
          <Path d={`M${x0 - 9} ${top + 6} L${x1 + 9} ${top + 6} L${x1 + 9 + d / 2} ${top - r} L${x0 - 9 + d / 2} ${top - r} Z`} fill={techo} />
          {Array.from({ length: 5 }, (_, i) => {
            const f = (i + 1) / 6, y = top + 6 - f * (r + 6), dx = f * (d / 2);
            return <Line key={i} x1={x0 - 9 + dx} y1={y} x2={x1 + 9 + dx} y2={y} stroke="#000" strokeOpacity="0.14" strokeWidth="2" />;
          })}
          {Array.from({ length: 9 }, (_, i) => {
            const x = x0 - 9 + ((w + 18) / 9) * (i + 0.5);
            return <Line key={`t${i}`} x1={x} y1={top + 6} x2={x + d / 2} y2={top - r} stroke="#000" strokeOpacity="0.06" strokeWidth="1.5" />;
          })}
          <Path d={`M${x0 - 9} ${top + 6} L${x1 + 9} ${top + 6} L${x1 + 9 + d / 2} ${top - r} L${x0 - 9 + d / 2} ${top - r} Z`} fill="url(#luzTecho)" />
          {/* Cumbrera y canaleta */}
          <Line x1={x0 - 9 + d / 2} y1={top - r} x2={x1 + 9 + d / 2} y2={top - r} stroke="#fff" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" />
          <Rect x={x0 - 10} y={top + 5} width={w + 20} height="4" rx="2" fill="#000" opacity="0.2" />
        </G>
      )}
      {sobreTecho}
      {children}
      {/* Zócalo y sombra de contacto con el suelo */}
      <Rect x={x0} y={SUELO - 7} width={w} height="7" fill="#000" opacity="0.1" />
    </G>
  );
}

function Flor({ x, y, c }: { x: number; y: number; c: string }) {
  return (
    <G>
      {[0, 72, 144, 216, 288].map((a) => <Circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * 3} cy={y + Math.sin((a * Math.PI) / 180) * 3} r="2.6" fill={c} />)}
      <Circle cx={x} cy={y} r="1.8" fill="#FFF59D" />
    </G>
  );
}

function Arbusto({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G>
      <Ellipse cx={x + 3 * s} cy={y + 2} rx={16 * s} ry={4 * s} fill="#000" opacity="0.15" />
      <Circle cx={x - 7 * s} cy={y - 6 * s} r={9 * s} fill="#388E3C" />
      <Circle cx={x + 6 * s} cy={y - 7 * s} r={10 * s} fill="#2E7D32" />
      <Circle cx={x - 1 * s} cy={y - 12 * s} r={9 * s} fill="#43A047" />
      <Circle cx={x - 4 * s} cy={y - 15 * s} r={3.5 * s} fill="#fff" opacity="0.18" />
    </G>
  );
}

// ---------- Lugares ----------

const DIBUJOS: Record<LugarId, (luz: boolean) => ReactNode> = {
  // Casa amarilla de Emilia, con chimenea de ladrillos, jardineras y flores.
  casa: (luz) => (
    <Edificio pared="#FDD835" lado="#D9AE16" techo="#E57373" techoLado="#B85454"
      sobreTecho={
        <G>
          <Path d="M116 40 H134 V62 L116 66 Z" fill="#A1665E" />
          <Path d="M134 40 L142 36 V58 L134 62 Z" fill="#7F4D47" />
          {[46, 52, 58].map((y) => <Line key={y} x1="116" y1={y} x2="134" y2={y - 1} stroke="#fff" strokeOpacity="0.3" />)}
          <Rect x="114" y="36" width="22" height="6" fill="#8D5049" />
        </G>
      }>
      <Ventana x={34} y={118} luz={luz} cortina="#F48FB1" />
      <Ventana x={126} y={118} luz={luz} cortina="#F48FB1" />
      {[[30, 152], [122, 152]].map(([x, y]) => (
        <G key={x}>
          <Rect x={x} y={y} width="34" height="9" rx="2" fill="#8D6E63" />
          {[6, 14, 22, 30].map((dx, i) => <Flor key={dx} x={x! + dx - 2} y={y! - 2} c={["#F06292", "#BA68C8", "#FF7043", "#FFF176"][i]!} />)}
        </G>
      ))}
      <Puerta x={78} w={34} h={62} color="#8D6E63" arco />
      <Arbusto x={24} y={192} s={0.9} />
      <Arbusto x={168} y={186} s={0.8} />
    </Edificio>
  ),
  // La Escuelita: celeste, con campanario, letrero "ABC 123" y puerta doble.
  escuelita: (luz) => (
    <Edificio hp={100} r={42} pared="#4FC3F7" lado="#2196C9" techo="#1E88E5" techoLado="#1565C0"
      sobreTecho={
        <G>
          <Path d="M84 52 L84 22 L108 22 L108 50 Z" fill="#81D4FA" />
          <Path d="M108 22 L116 18 V46 L108 50 Z" fill="#4FA8CF" />
          <Path d="M80 22 L96 6 L112 22 Z" fill="#1565C0" />
          <Path d="M112 22 L96 6 L120 18 Z" fill="#0D47A1" />
          <Path d="M90 44 V32 A6 6 0 0 1 102 32 V44 Z" fill="#0D47A1" opacity="0.6" />
          <Path d="M91 38 Q96 28 101 38 Z" fill="#FFCA28" />
          <Circle cx="96" cy="39" r="1.6" fill="#F57F17" />
        </G>
      }>
      <Rect x="40" y="100" width="90" height="24" rx="5" fill="#fff" />
      <Rect x="40" y="122" width="90" height="3" fill="#000" opacity="0.15" />
      <SvgText x="85" y="118" fontSize="17" fontWeight="bold" fill="#3B2F5C" textAnchor="middle">ABC 123</SvgText>
      <Ventana x={28} y={136} luz={luz} marco="#E3F2FD" />
      <Ventana x={134} y={136} luz={luz} marco="#E3F2FD" />
      <Puerta x={68} w={36} h={54} color="#1565C0" doble />
      <Arbusto x={24} y={192} s={0.8} />
    </Edificio>
  ),
  // Taller de arte: naranjo, con una paleta gigante en el techo y un caballete.
  taller: (luz) => (
    <Edificio pared="#FFB74D" lado="#E0912C" techo="#EF6C00" techoLado="#BF5600"
      sobreTecho={
        <G>
          <Path d="M64 58 Q60 30 92 28 Q124 26 122 46 Q120 56 106 52 Q96 50 98 60 Q98 68 82 66 Q66 66 64 58 Z" fill="#FFF3E0" stroke="#D7A86E" strokeWidth="2" />
          <Circle cx="80" cy="44" r="5" fill="#E53935" /><Circle cx="94" cy="38" r="5" fill="#1E88E5" />
          <Circle cx="108" cy="40" r="5" fill="#43A047" /><Circle cx="78" cy="57" r="5" fill="#FDD835" />
          <Ellipse cx="90" cy="56" rx="4" ry="3" fill="#D7A86E" />
        </G>
      }>
      {[[44, 112, "#E53935"], [128, 160, "#1E88E5"], [150, 120, "#43A047"]].map(([x, y, c]) => <Circle key={x as number} cx={x as number} cy={y as number} r="4" fill={c as string} opacity="0.55" />)}
      <Ventana x={34} y={118} luz={luz} marco="#FFF3E0" />
      <Ventana x={126} y={118} luz={luz} marco="#FFF3E0" />
      <Puerta x={78} w={32} h={60} color="#6D4C41" arco marco="#FFF3E0" />
      {/* Caballete con cuadro junto a la puerta */}
      <Path d="M44 190 L54 152 L64 190 M54 152 V190" stroke="#6D4C41" strokeWidth="3" fill="none" />
      <Rect x="40" y="150" width="30" height="22" fill="#fff" stroke="#8D6E63" strokeWidth="2" />
      <Path d="M42 168 Q52 158 68 166 V170 H42 Z" fill="#81C784" /><Circle cx="62" cy="157" r="3.5" fill="#FDD835" />
    </Edificio>
  ),
  // Almacén de Doña Rosa: techo plano con letrero, toldo a rayas y cajones de fruta.
  tiendita: (luz) => (
    <Edificio hp={108} r={0} pared="#FFE082" lado="#D9B95B" techo="#FFF8E1" techoLado="#E6D9B5">
      <Rect x="28" y="66" width="114" height="26" rx="6" fill="#fff" stroke="#8D6E63" strokeWidth="3" />
      <SvgText x="85" y="85" fontSize="16" fontWeight="bold" fill="#8D6E63" textAnchor="middle">ALMACÉN</SvgText>
      {/* Toldo con caída y sombra */}
      <Path d="M12 100 H158 L166 120 H4 Z" fill="#E53935" />
      {Array.from({ length: 8 }, (_, i) => <Path key={i} d={`M${12 + i * 18.25} 100 h9.1 L${8 + i * 20.25 + 10} 120 h-10 Z`} fill="#fff" />)}
      {Array.from({ length: 8 }, (_, i) => <Path key={`o${i}`} d={`M${4 + i * 20.25} 120 h20.25 q-10 9 -20.25 0 Z`} fill={i % 2 ? "#fff" : "#E53935"} />)}
      <Rect x="18" y="128" width="134" height="6" fill="#000" opacity="0.12" />
      {/* Vitrina */}
      <Rect x="26" y="134" width="70" height="40" rx="3" fill="#fff" />
      <Rect x="29" y="137" width="64" height="34" fill={luz ? "url(#vidrioLuz)" : "url(#vidrio)"} />
      {!luz && <Path d="M32 168 L60 138 H70 L38 170 Z" fill="#fff" opacity="0.4" />}
      {/* Cajones con fruta */}
      {[[28, "#E53935"], [52, "#FDD835"], [76, "#FB8C00"]].map(([x, c]) => (
        <G key={x as number}>
          {[0, 1, 2].map((i) => <Circle key={i} cx={(x as number) + 5 + i * 6} cy="176" r="4" fill={c as string} />)}
          <Rect x={x as number} y="178" width="22" height="12" fill="#A1887F" stroke="#795548" strokeWidth="1.5" />
        </G>
      ))}
      <Puerta x={108} w={34} h={56} color="#8D6E63" marco="#FFF8E1" />
    </Edificio>
  ),
  // Plaza de juegos: columpio y resbalín con sombras sobre el pasto.
  plaza: () => (
    <G>
      <Ellipse cx="104" cy="184" rx="96" ry="14" fill="#C5E1A5" />
      <Ellipse cx="104" cy="184" rx="96" ry="14" fill="none" stroke="#AED581" strokeWidth="3" />
      {/* Sombras proyectadas */}
      <Path d="M24 186 L64 176 L112 186 Z" fill="#000" opacity="0.12" />
      <Path d="M128 186 L196 186 L176 176 L150 176 Z" fill="#000" opacity="0.12" />
      <Line x1="20" y1="186" x2="40" y2="70" stroke="#E53935" strokeWidth="8" strokeLinecap="round" />
      <Line x1="100" y1="186" x2="80" y2="70" stroke="#E53935" strokeWidth="8" strokeLinecap="round" />
      <Line x1="21" y1="182" x2="39" y2="76" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />
      <Line x1="36" y1="70" x2="84" y2="70" stroke="#C62828" strokeWidth="9" strokeLinecap="round" />
      <Line x1="52" y1="72" x2="52" y2="140" stroke="#795548" strokeWidth="2.5" />
      <Line x1="68" y1="72" x2="68" y2="140" stroke="#795548" strokeWidth="2.5" />
      <Rect x="46" y="138" width="28" height="8" rx="3" fill="#FDD835" />
      <Rect x="46" y="144" width="28" height="3" rx="1.5" fill="#000" opacity="0.2" />
      <Line x1="128" y1="186" x2="128" y2="96" stroke="#1E88E5" strokeWidth="7" />
      <Line x1="146" y1="186" x2="146" y2="96" stroke="#1565C0" strokeWidth="7" />
      {[110, 126, 142, 158, 174].map((y) => <Line key={y} x1="128" y1={y} x2="146" y2={y} stroke="#1E88E5" strokeWidth="4" />)}
      <Rect x="122" y="88" width="30" height="10" rx="4" fill="#1565C0" />
      <Path d="M150 92 Q170 120 196 182" stroke="#2E7D32" strokeWidth="14" strokeLinecap="round" fill="none" />
      <Path d="M150 92 Q170 120 196 182" stroke="#43A047" strokeWidth="10" strokeLinecap="round" fill="none" />
      <Path d="M152 90 Q170 118 193 176" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" fill="none" />
    </G>
  ),
  // Granja de Don Pedro: granero rojo con portón, ventana del pajar, cerca y fardo.
  granja: (luz) => (
    <Edificio hp={98} r={50} pared="#E53935" lado="#B71C1C" techo="#8E2A2A" techoLado="#6D1F1F">
      {[110, 130, 150, 170].map((y) => <Line key={y} x1="18" y1={y} x2="152" y2={y} stroke="#000" strokeOpacity="0.08" strokeWidth="2" />)}
      <Rect x="66" y="98" width="38" height="22" fill="#fff" />
      <Rect x="69" y="101" width="32" height="16" fill={luz ? "url(#vidrioLuz)" : "#5D4037"} />
      <Rect x="58" y="128" width="54" height="62" fill="#fff" />
      <Rect x="62" y="132" width="46" height="58" fill="#C62828" />
      <Path d="M62 132 L108 190 M108 132 L62 190" stroke="#fff" strokeWidth="5" />
      <Path d="M62 132 L108 190" stroke="#000" strokeOpacity="0.1" strokeWidth="1" />
      {[2, 14, 166, 180, 194].map((x) => <Rect key={x} x={x - 2.5} y="160" width="5" height="32" fill="#A1887F" />)}
      <Rect x="0" y="166" width="20" height="5" fill="#BCAAA4" /><Rect x="0" y="178" width="20" height="5" fill="#BCAAA4" />
      <Rect x="164" y="160" width="36" height="5" fill="#BCAAA4" /><Rect x="164" y="172" width="36" height="5" fill="#BCAAA4" />
      <Ellipse cx="30" cy="186" rx="14" ry="10" fill="#FFD54F" />
      <Line x1="22" y1="180" x2="24" y2="192" stroke="#FFB300" strokeWidth="1.5" /><Line x1="32" y1="178" x2="33" y2="194" stroke="#FFB300" strokeWidth="1.5" />
    </Edificio>
  ),
  // Huerto: surcos de tierra con brotes, zanahorias y un espantapájaros.
  huerto: () => (
    <G>
      <Ellipse cx="104" cy="160" rx="98" ry="38" fill="#000" opacity="0.08" />
      {[130, 154, 178].map((y) => (
        <G key={y}>
          <Ellipse cx="100" cy={y + 3} rx="90" ry="10" fill="#5D4037" />
          <Ellipse cx="100" cy={y} rx="90" ry="10" fill="#8D6E63" />
          <Ellipse cx="96" cy={y - 3} rx="80" ry="4" fill="#A1887F" opacity="0.6" />
        </G>
      ))}
      {[30, 60, 90, 120, 150, 172].map((x, k) => (
        <G key={x}>
          <Path d={`M${x} ${124 + (k % 3) * 24} q-8 -16 0 -24 q8 8 0 24`} fill="#66BB6A" />
          <Path d={`M${x} ${124 + (k % 3) * 24} q10 -14 14 -16 q-2 12 -14 16`} fill="#2E7D32" />
          {k % 2 === 0 && <Path d={`M${x - 3} ${126 + (k % 3) * 24} L${x} ${133 + (k % 3) * 24} L${x + 3} ${126 + (k % 3) * 24} Z`} fill="#FB8C00" />}
        </G>
      ))}
      <Line x1="163" y1="122" x2="172" y2="118" stroke="#000" strokeOpacity="0.15" strokeWidth="6" />
      <Line x1="160" y1="40" x2="160" y2="122" stroke="#8D6E63" strokeWidth="6" />
      <Line x1="132" y1="66" x2="188" y2="66" stroke="#8D6E63" strokeWidth="6" />
      <Circle cx="160" cy="38" r="14" fill="#FFE0B2" />
      <Circle cx="155" cy="36" r="1.8" fill="#5D4037" /><Circle cx="165" cy="36" r="1.8" fill="#5D4037" />
      <Path d="M154 43 Q160 47 166 43" stroke="#5D4037" strokeWidth="1.5" fill="none" />
      <Path d="M138 30 L182 30 L172 14 L148 14 Z" fill="#FDD835" />
      <Rect x="138" y="28" width="44" height="4" fill="#F9A825" />
      <Rect x="146" y="58" width="28" height="36" rx="4" fill="#42A5F5" />
      <Rect x="158" y="58" width="16" height="36" rx="4" fill="#1E88E5" />
      <Path d="M146 94 l4 8 4 -8 4 8 4 -8 4 8 4 -8 4 8" stroke="#FDD835" strokeWidth="2" fill="none" />
    </G>
  ),
  // Tienda de disfraces: rosada, con letrero, vitrina con corona y estrellas.
  disfraces: (luz) => (
    <Edificio pared="#F48FB1" lado="#D06A8E" techo="#AD1457" techoLado="#880E4F"
      sobreTecho={
        <G>
          <Rect x="52" y="36" width="90" height="22" rx="7" fill="#fff" stroke="#AD1457" strokeWidth="3" />
          <SvgText x="97" y="52" fontSize="13" fontWeight="bold" fill="#AD1457" textAnchor="middle">DISFRACES</SvgText>
        </G>
      }>
      <Rect x="28" y="110" width="76" height="56" rx="5" fill="#fff" />
      <Rect x="31" y="113" width="70" height="50" rx="3" fill={luz ? "url(#vidrioLuz)" : "#FCE4EC"} />
      <Path d="M44 148 l6 -14 l8 10 l8 -10 l6 14 z" fill="#FDD835" stroke="#F9A825" strokeWidth="1" />
      <Circle cx="86" cy="148" r="8" fill="#7E57C2" />
      <Path d="M80 140 L86 128 L92 140 Z" fill="#7E57C2" />
      {!luz && <Path d="M34 158 L66 114 H76 L42 162 Z" fill="#fff" opacity="0.35" />}
      <Rect x="24" y="166" width="84" height="5" rx="2" fill="#fff" />
      {[[26, 106], [150, 112], [140, 102]].map(([x, y]) => <Path key={x} d={`M${x} ${y! - 5} l1.5 3.5 3.8 .4 -2.9 2.5 .9 3.7 -3.3 -2 -3.3 2 .9 -3.7 -2.9 -2.5 3.8 -.4 Z`} fill="#FFF59D" />)}
      <Puerta x={116} w={30} h={66} color="#880E4F" arco />
    </Edificio>
  ),
  // Veterinaria del Dr. Lucas: blanca y verde agua, con una cruz y una huella.
  veterinaria: (luz) => (
    <Edificio pared="#E0F2F1" lado="#A9D3CF" techo="#00897B" techoLado="#00695C"
      sobreTecho={
        <G>
          <Rect x="78" y="40" width="30" height="30" rx="5" fill="#fff" stroke="#B2DFDB" strokeWidth="2" />
          <Rect x="89" y="44" width="8" height="22" fill="#E53935" />
          <Rect x="82" y="51" width="22" height="8" fill="#E53935" />
        </G>
      }>
      <Circle cx="48" cy="126" r="10" fill="#4DB6AC" />
      {[[34, 110], [44, 104], [56, 104], [64, 112]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r="4.5" fill="#4DB6AC" />)}
      <Ventana x={112} y={114} w={34} h={30} luz={luz} />
      <Puerta x={70} w={32} h={58} color="#00695C" />
      <Arbusto x={26} y={192} s={0.8} />
      <Arbusto x={150} y={190} s={0.7} />
    </Edificio>
  ),
  // Paradero de los amigos: refugio con techo, banca y letrero de BUS.
  paradero: (luz) => (
    <G>
      <Path d="M24 188 L132 188 L150 178 L42 178 Z" fill="#000" opacity="0.12" />
      <Rect x="26" y="80" width="8" height="108" fill="#7986CB" />
      <Rect x="116" y="80" width="8" height="108" fill="#5C6BC0" />
      <Rect x="34" y="88" width="82" height="56" fill="#E8EAF6" opacity="0.55" />
      <Path d="M36 130 L70 92 H80 L44 136 Z" fill="#fff" opacity="0.4" />
      <Path d="M16 70 H134 L142 64 H24 Z" fill="#3F51B5" />
      <Rect x="16" y="70" width="118" height="10" rx="3" fill="#5C6BC0" />
      <Rect x="36" y="150" width="78" height="8" rx="3" fill="#8D6E63" />
      <Rect x="40" y="158" width="5" height="30" fill="#6D4C41" /><Rect x="106" y="158" width="5" height="30" fill="#6D4C41" />
      <Line x1="160" y1="60" x2="160" y2="190" stroke="#9E9E9E" strokeWidth="6" />
      <Line x1="158" y1="62" x2="158" y2="188" stroke="#fff" strokeOpacity="0.4" strokeWidth="1.5" />
      {luz && <Circle cx="160" cy="54" r="34" fill="#FFF59D" opacity="0.3" />}
      <Circle cx="160" cy="54" r="22" fill="#FDD835" stroke="#fff" strokeWidth="4" />
      <SvgText x="160" y="61" fontSize="18" fontWeight="bold" fill="#3B2F5C" textAnchor="middle">BUS</SvgText>
      <Polygon points="150,190 170,190 166,186 154,186" fill="#757575" />
    </G>
  ),
};
