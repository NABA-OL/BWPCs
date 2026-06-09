import "server-only";
import { collections } from "@/lib/db/collections";
import { getSettings } from "@/lib/admin/settings";
import { processorPrice, graphicPrice } from "@/lib/pricing";
import { formatCOP } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/categories";
import { suggestCode } from "@/lib/quote";
import type { CatalogOption } from "@/components/admin/quote-builder";

export interface QuoteBuilderData {
  catalog: CatalogOption[];
  tarjetaPct: number;
  psePct: number;
  servicioBase: number;
  nextCode: string;
}

export async function getQuoteBuilderData(): Promise<QuoteBuilderData> {
  const settings = await getSettings();

  const [procCol, gpuCol, compCol, quoteCol] = await Promise.all([
    collections.processors(),
    collections.graphics(),
    collections.components(),
    collections.quotes(),
  ]);

  const [procs, gpus, comps, quoteCount] = await Promise.all([
    procCol.find({ activo: true }).sort({ modelo: 1 }).toArray(),
    gpuCol.find({ activo: true }).sort({ modelo: 1 }).toArray(),
    compCol.find({ activo: true }).sort({ categoria: 1, modelo: 1 }).toArray(),
    quoteCol.countDocuments(),
  ]);

  const catalog: CatalogOption[] = [];

  for (const p of procs) {
    const precio = processorPrice(p, settings) ?? 0;
    catalog.push({
      id: `p_${p._id!.toString()}`,
      categoria: "Procesador",
      modelo: p.modelo,
      precioCop: precio,
      descripcion: "",
      label: `Procesador · ${p.modelo} · ${precio ? formatCOP(precio) : "s/ precio"}`,
    });
  }
  for (const g of gpus) {
    const precio = graphicPrice(g, settings) ?? 0;
    catalog.push({
      id: `g_${g._id!.toString()}`,
      categoria: "Grafica",
      modelo: g.modelo,
      precioCop: precio,
      descripcion: "",
      label: `Gráfica · ${g.modelo} · ${precio ? formatCOP(precio) : "s/ precio"}`,
    });
  }
  for (const c of comps) {
    catalog.push({
      id: `c_${c._id!.toString()}`,
      categoria: c.categoria,
      modelo: c.modelo,
      precioCop: c.precioCop,
      descripcion: c.descripcion,
      label: `${CATEGORY_LABELS[c.categoria]} · ${c.modelo} · ${formatCOP(c.precioCop)}`,
    });
  }

  return {
    catalog,
    tarjetaPct: settings.mediosPago.tarjeta,
    psePct: settings.mediosPago.pse,
    servicioBase: settings.servicioBase,
    nextCode: suggestCode(new Date().getFullYear(), quoteCount + 1),
  };
}
