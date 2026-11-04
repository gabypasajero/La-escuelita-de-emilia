import * as THREE from "three";
import type { Apariencia } from "./juego";
import { ARBOLES, LUGARES, VECINOS, type Lugar } from "./lugares";

/**
 * Prueba del barrio en 3D (solo web, con three.js). Usa los mismos lugares
 * que el barrio 2D: 10 unidades de diseño = 1 unidad 3D (el barrio mide 180 × 125).
 * El niño toca el suelo para caminar o una casa para entrar; Emilia y Tito lo
 * siguen y la cámara lo acompaña desde arriba (estilo Stardew Valley).
 */
export interface OpcionesBarrio3D {
  apariencia: Apariencia;
  nombre: string;
  alEntrar: (l: Lugar) => void;
  alTocarVecino: (frase: string) => void;
  /** Cuando el niño queda frente a una puerta (o se aleja: null). */
  alCerca?: (l: Lugar | null) => void;
}

export type Direccion = "arriba" | "abajo" | "izquierda" | "derecha";

export interface Barrio3D {
  destruir: () => void;
  /** Botones de flechas en pantalla: mantener apretado para caminar. */
  flecha: (d: Direccion, apretada: boolean) => void;
  /** Entrar al lugar que está al frente. */
  entrar: () => void;
  /** Acercar (+1) o alejar (-1) la cámara. */
  zoom: (paso: number) => void;
  /** La cámara vuelve a seguir al niño. */
  centrar: () => void;
}

const A3 = (v: number) => v / 10;
const COLOR_LUGAR: Record<string, { pared: string; techo: string }> = {
  casa: { pared: "#FDD835", techo: "#E57373" },
  escuelita: { pared: "#4FC3F7", techo: "#1E88E5" },
  taller: { pared: "#FFB74D", techo: "#EF6C00" },
  tiendita: { pared: "#FFE082", techo: "#E53935" },
  disfraces: { pared: "#F48FB1", techo: "#AD1457" },
  granja: { pared: "#E53935", techo: "#8D1B1B" },
  veterinaria: { pared: "#E0F2F1", techo: "#00897B" },
};

const material = (color: string) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85 });

function caja(w: number, h: number, d: number, color: string) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(color));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Letrero que siempre mira a la cámara. */
function letrero(texto: string, color = "#8D6E63") {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = color;
  g.beginPath();
  g.roundRect(8, 16, 496, 96, 40);
  g.fill();
  g.fillStyle = "#fff";
  g.font = "bold 56px sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(texto, 256, 66);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false }));
  s.scale.set(12, 3, 1);
  s.renderOrder = 10;
  return s;
}

/** Emoji como figura plana que mira a la cámara (animales del barrio). */
function emojiSprite(emoji: string, tamano = 5) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.font = "100px sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(emoji, 64, 72);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c) }));
  s.scale.set(tamano, tamano, 1);
  return s;
}

