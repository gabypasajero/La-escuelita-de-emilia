import { HERRAMIENTAS, usarHerramienta, type EtapaPlanta, type Herramienta } from "@escuelita/core";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";
import { Pantalla } from "../components/Pantalla";
import { Globo } from "../components/Personajes";
import { hablar } from "../lib/voz";

const ICONOS: Record<Herramienta, { emoji: string; nombre: string }> = {
  pala: { emoji: "⛏️", nombre: "Pala" },
  semilla: { emoji: "🌰", nombre: "Semilla" },
  manos: { emoji: "🤲", nombre: "Manos" },
  regadera: { emoji: "💧", nombre: "Agua" },
  sol: { emoji: "☀️", nombre: "Sol" },
};

/** El Huerto de Don Pedro: sembrar paso a paso hasta que salga una flor. */
export default function Huerto() {
  const [etapa, setEtapa] = useState<EtapaPlanta>("tierra");
  const [texto, setTexto] = useState("Hoy sembramos. Primero, un hoyito.");

  useEffect(() => void hablar("¡Llegó mi ayudante! Hoy sembramos. Primero, un hoyito."), []);

  function usar(h: Herramienta) {
    if (etapa === "flor") {
      setEtapa("tierra");
      setTexto("¡Otra vez! Primero, un hoyito.");
      hablar("¡Otra vez! Primero, un hoyito.");
      return;
    }
    const r = usarHerramienta(etapa, h);
    setEtapa(r.etapa);
    setTexto(r.frase);
    hablar(r.frase);
  }

  return (
    <Pantalla color="#DCEDC8">
      <View style={estilos.fila}>
        <Text style={estilos.donPedro}>👨‍🌾</Text>
        <Globo texto={texto} alLado="izquierda" />
      </View>
      <View style={estilos.escena}>
        <Planta etapa={etapa} />
      </View>
      <View style={estilos.herramientas}>
        {HERRAMIENTAS.map((h) => (
          <Pressable key={h} style={estilos.herramienta} onPress={() => usar(h)} accessibilityLabel={ICONOS[h].nombre}>
            <Text style={estilos.herramientaEmoji}>{ICONOS[h].emoji}</Text>
            <Text style={estilos.herramientaTexto}>{ICONOS[h].nombre}</Text>
          </Pressable>
        ))}
      </View>
    </Pantalla>
  );
}

function Planta({ etapa }: { etapa: EtapaPlanta }) {
  const humeda = etapa === "regada" || etapa === "brote" || etapa === "flor";
  return (
    <Svg width={260} height={220} viewBox="0 0 260 220">
      <Ellipse cx="130" cy="180" rx="120" ry="34" fill={humeda ? "#5D4037" : "#8D6E63"} />
      {etapa === "hoyo" && <Ellipse cx="130" cy="172" rx="30" ry="10" fill="#3E2723" />}
      {etapa === "semilla" && (
        <G>
          <Ellipse cx="130" cy="172" rx="30" ry="10" fill="#3E2723" />
          <Ellipse cx="130" cy="170" rx="9" ry="6" fill="#A1887F" />
        </G>
      )}
      {etapa === "tapada" && <Ellipse cx="130" cy="166" rx="34" ry="12" fill="#795548" />}
      {etapa === "regada" && (
        <G>
          <Ellipse cx="130" cy="166" rx="34" ry="12" fill="#4E342E" />
          {[100, 130, 160].map((x) => <Path key={x} d={`M${x} 120 q-6 10 0 14 q6 -4 0 -14`} fill="#42A5F5" />)}
        </G>
      )}
      {(etapa === "brote" || etapa === "flor") && (
        <G>
          <Path d="M130 170 L130 90" stroke="#43A047" strokeWidth="6" />
          <Path d="M130 130 q-30 -6 -36 -26 q24 2 36 26" fill="#66BB6A" />
          <Path d="M130 120 q30 -6 36 -26 q-24 2 -36 26" fill="#66BB6A" />
        </G>
      )}
      {etapa === "flor" && (
        <G>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <Circle key={a} cx={130 + 22 * Math.cos((a * Math.PI) / 180)} cy={70 + 22 * Math.sin((a * Math.PI) / 180)} r="16" fill="#F06292" />
          ))}
          <Circle cx="130" cy="70" r="14" fill="#FDD835" />
        </G>
      )}
    </Svg>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  donPedro: { fontSize: 90 },
  escena: { flex: 1, alignItems: "center", justifyContent: "center" },
  herramientas: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 14, paddingBottom: 16 },
  herramienta: { width: 100, height: 100, borderRadius: 24, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  herramientaEmoji: { fontSize: 44 },
  herramientaTexto: { fontSize: 15, fontWeight: "800", color: "#3B2F5C" },
});
