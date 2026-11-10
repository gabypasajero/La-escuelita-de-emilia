import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { horaActual, momentoDelDia, type Momento } from "../hora";
import type { Apariencia, Ranura } from "../juego";
import { hablar, hayVoz, vozSonando, type Idioma } from "../voz";
import { animarAccesorios, ponerAccesorioTito, ponerAccesorios } from "./accesorios";
import { crearAnimal, type Animal } from "./animal";
import { entre, letrero, liberarTodo, lienzo, suave, type V3 } from "./base";
import { crearPersona, defNino, ELENCO, type Persona } from "./personaje";

/**
 * Motor del mundo 3D: dibuja la escena, ilumina según la hora real, mueve al
 * niño (tocando el suelo, tocando un objeto o con las flechas), hace que
 * Emilia y Tito lo sigan, lleva la cámara y cambia de un escenario a otro.
 * Cada escenario (barrio, escuelita, granja…) se arma en `escenas/` y le
 * entrega al motor su suelo, sus cosas para tocar y su cámara.
 */

// ---------- Lo que un escenario le entrega al motor ----------

export interface Interactivo {
  /** Lo que se toca (el objeto y todo lo que cuelga de él). */
  objeto: THREE.Object3D;
  /** Dónde se para el niño para usarlo. */
  llegada: { x: number; z: number };
  /** Hacia dónde queda mirando al llegar. */
  mira?: { x: number; z: number };
  alLlegar: () => void;
}

export type Caja = { x0: number; x1: number; z0: number; z1: number };

export type CamaraEscena =
  /** Sigue al niño desde arriba (barrio). `inclina` en grados. */
  | { modo: "sigue"; dist: number; inclina: number; zoom?: [number, number] }
  /** Muestra el escenario completo, como una casa de juguetes abierta. */
  | { modo: "sala"; ancho: number; alto: number; fondo: number; inclina?: number };

export interface Escena {
  id: string;
  titulo: string;
  exterior: boolean;
  raiz: THREE.Group;
  inicio: { x: number; z: number; rumbo?: number };
  /** Dónde aparece el niño según de dónde viene (al salir de una casa, frente a su puerta). */
  puntos?: Record<string, { x: number; z: number }>;
  limites: Caja;
  solidos: Caja[];
  libre?: (x: number, z: number) => boolean;
  interactivos: Interactivo[];
  camara: CamaraEscena;
  /** Colores del fondo (arriba y abajo) si no es el cielo de la hora. */
  fondo?: [string, string];
  /** Adónde lleva "volver" (por defecto, al barrio). */
  salida?: string;
  /** Casas que se transparentan cuando tapan al niño. */
  ocultables?: Array<Caja & { opacidad: (v: number) => void; actual?: number }>;
  actualizar?: (dt: number, t: number) => void;
  alEntrar?: (datos?: Record<string, unknown>) => void;
  alSalir?: () => void;
  /** Botones y opciones del panel (herramientas, respuestas). */
  alAccion?: (id: string) => void;
  /** Avisos desde las ventanas de juego (por ejemplo, cuando se cierra una). */
  alEvento?: (evento: string, dato?: unknown) => void;
}

export interface Hud {
  /** Botones grandes de abajo (herramientas, acciones). */
  botones?: Array<{ id: string; icono: string; texto: string; apagado?: boolean }>;
  /** Pregunta con opciones para elegir. */
  pregunta?: { icono?: string; texto: string; opciones: Array<{ id: string; icono: string; texto?: string }> };
  /** Fichas de información (la canasta, el pedido). */
  fichas?: Array<{ id?: string; icono?: string; texto: string }>;
}

/** Lo que el motor le presta a cada escenario. */
export interface Ctx {
  momento: Momento;
  noche: boolean;
  /** De tarde y de noche se encienden lámparas y ventanas. */
  luces: boolean;
  nino: Persona;
  emilia: Persona;
  tito: Animal;
  nombre: string;
  decir: (texto: string, quien?: Persona | null, idioma?: Idioma) => void;
  decirYEsperar: (texto: string, quien?: Persona | null, idioma?: Idioma) => Promise<void>;
  irA: (escena: string, datos?: Record<string, unknown>) => void;
  ventana: (ruta: string, titulo: string) => void;
  /** Abre una pantalla del mundo 2D (mientras ese lugar no exista en 3D). */
  ruta2d: (ruta: string) => void;
  hud: (h: Hud | null) => void;
  ganar: (n: number) => void;
  estrellas: () => number;
  caminarA: (x: number, z: number, alLlegar?: () => void) => void;
  /** Acerca la cámara a un punto (o la suelta con `null`). */
  enfocar: (objetivo: V3 | null, distancia?: number) => void;
  efecto: (tipo: Efecto, pos: V3) => void;
  /** Hace algo después de unos segundos (se cancela al salir del escenario). */
  luego: (segundos: number, fn: () => void) => void;
  /** ¿Sigue el niño en este escenario? (para cortar secuencias largas). */
  vigente: (escena: string) => boolean;
  accesorios: () => Partial<Record<Ranura, string>>;
}

