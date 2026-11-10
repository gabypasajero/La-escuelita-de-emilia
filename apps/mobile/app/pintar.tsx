import { Children, cloneElement, isValidElement, useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Svg, { Circle, Ellipse, G, Image as ImagenSvg, Path, Rect } from "react-native-svg";
import { dibujoEnSvg, Icono } from "../components/Iconos";
import { Pantalla } from "../components/Pantalla";
import { Rebote } from "../components/Rebote";
import { fotoDeHoja, rellenar } from "../lib/balde";
import { guardar, leer } from "../lib/guardado";
import { useJuego } from "../lib/juego";
import { useSuperficieDibujo } from "../lib/puntero";
import { sonido } from "../lib/sonidos";
import { COLORES } from "../lib/tema";
import { hablar } from "../lib/voz";

/**
 * El caballete del Taller de arte: hoja libre o un dibujo para pintar o
 * calcar, con ocho tipos de lápiz (plumón, lápiz grafito, pincel, crayón,
 * destacador, arcoíris, brillitos y sellos), muchos colores y tres grosores.
 * Todo es SVG, así funciona igual en teléfono, tablet y computador.
 */

const PALETA = [
  "#E53935", "#FF7043", "#FB8C00", "#FDD835", "#C0CA33", "#43A047", "#00897B", "#26C6DA",
  "#1E88E5", "#3949AB", "#8E24AA", "#EC407A", "#F8BBD0", "#FFCC80", "#F1C7A5", "#A1673F",
  "#6D4C41", "#90A4AE", "#FFFFFF", "#212121", "#B2EBF2", "#C8E6C9", "#FFF59D", "#D1C4E9",
];
const ARCOIRIS = ["#E53935", "#FB8C00", "#FDD835", "#43A047", "#1E88E5", "#3949AB", "#8E24AA"];
const GROSORES = [7, 15, 28];

type Lapiz = "balde" | "plumon" | "grafito" | "pincel" | "crayon" | "destacador" | "arcoiris" | "brillos" | "sello" | "borrador";
const LAPICES: Array<{ id: Lapiz; nombre: string; dice: string }> = [
  { id: "plumon", nombre: "Plumón", dice: "Plumón" },
  { id: "grafito", nombre: "Lápiz", dice: "Lápiz grafito, para dibujar finito" },
  { id: "pincel", nombre: "Pincel", dice: "Pincel, para pintar grueso" },
  { id: "crayon", nombre: "Crayón", dice: "Crayón" },
  { id: "destacador", nombre: "Destacador", dice: "Destacador" },
  { id: "arcoiris", nombre: "Arcoíris", dice: "¡Lápiz arcoíris! Pinta con todos los colores" },
  { id: "brillos", nombre: "Brillitos", dice: "¡Brillitos! Deja un camino de estrellas" },
  { id: "sello", nombre: "Sellos", dice: "Sellos. Elige uno y toca la hoja" },
  { id: "balde", nombre: "Balde", dice: "Balde de pintura. Toca una parte del dibujo y se llena de color" },
  { id: "borrador", nombre: "Borrador", dice: "Borrador" },
].filter((l) => l.id !== "balde" || Platform.OS === "web") as Array<{ id: Lapiz; nombre: string; dice: string }>;
function estrella(x: number, y: number, r: number): string {
  return "M" + Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2, q = i % 2 ? r * 0.45 : r;
    return `${(x + Math.cos(a) * q).toFixed(1)} ${(y + Math.sin(a) * q).toFixed(1)}`;
  }).join(" L") + " Z";
}

