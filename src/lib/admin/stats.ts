/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { collections } from "@/lib/db/collections";
import { getDb } from "@/lib/db/mongodb";
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

export interface ActivityStats {
  accounts: number;
  /** Registros verificados por semana (lunes, hora de Bogotá): las últimas 12. */
  weekly: { label: string; value: number }[];
  quotes: { borrador: number; publicada: number };
  /** Reseñas aprobadas por número de estrellas (5 → 1). */
  stars: { label: string; value: number }[];
  withPublishedQuote: number;
  withReview: number;
}

const WEEKS = 12;
const TZ = "America/Bogota";
const DAY_MS = 86_400_000;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** Lunes de las últimas `WEEKS` semanas en hora de Bogotá (UTC-5, sin horario de verano). */
function lastMondays(): string[] {
  const bogota = new Date(Date.now() - 5 * 3_600_000);
  const monday = new Date(bogota.getTime() - ((bogota.getUTCDay() + 6) % 7) * DAY_MS);
  return Array.from({ length: WEEKS }, (_, i) => isoDay(new Date(monday.getTime() - (WEEKS - 1 - i) * 7 * DAY_MS)));
}

export async function getActivityStats(): Promise<ActivityStats> {
  const users = (await getDb()).collection("users");
  const [quotesCol, reviewsCol] = await Promise.all([collections.quotes(), collections.reviews()]);
  const since = new Date(Date.now() - (WEEKS * 7 + 7) * DAY_MS);

  const [accounts, weekly, quoteStates, starGroups, quoteUsers, reviewUsers] = await Promise.all([
    users.countDocuments({ emailVerified: true }),
    users
      .aggregate<{ _id: string; n: number }>([
        { $match: { emailVerified: true, createdAt: { $gte: since } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                timezone: TZ,
                date: { $dateTrunc: { date: "$createdAt", unit: "week", startOfWeek: "monday", timezone: TZ } },
              },
            },
            n: { $sum: 1 },
          },
        },
      ])
      .toArray(),
    quotesCol.aggregate<{ _id: string | null; n: number }>([{ $group: { _id: "$estado", n: { $sum: 1 } } }]).toArray(),
    reviewsCol
      .aggregate<{ _id: number; n: number }>([
        { $match: { estado: "aprobada" } },
        { $group: { _id: "$estrellas", n: { $sum: 1 } } },
      ])
      .toArray(),
    quotesCol.distinct("userId", { estado: "publicada", userId: { $type: "string" } }),
    reviewsCol.distinct("userId", { userId: { $type: "string" } }),
  ]);

  const byWeek = new Map(weekly.map((w) => [w._id, w.n]));
  const publicada = quoteStates.find((q) => q._id === "publicada")?.n ?? 0;
  const total = quoteStates.reduce((a, q) => a + q.n, 0);
  const byStars = new Map(starGroups.map((g) => [g._id, g.n]));

  return {
    accounts,
    weekly: lastMondays().map((day) => ({
      label: `${day.slice(8)}/${day.slice(5, 7)}`,
      value: byWeek.get(day) ?? 0,
    })),
    quotes: { publicada, borrador: total - publicada },
    stars: [5, 4, 3, 2, 1].map((n) => ({ label: `${n} ★`, value: byStars.get(n) ?? 0 })),
    withPublishedQuote: quoteUsers.length,
    withReview: reviewUsers.length,
  };
}
