import { Redirect, router, useFocusEffect, type Href } from "expo-router";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { Avatar, TitoVestido } from "../components/Avatar";
import { LugarDibujo } from "../components/Lugares";
import { AnimalPaseando, PROPORCION } from "../components/AnimalesVivos";
import { BarrioVivo } from "../components/BarrioVivo";
import { ARBOLES, LUGARES, VECINOS, type Lugar } from "../lib/lugares";
import { EmiliaDibujo, Globo, type Expresion } from "../components/Personajes";
import { DESBLOQUEOS, Monedas, useJuego } from "../lib/juego";
import { despuesDeHablar, hablar, reactivarVoz } from "../lib/voz";
import { horaActual } from "../lib/hora";
import { TextoIconos } from "../components/Iconos";

/**
 * El barrio de Emilia como un mundo para caminar (vista desde arriba, estilo
 * Stardew Valley): el niño toca el suelo y su personaje camina hasta ahí;
 * si toca una casa, camina hasta la puerta y entra. Emilia y Tito lo siguen.
 * Todo se mide en "unidades de mundo" y se escala a la pantalla.
 */

const MUNDO = { ancho: 1800, alto: 1250 };
const TAMANO_LUGAR = 250;
const VELOCIDAD = 280; // unidades por segundo

type Punto = { x: number; y: number };
const distancia = (a: Punto, b: Punto) => Math.hypot(a.x - b.x, a.y - b.y);
const puerta = (l: Lugar): Punto => ({ x: l.x, y: l.y + 40 });

function saludo(nombre: string) {
  const hora = horaActual();
  const hola = hora < 12 ? "¡Buenos días" : hora < 20 ? "¡Hola" : "¡Buenas noches";
  return `${hola}, ${nombre}! Toca el suelo para caminar. ¡Vamos a jugar!`;
}

export default function Barrio() {
  const juego = useJuego();
  if (!juego.cargado) return <View style={estilos.fondo} />;
  if (!juego.jugadores.length) return <Redirect href="/personaje" />;
  if (!juego.activoId) return <Redirect href="/quien-juega" />;
  return <Mundo />;
}

