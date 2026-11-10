import { Redirect, router, useFocusEffect, useLocalSearchParams, type Href } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Rebote } from "../components/Rebote";
import { FabricaIconos } from "../components/FabricaIconos";
import { Icono } from "../components/Iconos";
import { Globo } from "../components/Personajes";
import { Monedas, useJuego } from "../lib/juego";
import { conVentana } from "../lib/ventana";
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
  const [hud, setHud] = useState<Hud | null>(null);
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
        alVentana: (v) => { if (v) router.push(conVentana(v.ruta) as Href); },
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

  // Al volver de una ventana de juego (o de una pantalla 2D), el mundo retoma el control.
  useFocusEffect(useCallback(() => {
    mundo.current?.pausar(false);
    mundo.current?.cerrarVentana();
    return () => mundo.current?.pausar(true);
  }, []));

  // Cada moneda ganada en una ventana de juego se celebra también en el escenario.
  const monedasAntes = useRef(juego.monedas);
  useEffect(() => {
    if (juego.monedas > monedasAntes.current) mundo.current?.celebrar();
    monedasAntes.current = juego.monedas;
  }, [juego.monedas]);

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
      <FabricaIconos />
      <View ref={contenedor} style={StyleSheet.absoluteFill} />
      {!!dicho && <View style={estilos.dialogo} pointerEvents="none"><Globo texto={dicho} /></View>}
      <Monedas />
      {!!hud?.fichas?.length && (
        <View style={estilos.fichas} pointerEvents="none">
          {hud.fichas.map((f, i) => (
            <View key={f.id ?? i} style={estilos.ficha}>
              {!!f.icono && <Icono e={f.icono} tam={30} sinSombra />}
              <Text style={estilos.fichaTexto}>{f.texto}</Text>
            </View>
          ))}
        </View>
      )}
      {!!hud?.pregunta && (
        <View style={estilos.pregunta} pointerEvents="box-none">
          <View style={estilos.preguntaCaja}>
            {!!hud.pregunta.icono && <Icono e={hud.pregunta.icono} tam={44} sinSombra />}
            <Text style={estilos.preguntaTexto}>{hud.pregunta.texto}</Text>
          </View>
          <View style={estilos.fila}>
            {hud.pregunta.opciones.map((o) => (
              <Rebote key={o.id} style={estilos.opcion} onPress={() => mundo.current?.accion(o.id)} accessibilityLabel={o.texto ?? o.id}>
                <Icono e={o.icono} tam={58} sinSombra />
                {!!o.texto && <Text style={estilos.opcionTexto}>{o.texto}</Text>}
              </Rebote>
            ))}
          </View>
        </View>
      )}
      {!!hud?.botones?.length && !hud.pregunta && (
        <View style={[estilos.pregunta, estilos.fila]} pointerEvents="box-none">
          {hud.botones.map((b) => (
            <Rebote key={b.id} style={[estilos.opcion, b.apagado && estilos.apagado]} disabled={b.apagado} onPress={() => mundo.current?.accion(b.id)} accessibilityLabel={b.texto}>
              <Icono e={b.icono} tam={50} sinSombra />
              <Text style={estilos.opcionTexto}>{b.texto}</Text>
            </Rebote>
          ))}
        </View>
      )}
      <View style={estilos.botones} pointerEvents="box-none">
        <Pressable style={estilos.redondo} onPress={() => mundo.current?.volver()} accessibilityLabel="Volver">
          <Icono e="⬅️" tam={50} sinSombra />
        </Pressable>
        {!!titulo && !dicho && <View style={estilos.titulo} pointerEvents="none"><Text style={estilos.tituloTexto}>{titulo}</Text></View>}
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
  fichas: { position: "absolute", top: 92, right: 16, gap: 8, alignItems: "flex-end" },
  ficha: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 6 },
  fichaTexto: { fontSize: 18, fontWeight: "800", color: "#3B2F5C" },
  pregunta: { position: "absolute", left: 12, right: 12, bottom: 14, alignItems: "center", gap: 10 },
  preguntaCaja: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 22, paddingHorizontal: 18, paddingVertical: 8 },
  preguntaTexto: { fontSize: 22, fontWeight: "900", color: "#3B2F5C" },
  fila: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
  opcion: { minWidth: 92, minHeight: 92, borderRadius: 26, backgroundColor: "#fff", borderWidth: 4, borderColor: "#FFD54F", alignItems: "center", justifyContent: "center", paddingHorizontal: 10, paddingVertical: 6, boxShadow: "0 5px 0 rgba(59,47,92,0.25)" },
  opcionTexto: { fontSize: 16, fontWeight: "800", color: "#3B2F5C", textAlign: "center" },
  apagado: { opacity: 0.45 },
  aviso: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 },
  avisoTexto: { fontSize: 20, textAlign: "center", color: "#3B2F5C" },
  boton: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
});
