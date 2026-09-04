/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { collections } from "@/lib/db/collections";
import { getSettings } from "@/lib/admin/settings";
import { getCatalogOptions, type CatalogOption } from "@/lib/admin/catalog-data";
import { suggestCode } from "@/lib/quote";

export interface QuoteBuilderData {
  catalog: CatalogOption[];
  tarjetaPct: number;
  psePct: number;
  servicioBase: number;
  nextCode: string;
}

export async function getQuoteBuilderData(): Promise<QuoteBuilderData> {
  const settings = await getSettings();

  const [catalog, quoteCount] = await Promise.all([
    getCatalogOptions(settings),
    (await collections.quotes()).countDocuments(),
  ]);

  return {
    catalog,
    tarjetaPct: settings.mediosPago.tarjeta,
    psePct: settings.mediosPago.pse,
    servicioBase: settings.servicioBase,
    nextCode: suggestCode(new Date().getFullYear(), quoteCount + 1),
  };
}
