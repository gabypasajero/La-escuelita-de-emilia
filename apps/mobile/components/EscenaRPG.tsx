import { Redirect } from "expo-router";
import { forwardRef, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useJuego } from "../lib/juego";
import { Avatar } from "./Avatar";
import { BotonCasa } from "./BotonCasa";
import { EmiliaDibujo, Globo, TitoDibujo } from "./Personajes";
import { Monedas } from "../lib/juego";

/**
 * Escena para caminar (estilo RPG, como el barrio): el niño toca el suelo y
 * su personaje camina hasta ahí; al tocar un objeto camina hasta él y se
 * activa. Emilia y Tito lo siguen. Se usa en la Casa, la Granja y el Almacén.
 * Todo se mide en unidades de diseño (por defecto 1100 × 700) y se escala.
 */
export interface ObjetoEscena {
  id: string;
  /** Centro horizontal y línea del suelo donde se apoya (define qué queda delante). */
  x: number;
  y: number;
  ancho: number;
  alto: number;
  etiqueta: string;
  dibujo: (k: number) => ReactNode;
  /** Dónde se para el personaje para usarlo (por defecto, justo delante). */
  llegada?: { x: number; y: number };
  /** Se llama al llegar caminando. */
  alLlegar?: () => void;
  /** Letrero bajo el objeto. */
  letrero?: string;
}

export interface EscenaRPGRef {
  caminarA: (x: number, y: number, alLlegar?: () => void) => void;
}

interface Props {
  fondo: (k: number) => ReactNode;
  objetos: ObjetoEscena[];
  inicio: { x: number; y: number };
  /** Zona caminable (unidades de diseño). */
  piso: { xMin: number; xMax: number; yMin: number; yMax: number };
  dialogo: string;
  colorFondo?: string;
  /** Interfaz extra encima de la escena (botones, canasta, etc.). */
  children?: ReactNode;
  diseno?: { ancho: number; alto: number };
  /** Elementos que viven dentro de la escena (por ejemplo, un cliente que entra). */
  extras?: (k: number) => ReactNode;
}

