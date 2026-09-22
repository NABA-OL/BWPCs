/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { getSettings } from "@/lib/admin/settings";
import { getCatalogOptions, type CatalogOption } from "@/lib/admin/catalog-data";
import { peekNextQuoteCodigo } from "@/lib/quotes";

export interface QuoteBuilderData {
  catalog: CatalogOption[];
  tarjetaPct: number;
  psePct: number;
  servicioBase: number;
  nextCode: string;
}

export async function getQuoteBuilderData(): Promise<QuoteBuilderData> {
  const settings = await getSettings();

  const [catalog, nextCode] = await Promise.all([getCatalogOptions(settings), peekNextQuoteCodigo()]);

  return {
    catalog,
    tarjetaPct: settings.mediosPago.tarjeta,
    psePct: settings.mediosPago.pse,
    servicioBase: settings.servicioBase,
    nextCode,
  };
}
