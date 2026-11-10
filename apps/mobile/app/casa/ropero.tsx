import { rondaRopa } from "@escuelita/core";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { Pantalla } from "../../components/Pantalla";
import { Pregunta } from "../../components/Pregunta";

/**
 * Ropero: "¿Qué me pongo?" según el clima. El clima y las prendas van
 * dibujados aquí (no como emojis del aparato) para que se entiendan igual
 * en cualquier teléfono, y cada prenda lleva su nombre.
 */
const L = { stroke: "#3B2F5C", strokeWidth: 2.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const nube = (x: number, y: number, c: string) => <Path d={`M${x} ${y + 18} q-12 -2 -9 -12 q3 -8 12 -6 q3 -12 16 -9 q10 -8 18 3 q13 -1 13 12 q5 10 -8 12 Z`} fill={c} {...L} />;

function Clima({ id }: { id: string }) {
  return (
    <View style={estilos.clima}>
      <Svg width={190} height={130} viewBox="0 0 190 130">
        {id === "lluvia" && <><Rect width="190" height="130" fill="#B0BEC5" />{nube(48, 14, "#78909C")}{nube(108, 26, "#90A4AE")}{Array.from({ length: 14 }, (_, i) => <Path key={i} d={`M${20 + i * 12} ${62 + (i % 3) * 14} l-5 14`} stroke="#1E88E5" strokeWidth="4" strokeLinecap="round" />)}<Ellipse cx="95" cy="124" rx="70" ry="7" fill="#64B5F6" /></>}
        {id === "sol" && <><Rect width="190" height="130" fill="#81D4FA" /><Rect y="100" width="190" height="30" fill="#AED581" />{Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <Path key={i} d={`M${95 + Math.cos(a) * 38} ${54 + Math.sin(a) * 38} L${95 + Math.cos(a) * 52} ${54 + Math.sin(a) * 52}`} stroke="#FFB300" strokeWidth="6" strokeLinecap="round" />; })}<Circle cx="95" cy="54" r="30" fill="#FDD835" {...L} /><Path d="M84 60 Q95 70 106 60" fill="none" {...L} /><Circle cx="85" cy="48" r="3" fill="#3B2F5C" /><Circle cx="105" cy="48" r="3" fill="#3B2F5C" /></>}
        {id === "nieve" && <><Rect width="190" height="130" fill="#CFE8F7" /><Path d="M0 104 Q50 88 95 102 T190 98 V130 H0 Z" fill="#FFFFFF" />{nube(70, 6, "#ECEFF1")}{Array.from({ length: 16 }, (_, i) => <Circle key={i} cx={12 + ((i * 47) % 170)} cy={40 + ((i * 29) % 60)} r={3 + (i % 3)} fill="#fff" stroke="#90CAF9" strokeWidth="1.5" />)}<Circle cx="150" cy="96" r="13" fill="#fff" {...L} /><Circle cx="150" cy="76" r="9" fill="#fff" {...L} /><Path d="M150 77 l8 2" stroke="#FB8C00" strokeWidth="3" strokeLinecap="round" /></>}
        {id === "playa" && <><Rect width="190" height="130" fill="#81D4FA" /><Rect y="62" width="190" height="30" fill="#29B6F6" /><Path d="M0 70 q12 -6 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" stroke="#fff" strokeWidth="3" fill="none" /><Rect y="88" width="190" height="42" fill="#FFE0A3" /><Circle cx="160" cy="26" r="15" fill="#FDD835" {...L} /><Path d="M60 110 L72 56" {...L} strokeWidth={3} /><Path d="M32 62 Q72 22 112 62 Z" fill="#EF5350" {...L} /><Path d="M58 62 Q72 34 86 62" fill="#fff" {...L} strokeWidth={1.5} /><Circle cx="130" cy="108" r="10" fill="#fff" {...L} /><Path d="M121 108 Q130 100 139 108" fill="none" stroke="#1E88E5" strokeWidth="3" /></>}
        {id === "noche" && <><Rect width="190" height="130" fill="#283593" />{Array.from({ length: 12 }, (_, i) => <Circle key={i} cx={10 + ((i * 53) % 172)} cy={8 + ((i * 31) % 60)} r={1.5 + (i % 2)} fill="#FFF59D" />)}<Path d="M150 14 A22 22 0 1 0 168 50 A17 17 0 0 1 150 14 Z" fill="#FFF59D" {...L} /><Rect x="20" y="88" width="120" height="30" rx="6" fill="#8D6E63" {...L} /><Rect x="20" y="70" width="14" height="48" rx="4" fill="#6D4C41" {...L} /><Rect x="36" y="80" width="100" height="22" rx="8" fill="#F48FB1" {...L} /><Ellipse cx="52" cy="80" rx="14" ry="7" fill="#fff" {...L} /><Path d="M96 44 h10 l-10 10 h10 M112 30 h8 l-8 8 h8" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" /></>}
      </Svg>
    </View>
  );
}

