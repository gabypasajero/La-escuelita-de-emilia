import { NUMEROS, rondaContar } from "@escuelita/core";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../components/Pantalla";
import { Pregunta } from "../components/Pregunta";
import { COLORES } from "../lib/tema";
import { hablar } from "../lib/voz";

const OBJETO_POR_NUMERO = ["", "⭐", "🍎", "🎈", "🐟", "🌼", "🐞", "🍓", "🚗", "🦋", "🍪"];
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Números como el abecedario: primero se conocen (cada número con su cantidad
 * de objetos, contados en voz alta) y después se juega a "¿cuántos hay?".
 * Pensado para niños que todavía no conocen los números.
 */
export default function Numeros() {
  const [jugando, setJugando] = useState(false);
  const [contando, setContando] = useState<{ numero: number; hasta: number } | null>(null);

  async function contar(numero: number) {
    if (contando) return;
    const palabra = NUMEROS[numero]!.palabra;
    await hablar(`${palabra[0]!.toUpperCase()}${palabra.slice(1)}.`);
    // Cuenta en voz alta iluminando cada objeto: correspondencia uno a uno.
    for (let k = 1; k <= numero; k++) {
      setContando({ numero, hasta: k });
      await Promise.all([hablar(NUMEROS[k]!.palabra), espera(650)]);
    }
    await espera(400);
    setContando(null);
  }

  return (
    <Pantalla color={COLORES.numeros}>
      <Pressable style={estilos.modo} onPress={() => setJugando((j) => !j)}>
        <Text style={estilos.modoTexto}>{jugando ? "📖 Conocer" : "🎮 Jugar"}</Text>
      </Pressable>
      {jugando ? (
        <Pregunta
          generar={(nivel) => rondaContar(nivel)}
          estimulo={(r) => <ObjetosContables key={`${r.objeto}-${r.cantidad}-${r.opciones.join()}`} objeto={r.objeto} cantidad={r.cantidad} />}
          opcion={(n) => (
            <View style={estilos.opcion}>
              <Text style={estilos.numero}>{n}</Text>
              <Puntos cantidad={n} />
            </View>
          )}
          alAcertar={(r) => `¡Sí! Hay ${NUMEROS[r.cantidad]!.palabra}.`}
        />
      ) : (
        <ScrollView contentContainerStyle={estilos.grilla}>
          {NUMEROS.slice(1).map((n) => {
            const activo = contando?.numero === n.valor;
            return (
              <Pressable key={n.valor} style={[estilos.tarjeta, activo && estilos.tarjetaActiva]} onPress={() => void contar(n.valor)} accessibilityLabel={n.palabra}>
                <Text style={estilos.numeroGrande}>{n.valor}</Text>
                <View style={estilos.objetos}>
                  {Array.from({ length: n.valor }, (_, k) => (
                    <Text key={k} style={[estilos.objeto, activo && k >= contando!.hasta && estilos.apagado]}>
                      {OBJETO_POR_NUMERO[n.valor]}
                    </Text>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </Pantalla>
  );
}

/** Objetos de la pregunta: tocarlos los va contando en voz alta (ayuda para quien recién aprende). */
function ObjetosContables({ objeto, cantidad }: { objeto: string; cantidad: number }) {
  const [tocados, setTocados] = useState<number[]>([]);
  return (
    <View style={estilos.contables}>
      {Array.from({ length: cantidad }, (_, k) => {
        const orden = tocados.indexOf(k);
        return (
          <Pressable
            key={k}
            accessibilityLabel={`Objeto ${k + 1}`}
            onPress={() => {
              if (orden >= 0) return;
              const nuevos = [...tocados, k];
              setTocados(nuevos);
              void hablar(NUMEROS[nuevos.length]!.palabra);
            }}
          >
            <Text style={[estilos.contable, orden >= 0 && estilos.contado]}>{objeto}</Text>
            {orden >= 0 && <Text style={estilos.marca}>{orden + 1}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

function Puntos({ cantidad }: { cantidad: number }) {
  return (
    <View style={estilos.puntos}>
      {Array.from({ length: cantidad }, (_, k) => (
        <View key={k} style={estilos.punto} />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  modo: { alignSelf: "flex-end", marginBottom: 12, backgroundColor: "#fff", borderRadius: 24, padding: 16 },
  modoTexto: { fontSize: 20, fontWeight: "700", color: COLORES.texto },
  grilla: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 14, paddingBottom: 24 },
  tarjeta: { width: 150, minHeight: 150, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", padding: 8 },
  tarjetaActiva: { borderWidth: 5, borderColor: "#FDD835" },
  numeroGrande: { fontSize: 52, fontWeight: "800", color: COLORES.texto },
  objetos: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", maxWidth: 130 },
  objeto: { fontSize: 22 },
  apagado: { opacity: 0.25 },
  contables: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, maxWidth: 560 },
  contable: { fontSize: 64 },
  contado: { opacity: 0.55 },
  marca: { position: "absolute", top: -4, right: -4, backgroundColor: "#3B2F5C", color: "#fff", fontWeight: "800", borderRadius: 12, paddingHorizontal: 7, fontSize: 16 },
  opcion: { alignItems: "center" },
  numero: { fontSize: 52, fontWeight: "800", color: COLORES.texto },
  puntos: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 4, maxWidth: 90 },
  punto: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#E53935" },
});
