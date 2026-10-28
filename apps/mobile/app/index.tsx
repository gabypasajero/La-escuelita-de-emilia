import { Redirect, router, type Href } from "expo-router";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { Avatar, TitoVestido } from "../components/Avatar";
import { LugarDibujo, type LugarId } from "../components/Lugares";
import { EmiliaDibujo, Globo } from "../components/Personajes";
import { Monedas, useJuego } from "../lib/juego";
import { hablar } from "../lib/voz";

/**
 * El barrio de Emilia como un mundo para caminar (vista desde arriba, estilo
 * Stardew Valley): el niño toca el suelo y su personaje camina hasta ahí;
 * si toca una casa, camina hasta la puerta y entra. Emilia y Tito lo siguen.
 * Todo se mide en "unidades de mundo" y se escala a la pantalla.
 */

const MUNDO = { ancho: 1800, alto: 1250 };
const TAMANO_LUGAR = 250;
const VELOCIDAD = 280; // unidades por segundo

interface Lugar {
  id: LugarId;
  nombre: string;
  frase: string;
  ruta?: Href;
  x: number;
  /** Línea del suelo donde se apoya el edificio (define qué se dibuja delante). */
  y: number;
}

const LUGARES: Lugar[] = [
  { id: "escuelita", nombre: "La Escuelita", frase: "¡A la escuelita! Letras y números.", ruta: "/escuelita", x: 430, y: 360 },
  { id: "taller", nombre: "Taller de arte", frase: "¡Qué entretenido! ¿Pintamos?", ruta: "/pintar", x: 780, y: 360 },
  { id: "tiendita", nombre: "Almacén", frase: "Doña Rosa necesita ayuda en el almacén.", ruta: "/juegos/tiendita", x: 1130, y: 360 },
  { id: "disfraces", nombre: "Disfraces", frase: "¡La tienda de disfraces! ¿Qué te compras?", ruta: "/disfraces", x: 1480, y: 360 },
  { id: "casa", nombre: "Casa de Emilia", frase: "¡Esta es mi casa! Ven, te muestro el patio.", ruta: "/casa", x: 300, y: 770 },
  { id: "plaza", nombre: "Plaza", frase: "¡A la plaza de juegos!", ruta: "/juegos", x: 700, y: 770 },
  { id: "huerto", nombre: "Huerto", frase: "Don Pedro nos espera en el huerto.", ruta: "/huerto", x: 1100, y: 770 },
  { id: "granja", nombre: "Granja", frase: "¡Vamos a ver a los animales!", ruta: "/animales", x: 1480, y: 770 },
  { id: "paradero", nombre: "Paradero", frase: "Pronto llegan en bus mis amigos de otros países.", x: 1300, y: 1150 },
];

const ARBOLES: Array<[number, number]> = [
  [90, 230], [220, 190], [1680, 210], [1760, 560], [80, 1080], [430, 1170], [1720, 1120],
  [610, 560], [1290, 560], [990, 1010], [180, 640], [1600, 960], [560, 1060],
];

const VECINOS: Array<{ emoji: string; x: number; y: number; frase: string }> = [
  { emoji: "🐄", x: 1620, y: 850, frase: "¡Muuu!" },
  { emoji: "🐑", x: 1350, y: 870, frase: "¡Beee!" },
  { emoji: "🐔", x: 1560, y: 900, frase: "¡Kikirikí!" },
  { emoji: "🐱", x: 470, y: 900, frase: "¡Miau! Es el gato del barrio." },
  { emoji: "🦆", x: 230, y: 520, frase: "¡Cuac, cuac! Los patos nadan en la laguna." },
  { emoji: "🦋", x: 950, y: 640, frase: "¡Una mariposa!" },
];

type Punto = { x: number; y: number };
const distancia = (a: Punto, b: Punto) => Math.hypot(a.x - b.x, a.y - b.y);
const puerta = (l: Lugar): Punto => ({ x: l.x, y: l.y + 40 });

function saludo(nombre: string) {
  const hora = new Date().getHours();
  const hola = hora < 12 ? "¡Buenos días" : hora < 20 ? "¡Hola" : "¡Buenas noches";
  return `${hola}, ${nombre}! Toca el suelo para caminar. ¡Vamos a jugar!`;
}

export default function Barrio() {
  const juego = useJuego();
  if (!juego.cargado) return <View style={estilos.fondo} />;
  if (!juego.perfil) return <Redirect href="/personaje" />;
  return <Mundo />;
}

