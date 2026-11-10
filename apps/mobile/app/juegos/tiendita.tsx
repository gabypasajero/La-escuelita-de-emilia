import { ESTADO_INICIAL, PRODUCTOS, canastaCorrecta, pedidoTiendita, registrarRespuesta, type Producto } from "@escuelita/core";
import { Rebote } from "../../components/Rebote";
import { sonido } from "../../lib/sonidos";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Rect, Text as SvgText } from "react-native-svg";
import { AnimalVivo, type AnimalId } from "../../components/AnimalesVivos";
import { LamparaColgante, Reloj } from "../../components/Ambiente";
import { EscenaRPG, type EscenaRPGRef, type ObjetoEscena } from "../../components/EscenaRPG";
import { Adulto } from "../../components/Personas";
import { nivelPorEdad, useEdad, useJuego } from "../../lib/juego";
import { hablar, hablarYEsperar } from "../../lib/voz";
import { ASTRO_VENTANA, CIELO_VENTANA, useMomento } from "../../lib/hora";
import { useVozActiva } from "../../lib/habla";
import { Icono, TextoIconos } from "../../components/Iconos";

/** Clientes: animales vivos que entran caminando por la puerta. */
const CLIENTES: AnimalId[] = ["oso", "conejo", "zorro", "panda", "rana", "llama"];
const ESTANTE_X = PRODUCTOS.map((_, i) => 100 + i * 112);
const MESON = { x: 900, y: 560 };

/**
 * Almacén de Doña Rosa para recorrer (juego de roles): entra un cliente y
 * pide productos; el niño camina a los estantes, saca la cantidad pedida
 * contando y la lleva al mesón. Todos los estantes están siempre disponibles.
 */
