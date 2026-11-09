import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { Abeja, MariposaVolando, Nube, Sol } from "../../components/Ambiente";
import { AnimalVivo } from "../../components/AnimalesVivos";
import { Pantalla } from "../../components/Pantalla";
import { EmiliaDibujo, Globo, TitoDibujo, useSalto } from "../../components/Personajes";
import { hablar } from "../../lib/voz";
import { LuzDelDia } from "../../components/LuzDelDia";
import { Icono } from "../../components/Iconos";
import { SombraContacto, VinetaEscena } from "../../components/AmbienteInterior";

/** Mundo del patio en unidades de 1100×700 (se recorta para llenar la pantalla, apoyado abajo). */
const ANCHO = 1100, ALTO = 700;

/**
 * El patio de Emilia: cuidar a Tito y respirar con él (rincón de la calma).
 * Alrededor hay pasto con flores, la casita de Tito, un tendedero con ropa
 * que se mece con el viento, un árbol con columpio y la pared de la casa.
 */
export default function Patio() {
  const { width, height } = useWindowDimensions();
  const [texto, setTexto] = useState("¡Tito quiere jugar contigo!");
  const [corazones, setCorazones] = useState<number[]>([]);
  const [respirando, setRespirando] = useState(false);
  const [contento, setContento] = useState(false);
  const [hojas, setHojas] = useState(false);
  const { y, saltar } = useSalto();
  const globo = useRef(new Animated.Value(0.6)).current;
  const contador = useRef(0);
  const calma = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => void hablar("¡Bienvenidos al patio! Tito quiere jugar."), []);

  function decir(t: string) {
    setTexto(t);
    hablar(t);
  }
  function feliz(ms = 2500) {
    setContento(true);
    if (calma.current) clearTimeout(calma.current);
    calma.current = setTimeout(() => setContento(false), ms);
  }

  function carino() {
    saltar();
    feliz();
    const id = contador.current++;
    setCorazones((c) => [...c, id]);
    setTimeout(() => setCorazones((c) => c.filter((x) => x !== id)), 1400);
    decir(["¡Pip! A Tito le encanta que le rasquen las orejas.", "¡Mmm! Tito cierra los ojitos de gusto.", "¡Tito está feliz!"][id % 3]!);
  }

  function darHojas() {
    saltar();
    feliz(4000);
    setHojas(true);
    setTimeout(() => setHojas(false), 4000);
    decir("¡Ñam, ñam! A Tito le encantan las hojas tiernas.");
  }

  function respirar() {
    if (respirando) return;
    setRespirando(true);
    decir("Inflamos el globo… y lo soltamos despacito.");
    const ciclo = Animated.sequence([
      Animated.timing(globo, { toValue: 1.4, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      Animated.timing(globo, { toValue: 0.6, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
    ]);
    Animated.sequence([ciclo, ciclo, ciclo]).start(() => {
      setRespirando(false);
      decir("¡Muy bien! Gracias por respirar con Tito.");
    });
  }

  // El mundo se escala para cubrir la pantalla y se apoya abajo (como "slice").
  const e = Math.max(width / ANCHO, height / ALTO);
  const mundo = { left: (width - ANCHO * e) / 2, top: height - ALTO * e, width: ANCHO * e, height: ALTO * e };

  return (
    <Pantalla color="#C5E1A5">
      <View pointerEvents="none" style={[estilos.capa, { width, height }]}>
        <View style={[estilos.mundo, mundo]}>
          <FondoPatio e={e} />
        </View>
      </View>
      <Globo texto={texto} />
      <View style={estilos.escena}>
        <View style={estilos.grupo}>
          <View><SombraContacto ancho={130} /><EmiliaDibujo alto={220} expresion={respirando ? "pensativa" : contento ? "celebrando" : "feliz"} /></View>
          {respirando ? (
            <View style={estilos.globoCaja}>
              <Animated.View style={{ transform: [{ scale: globo }] }}>
                <GloboRespirar />
              </Animated.View>
              <TitoDibujo alto={120} />
            </View>
          ) : (
            <Pressable onPress={carino} accessibilityLabel="Acariciar a Tito" style={estilos.tito}>
              <SombraContacto ancho={190} />
              <Animated.View style={{ transform: [{ translateY: y }] }}>
                <TitoDibujo alto={180} contento={contento} />
              </Animated.View>
              {hojas && <PlatoHojas />}
            </Pressable>
          )}
          {corazones.map((id) => <Corazon key={id} x={230 + ((id * 47) % 160)} />)}
        </View>
      </View>
      <View style={estilos.acciones}>
        <Accion emoji="🍃" texto="Hojas" alTocar={darHojas} />
        <Accion emoji="🤗" texto="Cariño" alTocar={carino} />
        <Accion emoji="🎈" texto="Respirar" alTocar={respirar} />
      </View>
    </Pantalla>
  );
}

function Accion({ emoji, texto, alTocar }: { emoji: string; texto: string; alTocar: () => void }) {
  return (
    <Pressable style={estilos.accion} onPress={alTocar} accessibilityLabel={texto}>
      <Icono e={emoji} tam={58} sinSombra />
      <Text style={estilos.accionTexto}>{texto}</Text>
    </Pressable>
  );
}

/** Corazón que sube y se desvanece al hacerle cariño a Tito. */
function Corazon({ x }: { x: number }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(t, { toValue: 1, duration: 1300, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [t]);
  return (
    <Animated.View pointerEvents="none" style={{
      position: "absolute", left: x, bottom: 160,
      opacity: t.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }) as never,
      transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -110] }) as never }, { scale: t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.4, 1.1, 0.9] }) as never }],
    }}>
      <Svg width={44} height={40} viewBox="0 0 44 40">
        <Path d="M22 38 L5 21 A10 10 0 0 1 22 7 A10 10 0 0 1 39 21 Z" fill="#FFCA28" stroke="#F9A825" strokeWidth="2" />
        <Ellipse cx="14" cy="15" rx="4" ry="2.5" fill="#fff" opacity="0.6" />
      </Svg>
    </Animated.View>
  );
}

