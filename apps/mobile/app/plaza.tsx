import { Redirect, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { Abeja, Bandada, MariposaVolando, Nube, Sol } from "../components/Ambiente";
import { AnimalPaseando, AnimalVivo } from "../components/AnimalesVivos";
import { Avatar } from "../components/Avatar";
import { BotonCasa } from "../components/BotonCasa";
import { EmiliaDibujo, Globo, TitoDibujo, useRespirar } from "../components/Personajes";
import { DESBLOQUEOS, Monedas, useJuego } from "../lib/juego";
import { hablar } from "../lib/voz";
import { LuzDelDia, VeloPantalla } from "../components/LuzDelDia";
import { SombraContacto, VinetaPantalla } from "../components/AmbienteInterior";

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
  const { perfil, accesorioPuesto, estrellas } = useJuego();
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
      <View pointerEvents="none" style={estilos.pasto} />
      <VeloPantalla />
      <View style={{ width: 1100 * k, height: 620 * k, alignSelf: "center" }}>
        <Svg width={1100 * k} height={620 * k} viewBox="0 0 1100 620" style={StyleSheet.absoluteFill}>
          <FondoParque />
          {/* Estructura de los columpios */}
          <Line x1="110" y1="215" x2="70" y2="560" stroke="#E53935" strokeWidth="14" strokeLinecap="round" />
          <Line x1="350" y1="215" x2="390" y2="560" stroke="#E53935" strokeWidth="14" strokeLinecap="round" />
          <Line x1="100" y1="215" x2="360" y2="215" stroke="#C62828" strokeWidth="16" strokeLinecap="round" />
          <Line x1="106" y1="225" x2="68" y2="556" stroke="#fff" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" />
          <Line x1="346" y1="225" x2="384" y2="556" stroke="#fff" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" />
          <Line x1="106" y1="210" x2="354" y2="210" stroke="#fff" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" />
          {/* Resbalín: escalera, plataforma y tobogán */}
          <Line x1="510" y1={SUELO} x2="530" y2="300" stroke="#1E88E5" strokeWidth="9" />
          <Line x1="560" y1={SUELO} x2="580" y2="300" stroke="#1E88E5" strokeWidth="9" />
          {[330, 370, 410, 450, 490, 530].map((y) => <Line key={y} x1={510 + (SUELO - y) * 0.077} y1={y} x2={560 + (SUELO - y) * 0.077} y2={y} stroke="#1565C0" strokeWidth="6" />)}
          <Rect x="520" y="292" width="90" height="16" rx="6" fill="#1565C0" />
          <Path d="M600 300 Q 700 320 790 520 L 830 530 L 830 548 L 780 548 Q 690 340 600 320 Z" fill="#FDD835" stroke="#F9A825" strokeWidth="4" />
          <Path d="M604 304 Q 698 322 786 516" stroke="#fff" strokeOpacity="0.55" strokeWidth="4" fill="none" strokeLinecap="round" />
          <Path d="M602 318 Q 690 338 780 544" stroke="#E6A800" strokeOpacity="0.6" strokeWidth="3" fill="none" />
          {/* Base del balancín */}
          <Path d={`M${BALANCIN.x - 30} ${SUELO} L${BALANCIN.x} ${BALANCIN.y} L${BALANCIN.x + 30} ${SUELO} Z`} fill="#8D6E63" />
        </Svg>
        <VidaParque k={k} />

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
            <SombraContacto ancho={avW * 0.8} />
            <Avatar apariencia={perfil.apariencia} alto={avH} accesorios={accesorios} />
          </Animated.View>
        )}
        {juego !== "columpio" && juego !== "balancin" && (
          <View pointerEvents="none" style={{ position: "absolute", left: 300 * k, top: SUELO * k - avH }}>
            <SombraContacto ancho={avW * 0.8} />
            <EmiliaDibujo alto={avH} />
          </View>
        )}
        <Animated.View pointerEvents="none" style={{ position: "absolute", left: 650 * k, top: SUELO * k - 50 * k, transform: [{ translateY: juego ? tito : 0 }] }}>
          <SombraContacto ancho={60 * k} />
          <TitoDibujo alto={55 * k} />
        </Animated.View>
        <LuzDelDia k={k} ancho={1100} alto={620} cielo={300} suelo={{ yMin: 420, yMax: 560 }} luces={[{ x: 1071, y: 372, r: 90 }]} />
      </View>

      <VinetaPantalla />
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
        {/* Arenero: se desbloquea al juntar estrellas */}
        <Pressable
          style={[estilos.boton, estilos.arenero, estrellas < DESBLOQUEOS.arenero && estilos.bloqueado]}
          accessibilityLabel="Arenero"
          onPress={() => {
            if (juego) return;
            if (estrellas >= DESBLOQUEOS.arenero) return router.push("/arenero");
            const faltan = DESBLOQUEOS.arenero - estrellas;
            void decir(`El arenero está en construcción. Tito está ayudando. Se abre con ${DESBLOQUEOS.arenero} estrellas: ¡te faltan ${faltan}! Gana estrellas jugando en la escuelita.`);
          }}
        >
          <Text style={estilos.botonEmoji}>{estrellas >= DESBLOQUEOS.arenero ? "🏖️" : "🚧"}</Text>
          <Text style={estilos.botonTexto}>{estrellas >= DESBLOQUEOS.arenero ? "Arenero" : `⭐ ${Math.min(estrellas, DESBLOQUEOS.arenero)}/${DESBLOQUEOS.arenero}`}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "#81D4FA", justifyContent: "center" },
  pasto: { position: "absolute", left: 0, right: 0, bottom: 0, height: "50%", backgroundColor: "#7CB342" },
  cuerda: { position: "absolute", top: 0, width: 4, backgroundColor: "#5D4037" },
  asiento: { position: "absolute", left: 10, right: 10, borderRadius: 6, backgroundColor: "#FB8C00" },
  tabla: { flex: 1, backgroundColor: "#43A047", borderRadius: 8, borderWidth: 3, borderColor: "#2E7D32" },
  zona: { position: "absolute" },
  dialogo: { position: "absolute", top: 14, left: 0, right: 0, alignItems: "center" },
  botones: { position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 14 },
  boton: { backgroundColor: "#fff", borderRadius: 22, paddingHorizontal: 16, paddingVertical: 8, alignItems: "center", minWidth: 100 },
  apagado: { opacity: 0.5 },
  arenero: { borderWidth: 3, borderColor: "#FFB74D" },
  bloqueado: { backgroundColor: "#ECEFF1" },
  botonEmoji: { fontSize: 30 },
  botonTexto: { fontSize: 15, fontWeight: "800", color: "#3B2F5C" },
});

