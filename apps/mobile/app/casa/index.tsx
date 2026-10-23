import { router, type Href } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../../components/Pantalla";
import { EmiliaDibujo, Globo } from "../../components/Personajes";
import { hablar } from "../../lib/voz";

const PIEZAS: Array<{ ruta: Href; nombre: string; emoji: string; color: string; frase: string }> = [
  { ruta: "/casa/rutina?r=manos", nombre: "Lavarse las manos", emoji: "🧼", color: "#B3E5FC", frase: "¡Vamos a lavarnos las manos juntos!" },
  { ruta: "/casa/rutina?r=dientes", nombre: "Lavarse los dientes", emoji: "🪥", color: "#C8E6C9", frase: "¡A cepillarnos los dientes!" },
  { ruta: "/casa/patio", nombre: "El patio de Tito", emoji: "🌳", color: "#DCEDC8", frase: "¡Vamos al patio a jugar con Tito!" },
];

/** La casa amarilla de Emilia: el baño (rutinas reales) y el patio con Tito. */
export default function Casa() {
  useEffect(() => void hablar("¡Bienvenidos a mi casa! ¿Qué hacemos?"), []);
  return (
    <Pantalla color="#FFF59D">
      <View style={estilos.fila}>
        <EmiliaDibujo alto={140} />
        <Globo texto="¡Esta es mi casa! ¿Qué hacemos?" alLado="izquierda" />
      </View>
      <View style={estilos.piezas}>
        {PIEZAS.map((p) => (
          <Pressable
            key={p.nombre}
            accessibilityLabel={p.nombre}
            style={[estilos.pieza, { backgroundColor: p.color }]}
            onPress={() => {
              hablar(p.frase);
              router.push(p.ruta);
            }}
          >
            <Text style={estilos.emoji}>{p.emoji}</Text>
            <Text style={estilos.nombre}>{p.nombre}</Text>
          </Pressable>
        ))}
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  piezas: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 20, marginTop: 12 },
  pieza: { width: 190, height: 190, borderRadius: 28, alignItems: "center", justifyContent: "center", borderWidth: 5, borderColor: "#fff" },
  emoji: { fontSize: 76 },
  nombre: { fontSize: 18, fontWeight: "800", color: "#3B2F5C", textAlign: "center" },
});
