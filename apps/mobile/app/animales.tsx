import { ANIMALES, rondaSonidoAnimal } from "@escuelita/core";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Pantalla } from "../components/Pantalla";
import { Pregunta } from "../components/Pregunta";
import { COLORES } from "../lib/tema";
import { hablar } from "../lib/voz";
import { Icono } from "../components/Iconos";

export default function Animales() {
  const [jugando, setJugando] = useState(false);

  return (
    <Pantalla color={COLORES.animales} fondo="campo">
      <Pressable style={estilos.modo} onPress={() => setJugando((j) => !j)}>
        <Text style={estilos.modoTexto}>{jugando ? "📖 Conocer" : "🎮 Jugar"}</Text>
      </Pressable>
      {jugando ? (
        <Pregunta
          generar={(nivel) => rondaSonidoAnimal(nivel)}
          opcion={(a) => <Icono e={a.emoji} tam={78} />}
          alAcertar={(r) => `¡Sí! Es el ${r.correcta.nombre}`}
        />
      ) : (
        <ScrollView contentContainerStyle={estilos.grilla}>
          {ANIMALES.map((a) => (
            <Pressable key={a.id} style={estilos.tarjeta} onPress={() => hablar(`${a.nombre}. ${a.sonido}`)}>
              <Icono e={a.emoji} tam={78} />
              <Text style={estilos.nombre}>{a.nombre}</Text>
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
  tarjeta: { width: 130, height: 140, borderRadius: 20, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 64 },
  nombre: { fontSize: 18, fontWeight: "700", color: COLORES.texto },
});