/** Cielo, cerros, árboles, reja con flores, banca, laguna, carrito de helados y farol. */
function FondoParque() {
  const arbol = (x: number, y: number, r: number, c: string) => (
    <G key={`${x}-${y}`}>
      <Ellipse cx={x + r * 0.5} cy={y + r * 0.1 + 4} rx={r * 1.3} ry={r * 0.22} fill="url(#sombraP)" />
      <Rect x={x - 7} y={y - 10} width="14" height={r + 14} fill="#6D4C41" />
      <Rect x={x + 1} y={y - 10} width="6" height={r + 14} fill="#4E342E" opacity="0.6" />
      <Circle cx={x} cy={y - r * 0.6} r={r} fill={c} />
      <Circle cx={x - r * 0.6} cy={y - r * 0.2} r={r * 0.7} fill={c} />
      <Circle cx={x + r * 0.6} cy={y - r * 0.25} r={r * 0.72} fill={c} />
      <Circle cx={x} cy={y - r * 0.6} r={r} fill="url(#copaP)" />
      <Circle cx={x + r * 0.6} cy={y - r * 0.25} r={r * 0.72} fill="#000" opacity="0.12" />
      <Circle cx={x - r * 0.35} cy={y - r * 0.95} r={r * 0.32} fill="#fff" opacity="0.16" />
      <Circle cx={x - r * 0.75} cy={y - r * 0.35} r={r * 0.2} fill="#fff" opacity="0.12" />
    </G>
  );
  return (
    <G>
      <Defs>
        <LinearGradient id="cieloParque" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#81D4FA" />
          <Stop offset="1" stopColor="#E1F5FE" />
        </LinearGradient>
        <RadialGradient id="sombraP" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#1B3A12" stopOpacity="0.38" />
          <Stop offset="0.65" stopColor="#1B3A12" stopOpacity="0.16" />
          <Stop offset="1" stopColor="#1B3A12" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="copaP" cx="35%" cy="30%" r="70%">
          <Stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <Stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </RadialGradient>
        <LinearGradient id="arenaP" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFE9C4" />
          <Stop offset="1" stopColor="#F5CF98" />
        </LinearGradient>
        <LinearGradient id="pastoP" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#9CCC65" />
          <Stop offset="1" stopColor="#7CB342" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="1100" height="620" fill="url(#cieloParque)" />
      {/* Cerros lejanos y edificios del barrio */}
      <Path d="M0 400 Q160 300 340 380 Q520 290 720 370 Q900 300 1100 360 V480 H0 Z" fill="#C5E1A5" />
      {[[640, 300, 50, "#FFCCBC"], [700, 280, 40, "#D1C4E9"], [748, 310, 44, "#B2EBF2"]].map(([x, y, w, c]) => (
        <G key={x as number}>
          <Rect x={x as number} y={y as number} width={w as number} height={400 - (y as number)} fill={c as string} />
          {[0, 1, 2].map((f) => <Rect key={f} x={(x as number) + 10} y={(y as number) + 12 + f * 22} width={(w as number) - 20} height="10" fill="#fff" opacity="0.6" />)}
        </G>
      ))}
      <Path d="M0 440 Q200 380 420 430 Q640 380 860 430 Q980 400 1100 420 V480 H0 Z" fill="#AED581" />
      {/* Árboles detrás de la reja */}
      {arbol(30, 450, 46, "#66BB6A")}
      {arbol(470, 445, 40, "#43A047")}
      {arbol(860, 440, 50, "#558B2F")}
      {arbol(1080, 450, 44, "#66BB6A")}
      {/* Pasto */}
      <Rect x="0" y="470" width="1100" height="150" fill="url(#pastoP)" />
      {/* Laguna con patos (detrás de los columpios) */}
      <Ellipse cx="230" cy="478" rx="110" ry="20" fill="#4FC3F7" />
      <Ellipse cx="230" cy="474" rx="90" ry="10" fill="#81D4FA" />
      {/* Reja de madera con flores */}
      <Rect x="0" y="448" width="1100" height="6" fill="#A1887F" />
      <Rect x="0" y="462" width="1100" height="6" fill="#A1887F" />
      {Array.from({ length: 56 }, (_, i) => 10 + i * 20).filter((x) => x < 110 || x > 350).map((x) => (
        <Path key={x} d={`M${x - 5} 474 V446 L${x} 440 L${x + 5} 446 V474 Z`} fill="#BCAAA4" stroke="#8D6E63" strokeWidth="1" />
      ))}
      {[420, 452, 600, 640, 1010, 1046, 70].map((x, i) => (
        <G key={x}>
          <Line x1={x} y1="486" x2={x} y2="472" stroke="#558B2F" strokeWidth="2" />
          <Circle cx={x} cy="470" r="6" fill={["#F06292", "#FFCA28", "#BA68C8", "#FF7043", "#F06292", "#4FC3F7", "#FFCA28"][i]} />
          <Circle cx={x} cy="470" r="2.2" fill="#FFF59D" />
        </G>
      ))}
      {/* Banca */}
      <Rect x="398" y="470" width="96" height="9" rx="3" fill="#8D6E63" />
      <Rect x="398" y="484" width="96" height="9" rx="3" fill="#A1887F" />
      <Rect x="404" y="493" width="6" height="20" fill="#5D4037" />
      <Rect x="482" y="493" width="6" height="20" fill="#5D4037" />
      {/* Carrito de helados */}
      <G>
        <Rect x="905" y="410" width="110" height="70" rx="8" fill="#F8BBD0" stroke="#EC407A" strokeWidth="3" />
        <Path d="M895 410 Q960 360 1025 410 Z" fill="#EC407A" />
        <Path d="M915 395 Q960 372 1005 395" stroke="#fff" strokeWidth="4" strokeDasharray="10 8" fill="none" />
        <Line x1="910" y1="410" x2="910" y2="395" stroke="#AD1457" strokeWidth="3" />
        <Line x1="1010" y1="410" x2="1010" y2="395" stroke="#AD1457" strokeWidth="3" />
        {[["#FFF59D", 930], ["#A5D6A7", 960], ["#F48FB1", 990]].map(([c, x]) => (
          <G key={x as number}>
            <Path d={`M${(x as number) - 8} 438 L${x} 462 L${(x as number) + 8} 438 Z`} fill="#FFCC80" />
            <Circle cx={x as number} cy="434" r="9" fill={c as string} />
          </G>
        ))}
        <Circle cx="925" cy="484" r="9" fill="#546E7A" />
        <Circle cx="995" cy="484" r="9" fill="#546E7A" />
      </G>
      {/* Farol */}
      <Rect x="1068" y="380" width="6" height="110" fill="#455A64" />
      <Path d="M1058 382 L1084 382 L1078 362 L1064 362 Z" fill="#FFF59D" stroke="#455A64" strokeWidth="3" />
      {/* Arenero del parque */}
      <Ellipse cx="550" cy="563" rx="524" ry="62" fill="#D7B07A" />
      <Ellipse cx="550" cy="560" rx="520" ry="60" fill="url(#arenaP)" />
      <Ellipse cx="550" cy="552" rx="500" ry="50" fill="none" stroke="#FFCC80" strokeWidth="3" strokeDasharray="4 14" />
      {/* Granitos de arena y huellitas */}
      {Array.from({ length: 160 }, (_, i) => {
        const azar = (n: number) => { const v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); };
        const a = azar(i + 1) * Math.PI * 2, rr = Math.sqrt(azar(i + 77));
        return <Circle key={i} cx={550 + Math.cos(a) * rr * 500} cy={560 + Math.sin(a) * rr * 52} r={i % 3 ? 1.3 : 2} fill={i % 2 ? "#E0B97F" : "#FFF3DC"} opacity="0.85" />;
      })}
      {([[450, 590], [470, 600], [640, 596], [660, 584]] as const).map(([x, y]) => <Ellipse key={x} cx={x} cy={y} rx="5" ry="3" fill="#D9AE73" opacity="0.6" />)}
      {/* Sombras proyectadas de los juegos (la luz viene de arriba a la izquierda) */}
      <Ellipse cx="260" cy="566" rx="200" ry="14" fill="url(#sombraP)" />
      <Ellipse cx="720" cy="556" rx="190" ry="18" fill="url(#sombraP)" />
      <Ellipse cx="990" cy="566" rx="120" ry="10" fill="url(#sombraP)" />
      <Ellipse cx="985" cy="494" rx="78" ry="9" fill="url(#sombraP)" />
      <Ellipse cx="460" cy="514" rx="58" ry="6" fill="url(#sombraP)" />
      {/* Matas de pasto */}
      {([[20, 600], [1080, 596], [60, 520], [1040, 530]] as const).map(([x, y]) => (
        <Path key={x} d={`M${x - 10} ${y} Q${x - 6} ${y - 16} ${x - 2} ${y} Q${x} ${y - 22} ${x + 3} ${y} Q${x + 8} ${y - 15} ${x + 11} ${y} Z`} fill="#7CB342" />
      ))}
    </G>
  );
}