function edificio(l: Lugar) {
  const g = new THREE.Group();
  const col = COLOR_LUGAR[l.id];
  if (col) {
    const ancho = l.id === "granja" ? 18 : 16;
    const cuerpo = caja(ancho, 10, 12, col.pared);
    cuerpo.position.y = 5;
    g.add(cuerpo);
    const techo = new THREE.Mesh(new THREE.ConeGeometry(ancho * 0.78, 7, 4), material(col.techo));
    techo.rotation.y = Math.PI / 4;
    techo.scale.z = 0.85;
    techo.position.y = 13.5;
    techo.castShadow = true;
    g.add(techo);
    const puerta = caja(3.4, 6, 0.4, l.id === "granja" ? "#fff" : "#6D4C41");
    puerta.position.set(0, 3, 6.1);
    g.add(puerta);
    for (const x of [-5, 5]) {
      const v = caja(3, 3, 0.3, "#E3F2FD");
      v.position.set(x, 6.5, 6.1);
      g.add(v);
    }
    if (l.id === "escuelita") {
      const torre = caja(3, 4, 3, "#4FC3F7");
      torre.position.y = 18;
      g.add(torre);
      const campana = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), material("#FFCA28"));
      campana.position.y = 18;
      campana.position.z = 1.6;
      g.add(campana);
    }
    if (l.id === "tiendita") {
      for (let i = 0; i < 8; i++) {
        const t = caja(2, 0.4, 3, i % 2 ? "#fff" : "#E53935");
        t.position.set(-7 + i * 2, 9, 7.5);
        t.rotation.x = -0.35;
        g.add(t);
      }
    }
    if (l.id === "veterinaria") {
      const cruzV = caja(1, 3.4, 0.3, "#E53935");
      const cruzH = caja(3.4, 1, 0.3, "#E53935");
      cruzV.position.set(0, 13, 4.2);
      cruzH.position.set(0, 13, 4.2);
      g.add(cruzV, cruzH);
    }
  } else if (l.id === "plaza") {
    for (const x of [-6, 0]) {
      const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 8), material("#E53935"));
      poste.position.set(x - 3, 4, 0);
      poste.castShadow = true;
      g.add(poste);
    }
    const barra = caja(7, 0.6, 0.6, "#C62828");
    barra.position.set(-6, 8, 0);
    g.add(barra);
    const asiento = caja(2, 0.4, 1.2, "#FDD835");
    asiento.position.set(-6, 2.2, 0);
    g.add(asiento);
    const tobogan = caja(2.6, 0.5, 11, "#43A047");
    tobogan.position.set(6, 3.2, 0);
    tobogan.rotation.x = 0.55;
    g.add(tobogan);
    const escalera = caja(2.6, 6, 0.6, "#1E88E5");
    escalera.position.set(6, 3, -4.8);
    g.add(escalera);
  } else if (l.id === "huerto") {
    for (let i = 0; i < 3; i++) {
      const surco = caja(14, 1, 2.6, "#8D6E63");
      surco.position.set(0, 0.5, -4 + i * 4);
      g.add(surco);
      for (let j = 0; j < 5; j++) {
        const brote = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.8, 5), material(j % 2 ? "#66BB6A" : "#FB8C00"));
        brote.position.set(-5.6 + j * 2.8, 1.8, -4 + i * 4);
        g.add(brote);
      }
    }
  } else if (l.id === "paradero") {
    const techo = caja(9, 0.6, 4, "#5C6BC0");
    techo.position.y = 6;
    g.add(techo);
    for (const x of [-4, 4]) {
      const p = caja(0.5, 6, 0.5, "#7986CB");
      p.position.set(x, 3, 1.6);
      g.add(p);
    }
    const banca = caja(7, 0.6, 1.4, "#8D6E63");
    banca.position.y = 1.5;
    g.add(banca);
  }
  const cartel = letrero(l.estrellas ? `🚧 ${l.nombre}` : l.ruta ? l.nombre : "Pronto");
  cartel.position.y = l.id === "escuelita" ? 23 : 19;
  g.add(cartel);
  g.position.set(A3(l.x), 0, A3(l.y) - 6);
  g.userData.lugar = l;
  return g;
}

function arbol(k: number) {
  const g = new THREE.Group();
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 4, 6), material("#6D4C41"));
  tronco.position.y = 2;
  tronco.castShadow = true;
  g.add(tronco);
  const copa = new THREE.Mesh(new THREE.IcosahedronGeometry(3.4, 0), material(["#43A047", "#388E3C", "#66BB6A"][k % 3]!));
  copa.position.y = 6.2;
  copa.castShadow = true;
  g.add(copa);
  return g;
}

