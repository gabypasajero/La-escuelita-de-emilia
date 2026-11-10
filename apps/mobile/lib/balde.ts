/**
 * El balde de pintura (solo web): toma una foto de la hoja, busca la zona
 * cerrada que rodea al punto tocado y devuelve esa zona pintada como imagen
 * transparente, lista para ponerla encima del dibujo.
 */
/** Foto de la hoja (el SVG con todo lo dibujado) sobre fondo blanco. */
export async function fotoDeHoja(svg: SVGSVGElement, w: number, h: number): Promise<HTMLCanvasElement | null> {
  const copia = svg.cloneNode(true) as SVGSVGElement;
  copia.setAttribute("width", String(w));
  copia.setAttribute("height", String(h));
  copia.setAttribute("viewBox", `0 0 ${w} ${h}`);
  const img = new Image();
  const lista = new Promise<boolean>((r) => { img.onload = () => r(true); img.onerror = () => r(false); });
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(copia));
  if (!(await lista)) return null;
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(w);
  lienzo.height = Math.round(h);
  const g = lienzo.getContext("2d", { willReadFrequently: true });
  if (!g) return null;
  g.fillStyle = "#FFFFFF";
  g.fillRect(0, 0, lienzo.width, lienzo.height);
  g.drawImage(img, 0, 0, lienzo.width, lienzo.height);
  return lienzo;
}

export async function rellenar(svg: SVGSVGElement, w: number, h: number, x: number, y: number, color: string): Promise<string | null> {
  const lienzo = await fotoDeHoja(svg, w, h);
  if (!lienzo) return null;
  const W = lienzo.width, H = lienzo.height;
  const g = lienzo.getContext("2d", { willReadFrequently: true })!;
  let px: Uint8ClampedArray;
  try { px = g.getImageData(0, 0, W, H).data; } catch { return null; }

  const x0 = Math.max(0, Math.min(W - 1, Math.round(x))), y0 = Math.max(0, Math.min(H - 1, Math.round(y)));
  const i0 = (y0 * W + x0) * 4, r0 = px[i0]!, g0 = px[i0 + 1]!, b0 = px[i0 + 2]!;
  const parecido = (p: number) => Math.abs(px[p * 4]! - r0) + Math.abs(px[p * 4 + 1]! - g0) + Math.abs(px[p * 4 + 2]! - b0) < 96;

  // Se llena por filas (rápido incluso en hojas grandes).
  const zona = new Uint8Array(W * H);
  const pila = [y0 * W + x0];
  while (pila.length) {
    let p = pila.pop()!;
    if (zona[p] || !parecido(p)) continue;
    const fila = Math.floor(p / W) * W;
    while (p > fila && !zona[p - 1] && parecido(p - 1)) p--;
    for (; p < fila + W && !zona[p] && parecido(p); p++) {
      zona[p] = 1;
      if (p >= W) pila.push(p - W);
      if (p < W * (H - 1)) pila.push(p + W);
    }
  }

  // Se agranda un pixel para que no quede un borde claro junto a las líneas.
  let borde = zona;
  for (let v = 0; v < 1; v++) {
    const mas = new Uint8Array(borde);
    for (let p = 0; p < W * H; p++) {
      if (borde[p]) continue;
      const cx = p % W;
      if ((cx > 0 && borde[p - 1]) || (cx < W - 1 && borde[p + 1]) || (p >= W && borde[p - W]) || (p < W * (H - 1) && borde[p + W])) mas[p] = 1;
    }
    borde = mas;
  }

  const n = parseInt(color.slice(1), 16), cr = (n >> 16) & 255, cg = (n >> 8) & 255, cb = n & 255;
  const salida = g.createImageData(W, H);
  for (let p = 0; p < W * H; p++) {
    if (!borde[p]) continue;
    salida.data[p * 4] = cr;
    salida.data[p * 4 + 1] = cg;
    salida.data[p * 4 + 2] = cb;
    salida.data[p * 4 + 3] = 255;
  }
  g.clearRect(0, 0, W, H);
  g.putImageData(salida, 0, 0);
  return lienzo.toDataURL("image/png");
}
