import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../../components/Pantalla";
import { COLORES } from "../../lib/tema";
import { hablar } from "../../lib/voz";

const JUEGOS: Array<{ ruta: Href; nombre: string; emoji: string }> = [
  { ruta: "/juegos/tiendita", nombre: "La Tiendita", emoji: "🛒" },
  { ruta: "/juegos/memoria", nombre: "Memoria", emoji: "🃏" },
];

export default function MenuJuegos() {
  return (
    <Pantalla color={COLORES.juegos}>
      <View style={estilos.lista}>
        {JUEGOS.map((j) => (
          <Pressable
            key={j.nombre}
            style={estilos.tarjeta}
            accessibilityLabel={j.nombre}
            onPress={() => {
              hablar(j.nombre);
              router.push(j.ruta);
            }}
          >
            <Text style={estilos.emoji}>{j.emoji}</Text>
            <Text style={estilos.nombre}>{j.nombre}</Text>
          </Pressable>
        ))}
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  lista: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 24, marginTop: 40 },
  tarjeta: { width: 200, height: 200, borderRadius: 32, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 4 },
  emoji: { fontSize: 88 },
  nombre: { fontSize: 22, fontWeight: "800", color: COLORES.texto },
});