// Timbres propios del taller, dibujados en una caja de 100 × 100.
const N = { stroke: "#3B2F5C", strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const carita = (cy: number) => <><Circle cx="42" cy={cy} r="2.6" fill="#3B2F5C" /><Circle cx="58" cy={cy} r="2.6" fill="#3B2F5C" /><Path d={`M43 ${cy + 8} Q50 ${cy + 14} 57 ${cy + 8}`} fill="none" {...N} strokeWidth={2.4} /><Circle cx="36" cy={cy + 6} r="3.4" fill="#F48FB1" opacity="0.7" /><Circle cx="64" cy={cy + 6} r="3.4" fill="#F48FB1" opacity="0.7" /></>;
const TIMBRES: Record<string, ReactNode> = {
  sol: <>{Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <Path key={i} d={`M${50 + Math.cos(a) * 30} ${50 + Math.sin(a) * 30} L${50 + Math.cos(a) * 44} ${50 + Math.sin(a) * 44}`} fill="none" stroke="#FFB300" strokeWidth="6" strokeLinecap="round" />; })}<Circle cx="50" cy="50" r="23" fill="#FDD835" {...N} />{carita(48)}</>,
  estrella: <Path d={estrella(50, 52, 42)} fill="#FDD835" {...N} />,
  flor: <><Path d="M50 62 V96 M50 82 Q34 72 30 84 Q42 92 50 82" fill="#66BB6A" {...N} />{[0, 1, 2, 3, 4, 5].map((i) => <Circle key={i} cx={50 + Math.cos(i * 1.047) * 18} cy={38 + Math.sin(i * 1.047) * 18} r="11" fill="#F48FB1" {...N} />)}<Circle cx="50" cy="38" r="9" fill="#FDD835" {...N} /></>,
  nube: <><Path d="M22 68 Q8 66 12 52 Q14 42 26 44 Q28 26 46 30 Q58 20 68 34 Q86 32 86 50 Q94 62 78 68 Z" fill="#FFFFFF" {...N} /><Path d="M30 58 Q40 62 50 58" fill="none" stroke="#B3E5FC" strokeWidth="3" strokeLinecap="round" /></>,
  arcoiris: <>{["#E53935", "#FB8C00", "#FDD835", "#43A047", "#1E88E5", "#8E24AA"].map((c, i) => <Path key={c} d={`M${12 + i * 6} 74 A${38 - i * 6} ${38 - i * 6} 0 0 1 ${88 - i * 6} 74`} fill="none" stroke={c} strokeWidth="6.4" />)}<Circle cx="16" cy="76" r="10" fill="#fff" {...N} strokeWidth={2} /><Circle cx="84" cy="76" r="10" fill="#fff" {...N} strokeWidth={2} /></>,
  luna: <Path d="M62 12 A40 40 0 1 0 88 62 A30 30 0 0 1 62 12 Z" fill="#FFF59D" {...N} />,
  gato: <><Path d="M26 44 L22 16 L44 30 M74 44 L78 16 L56 30" fill="#FFB74D" {...N} /><Circle cx="50" cy="56" r="30" fill="#FFB74D" {...N} />{carita(52)}<Path d="M20 60 H32 M68 60 H80" {...N} strokeWidth={2} /></>,
  perro: <><Circle cx="50" cy="54" r="30" fill="#D7A27A" {...N} /><Path d="M24 40 Q8 44 16 72 Q26 70 28 52 Z M76 40 Q92 44 84 72 Q74 70 72 52 Z" fill="#8D6E63" {...N} />{carita(50)}<Ellipse cx="50" cy="60" rx="5" ry="3.6" fill="#3B2F5C" /></>,
  conejo: <><Ellipse cx="38" cy="26" rx="8" ry="22" fill="#FFFFFF" {...N} /><Ellipse cx="62" cy="26" rx="8" ry="22" fill="#FFFFFF" {...N} /><Ellipse cx="38" cy="28" rx="3.4" ry="14" fill="#F8BBD0" /><Ellipse cx="62" cy="28" rx="3.4" ry="14" fill="#F8BBD0" /><Circle cx="50" cy="62" r="28" fill="#FFFFFF" {...N} />{carita(58)}</>,
  pajaro: <><Ellipse cx="48" cy="54" rx="30" ry="26" fill="#4FC3F7" {...N} /><Path d="M76 48 L94 52 L76 60 Z" fill="#FFB300" {...N} /><Path d="M34 56 Q46 44 58 60 Q46 70 34 56 Z" fill="#0288D1" {...N} /><Circle cx="62" cy="44" r="4" fill="#3B2F5C" /><Path d="M40 80 V92 M54 80 V92" {...N} /></>,
  pez: <><Path d="M70 50 L94 30 V70 Z" fill="#FF8A65" {...N} /><Ellipse cx="44" cy="50" rx="32" ry="22" fill="#FFB74D" {...N} /><Circle cx="28" cy="44" r="4" fill="#3B2F5C" /><Path d="M46 34 Q54 50 46 66 M22 56 Q28 62 34 56" fill="none" {...N} strokeWidth={2.4} /></>,
  mariposa: <><Circle cx="30" cy="38" r="20" fill="#F06292" {...N} /><Circle cx="70" cy="38" r="20" fill="#F06292" {...N} /><Circle cx="34" cy="68" r="14" fill="#BA68C8" {...N} /><Circle cx="66" cy="68" r="14" fill="#BA68C8" {...N} /><Circle cx="30" cy="38" r="7" fill="#FFF59D" /><Circle cx="70" cy="38" r="7" fill="#FFF59D" /><Ellipse cx="50" cy="54" rx="5" ry="24" fill="#5D4037" {...N} /></>,
  tito: <><Ellipse cx="44" cy="62" rx="26" ry="17" fill="#A1673F" {...N} /><Circle cx="74" cy="40" r="15" fill="#A1673F" {...N} /><Path d="M66 28 L62 12 L74 26 M80 26 L88 14 L86 30" fill="#8D5524" {...N} /><Path d="M28 76 V92 M40 78 V92 M54 78 V92 M64 74 V92" {...N} strokeWidth={4} /><Circle cx="78" cy="38" r="2.6" fill="#3B2F5C" /><Circle cx="88" cy="44" r="2.4" fill="#3B2F5C" />{[[36, 56], [48, 62], [40, 68]].map(([x, y]) => <Circle key={`${x}`} cx={x} cy={y} r="2.6" fill="#FFE0B2" />)}</>,
  nino: <><Path d="M32 96 V70 Q32 60 50 60 Q68 60 68 70 V96 Z" fill="#1E88E5" {...N} /><Circle cx="50" cy="36" r="24" fill="#F1C7A5" {...N} /><Path d="M27 32 Q30 10 50 11 Q70 10 73 32 Q62 20 50 24 Q38 20 27 32 Z" fill="#5D4037" {...N} />{carita(38)}</>,
  nina: <><Path d="M28 96 L36 64 Q50 56 64 64 L72 96 Z" fill="#FDD835" {...N} /><Circle cx="20" cy="40" r="10" fill="#5D4037" {...N} /><Circle cx="80" cy="40" r="10" fill="#5D4037" {...N} /><Circle cx="50" cy="36" r="24" fill="#F1C7A5" {...N} /><Path d="M27 34 Q28 10 50 11 Q72 10 73 34 Q60 22 50 26 Q40 22 27 34 Z" fill="#5D4037" {...N} /><Circle cx="24" cy="30" r="4" fill="#EF5350" /><Circle cx="76" cy="30" r="4" fill="#EF5350" />{carita(38)}</>,
  corazon: <Path d="M50 88 C14 62 8 36 26 24 C38 16 48 24 50 34 C52 24 62 16 74 24 C92 36 86 62 50 88 Z" fill="#EF5350" {...N} />,
  globo: <><Path d="M50 66 Q46 80 52 96" fill="none" {...N} strokeWidth={2} /><Ellipse cx="50" cy="38" rx="26" ry="30" fill="#EF5350" {...N} /><Path d="M46 66 L54 66 L50 72 Z" fill="#C62828" {...N} strokeWidth={2} /><Ellipse cx="40" cy="26" rx="6" ry="9" fill="#fff" opacity="0.6" /></>,
  pelota: <><Circle cx="50" cy="50" r="38" fill="#FFFFFF" {...N} /><Path d="M12 50 Q50 30 88 50 M50 12 Q30 50 50 88" fill="none" stroke="#1E88E5" strokeWidth="5" /><Path d="M50 12 A38 38 0 0 1 88 50 Q70 40 50 12 Z" fill="#EF5350" /><Circle cx="50" cy="50" r="38" fill="none" {...N} /></>,
  auto: <><Path d="M8 70 V54 Q8 50 16 50 H24 L34 32 H64 L76 50 H86 Q94 50 94 58 V70 Z" fill="#EF5350" {...N} /><Path d="M38 37 H48 V50 H31 Z M53 37 H62 L70 50 H53 Z" fill="#B3E5FC" {...N} strokeWidth={2} /><Circle cx="28" cy="72" r="10" fill="#37474F" {...N} /><Circle cx="72" cy="72" r="10" fill="#37474F" {...N} /><Circle cx="28" cy="72" r="4" fill="#CFD8DC" /><Circle cx="72" cy="72" r="4" fill="#CFD8DC" /></>,
  arbol: <><Rect x="43" y="60" width="14" height="34" fill="#8D6E63" {...N} /><Circle cx="32" cy="50" r="18" fill="#43A047" {...N} /><Circle cx="68" cy="50" r="18" fill="#43A047" {...N} /><Circle cx="50" cy="32" r="22" fill="#66BB6A" {...N} />{[[40, 30], [60, 42], [32, 54]].map(([x, y]) => <Circle key={`${x}`} cx={x} cy={y} r="4" fill="#EF5350" />)}</>,
  regalo: <><Rect x="16" y="42" width="68" height="46" rx="4" fill="#AB47BC" {...N} /><Rect x="10" y="30" width="80" height="16" rx="4" fill="#CE93D8" {...N} /><Rect x="44" y="30" width="12" height="58" fill="#FDD835" {...N} strokeWidth={2} /><Path d="M50 30 Q32 6 26 22 Q28 30 50 30 Q72 30 74 22 Q68 6 50 30 Z" fill="#FDD835" {...N} /></>,
  corona: <><Path d="M14 76 L10 34 L32 54 L50 22 L68 54 L90 34 L86 76 Z" fill="#FDD835" {...N} />{[[32, 66, "#EF5350"], [50, 66, "#1E88E5"], [68, 66, "#43A047"]].map(([x, y, c]) => <Circle key={`${x}`} cx={x} cy={y} r="5" fill={c as string} />)}</>,
};
/** El mismo timbre pero solo con su contorno, para estamparlo y después colorearlo. */
function soloLinea(nodo: ReactNode): ReactNode {
  return Children.map(nodo, (h) => {
    if (!isValidElement(h)) return h;
    const el = h as ReactElement<Record<string, unknown>>;
    const pr = el.props;
    const hijos = pr.children ? soloLinea(pr.children as ReactNode) : undefined;
    if (pr.fill === undefined && pr.stroke === undefined) return cloneElement(el, {}, hijos);
    // Ojos y boca se quedan; lo demás pasa a ser una línea cerrada sobre blanco.
    if (typeof pr.opacity === "string" || typeof pr.opacity === "number") return null; // mejillas y brillos: fuera
    if (pr.fill === "#3B2F5C") return el;
    const relleno = pr.fill === "none" || pr.fill === undefined ? "none" : "#FFFFFF";
    return cloneElement(el, { fill: relleno, stroke: "#3B2F5C", strokeWidth: pr.stroke === "#3B2F5C" ? pr.strokeWidth : 2.2, opacity: 1, strokeLinejoin: "round", strokeLinecap: "round" }, hijos);
  });
}
const LINEAS: Record<string, ReactNode> = {};
const timbre = (e: string, x: number, y: number, tam: number, linea = false) =>
  TIMBRES[e] ? <G transform={`translate(${x - tam / 2} ${y - tam / 2}) scale(${tam / 100})`}>{linea ? (LINEAS[e] ??= soloLinea(TIMBRES[e])) : TIMBRES[e]}</G> : linea ? null : dibujoEnSvg(e, x, y, tam);

