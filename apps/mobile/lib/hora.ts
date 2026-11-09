import { useEffect, useState } from "react";

/**
 * La luz de todos los escenarios sigue la hora real del dispositivo:
 * amanecer (6–8), día (8–18), tarde (18–20) y noche (20–6).
 * Para probar, en la web se puede abrir con ?hora=21 (o cualquier hora 0–23).
 */
export type Momento = "amanecer" | "dia" | "tarde" | "noche";

export function momentoDelDia(h: number): Momento {
  if (h >= 6 && h < 8) return "amanecer";
  if (h >= 8 && h < 18) return "dia";
  if (h >= 18 && h < 20) return "tarde";
  return "noche";
}

/** Hora de prueba leída una sola vez al abrir la app (antes de que la navegación cambie la URL). */
const HORA_FORZADA: number | null = (() => {
  try {
    const q = (globalThis as { location?: { search?: string } }).location?.search ?? "";
    const m = /[?&]hora=(\d{1,2})/.exec(q);
    return m ? Number(m[1]) % 24 : null;
  } catch {
    return null;
  }
})();

export function horaActual() {
  return HORA_FORZADA ?? new Date().getHours();
}

/** Momento del día actual; se revisa cada minuto. */
export function useMomento(): Momento {
  const [m, setM] = useState<Momento>(() => momentoDelDia(horaActual()));
  useEffect(() => {
    const t = setInterval(() => setM(momentoDelDia(horaActual())), 60000);
    return () => clearInterval(t);
  }, []);
  return m;
}

/** Velo de color sobre el escenario (afuera más fuerte, adentro más suave porque hay luz). */
export const TINTE: Record<Momento, { color: string; exterior: number; interior: number }> = {
  amanecer: { color: "#FF8A80", exterior: 0.12, interior: 0.06 },
  dia: { color: "#fff", exterior: 0, interior: 0 },
  tarde: { color: "#FF9800", exterior: 0.16, interior: 0.08 },
  noche: { color: "#1A237E", exterior: 0.36, interior: 0.2 },
};

/** Color del cielo que se ve por una ventana. */
export const CIELO_VENTANA: Record<Momento, string> = {
  amanecer: "#FFCCBC",
  dia: "#B3E5FC",
  tarde: "#FFB74D",
  noche: "#1A237E",
};

/** Color del sol (o la luna) que se ve por una ventana. */
export const ASTRO_VENTANA: Record<Momento, string> = {
  amanecer: "#FF9800",
  dia: "#FFEB3B",
  tarde: "#FF7043",
  noche: "#FFF9C4",
};
