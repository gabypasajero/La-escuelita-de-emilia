import { RUTINA_DIENTES, RUTINA_MANOS, duracionTotal, pasoEn } from "@escuelita/core";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../../components/Pantalla";
import { EmiliaDibujo, Globo } from "../../components/Personajes";
import { useJuego } from "../../lib/juego";
import { hablar } from "../../lib/voz";

/**
 * Modo acompañante: Emilia guía la rutina real (manos o dientes) paso a paso,
 * con tiempo, mientras el niño lo hace de verdad en el baño.
 */
export default function Rutina() {
  const { r } = useLocalSearchParams<{ r?: string }>();
  const rutina = r === "dientes" ? RUTINA_DIENTES : RUTINA_MANOS;
  const total = duracionTotal(rutina);
  const [segundos, setSegundos] = useState<number | null>(null);
  const ultimoPaso = useRef<number | null>(-1);

  const paso = segundos === null ? null : pasoEn(rutina, segundos);
  const terminado = segundos !== null && paso === null;
  const { ganar } = useJuego();
  // Terminar una rutina real (manos o dientes) da 3 monedas.
  useEffect(() => {
    if (terminado) ganar(3);
  }, [terminado, ganar]);

  useEffect(() => {
    hablar(rutina.id === "manos" ? "Ve al baño con un adulto. ¿Listos? ¡Toca empezar!" : "Toma tu cepillo con un poquito de pasta. ¡Toca empezar!");
  }, [rutina.id]);

  useEffect(() => {
    if (segundos === null || terminado) return;
    const t = setTimeout(() => setSegundos((s) => (s ?? 0) + 1), 1000);
    return () => clearTimeout(t);
  }, [segundos, terminado]);

  useEffect(() => {
    if (paso === ultimoPaso.current || segundos === null) return;
    ultimoPaso.current = paso;
    hablar(paso === null ? rutina.cierre : rutina.pasos[paso]!.frase);
  }, [paso, segundos, rutina]);

  const actual = paso === null ? null : rutina.pasos[paso]!;
  const restante = segundos === null ? total : Math.max(0, total - segundos);

  return (
    <Pantalla color={rutina.id === "manos" ? "#B3E5FC" : "#C8E6C9"}>
      <Text style={estilos.titulo}>{rutina.titulo}</Text>
      <View style={estilos.fila}>
        <EmiliaDibujo alto={150} />
        <Globo texto={terminado ? rutina.cierre : actual ? actual.frase : "¡Toca empezar!"} alLado="izquierda" />
      </View>

      {segundos === null ? (
        <Pressable style={estilos.boton} onPress={() => setSegundos(0)} accessibilityLabel="Empezar">
          <Text style={estilos.botonTexto}>▶️ ¡Empezar!</Text>
        </Pressable>
      ) : terminado ? (
        <View style={estilos.centro}>
          <Text style={estilos.estrellas}>⭐🎉⭐</Text>
          <Pressable style={estilos.boton} onPress={() => { ultimoPaso.current = -1; setSegundos(null); }} accessibilityLabel="Otra vez">
            <Text style={estilos.botonTexto}>🔁 Otra vez</Text>
          </Pressable>
        </View>
      ) : (
        <View style={estilos.centro}>
          <Text style={estilos.pasoEmoji}>{actual?.emoji}</Text>
          <Text style={estilos.tiempo}>{restante}</Text>
        </View>
      )}

      <View style={estilos.pasos}>
        {rutina.pasos.map((p, i) => (
          <View key={i} style={[estilos.burbuja, (paso !== null && i < paso) || terminado ? estilos.hecha : null, i === paso && estilos.ahora]}>
            <Text style={estilos.burbujaEmoji}>{p.emoji}</Text>
          </View>
        ))}
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 30, fontWeight: "800", color: "#3B2F5C" },
  fila: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 8 },
  centro: { alignItems: "center" },
  pasoEmoji: { fontSize: 110 },
  tiempo: { fontSize: 40, fontWeight: "800", color: "#3B2F5C" },
  estrellas: { fontSize: 64 },
  boton: { backgroundColor: "#3B2F5C", borderRadius: 30, paddingHorizontal: 36, paddingVertical: 18, marginTop: 12 },
  botonTexto: { color: "#fff", fontSize: 26, fontWeight: "800" },
  pasos: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 16 },
  burbuja: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.6)", alignItems: "center", justifyContent: "center" },
  hecha: { backgroundColor: "#A5D6A7" },
  ahora: { backgroundColor: "#fff", borderWidth: 4, borderColor: "#3B2F5C" },
  burbujaEmoji: { fontSize: 28 },
});
