import { NUMEROS, mezclar } from "@escuelita/core";
import { Redirect } from "expo-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { Rebote } from "../components/Rebote";
import { sonido } from "../lib/sonidos";
import { Pantalla } from "../components/Pantalla";
import { EmiliaDibujo, Globo, TitoDibujo } from "../components/Personajes";
import { DESBLOQUEOS, useJuego } from "../lib/juego";
import { hablar } from "../lib/voz";
import { Icono, TextoIconos } from "../components/Iconos";

const TESOROS = [
  { emoji: "🐚", nombre: "una concha" },
  { emoji: "💎", nombre: "un diamante" },
  { emoji: "🦴", nombre: "un hueso de dinosaurio" },
  { emoji: "🪙", nombre: "una moneda antigua" },
  { emoji: "⭐", nombre: "una estrella de mar" },
  { emoji: "🦀", nombre: "un cangrejito" },
  { emoji: "🔑", nombre: "una llave misteriosa" },
];

/** Montoncito de arena: al escarbarlo salta la arena y, si hay tesoro, aparece brincando. */
function MontonDeArena({ abierto, tesoro, alTocar, etiqueta }: { abierto: boolean; tesoro: string | null; alTocar: () => void; etiqueta: string }) {
  const a = useRef(new Animated.Value(abierto ? 1 : 0)).current;
  useEffect(() => {
    if (!abierto) return a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 650, easing: Easing.out(Easing.back(2.5)), useNativeDriver: true }).start();
  }, [abierto, a]);
  return (
    <Pressable onPress={alTocar} style={[estilos.monton, abierto && estilos.hoyo]} accessibilityLabel={etiqueta}>
      {!abierto && <Icono e="⛰️" tam={62} sinSombra />}
      {abierto && [0, 1, 2, 3, 4, 5].map((i) => (
        <Animated.View key={i} pointerEvents="none" style={{ position: "absolute", width: 10, height: 10, borderRadius: 5, backgroundColor: i % 2 ? "#FFCC80" : "#E0A060", opacity: a.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] }), transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(i * 1.05) * 58] }) }, { translateY: a.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -46 - (i % 3) * 10, 10] }) }] }} />
      ))}
      {abierto && (tesoro ? (
        <Animated.View style={{ transform: [{ scale: a }, { translateY: a.interpolate({ inputRange: [0, 0.6, 1], outputRange: [20, -14, 0] }) }] }}><Icono e={tesoro} tam={62} sinSombra /></Animated.View>
      ) : <Text style={estilos.montonEmoji}>·</Text>)}
    </Pressable>
  );
}

/** Torre del castillo: aparece desde abajo con un rebote. */
function Torre({ alto, children }: { alto: number; children?: ReactNode }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.spring(a, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true }).start(); }, [a]);
  return (
    <Animated.View style={[estilos.torre, { height: alto, transformOrigin: "bottom", transform: [{ scaleY: a }] }]}>
      <View style={estilos.almenas}>{[0, 1, 2].map((i) => <View key={i} style={estilos.almena} />)}</View>
      <View style={estilos.ventanita} />
      {children}
    </Animated.View>
  );
}

type Monton = { tesoro: (typeof TESOROS)[number] | null; abierto: boolean };

function nuevoArenero(): Monton[] {
  const cantidad = 3 + Math.floor(Math.random() * 3); // 3 a 5 tesoros escondidos
  const tesoros = mezclar(TESOROS).slice(0, cantidad);
  return mezclar([...tesoros, ...Array<null>(9 - cantidad).fill(null)]).map((tesoro) => ({ tesoro, abierto: false }));
}

