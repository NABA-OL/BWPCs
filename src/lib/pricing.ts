/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { ComponentItem, Graphic, Processor, Settings } from "@/lib/db/types";

/**
 * Lógica de precios — única fuente de verdad (ver docs/PLANEACION.md §5 y §13).
 *
 *   TRM_efectivo = (trmManual ?? trmScrapeado) + trmRecargo   [solo si hay base > 0]
 *   precioCPU = baseUsd * TRM + envioCPU   (modo USD)  | precioManualCop (modo COP)
 *   precioGPU = baseUsd * TRM + envioGPU   (modo USD)  | precioManualCop (modo COP)
 *   ConTarjeta = Total * (1 + mediosPago.tarjeta)
 *   ConPSE     = Total * (1 + mediosPago.pse)
 */

/** TRM efectivo, o null si no hay base (ni manual ni scrapeado). */
export function effectiveTrm(settings: Settings): number | null {
  const base = settings.trmManual ?? settings.trmScrapeado;
  return base > 0 ? base + settings.trmRecargo : null;
}

/** Precio en COP de un procesador, o null si falta info (TRM o USD). */
export function processorPrice(
  p: Pick<Processor, "modoPrecio" | "baseUsd" | "precioManualCop">,
  settings: Settings,
): number | null {
  if (p.modoPrecio === "COP") return p.precioManualCop ?? null;
  const trm = effectiveTrm(settings);
  if (trm == null || p.baseUsd == null) return null;
  return Math.round(p.baseUsd * trm + settings.envioCPU);
}

/** Precio en COP de una gráfica, o null si falta info. */
export function graphicPrice(
  g: Pick<Graphic, "modoPrecio" | "baseUsd" | "precioManualCop">,
  settings: Settings,
): number | null {
  if (g.modoPrecio === "COP") return g.precioManualCop ?? null;
  const trm = effectiveTrm(settings);
  if (trm == null || g.baseUsd == null) return null;
  return Math.round(g.baseUsd * trm + settings.envioGPU);
}

/** Precio en COP de un componente del catálogo general, o null si falta info. */
export function componentPrice(
  c: Pick<ComponentItem, "modoPrecio" | "baseUsd" | "precioManualCop">,
  settings: Settings,
): number | null {
  if (c.modoPrecio === "COP") return c.precioManualCop ?? null;
  const trm = effectiveTrm(settings);
  if (trm == null || c.baseUsd == null) return null;
  return Math.round(c.baseUsd * trm);
}

/** Totales con recargos de pago a partir de un subtotal en COP. */
export function paymentTotals(total: number, settings: Settings) {
  return {
    base: Math.round(total),
    conTarjeta: Math.round(total * (1 + settings.mediosPago.tarjeta)),
    conPse: Math.round(total * (1 + settings.mediosPago.pse)),
  };
}
