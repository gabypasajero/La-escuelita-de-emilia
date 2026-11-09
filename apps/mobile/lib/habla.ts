import { useEffect, useState } from "react";
import { alCambiarVoz, hayVoz, vozSonando } from "./voz";

/**
 * Si la voz se está escuchando en este momento. Sirve para que los personajes
 * muevan la boca solo mientras de verdad hablan. Si el aparato no tiene voz,
 * se responde que sí para que igual gesticulen mientras dura el globo.
 */
export function useVozActiva() {
  const [sonando, setSonando] = useState(vozSonando());
  useEffect(() => alCambiarVoz(setSonando), []);
  return sonando || !hayVoz("es");
}
