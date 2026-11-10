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
import { dibujoEnSvg, Icono, TextoIconos } from "../components/Iconos";
import { sonido } from "../lib/sonidos";

/**
 * Huerto de Don Pedro como escena para caminar. Cada planta se cuida como
 * una de verdad: hoyito con la pala, semilla, agua y sol. La planta va
 * pidiendo lo que le falta (una gota o un solcito), crece por etapas, da
 * flores, luego su fruto, y se cosecha tocando la planta.
 */

type Etapa = "tierra" | "hoyo" | "sembrada" | "brote" | "creciendo" | "flor" | "lista";
type Herramienta = "pala" | "semilla" | "agua" | "sol";
interface Parcela { etapa: Etapa; verdura?: Verdura; mojada?: boolean; creceEn?: number }

const CRECE: Etapa[] = ["sembrada", "brote", "creciendo"];
const SIGUE: Partial<Record<Etapa, Etapa>> = { sembrada: "brote", brote: "creciendo", creciendo: "flor", flor: "lista" };
const HERRAMIENTAS: Array<{ id: Herramienta; emoji: string; nombre: string }> = [
  { id: "pala", emoji: "⛏️", nombre: "Pala" },
  { id: "semilla", emoji: "🌱", nombre: "Semillas" },
  { id: "agua", emoji: "💧", nombre: "Regar" },
  { id: "sol", emoji: "☀️", nombre: "Sol" },
];
/** Qué necesita la planta ahora (lo muestra en su globito). */
function necesita(p: Parcela): Herramienta | "cosechar" | null {
  if (p.etapa === "tierra") return "pala";
  if (p.etapa === "hoyo") return "semilla";
  if (p.etapa === "lista") return "cosechar";
  if (!CRECE.includes(p.etapa) || p.creceEn) return null;
  return p.mojada ? "sol" : "agua";
}
function pista(p: Parcela): string {
  const n = necesita(p);
  if (n === "pala") return "Primero hacemos un hoyito con la pala.";
  if (n === "semilla") return "El hoyito está listo. ¡Ponle una semilla!";
  if (n === "agua") return p.etapa === "sembrada" ? "La semilla tiene sed. ¡Hay que regarla!" : "La plantita pide agua. ¡Tiene sed!";
  if (n === "sol") return "Ya tomó agua. Ahora necesita un poco de sol.";
  if (n === "cosechar") return "¡Ya está lista! Toca la planta para cosecharla.";
  return p.etapa === "flor" ? "¡Le salieron flores! De ahí viene el fruto. Esperemos un poquito." : "Está creciendo con el sol. ¡Mira!";
}