export default function Tiendita() {
  const { ganar } = useJuego();
  const edad = useEdad();
  const [dificultad, setDificultad] = useState(() => ({ ...ESTADO_INICIAL, nivel: nivelPorEdad(edad) }));
  const [pedido, setPedido] = useState(() => pedidoTiendita(nivelPorEdad(edad)));
  const [cliente, setCliente] = useState(CLIENTES[0]!);
  const [canasta, setCanasta] = useState<Producto[]>([]);
  const [feliz, setFeliz] = useState(false);
  const [dicho, setDicho] = useState("¡Ay, qué alegría! ¿Me ayudas a atender el almacén?");
  const entrada = useRef(new Animated.Value(1)).current;
  const escena = useRef<EscenaRPGRef>(null);
  const ocupado = useRef(false);

  const [clienteCamina, setClienteCamina] = useState(false);
  // Doña Rosa mueve la boca y las manos cuando se habla en el almacén.
  const [rosaHabla, setRosaHabla] = useState(true);
  const voz = useVozActiva();
  const silencio = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hablaRosa = (ms: number) => {
    setRosaHabla(true);
    if (silencio.current) clearTimeout(silencio.current);
    silencio.current = setTimeout(() => setRosaHabla(false), ms);
  };
  useEffect(() => hablaRosa(3500), []);
  const decir = (t: string) => { setDicho(t); void hablar(t); hablaRosa(Math.max(3000, t.length * 120)); };

  // El cliente entra por la puerta y hace su pedido.
  useEffect(() => {
    entrada.setValue(1);
    setClienteCamina(true);
    Animated.timing(entrada, { toValue: 0, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: false }).start(() => {
      setClienteCamina(false);
      setDicho(pedido.enunciado);
      void hablar(`${pedido.enunciado}. Busca en los estantes.`);
    });
  }, [pedido, entrada]);

  function sacar(p: Producto) {
    if (feliz) return;
    if (canasta.length >= 10) return decir("¡La canasta está llena! Llévala al mesón.");
    const nueva = [...canasta, p];
    setCanasta(nueva);
    sonido.paso(nueva.length);
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
      sonido.casi();
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
      dibujo: (k) => <Adulto id="rosa" alto={150 * k} hablando={rosaHabla && voz} saludando={feliz} />, llegada: { x: MESON.x - 60, y: MESON.y + 70 }, alLlegar: () => void entregar() },
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
      luz={{ interior: true, luces: [{ x: 330, y: 170, r: 90 }, { x: 760, y: 170, r: 90 }], muro: 380, ventana: { x: 960, y: 120, w: 120, h: 110 }, dirLuz: -1 }}
      extras={(k) => (
        <>
        {/* El gato de Doña Rosa, arriba del primer estante */}
        <View pointerEvents="none" style={{ position: "absolute", left: (ESTANTE_X[0]! - 34) * k, top: 118 * k, zIndex: 371 }}>
          <AnimalVivo id="gato" alto={52 * k} />
        </View>
        <Animated.View
          pointerEvents="none"
          style={{ position: "absolute", left: (MESON.x - 130) * k, top: (MESON.y - 10) * k, zIndex: MESON.y + 5, alignItems: "center",
            transform: [{ translateX: entrada.interpolate({ inputRange: [0, 1], outputRange: [0, 320 * k] }) }] }}
        >
          <View style={estilos.pedido}>
            <TextoIconos texto={`${pedido.cantidad} × ${pedido.producto.emoji}`} tam={36 * k} />
          </View>
          {feliz && <TextoIconos estilo={{ fontSize: 30 * k }} texto={`💛`} />}
          <AnimalVivo id={cliente} alto={(cliente === "llama" ? 120 : cliente === "rana" || cliente === "conejo" ? 70 : 90) * k} caminando={clienteCamina} contento={feliz} />
        </Animated.View>
        </>
      )}
    >
      {/* La canasta del niño: cada casillero del pedido se va llenando, uno por uno */}
      <Rebote mudo style={estilos.canasta} onPress={() => { setCanasta((c) => c.slice(0, -1)); }} accessibilityLabel="Sacar uno de la canasta">
        <TextoIconos estilo={estilos.canastaIcono} texto={`🧺`} />
        <View style={estilos.casilleros}>
          {Array.from({ length: Math.max(pedido.cantidad, canasta.length) }, (_, i) => {
            const puesto = canasta[i];
            const sobra = i >= pedido.cantidad || (puesto && puesto.id !== pedido.producto.id);
            return (
              <View key={i} style={[estilos.casillero, puesto && !sobra && estilos.casilleroLleno, sobra && estilos.casilleroSobra]}>
                <View style={{ opacity: puesto ? 1 : 0.22 }}><Icono e={(puesto ?? pedido.producto).emoji} tam={30} sinSombra /></View>
              </View>
            );
          })}
        </View>
      </Rebote>
      <Pressable style={estilos.repetir} onPress={() => decir(pedido.enunciado)} accessibilityLabel="Repetir pedido">
        <TextoIconos estilo={estilos.repetirTexto} texto={`🔊 ${pedido.cantidad} × ${pedido.producto.emoji}`} />
      </Pressable>
    </EscenaRPG>
  );
}

