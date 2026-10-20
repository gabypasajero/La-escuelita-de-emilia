import { rondaContar } from "@escuelita/core";
import { StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../components/Pantalla";
import { Pregunta } from "../components/Pregunta";
import { COLORES } from "../lib/tema";

export default function Numeros() {
  return (
    <Pantalla color={COLORES.numeros}>
      <Pregunta
        generar={(nivel) => rondaContar(nivel)}
        estimulo={(r) => (
          <View style={estilos.objetos}>
            {Array.from({ length: r.cantidad }, (_, i) => (
              <Text key={i} style={estilos.objeto}>
                {r.objeto}
              </Text>
            ))}
          </View>
        )}
        opcion={(n) => <Text style={estilos.numero}>{n}</Text>}
        alAcertar={(r) => `¡Sí! Hay ${r.cantidad}`}
      />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  objetos: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, maxWidth: 520 },
  objeto: { fontSize: 64 },
  numero: { fontSize: 56, fontWeight: "800", color: COLORES.texto },
});
