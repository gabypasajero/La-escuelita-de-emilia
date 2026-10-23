import { router, type Href } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../components/Pantalla";
import { EmiliaDibujo, Globo } from "../components/Personajes";
import { COLORES } from "../lib/tema";
import { hablar } from "../lib/voz";

const SALAS: Array<{ ruta: Href; nombre: string; emoji: string; color: string; frase: string }> = [
  { ruta: "/letras", nombre: "Letras", emoji: "🔤", color: "#29B6F6", frase: "¡Vamos a jugar con las letras!" },
  { ruta: "/numeros", nombre: "Números", emoji: "🔢", color: "#66BB6A", frase: "¡A contar!" },
];

export default function Escuelita() {
  useEffect(() => hablar("¡Llegamos a la escuelita! ¿Letras o números?"), []);
  return (
    <Pantalla color={COLORES.letras}>
      <View style={estilos.fila}>
        <EmiliaDibujo alto={150} />
        <Globo texto="¿Letras o números?" alLado="izquierda" />
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
  salas: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 28, marginTop: 16 },
  puerta: { width: 200, height: 240, borderTopLeftRadius: 100, borderTopRightRadius: 100, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 6, borderColor: "#fff" },
  emoji: { fontSize: 88 },
  nombre: { fontSize: 26, fontWeight: "800", color: "#fff" },
});
