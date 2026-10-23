/**
 * El Huerto de Don Pedro: sembrar es una secuencia de pasos. El niño elige la
 * herramienta correcta para cada etapa; si se equivoca, recibe una pista y la
 * planta no retrocede (nunca se pierde lo avanzado).
 */
export type EtapaPlanta = "tierra" | "hoyo" | "semilla" | "tapada" | "regada" | "brote" | "flor";
export type Herramienta = "pala" | "semilla" | "manos" | "regadera" | "sol";

interface Paso {
  necesita: Herramienta;
  siguiente: EtapaPlanta;
  /** Lo que dice Don Pedro al acertar. */
  frase: string;
  /** Pista si el niño elige otra herramienta. */
  pista: string;
}

export const PASOS_HUERTO: Record<Exclude<EtapaPlanta, "flor">, Paso> = {
  tierra: { necesita: "pala", siguiente: "hoyo", frase: "¡Un hoyito perfecto!", pista: "Primero hacemos un hoyito. ¿Con qué cavamos?" },
  hoyo: { necesita: "semilla", siguiente: "semilla", frase: "¡La semilla ya está en su casita!", pista: "El hoyito está listo. ¿Qué ponemos adentro?" },
  semilla: { necesita: "manos", siguiente: "tapada", frase: "La tapamos con cariño.", pista: "Ahora la tapamos con tierra, con las manos." },
  tapada: { necesita: "regadera", siguiente: "regada", frase: "¡Glu, glu! Un poquito de agua.", pista: "La semilla tiene sed. ¿Qué le damos?" },
  regada: { necesita: "sol", siguiente: "brote", frase: "¡Mira, salió un brote!", pista: "Ahora necesita la luz del sol." },
  brote: { necesita: "regadera", siguiente: "flor", frase: "¡Creció una flor! Con paciencia todo crece.", pista: "Un poquito más de agua para que crezca." },
};

export const HERRAMIENTAS: Herramienta[] = ["pala", "semilla", "manos", "regadera", "sol"];

export interface ResultadoHuerto {
  etapa: EtapaPlanta;
  acierto: boolean;
  frase: string;
}

export function usarHerramienta(etapa: EtapaPlanta, herramienta: Herramienta): ResultadoHuerto {
  if (etapa === "flor") return { etapa, acierto: true, frase: "¡Ya floreció! ¿Plantamos otra?" };
  const paso = PASOS_HUERTO[etapa];
  if (paso.necesita !== herramienta) return { etapa, acierto: false, frase: paso.pista };
  return { etapa: paso.siguiente, acierto: true, frase: paso.frase };
}