export type Constructor = (c: Ctx) => Escena;
export type Efecto = "corazones" | "estrellas" | "notas" | "zzz" | "brillos";

export interface OpcionesMundo {
  apariencia: Apariencia;
  nombre: string;
  accesorios: () => Partial<Record<Ranura, string>>;
  estrellas: () => number;
  ganar: (n: number) => void;
  escenaInicial?: string;
  alDecir: (texto: string) => void;
  alVentana: (v: { ruta: string; titulo: string } | null) => void;
  alHud: (h: Hud | null) => void;
  alRuta?: (ruta: string) => void;
  alEscena: (id: string, titulo: string) => void;
  /** El niño salió del mundo 3D (volver desde el barrio). */
  alSalir: () => void;
  /** El aparato va lento: se bajó la calidad. */
  alLento?: () => void;
}

export interface Mundo {
  destruir: () => void;
  irA: (escena: string, datos?: Record<string, unknown>) => void;
  volver: () => void;
  accion: (id: string) => void;
  /** La ventana de juego se cerró: el mundo vuelve a recibir toques. */
  cerrarVentana: () => void;
  /** Cambió algo del niño (accesorios puestos). */
  refrescar: () => void;
  evento: (evento: string, dato?: unknown) => void;
  escena: () => string;
  /** El niño ganó algo en un juego: los amigos lo celebran en el escenario. */
  celebrar: () => void;
  /** Cuánto dibuja por cuadro (para revisar el rendimiento). */
  carga: () => { dibujos: number; triangulos: number };
}

// ---------- Luz según la hora ----------

const LUCES: Record<Momento, { cielo: [string, string]; sol: string; iSol: number; hemiA: string; hemiB: string; iHemi: number; env: number; sombra: number }> = {
  amanecer: { cielo: ["#F7B79A", "#FFE9D6"], sol: "#FFD2AA", iSol: 2.0, hemiA: "#FFE9DC", hemiB: "#C9DDB5", iHemi: 1.2, env: 0.4, sombra: 0.5 },
  dia: { cielo: ["#6EC3F4", "#DDF2FF"], sol: "#FFF3DA", iSol: 2.5, hemiA: "#FFFFFF", hemiB: "#CFE8B4", iHemi: 1.35, env: 0.5, sombra: 0.55 },
  tarde: { cielo: ["#FF9463", "#FFD9AC"], sol: "#FFB877", iSol: 2.1, hemiA: "#FFE2C2", hemiB: "#D8C9A0", iHemi: 1.15, env: 0.4, sombra: 0.5 },
  noche: { cielo: ["#141B4D", "#3A3F8C"], sol: "#A9BEFF", iSol: 1.05, hemiA: "#8E9BE8", hemiB: "#31456B", iHemi: 0.95, env: 0.22, sombra: 0.4 },
};

const VEL = 5.2;
const TECLAS: Record<string, [number, number]> = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0], W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0],
};

