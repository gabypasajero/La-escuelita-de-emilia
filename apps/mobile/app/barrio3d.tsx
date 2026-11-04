import { Redirect, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Globo } from "../components/Personajes";
import { Monedas, useJuego } from "../lib/juego";
import type { Barrio3D, Direccion } from "../lib/barrio3d";
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
  const barrioRef = useRef<Barrio3D | null>(null);
  const [cerca, setCerca] = useState<Lugar | null>(null);
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
        alCerca: setCerca,
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
      barrioRef.current = barrio;
      decir(`¡Hola, ${perfil.nombre}! Toca el suelo o usa las flechas para caminar. Arrastra el dedo para mirar el barrio.`);
    });
    return () => {
      vivo = false;
      barrio?.destruir();
      barrioRef.current = null;
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
      {/* Acercar, alejar y volver a mirar al niño */}
      <View style={estilos.zoom}>
        <Boton etiqueta="Acercar" texto="➕" alTocar={() => barrioRef.current?.zoom(1)} />
        <Boton etiqueta="Alejar" texto="➖" alTocar={() => barrioRef.current?.zoom(-1)} />
        <Boton etiqueta="Centrar en mí" texto="🎯" alTocar={() => barrioRef.current?.centrar()} />
      </View>
      {/* Flechas para caminar (mantener apretadas) */}
      <View style={estilos.cruceta}>
        <Flecha d="arriba" texto="⬆️" barrio={barrioRef} estilo={{ left: 70, top: 0 }} />
        <Flecha d="izquierda" texto="⬅️" barrio={barrioRef} estilo={{ left: 0, top: 70 }} />
        <Flecha d="derecha" texto="➡️" barrio={barrioRef} estilo={{ left: 140, top: 70 }} />
        <Flecha d="abajo" texto="⬇️" barrio={barrioRef} estilo={{ left: 70, top: 140 }} />
      </View>
      {cerca && (
        <Pressable style={estilos.entrar} onPress={() => barrioRef.current?.entrar()} accessibilityLabel={`Entrar a ${cerca.nombre}`}>
          <Text style={estilos.entrarTexto}>🚪 Entrar: {cerca.nombre}</Text>
        </Pressable>
      )}
      <Pressable style={estilos.volver} onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} accessibilityLabel="Volver al barrio 2D">
        <Text style={estilos.botonTexto}>🗺️ Barrio 2D</Text>
      </Pressable>
    </View>
  );
}

function Boton({ etiqueta, texto, alTocar }: { etiqueta: string; texto: string; alTocar: () => void }) {
  return (
    <Pressable style={estilos.redondo} onPress={alTocar} accessibilityLabel={etiqueta}>
      <Text style={estilos.redondoTexto}>{texto}</Text>
    </Pressable>
  );
}

function Flecha({ d, texto, barrio, estilo }: { d: Direccion; texto: string; barrio: { current: Barrio3D | null }; estilo: object }) {
  return (
    <Pressable
      style={[estilos.flecha, estilo]}
      focusable={false}
      onPressIn={() => barrio.current?.flecha(d, true)}
      onPressOut={() => barrio.current?.flecha(d, false)}
      accessibilityLabel={`Caminar hacia ${d}`}
    >
      <Text style={estilos.redondoTexto}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  zoom: { position: "absolute", right: 16, top: 90, gap: 10 },
  redondo: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center" },
  redondoTexto: { fontSize: 28 },
  cruceta: { position: "absolute", left: 20, bottom: 20, width: 210, height: 210 },
  flecha: { position: "absolute", width: 70, height: 70, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.85)", alignItems: "center", justifyContent: "center" },
  entrar: { position: "absolute", bottom: 30, alignSelf: "center", backgroundColor: "#43A047", borderRadius: 30, paddingHorizontal: 28, paddingVertical: 16, borderWidth: 4, borderColor: "#fff" },
  entrarTexto: { color: "#fff", fontSize: 24, fontWeight: "900" },
  fondo: { flex: 1, backgroundColor: "#9FDBFF" },
  dialogo: { position: "absolute", top: 14, left: 120, right: 120, alignItems: "center" },
  volver: { position: "absolute", top: 16, left: 16, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  botonTexto: { fontSize: 16, fontWeight: "800", color: "#3B2F5C" },
  aviso: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 },
  avisoTexto: { fontSize: 20, textAlign: "center", color: "#3B2F5C" },
  boton: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
});
