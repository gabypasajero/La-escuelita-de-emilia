import { describe, expect, it } from "vitest";
import { canastaCorrecta, pedidoTiendita } from "./index";

/** Devuelve los valores dados en orden y luego 0. */
function secuencia(...valores: number[]) {
  return () => valores.shift() ?? 0;
}

describe("La Tiendita", () => {
  it("el producto pedido siempre está en el estante y no se repite", () => {
    for (let i = 0; i < 100; i++) {
      for (const nivel of [1, 2, 3] as const) {
        const pedido = pedidoTiendita(nivel);
        expect(pedido.estante).toContain(pedido.producto);
        expect(pedido.estante).toHaveLength(nivel);
        expect(new Set(pedido.estante).size).toBe(pedido.estante.length);
      }
    }
  });

  it("usa singular y plural en la consigna", () => {
    expect(pedidoTiendita(1, () => 0).enunciado).toBe("¡Hola! Quiero una manzana, por favor");
    expect(pedidoTiendita(1, secuencia(0.4, 0)).enunciado).toBe("¡Hola! Quiero un pan, por favor");
    expect(pedidoTiendita(3, () => 0.5).enunciado).toBe("¡Hola! Quiero 6 quesos, por favor");
  });

  it("valida la canasta", () => {
    const pedido = pedidoTiendita(2, () => 0.3);
    const { producto, estante } = pedido;
    const otro = estante.find((p) => p !== producto)!;
    const exacta = Array(pedido.cantidad).fill(producto);
    expect(canastaCorrecta(pedido, exacta)).toBe(true);
    expect(canastaCorrecta(pedido, [...exacta, producto])).toBe(false);
    expect(canastaCorrecta(pedido, [...exacta.slice(1), otro])).toBe(false);
  });
});
