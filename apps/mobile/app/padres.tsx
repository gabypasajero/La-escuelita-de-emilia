import { crearPuertaParental } from "@escuelita/core";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Pantalla } from "../components/Pantalla";
import { COLORES } from "../lib/tema";

/** Zona de adultos detrás de la puerta parental (requisito Apple Kids / Google Families). */
export default function Padres() {
  const [puerta, setPuerta] = useState(() => crearPuertaParental());
  const [respuesta, setRespuesta] = useState("");
  const [abierta, setAbierta] = useState(false);

  if (!abierta) {
    return (
      <Pantalla>
        <Text style={estilos.titulo}>Solo para adultos</Text>
        <Text style={estilos.texto}>{puerta.pregunta}</Text>
        <TextInput style={estilos.input} keyboardType="number-pad" value={respuesta} onChangeText={setRespuesta} />
        <Pressable
          style={estilos.boton}
          onPress={() => {
            if (puerta.verificar(respuesta)) setAbierta(true);
            else {
              setPuerta(crearPuertaParental());
              setRespuesta("");
            }
          }}
        >
          <Text style={estilos.botonTexto}>Entrar</Text>
        </Pressable>
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <Text style={estilos.titulo}>Panel de padres</Text>
      <Instalar />
      <View style={estilos.lista}>
        <Text style={estilos.texto}>• Perfiles de niños (alias y avatar)</Text>
        <Text style={estilos.texto}>• Progreso por módulo y estrellas</Text>
        <Text style={estilos.texto}>• Tiempo de pantalla diario</Text>
        <Text style={estilos.texto}>• Suscripción y privacidad (exportar / borrar datos)</Text>
        <Text style={estilos.nota}>Se conecta a la API en la fase 2 (ver docs/ARQUITECTURA.md).</Text>
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  instalarCaja: { alignItems: "center", gap: 8, marginBottom: 16, maxWidth: 520 },
  instalar: { backgroundColor: "#43A047", borderRadius: 20, paddingHorizontal: 24, paddingVertical: 14 },
  instalarTexto: { color: "#fff", fontSize: 20, fontWeight: "900" },
  instalada: { fontSize: 16, color: "#2E7D32", fontWeight: "800", textAlign: "center" },
  titulo: { fontSize: 28, fontWeight: "800", color: COLORES.texto, marginBottom: 16 },
  texto: { fontSize: 18, color: COLORES.texto, marginBottom: 8 },
  nota: { fontSize: 14, color: COLORES.texto, opacity: 0.6, marginTop: 16 },
  input: { width: 160, fontSize: 28, borderWidth: 2, borderColor: COLORES.texto, borderRadius: 12, padding: 8, textAlign: "center", marginBottom: 16 },
  boton: { backgroundColor: COLORES.texto, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  botonTexto: { color: "#fff", fontSize: 18, fontWeight: "700" },
  lista: { alignItems: "flex-start", maxWidth: 520 },
});

/** Botón para instalar la app en la tablet (versión web instalable). */
function Instalar() {
  const [estado, setEstado] = useState<"listo" | "instalada" | "manual">("listo");
  if (Platform.OS !== "web") return null;
  const w = globalThis as unknown as { __instalarApp?: { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }; matchMedia?: (q: string) => { matches: boolean } };
  const yaInstalada = w.matchMedia?.("(display-mode: fullscreen), (display-mode: standalone)").matches;
  if (yaInstalada) return <Text style={estilos.instalada}>✅ La app ya está instalada en esta tablet.</Text>;
  return (
    <View style={estilos.instalarCaja}>
      <Pressable
        style={estilos.instalar}
        accessibilityLabel="Instalar en esta tablet"
        onPress={async () => {
          if (!w.__instalarApp) return setEstado("manual");
          await w.__instalarApp.prompt();
          const r = await w.__instalarApp.userChoice;
          setEstado(r.outcome === "accepted" ? "instalada" : "listo");
        }}
      >
        <Text style={estilos.instalarTexto}>📲 Instalar en esta tablet</Text>
      </Pressable>
      {estado === "instalada" && <Text style={estilos.instalada}>¡Listo! Busca el ícono de Emilia en la pantalla de inicio.</Text>}
      {estado === "manual" && (
        <Text style={estilos.nota}>
          En Chrome: menú ⋮ → «Instalar app» o «Agregar a la pantalla de inicio». En iPad (Safari): botón Compartir → «Agregar a inicio».
        </Text>
      )}
    </View>
  );
}
