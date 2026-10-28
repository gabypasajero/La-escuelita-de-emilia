import { rondaColor, rondaForma, rondaMasMenos, rondaPatron, rondaVerdura, type Forma } from "@escuelita/core";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Polygon, Rect } from "react-native-svg";
import { Pantalla } from "../../components/Pantalla";
import { Pregunta } from "../../components/Pregunta";

/** Juegos de descubrir de la Escuelita: colores, formas, más y menos, patrones y verduras. */
export default function Descubrir() {
  const { juego } = useLocalSearchParams<{ juego: string }>();
  switch (juego) {
    case "colores":
      return (
        <Pantalla color="#E1F5FE">
          <Pregunta
            generar={(n) => rondaColor(n)}
            opcion={(c) => <View style={[estilos.mancha, { backgroundColor: c.hex }]} />}
            alAcertar={(r) => `¡Sí! Ese es el ${r.correcta.nombre}.`}
          />
        </Pantalla>
      );
    case "formas":
      return (
        <Pantalla color="#F3E5F5">
          <Pregunta
            generar={(n) => rondaForma(n)}
            opcion={(f) => <FormaDibujo forma={f} />}
            alAcertar={(r) => `¡Sí! ${r.correcta.articulo === "la" ? "La" : "El"} ${r.correcta.nombre}.`}
          />
        </Pantalla>
      );
    case "mas-menos":
      return (
        <Pantalla color="#E8F5E9">
          <Pregunta
            generar={(n) => rondaMasMenos(n)}
            opcion={(cantidad) => <Grupo n={cantidad} />}
            alAcertar={(r) => (r.pregunta === "mas" ? `¡Sí! Aquí hay más: ${r.correcta}.` : `¡Sí! Aquí hay menos: ${r.correcta}.`)}
          />
        </Pantalla>
      );
    case "patrones":
      return (
        <Pantalla color="#FFFDE7">
          <Pregunta
            generar={(n) => rondaPatron(n)}
            estimulo={(r) => (
              <View style={estilos.secuencia}>
                {r.secuencia.map((f, i) => <Text key={i} style={estilos.ficha}>{f}</Text>)}
                <Text style={[estilos.ficha, estilos.hueco]}>❔</Text>
              </View>
            )}
            opcion={(f) => <Text style={estilos.ficha}>{f}</Text>}
            alAcertar={() => "¡Sí! Descubriste el patrón."}
          />
        </Pantalla>
      );
    default:
      return (
        <Pantalla color="#DCEDC8">
          <Pregunta
            generar={(n) => rondaVerdura(n)}
            opcion={(v) => <Text style={estilos.verdura}>{v.emoji}</Text>}
            alAcertar={(r) => `¡Sí! ${r.correcta.dato}`}
          />
        </Pantalla>
      );
  }
}

function Grupo({ n }: { n: number }) {
  return <View style={estilos.grupo}>{Array.from({ length: n }, (_, k) => <Text key={k} style={estilos.objeto}>🍎</Text>)}</View>;
}

const COLOR_FORMA = { circulo: "#E53935", cuadrado: "#1E88E5", triangulo: "#43A047", estrella: "#FDD835", corazon: "#F06292", rectangulo: "#FB8C00" };

function FormaDibujo({ forma }: { forma: Forma }) {
  const c = COLOR_FORMA[forma.id];
  return (
    <Svg width={90} height={90} viewBox="0 0 100 100">
      {forma.id === "circulo" && <Circle cx="50" cy="50" r="40" fill={c} />}
      {forma.id === "cuadrado" && <Rect x="12" y="12" width="76" height="76" fill={c} />}
      {forma.id === "rectangulo" && <Rect x="5" y="28" width="90" height="44" fill={c} />}
      {forma.id === "triangulo" && <Polygon points="50,8 92,88 8,88" fill={c} />}
      {forma.id === "estrella" && <Polygon points="50,5 61,38 96,38 68,59 79,93 50,72 21,93 32,59 4,38 39,38" fill={c} />}
      {forma.id === "corazon" && <Path d="M50 88 L14 52 A20 20 0 0 1 50 22 A20 20 0 0 1 86 52 Z" fill={c} />}
    </Svg>
  );
}

const estilos = StyleSheet.create({
  mancha: { width: 90, height: 90, borderRadius: 45 },
  grupo: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", maxWidth: 170, padding: 4 },
  objeto: { fontSize: 34 },
  secuencia: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, backgroundColor: "#fff", borderRadius: 24, padding: 12 },
  ficha: { fontSize: 52 },
  hueco: { opacity: 0.6 },
  verdura: { fontSize: 72 },
});
