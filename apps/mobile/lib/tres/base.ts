import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Base del mundo 3D de la Escuelita (solo web, con three.js).
 *
 * Estilo "casa de juguetes": todo redondeado, colores pastel, materiales
 * suaves con un poco de brillo y sombras claras. Aquí viven las piezas con
 * que se arma todo lo demás: materiales y geometrías compartidas, figuras
 * básicas (esfera, caja redondeada, cápsula…), la fusión de mallas (para
 * que una casa o un mueble completo se dibuje de una sola vez), texturas
 * pintadas en un lienzo, letreros y utilidades de animación.
 *
 * Unidades: 1 unidad ≈ medio niño (un niño mide 2, un adulto 2,7).
 * El frente de las cosas mira hacia +Z (hacia la cámara).
 */

export type V3 = [number, number, number];

// ---------- Materiales ----------

export interface OpMat {
  /** Rugosidad: 1 = mate, 0 = espejo. Por defecto 0,6 (plástico suave de juguete). */
  rug?: number;
  metal?: number;
  /** Color que brilla con luz propia (ventanas encendidas, pantallas). */
  emis?: string;
  emisI?: number;
  opacidad?: number;
  doble?: boolean;
}

const MATS = new Map<string, THREE.MeshStandardMaterial>();

/** Material compartido por color y opciones (no crear uno por pieza). */
export function mat(color: string, o: OpMat = {}): THREE.MeshStandardMaterial {
  const clave = `${color}|${o.rug ?? 0.6}|${o.metal ?? 0}|${o.emis ?? ""}|${o.emisI ?? 0}|${o.opacidad ?? 1}|${o.doble ? 1 : 0}`;
  let m = MATS.get(clave);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: o.rug ?? 0.6,
      metalness: o.metal ?? 0,
      emissive: o.emis ?? "#000000",
      emissiveIntensity: o.emis ? o.emisI ?? 1 : 0,
      transparent: (o.opacidad ?? 1) < 1,
      opacity: o.opacidad ?? 1,
      side: o.doble ? THREE.DoubleSide : THREE.FrontSide,
    });
    MATS.set(clave, m);
  }
  return m;
}

const MATS_FUSION = new Map<string, THREE.MeshStandardMaterial>();
/** Material para mallas fusionadas: el color viene en cada vértice. */
function matFusion(rug: number, metal: number) {
  const clave = `${rug}|${metal}`;
  let m = MATS_FUSION.get(clave);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: rug, metalness: metal });
    MATS_FUSION.set(clave, m);
  }
  return m;
}

// ---------- Geometrías compartidas ----------

const GEOS = new Map<string, THREE.BufferGeometry>();
/** Geometría compartida por clave (se crea una sola vez). */
export function geo<T extends THREE.BufferGeometry>(clave: string, crear: () => T): T {
  let g = GEOS.get(clave) as T | undefined;
  if (!g) {
    g = crear();
    GEOS.set(clave, g);
  }
  return g;
}
const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** Malla con una geometría cualquiera (con sombras activadas). */
export function pieza(g: THREE.BufferGeometry, color: string | THREE.Material, pos: V3 = [0, 0, 0]): THREE.Mesh {
  const m = new THREE.Mesh(g, typeof color === "string" ? mat(color) : color);
  m.position.set(pos[0], pos[1], pos[2]);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

const DETALLE: Array<[number, number]> = [[10, 8], [16, 12], [24, 18], [32, 24]];

/** Esfera (o elipsoide con `esc`). `det`: 0 chica, 1 normal, 2 grande y lisa. */
export function esfera(color: string | THREE.Material, r: number, pos: V3 = [0, 0, 0], esc: V3 = [1, 1, 1], det = 1): THREE.Mesh {
  const [a, b] = DETALLE[det]!;
  const m = pieza(geo(`esf${det}`, () => new THREE.SphereGeometry(1, a, b)), color, pos);
  m.scale.set(r * esc[0], r * esc[1], r * esc[2]);
  return m;
}

/** Media esfera (cúpula hacia arriba), para gorros, sombreros y copas. */
export function cupula(color: string | THREE.Material, r: number, pos: V3 = [0, 0, 0], esc: V3 = [1, 1, 1], abertura = Math.PI / 2): THREE.Mesh {
  const m = pieza(geo(`cup${r3(abertura)}`, () => new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, abertura)), color, pos);
  m.scale.set(r * esc[0], r * esc[1], r * esc[2]);
  return m;
}