const Estante = ({ emoji, k }: { emoji: string; k: number }) => (
  <View style={{ width: 104 * k, height: 180 * k, backgroundColor: "#A1887F", borderRadius: 8 * k, padding: 4 * k, justifyContent: "space-around", borderWidth: 3, borderColor: "#6D4C41" }}>
    {[0, 1, 2].map((fila) => (
      <View key={fila} style={{ flexDirection: "row", justifyContent: "center", borderBottomWidth: 5 * k, borderBottomColor: "#6D4C41" }}>
        <Icono e={emoji} tam={38 * k} sinSombra /><Icono e={emoji} tam={38 * k} sinSombra />
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
  const momento = useMomento();
  return (
    <>
      <Svg width={1100 * k} height={700 * k} viewBox="0 0 1100 700">
        <Rect x="0" y="0" width="1100" height="380" fill="#FFF3E0" />
        {/* Papel mural con florcitas */}
        {Array.from({ length: 60 }, (_, i) => <Circle key={i} cx={(i * 97) % 1100} cy={110 + ((i * 53) % 250)} r="3" fill="#FFCC80" opacity="0.6" />)}
        <Rect x="0" y="0" width="1100" height="70" fill="#fff" />
        <SvgText x="200" y="46" fontSize="30" fontWeight="bold" fill="#8D6E63" textAnchor="middle">ALMACÉN</SvgText>
        <SvgText x="900" y="46" fontSize="30" fontWeight="bold" fill="#8D6E63" textAnchor="middle">DOÑA ROSA</SvgText>
        {Array.from({ length: 22 }, (_, i) => <Path key={i} d={`M${i * 50} 70 h50 v26 q-25 18 -50 0 z`} fill={i % 2 ? "#fff" : "#E53935"} />)}
        {/* Ventana a la calle */}
        <Rect x="960" y="120" width="120" height="110" rx="6" fill={CIELO_VENTANA[momento]} stroke="#8D6E63" strokeWidth="8" />
        <Circle cx="1050" cy="148" r="12" fill={ASTRO_VENTANA[momento]} />
        <Path d="M964 210 Q1000 180 1040 205 Q1060 195 1076 206 V226 H964 Z" fill="#81C784" />
        <Path d="M1020 124 V226 M964 175 H1076" stroke="#8D6E63" strokeWidth="5" />
        {/* Piso de madera y zócalo */}
        <Rect x="0" y="372" width="1100" height="10" fill="#A1887F" />
        <Rect x="0" y="380" width="1100" height="320" fill="#D7A86E" />
        {Array.from({ length: 12 }, (_, i) => <Path key={i} d={`M${i * 100} 380 V700`} stroke="#C49358" strokeWidth="3" />)}
        {Array.from({ length: 5 }, (_, i) => <Path key={i} d={`M0 ${440 + i * 60} H1100`} stroke="#C49358" strokeWidth="1.5" opacity="0.6" />)}
        {/* Puerta de entrada */}
        <Rect x="1040" y="420" width="60" height="200" fill="#8D6E63" />
        <Rect x="1050" y="440" width="40" height="70" rx="4" fill="#BBDEFB" opacity="0.8" />
        <Circle cx="1048" cy="530" r="4" fill="#FFD54F" />
      </Svg>
      <LamparaColgante k={k} x={330} y={100} largo={44} />
      <LamparaColgante k={k} x={760} y={100} largo={44} color="#E57373" />
      <Reloj k={k} x={560} y={140} r={26} />
    </>
  );
}

const estilos = StyleSheet.create({
  casilleros: { flexDirection: "row", flexWrap: "wrap", gap: 4, maxWidth: 230 },
  casillero: { width: 40, height: 40, borderRadius: 10, borderWidth: 2, borderStyle: "dashed", borderColor: "#BCAAA4", alignItems: "center", justifyContent: "center" },
  casilleroLleno: { borderStyle: "solid", borderColor: "#66BB6A", backgroundColor: "#E8F5E9" },
  casilleroSobra: { borderStyle: "solid", borderColor: "#FFB74D", backgroundColor: "#FFF3E0" },
  pedido: { backgroundColor: "#fff", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 3, borderColor: "#3B2F5C" },
  pedidoTexto: { fontWeight: "900", color: "#3B2F5C" },
  canasta: { position: "absolute", bottom: 12, left: 12, backgroundColor: "#FFF8E1", borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 3, borderColor: "#A1887F", maxWidth: 520 },
  canastaIcono: { fontSize: 36 },
  canastaTexto: { fontSize: 26, fontWeight: "800", color: "#3B2F5C" },
  repetir: { position: "absolute", bottom: 12, right: 12, backgroundColor: "#fff", borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10 },
  repetirTexto: { fontSize: 24, fontWeight: "900", color: "#3B2F5C" },
});
