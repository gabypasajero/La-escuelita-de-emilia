import { PRODUCTOS, type Producto } from "../contenido/tienda";
import type { Aleatorio, Nivel } from "../tipos";
import { elegir, mezclar } from "./azar";
import { MAXIMO_CONTEO } from "./dificultad";

export interface PedidoTiendita {
  enunciado: string;
  producto: Producto;
  cantidad: number;
  /** Productos en el estante: el pedido más distractores desde el nivel 2. */
  estante: Producto[];
}

/**
 * La Tiendita de Emilia (juego de roles): el cliente pide N unidades de un
 * producto y el niño las pone en la canasta. Nivel 1 solo muestra el producto
 * pedido; desde el nivel 2 hay que distinguirlo de otros.
 */
export function pedidoTiendita(nivel: Nivel, azar: Aleatorio = Math.random): PedidoTiendita {
  const producto = elegir(PRODUCTOS, azar);
  const cantidad = 1 + Math.floor(azar() * MAXIMO_CONTEO[nivel]);
  const distractores = nivel === 1 ? 0 : nivel === 2 ? 1 : 2;
  const estante = mezclar(
    [producto, ...mezclar(PRODUCTOS.filter((p) => p !== producto), azar).slice(0, distractores)],
    azar,
  );
  const nombre = cantidad === 1 ? `${producto.articulo} ${producto.nombre}` : `${cantidad} ${producto.plural}`;
  return { enunciado: `¡Hola! Quiero ${nombre}, por favor`, producto, cantidad, estante };
}

/** La canasta es correcta si tiene exactamente la cantidad pedida y nada más. */
export function canastaCorrecta(pedido: PedidoTiendita, canasta: readonly Producto[]): boolean {
  return canasta.length === pedido.cantidad && canasta.every((p) => p.id === pedido.producto.id);
}
