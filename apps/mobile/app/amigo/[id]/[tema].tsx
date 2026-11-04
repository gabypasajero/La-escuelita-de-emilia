import { OTRA_VEZ, rondaAmigo, type PalabraIngles, type TemaIngles } from "@escuelita/core";
import { Redirect, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../../../components/Pantalla";
import { Pregunta } from "../../../components/Pregunta";
import { amigoPorId, TEMAS_AMIGO } from "../../../lib/amigos";

/** Juegos de "escucha y toca" con un amigo: habla solo su idioma; Emilia ayuda en español si se lo piden. */
export default function JuegoDeAmigo() {
  const { id, tema: t } = useLocalSearchParams<{ id: string; tema: string }>();
  const amigo = amigoPorId(id);
  const datos = TEMAS_AMIGO.find((x) => x.tema === t);
  if (!amigo) return <Redirect href="/paradero" />;
  const tema: TemaIngles = datos?.tema ?? "colores";
  const { Dibujo } = amigo;
  return (
    <Pantalla color={datos?.fondo ?? amigo.fondo}>
      <View style={estilos.amigo}>
        <Dibujo alto={130} />
      </View>
      <Pregunta
        key={`${amigo.id}-${tema}`}
        idioma={amigo.idioma}
        alFallar={OTRA_VEZ[amigo.idioma]}
        generar={(n) => rondaAmigo(amigo.idioma, tema, n)}
        alAcertar={(r) => r.felicitacion}
        ayuda={(r) => r.ayuda}
        opcion={(p) => <Opcion palabra={p} />}
      />
    </Pantalla>
  );
}

function Opcion({ palabra }: { palabra: PalabraIngles }) {
  if (palabra.tema === "colores") return <View style={[estilos.mancha, { backgroundColor: palabra.hex }]} />;
  if (palabra.tema === "numeros")
    return (
      <View style={estilos.grupo}>
        {Array.from({ length: palabra.valor ?? 1 }, (_, i) => <Text key={i} style={estilos.estrella}>⭐</Text>)}
      </View>
    );
  return <Text style={estilos.emoji}>{palabra.emoji}</Text>;
}

const estilos = StyleSheet.create({
  amigo: { position: "absolute", left: 24, bottom: 16 },
  mancha: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: "#fff" },
  grupo: { flexDirection: "row", flexWrap: "wrap", width: 130, justifyContent: "center" },
  estrella: { fontSize: 36 },
  emoji: { fontSize: 76 },
});
