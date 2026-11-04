import type { Aleatorio, Nivel } from "../tipos";
import { elegir, opcionesCon } from "../juegos/azar";
import { OPCIONES_POR_NIVEL } from "../juegos/dificultad";
import { PALABRAS_INGLES, palabrasDelTema, rondaIngles, type PalabraIngles, type RondaIngles, type TemaIngles } from "./ingles";

/**
 * Los amigos de otros países (ver docs/IDIOMAS.md): Max (inglés), Bia
 * (portugués de Brasil), Léa (francés) y Xiao Lin (chino mandarín).
 * Todos juegan los mismos 6 juegos del nivel «Hello» con las mismas 41
 * palabras; cambia el idioma. Cada amigo habla solo su idioma; la ayuda de
 * Emilia es en español.
 */
export type IdiomaAmigo = "en" | "pt" | "fr" | "zh";

interface Lengua {
  /** Cómo se dice cada palabra (por id). Animales y cuerpo llevan su artículo o posesivo. */
  palabras: Record<string, string>;
  sonidos: Record<string, string>;
  /** Lo que pide el amigo en cada juego. */
  pedir: Record<TemaIngles, (x: string, id: string) => string>;
  /** Lo que agrega después del elogio al acertar. */
  confirmar: Record<TemaIngles, (x: string, id: string) => string>;
  elogios: string[];
  otraVez: string;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const PORTUGUES: Lengua = {
  palabras: {
    hello: "Olá!", "good-morning": "Bom dia!", "good-night": "Boa noite!", "thank-you": "Obrigada!", "i-love-you": "Eu te amo!", "happy-birthday": "Feliz aniversário!",
    red: "vermelho", blue: "azul", yellow: "amarelo", green: "verde", orange: "laranja", purple: "roxo", pink: "rosa", black: "preto", white: "branco",
    one: "um", two: "dois", three: "três", four: "quatro", five: "cinco",
    cow: "a vaca", dog: "o cachorro", cat: "o gato", duck: "o pato", pig: "o porco", horse: "o cavalo", sheep: "a ovelha", chicken: "a galinha",
    nose: "o nariz", eyes: "os olhos", ears: "as orelhas", mouth: "a boca", hands: "as mãos", feet: "os pés",
    clap: "Bata palmas!", jump: "Pule!", wave: "Dê tchau!", dance: "Dance!", sleep: "Durma!", run: "Corra!", eat: "Coma!",
  },
  sonidos: { cow: "Muuu!", dog: "Au au!", cat: "Miau!", duck: "Quá quá!", pig: "Oinc oinc!", horse: "Iiirrí!", sheep: "Méé!", chicken: "Có có có!" },
  pedir: {
    saludos: (x) => x,
    colores: (x) => `Toque no ${x}!`,
    numeros: (x) => `Mostre o ${x}!`,
    animales: (x) => `Cadê ${x}?`,
    cuerpo: (x) => `Mostre ${x}!`,
    acciones: (x) => `A Bia diz: ${x}`,
  },
  confirmar: {
    saludos: (x) => x,
    colores: (x) => `${cap(x)}!`,
    numeros: (x) => `${cap(x)}!`,
    animales: (x, id) => `${cap(x)}! ${PORTUGUES.sonidos[id] ?? ""}`.trim(),
    cuerpo: (x) => `${cap(x)}!`,
    acciones: (x) => x,
  },
  elogios: ["Muito bem!", "Isso!", "Parabéns!", "Que legal!", "Arrasou!"],
  otraVez: "Ops! Tente de novo!",
};

const FRANCES: Lengua = {
  palabras: {
    hello: "Salut !", "good-morning": "Bonjour !", "good-night": "Bonne nuit !", "thank-you": "Merci !", "i-love-you": "Je t'aime !", "happy-birthday": "Joyeux anniversaire !",
    red: "le rouge", blue: "le bleu", yellow: "le jaune", green: "le vert", orange: "l'orange", purple: "le violet", pink: "le rose", black: "le noir", white: "le blanc",
    one: "un", two: "deux", three: "trois", four: "quatre", five: "cinq",
    cow: "la vache", dog: "le chien", cat: "le chat", duck: "le canard", pig: "le cochon", horse: "le cheval", sheep: "le mouton", chicken: "la poule",
    nose: "ton nez", eyes: "tes yeux", ears: "tes oreilles", mouth: "ta bouche", hands: "tes mains", feet: "tes pieds",
    clap: "Tape des mains !", jump: "Saute !", wave: "Dis au revoir !", dance: "Danse !", sleep: "Dors !", run: "Cours !", eat: "Mange !",
  },
  sonidos: { cow: "Meuh !", dog: "Ouaf ouaf !", cat: "Miaou !", duck: "Coin coin !", pig: "Groin groin !", horse: "Hiiii !", sheep: "Bêê !", chicken: "Cot cot !" },
  pedir: {
    saludos: (x) => x,
    colores: (x) => `Touche ${x} !`,
    numeros: (x) => `Montre-moi le ${x} !`,
    animales: (x) => `Où est ${x} ?`,
    cuerpo: (x) => `Touche ${x} !`,
    acciones: (x) => `Léa dit : ${x}`,
  },
  confirmar: {
    saludos: (x) => x,
    colores: (x) => `${cap(x)} !`,
    numeros: (x) => `${cap(x)} !`,
    animales: (x, id) => `${cap(x)} ! ${FRANCES.sonidos[id] ?? ""}`.trim(),
    cuerpo: (x) => `${cap(x)} !`,
    acciones: (x) => x,
  },
  elogios: ["Bravo !", "Très bien !", "Super !", "Génial !", "Oui !"],
  otraVez: "Oups ! Essaie encore !",
};

/** Cuántas estrellas: en chino se dice 两 (no 二) antes del clasificador. */
const ESTRELLAS_ZH: Record<string, string> = { one: "一颗", two: "两颗", three: "三颗", four: "四颗", five: "五颗" };

const CHINO: Lengua = {
  palabras: {
    hello: "你好！", "good-morning": "早上好！", "good-night": "晚安！", "thank-you": "谢谢！", "i-love-you": "我爱你！", "happy-birthday": "生日快乐！",
    red: "红色", blue: "蓝色", yellow: "黄色", green: "绿色", orange: "橙色", purple: "紫色", pink: "粉色", black: "黑色", white: "白色",
    one: "一", two: "二", three: "三", four: "四", five: "五",
    cow: "牛", dog: "狗", cat: "猫", duck: "鸭子", pig: "猪", horse: "马", sheep: "羊", chicken: "鸡",
    nose: "鼻子", eyes: "眼睛", ears: "耳朵", mouth: "嘴巴", hands: "手", feet: "脚",
    clap: "拍拍手！", jump: "跳一跳！", wave: "挥挥手，说再见！", dance: "跳跳舞！", sleep: "睡觉！", run: "跑一跑！", eat: "吃饭！",
  },
  sonidos: { cow: "哞哞！", dog: "汪汪！", cat: "喵喵！", duck: "嘎嘎！", pig: "哼哼！", horse: "咴咴！", sheep: "咩咩！", chicken: "咯咯哒！" },
  pedir: {
    saludos: (x) => x,
    colores: (x) => `${x}在哪里？`,
    numeros: (_x, id) => `哪里有${ESTRELLAS_ZH[id]}星星？`,
    animales: (x) => `${x}在哪里？`,
    cuerpo: (x) => `摸摸你的${x}！`,
    acciones: (x) => `小林说：${x}`,
  },
  confirmar: {
    saludos: (x) => x,
    colores: (x) => `${x}！`,
    numeros: (_x, id) => `${ESTRELLAS_ZH[id]}星星！`,
    animales: (x, id) => `${x}！${CHINO.sonidos[id] ?? ""}`,
    cuerpo: (x) => `${x}！`,
    acciones: (x) => x,
  },
  elogios: ["真棒！", "很好！", "太好了！", "对了！", "好厉害！"],
  otraVez: "哎呀！再试一次！",
};

export const LENGUAS: Record<Exclude<IdiomaAmigo, "en">, Lengua> = { pt: PORTUGUES, fr: FRANCES, zh: CHINO };

export const NOMBRE_AMIGO: Record<IdiomaAmigo, string> = { en: "Max", pt: "Bia", fr: "Léa", zh: "Xiao Lin" };

/** Cómo se dice una palabra en el idioma de un amigo. */
export function palabraEn(idioma: IdiomaAmigo, id: string): string {
  if (idioma === "en") return PALABRAS_INGLES.find((p) => p.id === id)?.en ?? id;
  return LENGUAS[idioma].palabras[id] ?? id;
}

const AYUDA: Record<TemaIngles, (nombre: string, es: string) => string> = {
  saludos: (n, es) => `${n} dijo «${es}». ¿Qué dibujo es?`,
  colores: (n, es) => `${n} quiere que toques el ${es}.`,
  numeros: (n, es) => `${n} quiere ${es}. ¡Cuenta las estrellas!`,
  animales: (n, es) => `${n} busca ${es}.`,
  cuerpo: (n, es) => `${n} dice: toca ${es}.`,
  acciones: (n, es) => `${n} dice que hay que ${es}. ¡Hazlo tú también!`,
};

/**
 * Una ronda de "escucha y toca" con cualquier amigo. Las opciones son las
 * mismas palabras (con su dibujo) para todos los idiomas.
 */
export function rondaAmigo(idioma: IdiomaAmigo, tema: TemaIngles, nivel: Nivel, azar: Aleatorio = Math.random): RondaIngles {
  if (idioma === "en") return rondaIngles(tema, nivel, azar);
  const lengua = LENGUAS[idioma];
  const universo: PalabraIngles[] = palabrasDelTema(tema);
  const correcta = elegir(universo, azar);
  const opciones = opcionesCon(correcta, universo, OPCIONES_POR_NIVEL[nivel] + 1, azar);
  const x = lengua.palabras[correcta.id]!;
  return {
    enunciado: lengua.pedir[tema](x, correcta.id),
    opciones,
    correcta,
    ayuda: AYUDA[tema](NOMBRE_AMIGO[idioma], correcta.es),
    felicitacion: `${elegir(lengua.elogios, azar)} ${lengua.confirmar[tema](x, correcta.id)}`,
  };
}

/** "Try again" en el idioma de cada amigo. */
export const OTRA_VEZ: Record<IdiomaAmigo, string> = { en: "Oops! Try again!", pt: PORTUGUES.otraVez, fr: FRANCES.otraVez, zh: CHINO.otraVez };
