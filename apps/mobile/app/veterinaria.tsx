import { rondaVeterinaria } from "@escuelita/core";
import { Redirect } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../components/Pantalla";
import { Pregunta } from "../components/Pregunta";
import { DESBLOQUEOS, useJuego } from "../lib/juego";

/** Veterinaria del Dr. Lucas (se abre con estrellas): cada paciente necesita un cuidado distinto. */
export default function Veterinaria() {
  const { estrellas, cargado, perfil } = useJuego();
  if (cargado && perfil && estrellas < DESBLOQUEOS.veterinaria) return <Redirect href="/" />;
  return (
    <Pantalla color="#E0F2F1">
      <Pregunta
        generar={(n) => rondaVeterinaria(n)}
        estimulo={(r) => (
          <View style={estilos.consulta}>
            <View style={estilos.doctor}>
              <Text style={estilos.doctorEmoji}>🧑‍⚕️</Text>
              <Text style={estilos.nombre}>Dr. Lucas</Text>
            </View>
            <View style={estilos.camilla}>
              <Text style={estilos.paciente}>{r.paciente.emoji}</Text>
              <Text style={estilos.triste}>🥺</Text>
            </View>
          </View>
        )}
        opcion={(c) => <Text style={estilos.cuidado}>{c.emoji}</Text>}
        alAcertar={(r) => `¡Muy bien! ${r.paciente.gracias}`}
      />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  consulta: { flexDirection: "row", alignItems: "flex-end", gap: 30 },
  doctor: { alignItems: "center" },
  doctorEmoji: { fontSize: 90 },
  nombre: { fontWeight: "900", color: "#00695C", fontSize: 16 },
  camilla: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 30, paddingVertical: 10, borderBottomWidth: 12, borderBottomColor: "#80CBC4", alignItems: "center" },
  paciente: { fontSize: 90 },
  triste: { position: "absolute", top: 4, right: 8, fontSize: 28 },
  cuidado: { fontSize: 60 },
});
