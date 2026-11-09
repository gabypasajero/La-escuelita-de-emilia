import { rondaVeterinaria } from "@escuelita/core";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { Acuario, Reloj } from "../components/Ambiente";
import { AnimalVivo, type AnimalId } from "../components/AnimalesVivos";
import { Pantalla } from "../components/Pantalla";
import { Adulto } from "../components/Personas";
import { Pregunta } from "../components/Pregunta";
import { DESBLOQUEOS, useJuego } from "../lib/juego";
import { LuzDelDia } from "../components/LuzDelDia";
import { CIELO_VENTANA, useMomento } from "../lib/hora";

/** Cada paciente (por su emoji en los datos) como animal vivo. */
const PACIENTE: Record<string, AnimalId> = { "🐶": "perro", "🐱": "gato", "🐰": "conejo", "🐦": "pajaro", "🐄": "vaca", "🐷": "cerdo", "🐻": "oso" };

/**
 * Consultorio del Dr. Lucas (se abre con estrellas): el paciente llega a la
 * camilla y el niño elige el cuidado que necesita. El doctor explica moviendo
 * la boca y las manos; en la sala hay un acuario, un reloj y una ventana.
 */
export default function Veterinaria() {
  const { estrellas, cargado, perfil } = useJuego();
  if (cargado && perfil && estrellas < DESBLOQUEOS.veterinaria) return <Redirect href="/" />;
  return (
    <Pantalla color="#E0F2F1">
      <Consultorio />
      <Pregunta
        generar={(n) => rondaVeterinaria(n)}
        estimulo={(r) => (
          <View style={estilos.consulta}>
            <Doctor texto={r.enunciado} />
            <View style={estilos.camilla}>
              <View style={estilos.burbuja}><Text style={estilos.triste}>🥺</Text></View>
              <AnimalVivo id={PACIENTE[r.paciente.emoji] ?? "perro"} alto={r.paciente.emoji === "🐄" ? 110 : 90} />
              <Svg width={230} height={40} viewBox="0 0 230 40">
                <Rect x="0" y="0" width="230" height="16" rx="8" fill="#80CBC4" />
                <Rect x="20" y="16" width="8" height="24" fill="#B0BEC5" />
                <Rect x="202" y="16" width="8" height="24" fill="#B0BEC5" />
              </Svg>
            </View>
          </View>
        )}
        opcion={(c) => <Text style={estilos.cuidado}>{c.emoji}</Text>}
        alAcertar={(r) => `¡Muy bien! ${r.paciente.gracias}`}
      />
    </Pantalla>
  );
}

/** El Dr. Lucas habla (boca y manos) mientras se dice la pregunta. */
function Doctor({ texto }: { texto: string }) {
  const [hablando, setHablando] = useState(true);
  useEffect(() => {
    setHablando(true);
    const t = setTimeout(() => setHablando(false), Math.max(2500, texto.length * 75));
    return () => clearTimeout(t);
  }, [texto]);
  return (
    <View style={estilos.doctor}>
      <Adulto id="lucas" alto={190} hablando={hablando} />
      <Text style={estilos.nombre}>Dr. Lucas</Text>
    </View>
  );
}

/** La sala del consultorio, detrás del juego. */
function Consultorio() {
  const { width, height } = useWindowDimensions();
  const k = Math.max(width / 1100, height / 700);
  const momento = useMomento();
  return (
    <View pointerEvents="none" style={[estilos.sala, { width, height }]}>
      <Svg width={1100 * k} height={700 * k} viewBox="0 0 1100 700">
        <Rect x="0" y="0" width="1100" height="470" fill="#E0F2F1" />
        <Rect x="0" y="300" width="1100" height="170" fill="#B2DFDB" />
        <Rect x="0" y="296" width="1100" height="8" fill="#80CBC4" />
        {/* Piso de baldosas */}
        <Rect x="0" y="470" width="1100" height="230" fill="#ECEFF1" />
        {Array.from({ length: 12 }, (_, i) => <Path key={i} d={`M${i * 100} 470 V700`} stroke="#CFD8DC" strokeWidth="2" />)}
        {Array.from({ length: 4 }, (_, i) => <Path key={i} d={`M0 ${520 + i * 55} H1100`} stroke="#CFD8DC" strokeWidth="2" />)}
        {/* Ventana con árbol */}
        <Rect x="70" y="120" width="170" height="140" rx="8" fill={CIELO_VENTANA[momento]} stroke="#fff" strokeWidth="10" />
        <Circle cx="150" cy="215" r="40" fill="#66BB6A" />
        <Rect x="144" y="230" width="12" height="30" fill="#6D4C41" />
        <Path d="M155 125 V260 M75 190 H235" stroke="#fff" strokeWidth="6" />
        {/* Afiche con huella */}
        <Rect x="880" y="110" width="110" height="140" rx="8" fill="#fff" stroke="#26A69A" strokeWidth="5" />
        <Circle cx="935" cy="190" r="20" fill="#26A69A" />
        {[[912, 160], [928, 150], [944, 150], [960, 160]].map(([x, y]) => <Circle key={x} cx={x} cy={y} r="7" fill="#26A69A" />)}
        <Path d="M918 225 H952 M935 208 V242" stroke="#E53935" strokeWidth="7" />
        {/* Repisa con frascos y mueble del acuario */}
        <Rect x="300" y="150" width="200" height="10" fill="#8D6E63" />
        {[320, 360, 400, 440, 470].map((x, i) => <Rect key={x} x={x} y={118 + (i % 2) * 6} width="22" height={32 - (i % 2) * 6} rx="5" fill={["#FFCC80", "#90CAF9", "#A5D6A7", "#F48FB1", "#FFF59D"][i]} />)}
        <Rect x="760" y="380" width="200" height="90" rx="6" fill="#80CBC4" />
        <Rect x="776" y="400" width="80" height="54" rx="4" fill="#4DB6AC" />
        <Rect x="864" y="400" width="80" height="54" rx="4" fill="#4DB6AC" />
      </Svg>
      <Reloj k={k} x={600} y={110} r={30} />
      <Acuario k={k} x={770} y={270} w={180} h={110} />
      <LuzDelDia k={k} ancho={1100} alto={700} interior luces={[{ x: 155, y: 190, r: 110 }]} />
    </View>
  );
}

const estilos = StyleSheet.create({
  sala: { position: "absolute", top: -104, left: -16, overflow: "hidden" },
  consulta: { flexDirection: "row", alignItems: "flex-end", gap: 30 },
  doctor: { alignItems: "center" },
  nombre: { fontWeight: "900", color: "#00695C", fontSize: 16, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 8, paddingHorizontal: 8 },
  camilla: { alignItems: "center" },
  burbuja: { position: "absolute", top: -6, right: 4, backgroundColor: "#fff", borderRadius: 20, padding: 4, zIndex: 2 },
  triste: { fontSize: 26 },
  cuidado: { fontSize: 60 },
});
