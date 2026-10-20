import { LETRAS, rondaLetraInicial } from "@escuelita/core";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Pantalla } from "../components/Pantalla";
import { Pregunta } from "../components/Pregunta";
import { COLORES } from "../lib/tema";
import { hablar } from "../lib/voz";

export default function Letras() {
  const [jugando, setJugando] = useState(false);

  return (
    <Pantalla color={COLORES.letras}>
      <Pressable style={estilos.modo} onPress={() => setJugando((j) => !j)}>
        <Text style={estilos.modoTexto}>{jugando ? "📖 Conocer" : "🎮 Jugar"}</Text>
      </Pressable>
      {jugando ? (
        <Pregunta
          generar={(nivel) => rondaLetraInicial(nivel)}
          estimulo={(r) => <Text style={estilos.grande}>{r.palabra.emoji}</Text>}
          opcion={(l) => <Text style={estilos.letra}>{l.letra}</Text>}
          alAcertar={(r) => `¡Sí! ${r.correcta.palabra} empieza con ${r.correcta.letra}`}
        />
      ) : (
        <ScrollView contentContainerStyle={estilos.grilla}>
          {LETRAS.map((l) => (
            <Pressable key={l.letra} style={estilos.tarjeta} onPress={() => hablar(`${l.letra}... de ${l.palabra}`)}>
              <Text style={[estilos.letra, l.esVocal && estilos.vocal]}>{l.letra}</Text>
              <Text style={estilos.emoji}>{l.emoji}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  modo: { alignSelf: "flex-end", marginBottom: 12, backgroundColor: "#fff", borderRadius: 24, padding: 16 },
  modoTexto: { fontSize: 20, fontWeight: "700", color: COLORES.texto },
  grilla: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 14, paddingBottom: 24 },
  tarjeta: { width: 110, height: 120, borderRadius: 20, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  letra: { fontSize: 48, fontWeight: "800", color: COLORES.texto },
  vocal: { color: "#E53935" },
  emoji: { fontSize: 32 },
  grande: { fontSize: 120 },
});
