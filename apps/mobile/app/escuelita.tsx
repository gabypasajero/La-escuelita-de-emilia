import { router, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect, Text as SvgText } from "react-native-svg";
import { MariposaVolando, Reloj } from "../components/Ambiente";
import { EscenaRPG, type EscenaRPGRef, type ObjetoEscena } from "../components/EscenaRPG";
import { Adulto } from "../components/Personas";
import { despuesDeHablar, hablar } from "../lib/voz";
import { ASTRO_VENTANA, CIELO_VENTANA, useMomento } from "../lib/hora";
import { useVozActiva } from "../lib/habla";

/** Todos los juegos (también se abren desde el botón «Todos los juegos»). */
const SALAS: Array<{ ruta: Href; nombre: string; emoji: string; color: string; frase: string }> = [
  { ruta: "/trazar", nombre: "Escribir", emoji: "✏️", color: "#5C6BC0", frase: "¡Vamos a aprender a escribir con el dedo!" },
  { ruta: "/letras", nombre: "Letras", emoji: "🔤", color: "#29B6F6", frase: "¡Vamos a jugar con las letras y sus sonidos!" },
  { ruta: "/numeros", nombre: "Números", emoji: "🔢", color: "#66BB6A", frase: "¡A contar!" },
  { ruta: "/sumas", nombre: "Sumas", emoji: "➕", color: "#FFA726", frase: "¡Vamos a sumar con frutas!" },
  { ruta: "/letra-animal", nombre: "Letra y animal", emoji: "🐒", color: "#FFCA28", frase: "¿Qué animal empieza con esta letra?" },
  { ruta: "/animales", nombre: "Sonidos", emoji: "🐄", color: "#8D6E63", frase: "¿Quién hace este sonido?" },
  { ruta: "/juegos/memoria", nombre: "Memoria", emoji: "🃏", color: "#AB47BC", frase: "¡A buscar parejas!" },
  { ruta: "/descubrir/colores", nombre: "Colores", emoji: "🎨", color: "#EC407A", frase: "¡A jugar con los colores!" },
  { ruta: "/descubrir/formas", nombre: "Formas", emoji: "🔺", color: "#7E57C2", frase: "¡Círculos, cuadrados y triángulos!" },
  { ruta: "/descubrir/mas-menos", nombre: "Más y menos", emoji: "⚖️", color: "#26A69A", frase: "¿Dónde hay más?" },
  { ruta: "/descubrir/patrones", nombre: "¿Qué sigue?", emoji: "🔴", color: "#FFB300", frase: "¡A descubrir patrones!" },
  { ruta: "/descubrir/verduras", nombre: "Verduras", emoji: "🥕", color: "#7CB342", frase: "¡Busquemos verduras del huerto!" },
  { ruta: "/juegos/tiendita", nombre: "Tiendita", emoji: "🛒", color: "#EF5350", frase: "Doña Rosa necesita ayuda en la tiendita." },
];

/**
 * La Escuelita como sala de clases para recorrer: la tía recibe a los niños y
 * cada rincón de la sala abre un juego (la pizarra para escribir, el ábaco
 * para contar, las mesitas para sumar, la memoria y las formas…).
 */
