import type { ObjectId } from "mongodb";

/** Categorías de componente que maneja el catálogo y el cotizador. */
export const COMPONENT_CATEGORIES = [
  "Procesador",
  "Grafica",
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
] as const;

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];

/** Cómo se ingresa el precio de CPU/GPU: en dólares (se convierte) o fijo en pesos. */
export type PriceMode = "USD" | "COP";

export interface Settings {
  _id?: ObjectId;
  trmScrapeado: number; // último TRM oficial (Superfinanciera, vía cron)
  trmRecargo: number; // se suma al automático (148)
  trmManual: number | null; // override manual opcional (tiene prioridad)
  trmActualizado: Date | null; // cuándo se trajo el TRM automático
  envioCPU: number; // envío casillero procesadores (110000)
  envioGPU: number; // envío casillero gráficas (170000)
  servicioBase: number; // valor base del servicio de ensamble (200000)
  mediosPago: {
    tarjeta: number; // 0.06
    pse: number; // 0.03
    breB: number; // 0 (Bre-B no cobra comisión); también aplica a Daviplata
  };
  contacto: {
    whatsapp: string;
    email: string;
  };
  // Frases que el wordmark "B & W" revela y rota (B…& W…). Editables en el admin.
  wordmarkPhrases: { left: string; right: string }[];
  actualizado: Date;
}

export interface Processor {
  _id?: ObjectId;
  modelo: string; // "Ryzen 7600x"
  marca: "AMD" | "Intel";
  modoPrecio: PriceMode;
  baseUsd: number | null; // si modoPrecio = USD
  precioManualCop: number | null; // si modoPrecio = COP
  activo: boolean;
  actualizado: Date;
}

export type GpuBrand = "AMD" | "NVIDIA" | "Intel";

export interface Graphic {
  _id?: ObjectId;
  modelo: string; // "RX 9060 XT 16gb"
  marca: GpuBrand; // chip: NVIDIA / AMD / Intel
  ensambladora: string; // AIB: MSI, ASUS, Gigabyte, Zotac… (opcional)
  modoPrecio: PriceMode;
  baseUsd: number | null;
  precioManualCop: number | null;
  activo: boolean;
  actualizado: Date;
}

export interface ComponentItem {
  _id?: ObjectId;
  categoria: ComponentCategory;
  marca: string;
  modelo: string;
  descripcion: string;
  precioCop: number; // precio directo (Amazon Colombia)
  activo: boolean;
  actualizado: Date;
}

export interface CategoryAverage {
  _id?: ObjectId;
  categoria: ComponentCategory;
  promedioCop: number; // valor de referencia para el estimado público
}

/** Opción/gama de una categoría en el cotizador público (ej. "Gama media", precio). */
export interface CategoryOption {
  label: string;
  precioCop: number;
}

export interface CategoryOptions {
  _id?: ObjectId;
  categoria: ComponentCategory;
  opciones: CategoryOption[];
}

export interface QuoteOption {
  titulo: string; // "Opción 1"
  items: Array<{
    categoria: ComponentCategory;
    modelo: string;
    precioCop: number;
    descripcion: string;
  }>;
  servicio: number;
  totales: { base: number; conTarjeta: number; conPse: number };
}

export interface Quote {
  _id?: ObjectId;
  codigo: string; // "2025-30"
  fecha: Date;
  cliente: string | null;
  opciones: QuoteOption[];
  creado: Date;
}

export interface Admin {
  _id?: ObjectId;
  usuario: string;
  passwordHash: string;
  creado: Date;
}
