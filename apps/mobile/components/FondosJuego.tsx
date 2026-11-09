import { useWindowDimensions, View } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect, Text as SvgText } from "react-native-svg";
import { ASTRO_VENTANA, CIELO_VENTANA, useMomento } from "../lib/hora";
import { MariposaVolando, Nube, Reloj, Sol } from "./Ambiente";
import { AnimalVivo } from "./AnimalesVivos";
import { LuzDelDia } from "./LuzDelDia";
import { AmbienteFondo, VinetaEscena, type Ventana } from "./AmbienteInterior";

/**
 * Fondos para los juegos por dentro: el lugar donde ocurre el juego se ve
 * detrás (la sala de clases, la cocina de la abuela, la pieza, el baño, el
 * campo o el huerto). Los adornos van en los bordes y abajo para que el
 * centro, donde están la pregunta y las tarjetas, quede despejado.
 * Mundo de 1100×700 unidades que cubre la pantalla apoyado abajo.
 */
export type TemaFondo = "aula" | "cocina" | "pieza" | "bano" | "campo" | "huerto" | "tienda" | "sala" | "arenero";

const ANCHO = 1100, ALTO = 700;
const EXTERIOR: TemaFondo[] = ["campo", "huerto", "arenero"];
/** Ventana de cada lugar (por donde entra el rayo de luz) y hacia dónde cae. */
const VENTANAS: Partial<Record<TemaFondo, { v: Ventana; dir: 1 | -1 }>> = {
  aula: { v: { x: 40, y: 200, w: 150, h: 130 }, dir: 1 },
  cocina: { v: { x: 900, y: 190, w: 160, h: 140 }, dir: -1 },
  pieza: { v: { x: 40, y: 190, w: 150, h: 140 }, dir: 1 },
  bano: { v: { x: 930, y: 190, w: 130, h: 110 }, dir: -1 },
  tienda: { v: { x: 40, y: 170, w: 150, h: 150 }, dir: 1 },
  sala: { v: { x: 920, y: 180, w: 150, h: 140 }, dir: -1 },
};

export function FondoJuego({ tema, acento = "#1E88E5" }: { tema: TemaFondo; acento?: string }) {
  const { width, height } = useWindowDimensions();
  const k = Math.max(width / ANCHO, height / ALTO);
  const momento = useMomento();
  const cielo = CIELO_VENTANA[momento], astro = ASTRO_VENTANA[momento];
  const Dibujo = { aula: Aula, cocina: Cocina, pieza: Pieza, bano: Bano, campo: Campo, huerto: Huerto, tienda: Tienda, sala: Sala, arenero: Arenero }[tema];
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width, height, overflow: "hidden" }}>
      <View style={{ position: "absolute", left: (width - ANCHO * k) / 2, top: height - ALTO * k, width: ANCHO * k, height: ALTO * k }}>
        <Svg width={ANCHO * k} height={ALTO * k} viewBox={`0 0 ${ANCHO} ${ALTO}`}>
          <Dibujo cielo={cielo} astro={astro} acento={acento} />
        </Svg>
        {VENTANAS[tema] && <AmbienteFondo k={k} ancho={ANCHO} alto={ALTO} muro={600} ventana={VENTANAS[tema]!.v} dir={VENTANAS[tema]!.dir} />}
        <Vida tema={tema} k={k} />
        <VinetaEscena k={k} ancho={ANCHO} alto={ALTO} zIndex={1} />
        <LuzDelDia k={k} ancho={ANCHO} alto={ALTO} interior={!EXTERIOR.includes(tema)} cielo={EXTERIOR.includes(tema) ? 300 : 0} zIndex={1} />
      </View>
    </View>
  );
}

