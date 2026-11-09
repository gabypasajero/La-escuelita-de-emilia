import { VERDURAS, type Verdura } from "@escuelita/core";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { Abeja, MariposaVolando, Nube, Sol } from "../components/Ambiente";
import { Adulto } from "../components/Personas";
import { Avatar } from "../components/Avatar";
import { BotonCasa } from "../components/BotonCasa";
import { EmiliaDibujo, Globo, TitoDibujo } from "../components/Personajes";
import { Monedas, useJuego } from "../lib/juego";
import { hablar } from "../lib/voz";
import { LuzDelDia, VeloPantalla } from "../components/LuzDelDia";
import { SombraContacto, VinetaPantalla } from "../components/AmbienteInterior";
import { useVozActiva } from "../lib/habla";

/**
 * Huerto de Don Pedro como escena para caminar (igual que el barrio): el niño
 * camina a una parcela y sigue la secuencia real: pala → semilla → agua →
 * brota → agua → crece → cosechar. Las verduras son de las que se pueden
 * cultivar en casa, y Don Pedro cuenta qué parte de la planta comemos.
 */

type Etapa = "tierra" | "hoyo" | "sembrada" | "regada" | "brote" | "creciendo" | "lista";
type Herramienta = "pala" | "semilla" | "agua" | "canasta";
interface Parcela { etapa: Etapa; verdura?: Verdura; listoEn?: number }

const NECESITA: Partial<Record<Etapa, Herramienta>> = { tierra: "pala", hoyo: "semilla", sembrada: "agua", brote: "agua", lista: "canasta" };
const PISTA: Partial<Record<Etapa, string>> = {
  tierra: "Primero hacemos un hoyito con la pala.",
  hoyo: "El hoyito está listo. ¿Qué ponemos adentro? ¡Una semilla!",
  sembrada: "La semilla tiene sed. ¡Hay que regarla!",
  regada: "Con paciencia todo crece. Esperemos un ratito.",
  brote: "¡Salió un brote! Un poquito más de agua.",
  creciendo: "Está creciendo. Esperemos un poquito.",
  lista: "¡Ya está lista! Tráela con la canasta.",
};
const HERRAMIENTAS: Array<{ id: Herramienta; emoji: string; nombre: string }> = [
  { id: "pala", emoji: "⛏️", nombre: "Pala" },
  { id: "semilla", emoji: "🌱", nombre: "Semillas" },
  { id: "agua", emoji: "💧", nombre: "Regar" },
  { id: "canasta", emoji: "🧺", nombre: "Cosechar" },
];

// Escena en unidades de diseño de 1100×700.
const PARCELAS_POS = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 300 + (i % 3) * 230, y: 300 + Math.floor(i / 3) * 210 }));
const ESPERA_MS = 5000;

// El huerto de cada niño se guarda mientras la app está abierta (al salir y volver, sigue creciendo).
const HUERTOS = new Map<string, { parcelas: Parcela[]; canasta: Record<string, number> }>();