function Mundo() {
  const { perfil, accesorioPuesto, aviso, limpiarAviso, elegirJugador, estrellas } = useJuego();
  const estrellasRef = useRef(estrellas);
  estrellasRef.current = estrellas;
  const { width: vw, height: vh } = useWindowDimensions();
  const escala = Math.max(vh / 820, vw / 1500);
  const [dialogo, setDialogo] = useState(() => saludo(perfil!.nombre));
  // Profundidad (qué se dibuja delante) en tramos de 25 unidades, para no redibujar en cada cuadro.
  const [profundidad, setProfundidad] = useState({ a: 0, e: 0, t: 0 });
  // Si Emilia y Tito están caminando (mueven brazos y piernas) y la expresión de Emilia.
  const [camina, setCamina] = useState({ e: false, t: false });
  const caminaRef = useRef({ e: false, t: false });
  const [expresion, setExpresion] = useState<Expresion>("feliz");
  const celebrar = useCallback(() => {
    setExpresion("celebrando");
    setTimeout(() => setExpresion("feliz"), 1800);
  }, []);

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

  // Al volver al barrio, Emilia avisa si ya alcanza para algo nuevo en la tienda.
  useFocusEffect(
    useCallback(() => {
      if (!aviso) return;
      const t = setTimeout(() => {
        decir(aviso);
        limpiarAviso();
      }, 700);
      return () => clearTimeout(t);
    }, [aviso, decir, limpiarAviso]),
  );

  const entrar = useCallback(async (l: Lugar) => {
    if (l.estrellas && estrellasRef.current < l.estrellas) {
      const faltan = l.estrellas - estrellasRef.current;
      return decir(`La ${l.nombre.toLowerCase()} está en construcción. Se abre con ${l.estrellas} estrellas: ¡te faltan ${faltan}! Juega en la escuelita para ganar estrellas.`);
    }
    setDialogo(l.frase);
    if (!l.ruta) return void hablar(l.frase);
    const ruta = l.ruta;
    void hablar(l.frase);
    despuesDeHablar(() => router.push(ruta), { minMs: 1200 });
  }, []);
  const teclasRecien = useRef(false);
  const entrarRef = useRef(entrar);
  entrarRef.current = entrar;

  // Teclado de la tablet: flechas (o WASD) para caminar y Enter para entrar al lugar de enfrente.
  const teclas = useRef(new Set<string>());
  const cerca = useRef<Lugar | null>(null);
  // Solo mientras el barrio está a la vista (no cuando hay un juego o el 3D encima).
  const enFoco = useRef(false);
  useFocusEffect(
    useCallback(() => {
      enFoco.current = true;
      return () => {
        enFoco.current = false;
        teclas.current.clear();
      };
    }, []),
  );
  useEffect(() => {
    if (typeof window === "undefined" || !window.addEventListener) return;
    const DIR: Record<string, string> = { ArrowUp: "u", ArrowDown: "d", ArrowLeft: "l", ArrowRight: "r", w: "u", s: "d", a: "l", d: "r", W: "u", S: "d", A: "l", D: "r" };
    const bajar = (e: KeyboardEvent) => {
      if (!enFoco.current) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const d = DIR[e.key];
      if (d) {
        e.preventDefault();
        teclas.current.add(d);
      } else if ((e.key === "Enter" || e.key === " ") && cerca.current) {
        e.preventDefault();
        void entrarRef.current(cerca.current);
      }
    };
    const subir = (e: KeyboardEvent) => {
      const d = DIR[e.key];
      if (d) teclas.current.delete(d);
    };
    const soltar = () => teclas.current.clear();
    window.addEventListener("keydown", bajar, true);
    window.addEventListener("keyup", subir, true);
    window.addEventListener("blur", soltar);
    return () => {
      window.removeEventListener("keydown", bajar, true);
      window.removeEventListener("keyup", subir, true);
      window.removeEventListener("blur", soltar);
    };
  }, []);

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
      // Con flechas: el destino va siempre un poco más adelante en esa dirección.
      const k = teclas.current;
      if (k.size) {
        const dx = (k.has("r") ? 1 : 0) - (k.has("l") ? 1 : 0);
        const dy = (k.has("d") ? 1 : 0) - (k.has("u") ? 1 : 0);
        if (dx || dy) {
          const n = Math.hypot(dx, dy);
          entrarA.current = null;
          destino.current = {
            x: Math.min(Math.max(p.x + (dx / n) * 40, 40), MUNDO.ancho - 40),
            y: Math.min(Math.max(p.y + (dy / n) * 40, 180), MUNDO.alto - 30),
          };
        }
      } else if (!entrarA.current && distancia(p, destino.current) > 3 && distancia(p, destino.current) <= 40 && teclasRecien.current) {
        destino.current = { ...p }; // al soltar la flecha se detiene ahí mismo
      }
      teclasRecien.current = k.size > 0;
      // ¿Quedó frente a una puerta? Emilia recuerda cómo entrar con el teclado.
      const frente = LUGARES.find((l) => distancia(p, puerta(l)) < 70) ?? null;
      if (frente !== cerca.current) {
        cerca.current = frente;
        if (frente && k.size) setDialogo(`${frente.nombre}: presiona Enter para entrar.`);
      }
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
      const estadoCamina = { e: me > 0.05, t: mt > 0.05 };
      if (estadoCamina.e !== caminaRef.current.e || estadoCamina.t !== caminaRef.current.t) {
        caminaRef.current = estadoCamina;
        setCamina(estadoCamina);
      }
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
  // Solo el niño usa el rebote genérico; Emilia y Tito ya rebotan con su propia caminata.
  const personaje = (y: Animated.ValueXY, w: number, h: number, conSalto = false) => ({
    transform: [{ translateX: Animated.add(y.x, -w / 2) }, { translateY: conSalto ? Animated.add(Animated.add(y.y, -h), salto) : Animated.add(y.y, -h) }],
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
              <Text style={[estilos.letreroTexto, { fontSize: Math.max(13, alto(20)) }]}>{!l.ruta ? "Pronto" : l.estrellas && estrellas < l.estrellas ? `🚧 ⭐${estrellas}/${l.estrellas}` : l.nombre}</Text>
            </View>
          </Pressable>
        ))}

        {ARBOLES.map(([x, y], k) => (
          <View key={k} pointerEvents="none" style={[estilos.objeto, { left: alto(x - 60), top: alto(y - 150), zIndex: Math.round(y / 25) }]}>
            <Arbol tamano={alto(120)} variante={k % 3} />
          </View>
        ))}

        {/* Animales vivos del barrio: pasean, pestañean y reaccionan al tocarlos */}
        {VECINOS.filter((v) => v.animal !== "mariposa").map((v) => {
          const h = alto(v.animal === "vaca" ? 88 : v.animal === "oveja" ? 74 : 62);
          const w = h * PROPORCION[v.animal];
          return (
            <Pressable key={v.emoji} onPress={() => decir(v.frase)} accessibilityLabel={v.frase}
              style={[estilos.objeto, { left: alto(v.x) - w / 2, top: alto(v.y) - h, zIndex: Math.round(v.y / 25) }]}>
              <AnimalPaseando id={v.animal} alto={h} paseo={alto(v.paseo)} nadando={v.animal === "pato"} />
            </Pressable>
          );
        })}
        <BarrioVivo
          escala={escala}
          ancho={MUNDO.ancho}
          alto={MUNDO.alto}
          chimenea={{ x: LUGARES.find((l) => l.id === "casa")!.x + 45, y: LUGARES.find((l) => l.id === "casa")!.y - 202 }}
          laguna={{ x: 230, y: 536 }}
          flores={[{ x: 950, y: 640 }, { x: 560, y: 980 }, { x: 1230, y: 1030 }]}
          luces={LUGARES.filter((l) => !["plaza", "huerto"].includes(l.id)).map((l) => ({ x: l.x - 10, y: l.y - 75, r: 95 }))}
        />

        {/* Tito, Emilia y el personaje del niño, con su sombra */}
        <Animated.View pointerEvents="box-none" style={[estilos.objeto, { zIndex: profundidad.t }, personaje(ti, tiW, tiH)]}>
          <Sombra ancho={tiW * 0.8} />
          <Pressable onPress={() => decir("¡Pip! Tito está feliz de pasear contigo.")} accessibilityLabel="Tito">
            <Animated.View style={{ transform: [{ scaleX: mirada.t }] }}>
              <TitoVestido alto={tiH} accesorio={accesorioPuesto("tito")} caminando={camina.t} />
            </Animated.View>
          </Pressable>
        </Animated.View>
        <Animated.View pointerEvents="box-none" style={[estilos.objeto, { zIndex: profundidad.e }, personaje(em, emW, emH)]}>
          <Sombra ancho={emW * 0.7} />
          <Pressable onPress={() => { celebrar(); decir(`¡Me encanta jugar contigo, ${perfil!.nombre}!`); }} accessibilityLabel="Emilia">
            <Animated.View style={{ transform: [{ scaleX: mirada.e }] }}>
              <EmiliaDibujo alto={emH} caminando={camina.e} expresion={expresion} />
            </Animated.View>
          </Pressable>
        </Animated.View>
        <Animated.View pointerEvents="box-none" style={[estilos.objeto, { zIndex: profundidad.a }, personaje(av, avW, avH, true)]}>
          <Text style={[estilos.nombreJugador, { fontSize: Math.max(12, alto(18)) }]}>{perfil!.nombre}</Text>
          <Sombra ancho={avW * 0.7} />
          <Animated.View style={{ transform: [{ scaleX: mirada.a }] }}>
            <Avatar apariencia={perfil!.apariencia} alto={avH} accesorios={{
              cabeza: accesorioPuesto("cabeza"), cara: accesorioPuesto("cara"), cuello: accesorioPuesto("cuello"), mano: accesorioPuesto("mano"),
            }} />
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <Vineta />

      {/* Interfaz fija */}
      <View style={estilos.dialogo} pointerEvents="none">
        <Globo texto={dialogo} />
      </View>
      <Monedas />
      <Pressable style={estilos.miPersonaje} onPress={() => router.push("/personaje")} accessibilityLabel="Cambiar mi personaje">
        <TextoIconos estilo={estilos.botonTexto} texto={`✏️ Mi personaje`} />
      </Pressable>
      <Pressable style={estilos.probar3d} onPress={() => router.push("/barrio3d")} accessibilityLabel="Probar barrio 3D">
        <TextoIconos estilo={estilos.botonTexto} texto={`🧊 Probar 3D`} />
      </Pressable>
      <Pressable style={estilos.cambiarJugador} onPress={() => { elegirJugador(null); router.replace("/quien-juega"); }} accessibilityLabel="Cambiar de jugador">
        <TextoIconos estilo={estilos.botonTexto} texto={`👫 Cambiar`} />
      </Pressable>
      <Pressable style={estilos.sonido} onPress={() => reactivarVoz()} accessibilityLabel="Reactivar sonido">
        <TextoIconos estilo={estilos.botonTexto} texto={`🔊 Sonido`} />
      </Pressable>
      <Pressable style={estilos.padres} accessibilityLabel="Zona de padres" onPress={() => router.push("/padres")}>
        <TextoIconos estilo={estilos.padresTexto} texto={`👪 Padres`} />
      </Pressable>
    </View>
  );
}

