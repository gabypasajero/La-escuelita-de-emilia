import { Redirect, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Globo } from "../components/Personajes";
import { Monedas, useJuego } from "../lib/juego";
import type { Barrio3D } from "../lib/barrio3d";
import type { Lugar } from "../lib/lugares";
import { hablar } from "../lib/voz";

/**
 * Prueba del barrio en 3D (solo en la versión web, por ahora). Usa los mismos
 * lugares y juegos que el barrio 2D: tocar el suelo para caminar y una casa
 * para entrar.
 */
export default function Barrio3D() {
  const { perfil, estrellas, cargado, jugadores, activoId } = useJuego();
  const contenedor = useRef<View>(null);
  const [dicho, setDicho] = useState("¡Bienvenidos al barrio en 3D! Toca el suelo para caminar.");
  const estrellasRef = useRef(estrellas);
  estrellasRef.current = estrellas;

  useEffect(() => {
    if (Platform.OS !== "web" || !perfil || !contenedor.current) return;
    let barrio: Barrio3D | null = null;
    let vivo = true;
    const decir = (t: string) => { setDicho(t); void hablar(t); };
    void import("../lib/barrio3d").then(({ crearBarrio3D }) => {
      if (!vivo) return;
      barrio = crearBarrio3D(contenedor.current as unknown as HTMLElement, {
        apariencia: perfil.apariencia,
        nombre: perfil.nombre,
        alTocarVecino: decir,
        // Frente a una puerta, Emilia recuerda cómo entrar (sin botones en pantalla).
        alCerca: (l) => { if (l) setDicho(`${l.nombre}: presiona Enter para entrar.`); },
        alEntrar: async (l: Lugar) => {
          if (l.estrellas && estrellasRef.current < l.estrellas) {
            return decir(`La ${l.nombre.toLowerCase()} se abre con ${l.estrellas} estrellas. ¡Te faltan ${l.estrellas - estrellasRef.current}!`);
          }
          if (!l.ruta) return decir(l.frase);
          setDicho(l.frase);
          await Promise.race([hablar(l.frase), new Promise((r) => setTimeout(r, 2500))]);
          router.push(l.ruta);
        },
      });
      decir(`¡Hola, ${perfil.nombre}! Camina con las flechas del teclado o tocando el suelo. Arrastra el dedo para mirar el barrio.`);
    });
    return () => {
      vivo = false;
      barrio?.destruir();
    };
  }, [perfil]);

  if (cargado && jugadores.length && !activoId) return <Redirect href="/quien-juega" />;

  if (Platform.OS !== "web") {
    return (
      <View style={estilos.aviso}>
        <Text style={estilos.avisoTexto}>La prueba en 3D por ahora funciona en la versión web.</Text>
        <Pressable style={estilos.boton} onPress={() => router.back()}><Text style={estilos.botonTexto}>Volver</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={estilos.fondo}>
      <View ref={contenedor} style={StyleSheet.absoluteFill} />
      <View style={estilos.dialogo} pointerEvents="none"><Globo texto={dicho} /></View>
      <Monedas />
      <Pressable style={estilos.volver} onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} accessibilityLabel="Volver al barrio 2D">
        <Text style={estilos.botonTexto}>🗺️ Barrio 2D</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "#9FDBFF" },
  dialogo: { position: "absolute", top: 14, left: 120, right: 120, alignItems: "center" },
  volver: { position: "absolute", top: 16, left: 16, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  botonTexto: { fontSize: 16, fontWeight: "800", color: "#3B2F5C" },
  aviso: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 },
  avisoTexto: { fontSize: 20, textAlign: "center", color: "#3B2F5C" },
  boton: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
});
