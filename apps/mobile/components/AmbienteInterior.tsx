import { useId } from "react";
import { View } from "react-native";
import Svg, { Defs, Ellipse, LinearGradient, Polygon, RadialGradient, Rect, Stop } from "react-native-svg";
import { useMomento, type Momento } from "../lib/hora";

/**
 * Luz y profundidad para los escenarios por dentro (y sombras para todos):
 * sombra de contacto bajo cada cosa, rayo de luz que entra por la ventana
 * según la hora, oscurecimiento donde la pared se junta con el piso, piso más
 * luminoso al fondo y más oscuro adelante, y una viñeta suave.
 */

const uid = () => useId().replace(/[^a-zA-Z0-9]/g, "");

/** Sombra difuminada bajo un objeto o personaje. */
export function SombraContacto({ ancho, alto, opacidad = 0.36 }: { ancho: number; alto?: number; opacidad?: number }) {
  const id = `sc${uid()}`;
  const h = alto ?? ancho * 0.24;
  return (
    <View pointerEvents="none" style={{ position: "absolute", bottom: -h * 0.4, left: "50%", marginLeft: -ancho / 2, width: ancho, height: h }}>
      <Svg width="100%" height="100%" viewBox="0 0 100 24" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#2B1A0E" stopOpacity={opacidad} />
            <Stop offset="0.65" stopColor="#2B1A0E" stopOpacity={opacidad * 0.45} />
            <Stop offset="1" stopColor="#2B1A0E" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="50" cy="12" rx="50" ry="12" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const RAYO: Record<Momento, { color: string; o: number }> = {
  amanecer: { color: "#FFCCBC", o: 0.3 },
  dia: { color: "#FFFDE7", o: 0.42 },
  tarde: { color: "#FFB74D", o: 0.34 },
  noche: { color: "#9FA8DA", o: 0.16 },
};

export interface Ventana { x: number; y: number; w: number; h: number }

/** Capa de fondo (debajo de los objetos): piso con profundidad, rincón oscuro y rayo de luz. */
export function AmbienteFondo({ k, ancho, alto, muro, ventana, dir = 1 }: { k: number; ancho: number; alto: number; muro: number; ventana?: Ventana; dir?: 1 | -1 }) {
  const m = useMomento();
  const u = uid();
  const r = RAYO[m];
  const v = ventana;
  const piso = alto - muro;
  // El rayo baja desde la ventana y se apoya en el piso, corrido hacia `dir`.
  const rayo = v && [
    [v.x, v.y], [v.x + v.w, v.y],
    [v.x + v.w + dir * 190, muro + piso * 0.55], [v.x + dir * 70, muro + piso * 0.55],
  ].map(([x, y]) => `${dir === 1 ? x : x}, ${y}`).join(" ");
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0 }}>
      <Svg width={ancho * k} height={alto * k} viewBox={`0 0 ${ancho} ${alto}`}>
        <Defs>
          <LinearGradient id={`piso${u}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#fff" stopOpacity="0.1" />
            <Stop offset="0.45" stopColor="#fff" stopOpacity="0" />
            <Stop offset="1" stopColor="#000" stopOpacity="0.16" />
          </LinearGradient>
          <LinearGradient id={`rincon${u}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000" stopOpacity="0" />
            <Stop offset="0.45" stopColor="#000" stopOpacity="0.16" />
            <Stop offset="0.55" stopColor="#000" stopOpacity="0.2" />
            <Stop offset="1" stopColor="#000" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id={`techo${u}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000" stopOpacity="0.12" />
            <Stop offset="1" stopColor="#000" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id={`rayo${u}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={r.color} stopOpacity={r.o} />
            <Stop offset="1" stopColor={r.color} stopOpacity="0" />
          </LinearGradient>
          <RadialGradient id={`mancha${u}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={r.color} stopOpacity={r.o * 0.8} />
            <Stop offset="1" stopColor={r.color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={ancho} height="90" fill={`url(#techo${u})`} />
        <Rect x="0" y={muro} width={ancho} height={piso} fill={`url(#piso${u})`} />
        <Rect x="0" y={muro - 26} width={ancho} height="60" fill={`url(#rincon${u})`} />
        {v && rayo && (
          <>
            <Polygon points={rayo} fill={`url(#rayo${u})`} />
            <Ellipse cx={v.x + v.w / 2 + dir * 140} cy={muro + piso * 0.5} rx={v.w * 0.9 + 60} ry={piso * 0.16} fill={`url(#mancha${u})`} />
          </>
        )}
      </Svg>
    </View>
  );
}

/** Viñeta suave en los bordes del escenario (encima de todo, debajo de la interfaz). */
export function VinetaEscena({ k, ancho, alto, zIndex = 4900 }: { k: number; ancho: number; alto: number; zIndex?: number }) {
  const id = `vn${uid()}`;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, zIndex }}>
      <Svg width={ancho * k} height={alto * k} viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="52%" r="72%">
            <Stop offset="0.6" stopColor="#1A0F08" stopOpacity="0" />
            <Stop offset="1" stopColor="#1A0F08" stopOpacity="0.26" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
