import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORES } from "../lib/tema";
import { hablar } from "../lib/voz";

const MODULOS: Array<{ ruta: Href; nombre: string; emoji: string; color: string }> = [
  { ruta: "/pintar", nombre: "Pintar", emoji: "🎨", color: COLORES.pintar },
  { ruta: "/letras", nombre: "Letras", emoji: "🔤", color: COLORES.letras },
  { ruta: "/numeros", nombre: "Números", emoji: "🔢", color: COLORES.numeros },
  { ruta: "/animales", nombre: "Animales", emoji: "🦁", color: COLORES.animales },
  { ruta: "/juegos", nombre: "Juegos", emoji: "🧩", color: COLORES.juegos },
];

export default function Inicio() {
  return (
    <SafeAreaView style={estilos.fondo}>
      <Text style={estilos.titulo}>La Escuelita de Emilia</Text>
      <View style={estilos.burbujas}>
        {MODULOS.map((m) => (
          <Pressable
            key={m.nombre}
            style={[estilos.burbuja, { backgroundColor: m.color }]}
            accessibilityLabel={m.nombre}
            onPress={() => {
              hablar(m.nombre);
              router.push(m.ruta);
            }}
          >
            <Text style={estilos.emoji}>{m.emoji}</Text>
            <Text style={estilos.nombre}>{m.nombre}</Text>
          </Pressable>
        ))}
      </View>
      {/* Acceso de adultos: discreto y protegido por la puerta parental. */}
      <Pressable style={estilos.padres} accessibilityLabel="Zona de padres" onPress={() => router.push("/padres")}>
        <Text style={estilos.padresTexto}>👪 Padres</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORES.fondo, alignItems: "center", justifyContent: "center", padding: 16 },
  titulo: { fontSize: 32, fontWeight: "800", color: COLORES.texto, marginBottom: 24, textAlign: "center" },
  burbujas: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 20, maxWidth: 760 },
  burbuja: { width: 140, height: 140, borderRadius: 70, alignItems: "center", justifyContent: "center", elevation: 4 },
  emoji: { fontSize: 56 },
  nombre: { fontSize: 18, fontWeight: "700", color: COLORES.texto },
  padres: { position: "absolute", bottom: 16, right: 16, padding: 12 },
  padresTexto: { fontSize: 14, color: COLORES.texto, opacity: 0.6 },
});