export default function Escuelita() {
  const [dicho, setDicho] = useState("¡Hola! Bienvenidos a la escuelita. Toca un rincón de la sala para jugar.");
  const [tiaHabla, setTiaHabla] = useState(true);
  const [todos, setTodos] = useState(false);
  const silencio = useRef<ReturnType<typeof setTimeout> | null>(null);
  const escena = useRef<EscenaRPGRef>(null);
  const voz = useVozActiva();

  const hablaTia = (ms: number) => {
    setTiaHabla(true);
    if (silencio.current) clearTimeout(silencio.current);
    silencio.current = setTimeout(() => setTiaHabla(false), ms);
  };
  useEffect(() => {
    void hablar("¡Hola! Bienvenidos a la escuelita. Toca un rincón de la sala para jugar.");
    hablaTia(4500);
  }, []);
  const decir = (t: string) => { setDicho(t); void hablar(t); hablaTia(Math.max(3000, t.length * 120)); };
  const ir = (nombre: string) => () => {
    const s = SALAS.find((x) => x.nombre === nombre)!;
    decir(s.frase);
    despuesDeHablar(() => router.push(s.ruta));
  };

  const objetos: ObjetoEscena[] = [
    // Pared del fondo
    { id: "letras", x: 110, y: 390, ancho: 150, alto: 210, etiqueta: "Letras", letrero: "Letras", dibujo: (k) => <EstanteLetras k={k} />, alLlegar: ir("Letras") },
    { id: "pizarra", x: 450, y: 380, ancho: 330, alto: 220, etiqueta: "Pizarra", letrero: "Escribir", dibujo: (k) => <Pizarra k={k} />, llegada: { x: 450, y: 430 }, alLlegar: ir("Escribir") },
    { id: "tia", x: 700, y: 410, ancho: 100, alto: 190, etiqueta: "Tía de la escuelita", letrero: "La tía",
      dibujo: (k) => <Adulto id="tia" alto={180 * k} hablando={tiaHabla && voz} />, llegada: { x: 640, y: 450 },
      alLlegar: () => decir("¡Qué bueno que viniste! Aquí aprendemos jugando. Prueba la pizarra, el ábaco o las mesitas.") },
    { id: "abaco", x: 860, y: 400, ancho: 130, alto: 170, etiqueta: "Ábaco", letrero: "Números", dibujo: (k) => <Abaco k={k} />, alLlegar: ir("Números") },
    { id: "radio", x: 1010, y: 400, ancho: 120, alto: 170, etiqueta: "Radio de los sonidos", letrero: "Sonidos", dibujo: (k) => <Radio k={k} />, alLlegar: ir("Sonidos") },
    // Mesitas del medio
    { id: "frutas", x: 230, y: 540, ancho: 170, alto: 110, etiqueta: "Mesa de las frutas", letrero: "Sumas", dibujo: (k) => <Mesita k={k} encima={<G>{["#E53935", "#E53935", "#FDD835"].map((c, i) => <Circle key={i} cx={56 + i * 26} cy={22} r="11" fill={c} />)}</G>} />, alLlegar: ir("Sumas") },
    { id: "cartas", x: 500, y: 550, ancho: 170, alto: 110, etiqueta: "Mesa de las cartas", letrero: "Memoria", dibujo: (k) => <Mesita k={k} encima={<G>{[0, 1, 2, 3].map((i) => <Rect key={i} x={40 + i * 24} y={10 + (i % 2) * 3} width="20" height="26" rx="3" fill={i === 1 ? "#fff" : "#AB47BC"} stroke="#fff" strokeWidth="2" />)}<SvgText x="74" y="31" fontSize="14" textAnchor="middle">🐶</SvgText></G>} />, alLlegar: ir("Memoria") },
    { id: "figuras", x: 770, y: 540, ancho: 170, alto: 110, etiqueta: "Mesa de las figuras", letrero: "Formas", dibujo: (k) => <Mesita k={k} encima={<G><Circle cx="56" cy="22" r="12" fill="#E53935" /><Rect x="76" y="10" width="22" height="22" fill="#1E88E5" /><Polygon points="118,32 106,10 130,10" fill="#43A047" transform="rotate(180 118 21)" /></G>} />, alLlegar: ir("Formas") },
    { id: "balanza", x: 1010, y: 560, ancho: 140, alto: 140, etiqueta: "Balanza", letrero: "Más y menos", dibujo: (k) => <Balanza k={k} />, alLlegar: ir("Más y menos") },
    // Rincones de adelante
    { id: "lectura", x: 120, y: 680, ancho: 190, alto: 120, etiqueta: "Rincón de lectura", letrero: "Letra y animal", dibujo: (k) => <RinconLectura k={k} />, llegada: { x: 200, y: 660 }, alLlegar: ir("Letra y animal") },
    { id: "cuentas", x: 380, y: 680, ancho: 160, alto: 90, etiqueta: "Cuentas de colores", letrero: "¿Qué sigue?", dibujo: (k) => <Cuentas k={k} />, llegada: { x: 380, y: 660 }, alLlegar: ir("¿Qué sigue?") },
    { id: "acuarelas", x: 640, y: 680, ancho: 160, alto: 90, etiqueta: "Acuarelas", letrero: "Colores", dibujo: (k) => <Acuarelas k={k} />, llegada: { x: 640, y: 660 }, alLlegar: ir("Colores") },
    { id: "verduras", x: 900, y: 680, ancho: 150, alto: 100, etiqueta: "Canasta de verduras", letrero: "Verduras", dibujo: (k) => <Canasta k={k} />, llegada: { x: 900, y: 660 }, alLlegar: ir("Verduras") },
  ];

  return (
    <EscenaRPG
      ref={escena}
      fondo={(k) => <Sala k={k} />}
      objetos={objetos}
      inicio={{ x: 560, y: 640 }}
      piso={{ xMin: 40, xMax: 1060, yMin: 420, yMax: 690 }}
      dialogo={dicho}
      colorFondo="#FFF8E1"
      luz={{ interior: true, luces: [{ x: 305, y: 140, r: 80 }] }}
    >
      <Pressable style={estilos.todos} onPress={() => setTodos(true)} accessibilityLabel="Todos los juegos">
        <Text style={estilos.todosTexto}>📋 Todos los juegos</Text>
      </Pressable>
      <Modal visible={todos} transparent animationType="fade" onRequestClose={() => setTodos(false)}>
        <View style={estilos.velo}>
          <View style={estilos.caja}>
            <ScrollView contentContainerStyle={estilos.salas}>
              {SALAS.map((s) => (
                <Pressable key={s.nombre} accessibilityLabel={s.nombre} style={[estilos.puerta, { backgroundColor: s.color }]}
                  onPress={() => { setTodos(false); void hablar(s.frase); router.push(s.ruta); }}>
                  <Text style={estilos.emoji}>{s.emoji}</Text>
                  <Text style={estilos.nombre}>{s.nombre}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={estilos.cerrar} onPress={() => setTodos(false)} accessibilityLabel="Cerrar"><Text style={estilos.todosTexto}>✖ Cerrar</Text></Pressable>
          </View>
        </View>
      </Modal>
    </EscenaRPG>
  );
}

// ---------- Dibujos de la sala ----------

function Sala({ k }: { k: number }) {
  const momento = useMomento();
  const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
  return (
    <>
      <Svg width={1100 * k} height={700 * k} viewBox="0 0 1100 700">
        {/* Paredes y zócalo */}
        <Rect x="0" y="0" width="1100" height="400" fill="#FFF3C4" />
        <Rect x="0" y="300" width="1100" height="100" fill="#FFE082" />
        <Rect x="0" y="296" width="1100" height="8" fill="#FFCA28" />
        {/* Guirnalda del abecedario */}
        <Path d="M0 30 Q550 70 1100 30" stroke="#8D6E63" strokeWidth="2" fill="none" />
        {letras.map((l, i) => {
          const x = 20 + i * 39.5, y = 30 + Math.sin((i / (letras.length - 1)) * Math.PI) * 26;
          return (
            <G key={l}>
              <Polygon points={`${x - 14},${y} ${x + 14},${y} ${x},${y + 30}`} fill={["#EF5350", "#42A5F5", "#66BB6A", "#FFCA28", "#AB47BC"][i % 5]} />
              <SvgText x={x} y={y + 16} fontSize="13" fontWeight="bold" fill="#fff" textAnchor="middle">{l}</SvgText>
            </G>
          );
        })}
        {/* Ventana */}
        <Rect x="250" y="90" width="110" height="100" rx="6" fill={CIELO_VENTANA[momento]} stroke="#fff" strokeWidth="8" />
        <Circle cx="335" cy="115" r="12" fill={ASTRO_VENTANA[momento]} />
        <Path d="M254 170 Q290 150 330 168 Q345 160 356 166 V186 H254 Z" fill="#81C784" />
        <Path d="M305 94 V186 M254 140 H356" stroke="#fff" strokeWidth="5" />
        {/* Diario mural con dibujos de los niños */}
        <Rect x="790" y="80" width="230" height="130" rx="6" fill="#D7A86E" stroke="#8D6E63" strokeWidth="5" />
        {[[805, 95, "#FFCDD2"], [865, 92, "#C8E6C9"], [925, 98, "#BBDEFB"], [985, 94, "#FFF9C4"]].map(([x, y, c]) => (
          <G key={x as number}><Rect x={x as number} y={y as number} width="48" height="40" fill={c as string} /><Circle cx={(x as number) + 24} cy={(y as number) + 18} r="9" fill="#FFB300" /><Circle cx={(x as number) + 4} cy={(y as number) + 2} r="2.5" fill="#E53935" /></G>
        ))}
        <SvgText x="905" y="190" fontSize="18" fontWeight="bold" fill="#5D4037" textAnchor="middle">1 2 3 4 5</SvgText>
        {/* Piso de madera y alfombra */}
        <Rect x="0" y="400" width="1100" height="300" fill="#E6C08F" />
        {Array.from({ length: 6 }, (_, i) => <Line key={i} x1="0" y1={440 + i * 50} x2="1100" y2={440 + i * 50} stroke="#D4A86F" strokeWidth="2" />)}
        <Ellipse cx="560" cy="640" rx="170" ry="40" fill="#81D4FA" opacity="0.7" />
        <Ellipse cx="560" cy="640" rx="140" ry="30" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="10 8" />
      </Svg>
      <Reloj k={k} x={640} y={130} r={28} />
      <MariposaVolando escala={k} x={300} y={140} fase={1} />
    </>
  );
}

function Pizarra({ k }: { k: number }) {
  return (
    <Svg width={330 * k} height={220 * k} viewBox="0 0 330 220">
      <Rect x="10" y="10" width="310" height="170" rx="8" fill="#2E7D32" stroke="#8D6E63" strokeWidth="12" />
      <SvgText x="70" y="80" fontSize="44" fontWeight="bold" fill="#fff">A b c</SvgText>
      <SvgText x="200" y="140" fontSize="40" fontWeight="bold" fill="#FFF59D">1 2 3</SvgText>
      <Path d="M60 140 Q90 110 120 140 T180 140" stroke="#F48FB1" strokeWidth="4" fill="none" />
      <Rect x="30" y="180" width="270" height="10" fill="#A1887F" />
      <Rect x="60" y="174" width="26" height="7" rx="2" fill="#fff" />
      <Rect x="100" y="174" width="20" height="7" rx="2" fill="#FFEB3B" />
      <Rect x="230" y="172" width="34" height="10" rx="2" fill="#795548" />
      <Rect x="40" y="190" width="10" height="30" fill="#8D6E63" /><Rect x="280" y="190" width="10" height="30" fill="#8D6E63" />
    </Svg>
  );
}

function EstanteLetras({ k }: { k: number }) {
  const bloques = ["A", "E", "I", "O", "U", "M", "P", "S", "L"];
  return (
    <Svg width={150 * k} height={210 * k} viewBox="0 0 150 210">
      <Rect x="10" y="10" width="130" height="200" rx="6" fill="#A1887F" />
      {[60, 115, 170].map((y) => <Rect key={y} x="16" y={y} width="118" height="6" fill="#6D4C41" />)}
      {bloques.map((l, i) => {
        const x = 22 + (i % 3) * 38, y = 22 + Math.floor(i / 3) * 55;
        return (
          <G key={l}><Rect x={x} y={y} width="32" height="34" rx="4" fill={["#EF5350", "#42A5F5", "#66BB6A", "#FFCA28", "#AB47BC"][i % 5]} /><SvgText x={x + 16} y={y + 25} fontSize="20" fontWeight="bold" fill="#fff" textAnchor="middle">{l}</SvgText></G>
        );
      })}
    </Svg>
  );
}

function Abaco({ k }: { k: number }) {
  return (
    <Svg width={130 * k} height={170 * k} viewBox="0 0 130 170">
      <Rect x="10" y="10" width="110" height="110" rx="6" fill="none" stroke="#8D6E63" strokeWidth="8" />
      {[0, 1, 2, 3, 4].map((f) => (
        <G key={f}>
          <Line x1="14" y1={28 + f * 20} x2="116" y2={28 + f * 20} stroke="#BCAAA4" strokeWidth="2" />
          {Array.from({ length: f + 1 }, (_, i) => <Circle key={i} cx={24 + i * 14} cy={28 + f * 20} r="7" fill={["#EF5350", "#42A5F5", "#66BB6A", "#FFCA28", "#AB47BC"][f]} />)}
        </G>
      ))}
      <Path d="M30 120 L20 168 M100 120 L110 168" stroke="#8D6E63" strokeWidth="7" />
    </Svg>
  );
}

function Radio({ k }: { k: number }) {
  return (
    <Svg width={120 * k} height={170 * k} viewBox="0 0 120 170">
      <Rect x="10" y="90" width="100" height="80" fill="#8D6E63" />
      <Rect x="14" y="40" width="92" height="56" rx="10" fill="#E57373" />
      <Circle cx="44" cy="68" r="16" fill="#5D4037" />
      {[0, 1, 2].map((i) => <Circle key={i} cx="44" cy="68" r={5 + i * 4} fill="none" stroke="#8D6E63" strokeWidth="1.5" />)}
      <Rect x="68" y="56" width="28" height="10" rx="3" fill="#FFF59D" />
      <Circle cx="76" cy="80" r="5" fill="#FFCA28" /><Circle cx="92" cy="80" r="5" fill="#FFCA28" />
      <Path d="M80 40 L96 16" stroke="#5D4037" strokeWidth="3" />
      <SvgText x="100" y="30" fontSize="20" fill="#5C6BC0">♪</SvgText>
    </Svg>
  );
}

function Mesita({ k, encima }: { k: number; encima: React.ReactNode }) {
  return (
    <Svg width={170 * k} height={110 * k} viewBox="0 0 170 110">
      <Rect x="12" y="40" width="22" height="40" rx="6" fill="#FFB74D" transform="rotate(-6 23 60)" />
      <Rect x="136" y="40" width="22" height="40" rx="6" fill="#FFB74D" transform="rotate(6 147 60)" />
      <Rect x="20" y="34" width="130" height="14" rx="5" fill="#FF8A65" />
      <Rect x="30" y="48" width="8" height="54" fill="#E64A19" /><Rect x="132" y="48" width="8" height="54" fill="#E64A19" />
      {encima}
    </Svg>
  );
}

function Balanza({ k }: { k: number }) {
  return (
    <Svg width={140 * k} height={140 * k} viewBox="0 0 140 140">
      <Rect x="30" y="110" width="80" height="30" rx="4" fill="#80CBC4" />
      <Rect x="66" y="40" width="8" height="72" fill="#90A4AE" />
      <Line x1="20" y1="50" x2="120" y2="38" stroke="#78909C" strokeWidth="6" strokeLinecap="round" />
      <Path d="M12 62 Q22 76 34 62 Z" fill="#B0BEC5" /><Line x1="22" y1="51" x2="22" y2="62" stroke="#78909C" strokeWidth="2" />
      <Path d="M108 50 Q118 64 130 50 Z" fill="#B0BEC5" /><Line x1="118" y1="39" x2="118" y2="50" stroke="#78909C" strokeWidth="2" />
      <Circle cx="18" cy="56" r="5" fill="#E53935" /><Circle cx="27" cy="56" r="5" fill="#E53935" /><Circle cx="118" cy="44" r="5" fill="#E53935" />
    </Svg>
  );
}

function RinconLectura({ k }: { k: number }) {
  return (
    <Svg width={190 * k} height={120 * k} viewBox="0 0 190 120">
      <Ellipse cx="70" cy="96" rx="50" ry="20" fill="#BA68C8" />
      <Ellipse cx="70" cy="90" rx="44" ry="15" fill="#CE93D8" />
      <Rect x="120" y="30" width="60" height="80" fill="#8D6E63" />
      {[0, 1, 2, 3].map((i) => <Rect key={i} x={124 + i * 13} y="38" width="11" height="30" fill={["#EF5350", "#42A5F5", "#66BB6A", "#FFCA28"][i]} />)}
      {[0, 1, 2].map((i) => <Rect key={i} x={126 + i * 17} y="76" width="14" height="28" fill={["#AB47BC", "#FF7043", "#26A69A"][i]} />)}
      <Path d="M50 74 L70 66 L90 74 L90 88 L70 80 L50 88 Z" fill="#fff" stroke="#42A5F5" strokeWidth="2" />
      <SvgText x="62" y="80" fontSize="10">🐒</SvgText>
    </Svg>
  );
}

function Cuentas({ k }: { k: number }) {
  return (
    <Svg width={160 * k} height={90 * k} viewBox="0 0 160 90">
      <Path d="M10 60 Q80 30 150 60" stroke="#8D6E63" strokeWidth="2" fill="none" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 18 + i * 16, y = 60 - Math.sin((i / 8) * Math.PI) * 22;
        return <Circle key={i} cx={x} cy={y} r="7" fill={["#E53935", "#1E88E5", "#FDD835"][i % 3]} />;
      })}
      <Rect x="40" y="66" width="80" height="18" rx="6" fill="#FFE082" />
    </Svg>
  );
}

