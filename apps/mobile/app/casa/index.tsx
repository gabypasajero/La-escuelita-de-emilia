import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect, Text as SvgText } from "react-native-svg";
import { Reloj } from "../../components/Ambiente";
import { AnimalVivo } from "../../components/AnimalesVivos";
import { EscenaRPG, type EscenaRPGRef, type ObjetoEscena } from "../../components/EscenaRPG";
import { Adulto } from "../../components/Personas";
import { hablar } from "../../lib/voz";
import { ASTRO_VENTANA, CIELO_VENTANA, useMomento } from "../../lib/hora";

/**
 * Casa de Emilia para recorrer (como el barrio): baño, dormitorio y cocina en
 * una sola escena. Cada objeto lleva a una actividad de la vida diaria.
 */
export default function Casa() {
  const [dicho, setDicho] = useState("¡Bienvenidos a mi casa! Toca algo para ir hasta allá.");
  const [durmiendo, setDurmiendo] = useState(false);
  const [ninaHabla, setNinaHabla] = useState(false);
  const silencio = useRef<ReturnType<typeof setTimeout> | null>(null);
  const escena = useRef<EscenaRPGRef>(null);
  useEffect(() => void hablar("¡Bienvenidos a mi casa! Aquí está el baño, mi pieza y la cocina de la abuela Nina."), []);

  const decir = (t: string) => { setDicho(t); void hablar(t); };
  const diceNina = (t: string) => {
    decir(t);
    setNinaHabla(true);
    if (silencio.current) clearTimeout(silencio.current);
    silencio.current = setTimeout(() => setNinaHabla(false), Math.max(2500, t.length * 70));
  };
  const ir = (t: string, ruta: Parameters<typeof router.push>[0]) => () => {
    decir(t);
    setTimeout(() => router.push(ruta), 1200);
  };

  const objetos: ObjetoEscena[] = [
    { id: "lavamanos", x: 120, y: 360, ancho: 170, alto: 220, etiqueta: "Lavamanos", letrero: "Lavarse las manos", dibujo: (k) => <Lavamanos k={k} />,
      alLlegar: ir("¡Vamos a lavarnos las manos!", "/casa/rutina?r=manos") },
    { id: "cepillo", x: 280, y: 330, ancho: 100, alto: 140, etiqueta: "Cepillo de dientes", letrero: "Dientes", dibujo: (k) => <Repisa k={k} />,
      alLlegar: ir("¡A cepillarnos los dientes!", "/casa/rutina?r=dientes") },
    { id: "cama", x: 500, y: 470, ancho: 240, alto: 170, etiqueta: "Cama", letrero: "Hora de dormir", dibujo: (k) => <Cama k={k} />,
      alLlegar: () => {
        setDurmiendo(true);
        decir("Para dormir: pijama, dientes limpios, un cuento… y a la cama. ¡Buenas noches, Tito!");
        setTimeout(() => setDurmiendo(false), 6000);
      } },
    { id: "ropero", x: 690, y: 370, ancho: 130, alto: 210, etiqueta: "Ropero", letrero: "¿Qué me pongo?", dibujo: (k) => <Ropero k={k} />,
      alLlegar: ir("Veamos qué ropa nos ponemos según el clima.", "/casa/ropero") },
    { id: "abuela", x: 1030, y: 400, ancho: 100, alto: 190, etiqueta: "Abuela Nina", letrero: "Abuela Nina",
      dibujo: (k) => <Adulto id="nina" alto={180 * k} hablando={ninaHabla} />, llegada: { x: 980, y: 430 },
      alLlegar: () => diceNina("¡Hola, mi tesoro! Estoy cocinando una sopita. Siéntate en la mesa, que vamos a ver qué es lo más sano.") },
    { id: "mesa", x: 870, y: 520, ancho: 220, alto: 120, etiqueta: "Mesa de la cocina", letrero: "¿Qué es sano?", dibujo: (k) => <Mesa k={k} />,
      alLlegar: () => { diceNina("¡A la mesa! Vamos a ver qué le hace bien a tu cuerpo."); setTimeout(() => router.push("/casa/plato"), 1400); } },
    { id: "puerta", x: 1040, y: 690, ancho: 110, alto: 150, etiqueta: "Puerta al patio", letrero: "Patio de Tito", dibujo: (k) => <Puerta k={k} />,
      llegada: { x: 990, y: 680 }, alLlegar: ir("¡Vamos al patio a jugar con Tito!", "/casa/patio") },
  ];

  return (
    <EscenaRPG
      ref={escena}
      fondo={(k) => <Interior k={k} durmiendo={durmiendo} />}
      objetos={objetos}
      inicio={{ x: 560, y: 640 }}
      piso={{ xMin: 40, xMax: 1060, yMin: 360, yMax: 690 }}
      dialogo={dicho}
      colorFondo="#FFE0B2"
      luz={{ interior: true, luces: [{ x: 530, y: 110, r: 90 }, { x: 935, y: 240, r: 70 }] }}
      extras={(k) => durmiendo ? <Zetas k={k} /> : null}
    />
  );
}

