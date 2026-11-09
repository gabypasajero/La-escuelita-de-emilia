import { router, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";
import { Bandada, Nube, Sol } from "../components/Ambiente";
import { AnimalVivo } from "../components/AnimalesVivos";
import { Pantalla } from "../components/Pantalla";
import { EmiliaDibujo, Globo, TitoDibujo, useRespirar } from "../components/Personajes";
import { AMIGOS, type Amigo, type AmigoId } from "../lib/amigos";
import { useJuego } from "../lib/juego";
import { hablar, hablarYEsperar } from "../lib/voz";
import { LuzDelDia } from "../components/LuzDelDia";

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
  const { width, height } = useWindowDimensions();
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
      {/* Fondo a pantalla completa: cielo, barrio, vereda y calle */}
      <View pointerEvents="none" style={[estilos.mundo, { width, height }]}>
        <Fondo ancho={width} alto={height} />
        <View style={estilos.vereda} />
        <View style={estilos.calle}>
          {Array.from({ length: Math.ceil(width / 90) }, (_, i) => <View key={i} style={estilos.linea} />)}
        </View>
      </View>
      <View style={estilos.escena}>
        <Refugio />
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

/** Cielo con sol y nubes que pasan, pájaros, cerros, casitas y árboles del barrio. */
function Fondo({ ancho, alto }: { ancho: number; alto: number }) {
  const e = ancho / 1100;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 1100 600" preserveAspectRatio="xMidYMax slice">
        <Path d="M0 420 Q150 250 320 400 Q480 230 660 400 Q820 260 1100 390 V600 H0 Z" fill="#AED581" />
        <Path d="M0 460 Q200 360 420 450 Q650 350 880 450 Q1000 400 1100 440 V600 H0 Z" fill="#9CCC65" />
        {[[200, "#FFAB91", "#E64A19"], [470, "#CE93D8", "#7B1FA2"], [760, "#90CAF9", "#1565C0"]].map(([x, c, t]) => (
          <G key={x as number}>
            <Rect x={x as number} y="400" width="100" height="70" fill={c as string} stroke="#fff" strokeWidth="3" />
            <Path d={`M${(x as number) - 10} 402 L${(x as number) + 50} 352 L${(x as number) + 110} 402 Z`} fill={t as string} />
            <Rect x={(x as number) + 14} y="416" width="22" height="20" fill="#FFF9C4" stroke="#fff" strokeWidth="2" />
            <Rect x={(x as number) + 60} y="430" width="24" height="40" rx="3" fill="#795548" />
          </G>
        ))}
        {([[120, 470], [380, 470], [680, 470], [1010, 470]] as const).map(([x, y]) => (
          <G key={x}>
            <Rect x={x - 5} y={y - 34} width="10" height="34" fill="#6D4C41" />
            <Circle cx={x} cy={y - 56} r="28" fill="#43A047" />
            <Circle cx={x - 18} cy={y - 40} r="18" fill="#43A047" />
            <Circle cx={x + 18} cy={y - 42} r="19" fill="#388E3C" />
          </G>
        ))}
        {/* Arbustos con flores a la orilla de la vereda */}
        {Array.from({ length: 12 }, (_, i) => 40 + i * 95).map((x, i) => (
          <G key={x}>
            <Ellipse cx={x} cy="478" rx="30" ry="14" fill="#7CB342" />
            <Circle cx={x - 10} cy="472" r="4" fill={["#F06292", "#FFCA28", "#BA68C8"][i % 3]} />
            <Circle cx={x + 12} cy="474" r="4" fill={["#FFCA28", "#BA68C8", "#F06292"][i % 3]} />
          </G>
        ))}
      </Svg>
      <Sol k={e} x={880} y={90} r={40} />
      <Nube escala={e} ancho={1100} y={40} ms={70000} retraso={0} tam={170} sombra={false} />
      <Nube escala={e} ancho={1100} y={150} ms={95000} retraso={25000} tam={140} sombra={false} />
      <Nube escala={e} ancho={1100} y={90} ms={80000} retraso={50000} tam={120} sombra={false} />
      <Bandada escala={e} ancho={1100} y={200} ms={17000} retraso={5000} />
      <LuzDelDia k={e} ancho={1100} alto={Math.ceil(alto / e)} cielo={300} suelo={{ yMin: 380, yMax: Math.ceil(alto / e) - 150 }} />
    </View>
  );
}

