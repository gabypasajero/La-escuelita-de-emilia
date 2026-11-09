import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { Bandada, MariposaVolando, Nube, Sol } from "../components/Ambiente";
import { Adulto } from "../components/Personas";
import { AnimalPaseando, PROPORCION, type AnimalId } from "../components/AnimalesVivos";
import { EscenaRPG, type ObjetoEscena } from "../components/EscenaRPG";
import { useJuego } from "../lib/juego";
import { hablar } from "../lib/voz";
import { useVozActiva } from "../lib/habla";

/**
 * Granja de Don Pedro para recorrer: los animales pasean por su corral; al
 * acercarse se escucha su nombre y sonido, y el niño elige qué comida darle.
 */
const COMIDAS = [
  { id: "pasto", nombre: "pasto", emoji: "🌾" },
  { id: "maiz", nombre: "granos de maíz", emoji: "🌽" },
  { id: "verduras", nombre: "verduras", emoji: "🥕" },
  { id: "hueso", nombre: "hueso", emoji: "🦴" },
  { id: "pescado", nombre: "pescado", emoji: "🐟" },
];

const ANIMALES = [
  { id: "vaca", nombre: "la vaca", emoji: "🐄", sonido: "¡Muuu!", come: "pasto", x: 300, y: 440, paseo: 60 },
  { id: "oveja", nombre: "la oveja", emoji: "🐑", sonido: "¡Beee!", come: "pasto", x: 470, y: 470, paseo: 50 },
  { id: "caballo", nombre: "el caballo", emoji: "🐴", sonido: "¡Iiih!", come: "pasto", x: 640, y: 430, paseo: 70 },
  { id: "gallina", nombre: "la gallina", emoji: "🐔", sonido: "¡Cocorocó!", come: "maiz", x: 180, y: 640, paseo: 40 },
  { id: "cerdo", nombre: "el cerdito", emoji: "🐷", sonido: "¡Oinc, oinc!", come: "verduras", x: 470, y: 650, paseo: 45 },
  { id: "conejo", nombre: "el conejo", emoji: "🐰", sonido: "¡Fsss, fsss!", come: "verduras", x: 650, y: 660, paseo: 40 },
  { id: "pato", nombre: "el pato", emoji: "🦆", sonido: "¡Cuac, cuac!", come: "maiz", x: 900, y: 600, paseo: 50 },
];