function GloboRespirar() {
  return (
    <Svg width={150} height={200} viewBox="0 0 150 200">
      <Path d="M75 140 Q65 160 80 175 Q90 188 75 200" stroke="#78909C" strokeWidth="2" fill="none" />
      <Ellipse cx="75" cy="70" rx="58" ry="68" fill="#EF5350" />
      <Path d="M68 136 L82 136 L78 144 L72 144 Z" fill="#E53935" />
      <Ellipse cx="52" cy="44" rx="12" ry="20" fill="#fff" opacity="0.35" transform="rotate(-20 52 44)" />
    </Svg>
  );
}

function PlatoHojas() {
  return (
    <View style={estilos.plato} pointerEvents="none">
      <Svg width={110} height={50} viewBox="0 0 110 50">
        {[[30, 24, -30], [50, 18, 10], [70, 24, 40], [42, 30, -60], [62, 30, 70]].map(([x, yy, r]) => (
          <G key={`${x}${yy}`} transform={`rotate(${r} ${x} ${yy})`}>
            <Ellipse cx={x} cy={yy} rx="13" ry="6" fill="#66BB6A" />
            <Line x1={x! - 12} y1={yy} x2={x! + 12} y2={yy} stroke="#388E3C" strokeWidth="1.5" />
          </G>
        ))}
        <Ellipse cx="55" cy="40" rx="50" ry="9" fill="#90A4AE" />
        <Ellipse cx="55" cy="37" rx="42" ry="5" fill="#CFD8DC" />
      </Svg>
    </View>
  );
}

// ---------- El patio ----------

