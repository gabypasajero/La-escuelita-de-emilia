import { NUMEROS, rondaSuma } from "@escuelita/core";
import { StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../components/Pantalla";
import { Pregunta } from "../components/Pregunta";
import { hablar } from "../lib/voz";

/** Sumas con objetos: "¿Cuánto es 2 más 1?". Los grupos se ven separados y se pueden juntar contando. */
export default function Sumas() {
  return (
    <Pantalla color="#FFCC80">
      <Pregunta
        generar={(nivel) => rondaSuma(nivel)}
        estimulo={(r) => (
          <View style={estilos.fila}>
            <Grupo objeto={r.objeto} n={r.a} />
            <Text style={estilos.signo}>+</Text>
            <Grupo objeto={r.objeto} n={r.b} />
            <Text style={estilos.signo}>=</Text>
            <Text style={estilos.pregunta} onPress={() => void hablar(`${NUMEROS[r.a]!.palabra} más ${NUMEROS[r.b]!.palabra}`)}>?</Text>
          </View>
        )}
        opcion={(n) => (
          <View style={estilos.opcion}>
            <Text style={estilos.numero}>{n}</Text>
            <View style={estilos.puntos}>{Array.from({ length: n }, (_, k) => <View key={k} style={estilos.punto} />)}</View>
          </View>
        )}
        alAcertar={(r) => `¡Sí! ${NUMEROS[r.a]!.palabra} más ${NUMEROS[r.b]!.palabra} son ${NUMEROS[r.correcta]!.palabra}.`}
      />
    </Pantalla>
  );
}

function Grupo({ objeto, n }: { objeto: string; n: number }) {
  return (
    <View style={estilos.grupo}>
      <View style={estilos.objetos}>{Array.from({ length: n }, (_, k) => <Text key={k} style={estilos.objeto}>{objeto}</Text>)}</View>
      <Text style={estilos.cuenta}>{n}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "center" },
  grupo: { backgroundColor: "#fff", borderRadius: 24, padding: 10, alignItems: "center", minWidth: 110 },
  objetos: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", maxWidth: 200 },
  objeto: { fontSize: 44 },
  cuenta: { fontSize: 30, fontWeight: "900", color: "#3B2F5C" },
  signo: { fontSize: 56, fontWeight: "900", color: "#3B2F5C" },
  pregunta: { fontSize: 64, fontWeight: "900", color: "#E53935" },
  opcion: { alignItems: "center" },
  numero: { fontSize: 52, fontWeight: "800", color: "#3B2F5C" },
  puntos: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 4, maxWidth: 90 },
  punto: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#E53935" },
});
