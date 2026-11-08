import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Ellipse, Path, Rect } from "react-native-svg";
import { AnimalPaseando, PROPORCION, type AnimalId } from "../components/AnimalesVivos";
import { EscenaRPG, type ObjetoEscena } from "../components/EscenaRPG";
import { useJuego } from "../lib/juego";
import { hablar } from "../lib/voz";

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
      dibujo: (k) => <Text style={{ fontSize: 90 * k }}>👨‍🌾</Text>,
      alLlegar: () => decir("¿Sabías que las vacas comen pasto casi todo el día? ¡Con paciencia todo crece!") },
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
    <Svg width={1100 * k} height={700 * k} viewBox="0 0 1100 700">
      <Rect x="0" y="0" width="1100" height="200" fill="#B3E5FC" />
      <Path d="M0 200 Q 300 130 600 190 T 1100 180 V 260 H 0 Z" fill="#8BC34A" />
      <Rect x="0" y="240" width="1100" height="460" fill="#9CCC65" />
      {/* Granero */}
      <Path d="M40 230 L140 140 L240 230 Z" fill="#B71C1C" />
      <Rect x="55" y="228" width="170" height="110" fill="#E53935" />
      <Rect x="110" y="260" width="60" height="78" fill="#fff" />
      <Path d="M110 260 L170 338 M170 260 L110 338" stroke="#E53935" strokeWidth="6" />
      {/* Corral grande */}
      {Array.from({ length: 14 }, (_, i) => <Rect key={i} x={250 + i * 40} y="360" width="7" height="40" fill="#A1887F" />)}
      <Rect x="248" y="368" width="530" height="6" fill="#A1887F" />
      <Rect x="248" y="386" width="530" height="6" fill="#A1887F" />
      {/* Gallinero y camino */}
      <Path d="M110 560 L180 520 L250 560 Z" fill="#8D6E63" />
      <Rect x="120" y="558" width="120" height="60" fill="#FFCC80" />
      <Ellipse cx="560" cy="600" rx="430" ry="40" fill="#C5E1A5" />
      {/* Laguna del pato */}
      <Ellipse cx="920" cy="620" rx="140" ry="60" fill="#4FC3F7" />
      <Ellipse cx="900" cy="605" rx="40" ry="10" fill="#fff" opacity="0.4" />
    </Svg>
  );
}

const estilos = StyleSheet.create({
  barra: { position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },
  pregunta: { fontSize: 24, fontWeight: "900", color: "#3B2F5C", backgroundColor: "#fff", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  comida: { width: 96, height: 96, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  comidaEmoji: { fontSize: 42 },
  comidaNombre: { fontSize: 12, fontWeight: "800", color: "#3B2F5C", textAlign: "center" },
});
