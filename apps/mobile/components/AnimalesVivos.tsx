import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Polygon, Rect } from "react-native-svg";
import { angulo, onda, Pieza, useCiclo, useParpadeo } from "./Articulados";

/**
 * Animales "vivos" (no stickers): cada uno tiene patas que dan pasos, cabeza,
 * orejas, cola y ojos que pestañean, y su propia forma de moverse (la gallina
 * picotea, el conejo salta, el pato flota, el gato mueve la cola, la mariposa
 * aletea). Todos miran a la IZQUIERDA, como Tito; para que miren a la derecha
 * se voltean con scaleX: -1.
 */
export type AnimalId = "vaca" | "oveja" | "caballo" | "cerdo" | "gato" | "gallina" | "pato" | "conejo" | "mariposa" | "pajaro";

interface Props {
  alto?: number;
  caminando?: boolean;
  /** Contento: salta y mueve la cola (por ejemplo, después de comer). */
  contento?: boolean;
  /** Solo el pato: flotando en el agua. */
  nadando?: boolean;
}

/** Ojo que pestañea, ubicado en coordenadas del dibujo (dentro de una pieza o del cuerpo). */
function Ojo({ s, x, y, r = 2.6, origen, color = "#2B2118", claro = false }: { s: number; x: number; y: number; r?: number; origen: { x: number; y: number }; color?: string; claro?: boolean }) {
  const parpadeo = useParpadeo(2600 + Math.random() * 1200);
  const t = r * 2 + 2;
  return (
    <Animated.View pointerEvents="none" style={{ position: "absolute", left: (x - t / 2 - origen.x) * s, top: (y - t / 2 - origen.y) * s, width: t * s, height: t * s, transform: [{ scaleY: parpadeo as never }] }}>
      <Svg width={t * s} height={t * s} viewBox={`${x - t / 2} ${y - t / 2} ${t} ${t}`}>
        {claro && <Circle cx={x} cy={y} r={r + 0.9} fill="#fff" />}
        <Circle cx={x} cy={y} r={r} fill={color} />
        <Circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="#fff" />
      </Svg>
    </Animated.View>
  );
}

/** Cabeza que gira desde el cuello, con su dibujo y su ojo. */
function Cabeza({ s, px, py, w, h, rot, children, ojo }: { s: number; px: number; py: number; w: number; h: number; rot: Animated.AnimatedInterpolation<string | number>; children: ReactNode; ojo: { x: number; y: number; r?: number; claro?: boolean; color?: string } }) {
  const ox = px - w / 2, oy = py - h / 2;
  return (
    <Animated.View pointerEvents="none" style={{ position: "absolute", left: ox * s, top: oy * s, width: w * s, height: h * s, transform: [{ rotate: rot as never }] }}>
      <Svg width={w * s} height={h * s} viewBox={`${ox} ${oy} ${w} ${h}`}>{children}</Svg>
      <Ojo s={s} x={ojo.x} y={ojo.y} r={ojo.r} claro={ojo.claro} color={ojo.color} origen={{ x: ox, y: oy }} />
    </Animated.View>
  );
}

// ---------- Cuadrúpedos (vaca, oveja, caballo, cerdo, gato) ----------

interface Cuadrupedo {
  ancho: number;
  altoLienzo: number;
  /** Patas: x de cada una (2 adelante, 2 atrás), dónde empiezan, largo y grosor. */
  patas: { xs: [number, number, number, number]; y: number; largo: number; grosor: number; color: string; colorAtras: string; pezuna?: string };
  cuerpo: ReactNode;
  cabeza: { px: number; py: number; w: number; h: number; dibujo: ReactNode; ojo: { x: number; y: number; r?: number; claro?: boolean; color?: string } };
  cola: { px: number; py: number; w: number; h: number; dibujo: ReactNode };
  /** Cuánto se mueve la cola quieto y contento. */
  colaCalma?: number;
}

