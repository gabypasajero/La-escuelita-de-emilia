import { StyleSheet, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { CONTORNO, Sombreado, useSombreado } from "./Articulados";
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
  return (
    <View style={{ width: ancho, height: alto }}>
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
        <Path d="M36 92 Q42 98 40 108 M64 92 Q58 98 60 108" stroke="#000" strokeOpacity="0.1" strokeWidth="1.4" fill="none" />
        <Ellipse cx="50" cy="71" rx="10" ry="3.5" fill="#000" opacity="0.18" />
        <Path d="M41 70 Q50 78 59 70" stroke="#fff" strokeOpacity="0.85" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Brazos con manga */}
        {([[33, 76, 20, 92, 22, 108], [67, 76, 80, 92, 78, 108]] as const).map(([hx, hy, cx, cy, mx, my], i) => (
          <G key={i}>
            <Path d={`M${hx} ${hy} Q${cx} ${cy} ${mx} ${my}`} stroke="#000" strokeOpacity="0.16" strokeWidth="9.6" strokeLinecap="round" fill="none" />
            <Path d={`M${hx} ${hy} Q${cx} ${cy} ${mx} ${my}`} stroke={a.piel} strokeWidth="8" strokeLinecap="round" fill="none" />
            <Path d={`M${hx + (i ? 1.5 : -1.5)} ${hy + 3} Q${cx + (i ? 2 : -2)} ${cy} ${mx + (i ? 2 : -2)} ${my - 2}`} stroke="#fff" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" fill="none" />
            <Ellipse cx={hx + (i ? 2.5 : -2.5)} cy={hy + 4} rx="6.5" ry="8.5" fill={a.ropa} transform={`rotate(${i ? -28 : 28} ${hx + (i ? 2.5 : -2.5)} ${hy + 4})`} />
            <Ellipse cx={hx + (i ? 2.5 : -2.5)} cy={hy + 4} rx="6.5" ry="8.5" fill={sh.vol} {...CONTORNO} transform={`rotate(${i ? -28 : 28} ${hx + (i ? 2.5 : -2.5)} ${hy + 4})`} />
          </G>
        ))}
        {/* Cabeza con orejas, volumen y nariz */}
        <Ellipse cx="23.5" cy="48" rx="4" ry="5.5" fill={a.piel} {...CONTORNO} />
        <Ellipse cx="76.5" cy="48" rx="4" ry="5.5" fill={a.piel} {...CONTORNO} />
        <Circle cx="50" cy="44" r="27" fill={a.piel} />
        <Circle cx="50" cy="44" r="27" fill={sh.vol} {...CONTORNO} />
        <Path d="M26 41 Q34 31 50 33 Q66 31 74 41 Q66 35 50 36 Q34 35 26 41 Z" fill="#000" opacity="0.08" />
        {a.peinado === "rizado" ? (
          [26, 36, 47, 58, 68, 74, 22].map((x, i) => (
            <G key={i}>
              <Circle cx={x} cy={i > 4 ? 34 : 22 + (i % 2) * 3} r="10" fill={a.pelo} />
              <Circle cx={x} cy={i > 4 ? 34 : 22 + (i % 2) * 3} r="10" fill={sh.vol} {...CONTORNO} />
            </G>
          ))
        ) : (
          <G>
            <Path d="M23 44 Q24 14 50 15 Q77 14 77 44 Q68 28 50 30 Q33 28 23 44 Z" fill={a.pelo} />
            <Path d="M23 44 Q24 14 50 15 Q77 14 77 44 Q68 28 50 30 Q33 28 23 44 Z" fill={sh.volL} {...CONTORNO} />
            <Path d="M32 25 Q42 17 56 19" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.3" />
            <Path d="M42 29 Q45 23 51 22 M60 29 Q62 23 67 23" stroke="#000" strokeOpacity="0.25" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </G>
        )}
        {/* Cara */}
        <G stroke="#000" strokeOpacity="0.45" strokeWidth="1.8" strokeLinecap="round" fill="none"><Path d="M35 40 Q40 38 45 40" /><Path d="M55 40 Q60 38 65 40" /></G>
        {[40, 60].map((x) => (
          <G key={x}>
            <Circle cx={x} cy="47" r="3.7" fill="#3B2F5C" />
            <Circle cx={x} cy="47.6" r="2.2" fill="#5D4037" opacity="0.6" />
            <Circle cx={x + 1.2} cy="45.8" r="1.4" fill="#fff" />
            <Circle cx={x - 1.3} cy="48.6" r="0.6" fill="#fff" opacity="0.8" />
          </G>
        ))}
        <Path d="M48.5 51 Q50 53.5 51.8 51.6" stroke="#000" strokeOpacity="0.25" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <Circle cx="33" cy="56" r="4.5" fill="#F48FB1" opacity="0.5" />
        <Circle cx="67" cy="56" r="4.5" fill="#F48FB1" opacity="0.5" />
        <Path d="M42 58 Q50 65 58 58" stroke="#3B2F5C" strokeWidth="2.5" strokeLinecap="round" fill="#fff" />
      </Svg>
      {/* Accesorios (emoji) sobre el dibujo */}
      {accesorios.cabeza && <View style={[estilos.acc, { top: -18 * k, left: 22 * k }]}><Icono e={accesorios.cabeza.emoji} tam={56 * k} sinSombra quieto /></View>}
      {accesorios.cara && <View style={[estilos.acc, { top: 26 * k, left: 26 * k }]}><Icono e={accesorios.cara.emoji} tam={48 * k} sinSombra quieto /></View>}
      {accesorios.cuello && <View style={[estilos.acc, { top: 62 * k, left: 32 * k }]}><Icono e={accesorios.cuello.emoji} tam={36 * k} sinSombra quieto /></View>}
      {accesorios.mano && <View style={[estilos.acc, { top: 78 * k, left: 66 * k }]}><Icono e={accesorios.mano.emoji} tam={44 * k} sinSombra quieto /></View>}
    </View>
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
