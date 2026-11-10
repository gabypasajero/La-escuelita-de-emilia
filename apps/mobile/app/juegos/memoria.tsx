import { NIVELES_MEMORIA, TEMAS_MEMORIA, tableroMemoria, type CartaMemoria, type TemaMemoria } from "@escuelita/core";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Rebote } from "../../components/Rebote";
import { sonido } from "../../lib/sonidos";
import { Pantalla } from "../../components/Pantalla";
import { Globo } from "../../components/Personajes";
import { nivelPorEdad, useEdad, useJuego } from "../../lib/juego";
import { COLORES } from "../../lib/tema";
import { hablar, hablarYEsperar } from "../../lib/voz";
import { Icono, tieneDibujo } from "../../components/Iconos";

/**
 * Una carta que se voltea de verdad: llega repartida con un saltito, gira
 * al tocarla, brinca cuando se encuentra su pareja y tiembla si no era.
 */
function Carta({ lado, orden, visible, encontrada, fallo, alTocar, etiqueta, children }: { lado: number; orden: number; visible: boolean; encontrada: boolean; fallo: boolean; alTocar: () => void; etiqueta: string; children: ReactNode }) {
  const giro = useRef(new Animated.Value(0)).current;
  const llega = useRef(new Animated.Value(0)).current;
  const brinco = useRef(new Animated.Value(0)).current;
  const tiembla = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(llega, { toValue: 1, delay: orden * 45, friction: 6, tension: 80, useNativeDriver: true }).start();
  }, [llega, orden]);
  useEffect(() => {
    Animated.timing(giro, { toValue: visible ? 1 : 0, duration: 280, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start();
  }, [visible, giro]);
  useEffect(() => {
    if (!encontrada) return;
    Animated.sequence([
      Animated.timing(brinco, { toValue: 1, duration: 200, easing: Easing.out(Easing.back(3)), useNativeDriver: true }),
      Animated.spring(brinco, { toValue: 0, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [encontrada, brinco]);
  useEffect(() => {
    if (!fallo) return;
    Animated.sequence([-1, 1, -0.6, 0.6, 0].map((v) => Animated.timing(tiembla, { toValue: v, duration: 70, useNativeDriver: true }))).start();
  }, [fallo, tiembla]);
  const cara = { width: lado, height: lado, position: "absolute" as const, backfaceVisibility: "hidden" as const };
  return (
    <Animated.View
      style={{
        width: lado, height: lado,
        opacity: llega.interpolate({ inputRange: [0, 0.3], outputRange: [0, 1], extrapolate: "clamp" }),
        transform: [
          { translateY: Animated.add(llega.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }), brinco.interpolate({ inputRange: [0, 1], outputRange: [0, -16] })) },
          { translateX: tiembla.interpolate({ inputRange: [-1, 1], outputRange: [-9, 9] }) },
          { scale: Animated.add(1, Animated.multiply(brinco, 0.14)) },
        ],
      }}
    >
      <Pressable onPress={alTocar} accessibilityLabel={etiqueta} style={{ width: lado, height: lado }}>
        <Animated.View style={[estilos.carta, estilos.reverso, cara, { transform: [{ perspective: 800 }, { rotateY: giro.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) }] }]}>
          <View style={[estilos.reversoMarco, { borderRadius: lado * 0.12 }]}>
            <Icono e="⭐" tam={lado * 0.46} sinSombra />
          </View>
        </Animated.View>
        <Animated.View style={[estilos.carta, estilos.abierta, encontrada && estilos.encontrada, cara, { transform: [{ perspective: 800 }, { rotateY: giro.interpolate({ inputRange: [0, 1], outputRange: ["-180deg", "0deg"] }) }] }]}>
          {children}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

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
  const [fallo, setFallo] = useState<number[]>([]);
  const [mirando, setMirando] = useState(false);
  const [ronda, setRonda] = useState(0);
  const { width, height } = useWindowDimensions();
  const { ganar } = useJuego();
  const edad = useEdad();

  useEffect(() => void hablar("¿Con qué jugamos a la memoria?"), []);

  function empezar(t: TemaMemoria, n = 1) {
    setTema(t);
    setNivel(n);
    setCartas(tableroMemoria(n, t));
    setAbiertas([]);
    setEncontradas(new Set());
    setRonda((r) => r + 1);
    setFallo([]);
    // En los primeros niveles se muestran todas un momento: así los más chicos entienden el juego.
    const espiar = n <= (edad <= 3 ? 3 : 2);
    const frase = espiar ? `Nivel ${n}. ¡Mira bien dónde están!` : `Nivel ${n}. ¡Busca las parejas!`;
    setDicho(frase);
    void hablar(frase);
    setMirando(espiar);
    if (espiar) setTimeout(() => { setMirando(false); setDicho("¡Ahora busca las parejas!"); }, 2600);
  }

  function tocar(carta: CartaMemoria) {
    if (mirando || abiertas.length === 2 || abiertas.includes(carta.id) || encontradas.has(carta.par)) return;
    sonido.voltear();
    setFallo([]);
    const nuevas = [...abiertas, carta.id];
    setAbiertas(nuevas);
    if (nuevas.length < 2) return;

    const [a, b] = nuevas.map((id) => cartas.find((c) => c.id === id)!);
    const pareja = a!.par === b!.par;

    if (!pareja) setTimeout(() => { setFallo(nuevas); sonido.casi(); }, 420);
    setTimeout(async () => {
      setAbiertas([]);
      if (!pareja) return;
      sonido.acierto();
      const total = new Set(encontradas).add(a!.par);
      setEncontradas(total);
      if (total.size * 2 < cartas.length) {
        setDicho(a!.frase);
        void hablar(a!.frase);
        return;
      }
      ganar(nivel + 1);
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
    }, pareja ? 650 : 1100);
  }

  if (!tema) {
    return (
      <Pantalla color={COLORES.juegos} fondo="aula">
        <Globo texto={dicho} />
        <View style={estilos.temas}>
          {TEMAS_MEMORIA.map((t) => (
            <Rebote key={t.id} style={estilos.tema} onPress={() => empezar(t.id, nivelPorEdad(edad))} accessibilityLabel={t.nombre}>
              <Icono e={t.emoji} tam={78} sinSombra />
              <Text style={estilos.temaNombre}>{t.nombre}</Text>
            </Rebote>
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
    <Pantalla color={COLORES.juegos} fondo="aula">
      <View style={estilos.cabecera}>
        <Pressable style={estilos.cambiar} onPress={() => setTema(null)} accessibilityLabel="Cambiar tema">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Icono e={TEMAS_MEMORIA.find((t) => t.id === tema)!.emoji} tam={28} sinSombra /><Text style={estilos.cambiarTexto}>Cambiar</Text></View>
        </Pressable>
        <View style={estilos.niveles}>
          {Array.from({ length: NIVELES_MEMORIA }, (_, k) => (
            <Icono key={k} e={k < nivel ? "⭐" : "☆"} tam={30} sinSombra />
          ))}
        </View>
      </View>
      <Globo texto={dicho} />
      <View style={[estilos.tablero, { maxWidth: columnas * (lado + 12) }]}>
        {cartas.map((c, i) => {
          const hallada = encontradas.has(c.par);
          const visible = mirando || abiertas.includes(c.id) || hallada;
          const larga = c.cara.length > 2 && !/^\d+$/.test(c.cara);
          const piezas = Array.from(c.cara.replace(/\uFE0F/g, ""));
          return (
            <Carta key={`${ronda}-${c.id}`} lado={lado} orden={i} visible={visible} encontrada={hallada} fallo={fallo.includes(c.id)} alTocar={() => tocar(c)} etiqueta={visible ? c.cara : "Carta"}>
              {larga ? (
                // Carta de cantidad: los objetos se ordenan en filas para que siempre quepan.
                <View style={estilos.cantidad}>
                  {piezas.map((e, k) => <Icono key={k} e={e} tam={lado / (piezas.length > 4 ? 4.4 : 2.9)} sinSombra />)}
                </View>
              ) : tieneDibujo(c.cara) ? (
                <Icono e={c.cara} tam={lado * 0.72} />
              ) : (
                <Text style={[estilos.cara, { fontSize: lado * 0.5 }, /^[A-ZÑ\d]+$/.test(c.cara) && estilos.texto]}>{c.cara}</Text>
              )}
            </Carta>
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
  carta: { borderRadius: 18, alignItems: "center", justifyContent: "center", padding: 4, boxShadow: "0 5px 0 rgba(59,47,92,0.25)" },
  reverso: { backgroundColor: "#8E24AA", borderWidth: 4, borderColor: "#FFFFFF" },
  reversoMarco: { width: "82%", height: "82%", backgroundColor: "#AB47BC", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#CE93D8" },
  abierta: { backgroundColor: "#fff", borderWidth: 4, borderColor: "#E1BEE7" },
  encontrada: { backgroundColor: "#C8E6C9", borderColor: "#66BB6A" },
  cara: { textAlign: "center" },
  cantidad: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center" },
  texto: { fontWeight: "800", color: "#3B2F5C" },
});
