/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-27
 */
import { collections } from "@/lib/db/collections";
import { getSettings } from "@/lib/admin/settings";
import {
  ESTIMATOR_CATEGORIES,
  CATEGORY_LABELS,
  DEFAULT_ESTIMATOR_OPTIONS,
} from "@/lib/categories";

export interface EstimatorContextOption {
  label: string;
  precioCop: number;
}

export interface EstimatorContextCategory {
  key: string;
  label: string;
  options: EstimatorContextOption[];
}

export interface EstimatorContext {
  categories: EstimatorContextCategory[];
  servicioBase: number;
  tarjetaPct: number;
  psePct: number;
  breBPct: number;
}

/** Categorías/opciones y recargos vigentes del cotizador público — fuente única. */
export async function getEstimatorContext(): Promise<EstimatorContext> {
  const settings = await getSettings();
  const col = await collections.categoryOptions();
  const docs = await col.find({}).toArray();
  const map = new Map(docs.map((d) => [d.categoria, d.opciones]));

  const categories = ESTIMATOR_CATEGORIES.map((cat) => {
    const opciones = (
      map.get(cat) ??
      DEFAULT_ESTIMATOR_OPTIONS[cat] ??
      []
    ).filter((o) => o && o.label && o.precioCop > 0);
    return { key: cat, label: CATEGORY_LABELS[cat], options: opciones };
  }).filter((c) => c.options.length > 0);

  return {
    categories,
    servicioBase: settings.servicioBase,
    tarjetaPct: settings.mediosPago.tarjeta,
    psePct: settings.mediosPago.pse,
    breBPct: settings.mediosPago.breB ?? 0,
  };
}

export interface EstimateSelection {
  categoria: string;
  opcionIndex: number;
}

export interface EstimateResult {
  moneda: "COP";
  subtotal: number;
  servicioBase: number;
  total: number;
  totalConTarjeta: number;
  totalConPse: number;
  totalConBreB: number;
  detalle: { categoria: string; opcion: string; precioCop: number }[];
  aviso: string;
}

/** Calcula el estimado a partir de una selección {categoria, opcionIndex}. Lanza si algo es inválido. */
export function computeEstimate(
  ctx: EstimatorContext,
  seleccion: EstimateSelection[],
): EstimateResult {
  const detalle = seleccion.map(({ categoria, opcionIndex }) => {
    const cat = ctx.categories.find((c) => c.key === categoria);
    const opcion = cat?.options[opcionIndex];
    if (!cat || !opcion) {
      throw new Error(
        `Categoría o índice de opción inválido: ${categoria}[${opcionIndex}]`,
      );
    }
    return {
      categoria: cat.label,
      opcion: opcion.label,
      precioCop: opcion.precioCop,
    };
  });

  const subtotal = detalle.reduce((sum, d) => sum + d.precioCop, 0);
  const total = subtotal + ctx.servicioBase;

  return {
    moneda: "COP",
    subtotal,
    servicioBase: ctx.servicioBase,
    total,
    totalConTarjeta: Math.round(total * (1 + ctx.tarjetaPct)),
    totalConPse: Math.round(total * (1 + ctx.psePct)),
    totalConBreB: Math.round(total * (1 + ctx.breBPct)),
    detalle,
    aviso:
      "Precio aproximado según la gama elegida. El precio final se confirma por WhatsApp.",
  };
}
