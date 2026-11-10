import { GLIFOS, LETRAS, presentarLetra } from "@escuelita/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Pantalla } from "../components/Pantalla";
import { Globo } from "../components/Personajes";
import { Rebote } from "../components/Rebote";
import { Trazado } from "../components/Trazado";
import { useJuego } from "../lib/juego";
import { sonido } from "../lib/sonidos";
import { hablar, hablarYEsperar } from "../lib/voz";

/**
 * Aprender a escribir mi nombre: las letras del nombre del niño, una por
 * una (la primera en mayúscula), con el mismo trazado libre de la pizarra.
 * Arriba se va armando el nombre; al terminar la última letra hay fiesta.
 */
function letrasDe(nombre: string): string[] {
  // Sin tildes (la ñ se respeta) y solo con letras que se pueden trazar.
  const limpio = nombre.trim().replace(/ñ/g, "\u0001").replace(/Ñ/g, "\u0002").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\u0001/g, "ñ").replace(/\u0002/g, "Ñ");
  const salida: string[] = [];
  let inicioDePalabra = true;
  for (const ch of limpio) {
    if (ch === " " || ch === "-") { inicioDePalabra = true; continue; }
    const c = inicioDePalabra ? ch.toUpperCase() : ch.toLowerCase();
    if (GLIFOS[c]) { salida.push(c); inicioDePalabra = false; }
  }
  return salida;
}
const comoSeLlama = (c: string) => LETRAS.find((l) => l.letra === c.toUpperCase());

export default function MiNombre() {
  const { perfil, ganar } = useJuego();
  const { height } = useWindowDimensions();
  const nombre = perfil?.nombre ?? "";
  const letras = useMemo(() => letrasDe(nombre), [nombre]);
  const [i, setI] = useState(0);
  const [vuelta, setVuelta] = useState(0);
  const [listo, setListo] = useState(false);
  const [dicho, setDicho] = useState("");
  const vivo = useRef(true);
  useEffect(() => () => { vivo.current = false; }, []);

  const c = letras[i];
  useEffect(() => {
    if (!c || listo) return;
    const l = comoSeLlama(c);
    const t = i === 0 && vuelta === 0
      ? `¡Vamos a escribir tu nombre, ${nombre}! Empieza con la ${l?.nombre ?? c}. Pasa el dedo por los puntitos.`
      : `Ahora la ${l?.nombre ?? c}.${l ? ` ${presentarLetra(l)}` : ""}`;
    setDicho(t);
    void hablar(t);
  }, [c, i, vuelta, listo, nombre]);

  async function letraLista() {
    if (i + 1 < letras.length) {
      sonido.acierto();
      setTimeout(() => { if (vivo.current) setI((x) => x + 1); }, 900);
      return;
    }
    setListo(true);
    ganar(3);
    const t = `¡Escribiste tu nombre! ${letras.map((x) => comoSeLlama(x)?.nombre ?? x).join(", ")}. ¡${nombre}!`;
    setDicho(`¡Escribiste tu nombre, ${nombre}!`);
    await hablarYEsperar(t);
  }
  function otraVez() {
    setListo(false);
    setI(0);
    setVuelta((v) => v + 1);
  }

  if (!letras.length) {
    return (
      <Pantalla color="#E3F2FD" fondo="aula">
        <Globo texto="Pídele a un adulto que escriba tu nombre en Mi personaje, y volvemos a intentarlo." />
      </Pantalla>
    );
  }

  const compacto = height < 520;
  const alto = compacto ? Math.max(160, height - 190) : Math.min(height - 330, 440);
  const tamLetra = Math.min(compacto ? 34 : 54, 560 / letras.length);
  return (
    <Pantalla color="#E3F2FD" fondo="aula">
      {/* El nombre se va armando: verdes las letras escritas, amarilla la que toca */}
      <View style={estilos.nombre} accessibilityLabel={`Tu nombre: ${nombre}`}>
        {letras.map((l, k) => (
          <View key={k} style={[estilos.casilla, { minWidth: tamLetra * 1.1 }, (k < i || listo) && estilos.hecha, k === i && !listo && estilos.actual]}>
            <Text style={[estilos.letra, { fontSize: tamLetra }, k > i && !listo && estilos.pendiente]}>{l}</Text>
          </View>
        ))}
      </View>
      <View style={estilos.cuerpo}>
        {listo ? (
          <View style={estilos.final}>
            <Text style={[estilos.grande, { fontSize: Math.min(110, 700 / letras.length) }]}>{letras.join("")}</Text>
            <Rebote style={estilos.boton} onPress={otraVez} accessibilityLabel="Escribir mi nombre otra vez"><Text style={estilos.botonTexto}>Otra vez</Text></Rebote>
          </View>
        ) : (
          <Trazado key={`${vuelta}-${i}`} caracter={c!} alto={alto} alCompletar={() => void letraLista()} />
        )}
        <View style={[estilos.lado, compacto && { width: 170 }]}><Globo texto={dicho} /></View>
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  nombre: { flexDirection: "row", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 8 },
  casilla: { borderRadius: 14, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: "rgba(255,255,255,0.8)", borderWidth: 3, borderColor: "#CFD8DC", alignItems: "center" },
  hecha: { backgroundColor: "#C8E6C9", borderColor: "#66BB6A" },
  actual: { backgroundColor: "#FFF59D", borderColor: "#FBC02D" },
  letra: { fontWeight: "900", color: "#3B2F5C" },
  pendiente: { color: "#B0BEC5" },
  cuerpo: { flexDirection: "row", alignItems: "center", gap: 20, flex: 1 },
  lado: { width: 230, alignItems: "center" },
  final: { alignItems: "center", gap: 16 },
  grande: { fontWeight: "900", color: "#3B2F5C", backgroundColor: "#fff", borderRadius: 28, paddingHorizontal: 28, paddingVertical: 8, borderWidth: 5, borderColor: "#66BB6A" },
  boton: { backgroundColor: "#43A047", borderRadius: 24, paddingHorizontal: 26, paddingVertical: 12 },
  botonTexto: { color: "#fff", fontSize: 22, fontWeight: "900" },
});