/** Sombra suave (difuminada) bajo los personajes, corrida hacia la derecha por la luz. */
function Sombra({ ancho }: { ancho: number }) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", bottom: -ancho * 0.12, left: "50%", marginLeft: -ancho * 0.45, width: ancho * 1.1, height: ancho * 0.32 }}>
      <Svg width="100%" height="100%" viewBox="0 0 110 32">
        <Defs>
          <RadialGradient id="sombraSuave" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#1B3A12" stopOpacity="0.42" />
            <Stop offset="0.6" stopColor="#1B3A12" stopOpacity="0.2" />
            <Stop offset="1" stopColor="#1B3A12" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="55" cy="16" rx="55" ry="16" fill="url(#sombraSuave)" />
      </Svg>
    </View>
  );
}

/** Viñeta suave en los bordes de la pantalla: enfoca el centro y da profundidad. */
function Vineta() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="vineta" cx="50%" cy="48%" r="72%">
            <Stop offset="0.55" stopColor="#0B2A0B" stopOpacity="0" />
            <Stop offset="1" stopColor="#0B2A0B" stopOpacity="0.28" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#vineta)" />
      </Svg>
    </View>
  );
}

const COPAS = [
  { base: "#2E7D32", medio: "#43A047", luz: "#7CC576" },
  { base: "#1B5E20", medio: "#388E3C", luz: "#66BB6A" },
  { base: "#33691E", medio: "#558B2F", luz: "#9CCC65" },
];

