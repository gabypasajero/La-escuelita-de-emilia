/**
 * Los dibujos de la app (los mismos del mundo 2D) para usar en las tarjetas
 * y carteles del mundo 3D. La pantalla que aloja el mundo los fabrica.
 */
type Proveedor = (e: string) => Promise<HTMLImageElement | null>;

let proveedor: Proveedor | null = null;
const listos = new Map<string, Promise<HTMLImageElement | null>>();

export function usarProveedorIconos(p: Proveedor | null) {
  proveedor = p;
  if (!p) listos.clear();
}

/** La imagen de un ícono (o `null` si no tiene dibujo: se pinta el emoji). */
export function imagenIcono(e: string): Promise<HTMLImageElement | null> {
  if (!proveedor) return Promise.resolve(null);
  let p = listos.get(e);
  if (!p) listos.set(e, (p = proveedor(e)));
  return p;
}
