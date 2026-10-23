import { router, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, Rect, Stop } from "react-native-svg";
import { LugarDibujo, type LugarId } from "../components/Lugares";
import { EmiliaYTito, Globo, useRespirar } from "../components/Personajes";
import { hablar } from "../lib/voz";

interface Lugar {
  id: LugarId;
  nombre: string;
  /** Lo que dice Emilia al tocarlo. */
  frase: string;
  ruta?: Href;
  /** Posición horizontal en el barrio (en "unidades" de diseño; el barrio mide 2600). */
  x: number;
}

const LUGARES: Lugar[] = [
  { id: "casa", nombre: "Mi casa", frase: "¡Esta es mi casa! Ven, te muestro el patio.", ruta: "/casa", x: 300 },
  { id: "escuelita", nombre: "La Escuelita", frase: "¡A la escuelita! Letras y números.", ruta: "/escuelita", x: 620 },
  { id: "taller", nombre: "Taller de arte", frase: "¡Qué entretenido! ¿Pintamos?", ruta: "/pintar", x: 920 },
  { id: "tiendita", nombre: "Tiendita", frase: "Doña Rosa necesita ayuda en la tiendita.", ruta: "/juegos/tiendita", x: 1220 },
  { id: "plaza", nombre: "Plaza", frase: "¡A la plaza de juegos!", ruta: "/juegos", x: 1520 },
  { id: "huerto", nombre: "Huerto", frase: "Don Pedro nos espera en el huerto.", ruta: "/huerto", x: 1820 },
  { id: "granja", nombre: "Granja", frase: "¡Vamos a ver a los animales!", ruta: "/animales", x: 2110 },
  { id: "paradero", nombre: "Paradero", frase: "Pronto llegan en bus mis amigos de otros países.", x: 2400 },
];

const ANCHO_BARRIO = 2650;
const ALTO_DISENO = 600;

function saludoDelMomento() {
  const hora = new Date().getHours();
  if (hora < 12) return "¡Buenos días! ¡Qué bueno verte! Ven a recorrer mi barrio.";
  if (hora < 20) return "¡Hola! ¿Jugamos? Desliza para recorrer el barrio.";
  return "¡Hola! Ya es de noche. Juguemos algo tranquilito.";
}

const FRASES_EMILIA = ["¿Sabes qué? ¡Me encanta jugar contigo!", "¿Adónde vamos hoy?", "¡Toca una casita para entrar!", "¡Qué entretenido es mi barrio!"];