/** Caja de cantos redondeados (como un bloque de juguete). */
export function caja(color: string | THREE.Material, w: number, h: number, d: number, pos: V3 = [0, 0, 0], radio?: number): THREE.Mesh {
  const rr = r3(Math.min(radio ?? Math.min(w, h, d) * 0.16, Math.min(w, h, d) / 2 - 0.001));
  const g = rr <= 0.005
    ? geo(`caja${r3(w)}|${r3(h)}|${r3(d)}`, () => new THREE.BoxGeometry(w, h, d))
    : geo(`cajaR${r3(w)}|${r3(h)}|${r3(d)}|${rr}`, () => new RoundedBoxGeometry(w, h, d, 3, rr));
  return pieza(g, color, pos);
}

/** Cilindro o tronco de cono vertical (radio arriba, radio abajo, alto). */
export function cilindro(color: string | THREE.Material, rArriba: number, rAbajo: number, h: number, pos: V3 = [0, 0, 0], seg = 20): THREE.Mesh {
  return pieza(geo(`cil${r3(rArriba)}|${r3(rAbajo)}|${r3(h)}|${seg}`, () => new THREE.CylinderGeometry(rArriba, rAbajo, h, seg)), color, pos);
}

export function cono(color: string | THREE.Material, r: number, h: number, pos: V3 = [0, 0, 0], seg = 20): THREE.Mesh {
  return pieza(geo(`cono${r3(r)}|${r3(h)}|${seg}`, () => new THREE.ConeGeometry(r, h, seg)), color, pos);
}

/** Cápsula vertical: `largo` es el tramo recto (el alto total es largo + 2·r). */
export function capsula(color: string | THREE.Material, r: number, largo: number, pos: V3 = [0, 0, 0]): THREE.Mesh {
  return pieza(geo(`cap${r3(r)}|${r3(largo)}`, () => new THREE.CapsuleGeometry(r, largo, 6, 14)), color, pos);
}

/** Anillo (toro) acostado en el plano XZ. `arco` < 2π para medios anillos. */
export function toro(color: string | THREE.Material, radio: number, grosor: number, pos: V3 = [0, 0, 0], arco = Math.PI * 2): THREE.Mesh {
  const m = pieza(geo(`toro${r3(radio)}|${r3(grosor)}|${r3(arco)}`, () => new THREE.TorusGeometry(radio, grosor, 10, 28, arco)), color, pos);
  m.rotation.x = Math.PI / 2;
  return m;
}

/** Disco plano mirando hacia arriba (charcos, alfombras, sombras). */
export function disco(color: string | THREE.Material, r: number, pos: V3 = [0, 0, 0], esc: [number, number] = [1, 1]): THREE.Mesh {
  const m = pieza(geo("disco", () => new THREE.CircleGeometry(1, 36)), color, pos);
  m.rotation.x = -Math.PI / 2;
  m.scale.set(r * esc[0], r * esc[1], 1);
  m.castShadow = false;
  return m;
}

/** Plano vertical mirando a +Z (cuadros, tarjetas, vidrios). */
export function plano(color: string | THREE.Material, w: number, h: number, pos: V3 = [0, 0, 0]): THREE.Mesh {
  const m = pieza(geo("plano", () => new THREE.PlaneGeometry(1, 1)), color, pos);
  m.scale.set(w, h, 1);
  m.castShadow = false;
  return m;
}