const SELLOS_DIBUJO = ["🍓", "🎃", "🥕", "🧺", "💧", "🏠", "🍦", "🧀", "🍇", "🌽", "🍅"].filter((e) => dibujoEnSvg(e, 0, 0, 1) !== null);
// Primero el cielo, las personas y los animales; después los objetos y la comida.
const SELLOS = ["sol", "nube", "arcoiris", "luna", "estrella", "nino", "nina", "tito", "gato", "perro", "conejo", "pajaro", "pez", "mariposa", "flor", "arbol", "corazon", "globo", "pelota", "auto", "regalo", "corona", ...SELLOS_DIBUJO].filter((e) => TIMBRES[e] || SELLOS_DIBUJO.includes(e));

type Cosa =
  | { tipo: "trazo"; lapiz: Lapiz; d: string; color: string; grosor: number }
  | { tipo: "arcoiris"; tramos: Array<{ d: string; color: string }>; grosor: number; n: number; ultimo: string }
  | { tipo: "brillos"; puntos: Array<[number, number, number]>; color: string; ux: number; uy: number }
  | { tipo: "sello"; e: string; x: number; y: number; tam: number; linea?: boolean }
  | { tipo: "relleno"; href: string; w: number; h: number };



/** Cómo se ve cada lápiz. */
function estiloDe(lapiz: Lapiz, color: string, g: number) {
  switch (lapiz) {
    case "grafito": return { stroke: color, strokeWidth: Math.max(2, g * 0.3), opacity: 0.85 };
    case "pincel": return { stroke: color, strokeWidth: g * 1.6, opacity: 0.78 };
    case "crayon": return { stroke: color, strokeWidth: g, opacity: 0.9, strokeDasharray: "2.5 1.6", strokeLinecap: "butt" as const };
    case "destacador": return { stroke: color, strokeWidth: g * 2, opacity: 0.38, strokeLinecap: "butt" as const };
    case "borrador": return { stroke: "#FFFFFF", strokeWidth: g * 1.8 };
    default: return { stroke: color, strokeWidth: g };
  }
}