/** Lo que se mueve en cada fondo. */
function Vida({ tema, k }: { tema: TemaFondo; k: number }) {
  if (tema === "aula") return <Reloj k={k} x={980} y={170} r={26} />;
  if (tema === "cocina") return <Reloj k={k} x={120} y={170} r={26} />;
  if (tema === "pieza") return <View style={{ position: "absolute", left: 900 * k, top: 610 * k }}><AnimalVivo id="gato" alto={50 * k} /></View>;
  if (tema === "campo") {
    return (
      <>
        <Sol k={k} x={980} y={150} r={40} />
        <Nube escala={k} ancho={ANCHO} y={110} ms={80000} retraso={0} tam={150} sombra={false} />
        <View style={{ position: "absolute", left: 60 * k, top: 560 * k }}><AnimalVivo id="vaca" alto={90 * k} /></View>
        <View style={{ position: "absolute", left: 950 * k, top: 600 * k }}><AnimalVivo id="gallina" alto={50 * k} /></View>
      </>
    );
  }
  if (tema === "arenero") {
    return (
      <>
        <Sol k={k} x={980} y={150} r={40} />
        <Nube escala={k} ancho={ANCHO} y={120} ms={80000} retraso={5000} tam={150} sombra={false} />
        <MariposaVolando escala={k} x={150} y={520} fase={2} />
      </>
    );
  }
  if (tema === "sala") return <><Reloj k={k} x={560} y={150} r={24} /><View style={{ position: "absolute", left: 90 * k, top: 600 * k }}><AnimalVivo id="gato" alto={46 * k} /></View></>;
  if (tema === "huerto") {
    return (
      <>
        <Sol k={k} x={120} y={150} r={40} />
        <Nube escala={k} ancho={ANCHO} y={120} ms={85000} retraso={10000} tam={140} sombra={false} />
        <MariposaVolando escala={k} x={140} y={560} fase={1} />
        <MariposaVolando escala={k} x={980} y={540} fase={3} />
      </>
    );
  }
  return null;
}

type P = { cielo: string; astro: string; acento?: string };

function Ventana({ x, y, w, h, cielo, astro, marco = "#fff" }: P & { x: number; y: number; w: number; h: number; marco?: string }) {
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} rx="6" fill={cielo} stroke={marco} strokeWidth="8" />
      <Circle cx={x + w * 0.72} cy={y + h * 0.3} r={Math.min(w, h) * 0.12} fill={astro} />
      <Path d={`M${x + 4} ${y + h - 16} Q${x + w * 0.35} ${y + h - 40} ${x + w * 0.65} ${y + h - 20} Q${x + w * 0.85} ${y + h - 30} ${x + w - 4} ${y + h - 18} V${y + h - 4} H${x + 4} Z`} fill="#81C784" />
      <Path d={`M${x + w / 2} ${y + 4} V${y + h - 4} M${x + 4} ${y + h / 2} H${x + w - 4}`} stroke={marco} strokeWidth="5" />
    </G>
  );
}

function PisoMadera({ y, color = "#E6C08F", linea = "#D4A86F" }: { y: number; color?: string; linea?: string }) {
  return (
    <G>
      <Rect x="0" y={y} width={ANCHO} height={ALTO - y} fill={color} />
      {Array.from({ length: 5 }, (_, i) => <Line key={i} x1="0" y1={y + 22 + i * 26} x2={ANCHO} y2={y + 22 + i * 26} stroke={linea} strokeWidth="2" />)}
    </G>
  );
}

function Planta({ x, y }: { x: number; y: number }) {
  return (
    <G>
      {[-30, -10, 10, 30].map((a, i) => <Ellipse key={a} cx={x + a * 0.6} cy={y - 50 - (i % 2) * 14} rx="12" ry="34" fill={i % 2 ? "#66BB6A" : "#43A047"} transform={`rotate(${a} ${x} ${y - 20})`} />)}
      <Path d={`M${x - 26} ${y - 22} H${x + 26} L${x + 20} ${y} H${x - 20} Z`} fill="#E57373" />
    </G>
  );
}

