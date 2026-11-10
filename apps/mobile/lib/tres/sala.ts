import * as THREE from "three";
import { aparte, caja, cilindro, disco, esfera, fusionar, grupo, lienzo, matTextura, plano, rectRedondo, type V3 } from "./base";
import type { Idioma } from "../voz";
import { imagenIcono } from "./iconos3d";
import type { Constructor, Ctx, Escena, Interactivo } from "./motor";
import { crearPersona, ELENCO, type Persona } from "./personaje";
import { arbol, arbusto, cerca, cerro, flor } from "./utileria";

/**
 * Piezas para armar los interiores como una casa de juguetes abierta:
 * el cascarón (piso y paredes), las tarjetas del diario mural (cada una abre
 * su juego en una ventana flotante) y algunos muebles comunes.
 */

export interface Tarjeta {
  ruta: string; nombre: string; icono: string; color: string; frase: string;
  /** Si lleva a otro escenario 3D en vez de abrir un juego. */
  escena?: string;
  /** Idioma en que se dice la frase (los amigos hablan el suyo). */
  idioma?: Idioma;
}

const aclarar = (color: string, k: number) => "#" + new THREE.Color(color).lerp(new THREE.Color("#FFFFFF"), k).getHexString();
const oscuro = (color: string, k: number) => "#" + new THREE.Color(color).multiplyScalar(1 - k).getHexString();

/** Piso de tablas de madera (o baldosas) pintado. */
function texturaPiso(color: string, baldosa: boolean): THREE.Texture {
  return lienzo(512, 512, (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    if (baldosa) {
      g.fillStyle = aclarar(color, 0.28);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) g.fillRect(i * 128, j * 128, 128, 128);
      return;
    }
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? aclarar(color, 0.1) : oscuro(color, 0.05);
      g.fillRect(0, i * 64, w, 64);
      g.fillStyle = oscuro(color, 0.22);
      g.fillRect(0, i * 64, w, 3);
      g.fillRect(((i * 173) % 400) + 40, i * 64, 3, 64);
    }
  }, true);
}

export interface OpSala { ancho: number; fondo: number; alto: number; pared: string; piso: string; zocalo?: string; baldosa?: boolean; franja?: string }

/** Piso, pared del fondo y paredes laterales. La sala va de x=-ancho/2 a ancho/2 y de z=0 al frente. */
export function cascaron(o: OpSala): THREE.Group {
  const g = grupo();
  const est = grupo();
  const { ancho: W, fondo: D, alto: H } = o;
  est.add(caja(oscuro(o.piso, 0.25), W + 1.2, 0.7, D + 1.0, [0, -0.36, D / 2 - 0.1], 0.2));
  est.add(caja(o.pared, W + 1.2, H, 0.6, [0, H / 2, -0.3], 0.16));
  for (const l of [-1, 1]) est.add(caja(oscuro(o.pared, 0.08), 0.6, H, D * 0.72, [l * (W / 2 + 0.3), H / 2, D * 0.36 - 0.3], 0.16));
  const z = o.zocalo ?? "#FFFFFF";
  est.add(caja(z, W, 0.36, 0.14, [0, 0.18, 0.06], 0.05));
  for (const l of [-1, 1]) est.add(caja(z, 0.14, 0.36, D * 0.72 - 0.3, [l * (W / 2 - 0.06), 0.18, D * 0.36], 0.05));
  est.add(caja(z, W + 1.3, 0.26, 0.72, [0, H + 0.05, -0.3], 0.08));
  if (o.franja) est.add(caja(o.franja, W, 0.5, 0.05, [0, H - 0.75, 0.02], 0.02));
  g.add(fusionar(est, { ao: 0.12 }));
  const t = texturaPiso(o.piso, !!o.baldosa);
  t.repeat.set(W / 5, D / 5);
  const p = plano(matTextura(t, { rug: 0.7 }), W, D, [0, 0.005, D / 2]);
  p.rotation.x = -Math.PI / 2;
  p.receiveShadow = true;
  g.add(p);
  return g;
}

