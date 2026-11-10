import { ABECEDARIO_TRAZO, LETRAS, NUMEROS, NUMEROS_TRAZO, VOCALES_TRAZO, presentarLetra } from "@escuelita/core";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Pantalla } from "../components/Pantalla";
import { Rebote } from "../components/Rebote";
import { EmiliaDibujo, Globo } from "../components/Personajes";
import { Trazado } from "../components/Trazado";
import { useJuego } from "../lib/juego";
import { hablar, hablarYEsperar } from "../lib/voz";
import { Icono, TextoIconos } from "../components/Iconos";

type Serie = "vocales" | "abecedario" | "numeros";
const SERIES: Record<Serie, { nombre: string; emoji: string; caracteres: string[] }> = {
  vocales: { nombre: "Vocales", emoji: "🅰️", caracteres: VOCALES_TRAZO },
  abecedario: { nombre: "Abecedario", emoji: "🔤", caracteres: ABECEDARIO_TRAZO },
  numeros: { nombre: "Números", emoji: "🔢", caracteres: NUMEROS_TRAZO },
};

/** La doble ele no está entre las letras de los otros juegos: aquí tiene su propia ficha. */
const DOBLE_ELE = { letra: "LL", palabra: "Llama", emoji: "🦙", nombre: "doble ele", sonido: "lla", esVocal: false };
const letraDe = (c: string) => (c.toUpperCase() === "LL" ? DOBLE_ELE : LETRAS.find((l) => l.letra === c.toUpperCase())!);

/** Lo que dice Emilia al presentar un carácter: sonido de la letra o nombre del número. */
function presentar(c: string) {
  if (/\d/.test(c)) {
    const n = NUMEROS[Number(c)]!;
    return `El ${n.palabra}. ¡Vamos a escribirlo!`;
  }
  const letra = letraDe(c);
  const tipo = c === c.toLowerCase() ? "minúscula" : "mayúscula";
  return `${presentarLetra(letra)} Esta es la ${letra.nombre} ${tipo}. ¡Vamos a escribirla!`;
}

/**
 * Escribir con el dedo: series de vocales (mayúscula y minúscula), el
 * abecedario completo y los números. Al terminar cada uno se gana una
 * moneda y se pasa al siguiente.
 */