// ---------- Sala de clases ----------
function Aula({ cielo, astro }: P) {
  const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
  return (
    <G>
      <Rect x="0" y="0" width={ANCHO} height={ALTO} fill="#FFF3C4" />
      <Rect x="0" y="470" width={ANCHO} height="130" fill="#FFE082" />
      <Rect x="0" y="466" width={ANCHO} height="8" fill="#FFCA28" />
      <Path d="M0 120 Q550 160 1100 120" stroke="#8D6E63" strokeWidth="2" fill="none" />
      {letras.map((l, i) => {
        const x = 20 + i * 39.5, y = 120 + Math.sin((i / (letras.length - 1)) * Math.PI) * 26;
        return (
          <G key={l}>
            <Polygon points={`${x - 14},${y} ${x + 14},${y} ${x},${y + 30}`} fill={["#EF5350", "#42A5F5", "#66BB6A", "#FFCA28", "#AB47BC"][i % 5]} opacity="0.85" />
            <SvgText x={x} y={y + 16} fontSize="13" fontWeight="bold" fill="#fff" textAnchor="middle">{l}</SvgText>
          </G>
        );
      })}
      <Ventana x={40} y={200} w={150} h={130} cielo={cielo} astro={astro} />
      {/* Estante con libros a la izquierda */}
      <Rect x="30" y="400" width="170" height="200" rx="6" fill="#A1887F" />
      {[460, 530].map((y) => <Rect key={y} x="36" y={y} width="158" height="6" fill="#6D4C41" />)}
      {Array.from({ length: 10 }, (_, i) => <Rect key={i} x={42 + (i % 5) * 30} y={i < 5 ? 414 : 484} width="22" height="46" rx="3" fill={["#EF5350", "#42A5F5", "#66BB6A", "#FFCA28", "#AB47BC"][i % 5]} />)}
      <Circle cx="80" cy="565" r="18" fill="#29B6F6" /><Rect x="130" y="548" width="40" height="36" rx="4" fill="#FF7043" />
      {/* Números en la pared derecha y planta */}
      <Rect x="900" y="240" width="170" height="110" rx="6" fill="#fff" stroke="#8D6E63" strokeWidth="5" />
      <SvgText x="985" y="290" fontSize="30" fontWeight="bold" fill="#42A5F5" textAnchor="middle">1 2 3</SvgText>
      <SvgText x="985" y="330" fontSize="26" fontWeight="bold" fill="#EF5350" textAnchor="middle">A B C</SvgText>
      <Planta x={1000} y={600} />
      <PisoMadera y={600} />
    </G>
  );
}

// ---------- Cocina de la abuela Nina ----------
function Cocina({ cielo, astro }: P) {
  return (
    <G>
      <Rect x="0" y="0" width={ANCHO} height={ALTO} fill="#FFF59D" />
      {Array.from({ length: 37 }, (_, i) => <Rect key={i} x={i * 30} y="420" width="28" height="28" fill={i % 2 ? "#fff" : "#FFE082"} />)}
      {/* Repisa con frascos arriba */}
      <Rect x="0" y="230" width="230" height="10" fill="#A1887F" />
      {[["#FFB74D", 30], ["#A5D6A7", 80], ["#FFCC80", 130], ["#EF9A9A", 180]].map(([c, x]) => (
        <G key={x as number}><Rect x={x as number} y="196" width="30" height="34" rx="6" fill={c as string} /><Rect x={(x as number) - 2} y="190" width="34" height="8" rx="3" fill="#8D6E63" /></G>
      ))}
      <Ventana x={900} y={190} w={160} h={140} cielo={cielo} astro={astro} />
      <Path d="M890 182 Q910 260 896 340 L912 340 Q924 260 908 182 Z" fill="#EF9A9A" />
      <Path d="M1070 182 Q1050 260 1064 340 L1048 340 Q1036 260 1052 182 Z" fill="#EF9A9A" />
      {/* Mesón y fogón con olla */}
      <Rect x="0" y="448" width="240" height="152" fill="#BCAAA4" />
      <Rect x="0" y="440" width="250" height="12" fill="#8D6E63" />
      <Rect x="30" y="470" width="80" height="110" rx="4" fill="#A1887F" /><Rect x="130" y="470" width="80" height="110" rx="4" fill="#A1887F" />
      <Path d="M60 440 Q100 400 140 440 Z" fill="#E53935" /><Rect x="54" y="436" width="92" height="8" rx="3" fill="#C62828" />
      {/* Canasto con frutas a la derecha */}
      <Rect x="880" y="452" width="200" height="148" fill="#BCAAA4" />
      <Rect x="870" y="440" width="230" height="12" fill="#8D6E63" />
      <Path d="M920 440 Q980 470 1040 440 L1030 410 H930 Z" fill="#D7A86E" stroke="#A1887F" strokeWidth="3" />
      {[["#E53935", 950], ["#FDD835", 980], ["#FB8C00", 1010], ["#66BB6A", 965], ["#E53935", 995]].map(([c, x], i) => <Circle key={i} cx={x as number} cy={i < 3 ? 410 : 396} r="14" fill={c as string} />)}
      <PisoMadera y={600} color="#D7A86E" linea="#C49358" />
    </G>
  );
}

