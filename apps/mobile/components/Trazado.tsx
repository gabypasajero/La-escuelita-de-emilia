import { GLIFOS, marcarPuntos, puntosDeControl, type Punto } from "@escuelita/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Polyline } from "react-native-svg";
import { useSuperficieDibujo } from "../lib/puntero";
import { sonido } from "../lib/sonidos";
import { hablar } from "../lib/voz";
import { TextoIconos } from "./Iconos";

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
 * Escribir con el dedo sobre una guía, con libertad: el niño pasa por los
 * puntitos empezando por donde quiera y yendo hacia donde quiera; puede
 * levantar el dedo cuantas veces necesite. Cuando pintó (casi) todos, la
 * letra queda lista. "Mírame" muestra una forma de escribirla.
 */
export function Trazado({ caracter, alto, alCompletar }: Props) {
  const trazos = GLIFOS[caracter] ?? [];
  const controles = useMemo(() => trazos.map((t) => puntosDeControl(t)), [trazos]);
  const ancho = (alto * VB.w) / VB.h;
  const total = useMemo(() => controles.reduce((n, c) => n + c.length, 0), [controles]);
  // Qué puntitos de cada trazo ya se pintaron (en cualquier orden).
  const hechos = useRef<boolean[][]>(controles.map((c) => c.map(() => false)));
  const [pintados, setPintados] = useState(0);
  const [tinta, setTinta] = useState<Punto[][]>([]);
  const estado = useRef({ pintados: 0, ultimoAviso: 0, terminado: false });
  const demo = useRef(new Animated.Value(0)).current;
  const [mostrandoDemo, setMostrandoDemo] = useState(false);

  // Acepta dedo, mouse y lápiz óptico (ver lib/puntero.ts).
  const aGlifo = (x: number, y: number): Punto => [(x / ancho) * VB.w + VB.x, (y / alto) * VB.h + VB.y];
  const { ref: capaRef, props: capaProps, estilo: capaEstilo } = useSuperficieDibujo({
    empezar: ({ x, y }) => {
      const p = aGlifo(x, y);
      setTinta((t) => [...t, [p]]);
      const s = estado.current;
      const lejos = controles.every((c) => c.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 30));
      if (lejos && !s.terminado && Date.now() - s.ultimoAviso > 5000) {
        s.ultimoAviso = Date.now();
        void hablar("Pasa el dedo por los puntitos, por donde tú quieras.");
      }
      mover(p);
    },
    seguir: ({ x, y }) => {
      const p = aGlifo(x, y);
      setTinta((t) => (t.length ? [...t.slice(0, -1), [...t.at(-1)!, p]] : [[p]]));
      mover(p);
    },
  });

  function mover(p: Punto) {
    const s = estado.current;
    if (s.terminado) return;
    let nuevos = 0;
    controles.forEach((c, i) => { nuevos += marcarPuntos(c, hechos.current[i]!, p); });
    if (!nuevos) return;
    s.pintados += nuevos;
    setPintados(s.pintados);
    sonido.paso(Math.round((s.pintados / total) * 14));
    // Con casi todos basta: un puntito suelto no debe frustrar a nadie.
    const faltan = total - s.pintados;
    if (faltan <= Math.max(1, Math.floor(total * 0.06))) {
      s.terminado = true;
      hechos.current = controles.map((c) => c.map(() => true));
      setPintados(total);
      alCompletar();
    }
  }

  // Los puntitos que faltan laten para invitar a pasar por ellos.
  const [latido, setLatido] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setLatido((v) => (v + 1) % 2), 520);
    return () => clearInterval(id);
  }, []);

  function reiniciar() {
    estado.current = { pintados: 0, ultimoAviso: 0, terminado: false };
    hechos.current = controles.map((c) => c.map(() => false));
    setPintados(0);
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
      <View style={[estilos.hoja, { width: ancho, height: alto }]}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={ancho} height={alto} viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}>
            {/* Renglones como en un cuaderno */}
            {[10, 70, 130].map((y) => <Path key={y} d={`M-8 ${y} H108`} stroke={y === 70 ? "#BBDEFB" : "#90CAF9"} strokeWidth="0.8" strokeDasharray={y === 70 ? "3 3" : undefined} />)}
            {/* Guía gris de la letra */}
            {trazos.map((t, i) => (
              <Polyline key={`g${i}`} points={aTexto(t)} fill="none" stroke="#ECEFF1" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            {/* Tinta mágica: cada tramo entre dos puntitos pintados se llena de color */}
            {controles.map((ct, i) =>
              ct.slice(1).map((q, k) =>
                hechos.current[i]?.[k] && hechos.current[i]?.[k + 1] ? (
                  <Path key={`m${i}-${k}`} d={`M${ct[k]![0]} ${ct[k]![1]} L${q[0]} ${q[1]}`} stroke={["#42A5F5", "#EC407A", "#FFB300", "#66BB6A"][i % 4]} strokeWidth="11" strokeLinecap="round" />
                ) : null,
              ),
            )}
            {/* Los puntitos: los pintados quedan verdes, los que faltan laten */}
            {controles.map((ct, i) =>
              ct.map(([x, y], k) => {
                const ok = hechos.current[i]?.[k];
                return <Circle key={`p${i}-${k}`} cx={x} cy={y} r={ok ? 3 : latido ? 3.4 : 2.6} fill={ok ? "#FFFFFF" : "#78909C"} opacity={ok ? 0.9 : 1} />;
              }),
            )}
            {/* Lo que dibuja el niño */}
            {tinta.map((t, i) => (
              <Polyline key={`t${i}`} points={aTexto(t)} fill="none" stroke={COLORES_TINTA[i % COLORES_TINTA.length]} strokeWidth="3.5" opacity={0.55} strokeLinecap="round" strokeLinejoin="round" />
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
        <View ref={capaRef} style={[StyleSheet.absoluteFill, capaEstilo]} accessibilityLabel="Hoja para escribir" {...capaProps} />
      </View>
      <View style={estilos.botones}>
        <Pressable style={estilos.boton} onPress={mirame} accessibilityLabel="Mírame">
          <TextoIconos estilo={estilos.botonTexto} texto={`👀 Mírame`} />
        </Pressable>
        <Pressable style={estilos.boton} onPress={reiniciar} accessibilityLabel="Borrar y empezar">
          <TextoIconos estilo={estilos.botonTexto} texto={`🧽 Otra vez`} />
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