/** Personaje del niño: cuerpo, cabeza, pelo según el peinado y su ropa. */
function personaje(a: Apariencia) {
  const g = new THREE.Group();
  const piernas = [-0.5, 0.5].map((x) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.6, 8), material(a.piel));
    p.position.set(x, 0.8, 0);
    p.castShadow = true;
    return p;
  });
  const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.2, 2.4, 10), material(a.ropa));
  cuerpo.position.y = 2.7;
  cuerpo.castShadow = true;
  const cabeza = new THREE.Mesh(new THREE.SphereGeometry(1.25, 16, 12), material(a.piel));
  cabeza.position.y = 4.9;
  cabeza.castShadow = true;
  const pelo = new THREE.Mesh(new THREE.SphereGeometry(1.32, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), material(a.pelo));
  pelo.position.y = 5.05;
  pelo.rotation.x = -0.55;
  g.add(...piernas, cuerpo, cabeza, pelo);
  if (a.peinado === "colitas") for (const x of [-1.4, 1.4]) {
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), material(a.pelo));
    c.position.set(x, 5.1, -0.3);
    g.add(c);
  }
  if (a.peinado === "largo") {
    const largo = caja(2.4, 2.2, 0.6, a.pelo);
    largo.position.set(0, 4.2, -0.9);
    g.add(largo);
  }
  for (const x of [-0.42, 0.42]) {
    const ojo = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), material("#3B2F5C"));
    ojo.position.set(x, 5, 1.15);
    g.add(ojo);
  }
  return g;
}

function emilia3d() {
  const g = personaje({ piel: "#F6D3B3", pelo: "#5D4037", peinado: "colitas", ropa: "#FDD835" });
  const vestido = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.2, 12), material("#FDD835"));
  vestido.position.y = 2.2;
  vestido.castShadow = true;
  g.add(vestido);
  return g;
}

function tito3d() {
  const g = new THREE.Group();
  const cuerpo = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), material("#A1673F"));
  cuerpo.scale.set(1, 0.7, 1.5);
  cuerpo.position.y = 1.5;
  cuerpo.castShadow = true;
  const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 10), material("#A1673F"));
  cabeza.position.set(0, 2.3, 1.3);
  const hocico = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), material("#3E2723"));
  hocico.position.set(0, 2.2, 1.9);
  g.add(cuerpo, cabeza, hocico);
  for (const x of [-0.4, 0.4]) {
    const oreja = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 6), material("#8D5524"));
    oreja.position.set(x, 3, 1.2);
    g.add(oreja);
  }
  for (const [x, z] of [[-0.5, 0.8], [0.5, 0.8], [-0.5, -0.8], [0.5, -0.8]] as const) {
    const pata = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.1, 6), material("#5D4037"));
    pata.position.set(x, 0.55, z);
    g.add(pata);
  }
  return g;
}

