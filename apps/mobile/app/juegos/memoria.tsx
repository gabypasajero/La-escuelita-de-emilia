import { ESTADO_INICIAL, registrarRespuesta, tableroMemoria, type CartaMemoria } from "@escuelita/core";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../../components/Pantalla";
import { COLORES } from "../../lib/tema";
import { hablar } from "../../lib/voz";

/** Memoria (parejas). Al completar un tablero, el siguiente se adapta al nivel. */
export default function Juegos() {
  const [dificultad, setDificultad] = useState(ESTADO_INICIAL);
  const [cartas, setCartas] = useState<CartaMemoria[]>(() => tableroMemoria(ESTADO_INICIAL.nivel));
  const [abiertas, setAbiertas] = useState<number[]>([]);
  const [encontradas, setEncontradas] = useState<Set<string>>(new Set());

  function tocar(carta: CartaMemoria) {
    if (abiertas.length === 2 || abiertas.includes(carta.id) || encontradas.has(carta.valor)) return;
    const nuevas = [...abiertas, carta.id];
    setAbiertas(nuevas);
    if (nuevas.length < 2) return;

    const [a, b] = nuevas.map((id) => cartas.find((c) => c.id === id)!);
    const pareja = a!.valor === b!.valor;
    const siguiente = registrarRespuesta(dificultad, pareja);
    setDificultad(siguiente);

    setTimeout(() => {
      setAbiertas([]);
      if (!pareja) return;
      const total = new Set(encontradas).add(a!.valor);
      setEncontradas(total);
      if (total.size * 2 === cartas.length) {
        hablar("¡Ganaste! ¡Encontraste todas las parejas!");
        setTimeout(() => {
          setCartas(tableroMemoria(siguiente.nivel));
          setEncontradas(new Set());
        }, 2000);
      } else {
        hablar("¡Pareja!");
      }
    }, 800);
  }

  return (
    <Pantalla color={COLORES.juegos}>
      <Text style={estilos.titulo}>Memoria</Text>
      <View style={estilos.tablero}>
        {cartas.map((c) => {
          const visible = abiertas.includes(c.id) || encontradas.has(c.valor);
          return (
            <Pressable key={c.id} onPress={() => tocar(c)} style={[estilos.carta, visible && estilos.abierta]}>
              <Text style={estilos.emoji}>{visible ? c.valor : "❓"}</Text>
            </Pressable>
          );
        })}
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 32, fontWeight: "800", color: "#fff", marginBottom: 16 },
  tablero: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 14, maxWidth: 560 },
  carta: { width: 110, height: 110, borderRadius: 20, backgroundColor: "#7B1FA2", alignItems: "center", justifyContent: "center" },
  abierta: { backgroundColor: "#fff" },
  emoji: { fontSize: 56 },
});
