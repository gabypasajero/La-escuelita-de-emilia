import { useVideoPlayer, VideoView, type VideoSource } from "expo-video";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";

/**
 * Videos de cada paso de las rutinas (hechos con Higgsfield, ver
 * docs/PROMPTS_HIGGSFIELD.md): manos en primera persona y Emilia cepillándose
 * frente al espejo. Se repiten en bucle, sin sonido (la voz es de Emilia), y
 * quedan guardados en la tablet para jugar sin internet.
 */
const MP4: Record<"manos" | "dientes", VideoSource[]> = {
  manos: [
    require("../assets/rutinas/manos-0-mojar.mp4"),
    require("../assets/rutinas/manos-1-jabon.mp4"),
    require("../assets/rutinas/manos-2-palmas.mp4"),
    require("../assets/rutinas/manos-3-dorso.mp4"),
    require("../assets/rutinas/manos-4-dedos.mp4"),
    require("../assets/rutinas/manos-5-unas.mp4"),
    require("../assets/rutinas/manos-6-enjuagar.mp4"),
    require("../assets/rutinas/manos-7-secar.mp4"),
  ],
  dientes: [
    require("../assets/rutinas/dientes-0-arriba.mp4"),
    require("../assets/rutinas/dientes-1-abajo.mp4"),
    require("../assets/rutinas/dientes-2-juntos.mp4"),
    require("../assets/rutinas/dientes-3-atras.mp4"),
    require("../assets/rutinas/dientes-4-lengua.mp4"),
  ],
};
/** Los mismos videos en WebM (formato abierto): para navegadores que no reproducen MP4. */
const WEBM: Record<"manos" | "dientes", VideoSource[]> = {
  manos: [
    require("../assets/rutinas/manos-0-mojar.webm"),
    require("../assets/rutinas/manos-1-jabon.webm"),
    require("../assets/rutinas/manos-2-palmas.webm"),
    require("../assets/rutinas/manos-3-dorso.webm"),
    require("../assets/rutinas/manos-4-dedos.webm"),
    require("../assets/rutinas/manos-5-unas.webm"),
    require("../assets/rutinas/manos-6-enjuagar.webm"),
    require("../assets/rutinas/manos-7-secar.webm"),
  ],
  dientes: [
    require("../assets/rutinas/dientes-0-arriba.webm"),
    require("../assets/rutinas/dientes-1-abajo.webm"),
    require("../assets/rutinas/dientes-2-juntos.webm"),
    require("../assets/rutinas/dientes-3-atras.webm"),
    require("../assets/rutinas/dientes-4-lengua.webm"),
  ],
};

/** En web se elige el formato que el navegador puede reproducir; en la app nativa, MP4. */
function usarWebm(): boolean {
  if (Platform.OS !== "web" || typeof document === "undefined") return false;
  const v = document.createElement("video");
  return !v.canPlayType('video/mp4; codecs="avc1.4D401F"') && !!v.canPlayType('video/webm; codecs="vp9"');
}
export const VIDEOS_RUTINA = usarWebm() ? WEBM : MP4;

/** El video del paso actual, en bucle. Al cambiar de paso cambia el video. */
export function VideoRutina({ rutina, paso, tamano = 420 }: { rutina: "manos" | "dientes"; paso: number; tamano?: number }) {
  const fuente = VIDEOS_RUTINA[rutina][paso] ?? null;
  const reproductor = useVideoPlayer(fuente, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  useEffect(() => {
    if (!fuente) return;
    reproductor.replace(fuente);
    reproductor.loop = true;
    reproductor.muted = true;
    reproductor.play();
  }, [fuente, reproductor]);

  return (
    <View style={[estilos.marco, { width: tamano, height: tamano, borderRadius: tamano * 0.08 }]}>
      <VideoView player={reproductor} style={{ width: tamano - 10, height: tamano - 10 }} contentFit="contain" nativeControls={false} allowsFullscreen={false} allowsPictureInPicture={false} />
    </View>
  );
}

const estilos = StyleSheet.create({
  marco: { overflow: "hidden", backgroundColor: "#E1F5FE", borderWidth: 5, borderColor: "#fff" },
});