// ---------- Pieza de Emilia ----------
function Pieza({ cielo, astro }: P) {
  return (
    <G>
      <Rect x="0" y="0" width={ANCHO} height={ALTO} fill="#F8BBD0" />
      {Array.from({ length: 30 }, (_, i) => <Circle key={i} cx={(i * 137) % ANCHO} cy={130 + ((i * 89) % 440)} r="5" fill="#fff" opacity="0.5" />)}
      <Ventana x={40} y={190} w={150} h={140} cielo={cielo} astro={astro} />
      <Path d="M30 180 Q46 260 32 344 L50 344 Q60 260 48 180 Z" fill="#CE93D8" />
      <Path d="M200 180 Q184 260 198 344 L180 344 Q170 260 182 180 Z" fill="#CE93D8" />
      {/* Ropero abierto con perchas a la derecha */}
      <Rect x="880" y="200" width="200" height="400" rx="10" fill="#A1887F" />
      <Rect x="895" y="215" width="170" height="370" rx="6" fill="#EFEBE9" />
      <Line x1="900" y1="250" x2="1060" y2="250" stroke="#8D6E63" strokeWidth="5" />
      {[["#42A5F5", 920], ["#EF5350", 975], ["#FFCA28", 1030]].map(([c, x]) => (
        <G key={x as number}>
          <Path d={`M${x} 250 l-14 14 h28 Z`} fill="none" stroke="#90A4AE" strokeWidth="2" />
          <Path d={`M${(x as number) - 20} 264 h40 l8 14 -8 4 v60 h-40 v-60 l-8 -4 Z`} fill={c as string} />
        </G>
      ))}
      <Rect x="905" y="520" width="60" height="40" rx="6" fill="#8D6E63" /><Rect x="995" y="520" width="60" height="40" rx="6" fill="#8D6E63" />
      {/* Borde de la cama con osito a la izquierda */}
      <Rect x="0" y="470" width="220" height="130" rx="10" fill="#CE93D8" />
      <Ellipse cx="60" cy="470" rx="50" ry="20" fill="#FFF9C4" />
      <Circle cx="160" cy="450" r="20" fill="#BCAAA4" /><Circle cx="146" cy="434" r="8" fill="#BCAAA4" /><Circle cx="174" cy="434" r="8" fill="#BCAAA4" />
      <Circle cx="154" cy="448" r="2.5" fill="#3E2723" /><Circle cx="166" cy="448" r="2.5" fill="#3E2723" />
      <PisoMadera y={600} color="#D7A86E" linea="#C49358" />
      <Ellipse cx="550" cy="660" rx="260" ry="30" fill="#EF9A9A" opacity="0.7" />
    </G>
  );
}

// ---------- Baño ----------
function Bano({ cielo, astro }: P) {
  return (
    <G>
      <Rect x="0" y="0" width={ANCHO} height={ALTO} fill="#B3E5FC" />
      {Array.from({ length: 19 }, (_, i) => <Line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2="600" stroke="#81D4FA" strokeWidth="2" />)}
      {Array.from({ length: 12 }, (_, i) => <Line key={`h${i}`} x1="0" y1={i * 50} x2={ANCHO} y2={i * 50} stroke="#81D4FA" strokeWidth="2" />)}
      <Ventana x={930} y={190} w={130} h={110} cielo={cielo} astro={astro} />
      {/* Toalla y repisa con jabones */}
      <Rect x="40" y="200" width="160" height="6" rx="3" fill="#90A4AE" />
      <Path d="M50 206 H190 V320 Q120 332 50 320 Z" fill="#F48FB1" />
      {[240, 270, 300].map((y) => <Path key={y} d={`M50 ${y} H190`} stroke="#fff" strokeWidth="5" />)}
      <Rect x="900" y="400" width="180" height="10" fill="#B0BEC5" />
      <Rect x="920" y="372" width="30" height="28" rx="6" fill="#F48FB1" /><Rect x="965" y="360" width="26" height="40" rx="6" fill="#80DEEA" /><Rect x="1005" y="378" width="40" height="22" rx="8" fill="#FFF59D" />
      {/* Tina con burbujas */}
      <Path d="M0 470 H220 Q220 600 110 600 H0 Z" fill="#fff" stroke="#B0BEC5" strokeWidth="4" />
      {[[40, 462], [80, 452], [120, 466], [160, 456], [60, 440]].map(([x, y]) => <Circle key={x} cx={x} cy={y} r="16" fill="#E1F5FE" stroke="#fff" strokeWidth="2" />)}
      <Ellipse cx="150" cy="446" rx="16" ry="11" fill="#FFEB3B" /><Circle cx="160" cy="432" r="8" fill="#FFEB3B" /><Path d="M167 432 l8 2 -8 3 Z" fill="#FF7043" />
      <Rect x="0" y="600" width={ANCHO} height="100" fill="#E0F7FA" />
      {Array.from({ length: 12 }, (_, i) => <Line key={i} x1={i * 100} y1="600" x2={i * 100} y2="700" stroke="#B2EBF2" strokeWidth="2" />)}
    </G>
  );
}