function Prenda({ id, nombre }: { id: string; nombre: string }) {
  return (
    <View style={estilos.prenda}>
      <Svg width={84} height={84} viewBox="0 0 100 100">
        {id === "paraguas" && <><Path d="M50 46 V84 Q50 94 40 92" fill="none" {...L} strokeWidth={4} /><Path d="M8 48 Q50 2 92 48 Q82 40 71 48 Q60 40 50 48 Q40 40 29 48 Q18 40 8 48 Z" fill="#EF5350" {...L} /><Path d="M50 14 V8" {...L} /></>}
        {id === "botas" && <G>{[0, 40].map((x) => <Path key={x} d={`M${18 + x} 14 H${40 + x} V62 Q${56 + x} 64 ${56 + x} 78 V86 H${16 + x} V62 Z`} fill="#FDD835" {...L} />)}{[0, 40].map((x) => <Path key={`s${x}`} d={`M${16 + x} 80 H${56 + x}`} {...L} />)}</G>}
        {id === "gorro" && <><Path d="M14 62 Q14 22 50 22 Q86 22 86 62 Z" fill="#42A5F5" {...L} /><Path d="M10 62 H98 Q96 74 70 72 L10 72 Z" fill="#1E88E5" {...L} /><Circle cx="50" cy="22" r="5" fill="#1565C0" {...L} /></>}
        {id === "lentes" && <><Rect x="8" y="38" width="36" height="28" rx="12" fill="#37474F" {...L} /><Rect x="56" y="38" width="36" height="28" rx="12" fill="#37474F" {...L} /><Path d="M44 46 Q50 40 56 46 M8 44 L2 38 M92 44 L98 38" fill="none" {...L} /><Path d="M16 46 l8 -4 M64 46 l8 -4" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></>}
        {id === "bufanda" && <><Path d="M22 22 Q50 8 78 22 Q84 34 78 44 Q50 56 22 44 Q16 34 22 22 Z" fill="#EF5350" {...L} /><Path d="M54 46 L50 88 H70 L72 44 Z" fill="#EF5350" {...L} /><Path d="M51 76 H70 M52 64 H71" stroke="#FDD835" strokeWidth="4" /><Path d="M52 88 v8 M60 88 v8 M68 88 v8" {...L} /></>}
        {id === "guantes" && <G>{[0, 46].map((x, i) => <Path key={x} d={i ? `M${90 - 36} 90 H${90 - 8} V44 Q${90 - 8} 18 ${90 - 24} 20 Q${90 - 36} 22 ${90 - 36} 44 L${90 - 46} 40 Q${90 - 52} 44 ${90 - 46} 52 L${90 - 36} 62 Z` : "M36 90 H8 V44 Q8 18 24 20 Q36 22 36 44 L46 40 Q52 44 46 52 L36 62 Z"} fill="#66BB6A" {...L} />)}<Path d="M8 80 H36 M54 80 H82" stroke="#fff" strokeWidth="5" /></G>}
        {id === "parka" && <><Path d="M32 16 Q50 6 68 16 L92 34 L84 62 L72 54 V92 H28 V54 L16 62 L8 34 Z" fill="#7E57C2" {...L} /><Path d="M50 14 V92" {...L} /><Path d="M32 16 Q50 30 68 16" fill="#D1C4E9" {...L} /><Rect x="33" y="62" width="12" height="12" rx="2" fill="#5E35B1" {...L} strokeWidth={1.5} /><Rect x="55" y="62" width="12" height="12" rx="2" fill="#5E35B1" {...L} strokeWidth={1.5} /></>}
        {id === "traje" && <><Path d="M30 10 V26 Q22 44 30 60 Q22 78 34 92 H66 Q78 78 70 60 Q78 44 70 26 V10 H60 V22 Q50 32 40 22 V10 Z" fill="#26C6DA" {...L} /><Path d="M27 50 H73 M30 70 H70" stroke="#fff" strokeWidth="4" /></>}
        {id === "pijama" && <><Path d="M30 10 H70 L90 28 L80 44 L70 38 V60 H30 V38 L20 44 L10 28 Z" fill="#90CAF9" {...L} /><Path d="M30 60 H70 V94 H54 L50 72 L46 94 H30 Z" fill="#64B5F6" {...L} />{[[40, 26], [58, 34], [44, 46], [38, 76], [62, 80]].map(([x, y]) => <Circle key={`${x}${y}`} cx={x} cy={y} r="3" fill="#FFF59D" />)}</>}
      </Svg>
      <Text style={estilos.nombre}>{nombre}</Text>
    </View>
  );
}

export default function Ropero() {
  return (
    <Pantalla color="#E1F5FE" fondo="pieza">
      <Pregunta
        generar={(n) => rondaRopa(n)}
        estimulo={(r) => <Clima id={r.clima.id} />}
        opcion={(p) => <Prenda id={p.id} nombre={p.nombre} />}
        alAcertar={(r) => `¡Sí! ${r.clima.porque[r.correcta.id]}`}
        alFallar="Mmm, eso no sirve para este clima. ¡Prueba otra!"
        ayuda={(r) => r.enunciado}
      />
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  clima: { borderRadius: 22, overflow: "hidden", borderWidth: 5, borderColor: "#FFFFFF", boxShadow: "0 5px 0 rgba(59,47,92,0.2)" },
  prenda: { alignItems: "center", width: 104 },
  nombre: { fontSize: 14, fontWeight: "800", color: "#3B2F5C", textAlign: "center" },
});
