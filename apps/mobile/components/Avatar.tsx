import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
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
  const ancho = (alto * 100) / 160;
  const k = alto / 160;
  return (
    <View style={{ width: ancho, height: alto }}>
      <Svg width={ancho} height={alto} viewBox="0 0 100 160">
        {/* Pelo de atrás */}
        {a.peinado === "largo" && <Path d="M22 40 Q20 84 30 92 L70 92 Q80 84 78 40 Z" fill={a.pelo} />}
        {a.peinado === "colitas" && (
          <>
            <Circle cx="18" cy="40" r="11" fill={a.pelo} />
            <Circle cx="82" cy="40" r="11" fill={a.pelo} />
          </>
        )}
        {/* Piernas y zapatos */}
        <Rect x="38" y="120" width="9" height="26" rx="4" fill={a.piel} />
        <Rect x="53" y="120" width="9" height="26" rx="4" fill={a.piel} />
        <Ellipse cx="42" cy="148" rx="9" ry="5" fill="#3E2723" />
        <Ellipse cx="58" cy="148" rx="9" ry="5" fill="#3E2723" />
        {/* Ropa: polera y pantalón corto */}
        <Path d="M33 72 Q50 66 67 72 L72 112 L28 112 Z" fill={a.ropa} />
        <Rect x="32" y="108" width="36" height="16" rx="5" fill="#5C6BC0" />
        <Path d="M33 76 Q20 92 22 108" stroke={a.piel} strokeWidth="8" strokeLinecap="round" fill="none" />
        <Path d="M67 76 Q80 92 78 108" stroke={a.piel} strokeWidth="8" strokeLinecap="round" fill="none" />
        {/* Cabeza */}
        <Circle cx="50" cy="44" r="27" fill={a.piel} />
        {a.peinado === "rizado" ? (
          [26, 36, 47, 58, 68, 74, 22].map((x, i) => <Circle key={i} cx={x} cy={i > 4 ? 34 : 22 + (i % 2) * 3} r="10" fill={a.pelo} />)
        ) : (
          <Path d="M23 44 Q24 14 50 15 Q77 14 77 44 Q68 28 50 30 Q33 28 23 44 Z" fill={a.pelo} />
        )}
        {/* Cara */}
        <Circle cx="40" cy="47" r="3.5" fill="#3B2F5C" />
        <Circle cx="60" cy="47" r="3.5" fill="#3B2F5C" />
        <Circle cx="41" cy="46" r="1.2" fill="#fff" />
        <Circle cx="61" cy="46" r="1.2" fill="#fff" />
        <Circle cx="33" cy="56" r="4.5" fill="#F48FB1" opacity="0.5" />
        <Circle cx="67" cy="56" r="4.5" fill="#F48FB1" opacity="0.5" />
        <Path d="M42 58 Q50 65 58 58" stroke="#3B2F5C" strokeWidth="2.5" strokeLinecap="round" fill="#fff" />
      </Svg>
      {/* Accesorios (emoji) sobre el dibujo */}
      {accesorios.cabeza && <Text style={[estilos.acc, { fontSize: 38 * k, top: -14 * k, left: 28 * k }]}>{accesorios.cabeza.emoji}</Text>}
      {accesorios.cara && <Text style={[estilos.acc, { fontSize: 30 * k, top: 30 * k, left: 33 * k }]}>{accesorios.cara.emoji}</Text>}
      {accesorios.cuello && <Text style={[estilos.acc, { fontSize: 24 * k, top: 68 * k, left: 38 * k }]}>{accesorios.cuello.emoji}</Text>}
      {accesorios.mano && <Text style={[estilos.acc, { fontSize: 30 * k, top: 86 * k, left: 70 * k }]}>{accesorios.mano.emoji}</Text>}
    </View>
  );
}

/** Tito con su accesorio de la tienda, si tiene uno puesto. */
export function TitoVestido({ alto = 70, accesorio }: { alto?: number; accesorio?: Accesorio }) {
  const k = alto / 80;
  return (
    <View>
      <TitoDibujo alto={alto} />
      {accesorio && <Text style={[estilos.acc, { fontSize: 22 * k, top: -8 * k, left: 12 * k }]}>{accesorio.emoji}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  acc: { position: "absolute" },
});