function Cuadrupedo({ d, alto, caminando, contento }: { d: Cuadrupedo; alto: number; caminando: boolean; contento: boolean }) {
  const s = alto / d.altoLienzo;
  const paso = useCiclo(520, caminando);
  const calma = useCiclo(2400 + Math.random() * 800);
  const rapido = useCiclo(300, contento);
  const pasta = useCiclo(5200, !caminando && !contento);
  const bote = caminando ? onda(paso, 1.6 * s, 0, true) : contento ? onda(rapido, 6 * s, 0, true) : onda(calma, 0.5 * s);
  const pata = (fase: number) => angulo(0, caminando ? onda(paso, 20, fase) : undefined);
  // Quieto, de vez en cuando baja la cabeza (como si oliera o pastara).
  const cabeza = caminando ? angulo(0, onda(paso, 4, Math.PI / 2)) : contento ? angulo(0, onda(rapido, 6)) : angulo(0, pasta.interpolate({ inputRange: [0, 0.55, 0.65, 0.85, 0.95, 1], outputRange: [0, 0, -14, -14, 0, 0] }) as never);
  const cola = angulo(0, contento || caminando ? onda(rapido, 22) : onda(calma, d.colaCalma ?? 10));
  const { patas: p } = d;
  const Pata = ({ x, color, fase }: { x: number; color: string; fase: number }) => (
    <Pieza s={s} px={x} py={p.y} w={p.grosor * 3 + 8} h={p.largo * 2 + 6} rot={pata(fase)}>
      <Rect x={x - p.grosor / 2} y={p.y - 2} width={p.grosor} height={p.largo + 2} rx={p.grosor / 2.4} fill={color} />
      {p.pezuna && <Rect x={x - p.grosor / 2} y={p.y + p.largo - 4} width={p.grosor} height={5} rx={1.5} fill={p.pezuna} />}
    </Pieza>
  );
  return (
    <Animated.View pointerEvents="none" style={{ width: d.ancho * s, height: d.altoLienzo * s, transform: [{ translateY: bote as never }] }}>
      <Pata x={p.xs[1]} color={p.colorAtras} fase={Math.PI} />
      <Pata x={p.xs[3]} color={p.colorAtras} fase={0} />
      <Pieza s={s} px={d.cola.px} py={d.cola.py} w={d.cola.w} h={d.cola.h} rot={cola}>{d.cola.dibujo}</Pieza>
      <Svg width={d.ancho * s} height={d.altoLienzo * s} viewBox={`0 0 ${d.ancho} ${d.altoLienzo}`} style={{ position: "absolute" }}>{d.cuerpo}</Svg>
      <Pata x={p.xs[0]} color={p.color} fase={0} />
      <Pata x={p.xs[2]} color={p.color} fase={Math.PI} />
      <Cabeza s={s} px={d.cabeza.px} py={d.cabeza.py} w={d.cabeza.w} h={d.cabeza.h} rot={cabeza} ojo={d.cabeza.ojo}>{d.cabeza.dibujo}</Cabeza>
    </Animated.View>
  );
}

