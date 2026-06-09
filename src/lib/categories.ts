import type { ComponentCategory } from "@/lib/db/types";

/** Etiquetas legibles por categoría. */
export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  Procesador: "Procesador",
  Grafica: "Gráfica",
  Board: "Board",
  Ram: "RAM",
  Almacenamiento: "Almacenamiento",
  Fuente: "Fuente",
  Chasis: "Chasis",
  RefrigeracionProce: "Refrigeración CPU",
  Refrigeracion: "Refrigeración chasis",
  Mouse: "Mouse",
  Teclado: "Teclado",
  Monitor: "Monitor",
  Audifonos: "Audífonos",
};

/**
 * Categorías que se gestionan en la sección "Componentes" (catálogo en COP).
 * Procesador y Gráfica tienen sus propias secciones (precio en USD con TRM).
 */
export const CATALOG_CATEGORIES: ComponentCategory[] = [
  "Board",
  "Ram",
  "Almacenamiento",
  "Fuente",
  "Chasis",
  "RefrigeracionProce",
  "Refrigeracion",
  "Mouse",
  "Teclado",
  "Monitor",
  "Audifonos",
];

/**
 * Categorías que el cotizador público puede incluir en su estimado aproximado.
 * Cada una tiene un precio promedio editable (colección categoryAverages).
 */
export const ESTIMATOR_CATEGORIES: ComponentCategory[] = [
  "Procesador",
  "Grafica",
  "Board",
  "Ram",
  "Almacenamiento",
  "Fuente",
  "Chasis",
  "RefrigeracionProce",
  "Refrigeracion",
];
