import { LETRAS, presentarLetra, rondaSonidoInicial, type Letra } from "@escuelita/core";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../components/Pantalla";
import { Pregunta } from "../components/Pregunta";
import { COLORES } from "../lib/tema";
import { hablar } from "../lib/voz";
import { Icono } from "../components/Iconos";

/**
 * Letras por sus sonidos, para quien todavía no lee. Conocer: Emilia dice el
 * nombre, el sonido y el inicio de la palabra alargado ("Eme. Suena mmm. Mmm… mono").
 * Jugar: "¿Cuál empieza con mmm?" y se elige entre dibujos, sin leer.
 */
export default function Letras() {
  const [jugando, setJugando] = useState(false);
  const [elegida, setElegida] = useState<Letra | null>(null);
  const [soloVocales, setSoloVocales] = useState(false);

  async function presentar(l: Letra) {
    setElegida(l);
    await hablar(presentarLetra(l));
  }

  return (
    <Pantalla color={COLORES.letras} fondo="aula">
      <Pressable style={estilos.modo} onPress={() => { setJugando((j) => !j); setElegida(null); }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Icono e={jugando ? "📖" : "🎮"} tam={30} sinSombra /><Text style={estilos.modoTexto}>{jugando ? "Conocer" : "Jugar"}</Text></View>
      </Pressable>
      {jugando ? (
        <Pregunta
          generar={(nivel) => rondaSonidoInicial(nivel)}
          estimulo={(r) => (
            <Pressable onPress={() => void hablar(r.correcta.sonido)} accessibilityLabel="Escuchar el sonido" style={estilos.oreja}>
              <Text style={estilos.orejaTexto}>👂 {r.correcta.sonido}</Text>
            </Pressable>
          )}
          opcion={(l) => <Icono e={l.emoji} tam={86} />}
          alAcertar={(r) => `¡Sí! ${r.correcta.palabra} empieza con ${r.correcta.sonido}.`}
        />
      ) : (
        <View style={estilos.conocer}>
          {elegida && (
            <Pressable style={estilos.destacada} onPress={() => void presentar(elegida)} accessibilityLabel="Escuchar otra vez">
              <Text style={[estilos.letraGrande, elegida.esVocal && estilos.vocal]}>
                {elegida.letra} {elegida.letra.toLowerCase()}
              </Text>
              <Icono e={elegida.emoji} tam={80} />
              <Text style={estilos.palabra}>
                <Text style={estilos.inicial}>{elegida.palabra[0]}</Text>
                {elegida.palabra.slice(1)}
              </Text>
              <Text style={estilos.repetir}>🔊</Text>
              <Pressable
                style={estilos.escribir}
                accessibilityLabel="Escribir esta letra"
                onPress={() => router.push(`/trazar?serie=${elegida.esVocal ? "vocales" : "abecedario"}&c=${elegida.letra}`)}
              >
                <Text style={[estilos.escribirTexto, { color: "#fff" }]}>✏️ Escribir</Text>
              </Pressable>
            </Pressable>
          )}
          <Pressable style={[estilos.filtro, soloVocales && estilos.filtroActivo]} onPress={() => { setSoloVocales((v) => !v); void hablar(soloVocales ? "Todo el abecedario" : "Las vocales: a, e, i, o, u"); }} accessibilityLabel="Solo vocales">
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icono e={soloVocales ? "🔤" : "🅰️"} tam={22} sinSombra /><Text style={estilos.escribirTexto}>{soloVocales ? "Ver todas" : "Solo vocales"}</Text></View>
          </Pressable>
          <ScrollView contentContainerStyle={estilos.grilla}>
            {LETRAS.filter((l) => !soloVocales || l.esVocal).map((l) => (
              <Pressable
                key={l.letra}
                style={[estilos.tarjeta, elegida === l && estilos.tarjetaActiva]}
                onPress={() => void presentar(l)}
                accessibilityLabel={`Letra ${l.nombre}`}
              >
                <Text style={[estilos.letra, l.esVocal && estilos.vocal]}>{l.letra}</Text>
                <Icono e={l.emoji} tam={40} sinSombra />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  modo: { alignSelf: "flex-end", marginBottom: 12, backgroundColor: "#fff", borderRadius: 24, padding: 16 },
  modoTexto: { fontSize: 20, fontWeight: "700", color: COLORES.texto },
  conocer: { flex: 1, width: "100%", alignItems: "center" },
  destacada: { flexDirection: "row", alignItems: "center", gap: 18, backgroundColor: "#fff", borderRadius: 28, paddingHorizontal: 24, paddingVertical: 8, marginBottom: 14, borderWidth: 5, borderColor: "#FDD835" },
  letraGrande: { fontSize: 64, fontWeight: "800", color: COLORES.texto },
  dibujoGrande: { fontSize: 64 },
  palabra: { fontSize: 40, fontWeight: "700", color: COLORES.texto },
  inicial: { color: "#E53935", fontWeight: "900" },
  repetir: { fontSize: 32 },
  escribir: { backgroundColor: "#43A047", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  escribirTexto: { fontSize: 18, fontWeight: "900", color: "#3B2F5C" },
  filtro: { backgroundColor: "#fff", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 10 },
  filtroActivo: { backgroundColor: "#FDD835" },
  grilla: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 14, paddingBottom: 24 },
  tarjeta: { width: 110, height: 120, borderRadius: 20, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  tarjetaActiva: { borderWidth: 5, borderColor: "#FDD835" },
  letra: { fontSize: 48, fontWeight: "800", color: COLORES.texto },
  vocal: { color: "#E53935" },
  emoji: { fontSize: 32 },
  oreja: { backgroundColor: "#fff", borderRadius: 30, paddingHorizontal: 28, paddingVertical: 12 },
  orejaTexto: { fontSize: 44, fontWeight: "800", color: COLORES.texto },
  dibujoOpcion: { fontSize: 72 },
});