/** Refugio del paradero: techo, vidrio con mapa, banca y un pajarito en el techo. */
function Refugio() {
  return (
    <View style={estilos.refugio} pointerEvents="none">
      <Svg width={250} height={217} viewBox="0 0 300 260">
        <Rect x="10" y="40" width="10" height="220" fill="#78909C" />
        <Rect x="280" y="40" width="10" height="220" fill="#78909C" />
        <Path d="M0 30 L300 30 L290 52 L10 52 Z" fill="#26A69A" />
        <Rect x="0" y="22" width="300" height="10" rx="4" fill="#00897B" />
        <Rect x="24" y="60" width="252" height="130" rx="6" fill="#E0F7FA" opacity="0.55" stroke="#B2EBF2" strokeWidth="3" />
        {/* Mapa del recorrido */}
        <Rect x="200" y="74" width="62" height="80" rx="4" fill="#fff" />
        <Path d="M210 140 Q220 110 236 120 T254 86" stroke="#E53935" strokeWidth="3" fill="none" />
        {[[210, 140], [236, 120], [254, 86]].map(([x, y]) => <Circle key={x} cx={x} cy={y} r="4" fill="#1E88E5" />)}
        <Line x1="40" y1="80" x2="80" y2="120" stroke="#fff" strokeWidth="5" opacity="0.7" />
        {/* Banca */}
        <Rect x="30" y="200" width="160" height="12" rx="4" fill="#8D6E63" />
        <Rect x="40" y="212" width="8" height="46" fill="#5D4037" />
        <Rect x="172" y="212" width="8" height="46" fill="#5D4037" />
      </Svg>
      <View style={estilos.pajaroTecho}><AnimalVivo id="pajaro" alto={30} /></View>
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
      {/* Pasajeros y el chofer saludando */}
      <Circle cx="58" cy="70" r="10" fill="#FFCC80" />
      <Path d="M48 66 Q58 54 68 66 Z" fill="#5D4037" />
      <Circle cx="128" cy="72" r="9" fill="#C68B59" />
      <Path d="M119 68 Q128 58 137 68 Z" fill="#212121" />
      <Path d="M318 60 h20 v40 h-20 Z" fill="#B3E5FC" />
      <Circle cx="330" cy="76" r="8" fill="#F1C7A5" />
      <Rect x="322" y="64" width="16" height="5" rx="2" fill="#1565C0" />
      {/* Puerta */}
      <Rect x="250" y="40" width="58" height="110" rx="6" fill="#81D4FA" stroke="#fff" strokeWidth="4" />
      <Path d="M279 42 V148" stroke="#fff" strokeWidth="3" />
      {/* Letrero del bus */}
      <Rect x="40" y="2" width="200" height="26" rx="8" fill="#3B2F5C" />
      <Circle cx="340" cy="140" r="6" fill="#FFF59D" />
      <Circle cx="80" cy="162" r="24" fill="#37474F" />
      <Circle cx="80" cy="162" r="10" fill="#B0BEC5" />
      <Circle cx="280" cy="162" r="24" fill="#37474F" />
      <Circle cx="280" cy="162" r="10" fill="#B0BEC5" />
    </Svg>
  );
}

const estilos = StyleSheet.create({
  mundo: { position: "absolute", top: 0, left: 0 },
  escena: { width: "100%", maxWidth: 1100, flex: 1, position: "relative" },
  refugio: { position: "absolute", left: 70, bottom: 92 },
  pajaroTecho: { position: "absolute", left: 180, top: -10 },
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
