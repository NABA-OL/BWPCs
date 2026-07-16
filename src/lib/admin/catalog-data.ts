// Desarrollado por BlacKraken Solutions
import "server-only";
import { collections } from "@/lib/db/collections";
import { processorPrice, graphicPrice } from "@/lib/pricing";
import { formatCOP } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/categories";
import type { ComponentCategory, Settings } from "@/lib/db/types";

export interface CatalogOption {
  id: string;
  label: string;
  categoria: ComponentCategory;
  modelo: string;
  precioCop: number;
  descripcion: string;
}

/** Catálogo de procesadores/gráficas/componentes activos con precio resuelto,
 * reutilizado por el builder de cotizaciones y el de cuentas de cobro. */
export async function getCatalogOptions(settings: Settings): Promise<CatalogOption[]> {
  const [procCol, gpuCol, compCol] = await Promise.all([
    collections.processors(),
    collections.graphics(),
    collections.components(),
  ]);

  const [procs, gpus, comps] = await Promise.all([
    procCol.find({ activo: true }).sort({ modelo: 1 }).toArray(),
    gpuCol.find({ activo: true }).sort({ modelo: 1 }).toArray(),
    compCol.find({ activo: true }).sort({ categoria: 1, modelo: 1 }).toArray(),
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

  return catalog;
}