export default function Granja() {
  const { ganar } = useJuego();
  const [dicho, setDicho] = useState("¡Bienvenidos a la granja! Toca un animal para ir a verlo.");
  const [cerca, setCerca] = useState<(typeof ANIMALES)[number] | null>(null);
  const [felices, setFelices] = useState<string[]>([]);
  useEffect(() => void hablar("¡Bienvenidos a la granja! Los animales tienen hambre. ¿Me ayudas a darles comida?"), []);

  const decir = (t: string) => { setDicho(t); void hablar(t); };
  // Don Pedro saluda al llegar y mueve la boca y las manos cuando habla.
  const [pedroHabla, setPedroHabla] = useState(false);
  const voz = useVozActiva();
  const [pedroSaluda, setPedroSaluda] = useState(true);
  useEffect(() => { const t = setTimeout(() => setPedroSaluda(false), 3500); return () => clearTimeout(t); }, []);
  const decirPedro = (t: string) => {
    decir(t);
    setPedroHabla(true);
    setTimeout(() => setPedroHabla(false), Math.max(3000, t.length * 120));
  };

  function dar(comida: (typeof COMIDAS)[number]) {
    if (!cerca) return;
    if (comida.id !== cerca.come) return decir(`Mmm, a ${cerca.nombre} no le gusta el ${comida.nombre}. ¡Prueba otra comida!`);
    ganar(1);
    setFelices((f) => [...f, cerca.id]);
    setTimeout(() => setFelices((f) => f.filter((x) => x !== cerca.id)), 2500);
    decir(`¡${cerca.sonido} ${cerca.nombre[0]!.toUpperCase()}${cerca.nombre.slice(1)} come ${comida.nombre}. ¡Gracias!`);
    setCerca(null);
  }

  const objetos: ObjetoEscena[] = [
    { id: "pedro", x: 860, y: 330, ancho: 110, alto: 150, etiqueta: "Don Pedro", letrero: "Don Pedro",
      dibujo: (k) => <Adulto id="pedro" alto={150 * k} hablando={pedroHabla && voz} saludando={pedroSaluda} />,
      alLlegar: () => decirPedro("¿Sabías que las vacas comen pasto casi todo el día? ¡Con paciencia todo crece!") },
    ...ANIMALES.map((a): ObjetoEscena => ({
      id: a.id, x: a.x, y: a.y, ancho: 130 + a.paseo * 2, alto: 110, etiqueta: a.nombre,
      llegada: { x: a.x - 90, y: a.y + 10 },
      dibujo: (k) => <AnimalDeGranja id={a.id as AnimalId} k={k} paseo={a.paseo} feliz={felices.includes(a.id)} />,
      alLlegar: () => {
        setCerca(a);
        decir(`${a.sonido} Es ${a.nombre}. ¿Qué come ${a.nombre}?`);
      },
    })),
  ];

  return (
    <EscenaRPG
      fondo={(k) => <Campo k={k} />}
      objetos={objetos}
      inicio={{ x: 980, y: 660 }}
      piso={{ xMin: 40, xMax: 1060, yMin: 330, yMax: 690 }}
      dialogo={dicho}
      colorFondo="#9CCC65"
      luz={{ interior: false, cielo: 250, suelo: { yMin: 340, yMax: 660 } }}
    >
      {cerca && (
        <View style={estilos.barra}>
          <Text style={estilos.pregunta}>{cerca.emoji} ¿Qué come?</Text>
          {COMIDAS.map((c) => (
            <Pressable key={c.id} style={estilos.comida} onPress={() => dar(c)} accessibilityLabel={`Darle ${c.nombre}`}>
              <Text style={estilos.comidaEmoji}>{c.emoji}</Text>
              <Text style={estilos.comidaNombre}>{c.nombre}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </EscenaRPG>
  );
}

/** Animal vivo (articulado) que pasea por su corral; salta y mueve la cola cuando está feliz. */
function AnimalDeGranja({ id, k, paseo, feliz }: { id: AnimalId; k: number; paseo: number; feliz: boolean }) {
  const grande = id === "vaca" || id === "caballo";
  const alto = (grande ? 100 : id === "oveja" || id === "cerdo" ? 82 : 70) * k;
  return (
    <View style={{ alignItems: "center" }}>
      {feliz && <Text style={{ fontSize: 26 * k }}>💛</Text>}
      <AnimalPaseando id={id} alto={alto} paseo={paseo * k} contento={feliz} />
      <View style={{ width: alto * PROPORCION[id] * 0.6, height: 10 * k, borderRadius: 40, backgroundColor: "rgba(0,0,0,0.14)", marginTop: -8 * k }} />
    </View>
  );
}

function Campo({ k }: { k: number }) {
  return (
    <>
      <Svg width={1100 * k} height={700 * k} viewBox="0 0 1100 700">
        {/* Cielo y cordillera */}
        <Rect x="0" y="0" width="1100" height="120" fill="#81D4FA" />
        <Rect x="0" y="110" width="1100" height="100" fill="#B3E5FC" />
        <Path d="M0 190 L120 110 L210 170 L330 90 L450 175 L560 120 L680 185 L800 100 L930 170 L1040 115 L1100 150 V210 H0 Z" fill="#B0BEC5" />
        <Path d="M300 106 L330 90 L356 106 L342 112 L330 104 L318 112 Z M780 112 L800 100 L820 112 L808 116 L800 110 L792 116 Z" fill="#fff" />
        <Path d="M0 200 Q 300 130 600 190 T 1100 180 V 260 H 0 Z" fill="#8BC34A" />
        <Rect x="0" y="240" width="1100" height="460" fill="#9CCC65" />
        {Array.from({ length: 40 }, (_, i) => <Path key={i} d={`M${(i * 173) % 1100} ${270 + ((i * 97) % 420)} l3 -9 l3 9`} stroke="#7CB342" strokeWidth="2" fill="none" />)}
        {/* Silo */}
        <Rect x="244" y="150" width="46" height="150" fill="#B0BEC5" />
        <Path d="M244 150 Q267 118 290 150 Z" fill="#78909C" />
        {[180, 210, 240, 270].map((y) => <Rect key={y} x="244" y={y} width="46" height="3" fill="#90A4AE" />)}
        {/* Granero con tablas, altillo con paja y veleta */}
        <Path d="M30 232 L140 132 L250 232 Z" fill="#B71C1C" />
        <Path d="M30 232 L140 132 L250 232" stroke="#fff" strokeWidth="5" fill="none" />
        <Rect x="50" y="228" width="180" height="112" fill="#E53935" />
        {[70, 90, 110, 130, 150, 170, 190, 210].map((x) => <Rect key={x} x={x} y="232" width="2" height="106" fill="#C62828" />)}
        <Rect x="117" y="170" width="46" height="36" fill="#5D4037" stroke="#fff" strokeWidth="4" />
        <Path d="M121 204 Q130 188 140 200 Q150 186 159 204 Z" fill="#FBC02D" />
        <Rect x="105" y="258" width="70" height="82" fill="#fff" />
        <Rect x="110" y="263" width="60" height="77" fill="#E53935" />
        <Path d="M110 263 L170 340 M170 263 L110 340" stroke="#fff" strokeWidth="6" />
        <Path d="M140 132 L140 108 M128 112 L152 112 M132 104 L148 120" stroke="#5D4037" strokeWidth="3" />
        {/* Fardos de paja */}
        {([[300, 330], [338, 336]] as const).map(([x, y]) => (
          <G key={x}><Ellipse cx={x} cy={y} rx="26" ry="20" fill="#FBC02D" /><Ellipse cx={x - 14} cy={y} rx="9" ry="20" fill="#F9A825" /><Path d={`M${x - 14} ${y - 12} Q${x - 8} ${y} ${x - 14} ${y + 12}`} stroke="#E68A00" strokeWidth="2" fill="none" /></G>
        ))}
        {/* Corral */}
        {Array.from({ length: 14 }, (_, i) => <Rect key={i} x={250 + i * 40} y="358" width="8" height="44" rx="2" fill="#A1887F" />)}
        <Rect x="248" y="368" width="530" height="7" rx="3" fill="#BCAAA4" />
        <Rect x="248" y="386" width="530" height="7" rx="3" fill="#BCAAA4" />
        {/* Bebedero */}
        <Path d="M690 420 L770 420 L762 444 L698 444 Z" fill="#8D6E63" />
        <Rect x="694" y="420" width="72" height="6" fill="#4FC3F7" />
        {/* Árbol */}
        <Rect x="1010" y="250" width="14" height="70" fill="#6D4C41" />
        <Circle cx="1017" cy="230" r="44" fill="#43A047" />
        <Circle cx="995" cy="220" r="10" fill="#E53935" /><Circle cx="1035" cy="240" r="9" fill="#E53935" />
        {/* Gallinero con rampa */}
        <Path d="M105 560 L180 516 L255 560 Z" fill="#8D6E63" />
        <Rect x="118" y="558" width="124" height="62" fill="#FFCC80" />
        <Rect x="166" y="580" width="28" height="40" rx="12" fill="#5D4037" />
        <Path d="M194 620 L240 640" stroke="#A1887F" strokeWidth="7" />
        <Ellipse cx="560" cy="600" rx="430" ry="40" fill="#C5E1A5" />
        {/* Laguna con nenúfares y juncos */}
        <Ellipse cx="920" cy="620" rx="140" ry="60" fill="#4FC3F7" />
        <Ellipse cx="920" cy="620" rx="140" ry="60" fill="none" stroke="#81D4FA" strokeWidth="6" />
        <Ellipse cx="900" cy="605" rx="40" ry="10" fill="#fff" opacity="0.4" />
        <Ellipse cx="860" cy="640" rx="14" ry="6" fill="#66BB6A" /><Circle cx="864" cy="636" r="3.5" fill="#F48FB1" />
        <Ellipse cx="985" cy="600" rx="12" ry="5" fill="#66BB6A" />
        {[1040, 1050, 1060].map((x, i) => <Path key={x} d={`M${x} 640 Q${x - 4} ${600 - i * 6} ${x + 2} ${586 - i * 8}`} stroke="#558B2F" strokeWidth="3" fill="none" />)}
        {/* Flores */}
        {Array.from({ length: 26 }, (_, i) => <Circle key={i} cx={(i * 211) % 1080 + 10} cy={430 + ((i * 131) % 250)} r="4" fill={["#F06292", "#FFF176", "#fff", "#BA68C8"][i % 4]} />)}
      </Svg>
      <Sol k={k} x={980} y={70} r={40} />
      <Nube escala={k} ancho={1100} y={30} ms={60000} retraso={0} tam={170} />
      <Nube escala={k} ancho={1100} y={90} ms={85000} retraso={30000} tam={130} />
      <Bandada escala={k} ancho={1100} y={60} ms={14000} retraso={4000} />
      <MariposaVolando escala={k} x={560} y={500} fase={0} />
      <MariposaVolando escala={k} x={360} y={650} fase={2} />
    </>
  );
}

const estilos = StyleSheet.create({
  barra: { position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },
  pregunta: { fontSize: 24, fontWeight: "900", color: "#3B2F5C", backgroundColor: "#fff", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  comida: { width: 96, height: 96, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  comidaEmoji: { fontSize: 42 },
  comidaNombre: { fontSize: 12, fontWeight: "800", color: "#3B2F5C", textAlign: "center" },
});