const VACA: Cuadrupedo = {
  ancho: 120, altoLienzo: 90,
  patas: { xs: [40, 50, 82, 92], y: 62, largo: 22, grosor: 8, color: "#FAFAFA", colorAtras: "#E0E0E0", pezuna: "#3E2723" },
  cuerpo: (
    <G>
      <Ellipse cx="66" cy="50" rx="36" ry="20" fill="#FAFAFA" />
      <Ellipse cx="54" cy="44" rx="9" ry="7" fill="#263238" />
      <Ellipse cx="82" cy="55" rx="10" ry="6" fill="#263238" />
      <Ellipse cx="74" cy="37" rx="6" ry="4" fill="#263238" />
      <Ellipse cx="76" cy="68" rx="7" ry="4" fill="#F8BBD0" />
      <Ellipse cx="66" cy="60" rx="28" ry="7" fill="#000" opacity="0.05" />
    </G>
  ),
  cabeza: {
    px: 38, py: 44, w: 60, h: 50,
    dibujo: (
      <G>
        <Path d="M30 34 Q27 26 31 24" stroke="#BCAAA4" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Path d="M22 34 Q18 27 21 24" stroke="#BCAAA4" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Ellipse cx="36" cy="40" rx="7" ry="3.2" fill="#FAFAFA" transform="rotate(-20 36 40)" />
        <Ellipse cx="23" cy="44" rx="13" ry="11" fill="#FAFAFA" />
        <Ellipse cx="28" cy="39" rx="6" ry="5" fill="#263238" />
        <Ellipse cx="13" cy="51" rx="8" ry="6" fill="#F8BBD0" />
        <Circle cx="10" cy="50" r="1.3" fill="#AD1457" />
        <Circle cx="15" cy="51" r="1.3" fill="#AD1457" />
      </G>
    ),
    ojo: { x: 20, y: 41, r: 2.4 },
  },
  cola: { px: 100, py: 42, w: 30, h: 60, dibujo: <G><Path d="M100 42 Q108 54 104 66" stroke="#FAFAFA" strokeWidth="3" fill="none" strokeLinecap="round" /><Ellipse cx="104" cy="68" rx="3.2" ry="5" fill="#263238" /></G> },
};

const OVEJA: Cuadrupedo = {
  ancho: 110, altoLienzo: 85,
  patas: { xs: [42, 52, 74, 84], y: 58, largo: 22, grosor: 6, color: "#424242", colorAtras: "#303030" },
  cuerpo: (
    <G fill="#F5F5F5">
      <Ellipse cx="63" cy="46" rx="30" ry="18" />
      {[[40, 40, 11], [52, 32, 12], [66, 30, 12], [80, 34, 11], [90, 46, 10], [82, 58, 11], [66, 62, 11], [50, 58, 11], [38, 50, 10]].map(([x, y, r]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
      ))}
      <Circle cx="60" cy="40" r="7" fill="#fff" />
      <Circle cx="76" cy="44" r="6" fill="#fff" />
    </G>
  ),
  cabeza: {
    px: 36, py: 42, w: 50, h: 46,
    dibujo: (
      <G>
        <Ellipse cx="33" cy="40" rx="6" ry="3" fill="#424242" transform="rotate(25 33 40)" />
        <Ellipse cx="23" cy="45" rx="11" ry="10" fill="#424242" />
        <Circle cx="24" cy="35" r="5" fill="#F5F5F5" />
        <Circle cx="30" cy="37" r="4.5" fill="#F5F5F5" />
        <Ellipse cx="15" cy="50" rx="4" ry="3" fill="#5D5D5D" />
      </G>
    ),
    ojo: { x: 19, y: 43, r: 2.2, claro: true },
  },
  cola: { px: 92, py: 44, w: 24, h: 24, dibujo: <Circle cx="96" cy="44" r="6" fill="#F5F5F5" /> },
  colaCalma: 14,
};

const CABALLO: Cuadrupedo = {
  ancho: 120, altoLienzo: 100,
  patas: { xs: [42, 52, 84, 94], y: 58, largo: 34, grosor: 7, color: "#8D5524", colorAtras: "#6D4019", pezuna: "#2B1B10" },
  cuerpo: (
    <G>
      <Ellipse cx="68" cy="50" rx="34" ry="16" fill="#8D5524" />
      <Ellipse cx="66" cy="58" rx="24" ry="5" fill="#A1673F" opacity="0.6" />
      <Path d="M42 44 Q36 30 32 20 L40 18 Q44 30 50 40 Z" fill="#8D5524" />
    </G>
  ),
  cabeza: {
    px: 36, py: 22, w: 60, h: 50,
    dibujo: (
      <G>
        <Path d="M36 10 Q44 14 44 30 Q40 22 34 18 Z" fill="#3E2723" />
        <Path d="M28 9 L30 2 L33 9 Z" fill="#6D4019" />
        <Path d="M36 14 Q30 10 22 14 Q10 20 12 28 Q14 34 22 32 Q32 28 38 22 Z" fill="#8D5524" />
        <Ellipse cx="14" cy="29" rx="6" ry="5" fill="#5D3A1A" />
        <Circle cx="11" cy="28" r="1.2" fill="#2B1B10" />
        <Path d="M24 13 Q30 8 36 12" stroke="#3E2723" strokeWidth="3" fill="none" strokeLinecap="round" />
      </G>
    ),
    ojo: { x: 24, y: 19, r: 2.2 },
  },
  cola: { px: 100, py: 44, w: 36, h: 70, dibujo: <Path d="M100 44 Q114 50 110 74 Q104 62 100 50 Z" fill="#3E2723" /> },
};

