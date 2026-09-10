/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
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
  Combo: "Combo",
};

/**
 * Categorías que se gestionan en la sección "Componentes" (catálogo en COP).
 * Procesador y Gráfica tienen sus propias secciones (precio en USD con TRM).
 * "Combo" es varias piezas vendidas como un solo ítem con un solo precio
 * (ej. board+ram+fuente) — no entra al cotizador público por categoría.
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
  "Combo",
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

/**
 * Opciones/gamas por defecto del cotizador (editable en el admin).
 * El cliente elige UNA opción por categoría; cada una tiene su precio promedio.
 */
export const DEFAULT_ESTIMATOR_OPTIONS: Record<
  string,
  { label: string; precioCop: number }[]
> = {
  Procesador: [
    { label: "Gama baja · Core i3 / Ryzen 3", precioCop: 450000 },
    { label: "Gama media · Core i5 / Ryzen 5", precioCop: 750000 },
    { label: "Gama alta · Core i7 / Ryzen 7", precioCop: 1200000 },
    { label: "Tope · Core i9 / Ryzen 9", precioCop: 2100000 },
  ],
  Grafica: [
    { label: "Gama baja", precioCop: 1100000 },
    { label: "Gama media", precioCop: 1700000 },
    { label: "Gama alta", precioCop: 2800000 },
  ],
  Board: [
    { label: "Gama baja", precioCop: 380000 },
    { label: "Gama media", precioCop: 560000 },
    { label: "Gama alta", precioCop: 850000 },
  ],
  Ram: [
    { label: "16GB sin RGB", precioCop: 280000 },
    { label: "32GB sin RGB", precioCop: 520000 },
    { label: "32GB con RGB", precioCop: 650000 },
  ],
  Almacenamiento: [
    { label: "SSD 500GB", precioCop: 180000 },
    { label: "SSD 1TB", precioCop: 320000 },
    { label: "SSD 2TB", precioCop: 600000 },
  ],
  Fuente: [
    { label: "80+ Bronze", precioCop: 230000 },
    { label: "80+ Silver", precioCop: 320000 },
    { label: "80+ Gold / Platinum", precioCop: 450000 },
  ],
  Chasis: [
    { label: "Básico", precioCop: 180000 },
    { label: "Buen flujo de aire", precioCop: 320000 },
    { label: "Premium", precioCop: 550000 },
  ],
  RefrigeracionProce: [
    { label: "Aire", precioCop: 130000 },
    { label: "Líquida 240mm", precioCop: 350000 },
  ],
  Refrigeracion: [
    { label: "2 ventiladores", precioCop: 80000 },
    { label: "Kit 4-6 ventiladores", precioCop: 180000 },
  ],
};
