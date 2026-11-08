import { router, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { Pantalla } from "../components/Pantalla";
import { EmiliaDibujo, Globo, TitoDibujo, useRespirar } from "../components/Personajes";
import { AMIGOS, type Amigo, type AmigoId } from "../lib/amigos";
import { useJuego } from "../lib/juego";
import { hablar, hablarYEsperar } from "../lib/voz";

/** Amigos que el niño ya conoció en esta sesión (la segunda vez es más corto). */
const conocidos = new Set<AmigoId>();
let busVisto = false;

type Quien = "emilia" | AmigoId;

/**
 * Paradero de los amigos: llega el bus y bajan Max (inglés), Bia (portugués),
 * Léa (francés) y Xiao Lin (chino). El niño toca a uno para conocerlo e ir a
 * su casa. Emilia los presenta en español; cada amigo habla solo su idioma.
 */
export default function Paradero() {
  const { width } = useWindowDimensions();
  const { perfil } = useJuego();
  const nombre = perfil?.nombre ?? "";
  const bus = useRef(new Animated.Value(width + 50)).current;
  const bajan = useRef(new Animated.Value(0)).current;
  const [globo, setGlobo] = useState<{ quien: Quien; texto: string }>({ quien: "emilia", texto: "¡Llegó el bus!" });
  const [listos, setListos] = useState(false);
  const [elegido, setElegido] = useState<Amigo | null>(null);
  const [puedeIr, setPuedeIr] = useState(false);
  const ocupado = useRef(false);
  const respirar = useRespirar(3);
  const saltos = useRef(Object.fromEntries(AMIGOS.map((a) => [a.id, new Animated.Value(0)])) as Record<AmigoId, Animated.Value>).current;
  const vivo = useRef(true);

  const decir = async (quien: Quien, texto: string) => {
    if (!vivo.current) return;
    setGlobo({ quien, texto });
    const amigo = AMIGOS.find((a) => a.id === quien);
    await hablarYEsperar(texto, 250, amigo ? amigo.idioma : "es");
  };
  const saltar = (id: AmigoId) =>
    Animated.sequence([
      Animated.timing(saltos[id], { toValue: -26, duration: 170, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(saltos[id], { toValue: 0, duration: 230, easing: Easing.bounce, useNativeDriver: false }),
    ]).start();

  useEffect(() => {
    vivo.current = true;
    const llegada = new Promise<void>((r) =>
      Animated.timing(bus, { toValue: 0, duration: 2400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(() => r()),
    );
    (async () => {
      if (!busVisto) await decir("emilia", "¡Llegó el bus! Hoy vienen mis amigos de otros países.");
      await llegada;
      if (!vivo.current) return;
      Animated.timing(bajan, { toValue: 1, duration: 700, useNativeDriver: false }).start();
      if (!busVisto) {
        // Cada amigo saluda en su idioma al bajar.
        for (const a of AMIGOS) {
          saltar(a.id);
          await decir(a.id, a.hola);
        }
      }
      busVisto = true;
      setListos(true);
      await decir("emilia", "¿Con quién quieres jugar? Toca a un amigo para conocerlo.");
    })();
    return () => {
      vivo.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tocar = async (a: Amigo) => {
    if (!listos || ocupado.current) return;
    saltar(a.id);
    if (elegido?.id === a.id && puedeIr) {
      const f = a.toques(nombre)[Math.floor(Math.random() * 5)]!;
      setGlobo({ quien: a.id, texto: f });
      return void hablar(f, a.idioma);
    }
    ocupado.current = true;
    setElegido(a);
    setPuedeIr(false);
    if (!conocidos.has(a.id)) {
      await decir(a.id, a.presentarse(nombre));
      await decir("emilia", a.presentacion);
      conocidos.add(a.id);
    } else {
      await decir(a.id, a.deNuevo(nombre));
    }
    await decir(a.id, a.invitar);
    ocupado.current = false;
    if (vivo.current) setPuedeIr(true);
  };

  const posicion = (quien: Quien) => (quien === "emilia" ? 120 : 300 + AMIGOS.findIndex((a) => a.id === quien) * 125);

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
          <EmiliaDibujo alto={190} expresion={globo.quien === "emilia" ? "saludando" : "feliz"} />
          <TitoDibujo alto={70} />
        </Animated.View>
        {/* El bus */}
        <Animated.View style={[estilos.bus, { transform: [{ translateX: bus }] }]}>
          <Bus />
        </Animated.View>
        {/* Los amigos bajan del bus */}
        {AMIGOS.map((a, i) => (
          <Animated.View key={a.id} style={[estilos.amigo, { left: 300 + i * 125, opacity: bajan, transform: [{ translateY: saltos[a.id] }] }]}>
            <Pressable onPress={() => void tocar(a)} accessibilityLabel={a.nombre} style={estilos.amigoToque}>
              <a.Dibujo alto={175} saludando={globo.quien === a.id} />
              <View style={[estilos.placa, { backgroundColor: a.color }, elegido?.id === a.id && estilos.placaElegida]}>
                <Text style={estilos.placaTexto}>{a.bandera} {a.nombre}</Text>
              </View>
            </Pressable>
          </Animated.View>
        ))}
        <View style={[estilos.globo, { left: Math.max(90, posicion(globo.quien) - 40) }]} pointerEvents="none">
          <Globo texto={globo.texto} />
        </View>
      </View>
      {elegido && puedeIr && (
        <Pressable style={[estilos.casa, { backgroundColor: elegido.color }]} onPress={() => router.push(`/amigo/${elegido.id}` as Href)} accessibilityLabel={`Casa de ${elegido.nombre}`}>
          <Text style={estilos.casaTexto}>🏠 Casa de {elegido.nombre}</Text>
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
  escena: { width: "100%", maxWidth: 1100, flex: 1, position: "relative", overflow: "hidden" },
  vereda: { position: "absolute", left: 0, right: 0, bottom: 70, height: 50, backgroundColor: "#CFD8DC" },
  calle: { position: "absolute", left: 0, right: 0, bottom: 0, height: 70, backgroundColor: "#546E7A", flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  linea: { width: 40, height: 6, backgroundColor: "#FFF59D", borderRadius: 3 },
  letrero: { position: "absolute", left: 20, bottom: 95 },
  emilia: { position: "absolute", left: 90, bottom: 85, flexDirection: "row", alignItems: "flex-end" },
  bus: { position: "absolute", right: -150, bottom: 40 },
  amigo: { position: "absolute", bottom: 78, alignItems: "center" },
  amigoToque: { alignItems: "center" },
  placa: { marginTop: -4, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 2, borderColor: "#fff" },
  placaElegida: { borderColor: "#FFD54F", transform: [{ scale: 1.12 }] },
  placaTexto: { color: "#fff", fontWeight: "900", fontSize: 14 },
  globo: { position: "absolute", bottom: 300, maxWidth: 440 },
  casa: { position: "absolute", top: 20, right: 150, borderRadius: 30, paddingHorizontal: 26, paddingVertical: 14, borderWidth: 4, borderColor: "#fff" },
  casaTexto: { color: "#fff", fontSize: 24, fontWeight: "900" },
});