const CERDO: Cuadrupedo = {
  ancho: 110, altoLienzo: 80,
  patas: { xs: [42, 52, 74, 84], y: 62, largo: 14, grosor: 8, color: "#F48FB1", colorAtras: "#EC7EA5", pezuna: "#C2185B" },
  cuerpo: (
    <G>
      <Ellipse cx="63" cy="50" rx="32" ry="20" fill="#F8BBD0" />
      <Ellipse cx="63" cy="60" rx="24" ry="7" fill="#FCE4EC" opacity="0.8" />
      <Circle cx="72" cy="42" r="3" fill="#F48FB1" opacity="0.5" />
    </G>
  ),
  cabeza: {
    px: 36, py: 48, w: 50, h: 44,
    dibujo: (
      <G>
        <Polygon points="28,36 36,30 34,42" fill="#F48FB1" />
        <Circle cx="24" cy="49" r="13" fill="#F8BBD0" />
        <Ellipse cx="11" cy="51" rx="6" ry="7" fill="#F48FB1" />
        <Ellipse cx="10" cy="49" rx="1.3" ry="2" fill="#AD1457" />
        <Ellipse cx="13" cy="54" rx="1.3" ry="2" fill="#AD1457" />
        <Circle cx="28" cy="55" r="3" fill="#F06292" opacity="0.35" />
      </G>
    ),
    ojo: { x: 22, y: 45, r: 2.2 },
  },
  cola: { px: 94, py: 46, w: 24, h: 24, dibujo: <Path d="M94 46 Q102 40 100 48 Q96 54 102 52" stroke="#F48FB1" strokeWidth="2.5" fill="none" strokeLinecap="round" /> },
  colaCalma: 18,
};

const GATO: Cuadrupedo = {
  ancho: 110, altoLienzo: 80,
  patas: { xs: [44, 52, 76, 84], y: 60, largo: 18, grosor: 6, color: "#FFA726", colorAtras: "#F57C00" },
  cuerpo: (
    <G>
      <Ellipse cx="64" cy="52" rx="27" ry="12" fill="#FFA726" />
      {[54, 64, 74].map((x) => <Path key={x} d={`M${x} 41 Q${x + 2} 46 ${x} 50`} stroke="#E65100" strokeWidth="2.5" fill="none" strokeLinecap="round" />)}
      <Ellipse cx="62" cy="59" rx="18" ry="4" fill="#FFE0B2" opacity="0.8" />
    </G>
  ),
  cabeza: {
    px: 40, py: 48, w: 50, h: 46,
    dibujo: (
      <G>
        <Polygon points="22,36 26,24 32,35" fill="#FFA726" />
        <Polygon points="31,35 38,26 39,38" fill="#FFA726" />
        <Polygon points="25,34 27,28 30,34" fill="#FFCCBC" />
        <Circle cx="29" cy="46" r="12" fill="#FFA726" />
        <Ellipse cx="22" cy="51" rx="6" ry="4.5" fill="#FFE0B2" />
        <Path d="M20 49 L22 50 L20 51 Z" fill="#E91E63" />
        <Path d="M18 51 L8 49 M18 53 L8 54" stroke="#5D4037" strokeWidth="0.8" />
        <Path d="M29 38 Q31 41 29 43" stroke="#E65100" strokeWidth="2" fill="none" />
      </G>
    ),
    ojo: { x: 24, y: 44, r: 2.3, color: "#33691E" },
  },
  cola: { px: 90, py: 50, w: 46, h: 60, dibujo: <Path d="M90 50 Q106 44 104 26 Q103 20 98 22" stroke="#FFA726" strokeWidth="6" fill="none" strokeLinecap="round" /> },
  colaCalma: 16,
};

