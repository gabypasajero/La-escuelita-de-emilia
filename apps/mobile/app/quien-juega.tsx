import { router } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "../components/Avatar";
import { EmiliaDibujo, Globo, TitoDibujo } from "../components/Personajes";
import { ACCESORIOS, useJuego } from "../lib/juego";
import { hablar } from "../lib/voz";

/** Al abrir el juego: cada niño toca su personaje para entrar con sus monedas y sus cosas. */
export default function QuienJuega() {
  const { jugadores, elegirJugador } = useJuego();

  useEffect(() => void hablar(jugadores.length ? "¡Hola! ¿Quién juega hoy? Toca tu personaje." : "¡Hola! Soy Emilia. ¡Vamos a crear tu personaje!"), [jugadores.length]);

  return (
    <SafeAreaView style={estilos.fondo}>
      <View style={estilos.cabecera}>
        <EmiliaDibujo alto={130} />
        <TitoDibujo alto={60} />
        <Globo texto="¿Quién juega hoy?" alLado="izquierda" />
      </View>
      <View style={estilos.lista}>
        {jugadores.map((j) => (
          <Pressable
            key={j.id}
            style={estilos.tarjeta}
            accessibilityLabel={j.perfil.nombre}
            onPress={() => {
              elegirJugador(j.id);
              void hablar(`¡Hola, ${j.perfil.nombre}!`);
              if (router.canDismiss()) router.dismissAll();
              router.replace("/");
            }}
          >
            <Avatar
              apariencia={j.perfil.apariencia}
              alto={170}
              accesorios={Object.fromEntries(
                (["cabeza", "cara", "cuello", "mano"] as const).map((r) => [r, ACCESORIOS.find((a) => a.id === j.puestos[r])]),
              )}
            />
            <Text style={estilos.nombre}>{j.perfil.nombre}</Text>
            <Text style={estilos.monedas}>🪙 {j.monedas}</Text>
          </Pressable>
        ))}
        <Pressable
          style={[estilos.tarjeta, estilos.nuevo]}
          accessibilityLabel="Nuevo personaje"
          onPress={() => {
            elegirJugador(null);
            router.push("/personaje");
          }}
        >
          <Text style={estilos.mas}>➕</Text>
          <Text style={estilos.nombre}>Nuevo</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "#E1F5FE", alignItems: "center", justifyContent: "center", padding: 16 },
  cabecera: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 20 },
  lista: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 20 },
  tarjeta: { width: 190, minHeight: 260, borderRadius: 30, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", padding: 10, borderWidth: 5, borderColor: "#81D4FA" },
  nuevo: { borderStyle: "dashed" },
  nombre: { fontSize: 24, fontWeight: "900", color: "#3B2F5C" },
  monedas: { fontSize: 18, fontWeight: "800", color: "#F9A825" },
  mas: { fontSize: 70 },
});
