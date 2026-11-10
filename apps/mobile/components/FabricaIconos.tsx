import { useEffect, useState } from "react";
import { View } from "react-native";
import { usarProveedorIconos } from "../lib/tres/iconos3d";
import { Icono } from "./Iconos";

type Pedido = { n: number; e: string; listo: (img: HTMLImageElement | null) => void };

/**
 * Presta los dibujos de la app al mundo 3D: dibuja cada ícono escondido,
 * lo convierte en imagen y se lo entrega al escenario para sus tarjetas.
 */
export function FabricaIconos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    let n = 0;
    usarProveedorIconos((e) => new Promise((listo) => setPedidos((p) => [...p, { n: n++, e, listo }])));
    return () => usarProveedorIconos(null);
  }, []);

  useEffect(() => {
    if (!pedidos.length) return;
    const id = requestAnimationFrame(() => {
      for (const p of pedidos) {
        // Si hay varios (la sombra y el animal), vale el dibujo más completo.
        const svg = Array.from(document.getElementById(`ico3d-${p.n}`)?.querySelectorAll("svg") ?? []).sort((a, b) => b.querySelectorAll("*").length - a.querySelectorAll("*").length)[0];
        if (!svg) { p.listo(null); continue; }
        const copia = svg.cloneNode(true) as SVGSVGElement;
        copia.setAttribute("width", "256");
        copia.setAttribute("height", "256");
        const img = new Image();
        img.onload = () => p.listo(img);
        img.onerror = () => p.listo(null);
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(copia));
      }
      setPedidos((v) => v.filter((x) => !pedidos.includes(x)));
    });
    return () => cancelAnimationFrame(id);
  }, [pedidos]);

  return (
    <View style={{ position: "absolute", left: -9999, top: 0, opacity: 0 }} pointerEvents="none">
      {pedidos.map((p) => (
        <View key={p.n} nativeID={`ico3d-${p.n}`}><Icono e={p.e} tam={128} sinSombra /></View>
      ))}
    </View>
  );
}
