import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../../components/Pantalla";
import { Globo, TitoDibujo, useSalto } from "../../components/Personajes";
import { hablar } from "../../lib/voz";

/** El patio de Emilia: cuidar a Tito y respirar con él (rincón de la calma). */
export default function Patio() {
  const [texto, setTexto] = useState("¡Tito quiere jugar contigo!");
  const [corazones, setCorazones] = useState<number[]>([]);
  const [respirando, setRespirando] = useState(false);
  const { y, saltar } = useSalto();
  const globo = useRef(new Animated.Value(0.6)).current;
  const contador = useRef(0);

  useEffect(() => void hablar("¡Bienvenidos al patio! Tito quiere jugar."), []);

  function decir(t: string) {
    setTexto(t);
    hablar(t);
  }

  function carino() {
    saltar();
    const id = contador.current++;
    setCorazones((c) => [...c, id]);
    setTimeout(() => setCorazones((c) => c.filter((x) => x !== id)), 1200);
    decir(["¡Pip! A Tito le encanta que le rasquen las orejas.", "¡Mmm! Tito cierra los ojitos de gusto.", "¡Tito está feliz!"][id % 3]!);
  }

  function respirar() {
    if (respirando) return;
    setRespirando(true);
    decir("Inflamos el globo… y lo soltamos despacito.");
    const ciclo = Animated.sequence([
      Animated.timing(globo, { toValue: 1.4, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      Animated.timing(globo, { toValue: 0.6, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
    ]);
    Animated.sequence([ciclo, ciclo, ciclo]).start(() => {
      setRespirando(false);
      decir("¡Muy bien! Gracias por respirar con Tito.");
    });
  }

  return (
    <Pantalla color="#C5E1A5">
      <Globo texto={texto} />
      <View style={estilos.escena}>
        {respirando ? (
          <Animated.Text style={[estilos.globoRespirar, { transform: [{ scale: globo }] }]}>🎈</Animated.Text>
        ) : (
          <Pressable onPress={carino} accessibilityLabel="Acariciar a Tito">
            <Animated.View style={{ transform: [{ translateY: y }] }}>
              <TitoDibujo alto={200} />
            </Animated.View>
          </Pressable>
        )}
        {corazones.map((id) => (
          <Text key={id} style={[estilos.corazon, { left: 40 + ((id * 47) % 180) }]}>💛</Text>
        ))}
      </View>
      <View style={estilos.acciones}>
        <Accion emoji="🍃" texto="Hojas" alTocar={() => { saltar(); decir("¡Ñam, ñam! A Tito le encantan las hojas tiernas."); }} />
        <Accion emoji="🤗" texto="Cariño" alTocar={carino} />
        <Accion emoji="🎈" texto="Respirar" alTocar={respirar} />
      </View>
    </Pantalla>
  );
}

function Accion({ emoji, texto, alTocar }: { emoji: string; texto: string; alTocar: () => void }) {
  return (
    <Pressable style={estilos.accion} onPress={alTocar} accessibilityLabel={texto}>
      <Text style={estilos.accionEmoji}>{emoji}</Text>
      <Text style={estilos.accionTexto}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  escena: { flex: 1, width: "100%", alignItems: "center", justifyContent: "center" },
  globoRespirar: { fontSize: 140 },
  corazon: { position: "absolute", top: 40, fontSize: 36 },
  acciones: { flexDirection: "row", gap: 20, paddingBottom: 16 },
  accion: { width: 110, height: 110, borderRadius: 28, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  accionEmoji: { fontSize: 48 },
  accionTexto: { fontSize: 16, fontWeight: "800", color: "#3B2F5C" },
});