export function crearMundo(contenedor: HTMLElement, op: OpcionesMundo, catalogo: Record<string, Constructor>): Mundo {
  const momento = momentoDelDia(horaActual());
  const L = LUCES[momento];
  const noche = momento === "noche", luces = noche || momento === "tarde";

  // ---------- Dibujo ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  let pixeles = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixeles);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.02;
  const lienzoGl = renderer.domElement;
  lienzoGl.style.cssText = "display:block;width:100%;height:100%;touch-action:none;outline:none";
  contenedor.appendChild(lienzoGl);
  const velo = document.createElement("div");
  velo.style.cssText = "position:absolute;inset:0;background:#FFF8E1;opacity:1;transition:opacity .32s ease;pointer-events:none";
  contenedor.appendChild(velo);

  const escena3 = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const entorno = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  escena3.environment = entorno;
  escena3.environmentIntensity = L.env;
  const fondos = new Map<string, THREE.Texture>();
  const fondo = (a: string, b: string) => {
    const clave = a + b;
    if (!fondos.has(clave)) {
      fondos.set(clave, lienzo(4, 256, (g, w, h) => {
        const grad = g.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, a);
        grad.addColorStop(1, b);
        g.fillStyle = grad;
        g.fillRect(0, 0, w, h);
      }));
    }
    return fondos.get(clave)!;
  };

  const camara = new THREE.PerspectiveCamera(36, 1, 0.5, 400);
  const hemi = new THREE.HemisphereLight(L.hemiA, L.hemiB, L.iHemi);
  const sol = new THREE.DirectionalLight(L.sol, L.iSol);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  sol.shadow.bias = -0.0005;
  sol.shadow.normalBias = 0.035;
  sol.shadow.radius = 5;
  sol.shadow.intensity = L.sombra;
  // Luz de relleno desde atrás, para que nada quede oscuro ni "de madera".
  const relleno = new THREE.DirectionalLight(noche ? "#7F8FE0" : "#D6E8FF", noche ? 0.45 : 0.6);
  escena3.add(hemi, sol, sol.target, relleno, relleno.target);

  // ---------- Personajes que acompañan en todos los escenarios ----------
  const nino = crearPersona(defNino(op.apariencia));
  const emilia = crearPersona(ELENCO.emilia!);
  const tito = crearAnimal("pudu");
  const cartel = letrero(op.nombre, { fondo: "#FFFFFF", color: "#3B2F5C", borde: "#E1D7F5", alto: 0.4 });
  cartel.position.y = nino.alto + 0.42;
  nino.raiz.add(cartel);
  escena3.add(nino.raiz, emilia.raiz, tito.raiz);
  const vestir = () => {
    const puestos = op.accesorios();
    ponerAccesorios(nino, puestos);
    ponerAccesorioTito(tito, puestos.tito);
  };
  vestir();

  // ---------- Estado ----------
  const vivas = new Map<string, Escena>();
  let actual: Escena | null = null;
  const pila: string[] = [];
  let cambiando = false;
  let enVentana = false;
  const destino = new THREE.Vector3();
  let pendiente: Interactivo | null = null;
  let alLlegarLibre: (() => void) | null = null;
  let rastro: THREE.Vector3[] = [];
  let quieto = 0;
  let atascado = 0;
  const teclas = new Set<string>();
  let zoom = 1;
  const paseo = new THREE.Vector3();
  let siguiendo = true;
  let enfoque: { p: THREE.Vector3; d: number } | null = null;
  const camPos = new THREE.Vector3(), camMira = new THREE.Vector3();
  let camLista = false;
  let hablante: Persona | null = null;
  let hablaHasta = 0;
  const esperas: Array<{ t: number; fn: () => void; escena: string }> = [];
  const reloj = new THREE.Clock();
  let tiempo = 0;

  // ---------- Efectos: corazones, estrellas, notas ----------
  const DIBUJO: Record<Efecto, (g: CanvasRenderingContext2D) => void> = {
    corazones: (g) => {
      g.fillStyle = "#FFCA28";
      g.strokeStyle = "#F9A825";
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(64, 110);
      g.bezierCurveTo(-10, 60, 24, 0, 64, 38);
      g.bezierCurveTo(104, 0, 138, 60, 64, 110);
      g.fill();
      g.stroke();
    },
    estrellas: (g) => {
      g.fillStyle = "#FDD835";
      g.strokeStyle = "#F9A825";
      g.lineWidth = 5;
      g.lineJoin = "round";
      g.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI / 5) * i - Math.PI / 2, r = i % 2 ? 24 : 54;
        g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r);
      }
      g.closePath();
      g.fill();
      g.stroke();
    },
    notas: (g) => {
      g.fillStyle = "#5E35B1";
      g.beginPath();
      g.ellipse(46, 96, 20, 15, -0.4, 0, Math.PI * 2);
      g.fill();
      g.fillRect(60, 22, 9, 76);
      g.beginPath();
      g.moveTo(60, 22);
      g.quadraticCurveTo(100, 30, 96, 62);
      g.quadraticCurveTo(88, 44, 69, 44);
      g.fill();
    },
    zzz: (g) => {
      g.fillStyle = "#3949AB";
      g.strokeStyle = "#ffffff";
      g.lineWidth = 6;
      g.font = "900 96px system-ui, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.strokeText("Z", 64, 68);
      g.fillText("Z", 64, 68);
    },
    brillos: (g) => {
      g.fillStyle = "#FFF59D";
      g.beginPath();
      g.moveTo(64, 6);
      g.quadraticCurveTo(70, 58, 122, 64);
      g.quadraticCurveTo(70, 70, 64, 122);
      g.quadraticCurveTo(58, 70, 6, 64);
      g.quadraticCurveTo(58, 58, 64, 6);
      g.fill();
    },
  };
  const texEfecto = new Map<Efecto, THREE.Texture>();
  const chispas: Array<{ s: THREE.Sprite; vida: number; vx: number; vy: number; vz: number; tam: number }> = [];
  const efecto = (tipo: Efecto, pos: V3) => {
    if (!texEfecto.has(tipo)) texEfecto.set(tipo, lienzo(128, 128, (g) => DIBUJO[tipo](g)));
    const n = tipo === "zzz" ? 3 : 6;
    for (let i = 0; i < n; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texEfecto.get(tipo)!, transparent: true, depthTest: false }));
      s.position.set(pos[0] + (Math.random() - 0.5) * 0.9, pos[1] + Math.random() * 0.3, pos[2] + (Math.random() - 0.5) * 0.5);
      s.renderOrder = 30;
      s.scale.setScalar(0.01);
      escena3.add(s);
      chispas.push({ s, vida: -i * 0.12, vx: (Math.random() - 0.5) * 0.6, vy: 0.9 + Math.random() * 0.6, vz: (Math.random() - 0.5) * 0.3, tam: 0.3 + Math.random() * 0.18 });
    }
  };

  // ---------- Voz y diálogo ----------
  const decir = (texto: string, quien: Persona | null = emilia, idioma: Idioma = "es") => {
    op.alDecir(texto);
    hablante = quien;
    hablaHasta = tiempo + Math.max(1.6, texto.length * 0.075);
    void hablar(texto, idioma);
  };
  const decirYEsperar = async (texto: string, quien: Persona | null = emilia, idioma: Idioma = "es") => {
    op.alDecir(texto);
    hablante = quien;
    hablaHasta = tiempo + Math.max(1.6, texto.length * 0.075);
    await Promise.race([hablar(texto, idioma), new Promise((r) => setTimeout(r, 2500 + texto.length * 95))]);
    if (!hayVoz(idioma)) await new Promise((r) => setTimeout(r, Math.max(1200, texto.length * 60)));
    await new Promise((r) => setTimeout(r, 250));
  };

  // ---------- Escenarios ----------
  const ctx: Ctx = {
    momento, noche, luces, nino, emilia, tito, nombre: op.nombre,
    decir, decirYEsperar,
    irA: (id, datos) => irA(id, datos),
    ventana: (ruta, titulo) => {
      enVentana = true;
      teclas.clear();
      op.alVentana({ ruta, titulo });
    },
    ruta2d: (ruta) => op.alRuta?.(ruta),
    hud: (h) => op.alHud(h),
    ganar: (n) => op.ganar(n),
    estrellas: () => op.estrellas(),
    caminarA: (x, z, fn) => {
      pendiente = null;
      alLlegarLibre = fn ?? null;
      destino.set(x, 0, z);
      siguiendo = true;
    },
    enfocar: (o, d = 9) => { enfoque = o ? { p: new THREE.Vector3(o[0], o[1], o[2]), d } : null; },
    efecto,
    luego: (seg, fn) => { if (actual) esperas.push({ t: tiempo + seg, fn, escena: actual.id }); },
    vigente: (id) => actual?.id === id && !cambiando,
    accesorios: () => op.accesorios(),
  };

  const libre = (x: number, z: number) => {
    const e = actual!;
    return x >= e.limites.x0 && x <= e.limites.x1 && z >= e.limites.z0 && z <= e.limites.z1
      && !e.solidos.some((b) => x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1) && (e.libre ? e.libre(x, z) : true);
  };

  function entrar(id: string, datos?: Record<string, unknown>) {
    const anterior = actual;
    if (anterior) {
      anterior.alSalir?.();
      anterior.raiz.visible = false;
    }
    let e = vivas.get(id);
    if (!e) {
      e = catalogo[id]!(ctx);
      e.interactivos.forEach((it, i) => { it.objeto.userData.interactivo = i; });
      escena3.add(e.raiz);
      vivas.set(id, e);
    }
    actual = e;
    e.raiz.visible = true;
    // Luz y fondo del escenario
    const [fa, fb] = e.fondo ?? L.cielo;
    escena3.background = fondo(fa, fb);
    if (e.exterior) {
      hemi.color.set(L.hemiA);
      hemi.groundColor.set(L.hemiB);
      hemi.intensity = L.iHemi;
      sol.color.set(L.sol);
      sol.intensity = L.iSol;
      escena3.environmentIntensity = L.env;
    } else {
      // Adentro siempre hay buena luz; de noche es más cálida (lámparas encendidas).
      hemi.color.set(noche ? "#FFE8C8" : "#FFFFFF");
      hemi.groundColor.set(noche ? "#C9A27A" : "#F1E3D0");
      hemi.intensity = noche ? 1.05 : momento === "tarde" ? 1.2 : 1.3;
      sol.color.set(noche ? "#FFD9A6" : momento === "tarde" ? "#FFDDB0" : "#FFF4E0");
      sol.intensity = noche ? 1.5 : 2.0;
      escena3.environmentIntensity = noche ? 0.3 : 0.45;
    }
    const caja = e.camara.modo === "sala" ? Math.max(e.camara.ancho, e.camara.fondo) * 0.75 : 17;
    Object.assign(sol.shadow.camera, { left: -caja, right: caja, top: caja, bottom: -caja, near: 1, far: 90 });
    sol.shadow.camera.updateProjectionMatrix();
    // El niño y sus amigos aparecen en su lugar
    const desde = datos?.desde as string | undefined;
    const p = (desde && e.puntos?.[desde]) || (datos?.x !== undefined ? { x: datos.x as number, z: datos.z as number } : e.inicio);
    nino.raiz.position.set(p.x, 0, p.z);
    emilia.raiz.position.set(p.x - 1.25, 0, p.z + 0.15);
    tito.raiz.position.set(p.x - 2.1, 0, p.z + 0.4);
    nino.rumbo = emilia.rumbo = tito.rumbo = e.inicio.rumbo ?? 0;
    nino.raiz.rotation.y = emilia.raiz.rotation.y = tito.raiz.rotation.y = nino.rumbo;
    nino.raiz.visible = emilia.raiz.visible = tito.raiz.visible = true;
    nino.sentado = emilia.sentado = false;
    destino.copy(nino.raiz.position);
    rastro = Array.from({ length: 24 }, (_, k) => new THREE.Vector3(p.x - k * 0.22, 0, p.z + 0.2));
    pendiente = null;
    alLlegarLibre = null;
    enfoque = null;
    paseo.set(0, 0, 0);
    zoom = 1;
    siguiendo = true;
    camLista = false;
    op.alHud(null);
    op.alEscena(e.id, e.titulo);
    contenedor.dataset.escena = e.id;
    e.alEntrar?.(datos);
  }

  function irA(id: string, datos?: Record<string, unknown>) {
    if (cambiando || !catalogo[id]) return;
    cambiando = true;
    teclas.clear();
    velo.style.opacity = "1";
    setTimeout(() => {
      if (actual && id !== actual.id && !datos?.volviendo) pila.push(actual.id);
      entrar(id, { desde: actual?.id, ...datos });
      // Un par de cuadros para que el escenario nuevo esté dibujado antes de mostrarlo.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        velo.style.opacity = "0";
        cambiando = false;
      }));
    }, actual ? 330 : 30);
  }

  function volver() {
    if (!actual || cambiando) return;
    const previa = pila.pop() ?? actual.salida;
    if (previa && previa !== actual.id && catalogo[previa]) irA(previa, { volviendo: true });
    else op.alSalir();
  }

  // ---------- Teclado y toques ----------
  const alTecla = (ev: KeyboardEvent) => {
    if (enVentana || cambiando) return;
    const t = ev.target as HTMLElement | null;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    if (TECLAS[ev.key]) {
      ev.preventDefault();
      teclas.add(ev.key);
    } else if ((ev.key === "Enter" || ev.key === " ") && actual) {
      ev.preventDefault();
      const p = nino.raiz.position;
      let mejor: Interactivo | null = null, dMejor = 2.6;
      for (const it of actual.interactivos) {
        const d = Math.hypot(it.llegada.x - p.x, it.llegada.z - p.z);
        if (d < dMejor) {
          dMejor = d;
          mejor = it;
        }
      }
      if (mejor) irAInteractivo(mejor);
    }
  };
  const alSoltarTecla = (ev: KeyboardEvent) => teclas.delete(ev.key);
  const soltarTodo = () => teclas.clear();
  window.addEventListener("keydown", alTecla, true);
  window.addEventListener("keyup", alSoltarTecla, true);
  window.addEventListener("blur", soltarTodo);

  const irAInteractivo = (it: Interactivo) => {
    pendiente = it;
    alLlegarLibre = null;
    destino.set(it.llegada.x, 0, it.llegada.z);
    siguiendo = true;
    enfoque = null;
  };

  const rayo = new THREE.Raycaster();
  const puntero = new THREE.Vector2();
  const planoSuelo = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const golpe = new THREE.Vector3();
  const dedos = new Map<number, { x: number; y: number }>();
  let inicioToque: { x: number; y: number } | null = null;
  let arrastrando = false;
  let pellizco = 0;
  const limitesZoom = (): [number, number] => (actual?.camara.modo === "sigue" ? actual.camara.zoom ?? [0.6, 1.7] : [0.82, 1.12]);
  const zoomA = (z: number) => {
    const [a, b] = limitesZoom();
    zoom = entre(z, a, b);
  };

  const alBajar = (ev: PointerEvent) => {
    try { lienzoGl.setPointerCapture(ev.pointerId); } catch { /* sin captura */ }
    dedos.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (dedos.size === 1) {
      inicioToque = { x: ev.clientX, y: ev.clientY };
      arrastrando = false;
    } else {
      inicioToque = null;
      const [a, b] = [...dedos.values()];
      pellizco = Math.hypot(a!.x - b!.x, a!.y - b!.y);
    }
  };
  const alMover = (ev: PointerEvent) => {
    const antes = dedos.get(ev.pointerId);
    if (!antes) return;
    const ahora = { x: ev.clientX, y: ev.clientY };
    dedos.set(ev.pointerId, ahora);
    if (dedos.size >= 2) {
      const [a, b] = [...dedos.values()];
      const d = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      if (pellizco > 0) zoomA(zoom * (pellizco / d));
      pellizco = d;
      return;
    }
    if (inicioToque && !arrastrando && Math.hypot(ahora.x - inicioToque.x, ahora.y - inicioToque.y) > 12) arrastrando = true;
    if (arrastrando && actual?.camara.modo === "sigue") {
      // El mapa sigue al dedo.
      const k = (2 * actual.camara.dist * zoom * Math.tan((camara.fov * Math.PI) / 360)) / Math.max(1, lienzoGl.clientHeight);
      paseo.x -= (ahora.x - antes.x) * k;
      paseo.z -= (ahora.y - antes.y) * k * 1.3;
      siguiendo = false;
    }
  };
  const subir = (o: THREE.Object3D | null, clave: string): THREE.Object3D | null => {
    while (o && o.userData[clave] === undefined) o = o.parent;
    return o;
  };
  const alSubir = (ev: PointerEvent) => {
    dedos.delete(ev.pointerId);
    if (dedos.size < 2) pellizco = 0;
    if (!inicioToque || arrastrando || dedos.size > 0) {
      if (dedos.size === 0) inicioToque = null;
      return;
    }
    inicioToque = null;
    if (!actual || cambiando || enVentana) return;
    const r = lienzoGl.getBoundingClientRect();
    puntero.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    rayo.setFromCamera(puntero, camara);
    // 1) Los amigos: Emilia celebra, Tito salta.
    const amigo = rayo.intersectObjects([emilia.raiz, tito.raiz, nino.raiz], true)[0];
    if (amigo) {
      const quien = subir(amigo.object, "actor");
      if (quien === emilia.raiz) {
        emilia.celebrando = true;
        setTimeout(() => { emilia.celebrando = false; }, 1700);
        return decir(`¡Me encanta jugar contigo, ${op.nombre}!`);
      }
      if (quien === tito.raiz) {
        tito.saltar();
        efecto("corazones", [tito.raiz.position.x, 1.2, tito.raiz.position.z]);
        return decir("¡Pip! Tito está feliz de pasear contigo.", null);
      }
      if (quien === nino.raiz) return nino.saltar();
    }
    // 2) Algo para usar: camina hasta ahí y lo usa.
    const toque = rayo.intersectObjects(actual.interactivos.map((i) => i.objeto), true)[0];
    if (toque) {
      const o = subir(toque.object, "interactivo");
      if (o) return irAInteractivo(actual.interactivos[o.userData.interactivo as number]!);
    }
    // 3) El suelo: camina hasta el punto tocado.
    if (rayo.ray.intersectPlane(planoSuelo, golpe)) {
      pendiente = null;
      alLlegarLibre = null;
      enfoque = null;
      siguiendo = true;
      const e = actual.limites;
      destino.set(entre(golpe.x, e.x0, e.x1), 0, entre(golpe.z, e.z0, e.z1));
    }
  };
  const alCancelar = (ev: PointerEvent) => {
    dedos.delete(ev.pointerId);
    inicioToque = null;
  };
  const alRueda = (ev: WheelEvent) => {
    ev.preventDefault();
    zoomA(zoom * (ev.deltaY > 0 ? 1.08 : 0.92));
  };
  nino.raiz.userData.actor = emilia.raiz.userData.actor = tito.raiz.userData.actor = true;
  lienzoGl.addEventListener("pointerdown", alBajar);
  lienzoGl.addEventListener("pointermove", alMover);
  lienzoGl.addEventListener("pointerup", alSubir);
  lienzoGl.addEventListener("pointercancel", alCancelar);
  lienzoGl.addEventListener("wheel", alRueda, { passive: false });

  const ajustar = () => {
    const w = contenedor.clientWidth, h = contenedor.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    camara.updateProjectionMatrix();
  };
  ajustar();
  const observador = new ResizeObserver(ajustar);
  observador.observe(contenedor);

  // ---------- Movimiento ----------
  const dir = new THREE.Vector3();
  /** Avanza sin atravesar muebles ni casas (si choca de frente, se desliza por el borde). */
  const avanzar = (p: THREE.Vector3, paso: number) => {
    const nx = p.x + dir.x * paso, nz = p.z + dir.z * paso;
    if (libre(nx, nz)) p.set(nx, 0, nz);
    else if (Math.abs(dir.x) > 0.2 && libre(nx, p.z)) p.x = nx;
    else if (Math.abs(dir.z) > 0.2 && libre(p.x, nz)) p.z = nz;
    else return 0;
    return paso;
  };
  const seguir = (quien: Persona | Animal, hacia: THREE.Vector3, dt: number, vel: number, distMin: number) => {
    const p = quien.raiz.position;
    const d = Math.hypot(hacia.x - p.x, hacia.z - p.z), dNino = Math.hypot(nino.raiz.position.x - p.x, nino.raiz.position.z - p.z);
    if (d < 0.12 || dNino < distMin) {
      quien.velocidad = 0;
      return;
    }
    const paso = Math.min(d, vel * dt);
    p.x += ((hacia.x - p.x) / d) * paso;
    p.z += ((hacia.z - p.z) / d) * paso;
    quien.rumbo = Math.atan2(hacia.x - p.x, hacia.z - p.z);
    quien.velocidad = vel;
  };

  function mover(dt: number) {
    const p = nino.raiz.position;
    let paso = 0;
    let tx = 0, tz = 0;
    for (const k of teclas) {
      tx += TECLAS[k]![0];
      tz += TECLAS[k]![1];
    }
    if ((tx || tz) && !enVentana) {
      dir.set(tx, 0, tz).normalize();
      paso = avanzar(p, VEL * dt);
      destino.copy(p);
      pendiente = null;
      alLlegarLibre = null;
      enfoque = null;
      siguiendo = true;
      if (paso) nino.rumbo = Math.atan2(dir.x, dir.z);
    } else {
      const d = Math.hypot(destino.x - p.x, destino.z - p.z);
      if (d > 0.1) {
        dir.set((destino.x - p.x) / d, 0, (destino.z - p.z) / d);
        paso = avanzar(p, Math.min(d, VEL * dt));
        if (paso) nino.rumbo = Math.atan2(dir.x, dir.z);
        atascado = paso ? 0 : atascado + dt;
        if (atascado > 0.35) {
          // Chocó con algo: si ya está cerca de lo que iba a usar, lo usa igual.
          atascado = 0;
          const cerca = pendiente && d < 2.6;
          destino.copy(p);
          if (!cerca) {
            pendiente = null;
            alLlegarLibre = null;
          }
        }
      } else if (pendiente || alLlegarLibre) {
        const it = pendiente, fn = alLlegarLibre;
        pendiente = null;
        alLlegarLibre = null;
        if (it) {
          const m = it.mira ?? (() => {
            const w = new THREE.Vector3();
            it.objeto.getWorldPosition(w);
            return { x: w.x, z: w.z };
          })();
          nino.mirarA(m.x, m.z);
          quieto = -3; // se queda mirando lo que usa
          it.alLlegar();
        }
        fn?.();
      }
    }
    nino.velocidad = paso ? VEL : 0;
    if (paso && rastro[0]!.distanceTo(p) > 0.22) {
      rastro.unshift(p.clone());
      rastro.pop();
    }
    // Quieto un rato: se da vuelta para mirar a la cámara.
    quieto = paso ? 0 : quieto + dt;
    if (quieto > 0.9 && !nino.sentado) nino.rumbo = 0;
    // Emilia y Tito siguen su camino, sin encimarse.
    seguir(emilia, rastro[6]!, dt, VEL * 1.08, 1.15);
    seguir(tito, rastro[11]!, dt, VEL * 1.12, 1.9);
    if (!emilia.velocidad && quieto > 1.2 && !emilia.sentado) emilia.rumbo = Math.atan2(p.x - emilia.raiz.position.x, p.z - emilia.raiz.position.z) * 0.35;
    if (!tito.velocidad && quieto > 1.5) tito.rumbo = 0.5;
  }

  // ---------- Cámara ----------
  const objetivo = new THREE.Vector3(), ojo = new THREE.Vector3();
  function moverCamara(dt: number) {
    const e = actual!, c = e.camara, p = nino.raiz.position;
    const tanV = Math.tan((camara.fov * Math.PI) / 360);
    if (c.modo === "sigue") {
      if (siguiendo) paseo.multiplyScalar(Math.exp(-dt * 6));
      const fx = entre(p.x + paseo.x, e.limites.x0 + 2, e.limites.x1 - 2), fz = entre(p.z + paseo.z, e.limites.z0 + 1, e.limites.z1);
      paseo.set(fx - p.x, 0, fz - p.z);
      const inc = (c.inclina * Math.PI) / 180, d = c.dist * zoom * (camara.aspect < 1 ? 1.25 : 1);
      objetivo.set(fx, 0.9, fz);
      ojo.set(fx, 0.9 + Math.sin(inc) * d, fz + Math.cos(inc) * d);
    } else {
      const inc = ((c.inclina ?? 19) * Math.PI) / 180;
      const d = Math.max((c.ancho * 0.53) / (tanV * camara.aspect), (c.alto * 0.66) / tanV) * zoom;
      objetivo.set(p.x * 0.12, c.alto * 0.36, c.fondo * 0.42);
      ojo.set(objetivo.x, objetivo.y + Math.sin(inc) * d, objetivo.z + Math.cos(inc) * d);
    }
    if (enfoque) {
      // Se acerca a lo que el niño está usando.
      const k = 0.55;
      ojo.lerp(new THREE.Vector3(enfoque.p.x, enfoque.p.y + enfoque.d * 0.3, enfoque.p.z + enfoque.d), k);
      objetivo.lerp(enfoque.p, k);
    }
    if (!camLista) {
      camPos.copy(ojo);
      camMira.copy(objetivo);
      camLista = true;
    } else {
      const k = 1 - Math.exp(-dt * 5);
      camPos.lerp(ojo, k);
      camMira.lerp(objetivo, k);
    }
    camara.position.copy(camPos);
    camara.lookAt(camMira);
    // El sol sigue a la vista (para que las sombras siempre estén nítidas cerca del niño).
    const cx = c.modo === "sigue" ? camMira.x : 0, cz = c.modo === "sigue" ? camMira.z : c.fondo * 0.5;
    sol.target.position.set(cx, 0, cz);
    sol.position.set(cx - 9, 22, cz + 12);
    relleno.target.position.set(cx, 0, cz);
    relleno.position.set(cx + 12, 10, cz - 14);
  }

  // ---------- Bucle ----------
  let cuadro = 0;
  let cuenta = 0, acumulado = 0, nivelCalidad = 0;
  const animar = () => {
    cuadro = requestAnimationFrame(animar);
    const dt = Math.min(0.05, reloj.getDelta());
    tiempo += dt;
    if (!actual) return;
    if (!cambiando) mover(dt);
    for (let i = esperas.length - 1; i >= 0; i--) {
      const w = esperas[i]!;
      if (w.escena !== actual.id) esperas.splice(i, 1);
      else if (tiempo >= w.t) {
        esperas.splice(i, 1);
        w.fn();
      }
    }
    // Habla quien corresponde, solo mientras se escucha la voz.
    const sonando = vozSonando() || (!hayVoz("es") && tiempo < hablaHasta);
    for (const quien of [emilia, nino]) quien.hablando = sonando && hablante === quien;
    if (hablante && hablante !== emilia && hablante !== nino) hablante.hablando = sonando;
    if (!sonando && hablante && tiempo > hablaHasta) {
      hablante.hablando = false;
      hablante = null;
    }
    nino.actualizar(dt, tiempo);
    emilia.actualizar(dt, tiempo);
    tito.actualizar(dt, tiempo);
    animarAccesorios(nino, tiempo);
    actual.actualizar?.(dt, tiempo);
    // Casas que tapan al niño: se vuelven transparentes.
    if (actual.ocultables) {
      const p = nino.raiz.position;
      for (const o of actual.ocultables) {
        const tapa = p.x > o.x0 - 0.6 && p.x < o.x1 + 0.6 && p.z < o.z1 - 0.4 && p.z > o.z0 - 5.5;
        const v = suave(o.actual ?? 1, tapa ? 0.28 : 1, dt, 8);
        if (Math.abs(v - (o.actual ?? 1)) > 0.002) {
          o.actual = v;
          o.opacidad(v);
        }
      }
    }
    for (let i = chispas.length - 1; i >= 0; i--) {
      const ch = chispas[i]!;
      ch.vida += dt;
      if (ch.vida < 0) continue;
      const u = ch.vida / 1.4;
      if (u >= 1) {
        escena3.remove(ch.s);
        ch.s.material.dispose();
        chispas.splice(i, 1);
        continue;
      }
      ch.s.position.x += ch.vx * dt;
      ch.s.position.y += ch.vy * dt;
      ch.s.position.z += ch.vz * dt;
      ch.s.scale.setScalar(ch.tam * Math.min(1, u * 6) * (1 + Math.sin(u * 9) * 0.08));
      ch.s.material.opacity = u < 0.6 ? 1 : 1 - (u - 0.6) / 0.4;
    }
    moverCamara(dt);
    renderer.render(escena3, camara);
    contenedor.dataset.nino = `${nino.raiz.position.x.toFixed(1)},${nino.raiz.position.z.toFixed(1)}`;
    // Calidad: si el aparato va lento, primero baja la nitidez y después las sombras.
    cuenta++;
    acumulado += dt;
    if (cuenta === 90) {
      const ms = (acumulado / cuenta) * 1000;
      if (ms > 30 && nivelCalidad === 0) {
        nivelCalidad = 1;
        pixeles = Math.min(pixeles, 1.25);
        renderer.setPixelRatio(pixeles);
        ajustar();
      } else if (ms > 38 && nivelCalidad === 1) {
        nivelCalidad = 2;
        renderer.setPixelRatio(1);
        sol.shadow.mapSize.set(1024, 1024);
        sol.shadow.map?.dispose();
        sol.shadow.map = null;
        ajustar();
        op.alLento?.();
      }
      cuenta = 0;
      acumulado = 0;
    }
  };

  entrar(op.escenaInicial && catalogo[op.escenaInicial] ? op.escenaInicial : catalogo.barrio ? "barrio" : Object.keys(catalogo)[0]!);
  requestAnimationFrame(() => requestAnimationFrame(() => { velo.style.opacity = "0"; }));
  animar();

  return {
    destruir() {
      cancelAnimationFrame(cuadro);
      observador.disconnect();
      lienzoGl.removeEventListener("pointerdown", alBajar);
      lienzoGl.removeEventListener("pointermove", alMover);
      lienzoGl.removeEventListener("pointerup", alSubir);
      lienzoGl.removeEventListener("pointercancel", alCancelar);
      lienzoGl.removeEventListener("wheel", alRueda);
      window.removeEventListener("keydown", alTecla, true);
      window.removeEventListener("keyup", alSoltarTecla, true);
      window.removeEventListener("blur", soltarTodo);
      actual?.alSalir?.();
      liberarTodo(escena3);
      fondos.forEach((t) => t.dispose());
      texEfecto.forEach((t) => t.dispose());
      entorno.dispose();
      pmrem.dispose();
      renderer.dispose();
      lienzoGl.remove();
      velo.remove();
    },
    irA,
    volver,
    accion: (id) => actual?.alAccion?.(id),
    cerrarVentana() {
      enVentana = false;
      enfoque = null;
      actual?.alEvento?.("ventana-cerrada");
    },
    refrescar: vestir,
    evento: (ev, dato) => actual?.alEvento?.(ev, dato),
    escena: () => actual?.id ?? "",
    celebrar() {
      nino.celebrando = emilia.celebrando = true;
      tito.saltar();
      efecto("estrellas", [nino.raiz.position.x, 2.4, nino.raiz.position.z]);
      setTimeout(() => { nino.celebrando = emilia.celebrando = false; }, 1800);
    },
    carga: () => ({ dibujos: renderer.info.render.calls, triangulos: renderer.info.render.triangles }),
  };
}
