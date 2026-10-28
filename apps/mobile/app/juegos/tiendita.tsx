import {
  ESTADO_INICIAL,
  canastaCorrecta,
  pedidoTiendita,
  registrarRespuesta,
  type Producto,
} from "@escuelita/core";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Path, Rect, Text as SvgText } from "react-native-svg";
import { BotonCasa } from "../../components/BotonCasa";
import { Globo, useRespirar } from "../../components/Personajes";
import { TOQUE_MINIMO } from "../../lib/tema";
import { Monedas, useJuego } from "../../lib/juego";
import { hablar, hablarYEsperar } from "../../lib/voz";

const CLIENTES = ["🐻", "🐰", "🦊", "🐼", "🐸", "🦙"];
/** Mercadería de adorno en los estantes del almacén (no se usa en el pedido). */
const ADORNOS = [
  ["🥫", "🍯", "🧃", "🫙", "🥫", "🍪", "🧃"],
  ["🍞", "🥖", "🧀", "🥚", "🍞", "🥐", "🧀"],
  ["🍎", "🍌", "🥕", "🍇", "🥑", "🍐", "🍅"],
];

/**
 * La Tiendita de Doña Rosa (juego de roles, estilo Cocobi): un cliente entra
 * al almacén y pide productos. El niño los toma del mesón, los pone en la
 * canasta contando en voz alta y entrega el pedido.
 */
