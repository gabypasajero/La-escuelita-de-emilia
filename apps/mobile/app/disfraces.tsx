import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Avatar, TitoVestido } from "../components/Avatar";
import { Pantalla } from "../components/Pantalla";
import { Globo } from "../components/Personajes";
import { ACCESORIOS, useJuego, type Accesorio } from "../lib/juego";
import { hablar } from "../lib/voz";

/**
 * Tienda de disfraces: se compran accesorios con las monedas ganadas jugando
 * (nunca con dinero real, sin cajas sorpresa). Lo comprado se pone y se saca.
 */
export default function Disfraces() {
  const { perfil, monedas, comprados, puestos, comprar, alternar, accesorioPuesto } = useJuego();
  const [dicho, setDicho] = useState("¡Bienvenidos a la tienda de disfraces! ¿Qué te pruebas?");

  useEffect(() => void hablar("¡Bienvenidos a la tienda de disfraces! ¿Qué te pruebas?"), []);

  function decir(t: string) {
    setDicho(t);
    void hablar(t);
  }

  function tocar(a: Accesorio) {
    if (comprados.includes(a.id)) {
      const yaPuesto = puestos[a.ranura] === a.id;
      alternar(a.id);
      decir(yaPuesto ? `Te sacaste: ${a.nombre}.` : `¡Te queda precioso: ${a.nombre}!`);
      return;
    }
    if (monedas < a.precio) {
      const faltan = a.precio - monedas;
      decir(`Te faltan ${faltan} ${faltan === 1 ? "moneda" : "monedas"}. ¡Juega en el barrio para ganar más!`);
      return;
    }
    comprar(a.id);
    decir(`¡Compraste: ${a.nombre}! ¡Mírate!`);
  }

  if (!perfil) return null;

  return (
    <Pantalla color="#F8BBD0">
      <View style={estilos.arriba}>
        <View style={estilos.espejo}>
          <Avatar apariencia={perfil.apariencia} alto={190} accesorios={{
            cabeza: accesorioPuesto("cabeza"), cara: accesorioPuesto("cara"), cuello: accesorioPuesto("cuello"), mano: accesorioPuesto("mano"),
          }} />
          <TitoVestido alto={70} accesorio={accesorioPuesto("tito")} />
        </View>
        <Globo texto={dicho} alLado="izquierda" />
      </View>
      <ScrollView contentContainerStyle={estilos.estante}>
        {ACCESORIOS.map((a) => {
          const tiene = comprados.includes(a.id);
          const puesto = puestos[a.ranura] === a.id;
          return (
            <Pressable key={a.id} onPress={() => tocar(a)} accessibilityLabel={a.nombre}
              style={[estilos.item, puesto && estilos.puesto, !tiene && monedas < a.precio && estilos.caro]}>
              <Text style={estilos.itemEmoji}>{a.emoji}</Text>
              {a.ranura === "tito" && <Text style={estilos.paraTito}>para Tito</Text>}
              <Text style={estilos.precio}>{tiene ? (puesto ? "✅ Puesto" : "Ponérmelo") : `🪙 ${a.precio}`}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  arriba: { flexDirection: "row", alignItems: "center", gap: 12 },
  espejo: { flexDirection: "row", alignItems: "flex-end", backgroundColor: "#fff", borderRadius: 100, paddingHorizontal: 24, paddingVertical: 8, borderWidth: 6, borderColor: "#F48FB1" },
  estante: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12, paddingVertical: 16, maxWidth: 900 },
  item: { width: 120, height: 130, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: "#fff" },
  puesto: { borderColor: "#43A047" },
  caro: { opacity: 0.55 },
  itemEmoji: { fontSize: 54 },
  paraTito: { fontSize: 12, fontWeight: "800", color: "#8D6E63" },
  precio: { fontSize: 16, fontWeight: "900", color: "#3B2F5C" },
});