export default function Barrio() {
  const { width, height } = useWindowDimensions();
  const escala = height / ALTO_DISENO;
  const anchoMundo = Math.max(width, ANCHO_BARRIO * escala);
  const suelo = 0.7 * height;
  const tamanoLugar = 0.36 * height;
  const [dialogo, setDialogo] = useState(saludoDelMomento);
  const [desplazo, setDesplazo] = useState(false);
  const indiceFrase = useRef(0);
  const flecha = useRespirar(10, 600);

  useEffect(() => {
    const t = setTimeout(() => hablar(dialogo), 400);
    return () => clearTimeout(t);
    // Solo al entrar al barrio.
  }, []);

  function decir(texto: string) {
    setDialogo(texto);
    hablar(texto);
  }

  function entrar(lugar: Lugar) {
    decir(lugar.frase);
    if (lugar.ruta) {
      const ruta = lugar.ruta;
      setTimeout(() => router.push(ruta), 900);
    }
  }

  return (
    <View style={estilos.fondo}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => !desplazo && e.nativeEvent.contentOffset.x > 40 && setDesplazo(true)}
        scrollEventThrottle={64}
      >
        <View style={{ width: anchoMundo, height }}>
          <Paisaje ancho={anchoMundo} alto={height} suelo={suelo} escala={escala} />

          {LUGARES.map((l) => (
            <Pressable
              key={l.id}
              accessibilityLabel={l.nombre}
              onPress={() => entrar(l)}
              style={[estilos.lugar, { left: l.x * escala - tamanoLugar / 2, top: suelo - tamanoLugar * 0.95, width: tamanoLugar }]}
            >
              <LugarDibujo id={l.id} tamano={tamanoLugar} />
              <View style={[estilos.letrero, !l.ruta && estilos.letreroPronto]}>
                <Text style={estilos.letreroTexto}>{l.ruta ? l.nombre : "Pronto"}</Text>
              </View>
            </Pressable>
          ))}

          {/* Animales de la granja y vecinos que dan vida al barrio. */}
          <Vecino emoji="🐄" x={2230 * escala} y={suelo - 20} frase="¡Muuu!" alHablar={decir} />
          <Vecino emoji="🐑" x={2010 * escala} y={suelo + 10} frase="¡Beee!" alHablar={decir} />
          <Vecino emoji="🐔" x={1965 * escala} y={suelo + 40} frase="¡Kikirikí!" alHablar={decir} />
          <Vecino emoji="🐱" x={460 * escala} y={suelo + 30} frase="¡Miau! Es el gato del barrio." alHablar={decir} />
          <Vecino emoji="🦋" x={1680 * escala} y={suelo - 0.35 * height} frase="¡Una mariposa!" alHablar={decir} />
          <Vecino emoji="🐦" x={780 * escala} y={suelo - 0.42 * height} frase="¡Pío, pío!" alHablar={decir} />
        </View>
      </ScrollView>

      {/* Emilia y Tito acompañan siempre al niño. */}
      <View style={estilos.compania} pointerEvents="box-none">
        <EmiliaYTito
          alto={Math.min(190, 0.3 * height)}
          alTocarEmilia={() => decir(FRASES_EMILIA[indiceFrase.current++ % FRASES_EMILIA.length]!)}
          alTocarTito={() => setDialogo("¡Pip! ¡Tito está feliz!")}
        />
        <View style={estilos.globo} pointerEvents="none">
          <Globo texto={dialogo} alLado="izquierda" />
        </View>
      </View>

      {!desplazo && (
        <Animated.View style={[estilos.flecha, { transform: [{ translateX: flecha }] }]} pointerEvents="none">
          <Text style={estilos.flechaTexto}>👉</Text>
        </Animated.View>
      )}

      <Pressable style={estilos.padres} accessibilityLabel="Zona de padres" onPress={() => router.push("/padres")}>
        <Text style={estilos.padresTexto}>👪 Padres</Text>
      </Pressable>
    </View>
  );
}

function Vecino({ emoji, x, y, frase, alHablar }: { emoji: string; x: number; y: number; frase: string; alHablar: (t: string) => void }) {
  const salto = useRespirar(5, 900 + (emoji.codePointAt(0)! % 5) * 120);
  return (
    <Pressable style={{ position: "absolute", left: x, top: y }} onPress={() => alHablar(frase)} accessibilityLabel={frase}>
      <Animated.Text style={[estilos.vecino, { transform: [{ translateY: salto }] }]}>{emoji}</Animated.Text>
    </Pressable>
  );
}

