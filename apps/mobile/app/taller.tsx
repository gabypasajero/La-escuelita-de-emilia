import { router, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from "react-native-svg";
import { LamparaColgante, MariposaVolando, Reloj } from "../components/Ambiente";
import { EscenaRPG, type ObjetoEscena } from "../components/EscenaRPG";
import { Adulto } from "../components/Personas";
import { hablar } from "../lib/voz";

const JUEGOS: Record<string, { ruta: Href; frase: string }> = {
  Pintar: { ruta: "/pintar", frase: "¡Al caballete! Pinta lo que tú quieras." },
  Colores: { ruta: "/descubrir/colores", frase: "¡A jugar con los colores de los frascos!" },
  Formas: { ruta: "/descubrir/formas", frase: "¡Círculos, cuadrados y triángulos de papel!" },
  "¿Qué sigue?": { ruta: "/descubrir/patrones", frase: "¡Armemos collares! ¿Qué cuenta sigue?" },
  Trazar: { ruta: "/trazar", frase: "¡Toma un lápiz y dibuja letras con el dedo!" },
};

const CUADROS = [
  "Este es un sol que pintó Emilia. ¡Qué amarillo tan bonito!",
  "Una casita con su chimenea. La pintó Agustín.",
  "¡Un pez en el mar! Lo pintó Gaspar con mucho azul.",
  "Un arcoíris con todos los colores. ¿Los puedes nombrar?",
];

/**
 * El taller de arte para recorrer: el profe Tomás recibe a los niños entre
 * caballetes, frascos de pintura, papeles de colores y una galería con los
 * dibujos del barrio. Del techo cuelga un móvil que se mece.
 */
export default function Taller() {
  const [dicho, setDicho] = useState("¡Bienvenidos al taller de arte! ¿Qué quieres crear hoy?");
  const [profeHabla, setProfeHabla] = useState(true);
  const [cuadro, setCuadro] = useState(0);
  const silencio = useRef<ReturnType<typeof setTimeout> | null>(null);

  const habla = (ms: number) => {
    setProfeHabla(true);
    if (silencio.current) clearTimeout(silencio.current);
    silencio.current = setTimeout(() => setProfeHabla(false), ms);
  };
  useEffect(() => {
    void hablar("¡Bienvenidos al taller de arte! ¿Qué quieres crear hoy?");
    habla(4000);
    return () => { if (silencio.current) clearTimeout(silencio.current); };
  }, []);
  const decir = (t: string) => { setDicho(t); void hablar(t); habla(Math.max(2200, t.length * 70)); };
  const ir = (nombre: string) => () => {
    const j = JUEGOS[nombre]!;
    decir(j.frase);
    setTimeout(() => router.push(j.ruta), 1300);
  };

  const objetos: ObjetoEscena[] = [
    // Pared del fondo
    { id: "galeria", x: 260, y: 330, ancho: 360, alto: 150, etiqueta: "Galería de dibujos", letrero: "Galería", dibujo: (k) => <Galeria k={k} />, llegada: { x: 260, y: 440 },
      alLlegar: () => { decir(CUADROS[cuadro]!); setCuadro((c) => (c + 1) % CUADROS.length); } },
    { id: "profe", x: 560, y: 420, ancho: 100, alto: 190, etiqueta: "Profe Tomás", letrero: "Profe Tomás",
      dibujo: (k) => <Adulto id="artista" alto={180 * k} hablando={profeHabla} />, llegada: { x: 620, y: 450 },
      alLlegar: () => decir("¡Hola, artista! Puedes pintar en el caballete, mezclar colores o recortar formas.") },
    { id: "caballete", x: 800, y: 430, ancho: 170, alto: 230, etiqueta: "Caballete", letrero: "Pintar", dibujo: (k) => <Caballete k={k} />, llegada: { x: 800, y: 460 }, alLlegar: ir("Pintar") },
    { id: "lapices", x: 1000, y: 420, ancho: 120, alto: 160, etiqueta: "Lápices", letrero: "Trazar", dibujo: (k) => <Lapices k={k} />, llegada: { x: 990, y: 450 }, alLlegar: ir("Trazar") },
    // Mesas de trabajo
    { id: "frascos", x: 250, y: 580, ancho: 220, alto: 120, etiqueta: "Mesa de pinturas", letrero: "Colores", dibujo: (k) => <MesaPinturas k={k} />, llegada: { x: 250, y: 610 }, alLlegar: ir("Colores") },
    { id: "papeles", x: 580, y: 590, ancho: 220, alto: 120, etiqueta: "Papeles recortados", letrero: "Formas", dibujo: (k) => <MesaPapeles k={k} />, llegada: { x: 580, y: 620 }, alLlegar: ir("Formas") },
    { id: "cuentas", x: 900, y: 610, ancho: 180, alto: 110, etiqueta: "Collares de cuentas", letrero: "¿Qué sigue?", dibujo: (k) => <Collares k={k} />, llegada: { x: 900, y: 640 }, alLlegar: ir("¿Qué sigue?") },
  ];

  return (
    <EscenaRPG
      fondo={(k) => <SalaArte k={k} />}
      objetos={objetos}
      inicio={{ x: 420, y: 660 }}
      piso={{ xMin: 40, xMax: 1060, yMin: 440, yMax: 690 }}
      dialogo={dicho}
      colorFondo="#F3E5F5"
    />
  );
}

// ---------- Dibujos del taller ----------

function SalaArte({ k }: { k: number }) {
  return (
    <>
      <Svg width={1100 * k} height={700 * k} viewBox="0 0 1100 700">
        {/* Pared lila con manchas de pintura */}
        <Rect x="0" y="0" width="1100" height="420" fill="#F3E5F5" />
        <Rect x="0" y="320" width="1100" height="100" fill="#E1BEE7" />
        <Rect x="0" y="316" width="1100" height="8" fill="#CE93D8" />
        {[[60, 60, "#FFCC80"], [1040, 90, "#80DEEA"], [700, 40, "#A5D6A7"], [140, 250, "#F48FB1"], [1000, 270, "#FFF59D"]].map(([x, y, c]) => (
          <Path key={x as number} d={`M${x} ${y} q12 -16 24 -4 q16 -6 14 12 q12 10 -4 18 q-4 16 -18 6 q-16 6 -16 -10 q-12 -10 0 -22 Z`} fill={c as string} opacity="0.55" />
        ))}
        {/* Ventanal con luz */}
        <Rect x="440" y="60" width="240" height="150" rx="8" fill="#B3E5FC" stroke="#fff" strokeWidth="10" />
        <Path d="M444 180 Q500 140 560 176 Q610 150 676 172 V206 H444 Z" fill="#81C784" />
        <Circle cx="640" cy="100" r="16" fill="#FFEB3B" />
        <Path d="M560 64 V206 M444 135 H676" stroke="#fff" strokeWidth="6" />
        <Path d="M440 216 L680 216 L700 232 L420 232 Z" fill="#CE93D8" />
        {/* Repisa con macetero de pinceles y rollos de papel */}
        <Rect x="760" y="150" width="240" height="10" fill="#8D6E63" />
        <Rect x="780" y="118" width="34" height="32" rx="4" fill="#90CAF9" />
        {[["#E53935", -10], ["#FDD835", 0], ["#43A047", 10]].map(([c, d]) => (
          <G key={c as string}><Line x1={797 + (d as number) * 0.6} y1="120" x2={797 + (d as number) * 1.6} y2="88" stroke="#A1887F" strokeWidth="3" /><Ellipse cx={797 + (d as number) * 1.6} cy="86" rx="3" ry="6" fill={c as string} /></G>
        ))}
        {["#FFAB91", "#B39DDB", "#80CBC4"].map((c, i) => <Rect key={c} x={840 + i * 26} y="104" width="20" height="46" rx="10" fill={c} />)}
        <Rect x="930" y="122" width="50" height="28" rx="3" fill="#FFE082" />
        <Rect x="936" y="112" width="40" height="12" rx="3" fill="#FFCC80" />
        {/* Piso de baldosas con gotitas */}
        <Rect x="0" y="420" width="1100" height="280" fill="#ECEFF1" />
        {Array.from({ length: 12 }, (_, i) => <Line key={`v${i}`} x1={i * 100} y1="420" x2={i * 100} y2="700" stroke="#CFD8DC" strokeWidth="2" />)}
        {Array.from({ length: 5 }, (_, i) => <Line key={`h${i}`} x1="0" y1={470 + i * 55} x2="1100" y2={470 + i * 55} stroke="#CFD8DC" strokeWidth="2" />)}
        {[[120, 520, "#E53935"], [430, 660, "#1E88E5"], [720, 500, "#FDD835"], [1040, 560, "#8E24AA"], [760, 680, "#43A047"]].map(([x, y, c]) => (
          <Ellipse key={x as number} cx={x as number} cy={y as number} rx="14" ry="6" fill={c as string} opacity="0.35" />
        ))}
        {/* Alfombra de trabajo */}
        <Rect x="330" y="625" width="440" height="60" rx="30" fill="#FFCCBC" opacity="0.6" />
      </Svg>
      <Reloj k={k} x={1050} y={205} r={24} />
      <Movil k={k} x={310} y={0} />
      <LamparaColgante k={k} x={860} y={0} largo={50} color="#AB47BC" />
      <MariposaVolando escala={k} x={520} y={110} fase={2} />
    </>
  );
}

/** Móvil de papel que cuelga del techo y se mece de un lado a otro. */
function Movil({ k, x, y }: { k: number; x: number; y: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const b = Animated.loop(Animated.sequence([
      Animated.timing(t, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      Animated.timing(t, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
    ]));
    b.start();
    return () => b.stop();
  }, [t]);
  const w = 200, h = 300;
  return (
    <Animated.View pointerEvents="none" style={{ position: "absolute", left: (x - w / 2) * k, top: (y - h / 2) * k, width: w * k, height: h * k, transform: [{ rotate: t.interpolate({ inputRange: [0, 1], outputRange: ["-6deg", "6deg"] }) as never }] }}>
      <Svg width={w * k} height={h * k} viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`}>
        <Line x1="0" y1="0" x2="0" y2="40" stroke="#5D4037" strokeWidth="2" />
        <Line x1="-70" y1="40" x2="70" y2="40" stroke="#8D6E63" strokeWidth="4" strokeLinecap="round" />
        <Line x1="-70" y1="40" x2="-70" y2="80" stroke="#5D4037" strokeWidth="1.5" />
        <Line x1="0" y1="40" x2="0" y2="110" stroke="#5D4037" strokeWidth="1.5" />
        <Line x1="70" y1="40" x2="70" y2="80" stroke="#5D4037" strokeWidth="1.5" />
        <Circle cx="-70" cy="96" r="16" fill="#FFCA28" />
        <Polygon points="0,110 18,140 -18,140" fill="#EF5350" />
        <Path d="M70 80 l5 12 13 1 -10 8 3 13 -11 -7 -11 7 3 -13 -10 -8 13 -1 Z" fill="#42A5F5" />
      </Svg>
    </Animated.View>
  );
}

function Galeria({ k }: { k: number }) {
  return (
    <Svg width={360 * k} height={150 * k} viewBox="0 0 360 150">
      <Line x1="0" y1="8" x2="360" y2="8" stroke="#8D6E63" strokeWidth="3" />
      {/* Sol */}
      <Rect x="6" y="20" width="80" height="100" fill="#FFFDE7" stroke="#FFB300" strokeWidth="5" />
      <Circle cx="46" cy="66" r="18" fill="#FFCA28" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <Line key={a} x1={46 + Math.cos((a * Math.PI) / 180) * 22} y1={66 + Math.sin((a * Math.PI) / 180) * 22} x2={46 + Math.cos((a * Math.PI) / 180) * 30} y2={66 + Math.sin((a * Math.PI) / 180) * 30} stroke="#FFA000" strokeWidth="3" />)}
      {/* Casita */}
      <Rect x="96" y="30" width="80" height="90" fill="#E8F5E9" stroke="#43A047" strokeWidth="5" />
      <Rect x="114" y="74" width="44" height="34" fill="#EF9A9A" />
      <Polygon points="108,76 136,50 164,76" fill="#C62828" />
      <Rect x="148" y="52" width="8" height="14" fill="#6D4C41" />
      <Rect x="130" y="88" width="12" height="20" fill="#6D4C41" />
      {/* Pez */}
      <Rect x="186" y="18" width="80" height="100" fill="#E3F2FD" stroke="#1E88E5" strokeWidth="5" />
      <Ellipse cx="222" cy="68" rx="20" ry="12" fill="#FF7043" />
      <Polygon points="240,68 256,56 256,80" fill="#FF7043" />
      <Circle cx="212" cy="64" r="3" fill="#212121" />
      <Path d="M192 100 Q206 92 220 100 T248 100 T262 100" stroke="#64B5F6" strokeWidth="3" fill="none" />
      {/* Arcoíris */}
      <Rect x="276" y="28" width="80" height="90" fill="#FFF" stroke="#8E24AA" strokeWidth="5" />
      {["#E53935", "#FB8C00", "#FDD835", "#43A047", "#1E88E5", "#8E24AA"].map((c, i) => (
        <Path key={c} d={`M${290 + i * 4} 104 A${26 - i * 4} ${26 - i * 4} 0 0 1 ${342 - i * 4} 104`} stroke={c} strokeWidth="4" fill="none" />
      ))}
      {[46, 136, 226, 316].map((x) => <Circle key={x} cx={x} cy="14" r="4" fill="#E53935" />)}
    </Svg>
  );
}

function Caballete({ k }: { k: number }) {
  return (
    <Svg width={170 * k} height={230 * k} viewBox="0 0 170 230">
      <Path d="M85 6 L30 226 M85 6 L140 226 M85 30 L85 220" stroke="#8D6E63" strokeWidth="8" strokeLinecap="round" />
      <Rect x="20" y="36" width="130" height="110" rx="3" fill="#FFFFFF" stroke="#D7CCC8" strokeWidth="3" />
      {/* Pintura a medio hacer */}
      <Path d="M30 120 Q60 90 90 118 T146 112 V140 H30 Z" fill="#A5D6A7" />
      <Circle cx="120" cy="66" r="14" fill="#FFEE58" />
      <Path d="M44 70 Q56 56 70 70" stroke="#42A5F5" strokeWidth="4" fill="none" />
      <Path d="M70 72 Q80 60 92 72" stroke="#42A5F5" strokeWidth="4" fill="none" />
      <Rect x="14" y="146" width="142" height="10" rx="3" fill="#A1887F" />
      {/* Paleta con colores */}
      <Path d="M40 168 Q20 190 50 204 Q90 214 108 194 Q120 176 96 176 Q86 162 64 162 Q48 162 40 168 Z" fill="#D7A86E" />
      {["#E53935", "#FDD835", "#1E88E5", "#43A047"].map((c, i) => <Circle key={c} cx={50 + i * 14} cy={180 + (i % 2) * 8} r="5" fill={c} />)}
    </Svg>
  );
}

function Lapices({ k }: { k: number }) {
  const colores = ["#E53935", "#FB8C00", "#FDD835", "#43A047", "#1E88E5", "#8E24AA"];
  return (
    <Svg width={120 * k} height={160 * k} viewBox="0 0 120 160">
      <Rect x="20" y="100" width="80" height="58" rx="6" fill="#4DB6AC" />
      {colores.map((c, i) => {
        const x = 28 + i * 12, top = 34 + (i % 3) * 10;
        return (
          <G key={c}>
            <Rect x={x} y={top} width="9" height={104 - top} fill={c} />
            <Polygon points={`${x},${top} ${x + 9},${top} ${x + 4.5},${top - 12}`} fill="#FFE0B2" />
            <Polygon points={`${x + 2.5},${top - 7} ${x + 6.5},${top - 7} ${x + 4.5},${top - 12}`} fill={c} />
          </G>
        );
      })}
      <Rect x="20" y="100" width="80" height="12" fill="#26A69A" />
    </Svg>
  );
}

function Mesa({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Rect x="10" y="50" width="200" height="16" rx="4" fill="#A1887F" />
      <Rect x="24" y="66" width="10" height="52" fill="#8D6E63" />
      <Rect x="186" y="66" width="10" height="52" fill="#8D6E63" />
      {children}
    </>
  );
}

function MesaPinturas({ k }: { k: number }) {
  const frascos = ["#E53935", "#FDD835", "#1E88E5", "#43A047", "#FB8C00", "#8E24AA"];
  return (
    <Svg width={220 * k} height={120 * k} viewBox="0 0 220 120">
      <Mesa>
        {frascos.map((c, i) => (
          <G key={c}>
            <Rect x={22 + i * 30} y="22" width="22" height="28" rx="4" fill="#ECEFF1" opacity="0.9" />
            <Rect x={22 + i * 30} y="32" width="22" height="18" rx="3" fill={c} />
            <Rect x={20 + i * 30} y="18" width="26" height="6" rx="2" fill="#90A4AE" />
          </G>
        ))}
        <Path d="M30 54 q4 20 -2 40" stroke="#E53935" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7" />
      </Mesa>
    </Svg>
  );
}

function MesaPapeles({ k }: { k: number }) {
  return (
    <Svg width={220 * k} height={120 * k} viewBox="0 0 220 120">
      <Mesa>
        <Rect x="30" y="28" width="60" height="24" fill="#FFF59D" transform="rotate(-6 60 40)" />
        <Circle cx="64" cy="34" r="12" fill="#EF5350" />
        <Rect x="104" y="18" width="28" height="28" fill="#42A5F5" transform="rotate(10 118 32)" />
        <Polygon points="156,48 172,18 188,48" fill="#66BB6A" />
        {/* Tijeras */}
        <Circle cx="138" cy="44" r="5" fill="none" stroke="#E91E63" strokeWidth="3" />
        <Circle cx="148" cy="46" r="5" fill="none" stroke="#E91E63" strokeWidth="3" />
        <Path d="M141 40 L160 28 M145 42 L162 34" stroke="#90A4AE" strokeWidth="2.5" />
      </Mesa>
    </Svg>
  );
}

function Collares({ k }: { k: number }) {
  const ciclo = ["#E53935", "#FDD835", "#1E88E5"];
  return (
    <Svg width={180 * k} height={110 * k} viewBox="0 0 180 110">
      <Rect x="14" y="58" width="152" height="46" rx="10" fill="#FFE0B2" stroke="#FFB74D" strokeWidth="4" />
      <Path d="M20 50 Q90 10 160 50" stroke="#795548" strokeWidth="2" fill="none" />
      {Array.from({ length: 9 }, (_, i) => {
        const p = (i + 0.5) / 9, x = 20 + p * 140, y = 50 - Math.sin(p * Math.PI) * 20;
        return <Circle key={i} cx={x} cy={y} r="7" fill={ciclo[i % 3]} />;
      })}
      {ciclo.concat(ciclo).map((c, i) => <Circle key={i} cx={36 + i * 22} cy="82" r="8" fill={c} />)}
    </Svg>
  );
}