// ---------- Aves y otros ----------

function Gallina({ alto, caminando, contento }: Required<Pick<Props, "alto">> & Props) {
  const s = alto / 80;
  const paso = useCiclo(380, !!caminando);
  const pico = useCiclo(2600);
  const ala = useCiclo(220, !!contento);
  const bote = caminando ? onda(paso, 1.5 * s, 0, true) : contento ? onda(ala, 5 * s, 0, true) : new Animated.Value(0);
  // Picotea: baja la cabeza rápido dos veces y vuelve.
  const cabeza = caminando ? angulo(0, onda(paso, 8)) : angulo(0, pico.interpolate({ inputRange: [0, 0.6, 0.66, 0.72, 0.78, 0.84, 1], outputRange: [0, 0, 38, 0, 38, 0, 0] }) as never);
  const pata = (f: number) => angulo(0, caminando ? onda(paso, 26, f) : undefined);
  return (
    <Animated.View pointerEvents="none" style={{ width: 80 * s, height: 80 * s, transform: [{ translateY: bote as never }] }}>
      {[{ x: 38, f: 0, c: "#FB8C00" }, { x: 48, f: Math.PI, c: "#EF6C00" }].map((l) => (
        <Pieza key={l.x} s={s} px={l.x} py={58} w={24} h={40} rot={pata(l.f)}>
          <Path d={`M${l.x} 56 L${l.x} 74 M${l.x} 74 L${l.x - 6} 76 M${l.x} 74 L${l.x + 3} 77`} stroke={l.c} strokeWidth="2.6" strokeLinecap="round" />
        </Pieza>
      ))}
      <Svg width={80 * s} height={80 * s} viewBox="0 0 80 80" style={{ position: "absolute" }}>
        <Path d="M58 40 Q72 22 66 46 Q74 30 70 52 Z" fill="#8D6E63" />
        <Ellipse cx="44" cy="46" rx="20" ry="15" fill="#D7A26A" />
        <Ellipse cx="42" cy="54" rx="13" ry="5" fill="#E6BE8A" opacity="0.8" />
      </Svg>
      <Pieza s={s} px={46} py={40} w={36} h={30} rot={angulo(0, contento ? onda(ala, 28) : undefined)}>
        <Ellipse cx="50" cy="45" rx="12" ry="7.5" fill="#B9844A" />
        <Path d="M42 45 Q50 50 60 46" stroke="#8D6E63" strokeWidth="1.4" fill="none" />
      </Pieza>
      <Cabeza s={s} px={32} py={38} w={40} h={40} rot={cabeza} ojo={{ x: 23, y: 25, r: 1.9 }}>
        <Path d="M30 38 Q26 30 26 24" stroke="#D7A26A" strokeWidth="9" strokeLinecap="round" fill="none" />
        <Circle cx="25" cy="25" r="8" fill="#D7A26A" />
        {[[22, 16, 3], [26, 15, 3.4], [30, 17, 3]].map(([x, y, r]) => <Circle key={x} cx={x} cy={y} r={r} fill="#E53935" />)}
        <Polygon points="17,24 10,26.5 17,29" fill="#FFB300" />
        <Ellipse cx="18" cy="32" rx="2.2" ry="3.4" fill="#E53935" />
      </Cabeza>
    </Animated.View>
  );
}

