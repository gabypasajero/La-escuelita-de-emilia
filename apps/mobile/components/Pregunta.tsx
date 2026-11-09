import { ESTADO_INICIAL, registrarRespuesta, type Nivel, type Ronda } from "@escuelita/core";
import { useEffect, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORES, TOQUE_MINIMO } from "../lib/tema";
import { useJuego } from "../lib/juego";
import { hablar, hablarYEsperar, type Idioma } from "../lib/voz";
import { TextoIconos } from "./Iconos";

type RondaCualquiera = Ronda<any>;
type Opcion<R extends RondaCualquiera> = R["opciones"][number];

interface Props<R extends RondaCualquiera> {
  /** Genera una ronda nueva según el nivel actual. */
  generar: (nivel: Nivel) => R;
  /** Dibuja el estímulo (p. ej. las manzanas a contar). */
  estimulo?: (ronda: R) => ReactNode;
  /** Dibuja una opción. */
  opcion: (valor: Opcion<R>) => ReactNode;
  /** Lo que se dice al acertar. */
  alAcertar?: (ronda: R) => string;
  /** Idioma en que se dicen la pregunta y la felicitación (los amigos de otros países hablan su idioma). */
  idioma?: Idioma;
  /** Lo que se dice al equivocarse (en el idioma de la actividad). */
  alFallar?: string;
  /** Ayuda de Emilia en español: muestra un botón "🤔 Ayuda". */
  ayuda?: (ronda: R) => string;
}

/**
 * Actividad genérica de opción múltiple con dificultad adaptativa.
 * El error nunca penaliza: Emilia anima y se puede volver a intentar.
 */
export function Pregunta<R extends RondaCualquiera>({ generar, estimulo, opcion, alAcertar, idioma = "es", alFallar = "¡Casi! Intenta otra vez", ayuda }: Props<R>) {
  const [dificultad, setDificultad] = useState(ESTADO_INICIAL);
  const [ronda, setRonda] = useState(() => generar(ESTADO_INICIAL.nivel));
  const [celebrando, setCelebrando] = useState(false);
  const { ganar } = useJuego();

  useEffect(() => void hablar(ronda.enunciado, idioma), [ronda, idioma]);

  function responder(valor: Opcion<R>) {
    if (celebrando) return;
    const acierto = valor === ronda.correcta;
    const siguiente = registrarRespuesta(dificultad, acierto);
    setDificultad(siguiente);
    if (!acierto) {
      void hablar(alFallar, idioma);
      return;
    }
    setCelebrando(true);
    ganar(1);
    // La ronda siguiente empieza solo cuando Emilia termina de felicitar.
    hablarYEsperar(alAcertar?.(ronda) ?? "¡Muy bien!", 400, idioma).then(() => {
      setCelebrando(false);
      setRonda(generar(siguiente.nivel));
    });
  }

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.cabecera}>
        <Pressable onPress={() => hablar(ronda.enunciado, idioma)} accessibilityLabel="Repetir pregunta">
          <TextoIconos estilo={estilos.enunciado} texto={`🔊 ${ronda.enunciado}`} />
        </Pressable>
        {ayuda && (
          <Pressable onPress={() => hablar(ayuda(ronda))} accessibilityLabel="Ayuda de Emilia" style={estilos.ayuda}>
            <TextoIconos estilo={estilos.ayudaTexto} texto={`🤔 Ayuda`} />
          </Pressable>
        )}
      </View>
      {estimulo?.(ronda)}
      <View style={estilos.opciones}>
        {ronda.opciones.map((valor, i) => (
          <Pressable
            key={i}
            onPress={() => responder(valor)}
            style={[estilos.opcion, celebrando && valor === ronda.correcta && estilos.correcta]}
          >
            {opcion(valor)}
          </Pressable>
        ))}
      </View>
      {celebrando && <TextoIconos estilo={estilos.celebracion} texto={`⭐🎉⭐`} />}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, width: "100%", alignItems: "center", gap: 24 },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" },
  ayuda: { backgroundColor: "#FFF3E0", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 2, borderColor: "#FFB74D" },
  ayudaTexto: { fontSize: 18, fontWeight: "800", color: "#E65100" },
  enunciado: { fontSize: 28, fontWeight: "700", color: COLORES.texto, textAlign: "center" },
  opciones: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 20 },
  opcion: {
    minWidth: TOQUE_MINIMO * 1.5,
    minHeight: TOQUE_MINIMO * 1.5,
    padding: 12,
    borderRadius: 24,
    backgroundColor: COLORES.suave,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  correcta: { backgroundColor: COLORES.acierto },
  celebracion: { fontSize: 56 },
});