// ---------- Dibujos para pintar o calcar (en una caja de 100 × 100) ----------
const rayos = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2;
  return `M${50 + Math.cos(a) * 27} ${50 + Math.sin(a) * 27} L${50 + Math.cos(a) * 40} ${50 + Math.sin(a) * 40}`;
}).join(" ");
const DIBUJOS: Array<{ id: string; nombre: string; piezas: ReactNode }> = [
  { id: "sol", nombre: "Sol", piezas: <><Circle cx="50" cy="50" r="21" /><Path d={rayos} /><Path d="M41 56 Q50 64 59 56" /><Circle cx="43" cy="46" r="1.6" /><Circle cx="57" cy="46" r="1.6" /></> },
  { id: "flor", nombre: "Flor", piezas: <>{[0, 1, 2, 3, 4, 5].map((i) => <Circle key={i} cx={50 + Math.cos(i * 1.047) * 17} cy={36 + Math.sin(i * 1.047) * 17} r="10.5" />)}<Circle cx="50" cy="36" r="8.5" /><Path d="M50 62 V94 M50 80 Q34 70 30 82 Q42 90 50 80 M50 74 Q66 62 71 74 Q60 84 50 74" /></> },
  { id: "casa", nombre: "Casa", piezas: <><Path d="M12 50 L50 16 L88 50" /><Rect x="22" y="50" width="56" height="40" /><Rect x="43" y="66" width="14" height="24" /><Rect x="27" y="57" width="12" height="12" /><Rect x="61" y="57" width="12" height="12" /><Path d="M64 28 V18 H72 V35" /><Circle cx="54" cy="79" r="1" /></> },
  { id: "pez", nombre: "Pez", piezas: <><Ellipse cx="45" cy="50" rx="29" ry="18" /><Path d="M73 50 L93 33 V67 Z M40 33 Q50 20 58 35 M30 55 Q36 60 42 55 M52 40 Q60 50 52 60" /><Circle cx="30" cy="45" r="3" /></> },
  { id: "mariposa", nombre: "Mariposa", piezas: <><Ellipse cx="50" cy="52" rx="3.6" ry="19" /><Circle cx="31" cy="39" r="17" /><Circle cx="69" cy="39" r="17" /><Circle cx="35" cy="66" r="12" /><Circle cx="65" cy="66" r="12" /><Circle cx="31" cy="39" r="6" /><Circle cx="69" cy="39" r="6" /><Path d="M49 34 Q44 22 38 20 M51 34 Q56 22 62 20" /></> },
  { id: "auto", nombre: "Auto", piezas: <><Path d="M10 68 V54 Q10 50 16 50 H26 L36 34 H64 L76 50 H86 Q92 50 92 56 V68 Z M40 38 H49 V50 H33 Z M53 38 H62 L70 50 H53 Z" /><Circle cx="29" cy="70" r="9" /><Circle cx="72" cy="70" r="9" /><Circle cx="29" cy="70" r="3.5" /><Circle cx="72" cy="70" r="3.5" /></> },
  { id: "gato", nombre: "Gato", piezas: <><Circle cx="50" cy="56" r="27" /><Path d="M27 42 L24 18 L43 31 M73 42 L76 18 L57 31 M47 60 L50 63 L53 60 Z M50 63 Q46 70 41 67 M50 63 Q54 70 59 67 M22 58 H36 M22 64 L36 62 M78 58 H64 M78 64 L64 62" /><Ellipse cx="40" cy="51" rx="3" ry="4.5" /><Ellipse cx="60" cy="51" rx="3" ry="4.5" /></> },
  { id: "estrella", nombre: "Estrella", piezas: <Path d={estrella(50, 52, 40)} /> },
  { id: "corazon", nombre: "Corazón", piezas: <Path d="M50 86 C14 60 10 36 26 24 C38 16 48 24 50 34 C52 24 62 16 74 24 C90 36 86 60 50 86 Z" /> },
  { id: "arbol", nombre: "Árbol", piezas: <><Path d="M44 92 V62 H56 V92 Z M30 92 H70" /><Circle cx="50" cy="36" r="20" /><Circle cx="32" cy="50" r="15" /><Circle cx="68" cy="50" r="15" />{[[42, 30], [60, 40], [34, 52], [66, 54]].map(([x, y]) => <Circle key={`${x}`} cx={x} cy={y} r="3" />)}</> },
  { id: "cohete", nombre: "Cohete", piezas: <><Path d="M50 8 Q70 30 66 70 H34 Q30 30 50 8 Z M34 54 L18 76 H34 M66 54 L82 76 H66 M42 70 L46 90 L50 78 L54 90 L58 70" /><Circle cx="50" cy="38" r="8" /></> },
  { id: "helado", nombre: "Helado", piezas: <><Path d="M32 46 L50 94 L68 46 Z M38 60 L60 66 M43 74 L56 78" /><Circle cx="50" cy="32" r="19" /><Path d="M33 40 Q40 50 50 44 Q60 50 67 40" /><Circle cx="50" cy="11" r="4" /></> },
  { id: "tito", nombre: "Pudú", piezas: <><Ellipse cx="46" cy="60" rx="24" ry="15" /><Circle cx="74" cy="40" r="12" /><Path d="M68 31 L64 19 L73 28 M79 30 L84 19 L83 31 M30 72 V90 M40 74 V90 M54 74 V90 M63 71 V90 M22 56 Q16 52 18 60 M83 44 L88 44" /><Circle cx="77" cy="38" r="1.6" /></> },
];

