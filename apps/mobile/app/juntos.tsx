import { ESTADO_INICIAL, registrarRespuesta, rondaSonidoAnimal, type Animal, type EstadoDificultad } from "@escuelita/core";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Avatar } from "../components/Avatar";
import { BotonCasa } from "../components/BotonCasa";
import { EmiliaDibujo, Globo, TitoDibujo, useRespirar } from "../components/Personajes";
import { ACCESORIOS, useJuego, type Jugador } from "../lib/juego";
import { hablar, hablarYEsperar } from "../lib/voz";

const META = 10;

/**
 * Jugar juntos (multijugador local, por turnos en la misma tablet): cada niño
 * responde "¿Quién hace este sonido?" en su turno, con dificultad propia.
 * Nadie pierde: si alguien se equivoca, Emilia pide ayuda al grupo. Entre
 * todos juntan estrellas para la fiesta de Tito.
 */
export default function Juntos() {
  const { jugadores } = useJuego();
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [jugando, setJugando] = useState(false);

  useEffect(() => void hablar("¡Vamos a jugar juntos! Toquen los personajes de quienes van a jugar."), []);

  if (jugando) return <Partida equipo={jugadores.filter((j) => elegidos.includes(j.id))} alSalir={() => setJugando(false)} />;

  return (
    <SafeAreaView style={estilos.fondo}>
      <BotonCasa />
      <View style={estilos.cabecera}>
        <EmiliaDibujo alto={110} />
        <Globo texto="¿Quiénes juegan juntos? Toquen sus personajes." alLado="izquierda" />
      </View>
      <View style={estilos.lista}>
        {jugadores.map((j) => {
          const si = elegidos.includes(j.id);
          return (
            <Pressable key={j.id} accessibilityLabel={j.perfil.nombre} style={[estilos.tarjeta, si && estilos.elegida]}
              onPress={() => {
                setElegidos((e) => (si ? e.filter((x) => x !== j.id) : e.length < 4 ? [...e, j.id] : e));
                if (!si) void hablar(`¡${j.perfil.nombre} juega!`);
              }}>
              <AvatarDe j={j} alto={140} />
              <Text style={estilos.nombre}>{j.perfil.nombre}</Text>
              {si && <Text style={estilos.check}>✅</Text>}
            </Pressable>
          );
        })}
      </View>
      <Pressable
        accessibilityLabel="Empezar a jugar juntos"
        style={[estilos.empezar, elegidos.length < 2 && estilos.apagado]}
        onPress={() => (elegidos.length < 2 ? void hablar("Se necesitan por lo menos dos para jugar juntos.") : setJugando(true))}
      >
        <Text style={estilos.empezarTexto}>▶️ ¡A jugar!</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function AvatarDe({ j, alto }: { j: Jugador; alto: number }) {
  const acc = Object.fromEntries((["cabeza", "cara", "cuello", "mano"] as const).map((r) => [r, ACCESORIOS.find((a) => a.id === j.puestos[r])]));
  return <Avatar apariencia={j.perfil.apariencia} alto={alto} accesorios={acc} />;
}

function Partida({ equipo, alSalir }: { equipo: Jugador[]; alSalir: () => void }) {
  const { ganarPara } = useJuego();
  const [turno, setTurno] = useState(0);
  const [estrellas, setEstrellas] = useState(0);
  const [niveles, setNiveles] = useState<Record<string, EstadoDificultad>>(() => Object.fromEntries(equipo.map((j) => [j.id, ESTADO_INICIAL])));
  const [ronda, setRonda] = useState(() => rondaSonidoAnimal(ESTADO_INICIAL.nivel));
  const [errores, setErrores] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  const [dicho, setDicho] = useState("");
  const [fiesta, setFiesta] = useState(false);
  const brillo = useRespirar(10, 500);
  const inicio = useRef(false);

  const actual = equipo[turno % equipo.length]!;

  async function presentarTurno(j: Jugador, r = ronda) {
    const texto = `¡Turno de ${j.perfil.nombre}! ${r.enunciado}`;
    setDicho(texto);
    await hablar(texto);
  }

  useEffect(() => {
    if (inicio.current) return;
    inicio.current = true;
    void (async () => {
      await hablarYEsperar(`¡Juguemos juntos! Entre todos juntemos ${META} estrellas para la fiesta de Tito.`, 300);
      await presentarTurno(actual);
    })();
  }, []);

  async function responder(a: Animal) {
    if (ocupado) return;
    setOcupado(true);
    const acierto = a === ronda.correcta;
    const nivel = registrarRespuesta(niveles[actual.id]!, acierto);
    setNiveles((n) => ({ ...n, [actual.id]: nivel }));

    if (!acierto) {
      const n = errores + 1;
      setErrores(n);
      const texto = n === 1 ? `¡Casi, ${actual.perfil.nombre}! ¿Alguien le ayuda? Escuchen otra vez: ${ronda.correcta.sonido}` : "Mira, es el que brilla. ¡Tócalo!";
      setDicho(texto);
      await hablar(texto);
      setOcupado(false);
      return;
    }

    ganarPara(actual.id, 1);
    const total = estrellas + 1;
    setEstrellas(total);
    const felicitar = errores ? `¡Lo lograron entre todos! Es el ${ronda.correcta.nombre.toLowerCase()}.` : `¡Muy bien, ${actual.perfil.nombre}! Es el ${ronda.correcta.nombre.toLowerCase()}.`;
    setDicho(felicitar);
    await hablarYEsperar(felicitar, 300);

    if (total >= META) {
      equipo.forEach((j) => ganarPara(j.id, 3));
      setFiesta(true);
      const texto = "¡Lo lograron juntos! ¡Fiesta de Tito! Tres monedas para cada uno.";
      setDicho(texto);
      await hablar(texto);
      setOcupado(false);
      return;
    }
    const siguiente = equipo[(turno + 1) % equipo.length]!;
    const nueva = rondaSonidoAnimal(niveles[siguiente.id]!.nivel);
    setTurno((t) => t + 1);
    setErrores(0);
    setRonda(nueva);
    setOcupado(false);
    await presentarTurno(siguiente, nueva);
  }

  if (fiesta) {
    return (
      <SafeAreaView style={[estilos.fondo, estilos.fondoFiesta]}>
        <Text style={estilos.confeti}>🎉🎈🎊🎈🎉</Text>
        <Globo texto={dicho} />
        <View style={estilos.equipoFiesta}>
          <EmiliaDibujo alto={150} />
          {equipo.map((j) => <AvatarDe key={j.id} j={j} alto={150} />)}
          <TitoDibujo alto={70} />
          <Text style={estilos.torta}>🎂</Text>
        </View>
        <View style={estilos.botones}>
          <Pressable style={estilos.empezar} onPress={() => {
            const r = rondaSonidoAnimal(niveles[equipo[0]!.id]!.nivel);
            setFiesta(false); setEstrellas(0); setTurno(0); setErrores(0); setRonda(r);
            void presentarTurno(equipo[0]!, r);
          }} accessibilityLabel="Jugar otra vez">
            <Text style={estilos.empezarTexto}>🔁 Otra vez</Text>
          </Pressable>
          <Pressable style={[estilos.empezar, estilos.secundario]} onPress={() => { alSalir(); router.replace("/"); }} accessibilityLabel="Volver al barrio">
            <Text style={estilos.empezarTexto}>🏠 Al barrio</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.fondo}>
      <BotonCasa />
      {/* Meta del equipo: estrellas para la fiesta de Tito */}
      <View style={estilos.meta}>
        {Array.from({ length: META }, (_, k) => <Text key={k} style={estilos.estrella}>{k < estrellas ? "⭐" : "☆"}</Text>)}
        <Text style={estilos.estrella}>🎂</Text>
      </View>
      <View style={estilos.equipo}>
        {equipo.map((j, k) => {
          const es = k === turno % equipo.length;
          return (
            <Animated.View key={j.id} style={[estilos.jugador, es && estilos.jugadorTurno, es && { transform: [{ translateY: brillo }] }]}>
              <AvatarDe j={j} alto={es ? 130 : 90} />
              <Text style={[estilos.nombre, es && estilos.nombreTurno]}>{j.perfil.nombre}</Text>
            </Animated.View>
          );
        })}
      </View>
      <Pressable onPress={() => void hablar(ronda.enunciado)} accessibilityLabel="Escuchar otra vez">
        <Globo texto={dicho || ronda.enunciado} />
      </Pressable>
      <View style={estilos.opciones}>
        {ronda.opciones.map((a) => (
          <Pressable key={a.id} accessibilityLabel={a.nombre} onPress={() => void responder(a)}
            style={[estilos.opcion, errores >= 2 && a === ronda.correcta && estilos.pista]}>
            <Text style={estilos.opcionEmoji}>{a.emoji}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "#FFF3E0", alignItems: "center", justifyContent: "center", padding: 16, gap: 12 },
  fondoFiesta: { backgroundColor: "#F8BBD0" },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 8 },
  lista: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 16 },
  tarjeta: { width: 170, minHeight: 220, borderRadius: 26, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 5, borderColor: "#fff" },
  elegida: { borderColor: "#43A047" },
  check: { position: "absolute", top: 8, right: 10, fontSize: 28 },
  nombre: { fontSize: 20, fontWeight: "900", color: "#3B2F5C" },
  nombreTurno: { color: "#E65100" },
  empezar: { backgroundColor: "#43A047", borderRadius: 30, paddingHorizontal: 34, paddingVertical: 14 },
  secundario: { backgroundColor: "#5C6BC0" },
  apagado: { opacity: 0.45 },
  empezarTexto: { color: "#fff", fontSize: 24, fontWeight: "900" },
  meta: { flexDirection: "row", gap: 4, backgroundColor: "#fff", borderRadius: 24, paddingHorizontal: 14, paddingVertical: 6 },
  estrella: { fontSize: 28 },
  equipo: { flexDirection: "row", alignItems: "flex-end", gap: 24 },
  jugador: { alignItems: "center", opacity: 0.6 },
  jugadorTurno: { opacity: 1, backgroundColor: "#FFF59D", borderRadius: 24, padding: 6 },
  opciones: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 16 },
  opcion: { width: 120, height: 120, borderRadius: 26, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: "#fff" },
  pista: { borderColor: "#FDD835", backgroundColor: "#FFFDE7" },
  opcionEmoji: { fontSize: 70 },
  confeti: { fontSize: 56 },
  equipoFiesta: { flexDirection: "row", alignItems: "flex-end", gap: 10, flexWrap: "wrap", justifyContent: "center" },
  torta: { fontSize: 70 },
  botones: { flexDirection: "row", gap: 16 },
});
