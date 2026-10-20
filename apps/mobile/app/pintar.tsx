import { useRef, useState } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Pantalla } from "../components/Pantalla";
import { COLORES } from "../lib/tema";

const PALETA = ["#E53935", "#FB8C00", "#FDD835", "#43A047", "#1E88E5", "#8E24AA", "#6D4C41", "#212121"];
const GROSORES = [8, 16, 28];

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

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX: x, locationY: y } = e.nativeEvent;
        actual.current = { d: `M${x},${y} L${x},${y}`, ...pincel.current };
        setTrazos((t) => [...t, actual.current!]);
      },
      onPanResponderMove: (e) => {
        if (!actual.current) return;
        const { locationX: x, locationY: y } = e.nativeEvent;
        actual.current = { ...actual.current, d: `${actual.current.d} L${x},${y}` };
        setTrazos((t) => [...t.slice(0, -1), actual.current!]);
      },
      onPanResponderRelease: () => {
        actual.current = null;
      },
    }),
  ).current;

  return (
    <Pantalla color={COLORES.pintar}>
      <View style={estilos.lienzo} {...responder.panHandlers}>
        <Svg width="100%" height="100%">
          {trazos.map((t, i) => (
            <Path key={i} d={t.d} stroke={t.color} strokeWidth={t.grosor} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ))}
        </Svg>
      </View>
      <View style={estilos.herramientas}>
        {PALETA.map((c) => (
          <Pressable key={c} onPress={() => setColor(c)} style={[estilos.color, { backgroundColor: c }, c === color && estilos.elegido]} />
        ))}
        {GROSORES.map((g) => (
          <Pressable key={g} onPress={() => setGrosor(g)} style={[estilos.grosor, g === grosor && estilos.elegido]}>
            <View style={{ width: g, height: g, borderRadius: g / 2, backgroundColor: color }} />
          </Pressable>
        ))}
        <Pressable onPress={() => setTrazos((t) => t.slice(0, -1))} style={estilos.grosor} accessibilityLabel="Deshacer">
          <Text style={estilos.icono}>↩️</Text>
        </Pressable>
        <Pressable onPress={() => setTrazos([])} style={estilos.grosor} accessibilityLabel="Borrar todo">
          <Text style={estilos.icono}>🧽</Text>
        </Pressable>
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  lienzo: { flex: 1, width: "100%", backgroundColor: "#fff", borderRadius: 24, overflow: "hidden" },
  herramientas: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, paddingVertical: 12 },
  color: { width: 56, height: 56, borderRadius: 28 },
  grosor: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  elegido: { borderWidth: 4, borderColor: COLORES.texto },
  icono: { fontSize: 28 },
});