/** Tarjeta del diario mural: el dibujo del juego y su nombre, pegada a la pared. */
export function tarjeta(t: Tarjeta, w: number, h: number): THREE.Group {
  const g = grupo();
  const PX = 512, PY = Math.round((512 * h) / w);
  let imagen: HTMLImageElement | null = null;
  const pintar = (c: CanvasRenderingContext2D) => {
    c.clearRect(0, 0, PX, PY);
    rectRedondo(c, 0, 0, PX, PY, 46);
    c.fillStyle = t.color;
    c.fill();
    rectRedondo(c, 24, 24, PX - 48, PY - 148, 34);
    c.fillStyle = "rgba(255,255,255,0.93)";
    c.fill();
    const s = Math.min(PX - 100, PY - 190), cx = PX / 2, cy = 24 + (PY - 148) / 2;
    if (imagen) c.drawImage(imagen, cx - s / 2, cy - s / 2, s, s);
    else {
      c.font = `${s * 0.78}px system-ui, "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = "#3B2F5C";
      c.fillText(t.icono, cx, cy + s * 0.05);
    }
    let f = 74;
    do { c.font = `900 ${f}px system-ui, "Segoe UI", Roboto, sans-serif`; f -= 4; } while (c.measureText(t.nombre).width > PX - 50 && f > 30);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#FFFFFF";
    c.fillText(t.nombre, cx, PY - 60);
  };
  const tex = lienzo(PX, PY, (c) => pintar(c));
  void imagenIcono(t.icono).then((img) => {
    if (!img) return;
    imagen = img;
    pintar((tex.image as HTMLCanvasElement).getContext("2d")!);
    tex.needsUpdate = true;
  });
  g.add(caja("#FFFFFF", w + 0.12, h + 0.12, 0.09, [0, 0, 0], 0.05));
  g.add(plano(matTextura(tex, { rug: 0.6, transparente: true }), w, h, [0, 0, 0.052]));
  g.add(esfera(aclarar(t.color, 0.1), 0.085, [0, h / 2 + 0.01, 0.07], [1, 1, 0.6], 0));
  return g;
}

// ---------- Muebles comunes ----------

export function mesa(color: string, w = 2.2, d = 1.3, alto = 0.95): THREE.Group {
  const g = grupo();
  g.add(caja(color, w, 0.14, d, [0, alto, 0], 0.06));
  for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(cilindro(oscuro(color, 0.18), 0.07, 0.06, alto, [x * (w / 2 - 0.2), alto / 2, z * (d / 2 - 0.2)], 8));
  return g;
}

export function silla(color: string): THREE.Group {
  const g = grupo();
  g.add(caja(color, 0.7, 0.1, 0.66, [0, 0.58, 0], 0.04), caja(color, 0.7, 0.72, 0.1, [0, 1.0, -0.3], 0.04));
  for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(cilindro(oscuro(color, 0.2), 0.045, 0.04, 0.56, [x * 0.27, 0.28, z * 0.25], 6));
  return g;
}

/** Estante con libros o cajas de colores. */
export function estante(w = 2.4, h = 2.6, color = "#D7A86E", niveles = 3): THREE.Group {
  const g = grupo();
  g.add(caja(oscuro(color, 0.15), w, h, 0.5, [0, h / 2, 0], 0.05));
  const COL = ["#EF5350", "#42A5F5", "#66BB6A", "#FFCA28", "#AB47BC", "#FF7043", "#26C6DA"];
  for (let n = 0; n < niveles; n++) {
    const y = 0.14 + (n * (h - 0.2)) / niveles, alto = (h - 0.2) / niveles - 0.14;
    g.add(caja(aclarar(color, 0.25), w - 0.2, alto, 0.1, [0, y + alto / 2, 0.22], 0.02));
    let x = -w / 2 + 0.22;
    for (let i = 0; x < w / 2 - 0.3; i++) {
      const a = 0.13 + ((i * 7 + n * 3) % 4) * 0.035, al = alto * (0.62 + ((i * 5 + n) % 4) * 0.08);
      g.add(caja(COL[(i + n * 2) % COL.length]!, a, al, 0.34, [x + a / 2, y + al / 2, 0.3], 0.02));
      x += a + 0.03;
    }
  }
  return g;
}

export function alfombra(color: string, r: number, pos: V3, esc: [number, number] = [1, 0.62]): THREE.Group {
  const g = grupo([], pos);
  g.add(disco(oscuro(color, 0.12), r, [0, 0.012, 0], esc), disco(color, r * 0.88, [0, 0.018, 0], esc), disco(aclarar(color, 0.35), r * 0.55, [0, 0.024, 0], esc));
  return g;
}

export function planta(esc = 1): THREE.Group {
  const g = grupo();
  g.add(cilindro("#D9825B", 0.3, 0.22, 0.5, [0, 0.25, 0], 12));
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    g.add(esfera(i % 2 ? "#66BB6A" : "#43A047", 1, [Math.sin(a) * 0.24, 0.85 + (i % 3) * 0.16, Math.cos(a) * 0.24], [0.2, 0.42, 0.2], 1));
  }
  g.add(esfera("#4CAF50", 1, [0, 1.2, 0], [0.22, 0.5, 0.22], 1));
  g.scale.setScalar(esc);
  return g;
}

/** Cuadro o dibujo de niño colgado en la pared. */
export function cuadro(w: number, h: number, pintar: (g: CanvasRenderingContext2D, w: number, h: number) => void, marco = "#FFFFFF"): THREE.Group {
  const g = grupo();
  g.add(caja(marco, w + 0.14, h + 0.14, 0.07, [0, 0, 0], 0.03));
  g.add(aparte(plano(matTextura(lienzo(256, Math.round((256 * h) / w), pintar), { rug: 0.8 }), w, h, [0, 0, 0.04])));
  return g;
}

/** Ventana interior por la que se ve el cielo de la hora. */
export function ventanal(c: Ctx, w: number, h: number): THREE.Group {
  const g = grupo();
  const cielo = c.noche ? ["#1A237E", "#3949AB"] : c.momento === "tarde" ? ["#FF8A65", "#FFD180"] : c.momento === "amanecer" ? ["#F8BBD0", "#FFE0B2"] : ["#64B5F6", "#E1F5FE"];
  const t = lienzo(128, 128, (x, a, b) => {
    const gr = x.createLinearGradient(0, 0, 0, b);
    gr.addColorStop(0, cielo[0]!);
    gr.addColorStop(1, cielo[1]!);
    x.fillStyle = gr;
    x.fillRect(0, 0, a, b);
    x.fillStyle = c.noche ? "#FFFDE7" : "#FFFFFF";
    if (c.noche) { for (let i = 0; i < 9; i++) x.fillRect((i * 37) % 120, (i * 53) % 70, 2.5, 2.5); x.beginPath(); x.arc(92, 34, 13, 0, 7); x.fill(); }
    else { for (const [px, py, r] of [[30, 40, 13], [46, 36, 17], [62, 42, 12], [92, 74, 10], [104, 71, 13]] as const) { x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); } }
    x.fillStyle = c.noche ? "#1B5E20" : "#81C784";
    x.beginPath(); x.ellipse(40, 132, 70, 26, 0, 0, 7); x.ellipse(110, 134, 50, 22, 0, 0, 7); x.fill();
  });
  g.add(caja("#FFFFFF", w + 0.26, h + 0.26, 0.12, [0, 0, 0], 0.05));
  g.add(aparte(plano(matTextura(t, { sinLuz: true }), w, h, [0, 0, 0.065])));
  g.add(caja("#FFFFFF", 0.08, h, 0.05, [0, 0, 0.09], 0.01), caja("#FFFFFF", w, 0.08, 0.05, [0, 0, 0.09], 0.01));
  g.add(caja("#FFFFFF", w + 0.5, 0.12, 0.3, [0, -h / 2 - 0.16, 0.1], 0.04));
  return g;
}

// ---------- Sala con diario mural ----------

export interface DefSala extends OpSala {
  id: string;
  titulo: string;
  tarjetas: Tarjeta[];
  filas?: number;
  /** Tamaño de cada tarjeta. */
  tam?: [number, number];
  /** Altura del centro de la fila de abajo. */
  yMural?: number;
  tituloMural?: string;
  colorMural?: string;
  anfitrion?: { quien: string; x: number; z: number; saludo: string };
  salida?: string;
  /** Muebles y adornos: lo estático va a `fijo` (se fusiona), lo que se mueve directo a `raiz`. */
  decorar?: (fijo: THREE.Group, raiz: THREE.Group, c: Ctx) => { solidos?: Escena["solidos"]; interactivos?: Interactivo[]; actualizar?: (dt: number, t: number) => void } | void;
}

export function salaConMural(def: DefSala): Constructor {
  return (c) => {
    const raiz = new THREE.Group();
    raiz.add(cascaron(def));
    const { ancho: W, fondo: D } = def;
    const filas = def.filas ?? 2, [tw, th] = def.tam ?? [2.05, 1.8];
    const porFila = Math.ceil(def.tarjetas.length / filas);
    const paso = tw + 0.34, y0 = def.yMural ?? 1.85;
    const interactivos: Interactivo[] = [];
    const fijo = grupo();

    // El diario mural: un corcho con marco de madera y su título.
    const mw = porFila * paso + 0.5, mh = filas * (th + 0.34) + 0.5, my = y0 + ((filas - 1) * (th + 0.34)) / 2;
    if (def.tarjetas.length) {
      fijo.add(caja("#B98A5A", mw + 0.3, mh + 0.3, 0.1, [0, my, 0.03], 0.06));
      fijo.add(caja(def.colorMural ?? "#E8C99B", mw, mh, 0.06, [0, my, 0.08], 0.04));
    }
    const tarjetas: Array<{ g: THREE.Group; fase: number; y: number }> = [];
    def.tarjetas.forEach((t, i) => {
      const f = Math.floor(i / porFila), enFila = Math.min(porFila, def.tarjetas.length - f * porFila), k = i - f * porFila;
      const x = (k - (enFila - 1) / 2) * paso, y = y0 + (filas - 1 - f) * (th + 0.34);
      const g = tarjeta(t, tw, th);
      g.position.set(x, y, 0.16);
      g.rotation.z = (((i * 37) % 7) - 3) * 0.008;
      raiz.add(g);
      tarjetas.push({ g, fase: i * 1.7, y });
      interactivos.push({
        objeto: g,
        llegada: { x: Math.max(-W / 2 + 1, Math.min(W / 2 - 1, x)), z: 1.7 },
        mira: { x, z: 0 },
        alLlegar: () => {
          c.enfocar([x, y, 0.2], 6.5);
          void c.decirYEsperar(t.frase, anfitrion ?? undefined, t.idioma).then(() => {
            if (!c.vigente(def.id)) return;
            if (t.escena) c.irA(t.escena);
            else c.ventana(t.ruta, t.nombre);
          });
        },
      });
    });

    let anfitrion: Persona | null = null;
    if (def.anfitrion && ELENCO[def.anfitrion.quien]) {
      anfitrion = crearPersona(ELENCO[def.anfitrion.quien]!);
      anfitrion.raiz.position.set(def.anfitrion.x, 0, def.anfitrion.z);
      raiz.add(anfitrion.raiz);
    }
    const extra = def.decorar?.(fijo, raiz, c) || {};
    raiz.add(fusionar(fijo, { ao: 0.1 }));

    const a = anfitrion;
    return {
      id: def.id, titulo: def.titulo, exterior: false, raiz,
      inicio: { x: 0, z: D - 1.6 },
      limites: { x0: -W / 2 + 0.8, x1: W / 2 - 0.8, z0: 1.3, z1: D - 0.7 },
      solidos: [...(a ? [{ x0: a.raiz.position.x - 0.6, x1: a.raiz.position.x + 0.6, z0: a.raiz.position.z - 0.5, z1: a.raiz.position.z + 0.5 }] : []), ...(extra.solidos ?? [])],
      interactivos: [...interactivos, ...(extra.interactivos ?? [])],
      camara: { modo: "sala", ancho: W, alto: def.alto, fondo: D, inclina: 20 },
      fondo: [oscuro(def.pared, 0.35), oscuro(def.pared, 0.15)],
      salida: def.salida ?? "barrio",
      actualizar(dt, t) {
        for (const x of tarjetas) x.g.position.y = x.y + Math.sin(t * 1.4 + x.fase) * 0.018;
        if (a) {
          a.mirarA(c.nino.raiz.position.x, c.nino.raiz.position.z);
          a.actualizar(dt, t);
        }
        extra.actualizar?.(dt, t);
      },
      alEntrar() {
        if (a && def.anfitrion) {
          a.saludando = true;
          c.luego(2.2, () => { a.saludando = false; });
          c.decir(def.anfitrion.saludo, a);
        } else c.decir(`¡Llegamos! Toca una tarjeta para jugar.`);
      },
      alEvento(ev) {
        if (ev === "ventana-cerrada") c.enfocar(null);
      },
    };
  };
}

// ---------- Patio con carteles (lugares al aire libre) ----------

export interface DefPatio {
  id: string;
  titulo: string;
  ancho: number;
  fondo: number;
  suelo: string;
  /** Color de la zona de juego (tierra, arena, pasto claro). */
  claro?: string;
  carteles: Array<Tarjeta & { x: number; z: number }>;
  tam?: [number, number];
  anfitrion?: { quien: string; x: number; z: number; saludo: string };
  salida?: string;
  sinCerca?: boolean;
  decorar?: DefSala["decorar"];
}

/** Lugar al aire libre: pasto, cerros y árboles al fondo, y carteles de madera con las tarjetas de sus juegos. */
export function patioConCarteles(def: DefPatio): Constructor {
  return (c) => {
    const raiz = new THREE.Group();
    const { ancho: W, fondo: D } = def;
    const suelo = disco(def.suelo, 80, [0, 0, D / 2]);
    suelo.receiveShadow = true;
    raiz.add(suelo);
    if (def.claro) {
      const z = disco(def.claro, W * 0.5, [0, 0.012, D / 2 + 0.3], [1, (D / W) * 0.95]);
      z.receiveShadow = true;
      raiz.add(z);
    }
    const fijo = grupo();
    // El fondo: cerros lejanos, árboles y arbustos
    for (const [x, alto, ancho] of [[-20, 9, 17], [-6, 12, 21], [9, 10, 18], [23, 8, 15]] as const) {
      const m = cerro(alto, ancho, alto > 9, c.noche ? "#5C6F8A" : "#8FA6B5");
      m.position.set(x, -0.2, -19);
      raiz.add(m);
    }
    for (let i = 0; i < 9; i++) {
      const a = arbol(i, 1.15 + (i % 3) * 0.18);
      a.position.set(-W / 2 - 3 + i * ((W + 6) / 8), 0, -2.6 - (i % 2) * 2.2);
      raiz.add(a);
    }
    for (const l of [-1, 1]) for (let i = 0; i < 3; i++) {
      const a = i === 1 ? arbusto(1.3, "#F48FB1") : arbol(i + (l > 0 ? 1 : 0), 1.1);
      a.position.set(l * (W / 2 + 2.2 + (i % 2)), 0, 1.5 + i * (D / 3));
      raiz.add(a);
    }
    if (!def.sinCerca) {
      const v = cerca(W + 2, "#FFFFFF", 0.95);
      v.position.set(0, 0, -0.4);
      raiz.add(v);
    }
    for (let i = 0; i < 14; i++) {
      const f = flor(["#F06292", "#FFEE58", "#FFFFFF", "#BA68C8", "#FF8A65"][i % 5]!, 1.2);
      f.position.set(-W / 2 - 1.5 + ((i * 7.3) % (W + 3)), 0, i % 2 ? 0.3 + (i % 3) * 0.2 : D + 0.4 + (i % 3) * 0.5);
      fijo.add(f);
    }

    const [tw, th] = def.tam ?? [2.6, 2.25];
    const interactivos: Interactivo[] = [];
    let anfitrion: Persona | null = null;
    const solidos: Escena["solidos"] = [];
    const tarjetas: Array<{ g: THREE.Group; fase: number }> = [];
    def.carteles.forEach((t, i) => {
      const yc = 0.75 + th / 2;
      for (const l of [-1, 1]) fijo.add(cilindro("#8D6E63", 0.09, 0.1, yc + th / 2 + 0.2, [t.x + l * (tw / 2 - 0.2), (yc + th / 2 + 0.2) / 2, t.z - 0.08], 8));
      const g = tarjeta(t, tw, th);
      g.position.set(t.x, yc, t.z);
      raiz.add(g);
      tarjetas.push({ g, fase: i * 1.9 });
      solidos.push({ x0: t.x - tw / 2, x1: t.x + tw / 2, z0: t.z - 0.4, z1: t.z + 0.3 });
      interactivos.push({
        objeto: g,
        llegada: { x: t.x, z: t.z + 1.5 },
        mira: { x: t.x, z: t.z },
        alLlegar: () => {
          c.enfocar([t.x, yc, t.z], 7);
          void c.decirYEsperar(t.frase, anfitrion ?? undefined, t.idioma).then(() => {
            if (!c.vigente(def.id)) return;
            if (t.escena) c.irA(t.escena);
            else c.ventana(t.ruta, t.nombre);
          });
        },
      });
    });
    if (def.anfitrion && ELENCO[def.anfitrion.quien]) {
      anfitrion = crearPersona(ELENCO[def.anfitrion.quien]!);
      anfitrion.raiz.position.set(def.anfitrion.x, 0, def.anfitrion.z);
      raiz.add(anfitrion.raiz);
      solidos.push({ x0: def.anfitrion.x - 0.6, x1: def.anfitrion.x + 0.6, z0: def.anfitrion.z - 0.5, z1: def.anfitrion.z + 0.5 });
    }
    const extra = def.decorar?.(fijo, raiz, c) || {};
    raiz.add(fusionar(fijo, { ao: 0.1 }));
    const a = anfitrion;
    return {
      id: def.id, titulo: def.titulo, exterior: true, raiz,
      inicio: { x: 0, z: D - 1.2 },
      limites: { x0: -W / 2 + 0.6, x1: W / 2 - 0.6, z0: 0.6, z1: D },
      solidos: [...solidos, ...(extra.solidos ?? [])],
      interactivos: [...interactivos, ...(extra.interactivos ?? [])],
      camara: { modo: "sala", ancho: W, alto: 6.4, fondo: D, inclina: 22 },
      salida: def.salida ?? "barrio",
      actualizar(dt, t) {
        for (const x of tarjetas) x.g.rotation.z = Math.sin(t * 1.2 + x.fase) * 0.012;
        if (a) {
          a.mirarA(c.nino.raiz.position.x, c.nino.raiz.position.z);
          a.actualizar(dt, t);
        }
        extra.actualizar?.(dt, t);
      },
      alEntrar() {
        if (a && def.anfitrion) {
          a.saludando = true;
          c.luego(2.2, () => { a.saludando = false; });
          c.decir(def.anfitrion.saludo, a);
        } else c.decir(`¡Llegamos! Toca una tarjeta para jugar.`);
      },
      alEvento(ev) {
        if (ev === "ventana-cerrada") c.enfocar(null);
      },
    };
  };
}