// Escena en unidades de diseño de 1100×700.
const PARCELAS_POS = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 300 + (i % 3) * 230, y: 300 + Math.floor(i / 3) * 210 }));
const CRECE_MS = 3800;

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

  // Con agua y sol, cada planta pasa a su etapa siguiente; de la flor sale el fruto.
  useEffect(() => {
    const t = setInterval(() => {
      const ahora = Date.now();
      const p = guardado.parcelas;
      if (!p.some((x) => x.creceEn && x.creceEn <= ahora)) return;
      sonido.paso(8);
      setParcelas(p.map((x) => {
        if (!x.creceEn || x.creceEn > ahora) return x;
        const etapa = SIGUE[x.etapa] ?? x.etapa;
        return { ...x, etapa, mojada: false, creceEn: etapa === "flor" ? ahora + CRECE_MS + 1200 : undefined };
      }));
    }, 400);
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

  function cosechar(i: number) {
    const p = guardado.parcelas[i]!;
    if (p.etapa !== "lista" || !p.verdura) return;
    const v = p.verdura;
    setParcelas(guardado.parcelas.map((x, k2) => (k2 === i ? { etapa: "tierra" } : x)));
    setCanasta({ ...guardado.canasta, [v.id]: (guardado.canasta[v.id] ?? 0) + 1 });
    ganar(1);
    decir(`¡Cosechaste ${v.id === "porotos" ? "porotos" : `${v.articulo === "la" ? "una" : "un"} ${v.nombre}`}! ${v.dato}`);
  }

  function irAParcela(i: number) {
    const p = PARCELAS_POS[i]!;
    // Si ya está al lado y la planta está lista, tocarla es cosecharla.
    if (cerca === i && guardado.parcelas[i]!.etapa === "lista") return cosechar(i);
    setCerca(null);
    caminar(p.x - 70, p.y + 70, () => {
      setCerca(i);
      const parcela = guardado.parcelas[i]!;
      if (parcela.etapa === "lista") return cosechar(i);
      decir(parcela.verdura && parcela.etapa !== "tierra" ? `Aquí hay ${parcela.verdura.id === "porotos" ? "porotos" : `${parcela.verdura.articulo} ${parcela.verdura.nombre}`}. ${pista(parcela)}` : pista(parcela));
    });
  }

  function usar(h: Herramienta) {
    if (cerca === null) return decir("Primero camina hasta una parcela.");
    const p = parcelas[cerca]!;
    const n = necesita(p);
    if (n !== h) return decir(n === "cosechar" || n === null ? pista(p) : `Mmm, todavía no. ${pista(p)}`);
    const cambiar = (nueva: Parcela) => setParcelas(parcelas.map((x, i) => (i === cerca ? nueva : x)));
    if (h === "pala") { cambiar({ etapa: "hoyo" }); decir("¡Un hoyito perfecto! Ahora elige qué semilla sembrar."); setEligiendoSemilla(true); }
    else if (h === "semilla") setEligiendoSemilla(true);
    else if (h === "agua") {
      cambiar({ ...p, mojada: true });
      decir(p.etapa === "sembrada" ? "¡Glu, glu! La tierra quedó mojadita. Ahora necesita sol." : "¡Qué rica agüita! Ahora un poco de sol.");
    } else if (h === "sol") {
      cambiar({ ...p, creceEn: Date.now() + CRECE_MS });
      decir(p.etapa === "sembrada" ? "El sol calienta la tierra… ¡la semilla está despertando!" : "Con agua y sol, ¡mira cómo crece!");
    }
  }

  function sembrar(v: Verdura) {
    if (cerca === null) return;
    setParcelas(parcelas.map((x, i) => (i === cerca ? { etapa: "sembrada", verdura: v } : x)));
    sonido.toque();
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
        <View style={{ flexDirection: "row", alignItems: "center" }}><TextoIconos estilo={estilos.canastaTexto} texto={`🧺 `} />{Object.keys(canasta).length ? <TextoIconos texto={Object.entries(canasta).map(([id, n]) => `${VERDURAS.find((v) => v.id === id)!.emoji}${n} `).join("")} tam={30} /> : <Text style={estilos.canastaTexto}>vacía</Text>}</View>
      </View>

      {eligiendoSemilla ? (
        <ScrollView horizontal style={estilos.barra} contentContainerStyle={estilos.barraContenido}>
          {VERDURAS.map((v) => (
            <Pressable key={v.id} style={estilos.semilla} onPress={() => sembrar(v)} accessibilityLabel={`Semilla de ${v.nombre}`}>
              <Icono e={v.emoji} tam={46} sinSombra />
              <Text style={estilos.semillaNombre}>{v.nombre}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={[estilos.barra, estilos.barraContenido]}>
          {HERRAMIENTAS.map((h) => (
            <Pressable key={h.id} style={[estilos.herramienta, cerca === null && estilos.apagado]} onPress={() => usar(h.id)} accessibilityLabel={h.nombre}>
              <Icono e={h.emoji} tam={46} sinSombra />
              <Text style={estilos.semillaNombre}>{h.nombre}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const FORMA: Record<string, "raiz" | "suelo" | "alta"> = {
  zanahoria: "raiz", papa: "raiz", cebolla: "raiz",
  lechuga: "suelo", zapallo: "suelo", frutilla: "suelo", pepino: "suelo", brocoli: "suelo",
  tomate: "alta", pimenton: "alta", porotos: "alta", choclo: "alta",
};
const hoja = (x: number, y: number, dx: number, dy: number, color: string, k2: string) => (
  <Path key={k2} d={`M${x} ${y} Q${x + dx * 0.4} ${y + dy - Math.abs(dx) * 0.35} ${x + dx} ${y + dy} Q${x + dx * 0.5} ${y + dy + Math.abs(dx) * 0.4} ${x} ${y} Z`} fill={color} />
);

/** La planta dibujada según su tipo y su etapa: brote, mata, flores y fruto. */
function Planta({ p, k }: { p: Parcela; k: number }) {
  const v = p.verdura!;
  const forma = FORMA[v.id] ?? "alta";
  const n = { sembrada: 0, brote: 1, creciendo: 2, flor: 3, lista: 4 }[p.etapa as "sembrada"] ?? 0;
  const S = 92; // la línea de la tierra
  const piezas: React.ReactNode[] = [];
  if (n === 0) {
    [[52, S - 2], [60, S + 1], [68, S - 2]].forEach(([x, y]) => piezas.push(<Ellipse key={`s${x}`} cx={x} cy={y} rx="3.6" ry="2.6" fill="#D7B98E" stroke="#8D6E63" strokeWidth="0.8" />));
  } else if (n === 1) {
    piezas.push(<Path key="t" d={`M60 ${S} Q59 ${S - 9} 60 ${S - 16}`} stroke="#558B2F" strokeWidth="3" fill="none" strokeLinecap="round" />, hoja(60, S - 15, -13, -6, "#8BC34A", "a"), hoja(60, S - 15, 13, -7, "#9CCC65", "b"));
  } else if (forma === "alta") {
    const alto = [0, 0, 44, 66, 66][n]!;
    const choclo = v.id === "choclo";
    piezas.push(<Path key="t" d={`M60 ${S} Q${choclo ? 60 : 57} ${S - alto / 2} 60 ${S - alto}`} stroke={choclo ? "#7CB342" : "#558B2F"} strokeWidth={choclo ? 5 : 3.5} fill="none" strokeLinecap="round" />);
    for (let y = 12, i = 0; y < alto; y += 14, i++) {
      const l = i % 2 ? 1 : -1, largo = choclo ? 30 : 20;
      piezas.push(hoja(60, S - y, l * largo, choclo ? 6 : -4, i % 2 ? "#7CB342" : "#8BC34A", `h${i}`), hoja(60, S - y - 3, -l * (largo - 5), choclo ? 4 : -6, "#689F38", `g${i}`));
    }
    piezas.push(hoja(60, S - alto + 2, -9, -10, "#9CCC65", "p1"), hoja(60, S - alto + 2, 9, -10, "#8BC34A", "p2"));
    const puntos: Array<[number, number]> = choclo ? [[72, S - 34], [48, S - 46]] : [[42, S - 26], [78, S - 34], [52, S - 50]];
    if (n === 3) puntos.forEach(([x, y], i) => piezas.push(<G key={`f${i}`}>{[0, 1, 2, 3, 4].map((q) => <Circle key={q} cx={x + Math.cos(q * 1.257) * 3.4} cy={y + Math.sin(q * 1.257) * 3.4} r="2.6" fill={v.id === "porotos" ? "#F8BBD0" : "#FFF59D"} />)}<Circle cx={x} cy={y} r="2" fill="#FB8C00" /></G>));
    if (n === 4) puntos.forEach(([x, y], i) => piezas.push(<G key={`r${i}`}><Path d={`M60 ${y - 6} Q${(60 + x) / 2} ${y - 12} ${x} ${y - 8}`} stroke="#558B2F" strokeWidth="1.6" fill="none" />{dibujoEnSvg(v.emoji, x, y + 2, choclo ? 30 : 24)}</G>));
  } else if (forma === "suelo") {
    const r = [0, 0, 20, 30, 30][n]!;
    const rastrera = v.id === "zapallo" || v.id === "pepino";
    if (v.id === "lechuga" || v.id === "brocoli") {
      if (n === 4) piezas.push(<G key="c">{dibujoEnSvg(v.emoji, 60, S - 22, 58)}</G>);
      else for (let i = 0; i < 7; i++) piezas.push(hoja(60, S, Math.cos((i / 6) * Math.PI) * r, -Math.sin((i / 6) * Math.PI) * r * 0.9 - 4, i % 2 ? "#8BC34A" : "#7CB342", `l${i}`));
      if (n === 3) piezas.push(<Circle key="b" cx="60" cy={S - 14} r="9" fill={v.id === "brocoli" ? "#558B2F" : "#C5E1A5"} />);
    } else {
      if (rastrera) piezas.push(<Path key="g" d={`M60 ${S} Q40 ${S - 8} 30 ${S - 2} M60 ${S} Q84 ${S - 12} ${n >= 3 ? 104 : 90} ${S - 3}`} stroke="#558B2F" strokeWidth="3" fill="none" strokeLinecap="round" />);
      for (let i = 0; i < 6; i++) piezas.push(hoja(60 + (rastrera ? (i - 2.5) * 7 : 0), S - 2, Math.cos((i / 5) * Math.PI) * r * (rastrera ? 0.7 : 1), -Math.sin((i / 5) * Math.PI) * r * 0.8 - 5, i % 2 ? "#7CB342" : "#689F38", `l${i}`));
      const puntos: Array<[number, number, number]> = v.id === "zapallo" ? [[86, S - 14, 44]] : v.id === "pepino" ? [[36, S - 6, 26], [88, S - 8, 28]] : [[40, S - 6, 20], [60, S - 2, 20], [80, S - 7, 20]];
      if (n === 3) puntos.forEach(([x, y], i) => piezas.push(<G key={`f${i}`}>{[0, 1, 2, 3, 4].map((q) => <Circle key={q} cx={x + Math.cos(q * 1.257) * 4} cy={y - 4 + Math.sin(q * 1.257) * 4} r="3" fill={v.id === "frutilla" ? "#FFFFFF" : "#FFD54F"} />)}<Circle cx={x} cy={y - 4} r="2.2" fill="#FB8C00" /></G>));
      if (n === 4) puntos.forEach(([x, y, t], i) => piezas.push(<G key={`r${i}`}><Ellipse cx={x} cy={S + 1} rx={t * 0.42} ry="3" fill="#000" opacity="0.2" />{dibujoEnSvg(v.emoji, x, y, t)}</G>));
    }
  } else {
    // Crece escondida: arriba solo se ve la mata; cuando está lista, asoma un poquito.
    const alto = [0, 0, 22, 36, 36][n]!;
    if (n === 4) piezas.push(<G key="v">{dibujoEnSvg(v.emoji, 60, S - 4, 40)}</G>, <Ellipse key="m" cx="60" cy={S + 13} rx="30" ry="12" fill="#6D4C41" />, <Ellipse key="m2" cx="60" cy={S + 6} rx="26" ry="4" fill="#5D4037" />);
    for (let i = 0; i < 7; i++) {
      const a = ((i - 3) / 3) * 0.9;
      piezas.push(<Path key={`m${i}`} d={`M60 ${S - (n === 4 ? 16 : 0)} Q${60 + Math.sin(a) * alto * 0.5} ${S - alto * 0.7 - (n === 4 ? 16 : 0)} ${60 + Math.sin(a) * alto * 0.9} ${S - Math.cos(a) * alto - (n === 4 ? 16 : 0)}`} stroke={i % 2 ? "#7CB342" : "#558B2F"} strokeWidth={v.id === "cebolla" ? 3.4 : 2.6} fill="none" strokeLinecap="round" />);
      if (v.id !== "cebolla") piezas.push(<Circle key={`c${i}`} cx={60 + Math.sin(a) * alto * 0.9} cy={S - Math.cos(a) * alto - (n === 4 ? 16 : 0)} r={v.id === "papa" ? 4.5 : 3.4} fill={i % 2 ? "#8BC34A" : "#689F38"} />);
    }
    if (n === 3 && v.id === "papa") [[48, S - 34], [70, S - 30]].forEach(([x, y]) => piezas.push(<Circle key={`fl${x}`} cx={x} cy={y} r="4" fill="#E1BEE7" />, <Circle key={`fc${x}`} cx={x} cy={y} r="1.6" fill="#FFB300" />));
  }
  return <Svg width={176 * k} height={161 * k} viewBox="0 0 120 110">{piezas}</Svg>;
}

/** Gotas que caen al regar y rayos al dar sol. */
function Efecto({ tipo, k }: { tipo: "agua" | "sol"; k: number }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const ciclo = Animated.loop(Animated.timing(a, { toValue: 1, duration: tipo === "agua" ? 700 : 1400, easing: Easing.linear, useNativeDriver: true }));
    ciclo.start();
    return () => ciclo.stop();
  }, [a, tipo]);
  if (tipo === "sol") {
    return (
      <Animated.View pointerEvents="none" style={{ position: "absolute", top: -34 * k, alignSelf: "center", opacity: a.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.75, 1, 0.75] }), transform: [{ scale: a.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.92, 1.08, 0.92] }) }] }}>
        <Svg width={190 * k} height={150 * k} viewBox="0 0 190 150">
          <Path d="M95 18 L20 150 H170 Z" fill="#FFF176" opacity="0.38" />
          {[-2, -1, 0, 1, 2].map((i) => <Path key={i} d={`M95 22 L${95 + i * 34} 146`} stroke="#FFEE58" strokeWidth="5" strokeLinecap="round" opacity="0.6" />)}
          <Circle cx="95" cy="18" r="16" fill="#FFCA28" />
        </Svg>
      </Animated.View>
    );
  }
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: -20 * k, left: 0, right: 0, height: 90 * k, flexDirection: "row", justifyContent: "center", gap: 12 * k }}>
      {[0, 1, 2, 3].map((i) => (
        <Animated.View key={i} style={{ marginTop: (i % 2) * 14 * k, opacity: a.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }), transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, 64 * k] }) }] }}>
          <Icono e="💧" tam={22 * k} sinSombra />
        </Animated.View>
      ))}
    </View>
  );
}