function Pato({ alto, caminando, contento, nadando }: Required<Pick<Props, "alto">> & Props) {
  const s = alto / 80;
  const paso = useCiclo(420, !!caminando && !nadando);
  const flota = useCiclo(1800);
  const ala = useCiclo(240, !!contento);
  const bote = nadando ? onda(flota, 2 * s) : caminando ? onda(paso, 2 * s, 0, true) : contento ? onda(ala, 5 * s, 0, true) : new Animated.Value(0);
  const meneo = angulo(0, nadando ? onda(flota, 4) : caminando ? onda(paso, 7) : undefined);
  const cabeza = angulo(0, nadando ? onda(flota, 5, Math.PI / 2) : caminando ? onda(paso, 6, Math.PI / 2) : onda(flota, 3));
  const pata = (f: number) => angulo(0, caminando && !nadando ? onda(paso, 24, f) : undefined);
  return (
    <Animated.View pointerEvents="none" style={{ width: 80 * s, height: 80 * s, transform: [{ translateY: bote as never }, { rotate: meneo as never }] }}>
      {!nadando && [{ x: 40, f: 0 }, { x: 48, f: Math.PI }].map((l) => (
        <Pieza key={l.x} s={s} px={l.x} py={58} w={22} h={36} rot={pata(l.f)}>
          <Path d={`M${l.x} 56 L${l.x} 70`} stroke="#FB8C00" strokeWidth="2.6" strokeLinecap="round" />
          <Path d={`M${l.x - 6} 72 L${l.x + 3} 72 L${l.x} 68 Z`} fill="#FB8C00" />
        </Pieza>
      ))}
      <Svg width={80 * s} height={80 * s} viewBox="0 0 80 80" style={{ position: "absolute" }}>
        <Path d="M60 44 Q70 34 68 46 Z" fill="#ECEFF1" />
        <Ellipse cx="44" cy="50" rx="21" ry="13" fill="#FAFAFA" />
        <Path d="M36 50 Q46 56 58 50" stroke="#CFD8DC" strokeWidth="2" fill="none" />
        {nadando && <Path d="M18 60 Q30 56 44 60 Q58 64 70 60" stroke="#81D4FA" strokeWidth="3" fill="none" strokeLinecap="round" />}
      </Svg>
      <Pieza s={s} px={48} py={46} w={34} h={26} rot={angulo(0, contento ? onda(ala, 30) : undefined)}>
        <Ellipse cx="50" cy="48" rx="11" ry="6" fill="#ECEFF1" />
      </Pieza>
      <Cabeza s={s} px={32} py={44} w={40} h={44} rot={cabeza} ojo={{ x: 21, y: 29, r: 1.9 }}>
        <Path d="M32 44 Q26 38 26 32" stroke="#FAFAFA" strokeWidth="8" strokeLinecap="round" fill="none" />
        <Circle cx="24" cy="31" r="8" fill="#FAFAFA" />
        <Path d="M17 31 Q10 31 8 34 Q12 36 18 35 Z" fill="#FB8C00" />
      </Cabeza>
    </Animated.View>
  );
}

