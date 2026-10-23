import { NIVELES_MEMORIA, TEMAS_MEMORIA, tableroMemoria, type CartaMemoria, type TemaMemoria } from "@escuelita/core";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Pantalla } from "../../components/Pantalla";
import { Globo } from "../../components/Personajes";
import { COLORES } from "../../lib/tema";
import { hablar, hablarYEsperar } from "../../lib/voz";

/**
 * Memoria con 5 temas (frutas, animales, letras, números y mezcla) y 6 niveles.
 * Al completar un tablero se pasa al nivel siguiente; nunca se baja de nivel.
 */
export default function Memoria() {
  const [tema, setTema] = useState<TemaMemoria | null>(null);
  const [nivel, setNivel] = useState(1);
  const [cartas, setCartas] = useState<CartaMemoria[]>([]);
  const [abiertas, setAbiertas] = useState<number[]>([]);
  const [encontradas, setEncontradas] = useState<Set<string>>(new Set());
  const [dicho, setDicho] = useState("¿Con qué jugamos a la memoria?");
  const { width, height } = useWindowDimensions();

  useEffect(() => void hablar("¿Con qué jugamos a la memoria?"), []);

  function empezar(t: TemaMemoria, n = 1) {
    setTema(t);
    setNivel(n);
    setCartas(tableroMemoria(n, t));
    setAbiertas([]);
    setEncontradas(new Set());
    const frase = `Nivel ${n}. ¡Busca las parejas!`;
    setDicho(frase);
    void hablar(frase);
  }

  function tocar(carta: CartaMemoria) {
    if (abiertas.length === 2 || abiertas.includes(carta.id) || encontradas.has(carta.par)) return;
    const nuevas = [...abiertas, carta.id];
    setAbiertas(nuevas);
    if (nuevas.length < 2) return;

    const [a, b] = nuevas.map((id) => cartas.find((c) => c.id === id)!);
    const pareja = a!.par === b!.par;

    setTimeout(async () => {
      setAbiertas([]);
      if (!pareja) return;
      const total = new Set(encontradas).add(a!.par);
      setEncontradas(total);
      if (total.size * 2 < cartas.length) {
        setDicho(a!.frase);
        void hablar(a!.frase);
        return;
      }
      if (nivel < NIVELES_MEMORIA) {
        const frase = "¡Encontraste todas las parejas! ¡Vamos al siguiente nivel!";
        setDicho(frase);
        await hablarYEsperar(frase, 500);
        empezar(tema!, nivel + 1);
      } else {
        const frase = "¡Terminaste todos los niveles! ¡Tienes una memoria increíble!";
        setDicho(frase);
        await hablarYEsperar(frase, 500);
        setTema(null);
        setDicho("¿Jugamos con otro tema?");
      }
    }, 800);
  }

  if (!tema) {
    return (
      <Pantalla color={COLORES.juegos}>
        <Globo texto={dicho} />
        <View style={estilos.temas}>
          {TEMAS_MEMORIA.map((t) => (
            <Pressable key={t.id} style={estilos.tema} onPress={() => empezar(t.id)} accessibilityLabel={t.nombre}>
              <Text style={estilos.temaEmoji}>{t.emoji}</Text>
              <Text style={estilos.temaNombre}>{t.nombre}</Text>
            </Pressable>
          ))}
        </View>
      </Pantalla>
    );
  }

  // El tamaño de las cartas se ajusta a la cantidad para que todo quepa en pantalla.
  const n = cartas.length;
  const columnas = n <= 4 ? 2 : n <= 6 ? 3 : n <= 8 ? 4 : n <= 12 ? 6 : n <= 16 ? 8 : 7;
  const filas = Math.ceil(cartas.length / columnas);
  const lado = Math.max(64, Math.min(130, (width - 64) / columnas - 12, (height - 260) / filas - 12));

  return (
    <Pantalla color={COLORES.juegos}>
      <View style={estilos.cabecera}>
        <Pressable style={estilos.cambiar} onPress={() => setTema(null)} accessibilityLabel="Cambiar tema">
          <Text style={estilos.cambiarTexto}>{TEMAS_MEMORIA.find((t) => t.id === tema)!.emoji} Cambiar</Text>
        </Pressable>
        <View style={estilos.niveles}>
          {Array.from({ length: NIVELES_MEMORIA }, (_, k) => (
            <Text key={k} style={[estilos.nivel, k < nivel && estilos.nivelHecho]}>{k < nivel ? "⭐" : "○"}</Text>
          ))}
        </View>
      </View>
      <Globo texto={dicho} />
      <View style={[estilos.tablero, { maxWidth: columnas * (lado + 12) }]}>
        {cartas.map((c) => {
          const visible = abiertas.includes(c.id) || encontradas.has(c.par);
          const larga = c.cara.length > 2 && !/^\d+$/.test(c.cara);
          return (
            <Pressable
              key={c.id}
              onPress={() => tocar(c)}
              accessibilityLabel={visible ? c.cara : "Carta"}
              style={[estilos.carta, { width: lado, height: lado }, visible && estilos.abierta, encontradas.has(c.par) && estilos.encontrada]}
            >
              {visible && larga ? (
                // Carta de cantidad: los objetos se ordenan en filas para que siempre quepan.
                <View style={estilos.cantidad}>
                  {Array.from(c.cara).map((e, k) => (
                    <Text key={k} style={{ fontSize: lado / (Array.from(c.cara).length > 4 ? 5.2 : 3.4) }}>{e}</Text>
                  ))}
                </View>
              ) : (
                <Text style={[estilos.cara, { fontSize: lado * 0.5 }, /^[A-ZÑ\d]+$/.test(c.cara) && estilos.texto]}>
                  {visible ? c.cara : "❓"}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  temas: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 18, marginTop: 20, maxWidth: 760 },
  tema: { width: 170, height: 170, borderRadius: 30, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 5, borderColor: "#CE93D8" },
  temaEmoji: { fontSize: 70 },
  temaNombre: { fontSize: 20, fontWeight: "800", color: "#3B2F5C", textAlign: "center" },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 8 },
  cambiar: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  cambiarTexto: { fontSize: 18, fontWeight: "800", color: "#3B2F5C" },
  niveles: { flexDirection: "row", gap: 4 },
  nivel: { fontSize: 26, color: "#fff" },
  nivelHecho: { color: "#FDD835" },
  tablero: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 12 },
  carta: { borderRadius: 18, backgroundColor: "#7B1FA2", alignItems: "center", justifyContent: "center", padding: 4 },
  abierta: { backgroundColor: "#fff" },
  encontrada: { backgroundColor: "#C8E6C9" },
  cara: { textAlign: "center" },
  cantidad: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center" },
  texto: { fontWeight: "800", color: "#3B2F5C" },
});
