import { ESTADO_INICIAL, registrarRespuesta, type Nivel, type Ronda } from "@escuelita/core";
import { useEffect, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORES, TOQUE_MINIMO } from "../lib/tema";
import { hablar } from "../lib/voz";

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
}

/**
 * Actividad genérica de opción múltiple con dificultad adaptativa.
 * El error nunca penaliza: Emilia anima y se puede volver a intentar.
 */
export function Pregunta<R extends RondaCualquiera>({ generar, estimulo, opcion, alAcertar }: Props<R>) {
  const [dificultad, setDificultad] = useState(ESTADO_INICIAL);
  const [ronda, setRonda] = useState(() => generar(ESTADO_INICIAL.nivel));
  const [celebrando, setCelebrando] = useState(false);

  useEffect(() => hablar(ronda.enunciado), [ronda]);

  function responder(valor: Opcion<R>) {
    if (celebrando) return;
    const acierto = valor === ronda.correcta;
    const siguiente = registrarRespuesta(dificultad, acierto);
    setDificultad(siguiente);
    if (!acierto) {
      hablar("¡Casi! Intenta otra vez");
      return;
    }
    setCelebrando(true);
    hablar(alAcertar?.(ronda) ?? "¡Muy bien!");
    setTimeout(() => {
      setCelebrando(false);
      setRonda(generar(siguiente.nivel));
    }, 1600);
  }

  return (
    <View style={estilos.contenedor}>
      <Pressable onPress={() => hablar(ronda.enunciado)} accessibilityLabel="Repetir pregunta">
        <Text style={estilos.enunciado}>🔊 {ronda.enunciado}</Text>
      </Pressable>
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
      {celebrando && <Text style={estilos.celebracion}>⭐🎉⭐</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, width: "100%", alignItems: "center", gap: 24 },
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
