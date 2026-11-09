import { Animated, StyleSheet, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { CONTORNO, ojoTierno, Sombreado, useCiclo, useSombreado } from "./Articulados";

/** Pelo con flequillo ondulado (mechones sobre la frente). */
const FLEQUILLO = "M22 47 Q20 15 50 13 Q80 15 78 47 Q76 37 70 32 Q66 38 60 35 Q56 40 50 36 Q44 40 40 35 Q34 38 30 32 Q24 37 22 47 Z";
import { Icono } from "./Iconos";
import type { Accesorio, Apariencia } from "../lib/juego";
import { TitoDibujo } from "./Personajes";

export const PIELES = ["#FCE0C8", "#F1C7A5", "#D9A27A", "#B47A52", "#8A5634", "#5E3A22"];
export const PELOS = ["#2B1B12", "#5D4037", "#A1673F", "#E6B655", "#E06F2B", "#9E9E9E"];
export const ROPAS = ["#E53935", "#FB8C00", "#FDD835", "#43A047", "#1E88E5", "#8E24AA", "#F06292", "#00ACC1"];
export const PEINADOS: Apariencia["peinado"][] = ["corto", "colitas", "largo", "rizado"];

export const APARIENCIA_INICIAL: Apariencia = { piel: PIELES[1]!, pelo: PELOS[1]!, peinado: "corto", ropa: ROPAS[4]! };

interface Props {
  apariencia: Apariencia;
  alto?: number;
  accesorios?: Partial<Record<"cabeza" | "cara" | "cuello" | "mano", Accesorio | undefined>>;
}

/** El personaje del niño (lienzo 100×160), con peinado, colores y accesorios. */
export function Avatar({ apariencia: a, alto = 160, accesorios = {} }: Props) {
  const sh = useSombreado();
  const ancho = (alto * 100) / 160;
  const k = alto / 160;
  const calma = useCiclo(2700);
  return (
    <Animated.View style={{ width: ancho, height: alto, transformOrigin: "bottom", transform: [{ scaleY: calma.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.022, 1] }) as never }, { scaleX: calma.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.99, 1] }) as never }] }}>

      <Svg width={ancho} height={alto} viewBox="0 0 100 160">
        <Sombreado suf={sh.suf} />
        {/* Pelo de atrás */}
        {a.peinado === "largo" && (
          <G>
            <Path d="M22 40 Q20 84 30 92 L70 92 Q80 84 78 40 Z" fill={a.pelo} />
            <Path d="M22 40 Q20 84 30 92 L70 92 Q80 84 78 40 Z" fill={sh.volL} {...CONTORNO} />
          </G>
        )}
        {a.peinado === "colitas" && [18, 82].map((x) => (
          <G key={x}>
            <Circle cx={x} cy="40" r="11" fill={a.pelo} />
            <Circle cx={x} cy="40" r="11" fill={sh.vol} {...CONTORNO} />
            <Path d={`M${x - 6} 35 Q${x} 30 ${x + 5} 33`} stroke="#fff" strokeOpacity="0.3" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          </G>
        ))}
        {/* Piernas, calcetines y zapatillas */}
        {[38, 53].map((x) => (
          <G key={x}>
            <Rect x={x} y="120" width="9" height="26" rx="4" fill={a.piel} />
            <Rect x={x} y="120" width="9" height="26" rx="4" fill={sh.volL} />
            <Rect x={x - 0.5} y="138" width="10" height="6" rx="2" fill="#fff" {...CONTORNO} />
            <Ellipse cx={x + 4} cy="148" rx="9.5" ry="5.2" fill="#3E2723" />
            <Ellipse cx={x + 4} cy="148" rx="9.5" ry="5.2" fill={sh.vol} {...CONTORNO} />
            <Path d={`M${x - 4} 150.5 H${x + 13}`} stroke="#fff" strokeWidth="1.6" opacity="0.8" />
            <Path d={`M${x - 1} 145.5 Q${x + 3} 143.5 ${x + 7} 145`} stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.5" strokeLinecap="round" />
          </G>
        ))}
        {/* Ropa: polera con cuello y pantalón corto */}
        <Rect x="32" y="108" width="36" height="16" rx="5" fill="#5C6BC0" />
        <Rect x="32" y="108" width="36" height="16" rx="5" fill={sh.volV} {...CONTORNO} />
        <Path d="M50 112 V124" stroke="#3949AB" strokeWidth="1.2" />
        <Path d="M33 72 Q50 66 67 72 L72 112 L28 112 Z" fill={a.ropa} />
        <Path d="M33 72 Q50 66 67 72 L72 112 L28 112 Z" fill={sh.volL} {...CONTORNO} />
        <Path d="M36 92 Q42 98 40 108 M64 92 Q58 98 60 108" stroke="#6D3B1F" strokeOpacity="0.08" strokeWidth="1.4" fill="none" />
        <Ellipse cx="50" cy="71" rx="10" ry="3.5" fill="#8A4B2A" opacity="0.12" />
        <Path d="M41 70 Q50 78 59 70" stroke="#fff" strokeOpacity="0.85" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Brazos con manga */}
        {([[33, 76, 20, 92, 22, 108], [67, 76, 80, 92, 78, 108]] as const).map(([hx, hy, cx, cy, mx, my], i) => (
          <G key={i}>
            <Path d={`M${hx} ${hy} Q${cx} ${cy} ${mx} ${my}`} stroke="#6D3B1F" strokeOpacity="0.08" strokeWidth="8.6" strokeLinecap="round" fill="none" />
            <Path d={`M${hx} ${hy} Q${cx} ${cy} ${mx} ${my}`} stroke={a.piel} strokeWidth="7.4" strokeLinecap="round" fill="none" />
            <Path d={`M${hx + (i ? 1.5 : -1.5)} ${hy + 3} Q${cx + (i ? 2 : -2)} ${cy} ${mx + (i ? 2 : -2)} ${my - 2}`} stroke="#fff" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Manga corta que sigue al brazo */}
            <G transform={`rotate(${i ? -24 : 24} ${hx} ${hy})`}>
              <Path d={`M${hx - 6.5} ${hy - 4} Q${hx} ${hy - 7} ${hx + 6.5} ${hy - 4} Q${hx + 9.5} ${hy + 3} ${hx + 7} ${hy + 8.5} Q${hx} ${hy + 12} ${hx - 7} ${hy + 8.5} Q${hx - 9.5} ${hy + 3} ${hx - 6.5} ${hy - 4} Z`} fill={a.ropa} />
              <Path d={`M${hx - 6.5} ${hy - 4} Q${hx} ${hy - 7} ${hx + 6.5} ${hy - 4} Q${hx + 9.5} ${hy + 3} ${hx + 7} ${hy + 8.5} Q${hx} ${hy + 12} ${hx - 7} ${hy + 8.5} Q${hx - 9.5} ${hy + 3} ${hx - 6.5} ${hy - 4} Z`} fill={sh.volL} {...CONTORNO} />
            </G>
          </G>
        ))}
        {/* Cabeza con orejas, volumen y nariz */}
        <Ellipse cx="23.5" cy="48" rx="4" ry="5.5" fill={a.piel} {...CONTORNO} />
        <Ellipse cx="76.5" cy="48" rx="4" ry="5.5" fill={a.piel} {...CONTORNO} />
        <Circle cx="50" cy="44" r="27" fill={a.piel} />
        <Circle cx="50" cy="44" r="27" fill={sh.vol} {...CONTORNO} />
        {a.peinado === "rizado" ? (
          [26, 36, 47, 58, 68, 74, 22].map((x, i) => (
            <G key={i}>
              <Circle cx={x} cy={i > 4 ? 34 : 22 + (i % 2) * 3} r="10" fill={a.pelo} />
              <Circle cx={x} cy={i > 4 ? 34 : 22 + (i % 2) * 3} r="10" fill={sh.vol} {...CONTORNO} />
            </G>
          ))
        ) : (
          <G>
            <Path d={FLEQUILLO} fill={a.pelo} />
            <Path d={FLEQUILLO} fill={sh.volL} {...CONTORNO} />
            <Path d="M33 23 Q42 17 54 18" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.26" />
            <Path d="M40 32 Q43 27 47 25 M56 25 Q60 27 62 32" stroke="#000" strokeOpacity="0.15" strokeWidth="1" fill="none" strokeLinecap="round" />
          </G>
        )}
        {/* Cara */}
        <G stroke="#000" strokeOpacity="0.28" strokeWidth="1.4" strokeLinecap="round" fill="none"><Path d="M36 40 Q40 38.5 44 40" /><Path d="M56 40 Q60 38.5 64 40" /></G>
        {ojoTierno(40, 48, 4.7)}
        {ojoTierno(60, 48, 4.7)}
        <Ellipse cx="50" cy="53" rx="1.6" ry="1.1" fill="#000" opacity="0.14" />
        <Ellipse cx="32.5" cy="57" rx="6" ry="4.2" fill="#FF8A80" opacity="0.38" />
        <Ellipse cx="67.5" cy="57" rx="6" ry="4.2" fill="#FF8A80" opacity="0.38" />
        <Path d="M42.5 58.5 Q50 67.5 57.5 58.5 Q50 61 42.5 58.5 Z" fill="#8E3B46" />
        <Ellipse cx="50" cy="63.1" rx="3.4" ry="1.7" fill="#F48FB1" />
      </Svg>
      {/* Accesorios (emoji) sobre el dibujo */}
      {accesorios.cabeza && <View style={[estilos.acc, { top: -18 * k, left: 22 * k }]}><Icono e={accesorios.cabeza.emoji} tam={56 * k} sinSombra quieto /></View>}
      {accesorios.cara && <View style={[estilos.acc, { top: 26 * k, left: 26 * k }]}><Icono e={accesorios.cara.emoji} tam={48 * k} sinSombra quieto /></View>}
      {accesorios.cuello && <View style={[estilos.acc, { top: 62 * k, left: 32 * k }]}><Icono e={accesorios.cuello.emoji} tam={36 * k} sinSombra quieto /></View>}
      {accesorios.mano && <View style={[estilos.acc, { top: 78 * k, left: 66 * k }]}><Icono e={accesorios.mano.emoji} tam={44 * k} sinSombra quieto /></View>}
    </Animated.View>
  );
}

/** Tito con su accesorio de la tienda, si tiene uno puesto. */
export function TitoVestido({ alto = 70, accesorio, caminando = false }: { alto?: number; accesorio?: Accesorio; caminando?: boolean }) {
  const k = alto / 80;
  return (
    <View>
      <TitoDibujo alto={alto} caminando={caminando} />
      {accesorio && <View style={[estilos.acc, { top: -12 * k, left: 8 * k }]}><Icono e={accesorio.emoji} tam={34 * k} sinSombra quieto /></View>}
    </View>
  );
}

const estilos = StyleSheet.create({
  acc: { position: "absolute" },
});