/** Cielo, cordillera, cerros, árboles y el camino del barrio. */
function Paisaje({ ancho, alto, suelo, escala }: { ancho: number; alto: number; suelo: number; escala: number }) {
  const noche = new Date().getHours() >= 20 || new Date().getHours() < 7;
  const montes = Array.from({ length: Math.ceil(ancho / (420 * escala)) + 1 }, (_, k) => k * 420 * escala);
  const arboles = [140, 470, 790, 1070, 1370, 1670, 1960, 2290, 2560].map((x) => x * escala);
  const nubes = [220, 900, 1500, 2150].map((x) => x * escala);
  return (
    <Svg width={ancho} height={alto} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={noche ? "#1A237E" : "#81D4FA"} />
          <Stop offset="1" stopColor={noche ? "#5C6BC0" : "#E1F5FE"} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={ancho} height={alto} fill="url(#cielo)" />
      {noche ? (
        <Circle cx={ancho * 0.12} cy={alto * 0.14} r={alto * 0.06} fill="#FFF9C4" />
      ) : (
        <G>
          <Circle cx={ancho * 0.08} cy={alto * 0.14} r={alto * 0.08} fill="#FFEB3B" />
          <Circle cx={ancho * 0.08} cy={alto * 0.14} r={alto * 0.1} fill="#FFEB3B" opacity="0.3" />
        </G>
      )}
      {!noche &&
        nubes.map((x) => (
          <G key={x}>
            <Ellipse cx={x} cy={alto * 0.12} rx={60 * escala} ry={22 * escala} fill="#fff" />
            <Ellipse cx={x + 40 * escala} cy={alto * 0.1} rx={44 * escala} ry={26 * escala} fill="#fff" />
          </G>
        ))}
      {/* Cordillera con nieve */}
      {montes.map((x) => (
        <G key={x}>
          <Polygon points={`${x - 60 * escala},${suelo} ${x + 150 * escala},${alto * 0.2} ${x + 360 * escala},${suelo}`} fill={noche ? "#3949AB" : "#90A4AE"} />
          <Polygon points={`${x + 108 * escala},${alto * 0.28} ${x + 150 * escala},${alto * 0.2} ${x + 192 * escala},${alto * 0.28}`} fill="#fff" />
        </G>
      ))}
      {/* Cerros y pasto */}
      <Path d={`M0 ${suelo - 30 * escala} Q ${ancho / 4} ${suelo - 90 * escala} ${ancho / 2} ${suelo - 30 * escala} T ${ancho} ${suelo - 30 * escala} V ${alto} H 0 Z`} fill={noche ? "#2E7D32" : "#9CCC65"} />
      <Rect x="0" y={suelo} width={ancho} height={alto - suelo} fill={noche ? "#33691E" : "#7CB342"} />
      {/* Camino */}
      <Rect x="0" y={suelo + 0.08 * alto} width={ancho} height={0.07 * alto} fill="#D7CCC8" />
      {Array.from({ length: Math.ceil(ancho / 80) }, (_, k) => (
        <Rect key={k} x={k * 80 + 20} y={suelo + 0.11 * alto} width="36" height="5" rx="2" fill="#fff" />
      ))}
      {/* Árboles (araucarias y árboles redondos) */}
      {arboles.map((x, k) =>
        k % 2 ? (
          <G key={x}>
            <Rect x={x - 6 * escala} y={suelo - 70 * escala} width={12 * escala} height={70 * escala} fill="#6D4C41" />
            <Circle cx={x} cy={suelo - 90 * escala} r={42 * escala} fill="#43A047" />
            <Circle cx={x - 22 * escala} cy={suelo - 70 * escala} r={26 * escala} fill="#388E3C" />
          </G>
        ) : (
          <G key={x}>
            <Rect x={x - 5 * escala} y={suelo - 150 * escala} width={10 * escala} height={150 * escala} fill="#5D4037" />
            {[0, 1, 2].map((n) => (
              <Path key={n} d={`M${x - (60 - n * 14) * escala} ${suelo - (110 + n * 34) * escala} Q ${x} ${suelo - (140 + n * 34) * escala} ${x + (60 - n * 14) * escala} ${suelo - (110 + n * 34) * escala}`} stroke="#2E7D32" strokeWidth={12 * escala} fill="none" strokeLinecap="round" />
            ))}
          </G>
        ),
      )}
    </Svg>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "#E1F5FE" },
  lugar: { position: "absolute", alignItems: "center" },
  letrero: { marginTop: -6, backgroundColor: "#8D6E63", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 2, borderColor: "#5D4037" },
  letreroPronto: { backgroundColor: "#9E9E9E", borderColor: "#757575" },
  letreroTexto: { color: "#fff", fontWeight: "800", fontSize: 16 },
  vecino: { fontSize: 40 },
  compania: { position: "absolute", left: 12, bottom: 8, flexDirection: "row", alignItems: "flex-start" },
  globo: { marginLeft: 4, marginTop: 4 },
  flecha: { position: "absolute", right: 24, top: "45%" },
  flechaTexto: { fontSize: 48 },
  padres: { position: "absolute", top: 12, right: 12, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  padresTexto: { fontSize: 14, color: "#3B2F5C" },
});
