import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { EscenaRPG, type EscenaRPGRef, type ObjetoEscena } from "../../components/EscenaRPG";
import { hablar } from "../../lib/voz";

/**
 * Casa de Emilia para recorrer (como el barrio): baño, dormitorio y cocina en
 * una sola escena. Cada objeto lleva a una actividad de la vida diaria.
 */
export default function Casa() {
  const [dicho, setDicho] = useState("¡Bienvenidos a mi casa! Toca algo para ir hasta allá.");
  const [durmiendo, setDurmiendo] = useState(false);
  const escena = useRef<EscenaRPGRef>(null);
  useEffect(() => void hablar("¡Bienvenidos a mi casa! Aquí está el baño, mi pieza y la cocina de la abuela Nina."), []);

  const decir = (t: string) => { setDicho(t); void hablar(t); };
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
    { id: "abuela", x: 990, y: 400, ancho: 120, alto: 170, etiqueta: "Abuela Nina", letrero: "Abuela Nina", dibujo: (k) => <Text style={{ fontSize: 100 * k }}>👵</Text>,
      alLlegar: () => decir("¡Hola, mi tesoro! Siéntate en la mesa, que vamos a ver qué es lo más sano.") },
    { id: "mesa", x: 870, y: 520, ancho: 220, alto: 120, etiqueta: "Mesa de la cocina", letrero: "¿Qué es sano?", dibujo: (k) => <Mesa k={k} />,
      alLlegar: ir("La abuela Nina nos enseña a comer sano.", "/casa/plato") },
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
      extras={(k) => durmiendo ? <Text style={{ position: "absolute", left: 540 * k, top: 250 * k, fontSize: 50 * k, zIndex: 999 }}>💤🌙</Text> : null}
    />
  );
}

function Interior({ k, durmiendo }: { k: number; durmiendo: boolean }) {
  return (
    <Svg width={1100 * k} height={700 * k} viewBox="0 0 1100 700">
      {/* Murallas: baño con azulejos, pieza con papel mural, cocina amarilla */}
      <Rect x="0" y="0" width="360" height="300" fill="#B3E5FC" />
      {Array.from({ length: 6 }, (_, i) => <Path key={i} d={`M0 ${50 * i} H360 M${60 * i} 0 V300`} stroke="#81D4FA" strokeWidth="2" />)}
      <Rect x="360" y="0" width="390" height="300" fill={durmiendo ? "#5C6BC0" : "#F8BBD0"} />
      {Array.from({ length: 8 }, (_, i) => <Circle key={i} cx={390 + i * 48} cy={60 + (i % 2) * 70} r="7" fill="#fff" opacity="0.6" />)}
      <Rect x="750" y="0" width="350" height="300" fill="#FFF59D" />
      {/* Ventana de la pieza */}
      <Rect x="470" y="50" width="120" height="100" rx="8" fill={durmiendo ? "#1A237E" : "#E1F5FE"} stroke="#fff" strokeWidth="8" />
      {durmiendo ? <Circle cx="550" cy="85" r="16" fill="#FFF9C4" /> : <Circle cx="550" cy="85" r="16" fill="#FFEB3B" />}
      {/* Separaciones */}
      <Rect x="354" y="0" width="12" height="320" fill="#D7CCC8" />
      <Rect x="744" y="0" width="12" height="320" fill="#D7CCC8" />
      {/* Cocina: refrigerador y repisa */}
      <Rect x="790" y="90" width="90" height="200" rx="10" fill="#ECEFF1" stroke="#B0BEC5" strokeWidth="4" />
      <Rect x="866" y="140" width="6" height="40" fill="#90A4AE" />
      <Rect x="900" y="110" width="170" height="12" fill="#A1887F" />
      <G>{["🍯", "🫙", "🍞"].map((_, i) => <Rect key={i} x={915 + i * 50} y={80} width="30" height="30" rx="6" fill={["#FFB74D", "#A5D6A7", "#FFCC80"][i]} />)}</G>
      {/* Piso de madera */}
      <Rect x="0" y="300" width="1100" height="400" fill="#D7A86E" />
      {Array.from({ length: 9 }, (_, i) => <Path key={i} d={`M0 ${330 + i * 42} H1100`} stroke="#C49358" strokeWidth="3" />)}
      <Ellipse cx="560" cy="600" rx="150" ry="45" fill="#EF9A9A" opacity="0.7" />
    </Svg>
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
  <View style={{ alignItems: "center" }}>
    <Text style={{ fontSize: 56 * k }}>🪥</Text>
    <View style={{ width: 90 * k, height: 12 * k, backgroundColor: "#A1887F", borderRadius: 4 }} />
  </View>
);
const Cama = ({ k }: { k: number }) => (
  <Svg width={240 * k} height={170 * k} viewBox="0 0 240 170">
    <Rect x="0" y="20" width="24" height="150" rx="6" fill="#8D6E63" />
    <Rect x="216" y="70" width="24" height="100" rx="6" fill="#8D6E63" />
    <Rect x="20" y="90" width="200" height="60" rx="10" fill="#fff" />
    <Rect x="70" y="80" width="150" height="70" rx="12" fill="#CE93D8" />
    <Ellipse cx="50" cy="88" rx="30" ry="16" fill="#FFF9C4" />
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
  <View style={{ alignItems: "center" }}>
    <Text style={{ fontSize: 34 * k }}>🍎🥛🥗</Text>
    <Svg width={220 * k} height={80 * k} viewBox="0 0 220 80">
      <Rect x="0" y="0" width="220" height="22" rx="8" fill="#8D6E63" />
      <Rect x="16" y="22" width="14" height="58" fill="#6D4C41" />
      <Rect x="190" y="22" width="14" height="58" fill="#6D4C41" />
    </Svg>
  </View>
);
const Puerta = ({ k }: { k: number }) => (
  <Svg width={110 * k} height={150 * k} viewBox="0 0 110 150">
    <Rect x="0" y="0" width="110" height="150" rx="10" fill="#81C784" />
    <Rect x="14" y="14" width="82" height="60" rx="6" fill="#C8E6C9" />
    <Circle cx="90" cy="96" r="6" fill="#FDD835" />
  </Svg>
);