function Interior({ k, durmiendo: dormir }: { k: number; durmiendo: boolean }) {
  // De noche (hora real) la pieza también se ve de noche, con luna en la ventana.
  const momento = useMomento();
  const durmiendo = dormir || momento === "noche";
  return (
    <>
      <Svg width={1100 * k} height={700 * k} viewBox="0 0 1100 700">
        {/* Baño con azulejos */}
        <Rect x="0" y="0" width="360" height="300" fill="#B3E5FC" />
        {Array.from({ length: 7 }, (_, i) => <Path key={i} d={`M0 ${50 * i} H360 M${60 * i} 0 V300`} stroke="#81D4FA" strokeWidth="2" />)}
        <Rect x="0" y="230" width="360" height="70" fill="#4FC3F7" opacity="0.35" />
        {/* Toallero con toalla a rayas */}
        <Rect x="245" y="44" width="90" height="6" rx="3" fill="#90A4AE" />
        <Path d="M252 50 H328 V120 Q290 128 252 120 Z" fill="#F48FB1" />
        {[70, 90, 110].map((y) => <Path key={y} d={`M252 ${y} H328`} stroke="#fff" strokeWidth="4" />)}
        {/* Pieza de Emilia: papel mural con estrellitas */}
        <Rect x="360" y="0" width="390" height="300" fill={durmiendo ? "#3949AB" : "#F8BBD0"} />
        {Array.from({ length: 12 }, (_, i) => (
          <Path key={i} d={estrella(385 + (i % 6) * 66, 40 + Math.floor(i / 6) * 150 + (i % 2) * 40, 7)} fill={durmiendo ? "#FFF59D" : "#fff"} opacity={durmiendo ? 0.9 : 0.6} />
        ))}
        {/* Guirnalda de banderitas */}
        <Path d="M366 14 Q555 50 744 14" stroke="#8D6E63" strokeWidth="2" fill="none" />
        {Array.from({ length: 9 }, (_, i) => {
          const x = 386 + i * 42, y = 14 + Math.sin(((i + 0.5) / 9) * Math.PI) * 18;
          return <Polygon key={i} points={`${x - 10},${y} ${x + 10},${y} ${x},${y + 20}`} fill={["#FFCA28", "#4FC3F7", "#AB47BC", "#66BB6A"][i % 4]} />;
        })}
        {/* Ventana con cortinas */}
        <Rect x="470" y="60" width="120" height="100" rx="8" fill={durmiendo ? "#1A237E" : momento === "dia" ? "#E1F5FE" : CIELO_VENTANA[momento]} stroke="#fff" strokeWidth="8" />
        {durmiendo ? (
          <G><Circle cx="550" cy="92" r="16" fill="#FFF9C4" /><Circle cx="557" cy="86" r="14" fill="#1A237E" />{[[490, 80], [515, 130], [575, 140]].map(([x, y]) => <Circle key={x} cx={x} cy={y} r="2" fill="#fff" />)}</G>
        ) : (
          <G><Circle cx="550" cy="92" r="16" fill={ASTRO_VENTANA[momento]} /><Path d="M478 150 Q510 128 545 148 Q565 138 582 146 V156 H478 Z" fill="#81C784" /></G>
        )}
        <Path d="M530 64 V156 M474 110 H586" stroke="#fff" strokeWidth="5" />
        <Path d="M456 52 Q470 110 458 172 L478 172 Q486 110 476 52 Z" fill="#CE93D8" />
        <Path d="M604 52 Q590 110 602 172 L582 172 Q574 110 584 52 Z" fill="#CE93D8" />
        <Rect x="450" y="46" width="160" height="8" rx="4" fill="#8D6E63" />
        {/* Cuadro con dibujo de Tito */}
        <Rect x="390" y="190" width="54" height="44" fill="#fff" stroke="#FFB300" strokeWidth="4" />
        <Ellipse cx="417" cy="218" rx="12" ry="8" fill="#A1887F" /><Circle cx="406" cy="210" r="6" fill="#A1887F" />
        {/* Cocina amarilla con baldosas sobre el mesón */}
        <Rect x="750" y="0" width="350" height="300" fill="#FFF59D" />
        {Array.from({ length: 7 }, (_, i) => <Rect key={i} x={890 + i * 30} y="170" width="28" height="28" fill={i % 2 ? "#fff" : "#FFE082"} />)}
        {/* Separaciones */}
        <Rect x="354" y="0" width="12" height="320" fill="#D7CCC8" />
        <Rect x="744" y="0" width="12" height="320" fill="#D7CCC8" />
        {/* Refrigerador con dibujos pegados */}
        <Rect x="776" y="90" width="96" height="210" rx="10" fill="#ECEFF1" stroke="#B0BEC5" strokeWidth="4" />
        <Path d="M778 160 H870" stroke="#B0BEC5" strokeWidth="3" />
        <Rect x="858" y="110" width="6" height="34" rx="3" fill="#90A4AE" /><Rect x="858" y="176" width="6" height="40" rx="3" fill="#90A4AE" />
        <Rect x="790" y="186" width="34" height="28" fill="#FFF" stroke="#E57373" strokeWidth="2" transform="rotate(-6 807 200)" />
        <Circle cx="807" cy="198" r="7" fill="#FFCA28" /><Circle cx="796" cy="186" r="3" fill="#E53935" />
        {/* Repisa con frascos */}
        <Rect x="890" y="110" width="200" height="10" fill="#A1887F" />
        {[["#FFB74D", 905], ["#A5D6A7", 945], ["#FFCC80", 985], ["#EF9A9A", 1025]].map(([c, x]) => (
          <G key={x as number}><Rect x={x as number} y="80" width="28" height="30" rx="6" fill={c as string} /><Rect x={(x as number) - 2} y="74" width="32" height="8" rx="3" fill="#8D6E63" /></G>
        ))}
        {/* Cocina (fogón) con olla */}
        <Rect x="880" y="200" width="110" height="100" rx="6" fill="#CFD8DC" stroke="#90A4AE" strokeWidth="3" />
        <Rect x="892" y="236" width="86" height="52" rx="5" fill="#455A64" />
        <Rect x="904" y="246" width="62" height="32" rx="4" fill="#FF8A65" opacity="0.4" />
        {[904, 922, 940, 958].map((x) => <Circle key={x} cx={x + 6} cy="216" r="4" fill="#455A64" />)}
        <Path d="M902 200 Q935 168 968 200 Z" fill="#E53935" />
        <Rect x="896" y="196" width="78" height="8" rx="3" fill="#C62828" />
        <Rect x="928" y="172" width="14" height="6" rx="3" fill="#B71C1C" />
        {/* Piso de madera */}
        <Rect x="0" y="300" width="1100" height="400" fill="#D7A86E" />
        {Array.from({ length: 9 }, (_, i) => <Path key={i} d={`M0 ${330 + i * 42} H1100`} stroke="#C49358" strokeWidth="3" />)}
        {Array.from({ length: 18 }, (_, i) => <Path key={`t${i}`} d={`M${(i * 137) % 1100} ${330 + (i % 9) * 42} v42`} stroke="#C49358" strokeWidth="2" />)}
        {/* Alfombras: del baño y de la pieza */}
        <Rect x="70" y="372" width="110" height="34" rx="16" fill="#80DEEA" />
        <Rect x="80" y="380" width="90" height="18" rx="9" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="6 5" />
        <Ellipse cx="560" cy="600" rx="150" ry="45" fill="#EF9A9A" opacity="0.8" />
        <Ellipse cx="560" cy="600" rx="120" ry="32" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="10 8" />
        {/* Patito de goma en el baño */}
        <Ellipse cx="300" cy="420" rx="16" ry="11" fill="#FFEB3B" /><Circle cx="310" cy="406" r="8" fill="#FFEB3B" /><Path d="M317 406 l8 2 -8 3 Z" fill="#FF7043" /><Circle cx="312" cy="404" r="1.6" fill="#212121" />
        {/* Juguetes en la pieza */}
        <Rect x="400" y="500" width="30" height="30" rx="4" fill="#42A5F5" /><SvgText x="415" y="522" fontSize="20" fontWeight="bold" fill="#fff" textAnchor="middle">A</SvgText>
        <Rect x="432" y="512" width="24" height="24" rx="4" fill="#EF5350" /><SvgText x="444" y="530" fontSize="16" fontWeight="bold" fill="#fff" textAnchor="middle">B</SvgText>
        <Circle cx="700" cy="520" r="16" fill="#FFCA28" /><Path d="M684 520 H716 M700 504 Q690 520 700 536" stroke="#E53935" strokeWidth="3" fill="none" />
        {/* Velador de la pieza encendido de noche */}
        {durmiendo && <Ellipse cx="560" cy="430" rx="220" ry="120" fill="#FFF59D" opacity="0.12" />}
      </Svg>
      <Reloj k={k} x={820} y={46} r={24} />
      <Vapor k={k} x={935} y={170} />
      <View pointerEvents="none" style={{ position: "absolute", left: 720 * k, top: 610 * k }}>
        <AnimalVivo id="gato" alto={46 * k} contento={durmiendo} />
      </View>
    </>
  );
}