// ---------- Campo de la granja ----------
function Campo(_: P) {
  return (
    <G>
      <Rect x="0" y="0" width={ANCHO} height={ALTO} fill="#B3E5FC" />
      <Path d="M0 470 Q200 380 420 450 Q650 370 880 450 Q1000 410 1100 440 V700 H0 Z" fill="#AED581" />
      <Rect x="0" y="560" width={ANCHO} height="140" fill="#9CCC65" />
      {/* Granero a la izquierda */}
      <Rect x="20" y="380" width="180" height="180" fill="#C62828" />
      <Path d="M0 390 L110 300 L220 390 Z" fill="#8E0000" />
      <Rect x="70" y="460" width="80" height="100" fill="#FFF8E1" />
      <Path d="M70 460 L150 560 M150 460 L70 560" stroke="#C62828" strokeWidth="6" />
      <Rect x="90" y="340" width="40" height="34" fill="#FFF8E1" />
      {/* Reja */}
      {Array.from({ length: 30 }, (_, i) => 220 + i * 30).map((x) => <Rect key={x} x={x} y="520" width="10" height="50" fill="#D7CCC8" stroke="#A1887F" strokeWidth="1" />)}
      <Rect x="210" y="530" width="900" height="8" fill="#BCAAA4" /><Rect x="210" y="552" width="900" height="8" fill="#BCAAA4" />
      {/* Pajar y árbol a la derecha */}
      <Ellipse cx="1000" cy="540" rx="80" ry="40" fill="#FFD54F" />
      {[960, 990, 1020, 1050].map((x) => <Line key={x} x1={x} y1="510" x2={x + 8} y2="570" stroke="#FFB300" strokeWidth="2" />)}
      <Rect x="920" y="380" width="16" height="120" fill="#6D4C41" />
      <Circle cx="928" cy="360" r="50" fill="#43A047" />
    </G>
  );
}

// ---------- Huerto ----------
function Huerto(_: P) {
  return (
    <G>
      <Rect x="0" y="0" width={ANCHO} height={ALTO} fill="#B3E5FC" />
      <Path d="M0 460 Q260 400 540 450 Q820 400 1100 450 V700 H0 Z" fill="#C5E1A5" />
      <Rect x="0" y="540" width={ANCHO} height="160" fill="#8D6E63" />
      {Array.from({ length: 4 }, (_, i) => <Path key={i} d={`M0 ${560 + i * 36} Q550 ${552 + i * 36} 1100 ${560 + i * 36}`} stroke="#6D4C41" strokeWidth="10" fill="none" />)}
      {/* Zanahorias y lechugas en los bordes */}
      {[40, 100, 160, 940, 1000, 1060].map((x, i) => (
        <G key={x}>
          {i % 2 ? (
            <G><Circle cx={x} cy="548" r="20" fill="#7CB342" /><Circle cx={x - 10} cy="542" r="12" fill="#9CCC65" /><Circle cx={x + 10} cy="544" r="12" fill="#8BC34A" /></G>
          ) : (
            <G><Path d={`M${x - 8} 552 L${x} 590 L${x + 8} 552 Z`} fill="#FB8C00" />{[-8, 0, 8].map((d) => <Path key={d} d={`M${x} 552 Q${x + d} 530 ${x + d * 1.5} 518`} stroke="#43A047" strokeWidth="4" fill="none" />)}</G>
          )}
        </G>
      ))}
      {/* Espantapájaros a la izquierda y regadera a la derecha */}
      <Rect x="96" y="370" width="8" height="170" fill="#8D6E63" />
      <Rect x="50" y="410" width="100" height="8" fill="#8D6E63" />
      <Path d="M72 418 H128 L124 480 H76 Z" fill="#1E88E5" />
      <Circle cx="100" cy="392" r="20" fill="#FFE0B2" />
      <Path d="M74 384 H126 L116 364 H84 Z" fill="#FBC02D" />
      <Path d="M960 520 h70 v-50 h-70 Z" fill="#26A69A" />
      <Path d="M1030 480 L1070 450" stroke="#26A69A" strokeWidth="8" strokeLinecap="round" />
      <Path d="M975 470 Q995 440 1015 470" stroke="#00897B" strokeWidth="5" fill="none" />
    </G>
  );
}

