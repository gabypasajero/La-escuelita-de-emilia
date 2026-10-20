export interface Producto {
  id: string;
  nombre: string;
  articulo: "un" | "una";
  /** Plural para la consigna: "Pon 3 manzanas en la canasta". */
  plural: string;
  emoji: string;
}

export const PRODUCTOS: Producto[] = [
  { id: "manzana", articulo: "una", nombre: "manzana", plural: "manzanas", emoji: "🍎" },
  { id: "platano", articulo: "un", nombre: "plátano", plural: "plátanos", emoji: "🍌" },
  { id: "zanahoria", articulo: "una", nombre: "zanahoria", plural: "zanahorias", emoji: "🥕" },
  { id: "pan", articulo: "un", nombre: "pan", plural: "panes", emoji: "🍞" },
  { id: "queso", articulo: "un", nombre: "queso", plural: "quesos", emoji: "🧀" },
  { id: "huevo", articulo: "un", nombre: "huevo", plural: "huevos", emoji: "🥚" },
  { id: "uva", articulo: "una", nombre: "uva", plural: "uvas", emoji: "🍇" },
  { id: "palta", articulo: "una", nombre: "palta", plural: "paltas", emoji: "🥑" },
];
