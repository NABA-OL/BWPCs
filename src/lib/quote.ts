import type { ComponentCategory, Settings } from "@/lib/db/types";
import { paymentTotals } from "@/lib/pricing";

/** Ítem de una opción de cotización (forma serializable usada en el builder). */
export interface QuoteItemInput {
  categoria: ComponentCategory;
  modelo: string;
  precioCop: number;
  descripcion: string;
}

export interface QuoteOptionInput {
  titulo: string;
  items: QuoteItemInput[];
  servicio: number;
}

export interface QuoteInput {
  codigo: string;
  cliente: string;
  fecha: string; // ISO yyyy-mm-dd
  opciones: QuoteOptionInput[];
}

/** Totales de una opción: subtotal de ítems + servicio, con recargos de pago. */
export function optionTotals(option: QuoteOptionInput, settings: Settings) {
  const sub = option.items.reduce((acc, i) => acc + (i.precioCop || 0), 0);
  return paymentTotals(sub + (option.servicio || 0), settings);
}

/** Genera un código sugerido tipo "AAAA-NN". */
export function suggestCode(year: number, sequence: number): string {
  return `${year}-${String(sequence).padStart(2, "0")}`;
}
