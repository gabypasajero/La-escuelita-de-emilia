import AsyncStorage from "@react-native-async-storage/async-storage";

/** Guarda y recupera cosas del juego en el aparato (el huerto, los dibujos), una por niño. */
export async function leer<T>(clave: string, porDefecto: T): Promise<T> {
  try {
    const t = await AsyncStorage.getItem(`escuelita:${clave}`);
    return t ? (JSON.parse(t) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

export async function guardar(clave: string, valor: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(`escuelita:${clave}`, JSON.stringify(valor));
    return true;
  } catch {
    return false; // memoria llena o modo privado: el juego sigue igual
  }
}