function Mundo() {
  const { perfil, accesorioPuesto } = useJuego();
  const { width: vw, height: vh } = useWindowDimensions();
  const escala = Math.max(vh / 820, vw / 1500);
  const [dialogo, setDialogo] = useState(() => saludo(perfil!.nombre));
  // Profundidad (qué se dibuja delante) en tramos de 25 unidades, para no redibujar en cada cuadro.
  const [profundidad, setProfundidad] = useState({ a: 0, e: 0, t: 0 });

  const inicio = { x: puerta(LUGARES[4]!).x + 70, y: puerta(LUGARES[4]!).y + 40 };
  const pos = useRef<Punto>({ ...inicio });
  const destino = useRef<Punto>({ ...inicio });
  const rastro = useRef<Punto[]>(Array.from({ length: 20 }, (_, k) => ({ x: inicio.x - k * 6, y: inicio.y })));
  const entrarA = useRef<Lugar | null>(null);
  const fase = useRef(0);
  const emiliaPos = useRef<Punto>({ x: inicio.x - 50, y: inicio.y });
  const titoPos = useRef<Punto>({ x: inicio.x - 90, y: inicio.y + 10 });

  const av = useRef(new Animated.ValueXY()).current;
  const em = useRef(new Animated.ValueXY()).current;
  const ti = useRef(new Animated.ValueXY()).current;
  const camara = useRef(new Animated.ValueXY()).current;
  const camaraPos = useRef<Punto>({ x: 0, y: 0 });
  const salto = useRef(new Animated.Value(0)).current;
  const mirada = useRef({ a: new Animated.Value(1), e: new Animated.Value(1), t: new Animated.Value(1) }).current;

  useEffect(() => {
    const t = setTimeout(() => void hablar(dialogo), 500);
    return () => clearTimeout(t);
    // Solo al llegar al barrio.
  }, []);

  const decir = useCallback((texto: string) => {
    setDialogo(texto);
    void hablar(texto);
  }, []);

  const entrar = useCallback(async (l: Lugar) => {
    setDialogo(l.frase);
    if (!l.ruta) return void hablar(l.frase);
    const ruta = l.ruta;
    await Promise.race([hablar(l.frase), new Promise((r) => setTimeout(r, 2500))]);
    router.push(ruta);
  }, []);
  const entrarRef = useRef(entrar);
  entrarRef.current = entrar;

  // Bucle de animación: mueve al personaje, a sus acompañantes y la cámara.
  useEffect(() => {
    let cuadro = 0;
    let anterior = performance.now();
    const ultimaProf = { a: -1, e: -1, t: -1 };
    const seguir = (p: Punto, objetivo: Punto, dt: number) => {
      const d = distancia(p, objetivo);
      if (d < 2) return 0;
      const paso = Math.min(d, VELOCIDAD * 1.1 * dt);
      p.x += ((objetivo.x - p.x) / d) * paso;
      p.y += ((objetivo.y - p.y) / d) * paso;
      return paso;
    };
    const tick = (ahora: number) => {
      const dt = Math.min(0.05, (ahora - anterior) / 1000);
      anterior = ahora;
      const p = pos.current;
      const d = distancia(p, destino.current);
      let movio = 0;
      if (d > 3) {
        const paso = Math.min(d, VELOCIDAD * dt);
        const dx = (destino.current.x - p.x) / d;
        p.x += dx * paso;
        p.y += ((destino.current.y - p.y) / d) * paso;
        movio = paso;
        if (Math.abs(dx) > 0.2) mirada.a.setValue(dx < 0 ? -1 : 1);
        const ultimo = rastro.current[0]!;
        if (distancia(ultimo, p) > 6) rastro.current = [{ ...p }, ...rastro.current].slice(0, 40);
      } else if (entrarA.current) {
        const l = entrarA.current;
        entrarA.current = null;
        void entrarRef.current(l);
      }
      // Emilia y Tito siguen el camino del niño, unos pasos atrás.
      const pe = rastro.current[8] ?? rastro.current.at(-1)!;
      const pt = rastro.current[15] ?? rastro.current.at(-1)!;
      const me = seguir(emiliaPos.current, pe, dt);
      const mt = seguir(titoPos.current, { x: pt.x - 10, y: pt.y + 12 }, dt);
      if (me) mirada.e.setValue(pe.x < emiliaPos.current.x ? -1 : 1);
      if (mt) mirada.t.setValue(pt.x < titoPos.current.x ? 1 : -1); // Tito está dibujado mirando a la izquierda
      fase.current += movio + me * 0.3;
      salto.setValue(movio || me ? -Math.abs(Math.sin(fase.current / 14)) * 7 : 0);

      av.setValue({ x: p.x * escala, y: p.y * escala });
      em.setValue({ x: emiliaPos.current.x * escala, y: emiliaPos.current.y * escala });
      ti.setValue({ x: titoPos.current.x * escala, y: titoPos.current.y * escala });
      const cx = Math.min(Math.max(p.x * escala - vw / 2, 0), Math.max(0, MUNDO.ancho * escala - vw));
      const cy = Math.min(Math.max(p.y * escala - vh / 2, 0), Math.max(0, MUNDO.alto * escala - vh));
      camara.setValue({ x: -cx, y: -cy });
      camaraPos.current = { x: cx, y: cy };

      const prof = { a: Math.round(p.y / 25), e: Math.round(emiliaPos.current.y / 25), t: Math.round(titoPos.current.y / 25) };
      if (prof.a !== ultimaProf.a || prof.e !== ultimaProf.e || prof.t !== ultimaProf.t) {
        Object.assign(ultimaProf, prof);
        setProfundidad(prof);
      }
      cuadro = requestAnimationFrame(tick);
    };
    cuadro = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(cuadro);
  }, [escala, vw, vh, av, em, ti, camara, salto, mirada]);

  function caminarA(x: number, y: number) {
    entrarA.current = null;
    destino.current = { x: Math.min(Math.max(x, 40), MUNDO.ancho - 40), y: Math.min(Math.max(y, 180), MUNDO.alto - 30) };
  }

  function irAlLugar(l: Lugar) {
    destino.current = puerta(l);
    entrarA.current = l;
    setDialogo(`¡Vamos a ${l.nombre === "Casa de Emilia" ? "mi casa" : l.nombre.toLowerCase().startsWith("la ") ? l.nombre.toLowerCase() : "el " + l.nombre.toLowerCase()}!`);
  }

  const alto = (n: number) => n * escala;
  const personaje = (y: Animated.ValueXY, w: number, h: number) => ({
    transform: [{ translateX: Animated.add(y.x, -w / 2) }, { translateY: Animated.add(Animated.add(y.y, -h), salto) }],
  });

  const avH = alto(150), emH = alto(140), tiH = alto(60);
  const avW = (avH * 100) / 160, emW = (emH * 100) / 160, tiW = (tiH * 100) / 80;

  return (
    <View style={estilos.fondo}>
      <Animated.View style={{ width: MUNDO.ancho * escala, height: MUNDO.alto * escala, transform: camara.getTranslateTransform() }}>
        <Pressable
          style={StyleSheet.absoluteFill}
          // Se usa la posición en pantalla + cámara (locationX no viene en todos los navegadores).
          onPress={(e) => caminarA((e.nativeEvent.pageX + camaraPos.current.x) / escala, (e.nativeEvent.pageY + camaraPos.current.y) / escala)}
          accessibilityLabel="Caminar"
        >
          <Suelo escala={escala} />
        </Pressable>

        {LUGARES.map((l) => (
          <Pressable
            key={l.id}
            onPress={() => irAlLugar(l)}
            accessibilityLabel={l.nombre}
            style={[estilos.objeto, { left: alto(l.x - TAMANO_LUGAR / 2), top: alto(l.y - TAMANO_LUGAR * 0.95), width: alto(TAMANO_LUGAR), zIndex: Math.round(l.y / 25) }]}
          >
            <LugarDibujo id={l.id} tamano={alto(l.id === "paradero" ? TAMANO_LUGAR * 0.7 : TAMANO_LUGAR)} />
            <View style={[estilos.letrero, !l.ruta && estilos.letreroPronto]}>
              <Text style={[estilos.letreroTexto, { fontSize: Math.max(13, alto(20)) }]}>{l.ruta ? l.nombre : "Pronto"}</Text>
            </View>
          </Pressable>
        ))}

        {ARBOLES.map(([x, y], k) => (
          <View key={k} pointerEvents="none" style={[estilos.objeto, { left: alto(x - 60), top: alto(y - 150), zIndex: Math.round(y / 25) }]}>
            <Arbol tamano={alto(120)} variante={k % 3} />
          </View>
        ))}

        {VECINOS.map((v) => (
          <Pressable key={v.emoji} onPress={() => decir(v.frase)} accessibilityLabel={v.frase}
            style={[estilos.objeto, { left: alto(v.x - 25), top: alto(v.y - 50), zIndex: Math.round(v.y / 25) }]}>
            <Text style={{ fontSize: alto(46) }}>{v.emoji}</Text>
          </Pressable>
        ))}

        {/* Tito, Emilia y el personaje del niño, con su sombra */}
        <Animated.View pointerEvents="box-none" style={[estilos.objeto, { zIndex: profundidad.t }, personaje(ti, tiW, tiH)]}>
          <Sombra ancho={tiW * 0.8} />
          <Pressable onPress={() => decir("¡Pip! Tito está feliz de pasear contigo.")} accessibilityLabel="Tito">
            <Animated.View style={{ transform: [{ scaleX: mirada.t }] }}>
              <TitoVestido alto={tiH} accesorio={accesorioPuesto("tito")} />
            </Animated.View>
          </Pressable>
        </Animated.View>
        <Animated.View pointerEvents="box-none" style={[estilos.objeto, { zIndex: profundidad.e }, personaje(em, emW, emH)]}>
          <Sombra ancho={emW * 0.7} />
          <Pressable onPress={() => decir(`¡Me encanta jugar contigo, ${perfil!.nombre}!`)} accessibilityLabel="Emilia">
            <Animated.View style={{ transform: [{ scaleX: mirada.e }] }}>
              <EmiliaDibujo alto={emH} />
            </Animated.View>
          </Pressable>
        </Animated.View>
        <Animated.View pointerEvents="box-none" style={[estilos.objeto, { zIndex: profundidad.a }, personaje(av, avW, avH)]}>
          <Text style={[estilos.nombreJugador, { fontSize: Math.max(12, alto(18)) }]}>{perfil!.nombre}</Text>
          <Sombra ancho={avW * 0.7} />
          <Animated.View style={{ transform: [{ scaleX: mirada.a }] }}>
            <Avatar apariencia={perfil!.apariencia} alto={avH} accesorios={{
              cabeza: accesorioPuesto("cabeza"), cara: accesorioPuesto("cara"), cuello: accesorioPuesto("cuello"), mano: accesorioPuesto("mano"),
            }} />
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* Interfaz fija */}
      <View style={estilos.dialogo} pointerEvents="none">
        <Globo texto={dialogo} />
      </View>
      <Monedas />
      <Pressable style={estilos.miPersonaje} onPress={() => router.push("/personaje")} accessibilityLabel="Cambiar mi personaje">
        <Text style={estilos.botonTexto}>✏️ Mi personaje</Text>
      </Pressable>
      <Pressable style={estilos.padres} accessibilityLabel="Zona de padres" onPress={() => router.push("/padres")}>
        <Text style={estilos.padresTexto}>👪 Padres</Text>
      </Pressable>
    </View>
  );
}

