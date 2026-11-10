import { Redirect, router, useLocalSearchParams, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Icono } from "../components/Iconos";
import { Globo } from "../components/Personajes";
import { Monedas, useJuego } from "../lib/juego";
import type { Hud, Mundo } from "../lib/tres/motor";

/**
 * El mundo de Emilia en 3D (versión web): el barrio y todos sus lugares como
 * una casa de juguetes para recorrer. Los juegos se abren en una ventana
 * flotante sobre el escenario. El mundo 2D sigue disponible para los
 * aparatos que no pueden con el 3D.
 */
export default function Mundo3D() {
  const juego = useJuego();
  const { perfil, cargado, jugadores, activoId } = juego;
  const { escena: escenaInicial } = useLocalSearchParams<{ escena?: string }>();
  const contenedor = useRef<View>(null);
  const mundo = useRef<Mundo | null>(null);
  const juegoRef = useRef(juego);
  juegoRef.current = juego;
  const [dicho, setDicho] = useState("");
  const [, setHud] = useState<Hud | null>(null);
  const [titulo, setTitulo] = useState("");

  useEffect(() => {
    if (Platform.OS !== "web" || !perfil || !contenedor.current) return;
    let vivo = true;
    void Promise.all([import("../lib/tres/motor"), import("../lib/tres/escenas/indice")]).then(([{ crearMundo }, { ESCENAS }]) => {
      if (!vivo) return;
      mundo.current = crearMundo(contenedor.current as unknown as HTMLElement, {
        apariencia: perfil.apariencia,
        nombre: perfil.nombre,
        accesorios: () => juegoRef.current.puestos,
        estrellas: () => juegoRef.current.estrellas,
        ganar: (n) => juegoRef.current.ganar(n),
        escenaInicial,
        alDecir: setDicho,
        alVentana: () => undefined,
        alHud: setHud,
        alRuta: (ruta) => router.push(ruta as Href),
        alEscena: (_id, t) => setTitulo(t),
        alSalir: () => (router.canGoBack() ? router.back() : router.replace("/")),
      }, ESCENAS);
      (globalThis as unknown as { __mundo3d?: Mundo }).__mundo3d = mundo.current;
    });
    return () => {
      vivo = false;
      mundo.current?.destruir();
      mundo.current = null;
    };
    // El mundo se crea una vez por jugador.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfil?.nombre]);

  // Si cambian los accesorios puestos, se actualizan en el personaje 3D.
  useEffect(() => mundo.current?.refrescar(), [juego.puestos]);

  if (cargado && jugadores.length && !activoId) return <Redirect href="/quien-juega" />;
  if (Platform.OS !== "web") {
    return (
      <View style={estilos.aviso}>
        <Text style={estilos.avisoTexto}>El mundo 3D por ahora funciona en la versión web.</Text>
        <Pressable style={estilos.boton} onPress={() => router.back()}><Text style={estilos.avisoTexto}>Volver</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={estilos.fondo}>
      <View ref={contenedor} style={StyleSheet.absoluteFill} />
      {!!dicho && <View style={estilos.dialogo} pointerEvents="none"><Globo texto={dicho} /></View>}
      <Monedas />
      <View style={estilos.botones} pointerEvents="box-none">
        <Pressable style={estilos.redondo} onPress={() => mundo.current?.volver()} accessibilityLabel="Volver">
          <Icono e="⬅️" tam={50} sinSombra />
        </Pressable>
        {!!titulo && <View style={estilos.titulo} pointerEvents="none"><Text style={estilos.tituloTexto}>{titulo}</Text></View>}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "#FFF8E1", overflow: "hidden" },
  dialogo: { position: "absolute", top: 14, left: 110, right: 110, alignItems: "center" },
  botones: { position: "absolute", top: 16, left: 16, flexDirection: "row", alignItems: "center", gap: 10 },
  redondo: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 4 },
  titulo: { backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6 },
  tituloTexto: { fontSize: 18, fontWeight: "900", color: "#3B2F5C" },
  aviso: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 },
  avisoTexto: { fontSize: 20, textAlign: "center", color: "#3B2F5C" },
  boton: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
});
