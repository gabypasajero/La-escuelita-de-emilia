import { VERDURAS, type Verdura } from "@escuelita/core";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
import { Avatar } from "../components/Avatar";
import { BotonCasa } from "../components/BotonCasa";
import { EmiliaDibujo, Globo, TitoDibujo } from "../components/Personajes";
import { Monedas, useJuego } from "../lib/juego";
import { hablar } from "../lib/voz";

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

  const decir = (t: string) => { setDicho(t); void hablar(t); };

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

        {/* Don Pedro junto a su galpón */}
        <View pointerEvents="none" style={{ position: "absolute", left: 960 * k, top: 120 * k, alignItems: "center" }}>
          <Text style={{ fontSize: 80 * k }}>👨‍🌾</Text>
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

        <Animated.View pointerEvents="none" style={coloca(tito, tiW, tiH, false)}><TitoDibujo alto={tiH} /></Animated.View>
        <Animated.View pointerEvents="none" style={coloca(emilia, emW, emH, false)}><EmiliaDibujo alto={emH} /></Animated.View>
        <Animated.View pointerEvents="none" style={coloca(pos, avW, avH, true)}>
          <View style={{ transform: [{ scaleX: mira }] }}>
            <Avatar apariencia={perfil.apariencia} alto={avH} accesorios={{ cabeza: accesorioPuesto("cabeza"), cara: accesorioPuesto("cara"), cuello: accesorioPuesto("cuello"), mano: accesorioPuesto("mano") }} />
          </View>
        </Animated.View>
      </View>

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
        {p.etapa === "sembrada" && <Text style={centro}>🟤</Text>}
        {p.etapa === "regada" && <Text style={centro}>💧</Text>}
        {p.etapa === "brote" && <Text style={centro}>🌱</Text>}
        {p.etapa === "creciendo" && <Text style={{ ...centro, fontSize: 50 * k }}>🌿</Text>}
        {p.etapa === "lista" && p.verdura && <Text style={{ ...centro, fontSize: 62 * k }}>✨{p.verdura.emoji}✨</Text>}
      </View>
    </View>
  );
}

function Fondo({ k }: { k: number }) {
  return (
    <Svg width={1100 * k} height={700 * k} viewBox="0 0 1100 700" pointerEvents="none">
      <Rect x="0" y="0" width="1100" height="700" fill="#9CCC65" />
      <Rect x="0" y="0" width="1100" height="170" fill="#B3E5FC" />
      <Path d="M0 170 Q 250 110 520 160 T 1100 150 V 200 H 0 Z" fill="#8BC34A" />
      <Rect x="0" y="190" width="1100" height="510" fill="#9CCC65" />
      {/* Galpón de Don Pedro */}
      <Path d="M900 120 L990 70 L1080 120 Z" fill="#B71C1C" />
      <Rect x="910" y="118" width="160" height="90" fill="#E57373" />
      <Rect x="975" y="150" width="34" height="58" fill="#5D4037" />
      {/* Espantapájaros */}
      <Rect x="96" y="250" width="8" height="110" fill="#8D6E63" />
      <Rect x="66" y="280" width="68" height="8" fill="#8D6E63" />
      <Circle cx="100" cy="245" r="20" fill="#FFE0B2" />
      <Path d="M76 236 L124 236 L114 216 L86 216 Z" fill="#FDD835" />
      <Rect x="84" y="270" width="32" height="40" rx="4" fill="#42A5F5" />
      {/* Cerca */}
      {Array.from({ length: 23 }, (_, i) => <Rect key={i} x={10 + i * 48} y="200" width="8" height="34" fill="#A1887F" />)}
      <Rect x="6" y="208" width="1090" height="6" fill="#A1887F" />
      {/* Camino y árbol */}
      <Ellipse cx="560" cy="650" rx="560" ry="40" fill="#D7B98E" />
      <Rect x="60" y="430" width="16" height="70" fill="#6D4C41" />
      <Circle cx="68" cy="420" r="46" fill="#43A047" />
      {[50, 80, 66].map((x, i) => <Circle key={i} cx={x} cy={405 + i * 12} r="6" fill="#FB8C00" />)}
    </Svg>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "#9CCC65", justifyContent: "center" },
  parcela: { position: "absolute", borderRadius: 18 },
  parcelaCerca: { borderWidth: 4, borderColor: "#FDD835" },
  tierra: { flex: 1, borderRadius: 16, backgroundColor: "#8D6E63", overflow: "hidden" },
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