export default function Trazar() {
  const params = useLocalSearchParams<{ serie?: Serie; c?: string }>();
  const { height } = useWindowDimensions();
  const { ganar } = useJuego();
  const [serie, setSerie] = useState<Serie | null>(params.serie ?? null);
  const caracteres = serie ? SERIES[serie].caracteres : [];
  const [indice, setIndice] = useState(() => Math.max(0, params.c ? caracteres.indexOf(params.c) : 0));
  const [listo, setListo] = useState(false);
  const [intento, setIntento] = useState(0);
  const c = caracteres[indice];
  const [dicho, setDicho] = useState("¿Qué quieres aprender a escribir?");
  const actualRef = useRef(c);
  actualRef.current = c;
  const listoRef = useRef(listo);
  listoRef.current = listo;

  useEffect(() => {
    if (!c) return void hablar("¿Qué quieres aprender a escribir? ¿Vocales, letras o números?");
    const t = presentar(c);
    setDicho(t);
    void hablar(t);
  }, [c]);

  async function completado() {
    setListo(true);
    ganar(1);
    const t = /\d/.test(c!) ? `¡Escribiste el ${NUMEROS[Number(c)]!.palabra}! ¡Muy bien!` : `¡Escribiste la ${c}! ¡Qué bonita te quedó!`;
    setDicho(t);
    await hablarYEsperar(t);
    // Los más chicos no leen "Siguiente": después de un ratito se avanza solo.
    const era = c;
    setTimeout(() => { if (actualRef.current === era && listoRef.current) siguiente(); }, 2600);
  }

  function siguiente() {
    setListo(false);
    setIntento((x) => x + 1);
    setIndice((i) => (i + 1) % caracteres.length);
  }

  if (!serie) {
    return (
      <Pantalla color="#E3F2FD" fondo="aula">
        <View style={estilos.fila}>
          <EmiliaDibujo alto={120} />
          <Globo texto="¿Qué quieres aprender a escribir?" alLado="izquierda" />
        </View>
        <View style={estilos.series}>
          {(Object.keys(SERIES) as Serie[]).map((s) => (
            <Rebote key={s} style={estilos.serie} onPress={() => { setSerie(s); setIndice(0); }} accessibilityLabel={SERIES[s].nombre}>
              <Icono e={SERIES[s].emoji} tam={74} sinSombra />
              <Text style={estilos.serieNombre}>{SERIES[s].nombre}</Text>
            </Rebote>
          ))}
        </View>
      </Pantalla>
    );
  }

  const alto = Math.min(height - 300, 460);
  return (
    <Pantalla color="#E3F2FD" fondo="aula">
      <View style={estilos.cuerpo}>
        <View style={estilos.lado}>
          <Pressable onPress={() => void hablar(presentar(c!))} accessibilityLabel="Escuchar">
            <Text style={estilos.modelo}>{c}</Text>
            <TextoIconos estilo={estilos.escuchar} texto={`🔊 Escuchar`} />
          </Pressable>
          {!/\d/.test(c!) && <Icono e={letraDe(c!).emoji} tam={84} />}
          {/\d/.test(c!) && <TextoIconos estilo={estilos.cantidad} texto={"⭐".repeat(Number(c))} />}
        </View>
        <Trazado key={`${c}-${intento}`} caracter={c!} alto={alto} alCompletar={() => void completado()} />
        <View style={estilos.lado}>
          <Globo texto={dicho} />
          {listo && (
            <Pressable style={estilos.siguiente} onPress={siguiente} accessibilityLabel="Siguiente">
              <TextoIconos estilo={estilos.siguienteTexto} texto={`➡️ Siguiente`} />
            </Pressable>
          )}
        </View>
      </View>
      <ScrollView horizontal contentContainerStyle={estilos.tira} style={estilos.tiraCont}>
        {caracteres.map((x, i) => (
          <Pressable key={x} onPress={() => { setListo(false); setIntento((n) => n + 1); setIndice(i); }} style={[estilos.chip, i === indice && estilos.chipActivo]} accessibilityLabel={`Escribir ${x}`}>
            <Text style={estilos.chipTexto}>{x}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => { setSerie(null); router.setParams({ serie: undefined }); }} style={estilos.chip} accessibilityLabel="Cambiar serie">
          <Text style={estilos.chipTexto}>↩️</Text>
        </Pressable>
      </ScrollView>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  series: { flexDirection: "row", gap: 20, marginTop: 20, flexWrap: "wrap", justifyContent: "center" },
  serie: { width: 190, height: 190, borderRadius: 30, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 5, borderColor: "#90CAF9" },
  serieEmoji: { fontSize: 76 },
  serieNombre: { fontSize: 22, fontWeight: "900", color: "#3B2F5C" },
  cuerpo: { flexDirection: "row", alignItems: "center", gap: 20, flex: 1 },
  lado: { alignItems: "center", gap: 10, width: 200 },
  modelo: { fontSize: 100, fontWeight: "900", color: "#3B2F5C", textAlign: "center" },
  escuchar: { fontSize: 18, fontWeight: "800", color: "#1E88E5", textAlign: "center" },
  ejemplo: { fontSize: 70 },
  cantidad: { fontSize: 22, textAlign: "center", maxWidth: 160 },
  siguiente: { backgroundColor: "#43A047", borderRadius: 24, paddingHorizontal: 22, paddingVertical: 12 },
  siguienteTexto: { color: "#fff", fontSize: 22, fontWeight: "900" },
  tiraCont: { flexGrow: 0, maxHeight: 70 },
  tira: { gap: 8, paddingHorizontal: 8, paddingVertical: 6 },
  chip: { minWidth: 50, height: 50, borderRadius: 14, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  chipActivo: { backgroundColor: "#FDD835" },
  chipTexto: { fontSize: 24, fontWeight: "900", color: "#3B2F5C" },
});
