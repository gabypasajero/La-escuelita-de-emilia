import { rondaSaludable } from "@escuelita/core";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../../components/Pantalla";
import { Adulto } from "../../components/Personas";
import { Pregunta } from "../../components/Pregunta";
import { Icono } from "../../components/Iconos";

/** Mesa de la abuela Nina: elegir lo que le hace mejor al cuerpo (sin culpas: los dulces son "de vez en cuando"). */
export default function Plato() {
  return (
    <Pantalla color="#FFF9C4" fondo="cocina">
      <Pregunta
        generar={(n) => rondaSaludable(n)}
        estimulo={(r) => (
          <View style={estilos.abuela}>
            <Nina clave={r} />
            <Text style={estilos.plato}>🍽️</Text>
          </View>
        )}
        opcion={(a) => <Icono e={a.emoji} tam={84} />}
        alAcertar={(r) => `¡Muy bien, mi tesoro! ${r.correcta.nombre[0]!.toUpperCase()}${r.correcta.nombre.slice(1)} le da energía a tu cuerpo. Los dulces son solo de vez en cuando.`}
      />
    </Pantalla>
  );
}

/** La abuela habla (boca y manos) mientras se dice la pregunta. */
function Nina({ clave }: { clave: unknown }) {
  const [hablando, setHablando] = useState(true);
  useEffect(() => {
    setHablando(true);
    const t = setTimeout(() => setHablando(false), 3000);
    return () => clearTimeout(t);
  }, [clave]);
  return <Adulto id="nina" alto={170} hablando={hablando} />;
}

const estilos = StyleSheet.create({
  abuela: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  plato: { fontSize: 70 },
  alimento: { fontSize: 70 },
});
