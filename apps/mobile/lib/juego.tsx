import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

/** Cómo se ve el personaje del niño. */
export interface Apariencia {
  piel: string;
  pelo: string;
  peinado: "corto" | "colitas" | "largo" | "rizado";
  ropa: string;
}

export interface Perfil {
  nombre: string;
  apariencia: Apariencia;
}

export type Ranura = "cabeza" | "cara" | "cuello" | "mano" | "tito";

export interface Accesorio {
  id: string;
  nombre: string;
  emoji: string;
  precio: number;
  ranura: Ranura;
}

/** Catálogo de la Tienda de disfraces. Las monedas solo se ganan jugando: nunca con dinero. */
export const ACCESORIOS: Accesorio[] = [
  { id: "gorro", nombre: "Gorro", emoji: "🧢", precio: 5, ranura: "cabeza" },
  { id: "mono", nombre: "Moño", emoji: "🎀", precio: 5, ranura: "cabeza" },
  { id: "flores", nombre: "Corona de flores", emoji: "🌸", precio: 8, ranura: "cabeza" },
  { id: "sombrero", nombre: "Sombrero de mago", emoji: "🎩", precio: 12, ranura: "cabeza" },
  { id: "corona", nombre: "Corona", emoji: "👑", precio: 20, ranura: "cabeza" },
  { id: "lentes", nombre: "Lentes", emoji: "👓", precio: 6, ranura: "cara" },
  { id: "gafas", nombre: "Lentes de sol", emoji: "🕶️", precio: 10, ranura: "cara" },
  { id: "bufanda", nombre: "Bufanda", emoji: "🧣", precio: 8, ranura: "cuello" },
  { id: "medalla", nombre: "Medalla", emoji: "🏅", precio: 15, ranura: "cuello" },
  { id: "globo", nombre: "Globo", emoji: "🎈", precio: 4, ranura: "mano" },
  { id: "osito", nombre: "Osito", emoji: "🧸", precio: 10, ranura: "mano" },
  { id: "varita", nombre: "Varita de estrellas", emoji: "🪄", precio: 18, ranura: "mano" },
  { id: "tito-mono", nombre: "Moño para Tito", emoji: "🎀", precio: 6, ranura: "tito" },
  { id: "tito-corona", nombre: "Corona para Tito", emoji: "👑", precio: 15, ranura: "tito" },
];

/** Todo lo de un niño: su personaje, sus monedas y lo que compró. */
interface Estado {
  perfil: Perfil | null;
  monedas: number;
  /** Se juntan para desbloquear lugares nuevos (no se gastan). */
  estrellas: number;
  comprados: string[];
  puestos: Partial<Record<Ranura, string>>;
}

export interface Jugador extends Estado {
  id: string;
  perfil: Perfil;
}

interface Juego extends Estado {
  cargado: boolean;
  jugadores: Jugador[];
  /** Quién juega ahora (se pregunta cada vez que se abre el juego). */
  activoId: string | null;
  elegirJugador: (id: string | null) => void;
  /** Crea un jugador nuevo (si no hay activo) o actualiza el personaje del activo. */
  guardarPerfil: (p: Perfil) => void;
  /** Suma monedas por un logro y muestra la animación "+n". */
  ganar: (n: number) => void;
  /** Premia a un jugador específico (en "Jugar juntos"). */
  ganarPara: (id: string, n: number) => void;
  comprar: (id: string) => boolean;
  /** Pone o saca un accesorio (si ya estaba puesto, lo saca). */
  alternar: (id: string) => void;
  accesorioPuesto: (r: Ranura) => Accesorio | undefined;
  /** Aviso de Emilia cuando alcanza para algo nuevo (se dice al volver al barrio). */
  aviso: string | null;
  limpiarAviso: () => void;
}

const CLAVE = "escuelita:jugadores:v2";
const CLAVE_ANTIGUA = "escuelita:juego:v1";
const VACIO: Estado = { perfil: null, monedas: 0, estrellas: 0, comprados: [], puestos: {} };

/** Lugares que se abren al juntar estrellas. */
export const DESBLOQUEOS = { arenero: 10 } as const;
const Contexto = createContext<Juego | null>(null);

/** Qué accesorio nuevo alcanza a comprar ahora y antes no (el más caro de esos). */
export function nuevoAlcanzable(antes: number, ahora: number, comprados: string[]) {
  return ACCESORIOS.filter((a) => !comprados.includes(a.id) && a.precio > antes && a.precio <= ahora).sort((x, y) => y.precio - x.precio)[0];
}