/** Lo que se mueve en el parque: sol, nubes, pájaros, mariposas, abejas, patos y un perrito. */
function VidaParque({ k }: { k: number }) {
  return (
    <>
      <Sol k={k} x={1010} y={80} r={44} />
      <Nube escala={k} ancho={1100} y={50} ms={60000} retraso={0} tam={170} sombra={false} />
      <Nube escala={k} ancho={1100} y={150} ms={85000} retraso={20000} tam={130} sombra={false} />
      <Bandada escala={k} ancho={1100} y={120} ms={15000} retraso={4000} />
      <MariposaVolando escala={k} x={440} y={440} fase={0} />
      <MariposaVolando escala={k} x={1020} y={440} fase={2} />
      <Abeja k={k} x={620} y={455} fase={1} radio={40} />
      <View pointerEvents="none" style={{ position: "absolute", left: 180 * k, top: 452 * k }}>
        <AnimalVivo id="pato" alto={30 * k} nadando />
      </View>
      <View pointerEvents="none" style={{ position: "absolute", left: 250 * k, top: 458 * k }}>
        <AnimalVivo id="pato" alto={22 * k} nadando />
      </View>
      <View pointerEvents="none" style={{ position: "absolute", left: 700 * k, top: 500 * k }}>
        <AnimalPaseando id="perro" alto={44 * k} paseo={60 * k} />
      </View>
    </>
  );
}