export default function Huerto() {
  const { perfil, activoId, accesorioPuesto, ganar } = useJuego();
  const { width, height } = useWindowDimensions();
  const k = Math.min(width / 1100, height / 700);
  const clave = activoId ?? "invitado";
  if (!HUERTOS.has(clave)) HUERTOS.set(clave, { parcelas: PARCELAS_POS.map(() => ({ etapa: "tierra" })), canasta: {} });
  const guardado = HUERTOS.get(clave)!;
  const [parcelas, setParcelasEstado] = useState<Parcela[]>(guardado.parcelas);
  const [canasta, setCanastaEstado] = useState<Record<string, number>>(guardado.canasta);
  const [cerca, setCerca] = useState<number | null>(null);
  const [eligiendoSemilla, setEligiendoSemilla] = useState(false);
  const [dicho, setDicho] = useState("¡Llegó mi ayudante! Camina hasta una parcela para sembrar.");
  const [mira, setMira] = useState(1);

  const setParcelas = (p: Parcela[]) => { guardado.parcelas = p; setParcelasEstado(p); };
  const setCanasta = (c: Record<string, number>) => { guardado.canasta = c; setCanastaEstado(c); };

  const pos = useRef(new Animated.ValueXY({ x: 140, y: 600 })).current;
  const emilia = useRef(new Animated.ValueXY({ x: 90, y: 610 })).current;
  const tito = useRef(new Animated.ValueXY({ x: 50, y: 630 })).current;
  const salto = useRef(new Animated.Value(0)).current;
  const actual = useRef({ x: 140, y: 600 });

  useEffect(() => void hablar("¡Llegó mi ayudante! Camina hasta una parcela para sembrar verduras."), []);

  // Las plantas regadas crecen solas con el tiempo.
  useEffect(() => {
    const t = setInterval(() => {
      const ahora = Date.now();
      const p = guardado.parcelas;
      if (!p.some((x) => x.listoEn && x.listoEn <= ahora)) return;
      setParcelas(p.map((x) => {
        if (!x.listoEn || x.listoEn > ahora) return x;
        return { ...x, etapa: x.etapa === "regada" ? "brote" : "lista", listoEn: undefined };
      }));
    }, 500);
    return () => clearInterval(t);
  }, [guardado]);

  // Don Pedro habla (mueve boca y manos) mientras dice cada frase.
  const [pedroHabla, setPedroHabla] = useState(true);
  const voz = useVozActiva();
  const silencio = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callarPedro = (ms: number) => {
    if (silencio.current) clearTimeout(silencio.current);
    silencio.current = setTimeout(() => setPedroHabla(false), ms);
  };
  useEffect(() => callarPedro(6000), []);
  const decir = (t: string) => {
    setDicho(t);
    void hablar(t);
    setPedroHabla(true);
    callarPedro(Math.max(3000, t.length * 120));
  };

  function caminar(x: number, y: number, alLlegar?: () => void) {
    const desde = actual.current;
    const d = Math.hypot(x - desde.x, y - desde.y);
    const ms = Math.max(250, (d / 260) * 1000);
    setMira(x < desde.x ? -1 : 1);
    actual.current = { x, y };
    setEligiendoSemilla(false);
    const rebote = Animated.loop(Animated.sequence([
      Animated.timing(salto, { toValue: -7, duration: 140, useNativeDriver: false }),
      Animated.timing(salto, { toValue: 0, duration: 140, useNativeDriver: false }),
    ]));
    rebote.start();
    Animated.parallel([
      Animated.timing(pos, { toValue: { x, y }, duration: ms, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(emilia, { toValue: { x: x - 60, y: y + 10 }, duration: ms, delay: 250, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(tito, { toValue: { x: x - 100, y: y + 30 }, duration: ms, delay: 450, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ]).start(() => {
      rebote.stop();
      salto.setValue(0);
      alLlegar?.();
    });
  }

  function irAParcela(i: number) {
    const p = PARCELAS_POS[i]!;
    setCerca(null);
    caminar(p.x - 70, p.y + 70, () => {
      setCerca(i);
      const parcela = guardado.parcelas[i]!;
      decir(parcela.verdura && parcela.etapa !== "tierra" ? `Aquí hay ${parcela.verdura.articulo} ${parcela.verdura.nombre}. ${PISTA[parcela.etapa]}` : PISTA[parcela.etapa]!);
    });
  }

  function usar(h: Herramienta) {
    if (cerca === null) return decir("Primero camina hasta una parcela.");
    const p = parcelas[cerca]!;
    if (NECESITA[p.etapa] !== h) return decir(`Mmm, todavía no. ${PISTA[p.etapa]}`);
    const cambiar = (nueva: Parcela) => setParcelas(parcelas.map((x, i) => (i === cerca ? nueva : x)));
    if (h === "pala") { cambiar({ etapa: "hoyo" }); decir("¡Un hoyito perfecto! Ahora elige qué semilla sembrar."); setEligiendoSemilla(true); }
    else if (h === "semilla") setEligiendoSemilla(true);
    else if (h === "agua") {
      cambiar({ ...p, etapa: p.etapa === "sembrada" ? "regada" : "creciendo", listoEn: Date.now() + ESPERA_MS });
      decir(p.etapa === "sembrada" ? "¡Glu, glu! Un poquito de agua. Ahora a esperar con paciencia." : "¡Más agüita para que crezca grande!");
    } else if (h === "canasta" && p.verdura) {
      const v = p.verdura;
      cambiar({ etapa: "tierra" });
      setCanasta({ ...canasta, [v.id]: (canasta[v.id] ?? 0) + 1 });
      ganar(1);
      decir(`¡Cosechaste ${v.articulo === "la" ? "una" : "un"} ${v.nombre}! ${v.dato}`);
    }
  }

  function sembrar(v: Verdura) {
    if (cerca === null) return;
    setParcelas(parcelas.map((x, i) => (i === cerca ? { etapa: "sembrada", verdura: v } : x)));
    setEligiendoSemilla(false);
    decir(`¡Sembramos ${v.id === "porotos" ? "porotos" : `${v.articulo} ${v.nombre}`}! Ahora hay que regar.`);
  }

  if (!perfil) return null;
  const avH = 120 * k, avW = (avH * 100) / 160, emH = 112 * k, emW = (emH * 100) / 160, tiH = 46 * k, tiW = (tiH * 100) / 80;
  const coloca = (v: Animated.ValueXY, w: number, h: number, conSalto: boolean) => ({
    position: "absolute" as const,
    transform: [
      { translateX: Animated.add(Animated.multiply(v.x, k), -w / 2) },
      { translateY: conSalto ? Animated.add(Animated.add(Animated.multiply(v.y, k), -h), salto) : Animated.add(Animated.multiply(v.y, k), -h) },
    ],
  });

  return (
    <View style={estilos.fondo}>
      <VeloPantalla />
      <View style={{ width: 1100 * k, height: 700 * k, alignSelf: "center" }}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityLabel="Caminar"
          onPress={(e) => {
            const r = (e.currentTarget as unknown as { getBoundingClientRect?: () => DOMRect }).getBoundingClientRect?.();
            const x = (e.nativeEvent.pageX - (r?.left ?? (width - 1100 * k) / 2)) / k;
            const y = (e.nativeEvent.pageY - (r?.top ?? (height - 700 * k) / 2)) / k;
            setCerca(null);
            caminar(Math.min(Math.max(x, 40), 1060), Math.min(Math.max(y, 220), 680));
          }}>
          <Fondo k={k} />
        </Pressable>

        {/* Vida del huerto: sol, nubes, mariposas y abejas sobre las plantas */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Sol k={k} x={790} y={64} r={36} />
          <Nube escala={k} ancho={1100} y={24} ms={65000} retraso={0} tam={150} />
          <Nube escala={k} ancho={1100} y={80} ms={90000} retraso={35000} tam={110} />
          <MariposaVolando escala={k} x={180} y={560} fase={1} />
          <MariposaVolando escala={k} x={720} y={420} fase={3} />
          <Abeja k={k} x={420} y={300} fase={0} />
          <Abeja k={k} x={640} y={470} fase={2} radio={50} />
          <Abeja k={k} x={300} y={500} fase={4} radio={45} />
        </View>
        <LuzDelDia k={k} ancho={1100} alto={700} cielo={180} suelo={{ yMin: 260, yMax: 660 }} zIndex={50} />

        {/* Don Pedro junto a su galpón: habla moviendo boca y manos */}
        <View pointerEvents="none" style={{ position: "absolute", left: 935 * k, top: 92 * k, alignItems: "center", zIndex: 5 }}>
          <View><SombraContacto ancho={80 * k} /><Adulto id="pedro" alto={140 * k} hablando={pedroHabla && voz} /></View>
          <Text style={estilos.nombre}>Don Pedro</Text>
        </View>

        {parcelas.map((p, i) => {
          const pp = PARCELAS_POS[i]!;
          return (
            <Pressable key={i} accessibilityLabel={`Parcela ${i + 1}`} onPress={() => irAParcela(i)}
              style={[estilos.parcela, cerca === i && estilos.parcelaCerca, { left: (pp.x - 95) * k, top: (pp.y - 60) * k, width: 190 * k, height: 120 * k }]}>
              <PlantaDe parcela={p} k={k} />
            </Pressable>
          );
        })}

        <Animated.View pointerEvents="none" style={coloca(tito, tiW, tiH, false)}><SombraContacto ancho={tiW * 0.9} /><TitoDibujo alto={tiH} /></Animated.View>
        <Animated.View pointerEvents="none" style={coloca(emilia, emW, emH, false)}><SombraContacto ancho={emW * 0.8} /><EmiliaDibujo alto={emH} /></Animated.View>
        <Animated.View pointerEvents="none" style={coloca(pos, avW, avH, true)}>
          <SombraContacto ancho={avW * 0.8} />
          <View style={{ transform: [{ scaleX: mira }] }}>
            <Avatar apariencia={perfil.apariencia} alto={avH} accesorios={{ cabeza: accesorioPuesto("cabeza"), cara: accesorioPuesto("cara"), cuello: accesorioPuesto("cuello"), mano: accesorioPuesto("mano") }} />
          </View>
        </Animated.View>
      </View>

      <VinetaPantalla />
      <View style={estilos.dialogo} pointerEvents="none"><Globo texto={dicho} /></View>
      <BotonCasa />
      <Monedas />
      {/* Canasta de la cosecha */}
      <View style={estilos.canasta} pointerEvents="none">
        <Text style={estilos.canastaTexto}>🧺 {Object.entries(canasta).map(([id, n]) => `${VERDURAS.find((v) => v.id === id)!.emoji}${n}`).join(" ") || "vacía"}</Text>
      </View>

      {eligiendoSemilla ? (
        <ScrollView horizontal style={estilos.barra} contentContainerStyle={estilos.barraContenido}>
          {VERDURAS.map((v) => (
            <Pressable key={v.id} style={estilos.semilla} onPress={() => sembrar(v)} accessibilityLabel={`Semilla de ${v.nombre}`}>
              <Text style={estilos.semillaEmoji}>{v.emoji}</Text>
              <Text style={estilos.semillaNombre}>{v.nombre}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={[estilos.barra, estilos.barraContenido]}>
          {HERRAMIENTAS.map((h) => (
            <Pressable key={h.id} style={[estilos.herramienta, cerca === null && estilos.apagado]} onPress={() => usar(h.id)} accessibilityLabel={h.nombre}>
              <Text style={estilos.herramientaEmoji}>{h.emoji}</Text>
              <Text style={estilos.semillaNombre}>{h.nombre}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function PlantaDe({ parcela: p, k }: { parcela: Parcela; k: number }) {
  const humeda = p.etapa === "regada" || p.etapa === "creciendo";
  const centro = { fontSize: 40 * k, textAlign: "center" as const };
  return (
    <View style={[estilos.tierra, humeda && estilos.tierraHumeda]}>
      {[0, 1, 2].map((s) => <View key={s} style={[estilos.surco, { top: (22 + s * 32) * k }]} />)}
      <View style={estilos.planta}>
        {p.etapa === "hoyo" && <View style={{ width: 50 * k, height: 20 * k, borderRadius: 25 * k, backgroundColor: "#3E2723" }} />}
        {p.etapa !== "hoyo" && p.etapa !== "lista" && <Etapa etapa={p.etapa} k={k} />}
        {p.etapa === "lista" && p.verdura && <Text style={{ ...centro, fontSize: 62 * k }}>✨{p.verdura.emoji}✨</Text>}
      </View>
    </View>
  );
}

/** Semillas, gotas, brote y planta dibujados (con volumen) según la etapa. */
function Etapa({ etapa, k }: { etapa: Parcela["etapa"]; k: number }) {
  return (
    <Svg width={80 * k} height={70 * k} viewBox="0 0 80 70">
      {etapa === "sembrada" && (
        <G>
          <Ellipse cx="40" cy="52" rx="22" ry="7" fill="#3E2723" />
          {[[32, 50], [40, 53], [48, 50]].map(([x, y]) => <G key={x}><Ellipse cx={x} cy={y} rx="3.4" ry="2.4" fill="#A1887F" /><Ellipse cx={x! - 1} cy={y! - 0.8} rx="1.2" ry="0.8" fill="#fff" opacity="0.5" /></G>)}
        </G>
      )}
      {etapa === "regada" && (
        <G>
          <Ellipse cx="40" cy="54" rx="26" ry="8" fill="#3E2723" />
          <Ellipse cx="34" cy="52" rx="8" ry="2" fill="#90CAF9" opacity="0.5" />
          {[[30, 24], [44, 16], [52, 30]].map(([x, y]) => (
            <G key={x}>
              <Path d={`M${x} ${y} Q${x! + 6} ${y! + 10} ${x} ${y! + 14} Q${x! - 6} ${y! + 10} ${x} ${y} Z`} fill="#29B6F6" />
              <Ellipse cx={x! - 1.5} cy={y! + 9} rx="1.4" ry="2.4" fill="#fff" opacity="0.7" />
            </G>
          ))}
        </G>
      )}
      {(etapa === "brote" || etapa === "creciendo") && (
        <G>
          <Ellipse cx="42" cy="60" rx="20" ry="5" fill="#000" opacity="0.2" />
          <Path d="M40 60 Q39 46 40 34" stroke="#558B2F" strokeWidth="3" fill="none" strokeLinecap="round" />
          <Path d="M40 40 Q26 30 22 38 Q30 46 40 40 Z" fill="#7CB342" />
          <Path d="M40 36 Q54 24 60 32 Q52 42 40 36 Z" fill="#8BC34A" />
          <Path d="M40 40 Q30 36 24 38" stroke="#fff" strokeOpacity="0.4" strokeWidth="1" fill="none" />
          {etapa === "creciendo" && (
            <G>
              <Path d="M40 50 Q22 46 16 56 Q28 62 40 50 Z" fill="#689F38" />
              <Path d="M40 48 Q58 42 64 52 Q52 58 40 48 Z" fill="#7CB342" />
              <Path d="M40 30 Q34 14 40 8 Q46 14 40 30 Z" fill="#9CCC65" />
            </G>
          )}
        </G>
      )}
    </Svg>
  );
}

function Fondo({ k }: { k: number }) {
  return (
    <Svg width={1100 * k} height={700 * k} viewBox="0 0 1100 700" pointerEvents="none">
      <Defs>
        <LinearGradient id="cieloH" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#81D4FA" /><Stop offset="1" stopColor="#E1F5FE" /></LinearGradient>
        <LinearGradient id="pastoH" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#B5D96E" /><Stop offset="1" stopColor="#7CB342" /></LinearGradient>
        <RadialGradient id="sombraH" cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor="#1B3A12" stopOpacity="0.38" /><Stop offset="1" stopColor="#1B3A12" stopOpacity="0" /></RadialGradient>
        <RadialGradient id="copaH" cx="35%" cy="30%" r="70%"><Stop offset="0" stopColor="#fff" stopOpacity="0.28" /><Stop offset="0.5" stopColor="#fff" stopOpacity="0" /><Stop offset="1" stopColor="#000" stopOpacity="0.22" /></RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="1100" height="700" fill="url(#pastoH)" />
      <Rect x="0" y="0" width="1100" height="170" fill="url(#cieloH)" />
      {/* Cordillera lejana con neblina */}
      {[0, 280, 560, 840].map((x, i) => <Path key={x} d={`M${x - 60} 165 L${x + 120} ${70 + (i % 2) * 18} L${x + 300} 165 Z`} fill="#A7BBC7" opacity="0.85" />)}
      {[0, 280, 560, 840].map((x, i) => <Path key={`n${x}`} d={`M${x + 96} ${86 + (i % 2) * 18} L${x + 120} ${70 + (i % 2) * 18} L${x + 146} ${88 + (i % 2) * 18} Z`} fill="#fff" />)}
      <Path d="M0 170 Q 250 110 520 160 T 1100 150 V 200 H 0 Z" fill="#8BC34A" />
      <Rect x="0" y="190" width="1100" height="510" fill="url(#pastoH)" />
      {Array.from({ length: 160 }, (_, i) => {
        const x = (i * 211.7) % 1100, y = 250 + ((i * 97.3) % 330);
        return <Path key={`b${i}`} d={`M${x - 3} ${y} Q${x - 3} ${y - 6} ${x - 5} ${y - 9} M${x} ${y} Q${x + 1} ${y - 9} ${x} ${y - 11} M${x + 3} ${y} Q${x + 3} ${y - 6} ${x + 6} ${y - 8}`} stroke={i % 2 ? "#689F38" : "#7CB342"} strokeWidth="1.6" fill="none" strokeLinecap="round" />;
      })}
      {/* Sombras del galpón, el árbol y la cerca */}
      <Ellipse cx="1010" cy="212" rx="110" ry="12" fill="url(#sombraH)" />
      <Ellipse cx="100" cy="500" rx="80" ry="12" fill="url(#sombraH)" />
      <Rect x="6" y="232" width="1090" height="6" fill="#1B3A12" opacity="0.12" />
      {/* Cerros al fondo */}
      <Path d="M0 160 Q120 100 240 150 Q360 90 480 150 Q600 105 720 150 L720 175 L0 175 Z" fill="#AED581" opacity="0.8" />
      {/* Galpón de Don Pedro, con tablas, ventana y herramientas */}
      <Path d="M900 120 L990 70 L1080 120 Z" fill="#B71C1C" />
      <Path d="M900 120 L990 70 L1080 120" stroke="#fff" strokeWidth="4" fill="none" />
      <Path d="M1070 118 L1092 106 V196 L1070 208 Z" fill="#C25050" />
      <Path d="M1080 120 L1102 108" stroke="#8E1F1F" strokeWidth="4" />
      <Rect x="910" y="118" width="160" height="90" fill="#E57373" />
      <Rect x="910" y="118" width="160" height="8" fill="#000" opacity="0.15" />
      {[930, 950, 970, 1010, 1030, 1050].map((x) => <Rect key={x} x={x} y="120" width="2" height="86" fill="#D84343" />)}
      <Rect x="975" y="150" width="34" height="58" fill="#5D4037" />
      <Rect x="1024" y="134" width="30" height="24" fill="#BBDEFB" stroke="#fff" strokeWidth="3" />
      <Path d="M918 208 L930 150 M926 150 L934 150" stroke="#8D6E63" strokeWidth="4" />
      <Path d="M926 150 Q930 142 938 146" stroke="#90A4AE" strokeWidth="5" fill="none" />
      {/* Regadera y sacos */}
      <Path d="M850 214 L878 214 L874 236 L854 236 Z" fill="#26A69A" />
      <Path d="M878 218 L896 206" stroke="#26A69A" strokeWidth="4" />
      <Path d="M800 236 Q798 210 812 206 Q826 210 824 236 Z" fill="#D7CCC8" />
      {/* Espantapájaros */}
      <Rect x="96" y="250" width="8" height="110" fill="#8D6E63" />
      <Rect x="66" y="280" width="68" height="8" fill="#8D6E63" />
      <Circle cx="100" cy="245" r="20" fill="#FFE0B2" />
      <Path d="M76 236 L124 236 L114 216 L86 216 Z" fill="#FDD835" />
      <Rect x="84" y="270" width="32" height="40" rx="4" fill="#42A5F5" />
      {/* Cerca */}
      {Array.from({ length: 23 }, (_, i) => <Rect key={i} x={10 + i * 48} y="200" width="8" height="34" fill="#A1887F" />)}
      <Rect x="6" y="208" width="1090" height="6" fill="#A1887F" />
      {/* Flores al borde del huerto */}
      {Array.from({ length: 22 }, (_, i) => (
        <G key={i}><Path d={`M${30 + i * 50} 612 l0 -14`} stroke="#558B2F" strokeWidth="2" /><Circle cx={30 + i * 50} cy={596} r="5" fill={["#F06292", "#FFF176", "#BA68C8", "#fff"][i % 4]} /></G>
      ))}
      {/* Camino y árbol */}
      <Ellipse cx="560" cy="652" rx="566" ry="44" fill="#B08D57" />
      <Ellipse cx="560" cy="650" rx="560" ry="40" fill="#D7B98E" />
      {Array.from({ length: 40 }, (_, i) => <Ellipse key={`p${i}`} cx={(i * 131) % 1100} cy={630 + ((i * 17) % 34)} rx="3" ry="2" fill={i % 2 ? "#A88B5E" : "#EFE0C2"} />)}
      <Rect x="60" y="430" width="16" height="70" fill="#6D4C41" />
      <Rect x="69" y="430" width="7" height="70" fill="#4E342E" opacity="0.6" />
      <Circle cx="68" cy="420" r="46" fill="#43A047" />
      <Circle cx="68" cy="420" r="46" fill="url(#copaH)" />
      {[50, 80, 66].map((x, i) => <Circle key={i} cx={x} cy={405 + i * 12} r="6" fill="#FB8C00" />)}
    </Svg>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "#9CCC65", justifyContent: "center" },
  parcela: { position: "absolute", borderRadius: 18 },
  parcelaCerca: { borderWidth: 4, borderColor: "#FDD835" },
  tierra: { flex: 1, borderRadius: 16, backgroundColor: "#8D6E63", overflow: "hidden", borderWidth: 5, borderColor: "#795548", borderBottomWidth: 9, borderBottomColor: "#5D4037", shadowColor: "#1B3A12", shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 6, height: 8 } },
  tierraHumeda: { backgroundColor: "#5D4037" },
  surco: { position: "absolute", left: 8, right: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.15)" },
  planta: { flex: 1, alignItems: "center", justifyContent: "center" },
  nombre: { fontWeight: "900", color: "#3B2F5C", backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 8, paddingHorizontal: 6 },
  dialogo: { position: "absolute", top: 14, left: 0, right: 0, alignItems: "center" },
  canasta: { position: "absolute", top: 70, right: 16, backgroundColor: "#fff", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 6 },
  canastaTexto: { fontSize: 20, fontWeight: "800", color: "#3B2F5C" },
  barra: { position: "absolute", bottom: 10, left: 0, right: 0, flexGrow: 0 },
  barraContenido: { flexDirection: "row", justifyContent: "center", gap: 12, paddingHorizontal: 12 },
  herramienta: { width: 100, height: 96, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  apagado: { opacity: 0.55 },
  herramientaEmoji: { fontSize: 42 },
  semilla: { width: 92, height: 92, borderRadius: 20, backgroundColor: "#FFF8E1", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#A1887F" },
  semillaEmoji: { fontSize: 40 },
  semillaNombre: { fontSize: 13, fontWeight: "800", color: "#3B2F5C" },
});