function FondoPatio({ e }: { e: number }) {
  return (
    <>
      <Svg width={ANCHO * e} height={ALTO * e} viewBox={`0 0 ${ANCHO} ${ALTO}`}>
        <Rect x="0" y="0" width={ANCHO} height={ALTO} fill="#B3E5FC" />
        {/* Cerros lejanos */}
        <Path d="M0 360 Q200 260 420 340 Q640 250 860 330 Q980 290 1100 320 V460 H0 Z" fill="#C5E1A5" />
        {/* Pared de la casa de Emilia con ventana y puerta */}
        <Rect x="0" y="150" width="200" height="300" fill="#FFE0B2" />
        <Path d="M-20 160 L110 90 L220 160 Z" fill="#E64A19" />
        <Rect x="40" y="200" width="80" height="70" rx="6" fill="#E1F5FE" stroke="#fff" strokeWidth="6" />
        <Path d="M80 202 V268 M42 235 H118" stroke="#fff" strokeWidth="4" />
        <Rect x="36" y="272" width="88" height="14" rx="4" fill="#8D6E63" />
        {[52, 72, 92, 108].map((x, i) => <Circle key={x} cx={x} cy="270" r="7" fill={["#F06292", "#FFCA28", "#BA68C8", "#FF7043"][i]} />)}
        <Rect x="140" y="320" width="56" height="130" rx="6" fill="#81C784" />
        <Circle cx="186" cy="390" r="4" fill="#FDD835" />
        {/* Reja de madera */}
        {Array.from({ length: 46 }, (_, i) => 210 + i * 20).map((x) => (
          <Path key={x} d={`M${x - 7} 450 V372 L${x} 362 L${x + 7} 372 V450 Z`} fill="#D7CCC8" stroke="#A1887F" strokeWidth="1.5" />
        ))}
        <Rect x="200" y="388" width="900" height="8" fill="#BCAAA4" />
        <Rect x="200" y="424" width="900" height="8" fill="#BCAAA4" />
        {/* Árbol grande con columpio de neumático */}
        <Path d="M880 450 Q890 330 870 230 L910 230 Q920 330 930 450 Z" fill="#795548" />
        <Path d="M895 260 Q950 240 990 250" stroke="#795548" strokeWidth="14" strokeLinecap="round" fill="none" />
        <Circle cx="900" cy="170" r="90" fill="#43A047" />
        <Circle cx="830" cy="210" r="60" fill="#4CAF50" />
        <Circle cx="980" cy="200" r="64" fill="#388E3C" />
        <Circle cx="870" cy="130" r="22" fill="#fff" opacity="0.12" />
        {[[850, 190], [930, 150], [990, 220], [880, 240]].map(([x, y]) => <Circle key={x} cx={x} cy={y} r="8" fill="#E53935" />)}
        {/* Tendedero con postes */}
        <Rect x="300" y="250" width="8" height="200" fill="#8D6E63" />
        <Rect x="700" y="250" width="8" height="200" fill="#8D6E63" />
        <Path d="M304 262 Q504 290 704 262" stroke="#ECEFF1" strokeWidth="3" fill="none" />
        {/* Pasto */}
        <Rect x="0" y="450" width={ANCHO} height="250" fill="#8BC34A" />
        <Path d="M0 450 Q275 470 550 452 Q825 434 1100 456 V470 H0 Z" fill="#9CCC65" />
        {/* Caminito de piedras desde la puerta */}
        {[[170, 470], [215, 500], [270, 528], [330, 556]].map(([x, y]) => <Ellipse key={x} cx={x} cy={y} rx="26" ry="10" fill="#CFD8DC" stroke="#B0BEC5" strokeWidth="2" />)}
        {/* Casita de Tito */}
        <G>
          <Rect x="720" y="400" width="140" height="100" fill="#A1887F" />
          {[420, 445, 470].map((y) => <Path key={y} d={`M720 ${y} H860`} stroke="#8D6E63" strokeWidth="2" />)}
          <Path d="M705 405 L790 340 L875 405 Z" fill="#C62828" />
          <Path d="M760 500 V460 Q790 430 820 460 V500 Z" fill="#5D4037" />
          <Rect x="756" y="366" width="68" height="22" rx="5" fill="#FFF8E1" />
          <SvgText x="790" y="383" fontSize="17" fontWeight="bold" fill="#5D4037" textAnchor="middle">TITO</SvgText>
          <Ellipse cx="890" cy="500" rx="22" ry="7" fill="#42A5F5" />
          <Ellipse cx="890" cy="497" rx="16" ry="4" fill="#90CAF9" />
        </G>
        {/* Macizos de flores */}
        {[60, 110, 420, 470, 1010, 1060].map((x, i) => (
          <G key={x}>
            <Ellipse cx={x} cy="478" rx="30" ry="12" fill="#689F38" />
            {[-12, 0, 12].map((d, j) => (
              <G key={d}>
                <Line x1={x + d} y1="478" x2={x + d} y2={462 - (j % 2) * 6} stroke="#558B2F" strokeWidth="2" />
                <Circle cx={x + d} cy={460 - (j % 2) * 6} r="6" fill={["#F06292", "#FFCA28", "#BA68C8", "#FF7043"][(i + j) % 4]} />
                <Circle cx={x + d} cy={460 - (j % 2) * 6} r="2" fill="#FFF59D" />
              </G>
            ))}
          </G>
        ))}
        {/* Matas de pasto y una pelota */}
        {[[90, 640], [520, 670], [1000, 650], [700, 610], [300, 690]].map(([x, y]) => (
          <Path key={x} d={`M${x! - 10} ${y} Q${x! - 6} ${y! - 16} ${x! - 2} ${y} Q${x} ${y! - 22} ${x! + 3} ${y} Q${x! + 8} ${y! - 15} ${x! + 11} ${y} Z`} fill="#7CB342" />
        ))}
        <Circle cx="980" cy="560" r="20" fill="#42A5F5" />
        <Path d="M960 560 H1000 M980 540 Q968 560 980 580" stroke="#fff" strokeWidth="3" fill="none" />
      </Svg>
      <Sol k={e} x={560} y={70} r={40} />
      <Nube escala={e} ancho={ANCHO} y={40} ms={75000} retraso={0} tam={160} sombra={false} />
      <Nube escala={e} ancho={ANCHO} y={130} ms={95000} retraso={30000} tam={120} sombra={false} />
      {/* Ropa colgada que se mece con el viento */}
      <Prenda e={e} x={360} y={268} fase={0} tipo="polera" color="#EF5350" />
      <Prenda e={e} x={440} y={276} fase={0.7} tipo="calcetin" color="#FFCA28" />
      <Prenda e={e} x={510} y={278} fase={1.3} tipo="vestido" color="#AB47BC" />
      <Prenda e={e} x={590} y={274} fase={2} tipo="calcetin" color="#42A5F5" />
      <Prenda e={e} x={650} y={268} fase={2.6} tipo="polera" color="#66BB6A" />
      {/* Columpio de neumático que se balancea */}
      <Columpio e={e} x={975} y={250} />
      <MariposaVolando escala={e} x={430} y={440} fase={0} />
      <MariposaVolando escala={e} x={1030} y={430} fase={3} />
      <Abeja k={e} x={90} y={440} fase={1} radio={40} />
      <View pointerEvents="none" style={{ position: "absolute", left: 930 * e, top: 220 * e }}>
        <AnimalVivo id="pajaro" alto={30 * e} />
      </View>
      <VinetaEscena k={e} ancho={ANCHO} alto={ALTO} zIndex={1} />
      <LuzDelDia k={e} ancho={ANCHO} alto={ALTO} cielo={340} suelo={{ yMin: 440, yMax: 650 }} luces={[{ x: 80, y: 235, r: 90 }]} />
    </>
  );
}

