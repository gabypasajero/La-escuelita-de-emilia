import type { IdiomaAmigo, TemaIngles } from "@escuelita/core";
import type { ComponentType } from "react";
import { BiaDibujo, LeaDibujo, XiaoLinDibujo } from "../components/Amigos";
import { MaxDibujo } from "../components/Personajes";

/**
 * Los amigos de otros países: quiénes son y todo lo que dicen fuera de los
 * juegos (paradero y casa). Cada uno habla solo su idioma; Emilia los presenta
 * en español. Las frases de los juegos están en packages/core (amigos.ts).
 */
export type AmigoId = "max" | "bia" | "lea" | "xiaolin";

export interface Amigo {
  id: AmigoId;
  nombre: string;
  idioma: IdiomaAmigo;
  /** "inglés", "portugués"… (para Emilia). */
  lengua: string;
  bandera: string;
  /** Él o ella (para las frases de Emilia). */
  el: "él" | "ella";
  color: string;
  fondo: string;
  Dibujo: ComponentType<{ alto?: number; saludando?: boolean }>;
  /** Lo que dice al bajar del bus. */
  hola: string;
  presentarse: (nino: string) => string;
  /** Emilia lo presenta la primera vez (en español). */
  presentacion: string;
  invitar: string;
  deNuevo: (nino: string) => string;
  /** Al tocarlo. */
  toques: (nino: string) => string[];
  bienvenida: string;
  globoCasa: string;
  /** Nombre de cada juego y lo que dice el amigo al entrar (en su idioma). */
  juegos: Record<TemaIngles, { nombre: string; frase: string }>;
}

export const AMIGOS: Amigo[] = [
  {
    id: "max", nombre: "Max", idioma: "en", lengua: "inglés", bandera: "🇺🇸", el: "él", color: "#1E88E5", fondo: "#E3F2FD", Dibujo: MaxDibujo,
    hola: "Hello!",
    presentarse: (n) => `Hello! I'm Max! Hello, ${n}!`,
    presentacion: "Es Max. Viene de Estados Unidos y habla inglés, otro idioma. ¡Escuchemos bien y juguemos con él!",
    invitar: "Come to my house! Let's play!",
    deNuevo: (n) => `Hello again, ${n}!`,
    toques: (n) => [`Hello, ${n}!`, "High five!", "I like animals!", "Let's play!", "You are my friend!"],
    bienvenida: "Welcome to my house! What do you want to play?",
    globoCasa: "Welcome to my house!",
    juegos: {
      saludos: { nombre: "Hello!", frase: "Hello! Good morning!" },
      colores: { nombre: "Colors", frase: "Let's play with colors!" },
      numeros: { nombre: "Numbers", frase: "Let's count! One, two, three!" },
      animales: { nombre: "Animals", frase: "I love animals! Moo!" },
      cuerpo: { nombre: "My body", frase: "Touch your nose!" },
      acciones: { nombre: "Max says", frase: "Max says: jump!" },
    },
  },
  {
    id: "bia", nombre: "Bia", idioma: "pt", lengua: "portugués", bandera: "🇧🇷", el: "ella", color: "#43A047", fondo: "#E8F5E9", Dibujo: BiaDibujo,
    hola: "Olá!",
    presentarse: (n) => `Olá! Eu sou a Bia! Olá, ${n}!`,
    presentacion: "Es Bia. Viene de Brasil y habla portugués. ¡Escuchemos bien y juguemos con ella!",
    invitar: "Vem para a minha casa! Vamos brincar!",
    deNuevo: (n) => `Olá de novo, ${n}!`,
    toques: (n) => [`Olá, ${n}!`, "Toca aqui!", "Eu adoro cantar!", "Vamos dançar!", "Você é muito legal!"],
    bienvenida: "Que bom que você veio! Do que você quer brincar?",
    globoCasa: "Que bom que você veio!",
    juegos: {
      saludos: { nombre: "Olá!", frase: "Olá! Bom dia!" },
      colores: { nombre: "Cores", frase: "Vamos brincar com as cores!" },
      numeros: { nombre: "Números", frase: "Vamos contar! Um, dois, três!" },
      animales: { nombre: "Animais", frase: "Eu adoro os animais! Muuu!" },
      cuerpo: { nombre: "Meu corpo", frase: "Mostre o nariz!" },
      acciones: { nombre: "A Bia diz", frase: "A Bia diz: pule!" },
    },
  },
  {
    id: "lea", nombre: "Léa", idioma: "fr", lengua: "francés", bandera: "🇫🇷", el: "ella", color: "#C62828", fondo: "#FDECEA", Dibujo: LeaDibujo,
    hola: "Bonjour !",
    presentarse: (n) => `Bonjour ! Je m'appelle Léa ! Salut, ${n} !`,
    presentacion: "Es Léa. Viene de Francia y habla francés. ¡Escuchemos bien y juguemos con ella!",
    invitar: "Viens chez moi ! On joue ?",
    deNuevo: (n) => `Coucou, ${n} ! Te revoilà !`,
    toques: (n) => [`Coucou, ${n} !`, "Tape là !", "J'adore peindre !", "On danse ?", "Tu es super !"],
    bienvenida: "Bienvenue chez moi ! À quoi tu veux jouer ?",
    globoCasa: "Bienvenue chez moi !",
    juegos: {
      saludos: { nombre: "Salut !", frase: "Salut ! Bonjour !" },
      colores: { nombre: "Couleurs", frase: "On joue avec les couleurs !" },
      numeros: { nombre: "Nombres", frase: "On compte ! Un, deux, trois !" },
      animales: { nombre: "Animaux", frase: "J'adore les animaux ! Meuh !" },
      cuerpo: { nombre: "Mon corps", frase: "Touche ton nez !" },
      acciones: { nombre: "Léa dit", frase: "Léa dit : saute !" },
    },
  },
  {
    id: "xiaolin", nombre: "Xiao Lin", idioma: "zh", lengua: "chino", bandera: "🇨🇳", el: "él", color: "#D32F2F", fondo: "#FFF8E1", Dibujo: XiaoLinDibujo,
    hola: "你好！",
    presentarse: (n) => `你好！我叫小林！你好，${n}！`,
    presentacion: "Es Xiao Lin. Viene de China y habla chino. ¡Escuchemos bien y juguemos con él!",
    invitar: "来我家玩吧！",
    deNuevo: (n) => `${n}，又见面了！`,
    toques: (n) => [`你好，${n}！`, "击个掌！", "我喜欢数字！一，二，三！", "我们一起玩吧！", "你真棒！"],
    bienvenida: "欢迎来我家！你想玩什么？",
    globoCasa: "欢迎来我家！",
    juegos: {
      saludos: { nombre: "你好！", frase: "你好！早上好！" },
      colores: { nombre: "颜色", frase: "我们来玩颜色吧！" },
      numeros: { nombre: "数字", frase: "我们来数数！一，二，三！" },
      animales: { nombre: "动物", frase: "我喜欢动物！哞哞！" },
      cuerpo: { nombre: "我的身体", frase: "摸摸你的鼻子！" },
      acciones: { nombre: "小林说", frase: "小林说：跳一跳！" },
    },
  },
];

