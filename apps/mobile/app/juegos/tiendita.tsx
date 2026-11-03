import { ESTADO_INICIAL, PRODUCTOS, canastaCorrecta, pedidoTiendita, registrarRespuesta, type Producto } from "@escuelita/core";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path, Rect, Text as SvgText } from "react-native-svg";
import { EscenaRPG, type EscenaRPGRef, type ObjetoEscena } from "../../components/EscenaRPG";
import { useJuego } from "../../lib/juego";
import { hablar, hablarYEsperar } from "../../lib/voz";

const CLIENTES = ["🐻", "🐰", "🦊", "🐼", "🐸", "🦙"];
const ESTANTE_X = PRODUCTOS.map((_, i) => 100 + i * 112);
const MESON = { x: 900, y: 560 };

/**
 * Almacén de Doña Rosa para recorrer (juego de roles): entra un cliente y
 * pide productos; el niño camina a los estantes, saca la cantidad pedida
 * contando y la lleva al mesón. Todos los estantes están siempre disponibles.
 */
export default function Tiendita() {
  const { ganar } = useJuego();
  const [dificultad, setDificultad] = useState(ESTADO_INICIAL);
  const [pedido, setPedido] = useState(() => pedidoTiendita(ESTADO_INICIAL.nivel));
  const [cliente, setCliente] = useState(CLIENTES[0]!);
  const [canasta, setCanasta] = useState<Producto[]>([]);
  const [feliz, setFeliz] = useState(false);
  const [dicho, setDicho] = useState("¡Ay, qué alegría! ¿Me ayudas a atender el almacén?");
  const entrada = useRef(new Animated.Value(1)).current;
  const escena = useRef<EscenaRPGRef>(null);
  const ocupado = useRef(false);

  const decir = (t: string) => { setDicho(t); void hablar(t); };

  // El cliente entra por la puerta y hace su pedido.
  useEffect(() => {
    entrada.setValue(1);
    Animated.timing(entrada, { toValue: 0, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start(() => {
      setDicho(pedido.enunciado);
      void hablar(`${pedido.enunciado}. Busca en los estantes.`);
    });
  }, [pedido, entrada]);

  function sacar(p: Producto) {
    if (feliz) return;
    if (canasta.length >= 10) return decir("¡La canasta está llena! Llévala al mesón.");
    const nueva = [...canasta, p];
    setCanasta(nueva);
    // Contar en voz alta: correspondencia uno a uno.
    void hablar(`${nueva.length}. ${nueva.length === 1 ? p.nombre : p.plural}`);
  }

  async function entregar() {
    if (feliz || ocupado.current) return;
    if (!canasta.length) return decir(`Primero busca ${pedido.cantidad === 1 ? "el producto" : "los productos"} en los estantes.`);
    ocupado.current = true;
    const acierto = canastaCorrecta(pedido, canasta);
    const siguiente = registrarRespuesta(dificultad, acierto);
    setDificultad(siguiente);
    if (!acierto) {
      const pedidos = canasta.filter((p) => p.id === pedido.producto.id).length;
      const t = canasta.some((p) => p.id !== pedido.producto.id)
        ? `Mmm, yo pedí ${pedido.producto.plural}. Revisemos la canasta.`
        : pedidos < pedido.cantidad ? "Me falta un poquito más." : "¡Uy, son muchos! Contemos otra vez.";
      setCanasta([]);
      decir(t);
      ocupado.current = false;
      return;
    }
    setFeliz(true);
    ganar(2);
    setDicho("¡Gracias! ¡Justo lo que quería!");
    await hablarYEsperar("¡Gracias! ¡Justo lo que quería!", 200);
    setDicho("¡Perfecto! El cliente se va feliz.");
    await hablarYEsperar("¡Perfecto! El cliente se va feliz.", 300);
    setFeliz(false);
    setCanasta([]);
    setCliente(CLIENTES[Math.floor(Math.random() * CLIENTES.length)]!);
    setPedido(pedidoTiendita(siguiente.nivel));
    ocupado.current = false;
  }

  const objetos: ObjetoEscena[] = [
    ...PRODUCTOS.map((p, i): ObjetoEscena => ({
      id: p.id, x: ESTANTE_X[i]!, y: 370, ancho: 104, alto: 200, etiqueta: p.nombre, letrero: p.nombre,
      llegada: { x: ESTANTE_X[i]!, y: 420 },
      dibujo: (k) => <Estante emoji={p.emoji} k={k} />,
      alLlegar: () => sacar(p),
    })),
    { id: "rosa", x: MESON.x + 60, y: MESON.y - 70, ancho: 110, alto: 150, etiqueta: "Doña Rosa", letrero: "Doña Rosa",
      dibujo: (k) => <Text style={{ fontSize: 96 * k }}>👵</Text>, llegada: { x: MESON.x - 60, y: MESON.y + 70 }, alLlegar: () => void entregar() },
    { id: "meson", x: MESON.x, y: MESON.y, ancho: 260, alto: 90, etiqueta: "Mesón para entregar", letrero: "Entregar aquí",
      dibujo: (k) => <Meson k={k} />, llegada: { x: MESON.x - 60, y: MESON.y + 70 }, alLlegar: () => void entregar() },
  ];

  return (
    <EscenaRPG
      ref={escena}
      fondo={(k) => <Almacen k={k} />}
      objetos={objetos}
      inicio={{ x: 520, y: 600 }}
      piso={{ xMin: 40, xMax: 1060, yMin: 400, yMax: 690 }}
      dialogo={dicho}
      colorFondo="#FFE0B2"
      extras={(k) => (
        <Animated.View
          pointerEvents="none"
          style={{ position: "absolute", left: (MESON.x - 130) * k, top: (MESON.y - 10) * k, zIndex: MESON.y + 5, alignItems: "center",
            transform: [{ translateX: entrada.interpolate({ inputRange: [0, 1], outputRange: [0, 320 * k] }) }] }}
        >
          <View style={estilos.pedido}>
            <Text style={[estilos.pedidoTexto, { fontSize: 26 * k }]}>{pedido.cantidad} × {pedido.producto.emoji}</Text>
          </View>
          <Text style={{ fontSize: 90 * k }}>{feliz ? "😍" : cliente}</Text>
        </Animated.View>
      )}
    >
      {/* La canasta del niño */}
      <Pressable style={estilos.canasta} onPress={() => { setCanasta((c) => c.slice(0, -1)); }} accessibilityLabel="Sacar uno de la canasta">
        <Text style={estilos.canastaIcono}>🧺</Text>
        <Text style={estilos.canastaTexto}>{canasta.length ? canasta.map((p) => p.emoji).join("") : "vacía"}</Text>
      </Pressable>
      <Pressable style={estilos.repetir} onPress={() => decir(pedido.enunciado)} accessibilityLabel="Repetir pedido">
        <Text style={estilos.repetirTexto}>🔊 {pedido.cantidad} × {pedido.producto.emoji}</Text>
      </Pressable>
    </EscenaRPG>
  );
}

const Estante = ({ emoji, k }: { emoji: string; k: number }) => (
  <View style={{ width: 104 * k, height: 180 * k, backgroundColor: "#A1887F", borderRadius: 8 * k, padding: 4 * k, justifyContent: "space-around", borderWidth: 3, borderColor: "#6D4C41" }}>
    {[0, 1, 2].map((fila) => (
      <View key={fila} style={{ flexDirection: "row", justifyContent: "center", borderBottomWidth: 5 * k, borderBottomColor: "#6D4C41" }}>
        <Text style={{ fontSize: 30 * k }}>{emoji}{emoji}</Text>
      </View>
    ))}
  </View>
);

const Meson = ({ k }: { k: number }) => (
  <Svg width={260 * k} height={90 * k} viewBox="0 0 260 90">
    <Rect x="0" y="0" width="260" height="24" rx="8" fill="#8D5524" />
    <Rect x="8" y="24" width="244" height="66" fill="#A1673F" />
    <Rect x="190" y="-30" width="50" height="34" rx="6" fill="#78909C" />
    <SvgText x="215" y="-8" fontSize="16" fontWeight="bold" fill="#fff" textAnchor="middle">$</SvgText>
  </Svg>
);

function Almacen({ k }: { k: number }) {
  return (
    <Svg width={1100 * k} height={700 * k} viewBox="0 0 1100 700">
      <Rect x="0" y="0" width="1100" height="380" fill="#FFF3E0" />
      <Rect x="0" y="0" width="1100" height="70" fill="#fff" />
      <SvgText x="200" y="46" fontSize="30" fontWeight="bold" fill="#8D6E63" textAnchor="middle">ALMACÉN</SvgText>
      <SvgText x="900" y="46" fontSize="30" fontWeight="bold" fill="#8D6E63" textAnchor="middle">DOÑA ROSA</SvgText>
      {Array.from({ length: 22 }, (_, i) => <Path key={i} d={`M${i * 50} 70 h50 v26 q-25 18 -50 0 z`} fill={i % 2 ? "#fff" : "#E53935"} />)}
      <Rect x="0" y="380" width="1100" height="320" fill="#D7A86E" />
      {Array.from({ length: 12 }, (_, i) => <Path key={i} d={`M${i * 100} 380 V700`} stroke="#C49358" strokeWidth="3" />)}
      {/* Puerta de entrada */}
      <Rect x="1040" y="420" width="60" height="200" fill="#8D6E63" />
    </Svg>
  );
}

const estilos = StyleSheet.create({
  pedido: { backgroundColor: "#fff", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 3, borderColor: "#3B2F5C" },
  pedidoTexto: { fontWeight: "900", color: "#3B2F5C" },
  canasta: { position: "absolute", bottom: 12, left: 12, backgroundColor: "#FFF8E1", borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 3, borderColor: "#A1887F", maxWidth: 520 },
  canastaIcono: { fontSize: 36 },
  canastaTexto: { fontSize: 26, fontWeight: "800", color: "#3B2F5C" },
  repetir: { position: "absolute", bottom: 12, right: 12, backgroundColor: "#fff", borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10 },
  repetirTexto: { fontSize: 24, fontWeight: "900", color: "#3B2F5C" },
});
