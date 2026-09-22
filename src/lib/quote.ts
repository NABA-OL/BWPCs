/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
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
  /** Cuenta de usuario a la que se le muestra la cotización ("" = ninguna). */
  userId: string;
  fecha: string; // ISO yyyy-mm-dd
  opciones: QuoteOptionInput[];
}

/** Totales de una opción: subtotal de ítems + servicio, con recargos de pago. */
export function optionTotals(option: QuoteOptionInput, settings: Settings) {
  const sub = option.items.reduce((acc, i) => acc + (i.precioCop || 0), 0);
  return paymentTotals(sub + (option.servicio || 0), settings);
}

/** Códigos posibles por año con el formato actual (ver `quoteCodigo`). */
export const QUOTE_CODIGOS_POR_ANIO = 1000;

/**
 * Código de una cotización: "AAAA-COT-NNN" = año, "COT" fijo (para no confundirlo a
 * simple vista con el número de una cuenta de cobro, que también empieza en "AAAA-")
 * y tres dígitos incrementales. `sequence` parte de 0: 0 → 2026-COT-000, 999 → 2026-COT-999.
 * ponytail: 1000 cotizaciones/año alcanza de sobra (hoy son ~30/año); si algún año se
 * agotan, ampliar a letras rotativas como en `cuentaNumero` (mismo patrón en `cuenta-cobro.ts`).
 */
export function quoteCodigo(year: number, sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 0 || sequence >= QUOTE_CODIGOS_POR_ANIO) {
    throw new RangeError("Se agotaron los códigos de cotización del año.");
  }
  return `${year}-COT-${String(sequence).padStart(3, "0")}`;
}