/** Árbol con volumen: luz arriba a la izquierda, sombra abajo a la derecha y sombra proyectada. */
const Arbol = memo(function Arbol({ tamano, variante }: { tamano: number; variante: number }) {
  const c = COPAS[variante]!;
  const id = `copa${variante}`;
  return (
    <Svg width={tamano} height={tamano * 1.25} viewBox="0 0 120 150">
      <Defs>
        <RadialGradient id={id} cx="35%" cy="30%" r="75%">
          <Stop offset="0" stopColor={c.luz} />
          <Stop offset="0.55" stopColor={c.medio} />
          <Stop offset="1" stopColor={c.base} />
        </RadialGradient>
        <LinearGradient id="tronco" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#8D6E63" />
          <Stop offset="1" stopColor="#4E342E" />
        </LinearGradient>
        <RadialGradient id="sombraArbol" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#1B3A12" stopOpacity="0.38" />
          <Stop offset="1" stopColor="#1B3A12" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="74" cy="142" rx="50" ry="10" fill="url(#sombraArbol)" />
      <Path d="M52 144 Q54 118 53 90 L67 90 Q66 118 70 144 Q61 147 52 144 Z" fill="url(#tronco)" />
      <Path d="M60 104 Q50 96 44 98 M62 112 Q72 102 78 104" stroke="#5D4037" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Copa en racimos */}
      <Circle cx="38" cy="80" r="26" fill={c.base} />
      <Circle cx="84" cy="80" r="26" fill={c.base} />
      <Circle cx="60" cy="62" r="42" fill={`url(#${id})`} />
      <Circle cx="36" cy="76" r="24" fill={`url(#${id})`} />
      <Circle cx="84" cy="78" r="23" fill={`url(#${id})`} opacity="0.95" />
      <Circle cx="62" cy="86" r="20" fill={c.base} opacity="0.35" />
      {/* Hojitas y brillos */}
      {[[42, 44], [56, 34], [30, 64], [70, 48], [48, 60]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={i % 2 ? 5 : 7} fill="#fff" opacity="0.13" />)}
      {[[78, 70], [92, 84], [66, 96], [50, 92]].map(([x, y], i) => <Circle key={`s${i}`} cx={x} cy={y} r="6" fill={c.base} opacity="0.4" />)}
      {variante === 2 && [40, 70, 58, 84, 32].map((x, i) => (
        <G key={i}><Circle cx={x} cy={58 + (i % 3) * 14} r="5" fill="#E53935" /><Circle cx={x - 1.5} cy={56.5 + (i % 3) * 14} r="1.5" fill="#fff" opacity="0.6" /></G>
      ))}
    </Svg>
  );
});

