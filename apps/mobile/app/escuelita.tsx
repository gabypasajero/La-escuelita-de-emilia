import { router, type Href } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../components/Pantalla";
import { EmiliaDibujo, Globo } from "../components/Personajes";
import { COLORES } from "../lib/tema";
import { hablar } from "../lib/voz";

/** Todos los juegos educativos viven en la Escuelita. */
const SALAS: Array<{ ruta: Href; nombre: string; emoji: string; color: string; frase: string }> = [
  { ruta: "/letras", nombre: "Letras", emoji: "🔤", color: "#29B6F6", frase: "¡Vamos a jugar con las letras y sus sonidos!" },
  { ruta: "/numeros", nombre: "Números", emoji: "🔢", color: "#66BB6A", frase: "¡A contar!" },
  { ruta: "/sumas", nombre: "Sumas", emoji: "➕", color: "#FFA726", frase: "¡Vamos a sumar con frutas!" },
  { ruta: "/letra-animal", nombre: "Letra y animal", emoji: "🐒", color: "#FFCA28", frase: "¿Qué animal empieza con esta letra?" },
  { ruta: "/animales", nombre: "Sonidos", emoji: "🐄", color: "#8D6E63", frase: "¿Quién hace este sonido?" },
  { ruta: "/juegos/memoria", nombre: "Memoria", emoji: "🃏", color: "#AB47BC", frase: "¡A buscar parejas!" },
  { ruta: "/juegos/tiendita", nombre: "Tiendita", emoji: "🛒", color: "#EF5350", frase: "Doña Rosa necesita ayuda en la tiendita." },
];

export default function Escuelita() {
  useEffect(() => void hablar("¡Llegamos a la escuelita! ¿A qué jugamos hoy?"), []);
  return (
    <Pantalla color={COLORES.letras}>
      <View style={estilos.fila}>
        <EmiliaDibujo alto={150} />
        <Globo texto="¿A qué jugamos hoy?" alLado="izquierda" />
      </View>
      <View style={estilos.salas}>
        {SALAS.map((s) => (
          <Pressable
            key={s.nombre}
            accessibilityLabel={s.nombre}
            style={[estilos.puerta, { backgroundColor: s.color }]}
            onPress={() => {
              hablar(s.frase);
              router.push(s.ruta);
            }}
          >
            <Text style={estilos.emoji}>{s.emoji}</Text>
            <Text style={estilos.nombre}>{s.nombre}</Text>
          </Pressable>
        ))}
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  salas: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 18, marginTop: 12, maxWidth: 900 },
  puerta: { width: 150, height: 170, borderTopLeftRadius: 75, borderTopRightRadius: 75, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 6, borderColor: "#fff" },
  emoji: { fontSize: 60 },
  nombre: { fontSize: 19, textAlign: "center", fontWeight: "800", color: "#fff" },
});