function Sombra({ ancho }: { ancho: number }) {
  return <View pointerEvents="none" style={{ position: "absolute", bottom: -ancho * 0.08, alignSelf: "center", width: ancho, height: ancho * 0.22, borderRadius: ancho, backgroundColor: "rgba(0,0,0,0.18)" }} />;
}

const Arbol = memo(function Arbol({ tamano, variante }: { tamano: number; variante: number }) {
  const copa = ["#43A047", "#388E3C", "#66BB6A"][variante]!;
  return (
    <Svg width={tamano} height={tamano * 1.25} viewBox="0 0 120 150">
      <Ellipse cx="60" cy="143" rx="44" ry="9" fill="rgba(0,0,0,0.18)" />
      <Rect x="52" y="90" width="16" height="54" rx="5" fill="#6D4C41" />
      <Circle cx="60" cy="62" r="42" fill={copa} />
      <Circle cx="36" cy="78" r="26" fill={copa} />
      <Circle cx="86" cy="78" r="26" fill={copa} />
      <Circle cx="48" cy="46" r="14" fill="#fff" opacity="0.15" />
      {variante === 2 && [40, 70, 58, 84].map((x, i) => <Circle key={i} cx={x} cy={60 + (i % 2) * 22} r="5" fill="#E53935" />)}
    </Svg>
  );
});