/** Números pseudoaleatorios fijos (el suelo se ve igual cada vez). */
function azar(semilla: number) {
  const x = Math.sin(semilla * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Suelo del mundo con profundidad: cielo y cordilleras en capas con neblina,
 * pasto con degradado (lejos más claro) y briznas, caminos de tierra con
 * borde, huellas y piedritas, laguna con orilla, nenúfares y juncos.
 */
const Suelo = memo(function Suelo({ escala }: { escala: number }) {
  const { ancho, alto } = MUNDO;
  const enCamino = (x: number, y: number) => (y > 380 && y < 475) || (y > 790 && y < 885) || (x > 855 && x < 955 && y > 380 && y < 1200) || (y > 1150 && y < 1215 && x > 470 && x < 1420) || Math.hypot((x - 210) / 150, (y - 540) / 92) < 1;
  const briznas = Array.from({ length: 520 }, (_, k) => ({ x: azar(k + 1) * ancho, y: 200 + azar(k + 101) * (alto - 210), t: azar(k + 7) })).filter((b) => !enCamino(b.x, b.y));
  const flores = Array.from({ length: 90 }, (_, k) => ({ x: azar(k + 501) * ancho, y: 210 + azar(k + 601) * (alto - 230), c: ["#F06292", "#FFF176", "#fff", "#BA68C8", "#FF8A65"][k % 5]! })).filter((f) => !enCamino(f.x, f.y));
  const piedras = Array.from({ length: 70 }, (_, k) => {
    const tramo = k % 4;
    return tramo === 0 ? { x: azar(k) * ancho, y: 404 + azar(k + 3) * 46 } : tramo === 1 ? { x: azar(k) * ancho, y: 814 + azar(k + 3) * 46 } : tramo === 2 ? { x: 878 + azar(k + 5) * 52, y: 470 + azar(k) * 700 } : { x: 490 + azar(k) * 910, y: 1162 + azar(k + 3) * 40 };
  });
  const camino = (d: string, k: string) => (
    <G key={k}>
      <Path d={d} stroke="#B08D57" strokeWidth="78" strokeLinecap="round" fill="none" />
      <Path d={d} stroke="#D2B48C" strokeWidth="64" strokeLinecap="round" fill="none" />
      <Path d={d} stroke="#DEC59C" strokeWidth="34" strokeLinecap="round" fill="none" opacity="0.7" />
    </G>
  );
  return (
    <Svg width={ancho * escala} height={alto * escala} viewBox={`0 0 ${ancho} ${alto}`} pointerEvents="none">
      <Defs>
        <LinearGradient id="cieloB" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#81D4FA" />
          <Stop offset="1" stopColor="#E1F5FE" />
        </LinearGradient>
        <LinearGradient id="pasto" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#B5D96E" />
          <Stop offset="0.35" stopColor="#97C459" />
          <Stop offset="1" stopColor="#6FA83D" />
        </LinearGradient>
        <LinearGradient id="cerroCerca" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#8BC34A" />
          <Stop offset="1" stopColor="#689F38" />
        </LinearGradient>
        <RadialGradient id="agua" cx="45%" cy="40%" r="60%">
          <Stop offset="0" stopColor="#4FC3F7" />
          <Stop offset="0.7" stopColor="#29B6F6" />
          <Stop offset="1" stopColor="#0288D1" />
        </RadialGradient>
        <RadialGradient id="sombraEdificio" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#1B3A12" stopOpacity="0.4" />
          <Stop offset="0.7" stopColor="#1B3A12" stopOpacity="0.15" />
          <Stop offset="1" stopColor="#1B3A12" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="mancha" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#C5E1A5" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#C5E1A5" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="manchaOscura" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#33691E" stopOpacity="0.25" />
          <Stop offset="1" stopColor="#33691E" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      {/* Cielo y cordilleras en capas (la más lejana más clara por la neblina) */}
      <Rect x="0" y="0" width={ancho} height="200" fill="url(#cieloB)" />
      {[-120, 260, 640, 1020, 1400, 1780].map((x, i) => (
        <Path key={`l${x}`} d={`M${x - 160} 175 L${x + 40 + (i % 2) * 40} ${40 + (i % 3) * 12} L${x + 260} 175 Z`} fill="#B0C4D4" opacity="0.8" />
      ))}
      {[0, 380, 760, 1140, 1520].map((x, i) => (
        <G key={x}>
          <Path d={`M${x - 80} 180 L${x + 150} ${44 + (i % 2) * 14} L${x + 380} 180 Z`} fill="#8FA6B5" />
          <Path d={`M${x + 150} ${44 + (i % 2) * 14} L${x + 380} 180 L${x + 210} 180 Z`} fill="#7A92A2" />
          <Path d={`M${x + 112} ${70 + (i % 2) * 14} L${x + 150} ${44 + (i % 2) * 14} L${x + 192} ${72 + (i % 2) * 14} L${x + 170} ${66 + (i % 2) * 14} L${x + 150} ${76 + (i % 2) * 14} L${x + 132} ${66 + (i % 2) * 14} Z`} fill="#fff" />
        </G>
      ))}
      <Rect x="0" y="150" width={ancho} height="40" fill="#E1F5FE" opacity="0.35" />
      <Path d={`M0 178 Q 300 120 600 172 T 1200 166 T ${ancho} 170 V 210 H 0 Z`} fill="url(#cerroCerca)" />
      {/* Pasto con degradado de profundidad y manchas de luz y sombra */}
      <Rect x="0" y="196" width={ancho} height={alto - 196} fill="url(#pasto)" />
      {[[300, 640, 260], [1350, 1000, 300], [960, 280, 220], [1600, 620, 200], [520, 1050, 220], [1250, 300, 180]].map(([x, y, r], k) => (
        <Ellipse key={k} cx={x} cy={y} rx={r} ry={r! * 0.5} fill="url(#mancha)" />
      ))}
      {[[700, 640, 200], [150, 950, 220], [1500, 360, 160], [1100, 1180, 200]].map(([x, y, r], k) => (
        <Ellipse key={`o${k}`} cx={x} cy={y} rx={r} ry={r! * 0.45} fill="url(#manchaOscura)" />
      ))}
      {/* Caminos de tierra con borde y huellas */}
      {camino(`M-20 427 H${ancho + 20}`, "c1")}
      {camino(`M-20 837 H${ancho + 20}`, "c2")}
      {camino("M904 430 V1180", "c3")}
      <G>
        <Path d="M510 1185 H1400" stroke="#B08D57" strokeWidth="50" strokeLinecap="round" fill="none" />
        <Path d="M510 1185 H1400" stroke="#D2B48C" strokeWidth="38" strokeLinecap="round" fill="none" />
      </G>
      {[417, 437, 827, 847].map((y) => <Line key={y} x1="0" y1={y} x2={ancho} y2={y} stroke="#B89A68" strokeWidth="2" strokeDasharray="30 18" opacity="0.6" />)}
      {[894, 914].map((x) => <Line key={x} x1={x} y1="470" x2={x} y2="1170" stroke="#B89A68" strokeWidth="2" strokeDasharray="30 18" opacity="0.6" />)}
      {piedras.map((p, k) => <Ellipse key={k} cx={p.x} cy={p.y} rx={2 + azar(k + 9) * 3} ry={1.5 + azar(k + 11) * 2} fill={k % 3 ? "#A88B5E" : "#EFE0C2"} />)}
      {/* Sombras de los edificios, proyectadas hacia la derecha */}
      {LUGARES.map((l) => <Ellipse key={l.id} cx={l.x + 34} cy={l.y - 8} rx={TAMANO_LUGAR * 0.56} ry="30" fill="url(#sombraEdificio)" />)}
      {/* Laguna con orilla, profundidad, reflejos, nenúfares y juncos */}
      <Ellipse cx="212" cy="546" rx="146" ry="84" fill="#D9C79B" />
      <Ellipse cx="210" cy="540" rx="132" ry="72" fill="#8D7B55" opacity="0.5" />
      <Ellipse cx="210" cy="540" rx="126" ry="67" fill="url(#agua)" />
      <Path d="M100 520 Q150 500 210 505 Q160 512 120 532 Z" fill="#fff" opacity="0.35" />
      <Ellipse cx="260" cy="570" rx="34" ry="5" fill="#fff" opacity="0.2" />
      {([[150, 570], [178, 588], [290, 530], [270, 512]] as const).map(([x, y], k) => (
        <G key={k}>
          <Path d={`M${x} ${y} m-11 0 a11 6 0 1 0 22 0 a11 6 0 1 0 -22 0 Z`} fill="#43A047" />
          <Path d={`M${x} ${y} L${x + 11} ${y - 2} L${x + 11} ${y + 2} Z`} fill="#29B6F6" />
          {k % 2 === 0 && <Circle cx={x - 3} cy={y - 2} r="3.5" fill="#F8BBD0" />}
        </G>
      ))}
      {([[90, 520], [100, 500], [112, 512], [326, 560], [336, 540], [318, 580]] as const).map(([x, y], k) => (
        <G key={`j${k}`}>
          <Path d={`M${x} ${y} Q${x - 4} ${y - 30} ${x - 2} ${y - 48}`} stroke="#558B2F" strokeWidth="3" fill="none" />
          <Path d={`M${x} ${y} Q${x + 6} ${y - 22} ${x + 10} ${y - 34}`} stroke="#689F38" strokeWidth="2.5" fill="none" />
          <Ellipse cx={x - 2} cy={y - 50} rx="3" ry="8" fill="#6D4C41" />
        </G>
      ))}
      {([[340, 600], [80, 576]] as const).map(([x, y]) => <G key={x}><Ellipse cx={x} cy={y} rx="14" ry="9" fill="#90A4AE" /><Ellipse cx={x - 3} cy={y - 3} rx="7" ry="4" fill="#CFD8DC" /></G>)}
      {/* Cerca de la granja con sombra */}
      <Rect x="1336" y="938" width="362" height="6" fill="#000" opacity="0.12" />
      {[1340, 1390, 1440, 1490, 1540, 1590, 1640, 1690].map((x) => <G key={x}><Rect x={x} y="900" width="8" height="40" fill="#A1887F" /><Rect x={x + 5} y="900" width="3" height="40" fill="#6D4C41" opacity="0.5" /></G>)}
      <Rect x="1336" y="908" width="362" height="7" fill="#BCAAA4" />
      <Rect x="1336" y="925" width="362" height="7" fill="#BCAAA4" />
      {/* Briznas de pasto y flores */}
      {briznas.map((b, k) => {
        const h = 7 + b.t * 7, c = b.t > 0.5 ? "#5E9A2E" : "#79B142";
        return <Path key={k} d={`M${b.x - 4} ${b.y} Q${b.x - 4} ${b.y - h * 0.6} ${b.x - 6} ${b.y - h} M${b.x} ${b.y} Q${b.x + 1} ${b.y - h} ${b.x} ${b.y - h * 1.2} M${b.x + 4} ${b.y} Q${b.x + 4} ${b.y - h * 0.6} ${b.x + 7} ${b.y - h * 0.9}`} stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round" />;
      })}
      {flores.map((f, k) => (
        <G key={`f${k}`}>
          <Line x1={f.x} y1={f.y} x2={f.x} y2={f.y + 7} stroke="#558B2F" strokeWidth="1.5" />
          {[0, 72, 144, 216, 288].map((a) => <Circle key={a} cx={f.x + Math.cos((a * Math.PI) / 180) * 3.2} cy={f.y + Math.sin((a * Math.PI) / 180) * 3.2} r="2.8" fill={f.c} />)}
          <Circle cx={f.x} cy={f.y} r="2" fill="#FFB300" />
        </G>
      ))}
    </Svg>
  );
});

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "#8BC34A", overflow: "hidden" },
  objeto: { position: "absolute", alignItems: "center" },
  letrero: { marginTop: -6, backgroundColor: "#8D6E63", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 2, borderColor: "#5D4037", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 3, shadowOffset: { width: 2, height: 3 } },
  letreroPronto: { backgroundColor: "#9E9E9E", borderColor: "#757575" },
  letreroTexto: { color: "#fff", fontWeight: "800" },
  nombreJugador: { position: "absolute", top: -26, alignSelf: "center", backgroundColor: "rgba(255,255,255,0.9)", color: "#3B2F5C", fontWeight: "900", paddingHorizontal: 8, borderRadius: 10, overflow: "hidden" },
  dialogo: { position: "absolute", top: 14, left: 0, right: 0, alignItems: "center" },
  miPersonaje: { position: "absolute", top: 16, left: 16, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  botonTexto: { fontSize: 16, fontWeight: "800", color: "#3B2F5C" },
  sonido: { position: "absolute", top: 160, left: 16, backgroundColor: "#FFF8E1", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 2, borderColor: "#FFB300" },
  probar3d: { position: "absolute", top: 112, left: 16, backgroundColor: "#E1F5FE", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 2, borderColor: "#29B6F6" },
  cambiarJugador: { position: "absolute", top: 64, left: 16, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  padres: { position: "absolute", bottom: 12, right: 12, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  padresTexto: { fontSize: 14, color: "#3B2F5C" },
});
