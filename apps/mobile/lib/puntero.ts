import { useMemo, useRef } from "react";
import { PanResponder, Platform, type LayoutChangeEvent, type View, type ViewProps } from "react-native";

/** Datos del punto: posición dentro de la superficie (px), presión (0–1) y si es lápiz. */
export interface Toque {
  x: number;
  y: number;
  presion: number;
  lapiz: boolean;
}

interface Manejadores {
  empezar: (t: Toque) => void;
  seguir: (t: Toque) => void;
  terminar?: () => void;
}

/** Evento de puntero del navegador (dedo, mouse o lápiz óptico). */
interface EventoPuntero {
  pointerId: number;
  pointerType: string;
  pressure: number;
  clientX: number;
  clientY: number;
  currentTarget: { getBoundingClientRect: () => { left: number; top: number }; setPointerCapture?: (id: number) => void };
}

/**
 * Superficie para dibujar o escribir que acepta dedo, mouse y lápiz óptico
 * (stylus, S Pen, Apple Pencil):
 * - En web usa eventos de puntero y `touch-action: none`, para que el
 *   navegador no confunda el lápiz con un gesto de desplazar la página.
 * - Con lápiz se ignora la palma apoyada en la pantalla.
 * - Entrega la presión del lápiz (para trazos más gruesos al apretar).
 * - En iOS y Android usa PanResponder (el sistema ya trata el lápiz como un toque).
 */
export function useSuperficieDibujo(m: Manejadores) {
  const manejadores = useRef(m);
  manejadores.current = m;
  const ref = useRef<View>(null);
  const origen = useRef({ x: 0, y: 0 });
  const activo = useRef<number | null>(null);
  const ultimoLapiz = useRef(0);

  const medir = () => ref.current?.measureInWindow((x, y) => { origen.current = { x, y }; });

  const props = useMemo<ViewProps>(() => {
    if (Platform.OS === "web") {
      // Ojo: los datos del evento del navegador se leen directo (copiarlo con {...e} los pierde).
      type Ev = { nativeEvent: EventoPuntero; currentTarget: EventoPuntero["currentTarget"] };
      const toque = (ev: Ev): Toque => {
        const e = ev.nativeEvent;
        const r = ev.currentTarget.getBoundingClientRect();
        const lapiz = e.pointerType === "pen";
        return { x: e.clientX - r.left, y: e.clientY - r.top, presion: lapiz ? e.pressure || 0.5 : 0.5, lapiz };
      };
      // Palma: si se está usando el lápiz, los toques de la mano no dibujan.
      const esPalma = (e: EventoPuntero) => e.pointerType === "touch" && Date.now() - ultimoLapiz.current < 1500;
      const web = {
        onPointerDown: (ev: Ev) => {
          const e = ev.nativeEvent;
          if (esPalma(e) || activo.current !== null) return;
          if (e.pointerType === "pen") ultimoLapiz.current = Date.now();
          activo.current = e.pointerId;
          // Seguir recibiendo el lápiz aunque salga un poco de la hoja (si el navegador lo permite).
          try { ev.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* sin captura igual funciona */ }
          manejadores.current.empezar(toque(ev));
        },
        onPointerMove: (ev: Ev) => {
          const e = ev.nativeEvent;
          if (activo.current !== e.pointerId) return;
          if (e.pointerType === "pen") ultimoLapiz.current = Date.now();
          manejadores.current.seguir(toque(ev));
        },
        onPointerUp: (ev: Ev) => {
          if (activo.current !== ev.nativeEvent.pointerId) return;
          activo.current = null;
          manejadores.current.terminar?.();
        },
        onPointerCancel: () => {
          activo.current = null;
          manejadores.current.terminar?.();
        },
      };
      return web as unknown as ViewProps;
    }

    const toqueNativo = (pageX: number, pageY: number, force?: number): Toque => ({
      x: pageX - origen.current.x,
      y: pageY - origen.current.y,
      presion: force && force > 0 ? Math.min(1, force) : 0.5,
      lapiz: false,
    });
    const responder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        medir();
        manejadores.current.empezar(toqueNativo(e.nativeEvent.pageX, e.nativeEvent.pageY, e.nativeEvent.force));
      },
      onPanResponderMove: (e) => manejadores.current.seguir(toqueNativo(e.nativeEvent.pageX, e.nativeEvent.pageY, e.nativeEvent.force)),
      onPanResponderRelease: () => manejadores.current.terminar?.(),
      onPanResponderTerminate: () => manejadores.current.terminar?.(),
    });
    return responder.panHandlers;
  }, []);

  // En web: que el navegador no use el lápiz o el dedo para desplazar la página ni seleccionar texto.
  const estilo = Platform.OS === "web" ? ({ touchAction: "none", userSelect: "none" } as object) : undefined;
  return { ref, estilo, props: { ...props, onLayout: (_: LayoutChangeEvent) => medir() } };
}