/** Arenero del parque (se abre con estrellas): buscar tesoros contando y armar un castillo. */
export default function Arenero() {
  const { estrellas, ganar, perfil } = useJuego();
  const [modo, setModo] = useState<"tesoros" | "castillo">("tesoros");
  const [montones, setMontones] = useState(nuevoArenero);
  const [torres, setTorres] = useState(0);
  const [dicho, setDicho] = useState("¡Bienvenidos al arenero! Escarba en la arena para buscar tesoros.");

  useEffect(() => void hablar("¡Bienvenidos al arenero! Escarba en la arena para buscar tesoros."), []);

  if (!perfil) return <Redirect href="/quien-juega" />;
  if (estrellas < DESBLOQUEOS.arenero) return <Redirect href="/plaza" />;

  const decir = (t: string) => {
    setDicho(t);
    void hablar(t);
  };
  const total = montones.filter((m) => m.tesoro).length;
  const encontrados = montones.filter((m) => m.tesoro && m.abierto).length;

  function escarbar(i: number) {
    const m = montones[i]!;
    if (m.abierto) return;
    const nuevos = montones.map((x, k) => (k === i ? { ...x, abierto: true } : x));
    setMontones(nuevos);
    if (m.tesoro) sonido.acierto(); else sonido.casi();
    if (!m.tesoro) return decir("Aquí solo hay arena. ¡Sigue buscando!");
    const n = nuevos.filter((x) => x.tesoro && x.abierto).length;
    if (n === total) {
      ganar(1);
      decir(`¡Encontraste ${m.tesoro.nombre}! ¡Ya tienes los ${NUMEROS[total]!.palabra} tesoros! ¿Jugamos otra vez?`);
      return;
    }
    decir(`¡Encontraste ${m.tesoro.nombre}! Llevas ${NUMEROS[n]!.palabra}. Faltan ${NUMEROS[total - n]!.palabra}.`);
  }

  function torre() {
    if (torres >= 5) return;
    const n = torres + 1;
    setTorres(n);
    sonido.paso(n * 2);
    if (n === 5) {
      ganar(1);
      decir("¡Cinco torres! ¡Tu castillo está listo! Le ponemos una bandera.");
    } else decir(`${NUMEROS[n]!.palabra[0]!.toUpperCase()}${NUMEROS[n]!.palabra.slice(1)}. ¡Otra torre!`);
  }

  return (
    <Pantalla color="#FFE0B2" fondo="arenero">
      <View style={estilos.fila}>
        <EmiliaDibujo alto={100} />
        <TitoDibujo alto={48} />
        <Globo texto={dicho} alLado="izquierda" />
      </View>

      {modo === "tesoros" ? (
        <>
          <View style={{ flexDirection: "row", marginVertical: 6 }}>{Array.from({ length: total }, (_, i) => <View key={i} style={i < encontrados ? undefined : { opacity: 0.25 }}><Icono e="💎" tam={34} sinSombra /></View>)}</View>
          <View style={estilos.grilla}>
            {montones.map((m, i) => (
              <MontonDeArena key={i} abierto={m.abierto} tesoro={m.tesoro?.emoji ?? null} alTocar={() => escarbar(i)} etiqueta={`Montón ${i + 1}`} />
            ))}
          </View>
          {encontrados === total && (
            <Rebote style={estilos.boton} onPress={() => { setMontones(nuevoArenero()); decir("¡Escondí tesoros nuevos! A buscar."); }} accessibilityLabel="Otra vez">
              <TextoIconos estilo={estilos.botonTexto} texto={`🔁 Otra vez`} />
            </Rebote>
          )}
        </>
      ) : (
        <View style={estilos.castillo}>
          {torres >= 5 && <TextoIconos estilo={estilos.bandera} texto={`🚩`} />}
          <View style={estilos.torres}>
            {Array.from({ length: torres }, (_, k) => <Torre key={k} alto={70 + (k % 2) * 34 + (k === 2 ? 30 : 0)} />)}
          </View>
          <View style={estilos.base} />
          <Rebote style={estilos.boton} onPress={torres >= 5 ? () => { setTorres(0); decir("¡Hagamos otro castillo!"); } : torre} accessibilityLabel="Agregar torre">
            <TextoIconos estilo={estilos.botonTexto} texto={torres >= 5 ? "🔁 Otro castillo" : "🪣 Agregar torre"} />
          </Rebote>
        </View>
      )}

      <View style={estilos.modos}>
        <Pressable style={[estilos.modo, modo === "tesoros" && estilos.modoActivo]} onPress={() => { setModo("tesoros"); decir("¡A buscar tesoros!"); }} accessibilityLabel="Buscar tesoros">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icono e="⛏️" tam={26} sinSombra /><Text style={estilos.botonTexto}>Tesoros</Text></View>
        </Pressable>
        <Pressable style={[estilos.modo, modo === "castillo" && estilos.modoActivo]} onPress={() => { setModo("castillo"); decir("¡Hagamos un castillo de arena! Toca el balde para agregar torres."); }} accessibilityLabel="Hacer castillo">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icono e="🏰" tam={26} sinSombra /><Text style={estilos.botonTexto}>Castillo</Text></View>
        </Pressable>
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  contador: { fontSize: 30, marginVertical: 6 },
  grilla: { flexDirection: "row", flexWrap: "wrap", width: 3 * 112, gap: 12, justifyContent: "center" },
  monton: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#FFCC80", alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: "#FFB74D" },
  hoyo: { backgroundColor: "#D7A86E", borderColor: "#A1887F" },
  montonEmoji: { fontSize: 50 },
  castillo: { alignItems: "center", justifyContent: "flex-end", minHeight: 260 },
  bandera: { fontSize: 48 },
  torres: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  torre: { width: 58, backgroundColor: "#FFCC80", borderWidth: 3, borderColor: "#E0A060", alignItems: "center" },
  almenas: { position: "absolute", top: -14, left: -3, right: -3, flexDirection: "row", justifyContent: "space-between" },
  almena: { width: 14, height: 14, backgroundColor: "#FFCC80", borderWidth: 3, borderBottomWidth: 0, borderColor: "#E0A060" },
  ventanita: { width: 14, height: 20, borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: "#B9824A", marginTop: 16 },
  base: { width: 320, height: 26, backgroundColor: "#E0A060", borderRadius: 10, marginBottom: 14 },
  boton: { backgroundColor: "#fff", borderRadius: 24, paddingHorizontal: 22, paddingVertical: 12, marginTop: 10 },
  botonTexto: { fontSize: 20, fontWeight: "900", color: "#3B2F5C" },
  modos: { flexDirection: "row", gap: 14, marginTop: 14 },
  modo: { backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 22, paddingHorizontal: 18, paddingVertical: 10 },
  modoActivo: { backgroundColor: "#fff", borderWidth: 3, borderColor: "#FB8C00" },
});