function PlantaDe({ parcela: p, k }: { parcela: Parcela; k: number }) {
  const pide = necesita(p);
  // Al cambiar de etapa la planta "estira" con un rebote; el globito de lo que pide late.
  const crece = useRef(new Animated.Value(1)).current;
  const late = useRef(new Animated.Value(0)).current;
  const [regando, setRegando] = useState(false);
  useEffect(() => {
    crece.setValue(0.55);
    Animated.spring(crece, { toValue: 1, friction: 4, tension: 70, useNativeDriver: true }).start();
  }, [p.etapa, crece]);
  useEffect(() => {
    const ciclo = Animated.loop(Animated.sequence([
      Animated.timing(late, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(late, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]));
    ciclo.start();
    return () => ciclo.stop();
  }, [late]);
  useEffect(() => {
    if (!p.mojada) return;
    setRegando(true);
    const t = setTimeout(() => setRegando(false), 1500);
    return () => clearTimeout(t);
  }, [p.mojada]);
  const conPlanta = p.verdura && p.etapa !== "tierra" && p.etapa !== "hoyo";
  return (
    <View style={{ flex: 1 }}>
      <View style={[estilos.tierra, p.mojada && estilos.tierraHumeda]}>
        {[0, 1, 2].map((s) => <View key={s} style={[estilos.surco, { top: (22 + s * 32) * k }]} />)}
        {p.etapa === "hoyo" && <View style={estilos.planta}><View style={{ width: 50 * k, height: 20 * k, borderRadius: 25 * k, backgroundColor: "#3E2723" }} /></View>}
      </View>
      {conPlanta && (
        <Animated.View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 6 * k, alignItems: "center", transformOrigin: "bottom", transform: [{ scale: crece }, { translateY: p.etapa === "lista" ? late.interpolate({ inputRange: [0, 1], outputRange: [0, -4 * k] }) : 0 }] }}>
          <Planta p={p} k={k} />
        </Animated.View>
      )}
      {regando && <Efecto tipo="agua" k={k} />}
      {!!p.creceEn && p.etapa !== "flor" && <Efecto tipo="sol" k={k} />}
      {conPlanta && pide && (
        <Animated.View pointerEvents="none" style={[estilos.pide, { top: -30 * k, transform: [{ scale: late.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.12] }) }] }]}>
          <Icono e={pide === "agua" ? "💧" : pide === "sol" ? "☀️" : "🧺"} tam={30 * k} sinSombra />
        </Animated.View>
      )}
    </View>
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
  pide: { position: "absolute", right: -6, backgroundColor: "#FFFFFF", borderRadius: 30, padding: 6, borderWidth: 3, borderColor: "#FFD54F", boxShadow: "0 3px 0 rgba(59,47,92,0.25)" },
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