export const amigoPorId = (id: string | undefined) => AMIGOS.find((a) => a.id === id);

/** Explicación de Emilia (en español) la primera vez que se entra a cada juego. */
export function explicacion(a: Amigo, tema: TemaIngles): string {
  const n = a.nombre;
  switch (tema) {
    case "saludos": return `${n} te va a saludar en ${a.lengua}. Toca el dibujo de lo que dice.`;
    case "colores": return `${n} va a decir un color en ${a.lengua}. ¡Toca ese color!`;
    case "numeros": return `${n} va a decir un número en ${a.lengua}. Toca el grupo con esas estrellas.`;
    case "animales": return `${n} busca animales de la granja. Escucha y toca el animal.`;
    case "cuerpo": return `${n} va a nombrar partes del cuerpo. Tócalas en tu cuerpo y después en el dibujo.`;
    case "acciones": return `¡${n} dice! Haz lo que dice ${n} y después toca el dibujo.`;
  }
}

export const TEMAS_AMIGO: Array<{ tema: TemaIngles; emoji: string; color: string; fondo: string }> = [
  { tema: "saludos", emoji: "👋", color: "#26A69A", fondo: "#E0F2F1" },
  { tema: "colores", emoji: "🎨", color: "#EC407A", fondo: "#FCE4EC" },
  { tema: "numeros", emoji: "🔢", color: "#66BB6A", fondo: "#E8F5E9" },
  { tema: "animales", emoji: "🐮", color: "#8D6E63", fondo: "#EFEBE9" },
  { tema: "cuerpo", emoji: "👃", color: "#FFA726", fondo: "#FFF3E0" },
  { tema: "acciones", emoji: "👏", color: "#5C6BC0", fondo: "#E8EAF6" },
];
