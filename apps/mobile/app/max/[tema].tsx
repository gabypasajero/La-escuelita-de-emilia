import { rondaIngles, type PalabraIngles, type TemaIngles } from "@escuelita/core";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../../components/Pantalla";
import { MaxDibujo } from "../../components/Personajes";
import { Pregunta } from "../../components/Pregunta";

const TEMAS: TemaIngles[] = ["saludos", "colores", "numeros", "animales", "cuerpo", "acciones"];
const FONDO: Record<TemaIngles, string> = { saludos: "#E0F2F1", colores: "#FCE4EC", numeros: "#E8F5E9", animales: "#EFEBE9", cuerpo: "#FFF3E0", acciones: "#E8EAF6" };

/** Juegos de "escucha y toca" con Max: él habla solo inglés; Emilia ayuda en español si se lo piden. */
export default function JuegoDeMax() {
  const { tema: t } = useLocalSearchParams<{ tema: string }>();
  const tema = (TEMAS as string[]).includes(t ?? "") ? (t as TemaIngles) : "colores";
  return (
    <Pantalla color={FONDO[tema]}>
      <View style={estilos.max}>
        <MaxDibujo alto={130} />
      </View>
      <Pregunta
        key={tema}
        idioma="en"
        alFallar="Oops! Try again!"
        generar={(n) => rondaIngles(tema, n)}
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
  max: { position: "absolute", left: 24, bottom: 16 },
  mancha: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: "#fff" },
  grupo: { flexDirection: "row", flexWrap: "wrap", width: 130, justifyContent: "center" },
  estrella: { fontSize: 36 },
  emoji: { fontSize: 76 },
});