export const EscenaRPG = forwardRef<EscenaRPGRef, Props>(function EscenaRPG(
  { fondo, objetos, inicio, piso, dialogo, colorFondo = "#FFF3E0", children, diseno = { ancho: 1100, alto: 700 }, extras },
  ref,
) {
  const { perfil, accesorioPuesto, cargado, jugadores, activoId } = useJuego();
  const { width, height } = useWindowDimensions();
  const k = Math.min(width / diseno.ancho, height / diseno.alto);
  const pos = useRef(new Animated.ValueXY(inicio)).current;
  const emilia = useRef(new Animated.ValueXY({ x: inicio.x - 70, y: inicio.y + 6 })).current;
  const tito = useRef(new Animated.ValueXY({ x: inicio.x - 115, y: inicio.y + 18 })).current;
  const salto = useRef(new Animated.Value(0)).current;
  const actual = useRef({ ...inicio });
  const [mira, setMira] = useState(1);
  const [caminando, setCaminando] = useState(false);
  const [profundidad, setProfundidad] = useState(inicio.y);
  const contenedor = useRef<View>(null);
  const origen = useRef({ x: 0, y: 0 });
  const caminata = useRef<Animated.CompositeAnimation | null>(null);

  function caminarA(xx: number, yy: number, alLlegar?: () => void) {
    const x = Math.min(Math.max(xx, piso.xMin), piso.xMax);
    const y = Math.min(Math.max(yy, piso.yMin), piso.yMax);
    const desde = actual.current;
    // Si ya está ahí (por ejemplo, toca otra vez el mismo estante), actúa al tiro sin caminar.
    if (Math.hypot(x - desde.x, y - desde.y) < 8) {
      caminata.current?.stop();
      pos.setValue({ x, y });
      alLlegar?.();
      return;
    }
    const ms = Math.max(250, (Math.hypot(x - desde.x, y - desde.y) / 260) * 1000);
    if (Math.abs(x - desde.x) > 4) setMira(x < desde.x ? -1 : 1);
    actual.current = { x, y };
    setProfundidad(y);
    caminata.current?.stop();
    const rebote = Animated.loop(Animated.sequence([
      Animated.timing(salto, { toValue: -7, duration: 140, useNativeDriver: false }),
      Animated.timing(salto, { toValue: 0, duration: 140, useNativeDriver: false }),
    ]));
    rebote.start();
    setCaminando(true);
    const anim = Animated.parallel([
      Animated.timing(pos, { toValue: { x, y }, duration: ms, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(emilia, { toValue: { x: x - 70 * (x < desde.x ? -1 : 1), y: y + 6 }, duration: ms, delay: 220, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.timing(tito, { toValue: { x: x - 115 * (x < desde.x ? -1 : 1), y: y + 18 }, duration: ms, delay: 420, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ]);
    caminata.current = anim;
    anim.start(({ finished }) => {
      rebote.stop();
      if (finished) setCaminando(false);
      salto.setValue(0);
      if (finished) alLlegar?.();
    });
  }

  useImperativeHandle(ref, () => ({ caminarA }));

  if (cargado && jugadores.length && !activoId) return <Redirect href="/quien-juega" />;
  if (!perfil) return null;
  const avH = 125 * k, avW = (avH * 100) / 160, emH = 115 * k, emW = (emH * 100) / 160, tiH = 48 * k, tiW = (tiH * 100) / 80;
  const coloca = (v: Animated.ValueXY, w: number, h: number, conSalto: boolean) => ({
    position: "absolute" as const,
    transform: [
      { translateX: Animated.add(Animated.multiply(v.x, k), -w / 2) },
      { translateY: conSalto ? Animated.add(Animated.add(Animated.multiply(v.y, k), -h), salto) : Animated.add(Animated.multiply(v.y, k), -h) },
    ],
  });

  return (
    <View style={[estilos.fondo, { backgroundColor: colorFondo }]}>
      <View
        ref={contenedor}
        onLayout={() => contenedor.current?.measureInWindow((x, y) => { origen.current = { x, y }; })}
        style={{ width: diseno.ancho * k, height: diseno.alto * k, alignSelf: "center" }}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Caminar"
          onPress={(e) => {
            contenedor.current?.measureInWindow((ox, oy) => { origen.current = { x: ox, y: oy }; });
            caminarA((e.nativeEvent.pageX - origen.current.x) / k, (e.nativeEvent.pageY - origen.current.y) / k);
          }}
        >
          <View pointerEvents="none">{fondo(k)}</View>
        </Pressable>

        {objetos.map((o) => (
          <Pressable
            key={o.id}
            accessibilityLabel={o.etiqueta}
            onPress={() => {
              const l = o.llegada ?? { x: o.x, y: o.y + 30 };
              caminarA(l.x, l.y, o.alLlegar);
            }}
            style={{ position: "absolute", left: (o.x - o.ancho / 2) * k, top: (o.y - o.alto) * k, width: o.ancho * k, height: o.alto * k, zIndex: Math.round(o.y), alignItems: "center", justifyContent: "flex-end" }}
          >
            {o.dibujo(k)}
            {o.letrero && (
              <View style={estilos.letrero}>
                <Text style={[estilos.letreroTexto, { fontSize: Math.max(12, 17 * k) }]}>{o.letrero}</Text>
              </View>
            )}
          </Pressable>
        ))}

        {extras?.(k)}

        <Animated.View pointerEvents="none" style={[coloca(tito, tiW, tiH, false), { zIndex: Math.round(profundidad) + 1 }]}>
          <View style={{ transform: [{ scaleX: -mira }] }}><TitoDibujo alto={tiH} caminando={caminando} /></View>
        </Animated.View>
        <Animated.View pointerEvents="none" style={[coloca(emilia, emW, emH, false), { zIndex: Math.round(profundidad) + 1 }]}>
          <View style={{ transform: [{ scaleX: mira }] }}><EmiliaDibujo alto={emH} caminando={caminando} /></View>
        </Animated.View>
        <Animated.View pointerEvents="none" style={[coloca(pos, avW, avH, true), { zIndex: Math.round(profundidad) + 2 }]}>
          <View style={{ transform: [{ scaleX: mira }] }}>
            <Avatar apariencia={perfil.apariencia} alto={avH} accesorios={{ cabeza: accesorioPuesto("cabeza"), cara: accesorioPuesto("cara"), cuello: accesorioPuesto("cuello"), mano: accesorioPuesto("mano") }} />
          </View>
        </Animated.View>
      </View>

      <View style={estilos.dialogo} pointerEvents="none"><Globo texto={dialogo} /></View>
      <BotonCasa />
      <Monedas />
      {children}
    </View>
  );
});

const estilos = StyleSheet.create({
  fondo: { flex: 1, justifyContent: "center", overflow: "hidden" },
  letrero: { marginTop: 2, backgroundColor: "#8D6E63", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  letreroTexto: { color: "#fff", fontWeight: "800" },
  dialogo: { position: "absolute", top: 14, left: 90, right: 90, alignItems: "center" },
});
