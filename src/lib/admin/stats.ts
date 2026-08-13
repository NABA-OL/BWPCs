/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { collections } from "@/lib/db/collections";
import type { ComponentCategory, Settings } from "@/lib/db/types";

export interface BrandCount {
  marca: string;
  count: number;
}

export interface CategoryStat {
  categoria: ComponentCategory;
  count: number;
  marcas: BrandCount[];
}

export interface AdminStats {
  processors: number;
  processorsByBrand: BrandCount[];
  graphics: number;
  graphicsByBrand: BrandCount[];
  components: number;
  componentsByCategory: CategoryStat[];
  quotes: number;
  settings: Settings | null;
  trmEfectivo: number | null;
}

function tidyBrand(v: unknown): string {
  const s = String(v ?? "").trim();
  return s === "" ? "Sin marca" : s;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [proc, gpu, comp, quotes, settingsCol] = await Promise.all([
    collections.processors(),
    collections.graphics(),
    collections.components(),
    collections.quotes(),
    collections.settings(),
  ]);

  const [procBrands, gpuBrands, compGroups, quotesCount, settings] =
    await Promise.all([
      proc
        .aggregate<{ _id: string; n: number }>([
          { $group: { _id: "$marca", n: { $sum: 1 } } },
          { $sort: { n: -1 } },
        ])
        .toArray(),
      gpu
        .aggregate<{ _id: string; n: number }>([
          { $group: { _id: "$marca", n: { $sum: 1 } } },
          { $sort: { n: -1 } },
        ])
        .toArray(),
      comp
        .aggregate<{ _id: { cat: ComponentCategory; marca: string }; n: number }>(
          [
            {
              $group: {
                _id: { cat: "$categoria", marca: "$marca" },
                n: { $sum: 1 },
              },
            },
          ],
        )
        .toArray(),
      quotes.countDocuments(),
      settingsCol.findOne({}),
    ]);

  const processorsByBrand: BrandCount[] = procBrands.map((b) => ({
    marca: tidyBrand(b._id),
    count: b.n,
  }));
  const graphicsByBrand: BrandCount[] = gpuBrands.map((b) => ({
    marca: tidyBrand(b._id),
    count: b.n,
  }));

  // Componentes agrupados por categoría, con desglose de marcas dentro.
  const byCat = new Map<ComponentCategory, CategoryStat>();
  for (const g of compGroups) {
    const cat = g._id.cat;
    const stat = byCat.get(cat) ?? { categoria: cat, count: 0, marcas: [] };
    stat.count += g.n;
    stat.marcas.push({ marca: tidyBrand(g._id.marca), count: g.n });
    byCat.set(cat, stat);
  }
  const componentsByCategory = [...byCat.values()]
    .map((s) => ({
      ...s,
      marcas: s.marcas.sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => b.count - a.count);

  const processors = processorsByBrand.reduce((a, b) => a + b.count, 0);
  const graphics = graphicsByBrand.reduce((a, b) => a + b.count, 0);
  const components = componentsByCategory.reduce((a, b) => a + b.count, 0);

  const base = settings ? (settings.trmManual ?? settings.trmScrapeado) : 0;
  const trmEfectivo = settings && base > 0 ? base + settings.trmRecargo : null;

  return {
    processors,
    processorsByBrand,
    graphics,
    graphicsByBrand,
    components,
    componentsByCategory,
    quotes: quotesCount,
    settings,
    trmEfectivo,
  };
}