/** Prisma con una silueta (para techos a dos aguas, estrellas, corazones). La forma va en XY y se estira en Z. */
export function prisma(color: string | THREE.Material, puntos: Array<[number, number]>, fondo: number, pos: V3 = [0, 0, 0], bisel = 0.04): THREE.Mesh {
  const clave = `pri${puntos.map((p) => `${r3(p[0])},${r3(p[1])}`).join(";")}|${r3(fondo)}|${r3(bisel)}`;
  const g = geo(clave, () => {
    const s = new THREE.Shape(puntos.map((p) => new THREE.Vector2(p[0], p[1])));
    const e = new THREE.ExtrudeGeometry(s, { depth: fondo, bevelEnabled: bisel > 0, bevelSize: bisel, bevelThickness: bisel, bevelSegments: 2, curveSegments: 8 });
    e.translate(0, 0, -fondo / 2);
    return e;
  });
  return pieza(g, color, pos);
}

/** Puntos de una estrella de 5 puntas (para `prisma`). */
export function puntosEstrella(r: number, interior = 0.45): Array<[number, number]> {
  return Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i + Math.PI / 2, rr = i % 2 ? r * interior : r;
    return [Math.cos(a) * rr, Math.sin(a) * rr] as [number, number];
  });
}

/** Gira una pieza y la devuelve (para encadenar). */
export function girar<T extends THREE.Object3D>(o: T, x = 0, y = 0, z = 0): T {
  o.rotation.set(x, y, z);
  return o;
}

/** Grupo con hijos (y posición opcional). */
export function grupo(hijos: THREE.Object3D[] = [], pos: V3 = [0, 0, 0]): THREE.Group {
  const g = new THREE.Group();
  g.position.set(pos[0], pos[1], pos[2]);
  if (hijos.length) g.add(...hijos);
  return g;
}

/** Articulación: grupo que gira desde su punto (la fusión no lo atraviesa). */
export function pivote(pos: V3 = [0, 0, 0], hijos: THREE.Object3D[] = []): THREE.Group {
  const g = grupo(hijos, pos);
  g.userData.pivote = true;
  return g;
}

/** Marca una pieza para que la fusión no la toque (se anima o cambia sola). */
export function aparte<T extends THREE.Object3D>(o: T): T {
  o.userData.aparte = true;
  return o;
}

// ---------- Fusión de mallas ----------

const _m = new THREE.Matrix4();
const _c = new THREE.Color();

function fusionable(m: THREE.Mesh) {
  const mt = m.material as THREE.MeshStandardMaterial;
  return !Array.isArray(m.material) && mt.isMeshStandardMaterial && !mt.vertexColors && !mt.map && !mt.transparent
    && mt.emissiveIntensity === 0 && mt.side === THREE.FrontSide && !(m as THREE.InstancedMesh).isInstancedMesh
    && !!m.geometry.getAttribute("normal");
}

/**
 * Junta todas las mallas simples de un objeto en una sola (con el color en
 * los vértices), para dibujar una casa, un mueble o un hueso completo de una
 * vez. No atraviesa articulaciones (`pivote`) ni piezas marcadas `aparte`;
 * lo que no se puede fusionar (texturas, vidrios, luces) queda como está.
 * `ao`: oscurece un poco la parte de abajo, para que la pieza "pese".
 */
