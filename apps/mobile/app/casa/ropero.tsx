import { rondaRopa } from "@escuelita/core";
import { StyleSheet, Text } from "react-native";
import { Pantalla } from "../../components/Pantalla";
import { Pregunta } from "../../components/Pregunta";
import { Icono } from "../../components/Iconos";

/** Ropero: "¿Qué me pongo?" según el clima. */
export default function Ropero() {
  return (
    <Pantalla color="#E1F5FE" fondo="pieza">
      <Pregunta
        generar={(n) => rondaRopa(n)}
        estimulo={(r) => <Icono e={r.clima.emoji} tam={130} />}
        opcion={(p) => <Icono e={p.emoji} tam={84} />}
        alAcertar={(r) => `¡Sí! ${r.clima.porque}`}
      />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({ clima: { fontSize: 110 }, prenda: { fontSize: 70 } });