export function ProveedorJuego({ children }: { children: ReactNode }) {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [activoId, setActivoId] = useState<string | null>(null);
  const [cargado, setCargado] = useState(false);
  const [premio, setPremio] = useState<{ n: number; clave: number } | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem(CLAVE);
      if (t) return setJugadores((JSON.parse(t) as Jugador[]).map((j) => ({ ...VACIO, ...j })));
      // Migra el único personaje de la versión anterior.
      const viejo = await AsyncStorage.getItem(CLAVE_ANTIGUA);
      const e = viejo ? (JSON.parse(viejo) as Estado) : null;
      if (e?.perfil) setJugadores([{ ...VACIO, ...e, perfil: e.perfil, id: "j1" }]);
    })()
      .catch(() => {})
      .finally(() => setCargado(true));
  }, []);

  useEffect(() => {
    if (cargado) AsyncStorage.setItem(CLAVE, JSON.stringify(jugadores)).catch(() => {});
  }, [jugadores, cargado]);

  const activo = jugadores.find((j) => j.id === activoId);
  const activoRef = useRef(activo);
  activoRef.current = activo;

  const actualizar = useCallback((cambio: (j: Jugador) => Jugador) => {
    setJugadores((js) => js.map((j) => (j.id === activoRef.current?.id ? cambio(j) : j)));
  }, []);

  const guardarPerfil = useCallback((perfil: Perfil) => {
    if (activoRef.current) return actualizar((j) => ({ ...j, perfil }));
    const id = `j${Date.now()}`;
    setJugadores((js) => [...js, { ...VACIO, perfil, id }]);
    setActivoId(id);
  }, [actualizar]);

  const ganar = useCallback((n: number) => {
    const j = activoRef.current;
    if (!j) return;
    const nuevo = nuevoAlcanzable(j.monedas, j.monedas + n, j.comprados);
    if (nuevo) setAviso(`¡${j.perfil.nombre}, ya tienes suficientes monedas para comprarte: ${nuevo.nombre}! Vamos a la tienda de disfraces.`);
    actualizar((x) => ({ ...x, monedas: x.monedas + n, estrellas: x.estrellas + 1 }));
    setPremio({ n, clave: Date.now() });
  }, [actualizar]);

  const ganarPara = useCallback((id: string, n: number) => {
    setJugadores((js) => js.map((j) => (j.id === id ? { ...j, monedas: j.monedas + n, estrellas: j.estrellas + 1 } : j)));
    setPremio({ n, clave: Date.now() });
  }, []);

  const comprar = useCallback((id: string) => {
    const a = ACCESORIOS.find((x) => x.id === id);
    const j = activoRef.current;
    if (!a || !j || j.comprados.includes(id) || j.monedas < a.precio) return false;
    actualizar((x) => ({ ...x, monedas: x.monedas - a.precio, comprados: [...x.comprados, id], puestos: { ...x.puestos, [a.ranura]: id } }));
    return true;
  }, [actualizar]);

  const alternar = useCallback((id: string) => {
    const a = ACCESORIOS.find((x) => x.id === id);
    if (!a) return;
    actualizar((x) => ({ ...x, puestos: { ...x.puestos, [a.ranura]: x.puestos[a.ranura] === id ? undefined : id } }));
  }, [actualizar]);

  const valor = useMemo<Juego>(() => {
    const e: Estado = activo ?? VACIO;
    return {
      ...e,
      cargado,
      jugadores,
      activoId: activo ? activo.id : null,
      elegirJugador: (id) => { setActivoId(id); setAviso(null); },
      guardarPerfil,
      ganar,
      ganarPara,
      comprar,
      alternar,
      accesorioPuesto: (r) => ACCESORIOS.find((a) => a.id === e.puestos[r]),
      aviso,
      limpiarAviso: () => setAviso(null),
    };
  }, [activo, jugadores, cargado, guardarPerfil, ganar, ganarPara, comprar, alternar, aviso]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      {premio && <Premio key={premio.clave} n={premio.n} />}
      {aviso && <AvisoVisual texto={aviso} />}
    </Contexto.Provider>
  );
}

/** Cartelito de Emilia (se ve en cualquier pantalla; la voz lo dice al volver al barrio). */
function AvisoVisual({ texto }: { texto: string }) {
  // Se esconde a los 5 s para no tapar el juego; Emilia lo repite con voz al volver al barrio.
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, [texto]);
  if (!visible) return null;
  return (
    <View style={estilos.aviso} pointerEvents="none">
      <Text style={estilos.avisoTexto}>👧 {texto}</Text>
    </View>
  );
}

export function useJuego() {
  const j = useContext(Contexto);
  if (!j) throw new Error("useJuego debe usarse dentro de ProveedorJuego");
  return j;
}

/** Animación de monedas ganadas: sube y se desvanece. */
function Premio({ n }: { n: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 1600, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [v]);
  return (
    <View style={estilos.premio} pointerEvents="none">
      <Animated.View
        style={{
          opacity: v.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 1, 0] }),
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [40, -60] }) },
            { scale: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.5, 1.2, 1] }) },
          ],
        }}
      >
        <Text style={estilos.premioTexto}>+{n} 🪙</Text>
      </Animated.View>
    </View>
  );
}

/** Contador de monedas para la esquina de las pantallas. */
export function Monedas() {
  const { monedas } = useJuego();
  return (
    <View style={estilos.monedas} pointerEvents="none">
      <Text style={estilos.monedasTexto}>🪙 {monedas}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  premio: { position: "absolute", top: "35%", left: 0, right: 0, alignItems: "center" },
  premioTexto: { fontSize: 56, fontWeight: "900", color: "#F9A825", textShadowColor: "#fff", textShadowRadius: 8 },
  monedas: { position: "absolute", top: 16, right: 16, backgroundColor: "#fff", borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 3, borderColor: "#F9A825", zIndex: 20 },
  monedasTexto: { fontSize: 22, fontWeight: "900", color: "#3B2F5C" },
  aviso: { position: "absolute", bottom: 16, left: 16, right: 16, alignItems: "center" },
  avisoTexto: { backgroundColor: "#FFF8E1", borderColor: "#F9A825", borderWidth: 3, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 18, fontWeight: "800", color: "#3B2F5C", maxWidth: 640, textAlign: "center" },
});
