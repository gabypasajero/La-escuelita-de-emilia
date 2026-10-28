import { NUMEROS, mezclar } from "@escuelita/core";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../components/Pantalla";
import { EmiliaDibujo, Globo, TitoDibujo } from "../components/Personajes";
import { DESBLOQUEOS, useJuego } from "../lib/juego";
import { hablar } from "../lib/voz";

const TESOROS = [
  { emoji: "🐚", nombre: "una concha" },
  { emoji: "💎", nombre: "un diamante" },
  { emoji: "🦴", nombre: "un hueso de dinosaurio" },
  { emoji: "🪙", nombre: "una moneda antigua" },
  { emoji: "⭐", nombre: "una estrella de mar" },
  { emoji: "🦀", nombre: "un cangrejito" },
  { emoji: "🔑", nombre: "una llave misteriosa" },
];

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
    if (n === 5) {
      ganar(1);
      decir("¡Cinco torres! ¡Tu castillo está listo! Le ponemos una bandera.");
    } else decir(`${NUMEROS[n]!.palabra[0]!.toUpperCase()}${NUMEROS[n]!.palabra.slice(1)}. ¡Otra torre!`);
  }

  return (
    <Pantalla color="#FFE0B2">
      <View style={estilos.fila}>
        <EmiliaDibujo alto={100} />
        <TitoDibujo alto={48} />
        <Globo texto={dicho} alLado="izquierda" />
      </View>

      {modo === "tesoros" ? (
        <>
          <Text style={estilos.contador}>{"💎".repeat(encontrados)}{"▫️".repeat(total - encontrados)}</Text>
          <View style={estilos.grilla}>
            {montones.map((m, i) => (
              <Pressable key={i} onPress={() => escarbar(i)} style={[estilos.monton, m.abierto && estilos.hoyo]} accessibilityLabel={`Montón ${i + 1}`}>
                <Text style={estilos.montonEmoji}>{m.abierto ? (m.tesoro ? m.tesoro.emoji : "·") : "⛰️"}</Text>
              </Pressable>
            ))}
          </View>
          {encontrados === total && (
            <Pressable style={estilos.boton} onPress={() => { setMontones(nuevoArenero()); decir("¡Escondí tesoros nuevos! A buscar."); }} accessibilityLabel="Otra vez">
              <Text style={estilos.botonTexto}>🔁 Otra vez</Text>
            </Pressable>
          )}
        </>
      ) : (
        <View style={estilos.castillo}>
          {torres >= 5 && <Text style={estilos.bandera}>🚩</Text>}
          <View style={estilos.torres}>
            {Array.from({ length: torres }, (_, k) => <View key={k} style={[estilos.torre, { height: 60 + (k % 2) * 30 }]} />)}
          </View>
          <View style={estilos.base} />
          <Pressable style={estilos.boton} onPress={torres >= 5 ? () => { setTorres(0); decir("¡Hagamos otro castillo!"); } : torre} accessibilityLabel="Agregar torre">
            <Text style={estilos.botonTexto}>{torres >= 5 ? "🔁 Otro castillo" : "🪣 Agregar torre"}</Text>
          </Pressable>
        </View>
      )}

      <View style={estilos.modos}>
        <Pressable style={[estilos.modo, modo === "tesoros" && estilos.modoActivo]} onPress={() => { setModo("tesoros"); decir("¡A buscar tesoros!"); }} accessibilityLabel="Buscar tesoros">
          <Text style={estilos.botonTexto}>⛏️ Tesoros</Text>
        </Pressable>
        <Pressable style={[estilos.modo, modo === "castillo" && estilos.modoActivo]} onPress={() => { setModo("castillo"); decir("¡Hagamos un castillo de arena! Toca el balde para agregar torres."); }} accessibilityLabel="Hacer castillo">
          <Text style={estilos.botonTexto}>🏰 Castillo</Text>
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
  torre: { width: 50, backgroundColor: "#FFCC80", borderTopLeftRadius: 8, borderTopRightRadius: 8, borderWidth: 3, borderColor: "#E0A060" },
  base: { width: 320, height: 26, backgroundColor: "#E0A060", borderRadius: 10, marginBottom: 14 },
  boton: { backgroundColor: "#fff", borderRadius: 24, paddingHorizontal: 22, paddingVertical: 12, marginTop: 10 },
  botonTexto: { fontSize: 20, fontWeight: "900", color: "#3B2F5C" },
  modos: { flexDirection: "row", gap: 14, marginTop: 14 },
  modo: { backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 22, paddingHorizontal: 18, paddingVertical: 10 },
  modoActivo: { backgroundColor: "#fff", borderWidth: 3, borderColor: "#FB8C00" },
});