function Conejo({ alto, caminando, contento }: Required<Pick<Props, "alto">> & Props) {
  const s = alto / 80;
  const salto = useCiclo(520, !!caminando || !!contento);
  const nariz = useCiclo(900);
  const calma = useCiclo(3000);
  const bote = caminando || contento ? onda(salto, (contento ? 10 : 7) * s, 0, true) : new Animated.Value(0);
  const cuerpo = angulo(0, caminando ? onda(salto, 8) : undefined);
  const orejas = angulo(0, caminando ? onda(salto, 12, Math.PI / 2) : onda(calma, 6));
  const ox = 30 - 25, oy = 40 - 25;
  return (
    <Animated.View pointerEvents="none" style={{ width: 80 * s, height: 80 * s, transform: [{ translateY: bote as never }, { rotate: cuerpo as never }] }}>
      <Svg width={80 * s} height={80 * s} viewBox="0 0 80 80" style={{ position: "absolute" }}>
        <Ellipse cx="54" cy="64" rx="11" ry="6" fill="#8D6E63" />
        <Ellipse cx="46" cy="52" rx="18" ry="14" fill="#A1887F" />
        <Circle cx="63" cy="46" r="5" fill="#FAFAFA" />
        <Ellipse cx="34" cy="64" rx="3" ry="5" fill="#8D6E63" />
        <Ellipse cx="44" cy="58" rx="10" ry="5" fill="#D7CCC8" opacity="0.6" />
      </Svg>
      <Animated.View pointerEvents="none" style={{ position: "absolute", left: ox * s, top: oy * s, width: 50 * s, height: 50 * s }}>
        <Pieza s={s} px={30 - ox} py={32 - oy} w={30} h={50} rot={orejas}>
          <Ellipse cx={30 - ox} cy={20 - oy} rx="3.8" ry="11" fill="#A1887F" transform={`rotate(-12 ${30 - ox} ${20 - oy})`} />
          <Ellipse cx={30 - ox} cy={20 - oy} rx="1.8" ry="8" fill="#F8BBD0" transform={`rotate(-12 ${30 - ox} ${20 - oy})`} />
          <Ellipse cx={35 - ox} cy={21 - oy} rx="3.8" ry="11" fill="#8D6E63" transform={`rotate(10 ${35 - ox} ${21 - oy})`} />
        </Pieza>
        <Svg width={50 * s} height={50 * s} viewBox={`${ox} ${oy} 50 50`} style={{ position: "absolute" }}>
          <Ellipse cx="28" cy="40" rx="10" ry="9" fill="#A1887F" />
          <Circle cx="30" cy="44" r="3" fill="#F8BBD0" opacity="0.5" />
        </Svg>
        <Animated.View style={{ position: "absolute", left: (17 - ox) * s, top: (39 - oy) * s, width: 6 * s, height: 6 * s, transform: [{ scale: nariz.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.25, 1] }) as never }] }}>
          <Svg width={6 * s} height={6 * s} viewBox="0 0 6 6"><Ellipse cx="3" cy="3" rx="2" ry="1.6" fill="#EC407A" /></Svg>
        </Animated.View>
        <Ojo s={s} x={24} y={37} r={2} origen={{ x: ox, y: oy }} />
      </Animated.View>
    </Animated.View>
  );
}

/** Mariposa vista desde arriba: las alas se abren y cierran. */
function Mariposa({ alto }: { alto: number }) {
  const s = alto / 40;
  const aleteo = useCiclo(260);
  const escala = aleteo.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.15, 1] });
  return (
    <View pointerEvents="none" style={{ width: 40 * s, height: 40 * s }}>
      <Animated.View style={{ position: "absolute", left: 0, top: 0, width: 40 * s, height: 40 * s, transform: [{ scaleX: escala as never }] }}>
        <Svg width={40 * s} height={40 * s} viewBox="0 0 40 40">
          <Ellipse cx="11" cy="14" rx="9" ry="10" fill="#BA68C8" />
          <Ellipse cx="29" cy="14" rx="9" ry="10" fill="#BA68C8" />
          <Ellipse cx="13" cy="27" rx="6" ry="7" fill="#F06292" />
          <Ellipse cx="27" cy="27" rx="6" ry="7" fill="#F06292" />
          <Circle cx="11" cy="13" r="3" fill="#FFF59D" />
          <Circle cx="29" cy="13" r="3" fill="#FFF59D" />
        </Svg>
      </Animated.View>
      <Svg width={40 * s} height={40 * s} viewBox="0 0 40 40" style={{ position: "absolute" }}>
        <Ellipse cx="20" cy="21" rx="2" ry="10" fill="#4A148C" />
        <Path d="M19 11 Q16 5 14 4 M21 11 Q24 5 26 4" stroke="#4A148C" strokeWidth="1" fill="none" />
      </Svg>
    </View>
  );
}