// ---------- Tienda de disfraces ----------
function Tienda({ cielo, astro }: P) {
  return (
    <G>
      <Rect x="0" y="0" width={ANCHO} height={ALTO} fill="#F8BBD0" />
      {Array.from({ length: 22 }, (_, i) => <Rect key={i} x={i * 50} y="0" width="25" height="600" fill="#F48FB1" opacity="0.25" />)}
      <Ventana x={40} y={170} w={150} h={150} cielo={cielo} astro={astro} marco="#FCE4EC" />
      {/* Barra con disfraces colgados */}
      <Rect x="20" y="380" width="200" height="8" rx="4" fill="#8D6E63" />
      {[["#7E57C2", 45], ["#FDD835", 95], ["#26A69A", 145], ["#E53935", 190]].map(([c, x]) => (
        <G key={x as number}>
          <Path d={`M${x} 388 l-10 10 h20 Z`} fill="none" stroke="#90A4AE" strokeWidth="2" />
          <Path d={`M${(x as number) - 18} 398 h36 l8 70 h-52 Z`} fill={c as string} />
          <Path d={`M${(x as number) - 18} 398 h36 l8 70 h-52 Z`} fill="#000" opacity="0.08" />
          <Path d={`M${(x as number) - 14} 402 l6 60`} stroke="#fff" strokeOpacity="0.3" strokeWidth="3" />
        </G>
      ))}
      <Rect x="20" y="470" width="8" height="130" fill="#8D6E63" /><Rect x="212" y="470" width="8" height="130" fill="#8D6E63" />
      {/* Espejo y probador con cortina */}
      <Rect x="880" y="200" width="90" height="300" rx="45" fill="#FFF8E1" stroke="#FFB300" strokeWidth="8" />
      <Rect x="890" y="210" width="70" height="280" rx="35" fill="#E1F5FE" />
      <Path d="M900 300 L930 230 H945 L912 320 Z" fill="#fff" opacity="0.6" />
      <Rect x="985" y="150" width="105" height="10" fill="#8D6E63" />
      <Path d="M988 160 Q1000 380 990 600 H1090 Q1080 380 1088 160 Z" fill="#AD1457" />
      {[1010, 1035, 1060].map((x) => <Path key={x} d={`M${x} 162 Q${x + 6} 380 ${x - 2} 598`} stroke="#880E4F" strokeWidth="3" fill="none" />)}
      {/* Estrellitas y sombreros en repisa */}
      <Rect x="880" y="140" width="0" height="0" fill="none" />
      {[[300, 130], [420, 90], [700, 110], [800, 150]].map(([x, y]) => <Path key={x} d={`M${x} ${y! - 9} l2.6 6 6.6 .7 -5 4.4 1.5 6.4 -5.7 -3.4 -5.7 3.4 1.5 -6.4 -5 -4.4 6.6 -.7 Z`} fill="#FFF59D" />)}
      <PisoMadera y={600} color="#D7A86E" linea="#C49358" />
      <Ellipse cx="550" cy="660" rx="300" ry="30" fill="#CE93D8" opacity="0.6" />
    </G>
  );
}

