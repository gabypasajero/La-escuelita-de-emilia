import { rondaSaludable } from "@escuelita/core";
import { StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../../components/Pantalla";
import { Pregunta } from "../../components/Pregunta";

/** Mesa de la abuela Nina: elegir lo que le hace mejor al cuerpo (sin culpas: los dulces son "de vez en cuando"). */
export default function Plato() {
  return (
    <Pantalla color="#FFF9C4">
      <Pregunta
        generar={(n) => rondaSaludable(n)}
        estimulo={() => (
          <View style={estilos.abuela}>
            <Text style={estilos.abuelaEmoji}>👵</Text>
            <Text style={estilos.plato}>🍽️</Text>
          </View>
        )}
        opcion={(a) => <Text style={estilos.alimento}>{a.emoji}</Text>}
        alAcertar={(r) => `¡Muy bien, mi tesoro! ${r.correcta.nombre[0]!.toUpperCase()}${r.correcta.nombre.slice(1)} le da energía a tu cuerpo. Los dulces son solo de vez en cuando.`}
      />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  abuela: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  abuelaEmoji: { fontSize: 90 },
  plato: { fontSize: 70 },
  alimento: { fontSize: 70 },
});
