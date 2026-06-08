import "server-only";
import { collections } from "@/lib/db/collections";
import type { Settings } from "@/lib/db/types";

export interface AdminStats {
  processors: number;
  graphics: number;
  components: number;
  quotes: number;
  settings: Settings | null;
  trmEfectivo: number | null;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [proc, gpu, comp, quotes, settingsCol] = await Promise.all([
    collections.processors(),
    collections.graphics(),
    collections.components(),
    collections.quotes(),
    collections.settings(),
  ]);

  const [processors, graphics, components, quotesCount, settings] =
    await Promise.all([
      proc.countDocuments(),
      gpu.countDocuments(),
      comp.countDocuments(),
      quotes.countDocuments(),
      settingsCol.findOne({}),
    ]);

  // Solo hay TRM efectivo si existe una base real (manual o scrapeado > 0);
  // el recargo solo no constituye un TRM válido.
  const base = settings ? (settings.trmManual ?? settings.trmScrapeado) : 0;
  const trmEfectivo =
    settings && base > 0 ? base + settings.trmRecargo : null;

  return {
    processors,
    graphics,
    components,
    quotes: quotesCount,
    settings,
    trmEfectivo,
  };
}
