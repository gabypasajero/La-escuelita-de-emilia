import { rondaRopa } from "@escuelita/core";
import { StyleSheet, Text } from "react-native";
import { Pantalla } from "../../components/Pantalla";
import { Pregunta } from "../../components/Pregunta";

/** Ropero: "¿Qué me pongo?" según el clima. */
export default function Ropero() {
  return (
    <Pantalla color="#E1F5FE" fondo="pieza">
      <Pregunta
        generar={(n) => rondaRopa(n)}
        estimulo={(r) => <Text style={estilos.clima}>{r.clima.emoji}</Text>}
        opcion={(p) => <Text style={estilos.prenda}>{p.emoji}</Text>}
        alAcertar={(r) => `¡Sí! ${r.clima.porque}`}
      />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({ clima: { fontSize: 110 }, prenda: { fontSize: 70 } });