export function fusionar<T extends THREE.Object3D>(raiz: T, o: { sombra?: boolean; recibe?: boolean; ao?: number } = {}): T {
  raiz.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(raiz.matrixWorld).invert();
  const cubos = new Map<string, { rug: number; metal: number; partes: Array<{ g: THREE.BufferGeometry; color: THREE.Color }>; sombra: boolean; recibe: boolean }>();
  const usadas: THREE.Mesh[] = [];
  const recorrer = (obj: THREE.Object3D) => {
    for (const h of obj.children) {
      if (h.userData.pivote || h.userData.aparte) continue;
      const mm = h as THREE.Mesh;
      if (mm.isMesh && fusionable(mm)) {
        const mt = mm.material as THREE.MeshStandardMaterial;
        _m.multiplyMatrices(inv, mm.matrixWorld);
        let g = mm.geometry.index ? mm.geometry.toNonIndexed() : mm.geometry.clone();
        g.applyMatrix4(_m);
        if (_m.determinant() < 0) g = invertirCaras(g);
        const rug = Math.round(mt.roughness * 10) / 10, metal = Math.round(mt.metalness * 10) / 10;
        const clave = `${rug}|${metal}`;
        let cubo = cubos.get(clave);
        if (!cubo) cubos.set(clave, (cubo = { rug, metal, partes: [], sombra: false, recibe: false }));
        cubo.partes.push({ g, color: mt.color });
        cubo.sombra ||= mm.castShadow;
        cubo.recibe ||= mm.receiveShadow;
        usadas.push(mm);
      }
      recorrer(h);
    }
  };
  recorrer(raiz);
  for (const mm of usadas) {
    // Si a la pieza le cuelga algo que no se fusionó, se sube al padre para no perderlo.
    for (const h of [...mm.children]) if (!usadas.includes(h as THREE.Mesh)) mm.parent!.attach(h);
    mm.removeFromParent();
  }
  for (const cubo of cubos.values()) {
    const total = cubo.partes.reduce((n, p) => n + p.g.getAttribute("position").count, 0);
    const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3);
    let k = 0;
    let yMin = Infinity, yMax = -Infinity;
    for (const { g, color } of cubo.partes) {
      const p = g.getAttribute("position") as THREE.BufferAttribute, n = g.getAttribute("normal") as THREE.BufferAttribute;
      pos.set(p.array as Float32Array, k * 3);
      nor.set(n.array as Float32Array, k * 3);
      for (let i = 0; i < p.count; i++) {
        col[(k + i) * 3] = color.r;
        col[(k + i) * 3 + 1] = color.g;
        col[(k + i) * 3 + 2] = color.b;
        const y = p.getY(i);
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
      }
      k += p.count;
      g.dispose();
    }
    if (o.ao && yMax > yMin) {
      const alto = (yMax - yMin) * 0.4;
      for (let i = 0; i < total; i++) {
        const t = Math.min(1, (pos[i * 3 + 1]! - yMin) / alto);
        const f = 1 - o.ao * (1 - t * t * (3 - 2 * t));
        col[i * 3] = col[i * 3]! * f;
        col[i * 3 + 1] = col[i * 3 + 1]! * f;
        col[i * 3 + 2] = col[i * 3 + 2]! * f;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    const m = new THREE.Mesh(g, matFusion(cubo.rug, cubo.metal));
    m.castShadow = o.sombra ?? cubo.sombra;
    m.receiveShadow = o.recibe ?? cubo.recibe;
    m.userData.fusion = true;
    raiz.add(m);
  }
  return raiz;
}

function invertirCaras(g: THREE.BufferGeometry) {
  for (const nombre of ["position", "normal"]) {
    const a = g.getAttribute(nombre) as THREE.BufferAttribute;
    const v = a.array as Float32Array;
    for (let i = 0; i < v.length; i += 9) {
      for (let j = 0; j < 3; j++) {
        const t = v[i + 3 + j]!;
        v[i + 3 + j] = v[i + 6 + j]!;
        v[i + 6 + j] = t;
      }
    }
  }
  return g;
}

/** Fusiona un esqueleto: cada articulación junta sus propias piezas (y sigue con las de adentro). */
export function fusionarEsqueleto<T extends THREE.Object3D>(raiz: T): T {
  fusionar(raiz);
  const bajar = (o: THREE.Object3D) => {
    for (const h of o.children) {
      if (h.userData.pivote) fusionarEsqueleto(h);
      else if (!h.userData.aparte) bajar(h);
    }
  };
  bajar(raiz);
  return raiz;
}

/** La malla fusionada de un objeto (para cambiarle el material, por ejemplo al transparentar una casa). */
export function mallasFusionadas(o: THREE.Object3D): THREE.Mesh[] {
  return o.children.filter((h) => h.userData.fusion) as THREE.Mesh[];
}

// ---------- Texturas pintadas ----------

/** Textura dibujada en un lienzo 2D (pisos, papeles murales, caras, tarjetas). */
export function lienzo(w: number, h: number, pintar: (g: CanvasRenderingContext2D, w: number, h: number) => void, repetir = false): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  pintar(c.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repetir) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Material con textura (por defecto mate y sin transparencia). */
export function matTextura(t: THREE.Texture, o: { rug?: number; transparente?: boolean; emis?: string; emisI?: number; doble?: boolean; sinLuz?: boolean } = {}): THREE.Material {
  if (o.sinLuz) return new THREE.MeshBasicMaterial({ map: t, transparent: !!o.transparente, side: o.doble ? THREE.DoubleSide : THREE.FrontSide });
  return new THREE.MeshStandardMaterial({
    map: t, roughness: o.rug ?? 0.75, transparent: !!o.transparente, depthWrite: !o.transparente,
    emissive: o.emis ?? "#000000", emissiveIntensity: o.emis ? o.emisI ?? 1 : 0, emissiveMap: o.emis ? t : null,
    side: o.doble ? THREE.DoubleSide : THREE.FrontSide,
  });
}

/** Números fijos "al azar" (para que el pasto y las flores salgan siempre igual). */
export function azar(semilla: number) {
  const x = Math.sin(semilla * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Rectángulo redondeado en un lienzo. */
export function rectRedondo(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** Letrero que siempre mira a la cámara (nombre de un lugar, de un personaje o de un juego). */
export function letrero(texto: string, o: { color?: string; fondo?: string; alto?: number; borde?: string } = {}): THREE.Sprite {
  const fuente = 64, margen = 34;
  const medir = document.createElement("canvas").getContext("2d")!;
  medir.font = `900 ${fuente}px system-ui, "Segoe UI", Roboto, sans-serif`;
  const ancho = Math.ceil(medir.measureText(texto).width) + margen * 2;
  const t = lienzo(ancho, 112, (g, w, h) => {
    rectRedondo(g, 4, 4, w - 8, h - 8, 44);
    g.fillStyle = o.fondo ?? "#8D6E63";
    g.fill();
    g.lineWidth = 7;
    g.strokeStyle = o.borde ?? "#ffffff";
    g.stroke();
    g.fillStyle = o.color ?? "#ffffff";
    g.font = `900 ${fuente}px system-ui, "Segoe UI", Roboto, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(texto, w / 2, h / 2 + 4);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  const alto = o.alto ?? 0.55;
  s.scale.set((alto * ancho) / 112, alto, 1);
  s.renderOrder = 20;
  s.userData.letrero = true;
  return s;
}

// ---------- Animación ----------

/** Acerca un valor a su objetivo con suavidad (independiente de los cuadros por segundo). */
export function suave(actual: number, objetivo: number, dt: number, rapidez = 8) {
  return actual + (objetivo - actual) * (1 - Math.exp(-rapidez * dt));
}

/** Igual que `suave`, pero para ángulos (gira por el lado más corto). */
export function suaveAngulo(actual: number, objetivo: number, dt: number, rapidez = 10) {
  let d = (objetivo - actual) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return actual + d * (1 - Math.exp(-rapidez * dt));
}

export const entre = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/** Rebote elástico de 0 a 1 (para que las cosas aparezcan "con resorte"). */
export function resorte(t: number) {
  const x = entre(t, 0, 1);
  return 1 - Math.cos(x * Math.PI * 4.5) * Math.exp(-x * 6);
}
export const GRADOS = Math.PI / 180;

/** Libera la memoria de todo lo creado (al salir del mundo 3D). */
export function liberarTodo(escena: THREE.Object3D) {
  escena.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry && m.userData.fusion) m.geometry.dispose();
    const mt = (m as unknown as { material?: THREE.Material | THREE.Material[] }).material;
    for (const x of Array.isArray(mt) ? mt : mt ? [mt] : []) {
      const conMapa = x as THREE.MeshStandardMaterial;
      conMapa.map?.dispose();
      x.dispose();
    }
  });
  GEOS.forEach((g) => g.dispose());
  GEOS.clear();
  MATS.forEach((m) => m.dispose());
  MATS.clear();
  MATS_FUSION.forEach((m) => m.dispose());
  MATS_FUSION.clear();
}