function Acuarelas({ k }: { k: number }) {
  return (
    <Svg width={160 * k} height={90 * k} viewBox="0 0 160 90">
      <Rect x="14" y="36" width="132" height="40" rx="8" fill="#fff" stroke="#B0BEC5" strokeWidth="3" />
      {["#E53935", "#FB8C00", "#FDD835", "#43A047", "#1E88E5", "#8E24AA"].map((c, i) => <Ellipse key={c} cx={30 + i * 20} cy="56" rx="8" ry="7" fill={c} />)}
      <Path d="M120 30 L150 6" stroke="#8D6E63" strokeWidth="4" strokeLinecap="round" />
      <Path d="M120 30 L114 38 L124 34 Z" fill="#1E88E5" />
    </Svg>
  );
}

function Canasta({ k }: { k: number }) {
  return (
    <Svg width={150 * k} height={100 * k} viewBox="0 0 150 100">
      <Path d="M40 40 Q75 0 110 40" stroke="#A1887F" strokeWidth="5" fill="none" />
      <SvgText x="52" y="50" fontSize="26">🥕</SvgText>
      <SvgText x="80" y="46" fontSize="24">🥦</SvgText>
      <Path d="M28 44 L122 44 L110 92 L40 92 Z" fill="#D7A86E" />
      {[56, 70, 84].map((y) => <Line key={y} x1="32" y1={y} x2="118" y2={y} stroke="#A1887F" strokeWidth="2" />)}
    </Svg>
  );
}

const estilos = StyleSheet.create({
  todos: { position: "absolute", top: 74, right: 12, backgroundColor: "#fff", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 3, borderColor: "#5C6BC0" },
  todosTexto: { fontSize: 20, fontWeight: "900", color: "#3B2F5C" },
  velo: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", padding: 16 },
  caja: { backgroundColor: "#FFF8E1", borderRadius: 28, padding: 16, maxWidth: 1000, maxHeight: "92%", alignItems: "center" },
  salas: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 14, paddingBottom: 12 },
  puerta: { width: 130, height: 140, borderTopLeftRadius: 65, borderTopRightRadius: 65, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 6, borderColor: "#fff" },
  emoji: { fontSize: 54 },
  nombre: { fontSize: 18, textAlign: "center", fontWeight: "800", color: "#fff" },
  cerrar: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8, marginTop: 4 },
});