export default function Pintar() {
  const [cosas, setCosas] = useState<Cosa[]>([]);
  // El trazo que se está haciendo va aparte: así no se redibuja toda la hoja con cada movimiento del dedo.
  const [viva, setViva] = useState<Cosa | null>(null);
  // Mis dibujos: la galería del niño, guardada en el aparato.
  const { activoId } = useJuego();
  const claveGaleria = `dibujos:${activoId ?? "invitado"}`;
  const [galeria, setGaleria] = useState<Array<{ id: number; img: string }>>([]);
  const [viendo, setViendo] = useState<{ id: number; img: string } | null>(null);
  useEffect(() => { void leer<Array<{ id: number; img: string }>>(claveGaleria, []).then(setGaleria); }, [claveGaleria]);
  const [color, setColor] = useState(PALETA[0]!);
  const [grosor, setGrosor] = useState(GROSORES[1]!);
  const [lapiz, setLapiz] = useState<Lapiz>("plumon");
  const [sello, setSello] = useState(SELLOS[0] ?? "sol");
  // Timbres sin color: quedan como dibujo rápido para pintar después.
  const [sinColor, setSinColor] = useState(false);
  const [dibujo, setDibujo] = useState<string | null>(null);
  const [calcar, setCalcar] = useState(false);
  const [eligiendo, setEligiendo] = useState(false);
  const [tam, setTam] = useState({ w: 0, h: 0 });
  const actual = useRef<Cosa | null>(null);
  const mano = useRef({ color, grosor, lapiz, sello, sinColor });
  mano.current = { color, grosor, lapiz, sello, sinColor };

  const cambiar = (c: Cosa) => {
    actual.current = c;
    setViva(c);
  };
  // Con lápiz óptico, apretar más hace el trazo más grueso.
  const conPresion = (presion: number, esLapiz: boolean) => (esLapiz ? Math.max(3, Math.round(mano.current.grosor * (0.4 + presion * 1.2))) : mano.current.grosor);

  const { ref: lienzoRef, props: lienzoProps, estilo: lienzoEstilo } = useSuperficieDibujo({
    empezar: ({ x, y, presion, lapiz: esLapiz }) => {
      if (mano.current.lapiz === "balde") return void volcarBalde(x, y);
      const m = mano.current, p = `${Math.round(x)},${Math.round(y)}`, g = conPresion(presion, esLapiz);
      let nueva: Cosa;
      if (m.lapiz === "sello") { nueva = { tipo: "sello", e: m.sello, x, y, tam: (m.sinColor ? 70 : 40) + m.grosor * (m.sinColor ? 5 : 3.2), linea: m.sinColor && !!TIMBRES[m.sello] }; sonido.toque(); }
      else if (m.lapiz === "arcoiris") nueva = { tipo: "arcoiris", tramos: [{ d: `M${p} L${p}`, color: ARCOIRIS[0]! }], grosor: g, n: 0, ultimo: p };
      else if (m.lapiz === "brillos") nueva = { tipo: "brillos", puntos: [[x, y, 6 + m.grosor * 0.5]], color: m.color, ux: x, uy: y };
      else nueva = { tipo: "trazo", lapiz: m.lapiz, d: `M${p} L${p}`, color: m.color, grosor: g };
      if (nueva.tipo === "sello") return setCosas((t) => [...t, nueva]);
      cambiar(nueva);
    },
    seguir: ({ x, y }) => {
      const c = actual.current;
      if (!c || c.tipo === "sello" || c.tipo === "relleno") return;
      const p = `${Math.round(x)},${Math.round(y)}`;
      if (c.tipo === "trazo") return cambiar({ ...c, d: `${c.d} L${p}` });
      if (c.tipo === "arcoiris") {
        const n = c.n + 1, tramos = c.tramos.slice();
        // Cada pocos puntos empieza un tramo del color siguiente.
        if (n % 4 === 0) tramos.push({ d: `M${c.ultimo} L${p}`, color: ARCOIRIS[(n / 4) % ARCOIRIS.length]! });
        else tramos[tramos.length - 1] = { ...tramos.at(-1)!, d: `${tramos.at(-1)!.d} L${p}` };
        return cambiar({ ...c, tramos, n, ultimo: p });
      }
      const paso = 16 + mano.current.grosor;
      if (Math.hypot(x - c.ux, y - c.uy) < paso) return;
      const k = c.puntos.length;
      cambiar({ ...c, puntos: [...c.puntos, [x + Math.sin(k * 2.4) * 9, y + Math.cos(k * 1.7) * 9, (5 + mano.current.grosor * 0.45) * (0.6 + ((k * 37) % 10) / 12)]], ux: x, uy: y });
    },
    terminar: () => {
      const c = actual.current;
      actual.current = null;
      if (c) setCosas((t) => [...t, c]);
      setViva(null);
    },
  });

  // El balde: llena de color la zona cerrada que se tocó.
  const llenando = useRef(false);
  const tamRef = useRef(tam);
  tamRef.current = tam;
  async function volcarBalde(x: number, y: number) {
    const svg = (lienzoRef.current as unknown as HTMLElement | null)?.querySelector?.("svg") as SVGSVGElement | null;
    const { w, h } = tamRef.current;
    if (!svg || !w || llenando.current) return;
    llenando.current = true;
    const href = await rellenar(svg, w, h, x, y, mano.current.color);
    llenando.current = false;
    if (!href) return void hablar("Aquí no pude pintar. Prueba en otra parte.");
    sonido.paso(6);
    setCosas((t) => [...t, { tipo: "relleno", href, w, h }]);
  }

  async function guardarDibujo() {
    const svg = (lienzoRef.current as unknown as HTMLElement | null)?.querySelector?.("svg") as SVGSVGElement | null;
    if (Platform.OS !== "web" || !svg || !tam.w) return;
    if (!cosas.length) return void hablar("Primero dibuja algo y después lo guardamos.");
    const foto = await fotoDeHoja(svg, tam.w, tam.h);
    if (!foto) return;
    // Se guardan los 12 más nuevos, en tamaño liviano.
    const nueva = [{ id: Date.now(), img: foto.toDataURL("image/jpeg", 0.8) }, ...galeria].slice(0, 12);
    if (!(await guardar(claveGaleria, nueva))) return void hablar("No queda espacio para guardar. Borra un dibujo antiguo.");
    setGaleria(nueva);
    sonido.fiesta();
    void hablar("¡Guardado en tu galería! Qué lindo te quedó.");
  }
  function borrarDibujo(id: number) {
    const nueva = galeria.filter((d) => d.id !== id);
    setGaleria(nueva);
    void guardar(claveGaleria, nueva);
    setViendo(null);
  }
  function seguirPintando(d: { img: string }) {
    setDibujo(null);
    setCalcar(false);
    setCosas([{ tipo: "relleno", href: d.img, w: tam.w, h: tam.h }]);
    setViendo(null);
    setEligiendo(false);
    void hablar("¡Sigamos con este dibujo!");
  }

  const elegirLapiz = (l: (typeof LAPICES)[number]) => { setLapiz(l.id); void hablar(l.dice); };
  function hojaNueva() {
    if (cosas.length) void hablar("¡Hoja nueva! ¿Qué dibujamos ahora?");
    setCosas([]);
  }
  function elegirDibujo(id: string | null, paraCalcar: boolean) {
    setDibujo(id);
    setCalcar(paraCalcar);
    setEligiendo(false);
    setCosas([]);
    const d = DIBUJOS.find((x) => x.id === id);
    void hablar(!d ? "Hoja en blanco. ¡Dibuja lo que tú quieras!" : paraCalcar ? `Sigue las líneas para dibujar ${d.nombre.toLowerCase()}.` : `¡A pintar ${d.nombre.toLowerCase()}! Elige tus colores.`);
  }

  // El dibujo se centra en la hoja, lo más grande que quepa.
  const lado = Math.min(tam.w, tam.h) * 0.92, ox = (tam.w - lado) / 2, oy = (tam.h - lado) / 2;
  const plantilla = useMemo(() => DIBUJOS.find((d) => d.id === dibujo)?.piezas, [dibujo]);
  const lineas = plantilla && lado > 0 && (
    <G transform={`translate(${ox} ${oy}) scale(${lado / 100})`} fill="none" stroke={calcar ? "#B0BEC5" : "#263238"} strokeWidth={calcar ? 1.3 : 1.25} strokeDasharray={calcar ? "0.4 3.2" : undefined} strokeLinecap="round" strokeLinejoin="round">
      {plantilla}
    </G>
  );
  const capa = useMemo(() => cosas.map(pintarCosa), [cosas]);
  const muestra = lapiz === "borrador" ? "#BDBDBD" : color;

  return (
    <Pantalla color={COLORES.pintar}>
      <View style={estilos.mesa}>
        {/* Los lápices */}
        <ScrollView style={estilos.columna} contentContainerStyle={estilos.columnaDentro} showsVerticalScrollIndicator={false}>
          {LAPICES.map((l) => (
            <Rebote key={l.id} accessibilityLabel={l.nombre} onPress={() => elegirLapiz(l)} style={[estilos.lapiz, l.id === lapiz && estilos.elegido]}>
              <MuestraLapiz lapiz={l.id} color={color} sello={sello} />
              <Text style={estilos.lapizNombre}>{l.nombre}</Text>
            </Rebote>
          ))}
        </ScrollView>

        {/* La hoja */}
        <View ref={lienzoRef} style={[estilos.lienzo, lienzoEstilo]} accessibilityLabel="Lienzo para pintar" {...lienzoProps}
          onLayout={(e: LayoutChangeEvent) => { setTam({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height }); (lienzoProps as { onLayout?: (ev: LayoutChangeEvent) => void }).onLayout?.(e); }}>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Svg width="100%" height="100%">
              {calcar && lineas}
              {capa}
              {viva && pintarCosa(viva, -1)}
              {/* Para pintar, las líneas van encima: el color nunca las tapa. */}
              {!calcar && lineas}
            </Svg>
          </View>
        </View>

        {/* Grosor, deshacer, hoja nueva y dibujos */}
        <ScrollView style={estilos.columna} contentContainerStyle={estilos.columnaDentro} showsVerticalScrollIndicator={false}>
            {GROSORES.map((g) => (
              <Rebote key={g} accessibilityLabel={`Grosor ${g}`} onPress={() => setGrosor(g)} style={[estilos.boton, g === grosor && estilos.elegido]}>
                <View style={{ width: g + 4, height: g + 4, borderRadius: g, backgroundColor: muestra, borderWidth: 1, borderColor: "#B0BEC5" }} />
              </Rebote>
            ))}
            <Rebote onPress={() => setCosas((t) => t.slice(0, -1))} style={estilos.boton} accessibilityLabel="Deshacer"><Icono e="⬅️" tam={34} sinSombra /></Rebote>
            <Rebote onPress={hojaNueva} style={estilos.boton} accessibilityLabel="Hoja nueva"><Text style={estilos.icono}>📄</Text></Rebote>
            {Platform.OS === "web" && <Rebote mudo onPress={() => void guardarDibujo()} style={[estilos.boton, { backgroundColor: "#C8E6C9" }]} accessibilityLabel="Guardar dibujo"><Text style={estilos.icono}>💾</Text></Rebote>}
            <Rebote onPress={() => { setEligiendo(true); void hablar("¿Qué dibujo quieres? Puedes pintarlo o calcarlo."); }} style={[estilos.boton, estilos.dibujos]} accessibilityLabel="Elegir dibujo">
              <Svg width={36} height={36} viewBox="0 0 100 100" fill="none" stroke="#3B2F5C" strokeWidth="6" strokeLinejoin="round">{DIBUJOS[1]!.piezas}</Svg>
            </Rebote>
        </ScrollView>
      </View>

      {/* Colores (o sellos) */}
      <ScrollView horizontal style={estilos.paleta} contentContainerStyle={estilos.paletaDentro} showsHorizontalScrollIndicator={false}>
        {lapiz === "sello"
          ? [
            <Rebote key="modo" accessibilityLabel={sinColor ? "Timbres con color" : "Timbres para pintar"} style={estilos.modoSello}
              onPress={() => { setSinColor(!sinColor); if (!sinColor && !TIMBRES[sello]) setSello("sol"); void hablar(sinColor ? "Timbres con color." : "Timbres sin color: estampa el dibujo y después píntalo tú."); }}>
              <Svg width={34} height={34} viewBox="0 0 38 38">{timbre("estrella", 19, 19, 34, !sinColor)}</Svg>
              <Text style={estilos.lapizNombre}>{sinColor ? "Con color" : "Para pintar"}</Text>
            </Rebote>,
            ...SELLOS.filter((e) => !sinColor || TIMBRES[e]).map((e) => (
              <Rebote key={e} accessibilityLabel={`Sello ${e}`} onPress={() => setSello(e)} style={[estilos.color, estilos.selloBoton, e === sello && estilos.elegido]}><Svg width={38} height={38} viewBox="0 0 38 38">{timbre(e, 19, 19, 34, sinColor)}</Svg></Rebote>
            )),
          ]
          : lapiz === "arcoiris"
            ? <View style={estilos.arcoiris}>{ARCOIRIS.map((c) => <View key={c} style={{ flex: 1, backgroundColor: c }} />)}</View>
            : PALETA.map((c) => (
              <Rebote key={c} mudo accessibilityLabel={`Color ${c}`} onPress={() => { setColor(c); if (lapiz === "borrador") setLapiz("plumon"); }} style={[estilos.color, { backgroundColor: c }, c === color && lapiz !== "borrador" && estilos.elegido]}><View /></Rebote>
            ))}
      </ScrollView>

      {/* Elegir un dibujo para pintar o calcar */}
      {eligiendo && (
        <View style={estilos.velo}>
          <View style={estilos.panel}>
            <Text style={estilos.titulo}>¿Qué quieres dibujar?</Text>
            <ScrollView contentContainerStyle={estilos.grilla}>
              {!!galeria.length && (
                <View style={estilos.galeria}>
                  <Text style={estilos.tarjetaNombre}>Mis dibujos</Text>
                  <ScrollView horizontal contentContainerStyle={{ gap: 10, padding: 4 }}>
                    {galeria.map((d) => (
                      <Rebote key={d.id} onPress={() => setViendo(d)} accessibilityLabel="Ver mi dibujo" style={estilos.cuadro}>
                        <Image source={{ uri: d.img }} style={estilos.miniatura} resizeMode="cover" />
                      </Rebote>
                    ))}
                  </ScrollView>
                </View>
              )}
              <Rebote style={estilos.tarjeta} onPress={() => elegirDibujo(null, false)} accessibilityLabel="Hoja en blanco">
                <View style={estilos.blanca} />
                <Text style={estilos.tarjetaNombre}>Hoja en blanco</Text>
              </Rebote>
              {DIBUJOS.map((d) => (
                <View key={d.id} style={estilos.tarjeta}>
                  <Svg width={84} height={84} viewBox="0 0 100 100" fill="none" stroke="#263238" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{d.piezas}</Svg>
                  <Text style={estilos.tarjetaNombre}>{d.nombre}</Text>
                  <View style={estilos.modos}>
                    <Rebote style={[estilos.modo, { backgroundColor: "#F48FB1" }]} onPress={() => elegirDibujo(d.id, false)} accessibilityLabel={`Pintar ${d.nombre}`}><Text style={estilos.modoTexto}>Pintar</Text></Rebote>
                    <Rebote style={[estilos.modo, { backgroundColor: "#81D4FA" }]} onPress={() => elegirDibujo(d.id, true)} accessibilityLabel={`Calcar ${d.nombre}`}><Text style={estilos.modoTexto}>Calcar</Text></Rebote>
                  </View>
                </View>
              ))}
            </ScrollView>
            <Rebote style={estilos.cerrar} onPress={() => setEligiendo(false)} accessibilityLabel="Cerrar"><Text style={estilos.modoTexto}>Volver a mi hoja</Text></Rebote>
          </View>
        </View>
      )}
      {/* Un dibujo de la galería, en grande */}
      {viendo && (
        <View style={[estilos.velo, { zIndex: 50 }]}>
          <View style={estilos.panel}>
            <Image source={{ uri: viendo.img }} style={estilos.grande} resizeMode="contain" />
            <View style={estilos.modos}>
              <Rebote style={[estilos.modo, { backgroundColor: "#C8E6C9" }]} onPress={() => seguirPintando(viendo)} accessibilityLabel="Seguir pintando"><Text style={estilos.modoTexto}>Seguir pintando</Text></Rebote>
              <Rebote style={[estilos.modo, { backgroundColor: "#FFCDD2" }]} onPress={() => borrarDibujo(viendo.id)} accessibilityLabel="Borrar dibujo"><Text style={estilos.modoTexto}>Borrar</Text></Rebote>
              <Rebote style={[estilos.modo, { backgroundColor: "#fff" }]} onPress={() => setViendo(null)} accessibilityLabel="Cerrar dibujo"><Text style={estilos.modoTexto}>Cerrar</Text></Rebote>
            </View>
          </View>
        </View>
      )}
    </Pantalla>
  );
}