export default function Tiendita() {
  const { width } = useWindowDimensions();
  const [dificultad, setDificultad] = useState(ESTADO_INICIAL);
  const [pedido, setPedido] = useState(() => pedidoTiendita(ESTADO_INICIAL.nivel));
  const [cliente, setCliente] = useState(CLIENTES[0]!);
  const [canasta, setCanasta] = useState<Producto[]>([]);
  const [feliz, setFeliz] = useState(false);
  const [dicho, setDicho] = useState("¡Ay, qué alegría! ¿Me ayudas a atender?");
  const entrada = useRef(new Animated.Value(1)).current;
  const rosa = useRespirar(3, 1300);
  const { ganar } = useJuego();

  // El cliente entra caminando y hace su pedido.
  useEffect(() => {
    entrada.setValue(1);
    Animated.timing(entrada, { toValue: 0, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(() => {
      void hablar(pedido.enunciado);
    });
  }, [pedido, entrada]);

  function agregar(producto: Producto) {
    if (feliz || canasta.length >= 10) return;
    const nueva = [...canasta, producto];
    setCanasta(nueva);
    // Contar en voz alta refuerza la correspondencia uno a uno.
    void hablar(String(nueva.length));
  }

  async function entregar() {
    if (feliz || canasta.length === 0) return;
    const acierto = canastaCorrecta(pedido, canasta);
    const siguiente = registrarRespuesta(dificultad, acierto);
    setDificultad(siguiente);
    if (!acierto) {
      const faltan = pedido.cantidad - canasta.length;
      const frase = faltan > 0 ? "Me falta un poquito más." : "Mmm, contemos otra vez, despacito.";
      setDicho(frase);
      setCanasta([]);
      await hablar(frase);
      return;
    }
    setFeliz(true);
    ganar(2);
    setDicho("¡Perfecto! El cliente se va feliz.");
    // Primero termina de agradecer el cliente, después Doña Rosa, y recién entonces llega otro.
    await hablarYEsperar("¡Gracias! ¡Justo lo que quería!", 200);
    await hablarYEsperar("¡Perfecto! El cliente se va feliz.", 300);
    setFeliz(false);
    setCanasta([]);
    setDicho("¡Mira, viene alguien más!");
    setCliente(CLIENTES[Math.floor(Math.random() * CLIENTES.length)]!);
    setPedido(pedidoTiendita(siguiente.nivel));
  }

  const anchoEstante = Math.min(width - 32, 900);

  return (
    <View style={estilos.fondo}>
      {/* Toldo a rayas y letrero del almacén */}
      <Svg width="100%" height={110} viewBox="0 0 1000 110" preserveAspectRatio="none" style={estilos.toldo}>
        <Rect x="0" y="0" width="1000" height="56" fill="#FFF3E0" />
        <SvgText x="500" y="40" fontSize="34" fontWeight="bold" fill="#8D6E63" textAnchor="middle">ALMACÉN DOÑA ROSA</SvgText>
        {Array.from({ length: 20 }, (_, k) => (
          <Path key={k} d={`M${k * 50} 56 h50 v34 q-25 22 -50 0 z`} fill={k % 2 ? "#fff" : "#E53935"} />
        ))}
      </Svg>
      <BotonCasa />
      <Monedas />

      {/* Muralla con estantes llenos */}
      <View style={[estilos.estantes, { width: anchoEstante }]}>
        {ADORNOS.map((fila, i) => (
          <View key={i} style={estilos.repisa}>
            {fila.map((e, k) => (
              <Text key={k} style={estilos.adorno}>{e}</Text>
            ))}
          </View>
        ))}
      </View>

      {/* Doña Rosa detrás del mesón y el cliente frente a ella */}
      <View style={[estilos.escena, { width: anchoEstante }]}>
        <Animated.View style={[estilos.rosa, { transform: [{ translateY: rosa }] }]}>
          <Text style={estilos.rosaEmoji}>👵</Text>
          <Text style={estilos.nombre}>Doña Rosa</Text>
        </Animated.View>
        <View style={estilos.dialogos}>
          <Globo texto={dicho} alLado="izquierda" />
        </View>
        <Animated.View
          style={[estilos.cliente, { transform: [{ translateX: entrada.interpolate({ inputRange: [0, 1], outputRange: [0, 400] }) }] }]}
        >
          <Pressable onPress={() => void hablar(pedido.enunciado)} accessibilityLabel="Repetir pedido" style={estilos.pedido}>
            <Text style={estilos.pedidoTexto}>
              🔊 {pedido.cantidad} × {pedido.producto.emoji}
            </Text>
          </Pressable>
          <Text style={estilos.clienteEmoji}>{feliz ? "😍" : cliente}</Text>
        </Animated.View>
      </View>

      {/* Mesón de madera con los productos, la canasta y la caja */}
      <View style={[estilos.meson, { width: anchoEstante }]}>
        <View style={estilos.productos}>
          {pedido.estante.map((p) => (
            <Pressable key={p.id} style={estilos.producto} onPress={() => agregar(p)} accessibilityLabel={p.nombre}>
              <Text style={estilos.productoEmoji}>{p.emoji}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={estilos.canasta} onPress={() => setCanasta((c) => c.slice(0, -1))} accessibilityLabel="Sacar uno">
          <Text style={estilos.canastaIcono}>🧺</Text>
          <View style={estilos.contenido}>
            {canasta.map((p, i) => (
              <Text key={i} style={estilos.enCanasta}>{p.emoji}</Text>
            ))}
          </View>
        </Pressable>
        <Pressable style={[estilos.entregar, canasta.length === 0 && estilos.apagado]} onPress={() => void entregar()} accessibilityLabel="Entregar">
          <Text style={estilos.entregarTexto}>✅</Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: "#FFE0B2", alignItems: "center" },
  toldo: { position: "absolute", top: 0, left: 0 },
  estantes: { marginTop: 112, backgroundColor: "#FFF8E1", borderRadius: 12, padding: 6, gap: 6, borderWidth: 4, borderColor: "#A1887F" },
  repisa: { flexDirection: "row", justifyContent: "space-around", borderBottomWidth: 10, borderBottomColor: "#8D6E63", paddingVertical: 4 },
  adorno: { fontSize: 44 },
  escena: { flex: 1, minHeight: 200, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 8, marginBottom: -12 },
  rosa: { alignItems: "center" },
  rosaEmoji: { fontSize: 120 },
  nombre: { fontSize: 14, fontWeight: "800", color: "#5D4037", backgroundColor: "#FFF3E0", borderRadius: 8, paddingHorizontal: 6 },
  dialogos: { flex: 1, alignSelf: "flex-start", paddingHorizontal: 8, paddingTop: 16 },
  cliente: { alignItems: "center" },
  pedido: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 3, borderColor: "#3B2F5C", marginBottom: 4 },
  pedidoTexto: { fontSize: 28, fontWeight: "800", color: "#3B2F5C" },
  clienteEmoji: { fontSize: 120 },
  meson: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "#A1673F",
    borderTopWidth: 10,
    borderTopColor: "#8D5524",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    padding: 14,
  },
  productos: { flexDirection: "row", gap: 12 },
  producto: { width: TOQUE_MINIMO * 1.2, height: TOQUE_MINIMO * 1.2, borderRadius: 20, backgroundColor: "#FFF3E0", alignItems: "center", justifyContent: "center" },
  productoEmoji: { fontSize: 54 },
  canasta: { flex: 1, minHeight: 100, borderRadius: 20, backgroundColor: "#FFF8E1", padding: 8, alignItems: "center" },
  canastaIcono: { fontSize: 34 },
  contenido: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  enCanasta: { fontSize: 28 },
  entregar: { width: TOQUE_MINIMO * 1.2, height: TOQUE_MINIMO * 1.2, borderRadius: TOQUE_MINIMO, backgroundColor: "#66BB6A", alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: "#fff" },
  apagado: { opacity: 0.45 },
  entregarTexto: { fontSize: 44 },
});
