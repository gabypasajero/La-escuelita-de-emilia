import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { APARIENCIA_INICIAL, Avatar, PEINADOS, PELOS, PIELES, ROPAS } from "../components/Avatar";
import { EmiliaDibujo, Globo } from "../components/Personajes";
import { useJuego, type Apariencia } from "../lib/juego";
import { hablar } from "../lib/voz";

const NOMBRE_PEINADO: Record<Apariencia["peinado"], string> = { corto: "Corto", colitas: "Colitas", largo: "Largo", rizado: "Rizado" };

/** Crear (o cambiar) el personaje del niño: nombre, piel, pelo, peinado y ropa. */
export default function Personaje() {
  const { perfil, guardarPerfil } = useJuego();
  const [nombre, setNombre] = useState(perfil?.nombre ?? "");
  const [a, setA] = useState<Apariencia>(perfil?.apariencia ?? APARIENCIA_INICIAL);
  const nuevo = !perfil;

  useEffect(() => {
    void hablar(nuevo ? "¡Hola! Soy Emilia. ¡Vamos a crear tu personaje! ¿Cómo te llamas? Pídele ayuda a un adulto para escribirlo." : "¿Cambiamos tu personaje?");
  }, [nuevo]);

  const cambiar = (parcial: Partial<Apariencia>) => setA((x) => ({ ...x, ...parcial }));

  function listo() {
    const n = nombre.trim();
    if (!n) {
      void hablar("¿Cómo te llamas? Escríbelo arriba con un adulto.");
      return;
    }
    guardarPerfil({ nombre: n, apariencia: a });
    void hablar(`¡Te ves increíble, ${n}! Ya eres parte del barrio.`);
    router.replace("/");
  }

  return (
    <SafeAreaView style={estilos.fondo}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.cabecera}>
          <EmiliaDibujo alto={110} />
          <Globo texto={nuevo ? "¡Vamos a crear tu personaje!" : "¿Cambiamos tu personaje?"} alLado="izquierda" />
        </View>

        <View style={estilos.cuerpo}>
          <View style={estilos.vista}>
            <Avatar apariencia={a} alto={240} />
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre"
              maxLength={16}
              style={estilos.nombre}
              accessibilityLabel="Nombre del personaje"
            />
          </View>

          <View style={estilos.opciones}>
            <Fila titulo="Piel">
              {PIELES.map((c) => <Color key={c} color={c} elegido={a.piel === c} alTocar={() => cambiar({ piel: c })} />)}
            </Fila>
            <Fila titulo="Pelo">
              {PELOS.map((c) => <Color key={c} color={c} elegido={a.pelo === c} alTocar={() => cambiar({ pelo: c })} />)}
            </Fila>
            <Fila titulo="Peinado">
              {PEINADOS.map((p) => (
                <Pressable key={p} onPress={() => cambiar({ peinado: p })} style={[estilos.peinado, a.peinado === p && estilos.elegido]} accessibilityLabel={NOMBRE_PEINADO[p]}>
                  <Avatar apariencia={{ ...a, peinado: p }} alto={70} />
                </Pressable>
              ))}
            </Fila>
            <Fila titulo="Ropa">
              {ROPAS.map((c) => <Color key={c} color={c} elegido={a.ropa === c} alTocar={() => cambiar({ ropa: c })} />)}
            </Fila>
          </View>
        </View>

        <Pressable style={estilos.listo} onPress={listo} accessibilityLabel="Listo">
          <Text style={estilos.listoTexto}>✅ ¡Listo!</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Fila({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.filaTitulo}>{titulo}</Text>
      <View style={estilos.filaOpciones}>{children}</View>
    </View>
  );
}

function Color({ color, elegido, alTocar }: { color: string; elegido: boolean; alTocar: () => void }) {
  return <Pressable onPress={alTocar} accessibilityLabel={`Color ${color}`} style={[estilos.color, { backgroundColor: color }, elegido && estilos.elegido]} />;
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "#FFF3E0" },
  contenido: { padding: 16, alignItems: "center", gap: 12 },
  cabecera: { flexDirection: "row", alignItems: "center", gap: 8 },
  cuerpo: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 24 },
  vista: { alignItems: "center", backgroundColor: "#fff", borderRadius: 28, padding: 16, gap: 12 },
  nombre: { fontSize: 26, fontWeight: "800", color: "#3B2F5C", borderBottomWidth: 3, borderColor: "#CE93D8", minWidth: 180, textAlign: "center", paddingVertical: 4 },
  opciones: { gap: 12 },
  fila: { gap: 6 },
  filaTitulo: { fontSize: 18, fontWeight: "800", color: "#3B2F5C" },
  filaOpciones: { flexDirection: "row", flexWrap: "wrap", gap: 10, maxWidth: 520 },
  color: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: "#fff" },
  peinado: { backgroundColor: "#fff", borderRadius: 16, padding: 4, borderWidth: 3, borderColor: "#fff" },
  elegido: { borderColor: "#3B2F5C", borderWidth: 4 },
  listo: { backgroundColor: "#43A047", borderRadius: 30, paddingHorizontal: 40, paddingVertical: 16, marginTop: 8 },
  listoTexto: { color: "#fff", fontSize: 26, fontWeight: "900" },
});
