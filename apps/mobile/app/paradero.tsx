import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { Pantalla } from "../components/Pantalla";
import { EmiliaDibujo, Globo, MaxDibujo, TitoDibujo, useRespirar, useSalto } from "../components/Personajes";
import { useJuego } from "../lib/juego";
import { hablar, hablarYEsperar } from "../lib/voz";

/** Ya se conocieron en esta sesión: la segunda vez la llegada es más corta. */
let maxConocido = false;

const FRASES_MAX = (nombre: string) => [`Hello, ${nombre}!`, "High five!", "I like animals!", "Let's play!", "You are my friend!"];

/**
 * Paradero de los amigos: llega el bus y baja Max, que viene de lejos y habla
 * inglés. Emilia lo presenta en español la primera vez; Max habla solo inglés.
 */
export default function Paradero() {
  const { width } = useWindowDimensions();
  const { perfil } = useJuego();
  const nombre = perfil?.nombre ?? "friend";
  const bus = useRef(new Animated.Value(width + 50)).current;
  const max = useRef(new Animated.Value(0)).current;
  const [globo, setGlobo] = useState({ quien: "emilia" as "emilia" | "max", texto: "¡Llegó el bus!" });
  const [listo, setListo] = useState(false);
  const respirar = useRespirar(3);
  const { y: salto, saltar } = useSalto();

  useEffect(() => {
    let vivo = true;
    const decir = async (quien: "emilia" | "max", texto: string) => {
      if (!vivo) return;
      setGlobo({ quien, texto });
      await hablarYEsperar(texto, 300, quien === "max" ? "en" : "es");
    };
    const llegada = new Promise<void>((r) =>
      Animated.timing(bus, { toValue: 0, duration: 2600, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(() => r()),
    );
    (async () => {
      if (!maxConocido) await decir("emilia", "¡Llegó el bus! Hoy viene un amigo de muy lejos.");
      await llegada;
      if (!vivo) return;
      Animated.timing(max, { toValue: 1, duration: 600, useNativeDriver: false }).start();
      await decir("max", maxConocido ? `Hello again, ${nombre}!` : `Hello! I'm Max! Hello, ${nombre}!`);
      if (!maxConocido) await decir("emilia", "Es Max. Él habla inglés, otro idioma. ¡Escuchemos bien y juguemos con él!");
      await decir("max", "Come to my house! Let's play!");
      maxConocido = true;
      if (vivo) setListo(true);
    })();
    return () => {
      vivo = false;
    };
  }, [bus, max, nombre]);

  const tocarMax = () => {
    saltar();
    const frases = FRASES_MAX(nombre);
    const f = frases[Math.floor(Math.random() * frases.length)]!;
    setGlobo({ quien: "max", texto: f });
    void hablar(f, "en");
  };

  return (
    <Pantalla color="#B3E5FC">
      <View style={estilos.escena}>
        <Fondo />
        {/* Calle */}
        <View style={estilos.vereda} />
        <View style={estilos.calle}>
          {Array.from({ length: 12 }, (_, i) => <View key={i} style={estilos.linea} />)}
        </View>
        {/* Letrero del paradero */}
        <View style={estilos.letrero}>
          <Svg width={70} height={170} viewBox="0 0 70 170">
            <Rect x="31" y="40" width="8" height="130" fill="#78909C" />
            <Rect x="5" y="4" width="60" height="44" rx="8" fill="#1E88E5" stroke="#fff" strokeWidth="4" />
            <Path d="M17 16 h36 v18 h-36 Z" fill="#fff" />
            <Circle cx="24" cy="37" r="4" fill="#fff" />
            <Circle cx="46" cy="37" r="4" fill="#fff" />
          </Svg>
        </View>
        {/* Emilia y Tito esperando */}
        <Animated.View style={[estilos.emilia, { transform: [{ translateY: respirar }] }]}>
          <EmiliaDibujo alto={200} />
          <TitoDibujo alto={74} />
        </Animated.View>
        {/* El bus */}
        <Animated.View style={[estilos.bus, { transform: [{ translateX: bus }] }]}>
          <Bus />
        </Animated.View>
        {/* Max baja del bus */}
        <Animated.View style={[estilos.max, { opacity: max, transform: [{ translateY: salto }] }]}>
          <Pressable onPress={tocarMax} accessibilityLabel="Max">
            <MaxDibujo alto={205} saludando />
          </Pressable>
        </Animated.View>
        <View style={[estilos.globo, globo.quien === "max" ? estilos.globoMax : estilos.globoEmilia]}>
          <Globo texto={globo.texto} />
        </View>
      </View>
      {listo && (
        <Pressable style={estilos.casa} onPress={() => router.push("/max")} accessibilityLabel="Casa de Max">
          <Text style={estilos.casaTexto}>🏠 Casa de Max</Text>
        </Pressable>
      )}
    </Pantalla>
  );
}

/** Cielo con sol y nubes, cerros y casitas del barrio al fondo. */
function Fondo() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 1100 600" preserveAspectRatio="xMidYMax slice">
        <Circle cx="980" cy="70" r="46" fill="#FFEE58" />
        {([[160, 80], [520, 50], [780, 120]] as const).map(([x, y]) => (
          <Path key={x} d={`M${x} ${y} q20 -30 50 -10 q30 -25 60 5 q30 0 25 25 h-140 q-15 -20 5 -20 Z`} fill="#fff" opacity="0.95" />
        ))}
        <Path d="M0 420 Q150 250 320 400 Q480 230 660 400 Q820 260 1100 390 V600 H0 Z" fill="#AED581" />
        <Path d="M0 460 Q200 360 420 450 Q650 350 880 450 Q1000 400 1100 440 V600 H0 Z" fill="#9CCC65" />
        {[[260, "#FFAB91"], [560, "#CE93D8"], [860, "#90CAF9"]].map(([x, c]) => (
          <Path key={x as number} d={`M${x} 470 v-70 l50 -45 l50 45 v70 Z`} fill={c as string} stroke="#fff" strokeWidth="4" />
        ))}
        {([[120, 470], [430, 470], [720, 470], [1010, 470]] as const).map(([x, y]) => (
          <Path key={x} d={`M${x - 4} ${y} h8 v-30 h-8 Z M${x} ${y - 70} a28 32 0 1 0 0.1 0 Z`} fill="#43A047" />
        ))}
      </Svg>
    </View>
  );
}

