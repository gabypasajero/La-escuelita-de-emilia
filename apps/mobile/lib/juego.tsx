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

interface Estado {
  perfil: Perfil | null;
  monedas: number;
  comprados: string[];
  puestos: Partial<Record<Ranura, string>>;
}

interface Juego extends Estado {
  cargado: boolean;
  guardarPerfil: (p: Perfil) => void;
  /** Suma monedas por un logro y muestra la animación "+n". */
  ganar: (n: number) => void;
  comprar: (id: string) => boolean;
  /** Pone o saca un accesorio (si ya estaba puesto, lo saca). */
  alternar: (id: string) => void;
  accesorioPuesto: (r: Ranura) => Accesorio | undefined;
}

const CLAVE = "escuelita:juego:v1";
const INICIAL: Estado = { perfil: null, monedas: 0, comprados: [], puestos: {} };
const Contexto = createContext<Juego | null>(null);

export function ProveedorJuego({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(INICIAL);
  const [cargado, setCargado] = useState(false);
  const [premio, setPremio] = useState<{ n: number; clave: number } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(CLAVE)
      .then((t) => t && setEstado({ ...INICIAL, ...JSON.parse(t) }))
      .catch(() => {})
      .finally(() => setCargado(true));
  }, []);

  useEffect(() => {
    if (cargado) AsyncStorage.setItem(CLAVE, JSON.stringify(estado)).catch(() => {});
  }, [estado, cargado]);

  const guardarPerfil = useCallback((perfil: Perfil) => setEstado((e) => ({ ...e, perfil })), []);
  const ganar = useCallback((n: number) => {
    setEstado((e) => ({ ...e, monedas: e.monedas + n }));
    setPremio({ n, clave: Date.now() });
  }, []);

  const estadoRef = useRef(estado);
  estadoRef.current = estado;
  const comprar = useCallback((id: string) => {
    const a = ACCESORIOS.find((x) => x.id === id);
    const e = estadoRef.current;
    if (!a || e.comprados.includes(id) || e.monedas < a.precio) return false;
    setEstado({ ...e, monedas: e.monedas - a.precio, comprados: [...e.comprados, id], puestos: { ...e.puestos, [a.ranura]: id } });
    return true;
  }, []);

  const alternar = useCallback((id: string) => {
    const a = ACCESORIOS.find((x) => x.id === id);
    if (!a) return;
    setEstado((e) => ({ ...e, puestos: { ...e.puestos, [a.ranura]: e.puestos[a.ranura] === id ? undefined : id } }));
  }, []);

  const valor = useMemo<Juego>(
    () => ({
      ...estado,
      cargado,
      guardarPerfil,
      ganar,
      comprar,
      alternar,
      accesorioPuesto: (r) => ACCESORIOS.find((a) => a.id === estado.puestos[r]),
    }),
    [estado, cargado, guardarPerfil, ganar, comprar, alternar],
  );

  return (
    <Contexto.Provider value={valor}>
      {children}
      {premio && <Premio key={premio.clave} n={premio.n} />}
    </Contexto.Provider>
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
});