/** Pájaro de perfil volando: aletea. */
function Pajaro({ alto }: { alto: number }) {
  const s = alto / 30;
  const aleteo = useCiclo(300);
  return (
    <View pointerEvents="none" style={{ width: 40 * s, height: 30 * s }}>
      <Svg width={40 * s} height={30 * s} viewBox="0 0 40 30" style={{ position: "absolute" }}>
        <Ellipse cx="20" cy="17" rx="10" ry="5.5" fill="#455A64" />
        <Path d="M29 16 L37 13 L35 19 Z" fill="#37474F" />
        <Circle cx="11" cy="14" r="4.5" fill="#455A64" />
        <Polygon points="7,14 3,15 7,16" fill="#FFB300" />
        <Circle cx="10" cy="13" r="1" fill="#fff" />
        <Ellipse cx="19" cy="19" rx="6" ry="2.5" fill="#FFAB91" opacity="0.8" />
      </Svg>
      <Pieza s={s} px={20} py={15} w={30} h={30} rot={angulo(0, onda(aleteo, 45))}>
        <Path d="M20 15 Q24 4 32 6 Q26 12 20 15 Z" fill="#37474F" />
      </Pieza>
    </View>
  );
}

const CUADRUPEDOS: Partial<Record<AnimalId, Cuadrupedo>> = { vaca: VACA, oveja: OVEJA, caballo: CABALLO, cerdo: CERDO, gato: GATO };

/** Proporción ancho/alto de cada animal (para ubicarlo en pantalla). */
export const PROPORCION: Record<AnimalId, number> = { vaca: 120 / 90, oveja: 110 / 85, caballo: 120 / 100, cerdo: 110 / 80, gato: 110 / 80, gallina: 1, pato: 1, conejo: 1, mariposa: 1, pajaro: 40 / 30 };

/** Cualquier animal vivo por su id. */
export function AnimalVivo({ id, alto = 80, caminando = false, contento = false, nadando = false }: Props & { id: AnimalId }) {
  const q = CUADRUPEDOS[id];
  if (q) return <Cuadrupedo d={q} alto={alto} caminando={caminando} contento={contento} />;
  if (id === "gallina") return <Gallina alto={alto} caminando={caminando} contento={contento} />;
  if (id === "pato") return <Pato alto={alto} caminando={caminando} contento={contento} nadando={nadando} />;
  if (id === "conejo") return <Conejo alto={alto} caminando={caminando} contento={contento} />;
  if (id === "mariposa") return <Mariposa alto={alto} />;
  return <Pajaro alto={alto} />;
}

/**
 * Un animal que pasea solo de un lado a otro (camina, se detiene, mira, vuelve).
 * `paseo`: cuántos píxeles se aleja de su lugar.
 */
export function AnimalPaseando({ id, alto, paseo, contento = false, nadando = false }: { id: AnimalId; alto: number; paseo: number; contento?: boolean; nadando?: boolean }) {
  const x = useRef(new Animated.Value(0)).current;
  const [caminando, setCaminando] = useState(false);
  const [mira, setMira] = useState(1); // 1 = izquierda (como está dibujado), -1 = derecha
  useEffect(() => {
    let vivo = true;
    let pos = 0;
    let t: ReturnType<typeof setTimeout>;
    const siguiente = () => {
      if (!vivo) return;
      const destino = (Math.random() * 2 - 1) * paseo;
      const dist = Math.abs(destino - pos);
      if (dist < paseo * 0.25) { t = setTimeout(siguiente, 800); return; }
      setMira(destino < pos ? 1 : -1);
      setCaminando(true);
      Animated.timing(x, { toValue: destino, duration: (dist / (nadando ? 18 : 28)) * 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: false }).start(() => {
        pos = destino;
        if (!vivo) return;
        setCaminando(false);
        t = setTimeout(siguiente, 1500 + Math.random() * 3500);
      });
    };
    t = setTimeout(siguiente, 500 + Math.random() * 2500);
    return () => { vivo = false; clearTimeout(t); x.stopAnimation(); };
  }, [paseo, nadando, x]);
  return (
    <Animated.View pointerEvents="none" style={{ transform: [{ translateX: x as never }, { scaleX: mira }] }}>
      <AnimalVivo id={id} alto={alto} caminando={caminando} contento={contento} nadando={nadando} />
    </Animated.View>
  );
}
