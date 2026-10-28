import { rondaAnimalPorLetra } from "@escuelita/core";
import { Pressable, StyleSheet, Text } from "react-native";
import { Pantalla } from "../components/Pantalla";
import { Pregunta } from "../components/Pregunta";
import { COLORES } from "../lib/tema";
import { hablar } from "../lib/voz";

/** "¿Qué animal empieza con mmm?": se ve y se escucha la letra, y se elige el animal. */
export default function LetraAnimal() {
  return (
    <Pantalla color={COLORES.animales}>
      <Pregunta
        generar={(nivel) => rondaAnimalPorLetra(nivel)}
        estimulo={(r) => (
          <Pressable style={estilos.letra} onPress={() => void hablar(`${r.letra.nombre}. Suena ${r.letra.sonido}.`)} accessibilityLabel="Escuchar la letra">
            <Text style={estilos.letraTexto}>{r.letra.letra} {r.letra.letra.toLowerCase()}</Text>
            <Text style={estilos.sonido}>👂 {r.letra.sonido}</Text>
          </Pressable>
        )}
        opcion={(a) => <Text style={estilos.animal}>{a.emoji}</Text>}
        alAcertar={(r) => `¡Sí! ${r.correcta.nombre} empieza con ${r.letra.sonido}. ${r.correcta.sonido}`}
      />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  letra: { backgroundColor: "#fff", borderRadius: 30, paddingHorizontal: 30, paddingVertical: 8, alignItems: "center", borderWidth: 5, borderColor: "#FFB300" },
  letraTexto: { fontSize: 80, fontWeight: "900", color: COLORES.texto },
  sonido: { fontSize: 26, fontWeight: "800", color: COLORES.texto },
  animal: { fontSize: 72 },
});
