import { GLIFOS, avanzarTrazo, puntosDeControl, type Punto } from "@escuelita/core";
import { useMemo, useRef, useState } from "react";
import { Animated, Easing, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Polyline, Text as SvgText } from "react-native-svg";
import { hablar } from "../lib/voz";

// Caja de los trazos: x de -10 a 110, y de -25 a 150 (deja espacio a la tilde de la Ñ).
const VB = { x: -10, y: -25, w: 120, h: 175 };
const COLORES_TINTA = ["#E53935", "#1E88E5", "#43A047", "#8E24AA"];
const aTexto = (p: Punto[]) => p.map(([x, y]) => `${x},${y}`).join(" ");

interface Props {
  caracter: string;
  alto: number;
  alCompletar: () => void;
}

/**
 * Escribir con el dedo sobre una guía: el niño sigue los puntitos desde el
 * punto verde, trazo por trazo. Es tolerante (puede saltarse un punto y
 * levantar el dedo sin perder lo avanzado). "Mírame" muestra cómo se escribe.
 */
export function Trazado({ caracter, alto, alCompletar }: Props) {
  const trazos = GLIFOS[caracter] ?? [];
  const controles = useMemo(() => trazos.map((t) => puntosDeControl(t)), [trazos]);
  const ancho = (alto * VB.w) / VB.h;
  const [actual, setActual] = useState(0);
  const [logrados, setLogrados] = useState(0);
  const [tinta, setTinta] = useState<Punto[][]>([]);
  const estado = useRef({ actual: 0, logrados: 0, ultimoAviso: 0, terminado: false });
  const demo = useRef(new Animated.Value(0)).current;
  const [mostrandoDemo, setMostrandoDemo] = useState(false);

  // Posición en pantalla de la hoja: el dedo se mide desde ahí (locationX cambia según el elemento tocado).
  const hojaRef = useRef<View>(null);
  const origen = useRef({ x: 0, y: 0 });
  const medir = () => hojaRef.current?.measureInWindow((x, y) => { origen.current = { x, y }; });
  const aGlifo = (pageX: number, pageY: number): Punto => [
    ((pageX - origen.current.x) / ancho) * VB.w + VB.x,
    ((pageY - origen.current.y) / alto) * VB.h + VB.y,
  ];

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          medir();
          const p = aGlifo(e.nativeEvent.pageX, e.nativeEvent.pageY);
          setTinta((t) => [...t, [p]]);
          const s = estado.current;
          const siguiente = controles[s.actual]?.[s.logrados];
          if (siguiente && Math.hypot(siguiente[0] - p[0], siguiente[1] - p[1]) > 34 && Date.now() - s.ultimoAviso > 4000) {
            s.ultimoAviso = Date.now();
            void hablar(s.logrados === 0 ? "Empieza en el punto verde." : "Sigue por los puntitos.");
          }
          mover(p);
        },
        onPanResponderMove: (e) => {
          const p = aGlifo(e.nativeEvent.pageX, e.nativeEvent.pageY);
          setTinta((t) => (t.length ? [...t.slice(0, -1), [...t.at(-1)!, p]] : [[p]]));
          mover(p);
        },
        onPanResponderRelease: () => {},
        onPanResponderTerminate: () => {},
      }),
    [controles, ancho, alto],
  );

  function mover(p: Punto) {
    const s = estado.current;
    if (s.terminado) return;
    const control = controles[s.actual];
    if (!control) return;
    const n = avanzarTrazo(control, s.logrados, p);
    if (n === s.logrados) return;
    s.logrados = n;
    setLogrados(n);
    if (n < control.length) return;
    // Trazo completo: pasa al siguiente o termina.
    if (s.actual + 1 < controles.length) {
      s.actual += 1;
      s.logrados = 0;
      setActual(s.actual);
      setLogrados(0);
      void hablar(`¡Muy bien! Ahora el trazo ${s.actual + 1}.`);
    } else {
      s.terminado = true;
      setActual(controles.length);
      alCompletar();
    }
  }

  function reiniciar() {
    estado.current = { actual: 0, logrados: 0, ultimoAviso: 0, terminado: false };
    setActual(0);
    setLogrados(0);
    setTinta([]);
  }

  // Demostración: un lápiz recorre los trazos en orden.
  const recorrido = controles.flat();
  const entrada = recorrido.map((_, i) => i);
  const aPx = (v: number, eje: "x" | "y") => (eje === "x" ? ((v - VB.x) / VB.w) * ancho : ((v - VB.y) / VB.h) * alto);
  function mirame() {
    if (recorrido.length < 2 || mostrandoDemo) return;
    setMostrandoDemo(true);
    void hablar("Mira cómo se escribe.");
    demo.setValue(0);
    Animated.timing(demo, { toValue: recorrido.length - 1, duration: recorrido.length * 140, easing: Easing.linear, useNativeDriver: false }).start(() => setMostrandoDemo(false));
  }

  return (
    <View style={estilos.contenedor}>
      <View style={[estilos.hoja, { width: ancho, height: alto }]} ref={hojaRef} onLayout={medir}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={ancho} height={alto} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}>
            {/* Renglones como en un cuaderno */}
            {[10, 70, 130].map((y) => <Path key={y} d={`M-8 ${y} H108`} stroke={y === 70 ? "#BBDEFB" : "#90CAF9"} strokeWidth="0.8" strokeDasharray={y === 70 ? "3 3" : undefined} />)}
            {/* Guía gris de cada trazo */}
            {trazos.map((t, i) => (
              <Polyline key={`g${i}`} points={aTexto(t)} fill="none" stroke={i < actual ? "#A5D6A7" : "#ECEFF1"} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {/* Puntitos del trazo actual */}
            {controles[actual]?.map(([x, y], i) => (
              <Circle key={`p${i}`} cx={x} cy={y} r={i < logrados ? 3.2 : 2.2} fill={i < logrados ? "#43A047" : "#90A4AE"} />
            ))}
            {/* Puntos de inicio numerados */}
            {trazos.map((t, i) =>
              i >= actual ? (
                <Circle key={`i${i}`} cx={t[0]![0]} cy={t[0]![1]} r={i === actual ? 6.5 : 4.5} fill={i === actual ? "#43A047" : "#B0BEC5"} />
              ) : null,
            )}
            {trazos.map((t, i) =>
              i >= actual ? (
                <SvgText key={`n${i}`} x={t[0]![0]} y={t[0]![1] + 2.8} fontSize="7" fontWeight="bold" fill="#fff" textAnchor="middle">{i + 1}</SvgText>
              ) : null,
            )}
            {/* Lo que dibuja el niño */}
            {tinta.map((t, i) => (
              <Polyline key={`t${i}`} points={aTexto(t)} fill="none" stroke={COLORES_TINTA[i % COLORES_TINTA.length]} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            ))}
          </Svg>
        </View>
        {mostrandoDemo && recorrido.length > 1 && (
          <Animated.Text
            pointerEvents="none"
            style={[estilos.lapiz, {
              transform: [
                { translateX: demo.interpolate({ inputRange: entrada, outputRange: recorrido.map(([x]) => aPx(x, "x") - 6) }) },
                { translateY: demo.interpolate({ inputRange: entrada, outputRange: recorrido.map(([, y]) => aPx(y, "y") - 34) }) },
              ],
            }]}
          >
            ✏️
          </Animated.Text>
        )}
        {/* Capa transparente que recibe el dedo: el dibujo de abajo cambia y no debe cortar el gesto. */}
        <View style={StyleSheet.absoluteFill} accessibilityLabel="Hoja para escribir" {...responder.panHandlers} />
      </View>
      <View style={estilos.botones}>
        <Pressable style={estilos.boton} onPress={mirame} accessibilityLabel="Mírame">
          <Text style={estilos.botonTexto}>👀 Mírame</Text>
        </Pressable>
        <Pressable style={estilos.boton} onPress={reiniciar} accessibilityLabel="Borrar y empezar">
          <Text style={estilos.botonTexto}>🧽 Otra vez</Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { alignItems: "center", gap: 10 },
  hoja: { backgroundColor: "#fff", borderRadius: 24, borderWidth: 4, borderColor: "#BBDEFB", overflow: "hidden" },
  lapiz: { position: "absolute", left: 0, top: 0, fontSize: 34 },
  botones: { flexDirection: "row", gap: 12 },
  boton: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  botonTexto: { fontSize: 18, fontWeight: "800", color: "#3B2F5C" },
});
