import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Pantalla } from "../components/Pantalla";
import { useSuperficieDibujo } from "../lib/puntero";
import { COLORES } from "../lib/tema";
import { hablar } from "../lib/voz";
import { TextoIconos } from "../components/Iconos";

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

  // Acepta dedo, mouse y lápiz óptico. Con lápiz, apretar más hace el trazo más grueso.
  const presiones = useRef<number[]>([]);
  const grosorCon = (presion: number, lapiz: boolean) => {
    if (!lapiz) return pincel.current.grosor;
    presiones.current.push(presion);
    const media = presiones.current.reduce((a, b) => a + b, 0) / presiones.current.length;
    return Math.max(3, Math.round(pincel.current.grosor * (0.4 + media * 1.2)));
  };
  const { ref: lienzoRef, props: lienzoProps, estilo: lienzoEstilo } = useSuperficieDibujo({
    empezar: ({ x, y, presion, lapiz }) => {
      presiones.current = [];
      const p = `${Math.round(x)},${Math.round(y)}`;
      const nuevo: Trazo = { d: `M${p} L${p}`, color: pincel.current.color, grosor: grosorCon(presion, lapiz) };
      actual.current = nuevo;
      setTrazos((t) => [...t, nuevo]);
    },
    seguir: ({ x, y, presion, lapiz }) => {
      const previo = actual.current;
      if (!previo) return;
      // Se guarda el trazo en una constante: el actualizador de estado puede
      // ejecutarse después de soltar el dedo, cuando actual.current ya es null.
      const siguiente: Trazo = { ...previo, d: `${previo.d} L${Math.round(x)},${Math.round(y)}`, grosor: grosorCon(presion, lapiz) };
      actual.current = siguiente;
      setTrazos((t) => [...t.slice(0, -1), siguiente]);
    },
    terminar: () => {
      actual.current = null;
    },
  });

  function borrarTodo() {
    if (trazos.length) hablar("¡Hoja nueva! ¿Qué dibujamos ahora?");
    setTrazos([]);
  }

  return (
    <Pantalla color={COLORES.pintar}>
      <View ref={lienzoRef} style={[estilos.lienzo, lienzoEstilo]} accessibilityLabel="Lienzo para pintar" {...lienzoProps}>
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
          <TextoIconos estilo={estilos.icono} texto={`🧽`} />
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
          <TextoIconos estilo={estilos.icono} texto={`📄`} />
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
