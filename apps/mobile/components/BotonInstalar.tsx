import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { TextoIconos } from "./Iconos";

/**
 * Botón visible "📲 Instalar el juego" (solo en la versión web).
 * - Si el navegador lo permite, abre el aviso de instalación de una vez.
 * - Si no, muestra los pasos según el navegador de la tablet (Chrome, Samsung,
 *   Safari, o un navegador dentro de WhatsApp/Facebook, que no permite instalar).
 * - Si el juego ya está instalado (abierto desde el ícono), no aparece.
 */
type AvisoInstalar = { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
type Ventana = {
  __instalarApp?: AvisoInstalar | null;
  matchMedia?: (q: string) => { matches: boolean };
  navigator?: { userAgent: string; standalone?: boolean; clipboard?: { writeText: (t: string) => Promise<void> } };
  location?: { origin: string };
  addEventListener?: (e: string, f: () => void) => void;
  removeEventListener?: (e: string, f: () => void) => void;
};
const w = globalThis as unknown as Ventana;

function yaInstalada() {
  return !!(w.matchMedia?.("(display-mode: fullscreen), (display-mode: standalone), (display-mode: minimal-ui)").matches || w.navigator?.standalone);
}

type Navegador = "dentro-de-app" | "samsung" | "ios" | "firefox" | "chrome";
function cualNavegador(): Navegador {
  const ua = w.navigator?.userAgent ?? "";
  if (/FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Line\/|; wv\)|GSA\//i.test(ua)) return "dentro-de-app";
  if (/SamsungBrowser/i.test(ua)) return "samsung";
  if (/iPad|iPhone|iPod/i.test(ua) || (/Macintosh/i.test(ua) && "ontouchend" in globalThis)) return "ios";
  if (/Firefox/i.test(ua)) return "firefox";
  return "chrome";
}

const PASOS: Record<Navegador, { titulo: string; pasos: string[] }> = {
  "dentro-de-app": {
    titulo: "Este navegador no deja instalar",
    pasos: [
      "Abriste el link dentro de otra app (WhatsApp, Facebook, Claude, Gmail…).",
      "Toca los tres puntos ⋮ (arriba a la derecha) y elige «Abrir en Chrome» o «Abrir en el navegador».",
      "Ya en Chrome, vuelve a tocar «📲 Instalar el juego».",
      "Si no aparece esa opción: copia el link (botón de abajo), abre Chrome y pégalo en la barra de arriba.",
    ],
  },
  samsung: {
    titulo: "Instalar en Samsung Internet",
    pasos: [
      "Toca el menú ≡ (abajo a la derecha).",
      "Elige «Agregar página a» y luego «Pantalla de inicio» (o «Pantalla Inicio»).",
      "También puede aparecer un ícono ⬇️ en la barra de direcciones: tócalo y elige «Instalar».",
      "Busca el ícono de Emilia y Tito en la pantalla de la tablet.",
    ],
  },
  ios: {
    titulo: "Instalar en iPad",
    pasos: [
      "Abre el link en Safari.",
      "Toca el botón Compartir (cuadrado con flecha ⬆️).",
      "Elige «Agregar a inicio» y luego «Agregar».",
    ],
  },
  firefox: {
    titulo: "Instalar en Firefox",
    pasos: ["Toca los tres puntos ⋮.", "Elige «Instalar» o «Agregar a la pantalla de inicio»."],
  },
  chrome: {
    titulo: "Instalar en Chrome",
    pasos: [
      "Toca los tres puntos ⋮ (arriba a la derecha de Chrome).",
      "Elige «Instalar app» o «Agregar a la pantalla principal» y luego «Instalar».",
      "Espera unos segundos: aparecerá el ícono de Emilia y Tito en la pantalla de la tablet.",
      "Si no ves esas opciones, puede que ya esté instalada: busca «Escuelita» entre las apps de la tablet.",
    ],
  },
};

export function BotonInstalar({ estilo }: { estilo?: object }) {
  const [instalada, setInstalada] = useState(yaInstalada);
  const [ayuda, setAyuda] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const listo = () => setInstalada(true);
    w.addEventListener?.("appinstalled", listo);
    return () => w.removeEventListener?.("appinstalled", listo);
  }, []);

  if (Platform.OS !== "web" || instalada) return null;
  const nav = cualNavegador();
  const guia = PASOS[nav];

  const instalar = async () => {
    const aviso = w.__instalarApp;
    if (aviso && nav !== "dentro-de-app") {
      try {
        await aviso.prompt();
        const r = await aviso.userChoice;
        w.__instalarApp = null; // el aviso de Chrome sirve una sola vez
        if (r.outcome === "accepted") return setInstalada(true);
      } catch {
        /* si falla, se muestran los pasos */
      }
    }
    setAyuda(true);
  };

  const copiar = async () => {
    try {
      await w.navigator?.clipboard?.writeText((w.location?.origin ?? "") + "/");
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <>
      <Pressable style={[estilos.boton, estilo]} onPress={instalar} accessibilityLabel="Instalar el juego">
        <TextoIconos estilo={estilos.botonTexto} texto={`📲 Instalar el juego`} />
      </Pressable>
      <Modal visible={ayuda} transparent animationType="fade" onRequestClose={() => setAyuda(false)}>
        <View style={estilos.velo}>
          <View style={estilos.caja}>
            <Text style={estilos.titulo}>{guia.titulo}</Text>
            {guia.pasos.map((p, i) => (
              <Text key={i} style={estilos.paso}>
                {i + 1}. {p}
              </Text>
            ))}
            <View style={estilos.fila}>
              {nav === "dentro-de-app" && (
                <Pressable style={[estilos.accion, { backgroundColor: "#1E88E5" }]} onPress={copiar} accessibilityLabel="Copiar link">
                  <TextoIconos estilo={estilos.accionTexto} texto={copiado ? "✅ Link copiado" : "📋 Copiar link"} />
                </Pressable>
              )}
              <Pressable style={estilos.accion} onPress={() => setAyuda(false)} accessibilityLabel="Cerrar">
                <Text style={estilos.accionTexto}>Entendido</Text>
              </Pressable>
            </View>
            <Text style={estilos.link}>{w.location?.origin}/</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const estilos = StyleSheet.create({
  boton: { backgroundColor: "#43A047", borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 3, borderColor: "#fff" },
  botonTexto: { color: "#fff", fontSize: 18, fontWeight: "900" },
  velo: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", padding: 16 },
  caja: { backgroundColor: "#fff", borderRadius: 24, padding: 24, maxWidth: 560, width: "100%", gap: 10 },
  titulo: { fontSize: 24, fontWeight: "900", color: "#3B2F5C", marginBottom: 4 },
  paso: { fontSize: 18, color: "#333", lineHeight: 26 },
  fila: { flexDirection: "row", gap: 12, justifyContent: "flex-end", marginTop: 8, flexWrap: "wrap" },
  accion: { backgroundColor: "#43A047", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 12 },
  accionTexto: { color: "#fff", fontSize: 18, fontWeight: "800" },
  link: { fontSize: 13, color: "#888", textAlign: "center", marginTop: 4 },
});
