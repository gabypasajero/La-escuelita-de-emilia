import { ESTADO_INICIAL, registrarRespuesta, type Nivel, type Ronda } from "@escuelita/core";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { COLORES, TOQUE_MINIMO } from "../lib/tema";
import { useJuego } from "../lib/juego";
import { hablar, hablarYEsperar, type Idioma } from "../lib/voz";
import { sonido } from "../lib/sonidos";
import { Icono, TextoIconos } from "./Iconos";

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

const META = 5;

type EstadoOpcion = "normal" | "fallada" | "correcta" | "apagada";

/** Botón de respuesta: entra con un saltito, se hunde al tocarlo, tiembla si no era y brinca si era. */
function BotonOpcion({ orden, estado, pista, alTocar, children }: { orden: number; estado: EstadoOpcion; pista: boolean; alTocar: () => void; children: ReactNode }) {
  const entra = useRef(new Animated.Value(0)).current;
  const aprieta = useRef(new Animated.Value(1)).current;
  const tiembla = useRef(new Animated.Value(0)).current;
  const brinca = useRef(new Animated.Value(0)).current;
  const late = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entra, { toValue: 1, delay: orden * 90, friction: 7, tension: 80, useNativeDriver: true }).start();
  }, [entra, orden]);
  useEffect(() => {
    if (estado === "fallada") {
      Animated.sequence([-1, 1, -0.7, 0.7, -0.3, 0].map((v) => Animated.timing(tiembla, { toValue: v, duration: 70, useNativeDriver: true }))).start();
    } else if (estado === "correcta") {
      Animated.sequence([
        Animated.timing(brinca, { toValue: 1, duration: 220, easing: Easing.out(Easing.back(3)), useNativeDriver: true }),
        Animated.timing(brinca, { toValue: 0.55, duration: 260, useNativeDriver: true }),
      ]).start();
    } else brinca.setValue(0);
  }, [estado, tiembla, brinca]);
  useEffect(() => {
    if (!pista || estado !== "normal") { late.setValue(0); return; }
    const ciclo = Animated.loop(Animated.sequence([
      Animated.timing(late, { toValue: 1, duration: 520, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(late, { toValue: 0, duration: 520, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    ciclo.start();
    return () => ciclo.stop();
  }, [pista, estado, late]);

  const hundir = (v: number) => Animated.spring(aprieta, { toValue: v, friction: 5, tension: 220, useNativeDriver: true }).start();
  return (
    <Animated.View
      style={{
        opacity: estado === "fallada" || estado === "apagada" ? 0.45 : entra.interpolate({ inputRange: [0, 0.4], outputRange: [0, 1], extrapolate: "clamp" }),
        transform: [
          { translateX: tiembla.interpolate({ inputRange: [-1, 1], outputRange: [-12, 12] }) },
          { translateY: brinca.interpolate({ inputRange: [0, 1], outputRange: [0, -22] }) },
          { scale: Animated.multiply(Animated.multiply(entra, aprieta), Animated.add(1, Animated.add(Animated.multiply(brinca, 0.22), Animated.multiply(late, 0.09)))) },
        ],
      }}
    >
      <Pressable
        onPressIn={() => hundir(0.9)}
        onPressOut={() => hundir(1)}
        onPress={alTocar}
        disabled={estado === "fallada"}
        style={[estilos.opcion, estado === "correcta" && estilos.correcta, pista && estado === "normal" && estilos.pista]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/**
 * Actividad genérica de opción múltiple con dificultad adaptativa.
 * El error nunca penaliza: Emilia anima y se puede volver a intentar.
 */
export function Pregunta<R extends RondaCualquiera>({ generar, estimulo, opcion, alAcertar, idioma = "es", alFallar = "¡Casi! Intenta otra vez", ayuda }: Props<R>) {
  const [dificultad, setDificultad] = useState(ESTADO_INICIAL);
  const [ronda, setRonda] = useState(() => generar(ESTADO_INICIAL.nivel));
  const [celebrando, setCelebrando] = useState(false);
  const [numero, setNumero] = useState(0);
  const [falladas, setFalladas] = useState<number[]>([]);
  const [logradas, setLogradas] = useState(0);
  const { ganar } = useJuego();

  useEffect(() => {
    void hablar(ronda.enunciado, idioma);
    // Si el niño se queda pensando, se le repite la pregunta (todavía no lee).
    const repetir = setInterval(() => void hablar(ronda.enunciado, idioma), 14000);
    return () => clearInterval(repetir);
  }, [ronda, idioma]);

  function responder(valor: Opcion<R>, i: number) {
    if (celebrando) return;
    const acierto = valor === ronda.correcta;
    const siguiente = registrarRespuesta(dificultad, acierto);
    setDificultad(siguiente);
    if (!acierto) {
      sonido.casi();
      setFalladas((f) => [...f, i]);
      void hablar(alFallar, idioma);
      return;
    }
    const total = logradas + 1, meta = total >= META;
    setCelebrando(true);
    setLogradas(total);
    ganar(meta ? 2 : 1);
    // La ronda siguiente empieza solo cuando Emilia termina de felicitar.
    const frase = (alAcertar?.(ronda) ?? "¡Muy bien!") + (meta && idioma === "es" ? " ¡Completaste todas las estrellas!" : "");
    hablarYEsperar(frase, meta ? 900 : 400, idioma).then(() => {
      setCelebrando(false);
      setFalladas([]);
      if (meta) setLogradas(0);
      setNumero((n) => n + 1);
      setRonda(generar(siguiente.nivel));
    });
  }
  // Después de dos intentos, la respuesta correcta late suavecito para ayudar.
  const pista = falladas.length >= 2;

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
          <BotonOpcion
            key={`${numero}-${i}`}
            orden={i}
            pista={pista && valor === ronda.correcta}
            estado={celebrando ? (valor === ronda.correcta ? "correcta" : "apagada") : falladas.includes(i) ? "fallada" : "normal"}
            alTocar={() => { sonido.toque(); responder(valor, i); }}
          >
            {opcion(valor)}
          </BotonOpcion>
        ))}
      </View>
      <View style={estilos.estrellas} accessibilityLabel={`${logradas} de ${META} estrellas`}>
        {Array.from({ length: META }, (_, i) => (
          <View key={i} style={[estilos.estrella, i >= logradas && estilos.estrellaVacia]}>
            <Icono e="⭐" tam={34} sinSombra />
          </View>
        ))}
      </View>
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
    borderWidth: 4,
    borderColor: "#FFFFFF",
    boxShadow: "0 7px 0 rgba(59,47,92,0.22)",
  },
  correcta: { backgroundColor: COLORES.acierto, borderColor: "#FFD54F" },
  pista: { borderColor: "#FFD54F" },
  estrellas: { flexDirection: "row", gap: 6, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 24, paddingHorizontal: 14, paddingVertical: 6 },
  estrella: { width: 34, height: 34 },
  estrellaVacia: { opacity: 0.22 },
});