function Bus() {
  return (
    <Svg width={360} height={190} viewBox="0 0 360 190">
      <Rect x="6" y="20" width="340" height="140" rx="24" fill="#FDD835" stroke="#F9A825" strokeWidth="5" />
      <Rect x="6" y="118" width="340" height="14" fill="#F57F17" />
      {[30, 100, 170].map((x) => (
        <Rect key={x} x={x} y="40" width="56" height="48" rx="8" fill="#B3E5FC" stroke="#fff" strokeWidth="3" />
      ))}
      {/* Puerta */}
      <Rect x="250" y="40" width="58" height="110" rx="6" fill="#81D4FA" stroke="#fff" strokeWidth="4" />
      <Path d="M279 42 V148" stroke="#fff" strokeWidth="3" />
      {/* Letrero del bus */}
      <Rect x="40" y="2" width="200" height="26" rx="8" fill="#3B2F5C" />
      <Path d="M326 60 h16 v26 h-16 Z" fill="#fff" opacity="0.8" />
      <Circle cx="80" cy="162" r="24" fill="#37474F" />
      <Circle cx="80" cy="162" r="10" fill="#B0BEC5" />
      <Circle cx="280" cy="162" r="24" fill="#37474F" />
      <Circle cx="280" cy="162" r="10" fill="#B0BEC5" />
    </Svg>
  );
}

const estilos = StyleSheet.create({
  escena: { width: "100%", maxWidth: 1100, flex: 1, position: "relative" },
  vereda: { position: "absolute", left: 0, right: 0, bottom: 70, height: 50, backgroundColor: "#CFD8DC" },
  calle: { position: "absolute", left: 0, right: 0, bottom: 0, height: 70, backgroundColor: "#546E7A", flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  linea: { width: 40, height: 6, backgroundColor: "#FFF59D", borderRadius: 3 },
  letrero: { position: "absolute", left: 30, bottom: 95 },
  emilia: { position: "absolute", left: 110, bottom: 85, flexDirection: "row", alignItems: "flex-end" },
  bus: { position: "absolute", right: 20, bottom: 40 },
  max: { position: "absolute", right: 360, bottom: 85 },
  globo: { position: "absolute", bottom: 310, maxWidth: 420 },
  globoEmilia: { left: 120 },
  globoMax: { right: 300 },
  casa: { position: "absolute", top: 20, right: 150, backgroundColor: "#1E88E5", borderRadius: 30, paddingHorizontal: 26, paddingVertical: 14, borderWidth: 4, borderColor: "#fff" },
  casaTexto: { color: "#fff", fontSize: 24, fontWeight: "900" },
});
