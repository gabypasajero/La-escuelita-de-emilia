import type { TemaIngles } from "@escuelita/core";
import { Redirect, router, useLocalSearchParams, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../../../components/Pantalla";
import { Globo } from "../../../components/Personajes";
import { amigoPorId, explicacion, TEMAS_AMIGO } from "../../../lib/amigos";
import { hablar, hablarYEsperar } from "../../../lib/voz";

/** Cada juego se explica en español solo la primera vez (por amigo). */
const explicados = new Set<string>();

/** La casa de un amigo de otro país, con sus 6 juegos en su idioma. */
export default function CasaDeAmigo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const amigo = amigoPorId(id);
  const [entrando, setEntrando] = useState<TemaIngles | null>(null);
  useEffect(() => {
    if (amigo) void hablar(amigo.bienvenida, amigo.idioma);
  }, [amigo]);
  if (!amigo) return <Redirect href="/paradero" />;

  const entrar = async (tema: TemaIngles) => {
    if (entrando) return;
    setEntrando(tema);
    const clave = `${amigo.id}:${tema}`;
    if (!explicados.has(clave)) {
      explicados.add(clave);
      await hablarYEsperar(explicacion(amigo, tema), 200);
    } else {
      await hablarYEsperar(amigo.juegos[tema].frase, 100, amigo.idioma);
    }
    setEntrando(null);
    router.push(`/amigo/${amigo.id}/${tema}` as Href);
  };

  const { Dibujo } = amigo;
  return (
    <Pantalla color={amigo.fondo}>
      <View style={estilos.fila}>
        <Dibujo alto={150} saludando />
        <Globo texto={amigo.globoCasa} alLado="izquierda" />
      </View>
      <ScrollView contentContainerStyle={estilos.juegos}>
        {TEMAS_AMIGO.map((t) => (
          <Pressable
            key={t.tema}
            accessibilityLabel={amigo.juegos[t.tema].nombre}
            style={[estilos.puerta, { backgroundColor: t.color }, entrando === t.tema && estilos.apretada]}
            onPress={() => void entrar(t.tema)}
          >
            <Text style={estilos.emoji}>{t.emoji}</Text>
            <Text style={estilos.nombre}>{amigo.juegos[t.tema].nombre}</Text>
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
