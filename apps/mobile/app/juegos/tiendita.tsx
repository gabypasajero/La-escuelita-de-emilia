import {
  ESTADO_INICIAL,
  canastaCorrecta,
  pedidoTiendita,
  registrarRespuesta,
  type Producto,
} from "@escuelita/core";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Pantalla } from "../../components/Pantalla";
import { COLORES, TOQUE_MINIMO } from "../../lib/tema";
import { hablar } from "../../lib/voz";

const CLIENTES = ["🐻", "🐰", "🦊", "🐼", "🐸", "🦙"];

/**
 * La Tiendita de Emilia: juego de roles (estilo Cocobi) para practicar el
 * conteo. Un cliente pide productos; el niño los toca para ponerlos en la
 * canasta y luego entrega el pedido.
 */
export default function Tiendita() {
  const [dificultad, setDificultad] = useState(ESTADO_INICIAL);
  const [pedido, setPedido] = useState(() => pedidoTiendita(ESTADO_INICIAL.nivel));
  const [cliente, setCliente] = useState(CLIENTES[0]!);
  const [canasta, setCanasta] = useState<Producto[]>([]);
  const [feliz, setFeliz] = useState(false);

  useEffect(() => hablar(pedido.enunciado), [pedido]);

  function agregar(producto: Producto) {
    if (feliz || canasta.length >= 10) return;
    const nueva = [...canasta, producto];
    setCanasta(nueva);
    // Contar en voz alta refuerza la correspondencia uno a uno.
    hablar(String(nueva.length));
  }

  function entregar() {
    if (feliz || canasta.length === 0) return;
    const acierto = canastaCorrecta(pedido, canasta);
    const siguiente = registrarRespuesta(dificultad, acierto);
    setDificultad(siguiente);
    if (!acierto) {
      const faltan = pedido.cantidad - canasta.length;
      hablar(faltan > 0 ? "Me falta un poquito más" : "Hmm, revisemos la canasta");
      setCanasta([]);
      return;
    }
    setFeliz(true);
    hablar("¡Gracias! ¡Justo lo que quería!");
    setTimeout(() => {
      setFeliz(false);
      setCanasta([]);
      setCliente(CLIENTES[Math.floor(Math.random() * CLIENTES.length)]!);
      setPedido(pedidoTiendita(siguiente.nivel));
    }, 1800);
  }

  return (
    <Pantalla color={COLORES.juegos}>
      <Pressable style={estilos.cliente} onPress={() => hablar(pedido.enunciado)} accessibilityLabel="Repetir pedido">
        <Text style={estilos.clienteEmoji}>{feliz ? "😍" : cliente}</Text>
        <View style={estilos.globo}>
          <Text style={estilos.globoTexto}>
            🔊 {pedido.cantidad} × {pedido.producto.emoji}
          </Text>
        </View>
      </Pressable>

      <View style={estilos.estante}>
        {pedido.estante.map((p) => (
          <Pressable key={p.id} style={estilos.producto} onPress={() => agregar(p)} accessibilityLabel={p.nombre}>
            <Text style={estilos.productoEmoji}>{p.emoji}</Text>
          </Pressable>
        ))}
      </View>

      <View style={estilos.fila}>
        <Pressable style={estilos.canasta} onPress={() => setCanasta((c) => c.slice(0, -1))} accessibilityLabel="Sacar uno">
          <Text style={estilos.canastaIcono}>🧺</Text>
          <View style={estilos.contenido}>
            {canasta.map((p, i) => (
              <Text key={i} style={estilos.enCanasta}>
                {p.emoji}
              </Text>
            ))}
          </View>
        </Pressable>
        <Pressable style={[estilos.entregar, canasta.length === 0 && estilos.apagado]} onPress={entregar} accessibilityLabel="Entregar">
          <Text style={estilos.entregarTexto}>✅</Text>
        </Pressable>
      </View>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  cliente: { flexDirection: "row", alignItems: "center", gap: 12 },
  clienteEmoji: { fontSize: 80 },
  globo: { backgroundColor: "#fff", borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12 },
  globoTexto: { fontSize: 36, fontWeight: "800", color: COLORES.texto },
  estante: {
    flexDirection: "row",
    gap: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "#8D6E63",
  },
  producto: {
    width: TOQUE_MINIMO * 1.4,
    height: TOQUE_MINIMO * 1.4,
    borderRadius: 24,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
  },
  productoEmoji: { fontSize: 64 },
  fila: { flexDirection: "row", alignItems: "center", gap: 20 },
  canasta: { minWidth: 260, minHeight: 130, borderRadius: 24, backgroundColor: "#fff", padding: 12, alignItems: "center" },
  canastaIcono: { fontSize: 40 },
  contenido: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", maxWidth: 260 },
  enCanasta: { fontSize: 32 },
  entregar: {
    width: TOQUE_MINIMO * 1.3,
    height: TOQUE_MINIMO * 1.3,
    borderRadius: TOQUE_MINIMO,
    backgroundColor: COLORES.acierto,
    alignItems: "center",
    justifyContent: "center",
  },
  apagado: { opacity: 0.4 },
  entregarTexto: { fontSize: 48 },
});
