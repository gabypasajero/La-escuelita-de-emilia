import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { TemaIngles } from "@escuelita/core";
import { Pantalla } from "../../components/Pantalla";
import { Globo, MaxDibujo } from "../../components/Personajes";
import { hablar, hablarYEsperar } from "../../lib/voz";

/** Juegos de la casa de Max (inglés, nivel «Hello»). */
const JUEGOS: Array<{ tema: TemaIngles; nombre: string; emoji: string; color: string; frase: string; explicacion: string }> = [
  { tema: "saludos", nombre: "Hello!", emoji: "👋", color: "#26A69A", frase: "Hello! Good morning!", explicacion: "Max te va a saludar en inglés. Toca el dibujo de lo que dice." },
  { tema: "colores", nombre: "Colors", emoji: "🎨", color: "#EC407A", frase: "Let's play with colors!", explicacion: "Max va a decir un color en inglés. ¡Toca ese color!" },
  { tema: "numeros", nombre: "Numbers", emoji: "🔢", color: "#66BB6A", frase: "Let's count! One, two, three!", explicacion: "Max va a decir un número en inglés. Toca el grupo con esas estrellas." },
  { tema: "animales", nombre: "Animals", emoji: "🐮", color: "#8D6E63", frase: "I love animals! Moo!", explicacion: "Max busca animales de la granja. Escucha y toca el animal." },
  { tema: "cuerpo", nombre: "My body", emoji: "👃", color: "#FFA726", frase: "Touch your nose!", explicacion: "Max va a nombrar partes del cuerpo. Tócalas en tu cuerpo y después en el dibujo." },
  { tema: "acciones", nombre: "Max says", emoji: "👏", color: "#5C6BC0", frase: "Max says: jump!", explicacion: "¡Max dice! Haz lo que dice Max y después toca el dibujo." },
];

/** Cada juego se explica en español solo la primera vez. */
const explicados = new Set<TemaIngles>();

export default function CasaDeMax() {
  const [entrando, setEntrando] = useState<TemaIngles | null>(null);
  useEffect(() => void hablar("Welcome to my house! What do you want to play?", "en"), []);

  const entrar = async (j: (typeof JUEGOS)[number]) => {
    if (entrando) return;
    setEntrando(j.tema);
    if (!explicados.has(j.tema)) {
      explicados.add(j.tema);
      await hablarYEsperar(j.explicacion, 200);
    } else {
      await hablarYEsperar(j.frase, 100, "en");
    }
    setEntrando(null);
    router.push(`/max/${j.tema}` as Href);
  };

  return (
    <Pantalla color="#E3F2FD">
      <View style={estilos.fila}>
        <MaxDibujo alto={150} saludando />
        <Globo texto="Welcome to my house!" alLado="izquierda" />
      </View>
      <ScrollView contentContainerStyle={estilos.juegos}>
        {JUEGOS.map((j) => (
          <Pressable
            key={j.tema}
            accessibilityLabel={j.nombre}
            style={[estilos.puerta, { backgroundColor: j.color }, entrando === j.tema && estilos.apretada]}
            onPress={() => void entrar(j)}
          >
            <Text style={estilos.emoji}>{j.emoji}</Text>
            <Text style={estilos.nombre}>{j.nombre}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  juegos: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 18, paddingTop: 12, paddingBottom: 24, maxWidth: 900 },
  puerta: { width: 160, height: 160, borderTopLeftRadius: 80, borderTopRightRadius: 80, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 6, borderColor: "#fff" },
  apretada: { transform: [{ scale: 0.94 }], borderColor: "#FFD54F" },
  emoji: { fontSize: 64 },
  nombre: { fontSize: 22, textAlign: "center", fontWeight: "900", color: "#fff" },
});