function useVaiven(ms: number, fase: number) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const ir = Animated.timing(t, { toValue: 1, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: false });
    const volver = Animated.timing(t, { toValue: 0, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: false });
    const b = Animated.sequence([Animated.delay(fase * 300), Animated.loop(Animated.sequence([ir, volver]))]);
    b.start();
    return () => b.stop();
  }, [t, ms, fase]);
  return t;
}

/** Una prenda colgada con perritos de ropa: gira desde arriba (de donde cuelga). */
function Prenda({ e, x, y, fase, tipo, color }: { e: number; x: number; y: number; fase: number; tipo: "polera" | "calcetin" | "vestido"; color: string }) {
  const t = useVaiven(1600 + fase * 150, fase);
  const w = 120, h = 120; // lienzo centrado en el punto de donde cuelga
  const forma = {
    polera: <Path d="M-24 0 L-8 0 Q0 8 8 0 L24 0 L36 14 L26 22 L22 16 L22 52 L-22 52 L-22 16 L-26 22 L-36 14 Z" fill={color} />,
    calcetin: <Path d="M-7 0 H7 V30 Q7 34 12 36 L18 40 Q22 46 14 48 L0 46 Q-7 44 -7 36 Z" fill={color} />,
    vestido: <Path d="M-12 0 H12 L14 18 L30 56 H-30 L-14 18 Z" fill={color} />,
  }[tipo];
  return (
    <Animated.View pointerEvents="none" style={{
      position: "absolute", left: (x - w / 2) * e, top: (y - h / 2) * e, width: w * e, height: h * e,
      transform: [{ rotate: t.interpolate({ inputRange: [0, 1], outputRange: ["-7deg", "7deg"] }) as never }],
    }}>
      <Svg width={w * e} height={h * e} viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`}>
        {forma}
        <Rect x="-8" y="-5" width="4" height="10" rx="1" fill="#8D6E63" />
        <Rect x="4" y="-5" width="4" height="10" rx="1" fill="#8D6E63" />
      </Svg>
    </Animated.View>
  );
}

/** Neumático colgado de la rama, balanceándose. */
function Columpio({ e, x, y }: { e: number; x: number; y: number }) {
  const t = useVaiven(1800, 0);
  const w = 120, h = 320;
  return (
    <Animated.View pointerEvents="none" style={{
      position: "absolute", left: (x - w / 2) * e, top: (y - h / 2) * e, width: w * e, height: h * e,
      transform: [{ rotate: t.interpolate({ inputRange: [0, 1], outputRange: ["-8deg", "8deg"] }) as never }],
    }}>
      <Svg width={w * e} height={h * e} viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`}>
        <Line x1="0" y1="0" x2="0" y2="110" stroke="#6D4C41" strokeWidth="3" />
        <Ellipse cx="0" cy="134" rx="26" ry="28" fill="#37474F" />
        <Ellipse cx="0" cy="134" rx="12" ry="14" fill="#9CCC65" />
      </Svg>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  capa: { position: "absolute", top: 0, left: 0, overflow: "hidden" },
  mundo: { position: "absolute" },
  escena: { flex: 1, width: "100%", maxWidth: 900, justifyContent: "flex-end", paddingBottom: 6 },
  grupo: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 30 },
  tito: { alignItems: "center" },
  globoCaja: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  plato: { position: "absolute", bottom: -10, right: -70 },
  acciones: { flexDirection: "row", gap: 20, paddingBottom: 16, paddingTop: 8 },
  accion: { width: 110, height: 110, borderRadius: 28, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#AED581" },
  accionEmoji: { fontSize: 48 },
  accionTexto: { fontSize: 16, fontWeight: "800", color: "#3B2F5C" },
});