function pintarCosa(c: Cosa, i: number) {
  if (c.tipo === "trazo") return <Path key={i} d={c.d} strokeLinecap="round" strokeLinejoin="round" fill="none" {...estiloDe(c.lapiz, c.color, c.grosor)} />;
  if (c.tipo === "arcoiris") return <G key={i}>{c.tramos.map((t, k) => <Path key={k} d={t.d} stroke={t.color} strokeWidth={c.grosor} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}</G>;
  if (c.tipo === "brillos") return <G key={i}>{c.puntos.map(([x, y, r], k) => <Path key={k} d={estrella(x, y, r)} fill={k % 3 === 2 ? "#FFF59D" : c.color} stroke="#FFFFFF" strokeWidth="1" />)}</G>;
  if (c.tipo === "relleno") return <ImagenSvg key={i} href={c.href} x={0} y={0} width={c.w} height={c.h} preserveAspectRatio="none" />;
  return <G key={i}>{timbre(c.e, c.x, c.y, c.tam, c.linea)}</G>;
}

/** Una rayita de muestra hecha con cada lápiz, para reconocerlo sin leer. */
function MuestraLapiz({ lapiz, color, sello }: { lapiz: Lapiz; color: string; sello: string }) {
  const d = "M6 22 Q16 4 26 16 T46 10";
  return (
    <Svg width={52} height={30} viewBox="0 0 52 30">
      {lapiz === "arcoiris" ? ARCOIRIS.map((c, i) => <Path key={c} d={`M${6 + i * 5.8} ${20 - Math.sin(i * 0.9) * 8} l6 ${-Math.cos(i * 0.9) * 5}`} stroke={c} strokeWidth="7" strokeLinecap="round" />)
        : lapiz === "brillos" ? [[10, 18, 6], [24, 9, 8], [38, 19, 6], [46, 8, 4]].map(([x, y, r]) => <Path key={x} d={estrella(x!, y!, r!)} fill={x === 24 ? "#FFF59D" : color} stroke="#F9A825" strokeWidth="0.8" />)
          : lapiz === "sello" ? timbre(sello, 26, 15, 28)
            : lapiz === "balde" ? <><Path d="M14 10 L38 10 L34 26 L18 26 Z" fill="#B0BEC5" stroke="#607D8B" strokeWidth="1.5" strokeLinejoin="round" /><Path d="M14 10 Q26 -2 38 10" fill="none" stroke="#607D8B" strokeWidth="1.8" /><Path d="M15 12 L37 12 L36 16 Q26 21 16 16 Z" fill={color === "#FFFFFF" ? "#90A4AE" : color} /><Path d="M40 16 q5 7 0 9 q-5 -2 0 -9 Z" fill={color === "#FFFFFF" ? "#90A4AE" : color} /></>
            : lapiz === "borrador" ? <><Rect x="12" y="8" width="28" height="15" rx="4" fill="#F48FB1" /><Rect x="12" y="8" width="10" height="15" rx="4" fill="#90CAF9" /></>
              : <Path d={d} fill="none" strokeLinecap="round" {...estiloDe(lapiz, color === "#FFFFFF" ? "#90A4AE" : color, lapiz === "grafito" ? 8 : lapiz === "destacador" ? 5 : lapiz === "pincel" ? 6 : 7)} />}
    </Svg>
  );
}

const estilos = StyleSheet.create({
  mesa: { flex: 1, width: "100%", flexDirection: "row", gap: 8 },
  columna: { flexGrow: 0, width: 76 },
  columnaDentro: { gap: 6, alignItems: "center", paddingVertical: 2 },
  lapiz: { width: 72, height: 56, borderRadius: 16, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "transparent" },
  lapizNombre: { fontSize: 11, fontWeight: "800", color: "#3B2F5C", marginTop: -2 },
  lienzo: { flex: 1, backgroundColor: "#fff", borderRadius: 24, overflow: "hidden", borderWidth: 4, borderColor: "#FFFFFF", boxShadow: "0 6px 0 rgba(59,47,92,0.18)" },
  boton: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "transparent" },
  dibujos: { backgroundColor: "#FFF59D" },
  elegido: { borderWidth: 4, borderColor: COLORES.texto },
  icono: { fontSize: 28 },
  paleta: { flexGrow: 0, width: "100%", marginTop: 8 },
  paletaDentro: { gap: 8, paddingHorizontal: 6, paddingVertical: 6, alignItems: "center" },
  color: { width: 50, height: 50, borderRadius: 25, borderWidth: 3, borderColor: "rgba(59,47,92,0.18)" },
  modoSello: { height: 54, paddingHorizontal: 10, borderRadius: 18, backgroundColor: "#FFF59D", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#FBC02D" },
  selloBoton: { backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  arcoiris: { flexDirection: "row", width: 360, height: 44, borderRadius: 22, overflow: "hidden", borderWidth: 3, borderColor: "#fff" },
  velo: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(28,20,56,0.45)", alignItems: "center", justifyContent: "center", zIndex: 40, padding: 16 },
  panel: { backgroundColor: "#FFF8E1", borderRadius: 28, padding: 16, maxWidth: 820, maxHeight: "92%", alignItems: "center", gap: 10, borderWidth: 5, borderColor: "#fff" },
  titulo: { fontSize: 24, fontWeight: "900", color: "#3B2F5C" },
  grilla: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
  tarjeta: { width: 136, borderRadius: 20, backgroundColor: "#fff", alignItems: "center", padding: 8, gap: 4, borderWidth: 3, borderColor: "#FFE0B2" },
  blanca: { width: 70, height: 84, backgroundColor: "#fff", borderWidth: 3, borderColor: "#B0BEC5", borderRadius: 8 },
  tarjetaNombre: { fontSize: 15, fontWeight: "800", color: "#3B2F5C" },
  modos: { flexDirection: "row", gap: 6 },
  modo: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 },
  modoTexto: { fontSize: 14, fontWeight: "900", color: "#3B2F5C" },
  galeria: { width: "100%", alignItems: "center", backgroundColor: "#fff", borderRadius: 20, padding: 8, borderWidth: 3, borderColor: "#C8E6C9" },
  cuadro: { borderRadius: 12, borderWidth: 4, borderColor: "#D7A86E", overflow: "hidden" },
  miniatura: { width: 132, height: 84, backgroundColor: "#fff" },
  grande: { width: 640, maxWidth: "100%", height: 380, backgroundColor: "#fff", borderRadius: 16 },
  cerrar: { backgroundColor: "#fff", borderRadius: 18, paddingHorizontal: 18, paddingVertical: 10 },
});