// ---------- Living de la casa de un amigo ----------
function Sala({ cielo, astro, acento = "#1E88E5" }: P) {
  return (
    <G>
      <Rect x="0" y="0" width={ANCHO} height={ALTO} fill="#FFF8E1" />
      {Array.from({ length: 23 }, (_, i) => <Rect key={i} x={i * 48} y="0" width="3" height="600" fill={acento} opacity="0.12" />)}
      <Rect x="0" y="560" width={ANCHO} height="40" fill={acento} opacity="0.25" />
      <Ventana x={920} y={180} w={150} h={140} cielo={cielo} astro={astro} />
      <Path d="M910 172 Q926 250 912 330 L930 330 Q940 250 928 172 Z" fill={acento} opacity="0.7" />
      <Path d="M1080 172 Q1064 250 1078 330 L1060 330 Q1050 250 1062 172 Z" fill={acento} opacity="0.7" />
      {/* Cuadros */}
      <Rect x="230" y="150" width="70" height="56" fill="#fff" stroke="#8D6E63" strokeWidth="5" />
      <Path d="M236 200 L256 176 L270 190 L282 172 L294 200 Z" fill="#81C784" />
      <Circle cx="282" cy="164" r="6" fill="#FFCA28" />
      <Rect x="770" y="150" width="56" height="70" fill="#fff" stroke="#8D6E63" strokeWidth="5" />
      <Circle cx="798" cy="178" r="12" fill={acento} opacity="0.6" />
      {/* Sofá a la izquierda */}
      <Rect x="0" y="470" width="220" height="110" rx="20" fill={acento} />
      <Rect x="0" y="470" width="220" height="110" rx="20" fill="#000" opacity="0.12" />
      <Rect x="10" y="420" width="200" height="70" rx="18" fill={acento} />
      <Rect x="20" y="430" width="90" height="10" rx="5" fill="#fff" opacity="0.25" />
      <Rect x="40" y="440" width="60" height="44" rx="10" fill="#FFCA28" />
      {/* Lámpara de pie y planta a la derecha */}
      <Rect x="1000" y="420" width="6" height="180" fill="#5D4037" />
      <Path d="M968 420 L1038 420 L1024 370 L982 370 Z" fill="#FFE082" />
      <Ellipse cx="1003" cy="600" rx="24" ry="6" fill="#5D4037" />
      <Planta x={900} y={600} />
      <PisoMadera y={600} color="#D7A86E" linea="#C49358" />
      <Ellipse cx="550" cy="660" rx="300" ry="30" fill={acento} opacity="0.3" />
    </G>
  );
}

// ---------- Arenero del parque ----------
function Arenero(_: P) {
  return (
    <G>
      <Rect x="0" y="0" width={ANCHO} height={ALTO} fill="#B3E5FC" />
      <Path d="M0 460 Q260 390 540 450 Q820 390 1100 450 V700 H0 Z" fill="#AED581" />
      {[[70, 420, 50], [1040, 410, 56], [900, 440, 40]].map(([x, y, r]) => (
        <G key={x}>
          <Rect x={x! - 7} y={y} width="14" height="70" fill="#6D4C41" />
          <Circle cx={x} cy={y! - 10} r={r} fill="#43A047" />
          <Circle cx={x! - r! * 0.3} cy={y! - r! * 0.5} r={r! * 0.35} fill="#fff" opacity="0.15" />
        </G>
      ))}
      <Rect x="0" y="520" width={ANCHO} height="180" fill="#8BC34A" />
      {/* Borde de madera y arena */}
      <Rect x="30" y="540" width="1040" height="160" rx="16" fill="#A1887F" />
      <Rect x="44" y="552" width="1012" height="148" rx="12" fill="#FFE0B2" />
      {Array.from({ length: 120 }, (_, i) => <Circle key={i} cx={60 + ((i * 167.3) % 980)} cy={560 + ((i * 53.7) % 130)} r={i % 3 ? 1.4 : 2.2} fill={i % 2 ? "#E0B97F" : "#FFF3DC"} />)}
      {/* Balde y pala */}
      <Path d="M120 600 h50 l-6 46 h-38 Z" fill="#E53935" />
      <Path d="M122 600 q23 -26 46 0" stroke="#B71C1C" strokeWidth="3" fill="none" />
      <Rect x="960" y="560" width="8" height="70" rx="3" fill="#1E88E5" transform="rotate(25 964 595)" />
      <Path d="M980 630 q12 6 6 22 q-14 2 -20 -10 Z" fill="#1E88E5" />
    </G>
  );
}
