import { Redirect } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Ellipse, Line, Path, Rect } from "react-native-svg";
import { Avatar } from "../components/Avatar";
import { BotonCasa } from "../components/BotonCasa";
import { EmiliaDibujo, Globo, TitoDibujo, useRespirar } from "../components/Personajes";
import { Monedas, useJuego } from "../lib/juego";
import { hablar } from "../lib/voz";

/**
 * Parque de juegos: el personaje del niño se sube al columpio (con Emilia al
 * lado, contando los vaivenes), se tira por el resbalín y juega al balancín.
 * Escena en unidades de diseño de 1000×620, escalada a la pantalla.
 */
type Juego = "columpio" | "resbalin" | "balancin" | null;

const SUELO = 560;
const COLUMPIOS = { y: 220, cuerda: 200, ninoX: 170, emiliaX: 290 };
const RESBALIN = { escaleraX: 520, arriba: 300, finX: 790, finY: 520 };
const BALANCIN = { x: 975, y: 500, largo: 210 };
const INICIO = { x: 430, y: SUELO };

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
const animar = (a: Animated.CompositeAnimation) => new Promise<void>((r) => a.start(() => r()));

export default function Plaza() {
  const { perfil, accesorioPuesto } = useJuego();
  const { width, height } = useWindowDimensions();
  const k = Math.min(width / 1100, height / 620);
  const [juego, setJuego] = useState<Juego>(null);
  const [dicho, setDicho] = useState("¡Llegamos al parque! ¿A qué jugamos?");
  const pos = useRef(new Animated.ValueXY(INICIO)).current;
  const giro = useRef(new Animated.Value(0)).current;
  const vaiven = useRef(new Animated.Value(0)).current;
  const balanceo = useRef(new Animated.Value(0)).current;
  const tito = useRespirar(6, 500);

  useEffect(() => void hablar("¡Llegamos al parque! ¿A qué jugamos? Toca el columpio, el resbalín o el balancín."), []);

  const decir = (t: string) => {
    setDicho(t);
    return hablar(t);
  };

  async function columpio() {
    setJuego("columpio");
    void decir("¡Al columpio! Contemos cada vez que vamos adelante.");
    const ida = Animated.timing(vaiven, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: false });
    const vuelta = Animated.timing(vaiven, { toValue: -1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: false });
    for (let n = 1; n <= 5; n++) {
      await animar(ida);
      void decir(["¡Uno!", "¡Dos!", "¡Tres!", "¡Cuatro!", "¡Cinco!"][n - 1]!);
      await animar(vuelta);
    }
    await animar(Animated.timing(vaiven, { toValue: 0, duration: 700, easing: Easing.out(Easing.sin), useNativeDriver: false }));
    await decir("¡Cinco vaivenes! ¡Qué alto llegamos!");
    setJuego(null);
  }

  async function resbalin() {
    setJuego("resbalin");
    void decir("¡Subimos la escalera con cuidado!");
    await animar(Animated.timing(pos, { toValue: { x: RESBALIN.escaleraX, y: SUELO }, duration: 600, useNativeDriver: false }));
    await animar(Animated.timing(pos, { toValue: { x: RESBALIN.escaleraX + 20, y: RESBALIN.arriba }, duration: 1300, easing: Easing.linear, useNativeDriver: false }));
    await animar(Animated.timing(pos, { toValue: { x: RESBALIN.escaleraX + 70, y: RESBALIN.arriba }, duration: 400, useNativeDriver: false }));
    void decir("¡A la una, a las dos y a las tres! ¡Wiii!");
    await espera(900);
    await animar(Animated.parallel([
      Animated.timing(pos, { toValue: { x: RESBALIN.finX, y: RESBALIN.finY + 40 }, duration: 800, easing: Easing.in(Easing.quad), useNativeDriver: false }),
      Animated.sequence([
        Animated.timing(giro, { toValue: -1, duration: 150, useNativeDriver: false }),
        Animated.delay(500),
        Animated.timing(giro, { toValue: 0, duration: 150, useNativeDriver: false }),
      ]),
    ]));
    await animar(Animated.spring(pos, { toValue: { x: RESBALIN.finX + 40, y: SUELO }, useNativeDriver: false }));
    await decir("¡Qué rápido! ¿Otra vez?");
    await animar(Animated.timing(pos, { toValue: INICIO, duration: 900, useNativeDriver: false }));
    setJuego(null);
  }

  async function balancin() {
    setJuego("balancin");
    void decir("¡Al balancín con Emilia! Arriba y abajo.");
    for (let n = 0; n < 4; n++) {
      await animar(Animated.timing(balanceo, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: false }));
      void decir(n % 2 ? "¡Abajo!" : "¡Arriba!");
      await animar(Animated.timing(balanceo, { toValue: -1, duration: 800, easing: Easing.inOut(Easing.quad), useNativeDriver: false }));
    }
    await animar(Animated.timing(balanceo, { toValue: 0, duration: 500, useNativeDriver: false }));
    await decir("¡Qué entretenido es el balancín!");
    setJuego(null);
  }

  if (!perfil) return <Redirect href="/quien-juega" />;
  const accesorios = { cabeza: accesorioPuesto("cabeza"), cara: accesorioPuesto("cara"), cuello: accesorioPuesto("cuello"), mano: accesorioPuesto("mano") };
  const avH = 130 * k;
  const avW = (avH * 100) / 160;
  const tocar = (f: () => Promise<void>) => () => {
    if (!juego) void f();
  };

  // Columpio: cuerda + asiento + quien se sienta, girando desde arriba.
  const Columpio = ({ x, quien }: { x: number; quien: "nino" | "emilia" }) => {
    const ocupado = juego === "columpio";
    const alto = COLUMPIOS.cuerda * k;
    return (
      <Animated.View
        style={{
          position: "absolute", left: x * k - 50 * k, top: COLUMPIOS.y * k, width: 100 * k, height: alto + 20 * k,
          transformOrigin: "top",
          transform: [{ rotate: vaiven.interpolate({ inputRange: [-1, 1], outputRange: ["-28deg", "28deg"] }) }],
        }}
      >
        <View style={[estilos.cuerda, { left: 22 * k, height: alto }]} />
        <View style={[estilos.cuerda, { right: 22 * k, height: alto }]} />
        <View style={[estilos.asiento, { top: alto - 6 * k, height: 12 * k }]} />
        {ocupado && (
          <View style={{ position: "absolute", left: 50 * k - avW / 2, top: alto - avH * 0.72 }}>
            {quien === "nino" ? <Avatar apariencia={perfil.apariencia} alto={avH} accesorios={accesorios} /> : <EmiliaDibujo alto={avH} />}
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={estilos.fondo}>
      <View style={{ width: 1100 * k, height: 620 * k, alignSelf: "center" }}>
        <Svg width={1100 * k} height={620 * k} viewBox="0 0 1100 620" style={StyleSheet.absoluteFill}>
          <Rect x="0" y="0" width="1100" height="620" fill="#B3E5FC" />
          <Circle cx="1010" cy="80" r="50" fill="#FFEB3B" />
          <Ellipse cx="200" cy="90" rx="80" ry="26" fill="#fff" />
          <Rect x="0" y="470" width="1100" height="150" fill="#9CCC65" />
          <Ellipse cx="550" cy="560" rx="520" ry="60" fill="#FFE0B2" />
          {/* Estructura de los columpios */}
          <Line x1="110" y1="215" x2="70" y2="560" stroke="#E53935" strokeWidth="14" strokeLinecap="round" />
          <Line x1="350" y1="215" x2="390" y2="560" stroke="#E53935" strokeWidth="14" strokeLinecap="round" />
          <Line x1="100" y1="215" x2="360" y2="215" stroke="#C62828" strokeWidth="16" strokeLinecap="round" />
          {/* Resbalín: escalera, plataforma y tobogán */}
          <Line x1="510" y1={SUELO} x2="530" y2="300" stroke="#1E88E5" strokeWidth="9" />
          <Line x1="560" y1={SUELO} x2="580" y2="300" stroke="#1E88E5" strokeWidth="9" />
          {[330, 370, 410, 450, 490, 530].map((y) => <Line key={y} x1={510 + (SUELO - y) * 0.077} y1={y} x2={560 + (SUELO - y) * 0.077} y2={y} stroke="#1565C0" strokeWidth="6" />)}
          <Rect x="520" y="292" width="90" height="16" rx="6" fill="#1565C0" />
          <Path d="M600 300 Q 700 320 790 520 L 830 530 L 830 548 L 780 548 Q 690 340 600 320 Z" fill="#FDD835" stroke="#F9A825" strokeWidth="4" />
          {/* Base del balancín */}
          <Path d={`M${BALANCIN.x - 30} ${SUELO} L${BALANCIN.x} ${BALANCIN.y} L${BALANCIN.x + 30} ${SUELO} Z`} fill="#8D6E63" />
        </Svg>

        <Columpio x={COLUMPIOS.ninoX} quien="nino" />
        <Columpio x={COLUMPIOS.emiliaX} quien="emilia" />

        {/* Balancín: la tabla gira con el niño en un lado y Emilia en el otro */}
        <Animated.View
          style={{
            position: "absolute", left: (BALANCIN.x - BALANCIN.largo / 2) * k, top: BALANCIN.y * k - 8 * k, width: BALANCIN.largo * k, height: 16 * k,
            transform: [{ rotate: balanceo.interpolate({ inputRange: [-1, 1], outputRange: ["-14deg", "14deg"] }) }],
          }}
        >
          <View style={estilos.tabla} />
          {juego === "balancin" && (
            <>
              <View style={{ position: "absolute", left: -avW * 0.2, bottom: 6 * k }}>
                <Avatar apariencia={perfil.apariencia} alto={avH * 0.85} accesorios={accesorios} />
              </View>
              <View style={{ position: "absolute", right: -avW * 0.2, bottom: 6 * k }}>
                <EmiliaDibujo alto={avH * 0.85} />
              </View>
            </>
          )}
        </Animated.View>

        {/* Zonas para tocar cada juego */}
        <Pressable accessibilityLabel="Columpio" onPress={tocar(columpio)} style={[estilos.zona, { left: 60 * k, top: 200 * k, width: 340 * k, height: 370 * k }]} />
        <Pressable accessibilityLabel="Resbalín" onPress={tocar(resbalin)} style={[estilos.zona, { left: 490 * k, top: 280 * k, width: 360 * k, height: 290 * k }]} />
        <Pressable accessibilityLabel="Balancín" onPress={tocar(balancin)} style={[estilos.zona, { left: 860 * k, top: 400 * k, width: 230 * k, height: 170 * k }]} />

        {/* El niño (cuando no está en el columpio ni en el balancín), Emilia y Tito */}
        {juego !== "columpio" && juego !== "balancin" && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              transform: [
                { translateX: Animated.add(Animated.multiply(pos.x, k), -avW / 2) },
                { translateY: Animated.add(Animated.multiply(pos.y, k), -avH) },
                { rotate: giro.interpolate({ inputRange: [-1, 0], outputRange: ["-35deg", "0deg"] }) },
              ],
            }}
          >
            <Avatar apariencia={perfil.apariencia} alto={avH} accesorios={accesorios} />
          </Animated.View>
        )}
        {juego !== "columpio" && juego !== "balancin" && (
          <View pointerEvents="none" style={{ position: "absolute", left: 300 * k, top: SUELO * k - avH }}>
            <EmiliaDibujo alto={avH} />
          </View>
        )}
        <Animated.View pointerEvents="none" style={{ position: "absolute", left: 650 * k, top: SUELO * k - 50 * k, transform: [{ translateY: juego ? tito : 0 }] }}>
          <TitoDibujo alto={55 * k} />
        </Animated.View>
      </View>

      <View style={estilos.dialogo} pointerEvents="none">
        <Globo texto={dicho} />
      </View>
      <BotonCasa />
      <Monedas />
      <View style={estilos.botones}>
        {([["🌀", "Columpio", columpio], ["🛝", "Resbalín", resbalin], ["⚖️", "Balancín", balancin]] as const).map(([e, n, f]) => (
          <Pressable key={n} style={[estilos.boton, juego && estilos.apagado]} onPress={tocar(f)} accessibilityLabel={`Jugar ${n}`}>
            <Text style={estilos.botonEmoji}>{e}</Text>
            <Text style={estilos.botonTexto}>{n}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "#9CCC65", justifyContent: "center" },
  cuerda: { position: "absolute", top: 0, width: 4, backgroundColor: "#5D4037" },
  asiento: { position: "absolute", left: 10, right: 10, borderRadius: 6, backgroundColor: "#FB8C00" },
  tabla: { flex: 1, backgroundColor: "#43A047", borderRadius: 8, borderWidth: 3, borderColor: "#2E7D32" },
  zona: { position: "absolute" },
  dialogo: { position: "absolute", top: 14, left: 0, right: 0, alignItems: "center" },
  botones: { position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 14 },
  boton: { backgroundColor: "#fff", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 8, alignItems: "center", minWidth: 100 },
  apagado: { opacity: 0.5 },
  botonEmoji: { fontSize: 30 },
  botonTexto: { fontSize: 15, fontWeight: "800", color: "#3B2F5C" },
});