export function crearBarrio3D(contenedor: HTMLElement, op: OpcionesBarrio3D): Barrio3D {
  const noche = new Date().getHours() >= 20 || new Date().getHours() < 7;
  const escena = new THREE.Scene();
  escena.background = new THREE.Color(noche ? "#1A237E" : "#9FDBFF");
  escena.fog = new THREE.Fog(noche ? "#1A237E" : "#BDE8FF", 90, 220);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.touchAction = "none";
  contenedor.appendChild(renderer.domElement);

  const camara = new THREE.PerspectiveCamera(40, 1, 1, 600);
  // Luces fuertes y cálidas para un look de dibujo animado, colorido y alegre.
  escena.add(new THREE.HemisphereLight("#ffffff", "#C5E1A5", noche ? 0.9 : 2.1));
  escena.add(new THREE.AmbientLight("#ffffff", noche ? 0.3 : 0.6));
  const sol = new THREE.DirectionalLight(noche ? "#C5CAE9" : "#FFF6E0", noche ? 1.0 : 3.0);
  sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024);
  Object.assign(sol.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 200 });
  escena.add(sol, sol.target);

  // Suelo, caminos, laguna y cordillera
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(260, 220), material("#8BC34A"));
  suelo.rotation.x = -Math.PI / 2;
  suelo.position.set(90, 0, 62);
  suelo.receiveShadow = true;
  escena.add(suelo);
  const camino = (x: number, z: number, w: number, d: number) => {
    const c = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), material("#D7B98E"));
    c.position.set(x, 0.1, z);
    c.receiveShadow = true;
    escena.add(c);
  };
  camino(90, 42.7, 190, 5.4);
  camino(90, 83.7, 190, 5.4);
  camino(90.4, 79, 5.6, 80);
  const laguna = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 0.3, 32), new THREE.MeshStandardMaterial({ color: "#4FC3F7", roughness: 0.2 }));
  laguna.scale.z = 0.55;
  laguna.position.set(21, 0.15, 54);
  escena.add(laguna);
  for (let i = 0; i < 9; i++) {
    const cerro = new THREE.Mesh(new THREE.ConeGeometry(22, 32 + (i % 3) * 8, 5), material("#90A4AE"));
    cerro.position.set(-20 + i * 26, 14, -32 - (i % 2) * 8);
    escena.add(cerro);
    const nieve = new THREE.Mesh(new THREE.ConeGeometry(7, 9, 5), material("#ffffff"));
    nieve.position.set(cerro.position.x, cerro.position.y + 14 + (i % 3) * 4, cerro.position.z);
    escena.add(nieve);
  }

  const edificios = LUGARES.map((l) => {
    const e = edificio(l);
    escena.add(e);
    return e;
  });
  ARBOLES.forEach(([x, y], k) => {
    const a = arbol(k);
    a.position.set(A3(x), 0, A3(y));
    escena.add(a);
  });
  const vecinos = VECINOS.map((v) => {
    const s = emojiSprite(v.emoji, v.emoji === "🦋" ? 3 : 5);
    s.position.set(A3(v.x), v.emoji === "🦋" ? 8 : 2.5, A3(v.y));
    s.userData.frase = v.frase;
    escena.add(s);
    return s;
  });

  // Personajes
  const nino = personaje(op.apariencia);
  const emilia = emilia3d();
  const tito = tito3d();
  const casa = LUGARES.find((l) => l.id === "casa")!;
  const inicio = new THREE.Vector3(A3(casa.x) + 7, 0, A3(casa.y) + 4);
  nino.position.copy(inicio);
  emilia.position.set(inicio.x - 4, 0, inicio.z);
  tito.position.set(inicio.x - 7, 0, inicio.z + 1);
  nino.scale.setScalar(1.35);
  emilia.scale.setScalar(1.3);
  tito.scale.setScalar(1.3);
  escena.add(nino, emilia, tito);
  const nombre = letrero(op.nombre, "#3B2F5C");
  nombre.scale.set(8, 2, 1);
  nombre.position.y = 8;
  nino.add(nombre);

  // Movimiento
  const destino = inicio.clone();
  let entrarA: Lugar | null = null;
  const rastro: THREE.Vector3[] = Array.from({ length: 20 }, () => inicio.clone());
  let fase = 0;
  const VEL = 16;
  // Las casas son sólidas: el niño camina alrededor (los parques, el huerto y el paradero se pueden pisar).
  const solidos = LUGARES.filter((l) => COLOR_LUGAR[l.id]).map((l) => {
    const medio = (l.id === "granja" ? 18 : 16) / 2 + 1;
    return { x0: A3(l.x) - medio, x1: A3(l.x) + medio, z0: A3(l.y) - 13, z1: A3(l.y) + 0.8 };
  });
  const libre = (x: number, z: number) =>
    x >= 2 && x <= 178 && z >= 14 && z <= 122 && !solidos.some((b) => x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1);
  /** Avanza sin atravesar casas (si choca de frente, se desliza por la pared). */
  const avanzar = (obj: THREE.Object3D, dir: THREE.Vector3, paso: number) => {
    const p = obj.position;
    const nx = p.x + dir.x * paso, nz = p.z + dir.z * paso;
    if (libre(nx, nz)) p.set(nx, p.y, nz);
    else if (Math.abs(dir.x) > 0.2 && libre(nx, p.z)) p.x = nx;
    else if (Math.abs(dir.z) > 0.2 && libre(p.x, nz)) p.z = nz;
    else return 0;
    obj.rotation.y = Math.atan2(dir.x, dir.z);
    return paso;
  };
  const mover = (obj: THREE.Object3D, hacia: THREE.Vector3, dt: number, vel: number, conChoques = false) => {
    const d = obj.position.distanceTo(hacia);
    if (d < 0.2) return 0;
    const paso = Math.min(d, vel * dt);
    const dir = hacia.clone().sub(obj.position).setY(0).normalize();
    if (conChoques) return avanzar(obj, dir, paso);
    obj.position.addScaledVector(dir, paso);
    obj.rotation.y = Math.atan2(dir.x, dir.z);
    return paso;
  };

  // Teclado (flechas o WASD) y flechas en pantalla
  const teclas = new Set<Direccion>();
  const TECLAS: Record<string, Direccion> = {
    ArrowUp: "arriba", ArrowDown: "abajo", ArrowLeft: "izquierda", ArrowRight: "derecha",
    w: "arriba", s: "abajo", a: "izquierda", d: "derecha", W: "arriba", S: "abajo", A: "izquierda", D: "derecha",
  };
  let cerca: Lugar | null = null;
  const entrarCerca = () => {
    if (cerca) op.alEntrar(cerca);
  };
  const alTecla = (e: KeyboardEvent) => {
    const d = TECLAS[e.key];
    if (d) {
      e.preventDefault();
      teclas.add(d);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      entrarCerca();
    } else if (e.key === "+" || e.key === "=") zoomA(zoom - 0.15);
    else if (e.key === "-") zoomA(zoom + 0.15);
  };
  const alSoltarTecla = (e: KeyboardEvent) => {
    const d = TECLAS[e.key];
    if (d) teclas.delete(d);
  };
  // En fase de captura: así funciona aunque un botón de la pantalla tenga el foco.
  window.addEventListener("keydown", alTecla, true);
  window.addEventListener("keyup", alSoltarTecla, true);
  const soltarTodo = () => teclas.clear();
  window.addEventListener("blur", soltarTodo);

  // Cámara: zoom (pellizco, rueda o botones) y paseo por el mapa arrastrando el dedo.
  let zoom = 1;
  const zoomA = (z: number) => { zoom = Math.min(1.8, Math.max(0.45, z)); };
  const paseo = new THREE.Vector3(); // cuánto se corrió la vista respecto del niño
  let siguiendo = true;

  // Toques: tocar el suelo para caminar, una casa para entrar, un animal para escucharlo.
  // Arrastrar un dedo mueve la vista por el mapa; dos dedos (pellizco) acercan o alejan.
  const ray = new THREE.Raycaster();
  const puntero = new THREE.Vector2();
  const dedos = new Map<number, { x: number; y: number }>();
  let inicioToque: { x: number; y: number } | null = null;
  let arrastrando = false;
  let distanciaPellizco = 0;
  const lienzo = renderer.domElement;
  const alBajar = (e: PointerEvent) => {
    try { lienzo.setPointerCapture(e.pointerId); } catch { /* sin captura */ }
    dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (dedos.size === 1) {
      inicioToque = { x: e.clientX, y: e.clientY };
      arrastrando = false;
    } else {
      inicioToque = null; // con dos dedos no se camina
      const [a, b] = [...dedos.values()];
      distanciaPellizco = Math.hypot(a!.x - b!.x, a!.y - b!.y);
    }
  };
  const alMover = (e: PointerEvent) => {
    const antes = dedos.get(e.pointerId);
    if (!antes) return;
    const ahora = { x: e.clientX, y: e.clientY };
    dedos.set(e.pointerId, ahora);
    if (dedos.size >= 2) {
      const [a, b] = [...dedos.values()];
      const d = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      if (distanciaPellizco > 0) zoomA(zoom * (distanciaPellizco / d));
      distanciaPellizco = d;
      return;
    }
    if (inicioToque && !arrastrando && Math.hypot(ahora.x - inicioToque.x, ahora.y - inicioToque.y) > 12) arrastrando = true;
    if (arrastrando) {
      // El mapa sigue al dedo: unidades del mundo por pixel según la distancia de la cámara.
      const k = (2 * 63 * zoom * Math.tan((camara.fov * Math.PI) / 360)) / Math.max(1, lienzo.clientHeight);
      paseo.x -= (ahora.x - antes.x) * k;
      paseo.z -= (ahora.y - antes.y) * k * 1.35;
      siguiendo = false;
    }
  };
  const alSubir = (e: PointerEvent) => {
    dedos.delete(e.pointerId);
    if (dedos.size < 2) distanciaPellizco = 0;
    if (!inicioToque || arrastrando || dedos.size > 0) {
      if (dedos.size === 0) inicioToque = null;
      return;
    }
    inicioToque = null;
    const r = lienzo.getBoundingClientRect();
    puntero.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(puntero, camara);
    const vec = ray.intersectObjects(vecinos)[0];
    if (vec) return op.alTocarVecino(vec.object.userData.frase);
    const golpe = ray.intersectObjects(edificios, true)[0];
    if (golpe) {
      let o: THREE.Object3D | null = golpe.object;
      while (o && !o.userData.lugar) o = o.parent;
      if (o) {
        const l = o.userData.lugar as Lugar;
        destino.set(A3(l.x), 0, A3(l.y) + 3);
        entrarA = l;
        siguiendo = true;
        return;
      }
    }
    const enSuelo = ray.intersectObject(suelo)[0];
    if (enSuelo) {
      entrarA = null;
      siguiendo = true;
      destino.set(Math.min(Math.max(enSuelo.point.x, 2), 178), 0, Math.min(Math.max(enSuelo.point.z, 14), 122));
    }
  };
  const alRueda = (e: WheelEvent) => {
    e.preventDefault();
    zoomA(zoom * (e.deltaY > 0 ? 1.1 : 0.9));
  };
  const alCancelar = (e: PointerEvent) => {
    dedos.delete(e.pointerId);
    inicioToque = null;
  };
  lienzo.addEventListener("pointerdown", alBajar);
  lienzo.addEventListener("pointermove", alMover);
  lienzo.addEventListener("pointerup", alSubir);
  lienzo.addEventListener("pointercancel", alCancelar);
  lienzo.addEventListener("wheel", alRueda, { passive: false });

  const ajustar = () => {
    const { clientWidth: w, clientHeight: h } = contenedor;
    renderer.setSize(w, h);
    camara.aspect = w / Math.max(1, h);
    camara.updateProjectionMatrix();
  };
  ajustar();
  const observador = new ResizeObserver(ajustar);
  observador.observe(contenedor);

  // Bucle de animación
  const reloj = new THREE.Clock();
  const ojo = new THREE.Vector3();
  let cuadro = 0;
  let atascado = 0;
  const dirTeclas = new THREE.Vector3();
  const animar = () => {
    const dt = Math.min(0.05, reloj.getDelta());
    let paso = 0;
    dirTeclas.set(
      (teclas.has("derecha") ? 1 : 0) - (teclas.has("izquierda") ? 1 : 0),
      0,
      (teclas.has("abajo") ? 1 : 0) - (teclas.has("arriba") ? 1 : 0),
    );
    if (dirTeclas.lengthSq() > 0) {
      // Con flechas: camina directo en esa dirección (cancela el camino tocado).
      paso = avanzar(nino, dirTeclas.normalize(), VEL * dt);
      destino.copy(nino.position);
      entrarA = null;
      siguiendo = true;
    } else {
      paso = mover(nino, destino, dt, VEL, true);
      const falta = nino.position.distanceTo(destino);
      // Si choca con una casa camino a otro lado, se detiene (o entra, si iba a esa casa).
      if (!paso && falta >= 0.2) {
        atascado += dt;
        if (atascado > 0.3) {
          destino.copy(nino.position);
          atascado = 0;
        }
      } else atascado = 0;
    }
    if (paso && rastro[0]!.distanceTo(nino.position) > 0.8) rastro.unshift(nino.position.clone()) && rastro.pop();
    if (!paso && entrarA) {
      const l = entrarA;
      entrarA = null;
      op.alEntrar(l);
    }
    // ¿Está frente a una puerta?
    const ahora = LUGARES.find((l) => Math.hypot(nino.position.x - A3(l.x), nino.position.z - (A3(l.y) + 3)) < 6) ?? null;
    if (ahora !== cerca) {
      cerca = ahora;
      op.alCerca?.(cerca);
    }
    const pe = mover(emilia, rastro[6]!, dt, VEL * 1.1);
    const pt = mover(tito, rastro[11]!, dt, VEL * 1.15);
    fase += (paso + pe * 0.4) * 1.4;
    nino.position.y = paso ? Math.abs(Math.sin(fase)) * 0.6 : 0;
    emilia.position.y = pe ? Math.abs(Math.sin(fase + 1)) * 0.5 : 0;
    tito.position.y = pt ? Math.abs(Math.sin(fase * 1.6)) * 0.6 : 0;
    vecinos.forEach((v, i) => { v.position.y = (v.scale.x < 4 ? 8 : 2.5) + Math.sin(reloj.elapsedTime * 2 + i) * 0.3; });

    // La cámara sigue al niño; si el niño arrastró el mapa, mira hacia donde lo dejó
    // (dentro del barrio) hasta que vuelva a caminar.
    if (siguiendo) paseo.multiplyScalar(0.9);
    const fx = Math.min(178, Math.max(2, nino.position.x + paseo.x));
    const fz = Math.min(124, Math.max(10, nino.position.z + paseo.z));
    paseo.set(fx - nino.position.x, 0, fz - nino.position.z);
    ojo.set(fx, 44 * zoom, fz + 46 * zoom);
    camara.position.lerp(ojo, 0.12);
    camara.lookAt(camara.position.x, 2, camara.position.z - 46 * zoom - 2);
    sol.position.set(fx + 30, 60, fz + 20);
    sol.target.position.set(fx, 0, fz);
    renderer.render(escena, camara);
    contenedor.dataset.nino = `${nino.position.x.toFixed(1)},${nino.position.z.toFixed(1)}`;
    cuadro = requestAnimationFrame(animar);
  };
  camara.position.set(inicio.x, 44, inicio.z + 46);
  animar();

  return {
    destruir() {
      cancelAnimationFrame(cuadro);
      observador.disconnect();
      lienzo.removeEventListener("pointerdown", alBajar);
      lienzo.removeEventListener("pointermove", alMover);
      lienzo.removeEventListener("pointerup", alSubir);
      lienzo.removeEventListener("pointercancel", alCancelar);
      lienzo.removeEventListener("wheel", alRueda);
      window.removeEventListener("keydown", alTecla, true);
      window.removeEventListener("keyup", alSoltarTecla, true);
      window.removeEventListener("blur", soltarTodo);
      renderer.dispose();
      renderer.domElement.remove();
    },
    flecha(d, apretada) {
      if (apretada) teclas.add(d);
      else teclas.delete(d);
    },
    entrar: entrarCerca,
    zoom(pasoZoom) {
      zoomA(zoom - pasoZoom * 0.2);
    },
    centrar() {
      siguiendo = true;
    },
  };
}