/** Estrella de 5 puntas centrada en (cx, cy). */
function estrella(cx: number, cy: number, r: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
    return `${i ? "L" : "M"}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ") + " Z";
}

/** Vapor que sube de la olla de la abuela. */
function Vapor({ k, x, y }: { k: number; x: number; y: number }) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: x * k, top: y * k }}>
      {[0, 1, 2].map((i) => <Bocanada key={i} k={k} retraso={i * 1000} />)}
    </View>
  );
}
function Bocanada({ k, retraso }: { k: number; retraso: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const b = Animated.loop(Animated.sequence([Animated.delay(retraso), Animated.timing(t, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: false }), Animated.timing(t, { toValue: 0, duration: 0, useNativeDriver: false })]));
    b.start();
    return () => b.stop();
  }, [t, retraso]);
  return (
    <Animated.View style={{
      position: "absolute", left: -10 * k, top: -10 * k,
      opacity: t.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.8, 0] }) as never,
      transform: [
        { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -70 * k] }) as never },
        { translateX: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 10 * k, -6 * k] }) as never },
        { scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.6] }) as never },
      ],
    }}>
      <Svg width={20 * k} height={20 * k} viewBox="0 0 20 20"><Circle cx="10" cy="10" r="9" fill="#fff" /></Svg>
    </Animated.View>
  );
}

/** Zetas que flotan sobre la cama cuando es hora de dormir. */
function Zetas({ k }: { k: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const b = Animated.loop(Animated.timing(t, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: false }));
    b.start();
    return () => b.stop();
  }, [t]);
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 470 * k, top: 250 * k, zIndex: 999 }}>
      {[0, 1, 2].map((i) => (
        <Animated.View key={i} style={{
          position: "absolute", left: i * 34 * k, top: -i * 30 * k,
          opacity: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: i % 2 ? [1, 0.3, 1] : [0.3, 1, 0.3] }) as never,
          transform: [{ translateY: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -8 * k, 0] }) as never }],
        }}>
          <Svg width={(30 + i * 8) * k} height={(30 + i * 8) * k} viewBox="0 0 30 30">
            <SvgText x="15" y="25" fontSize="28" fontWeight="bold" fill="#3949AB" stroke="#fff" strokeWidth="1.5" textAnchor="middle">Z</SvgText>
          </Svg>
        </Animated.View>
      ))}
    </View>
  );
}

const Lavamanos = ({ k }: { k: number }) => (
  <Svg width={170 * k} height={220 * k} viewBox="0 0 170 220">
    <Rect x="30" y="0" width="110" height="80" rx="40" fill="#E1F5FE" stroke="#90A4AE" strokeWidth="6" />
    <Path d="M70 110 h30 v-14 h-8 v6 h-14 z" fill="#90A4AE" />
    <Rect x="10" y="110" width="150" height="40" rx="18" fill="#fff" stroke="#B0BEC5" strokeWidth="4" />
    <Rect x="70" y="150" width="30" height="66" fill="#ECEFF1" />
    <Rect x="120" y="96" width="26" height="16" rx="5" fill="#F48FB1" />
  </Svg>
);
const Repisa = ({ k }: { k: number }) => (
  <Svg width={100 * k} height={140 * k} viewBox="0 0 100 140">
    {/* Espejo chico, vaso con cepillos y pasta de dientes */}
    <Rect x="8" y="118" width="84" height="10" rx="4" fill="#A1887F" />
    <Line x1="40" y1="80" x2="30" y2="30" stroke="#42A5F5" strokeWidth="6" strokeLinecap="round" />
    <Rect x="22" y="20" width="12" height="14" rx="3" fill="#fff" transform="rotate(-12 28 27)" />
    <Line x1="48" y1="80" x2="58" y2="36" stroke="#F06292" strokeWidth="6" strokeLinecap="round" />
    <Rect x="52" y="26" width="12" height="14" rx="3" fill="#fff" transform="rotate(12 58 33)" />
    <Path d="M26 72 H62 L58 118 H30 Z" fill="#80DEEA" stroke="#4DD0E1" strokeWidth="2" />
    <Rect x="64" y="96" width="30" height="20" rx="6" fill="#E3F2FD" stroke="#1E88E5" strokeWidth="2" />
    <Rect x="88" y="100" width="8" height="12" rx="2" fill="#1E88E5" />
  </Svg>
);
const Cama = ({ k }: { k: number }) => (
  <Svg width={240 * k} height={170 * k} viewBox="0 0 240 170">
    <Rect x="0" y="20" width="24" height="150" rx="6" fill="#8D6E63" />
    <Circle cx="12" cy="20" r="10" fill="#A1887F" />
    <Rect x="216" y="70" width="24" height="100" rx="6" fill="#8D6E63" />
    <Rect x="20" y="96" width="200" height="54" rx="10" fill="#fff" />
    {/* Almohada y osito */}
    <Ellipse cx="54" cy="90" rx="32" ry="16" fill="#FFF9C4" />
    <Circle cx="80" cy="74" r="12" fill="#BCAAA4" /><Circle cx="71" cy="64" r="5" fill="#BCAAA4" /><Circle cx="89" cy="64" r="5" fill="#BCAAA4" />
    <Circle cx="76" cy="72" r="1.6" fill="#3E2723" /><Circle cx="84" cy="72" r="1.6" fill="#3E2723" /><Ellipse cx="80" cy="78" rx="3.5" ry="2.5" fill="#8D6E63" />
    {/* Plumón con corazones */}
    <Path d="M80 84 H214 Q222 84 222 94 V150 H80 Q72 120 80 84 Z" fill="#CE93D8" />
    <Path d="M80 98 H222" stroke="#BA68C8" strokeWidth="3" />
    {([[120, 120], [160, 132], [196, 114]] as const).map(([x, y]) => <Path key={x} d={`M${x} ${y + 6} l-7 -7 a4 4 0 0 1 7 -5 a4 4 0 0 1 7 5 Z`} fill="#F8BBD0" />)}
  </Svg>
);
const Ropero = ({ k }: { k: number }) => (
  <Svg width={130 * k} height={210 * k} viewBox="0 0 130 210">
    <Rect x="0" y="0" width="130" height="210" rx="10" fill="#A1887F" />
    <Rect x="10" y="12" width="52" height="186" rx="6" fill="#BCAAA4" />
    <Rect x="68" y="12" width="52" height="186" rx="6" fill="#BCAAA4" />
    <Circle cx="56" cy="105" r="5" fill="#FDD835" />
    <Circle cx="74" cy="105" r="5" fill="#FDD835" />
  </Svg>
);
const Mesa = ({ k }: { k: number }) => (
  <Svg width={220 * k} height={120 * k} viewBox="0 0 220 120">
    {/* Mantel, manzana, vaso de leche y ensalada */}
    <Path d="M40 36 Q50 22 60 34 Q66 22 74 34 Q76 50 58 54 Q40 52 40 36 Z" fill="#E53935" />
    <Path d="M58 30 Q60 20 66 18" stroke="#6D4C41" strokeWidth="3" fill="none" />
    <Ellipse cx="70" cy="20" rx="7" ry="3.5" fill="#66BB6A" />
    <Path d="M96 10 H120 L117 54 H99 Z" fill="#fff" stroke="#B0BEC5" strokeWidth="2" />
    <Path d="M97 22 H119" stroke="#ECEFF1" strokeWidth="2" />
    <Ellipse cx="166" cy="48" rx="30" ry="8" fill="#ECEFF1" stroke="#B0BEC5" strokeWidth="2" />
    <Circle cx="152" cy="40" r="9" fill="#81C784" /><Circle cx="166" cy="36" r="10" fill="#66BB6A" /><Circle cx="180" cy="40" r="9" fill="#81C784" />
    <Circle cx="160" cy="42" r="4" fill="#EF5350" /><Circle cx="176" cy="44" r="3.5" fill="#FF7043" />
    <Rect x="0" y="54" width="220" height="22" rx="8" fill="#8D6E63" />
    <Path d="M6 56 H214 V68 Q190 76 166 68 Q142 76 118 68 Q94 76 70 68 Q46 76 22 68 L6 66 Z" fill="#FFCDD2" />
    <Rect x="16" y="76" width="14" height="44" fill="#6D4C41" />
    <Rect x="190" y="76" width="14" height="44" fill="#6D4C41" />
  </Svg>
);
const Puerta = ({ k }: { k: number }) => (
  <Svg width={110 * k} height={150 * k} viewBox="0 0 110 150">
    <Rect x="0" y="0" width="110" height="150" rx="10" fill="#81C784" />
    <Rect x="14" y="14" width="82" height="60" rx="6" fill="#C8E6C9" />
    <Circle cx="90" cy="96" r="6" fill="#FDD835" />
  </Svg>
);
