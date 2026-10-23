import { useRef, useState } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Pantalla } from "../components/Pantalla";
import { COLORES } from "../lib/tema";
import { hablar } from "../lib/voz";

const PALETA = ["#E53935", "#FB8C00", "#FDD835", "#43A047", "#1E88E5", "#8E24AA", "#F06292", "#6D4C41", "#212121"];
const GROSORES = [8, 16, 28];
const BORRADOR = "#FFFFFF";

interface Trazo {
  d: string;
  color: string;
  grosor: number;
}

/**
 * Lienzo libre con react-native-svg (funciona igual en iOS, Android y Web).
 * Fase 2: migrar a Skia para colorear por zonas y guardar en la galería.
 */
export default function Pintar() {
  const [trazos, setTrazos] = useState<Trazo[]>([]);
  const [color, setColor] = useState(PALETA[0]!);
  const [grosor, setGrosor] = useState(GROSORES[1]!);
  const actual = useRef<Trazo | null>(null);
  const pincel = useRef({ color, grosor });
  pincel.current = { color, grosor };

  // Coordenadas relativas al lienzo. El SVG no recibe toques (pointerEvents="none"),
  // así locationX/locationY siempre se miden desde el lienzo y no desde un trazo.
  const punto = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    return `${Math.round(locationX)},${Math.round(locationY)}`;
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const p = punto(e);
        const nuevo: Trazo = { d: `M${p} L${p}`, ...pincel.current };
        actual.current = nuevo;
        setTrazos((t) => [...t, nuevo]);
      },
      onPanResponderMove: (e) => {
        const previo = actual.current;
        if (!previo) return;
        // Se guarda el trazo en una constante: el actualizador de estado puede
        // ejecutarse después de soltar el dedo, cuando actual.current ya es null.
        const siguiente: Trazo = { ...previo, d: `${previo.d} L${punto(e)}` };
        actual.current = siguiente;
        setTrazos((t) => [...t.slice(0, -1), siguiente]);
      },
      onPanResponderRelease: () => {
        actual.current = null;
      },
      onPanResponderTerminate: () => {
        actual.current = null;
      },
    }),
  ).current;

  function borrarTodo() {
    if (trazos.length) hablar("¡Hoja nueva! ¿Qué dibujamos ahora?");
    setTrazos([]);
  }

  return (
    <Pantalla color={COLORES.pintar}>
      <View style={estilos.lienzo} {...responder.panHandlers}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width="100%" height="100%">
            {trazos.map((t, i) => (
              <Path key={i} d={t.d} stroke={t.color} strokeWidth={t.grosor} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            ))}
          </Svg>
        </View>
      </View>
      <View style={estilos.herramientas}>
        {PALETA.map((c) => (
          <Pressable key={c} accessibilityLabel={`Color ${c}`} onPress={() => setColor(c)} style={[estilos.color, { backgroundColor: c }, c === color && estilos.elegido]} />
        ))}
        <Pressable accessibilityLabel="Borrador" onPress={() => { setColor(BORRADOR); hablar("Borrador"); }} style={[estilos.boton, color === BORRADOR && estilos.elegido]}>
          <Text style={estilos.icono}>🧽</Text>
        </Pressable>
        {GROSORES.map((g) => (
          <Pressable key={g} accessibilityLabel={`Grosor ${g}`} onPress={() => setGrosor(g)} style={[estilos.boton, g === grosor && estilos.elegido]}>
            <View style={{ width: g, height: g, borderRadius: g / 2, backgroundColor: color === BORRADOR ? "#BDBDBD" : color }} />
          </Pressable>
        ))}
        <Pressable onPress={() => setTrazos((t) => t.slice(0, -1))} style={estilos.boton} accessibilityLabel="Deshacer">
          <Text style={estilos.icono}>↩️</Text>
        </Pressable>
        <Pressable onPress={borrarTodo} style={estilos.boton} accessibilityLabel="Hoja nueva">
          <Text style={estilos.icono}>📄</Text>
        </Pressable>
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  lienzo: { flex: 1, width: "100%", backgroundColor: "#fff", borderRadius: 24, overflow: "hidden" },
  herramientas: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, paddingVertical: 12 },
  color: { width: 56, height: 56, borderRadius: 28 },
  boton: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  elegido: { borderWidth: 4, borderColor: COLORES.texto },
  icono: { fontSize: 28 },
});