/** Suelo del mundo: cerros al fondo, pasto, caminos de tierra, laguna y flores. */
const Suelo = memo(function Suelo({ escala }: { escala: number }) {
  const { ancho, alto } = MUNDO;
  const flores = Array.from({ length: 70 }, (_, k) => ({ x: (k * 263) % ancho, y: 200 + ((k * 397) % (alto - 220)), c: ["#F06292", "#FFF176", "#fff", "#BA68C8"][k % 4]! }));
  return (
    <Svg width={ancho * escala} height={alto * escala} viewBox={`0 0 ${ancho} ${alto}`} pointerEvents="none">
      {/* Cordillera y cerros al fondo, para dar profundidad */}
      <Rect x="0" y="0" width={ancho} height="180" fill="#B3E5FC" />
      {[0, 380, 760, 1140, 1520].map((x) => (
        <G key={x}>
          <Path d={`M${x - 80} 170 L${x + 150} 30 L${x + 380} 170 Z`} fill="#90A4AE" />
          <Path d={`M${x + 110} 55 L${x + 150} 30 L${x + 190} 55 Z`} fill="#fff" />
        </G>
      ))}
      <Path d={`M0 170 Q 300 110 600 165 T 1200 160 T ${ancho} 165 V 200 H 0 Z`} fill="#7CB342" />
      <Rect x="0" y="190" width={ancho} height={alto - 190} fill="#8BC34A" />
      {/* Manchas de pasto más claro */}
      {[[300, 560, 200], [1350, 1000, 260], [900, 260, 180], [1600, 620, 150]].map(([x, y, r], k) => (
        <Ellipse key={k} cx={x} cy={y} rx={r} ry={r! * 0.45} fill="#9CCC65" />
      ))}
      {/* Caminos de tierra */}
      <Rect x="0" y="392" width={ancho} height="70" rx="20" fill="#C9A66B" />
      <Rect x="0" y="400" width={ancho} height="54" rx="18" fill="#D7B98E" />
      <Rect x="0" y="802" width={ancho} height="70" rx="20" fill="#C9A66B" />
      <Rect x="0" y="810" width={ancho} height="54" rx="18" fill="#D7B98E" />
      <Rect x="868" y="392" width="72" height="800" rx="20" fill="#C9A66B" />
      <Rect x="876" y="392" width="56" height="800" rx="18" fill="#D7B98E" />
      {/* Sombras de los edificios */}
      {LUGARES.map((l) => <Ellipse key={l.id} cx={l.x} cy={l.y - 4} rx={TAMANO_LUGAR * 0.42} ry="16" fill="rgba(0,0,0,0.16)" />)}
      {/* Laguna */}
      <Ellipse cx="210" cy="540" rx="125" ry="66" fill="#4FC3F7" />
      <Ellipse cx="210" cy="540" rx="125" ry="66" fill="none" stroke="#81D4FA" strokeWidth="10" />
      <Ellipse cx="180" cy="525" rx="40" ry="10" fill="#fff" opacity="0.35" />
      {/* Cerca de la granja */}
      {[1340, 1390, 1440, 1490, 1540, 1590, 1640, 1690].map((x) => <Rect key={x} x={x} y="900" width="8" height="40" fill="#A1887F" />)}
      <Rect x="1336" y="908" width="362" height="7" fill="#A1887F" />
      <Rect x="1336" y="925" width="362" height="7" fill="#A1887F" />
      {flores.map((f, k) => <Circle key={k} cx={f.x} cy={f.y} r="5" fill={f.c} />)}
    </Svg>
  );
});

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "#8BC34A", overflow: "hidden" },
  objeto: { position: "absolute", alignItems: "center" },
  letrero: { marginTop: -6, backgroundColor: "#8D6E63", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 2, borderColor: "#5D4037" },
  letreroPronto: { backgroundColor: "#9E9E9E", borderColor: "#757575" },
  letreroTexto: { color: "#fff", fontWeight: "800" },
  nombreJugador: { position: "absolute", top: -26, alignSelf: "center", backgroundColor: "rgba(255,255,255,0.9)", color: "#3B2F5C", fontWeight: "900", paddingHorizontal: 8, borderRadius: 10, overflow: "hidden" },
  dialogo: { position: "absolute", top: 14, left: 0, right: 0, alignItems: "center" },
  miPersonaje: { position: "absolute", top: 16, left: 16, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  botonTexto: { fontSize: 16, fontWeight: "800", color: "#3B2F5C" },
  padres: { position: "absolute", bottom: 12, right: 12, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  padresTexto: { fontSize: 14, color: "#3B2F5C" },
});
