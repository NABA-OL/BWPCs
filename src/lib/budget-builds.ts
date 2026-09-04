/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import type { EstimatorContext } from "@/lib/quote-estimator";

/**
 * Arma la mejor configuración posible dentro de un presupuesto, usando los
 * precios reales del catálogo (categoryOptions + servicioBase).
 * No inventa precios: si el catálogo cambia, estas páginas cambian con él.
 */

/** Categorías de un equipo base y el orden en que conviene invertir el presupuesto. */
const CORE_PRIORITY = [
  "Grafica",
  "Procesador",
  "Ram",
  "Almacenamiento",
  "Board",
  "Fuente",
  "Chasis",
] as const;

export interface BudgetPick {
  categoria: string;
  opcion: string;
  precioCop: number;
}

export interface BudgetBuild {
  picks: BudgetPick[];
  subtotal: number;
  servicioBase: number;
  total: number;
  /** true si ni la configuración más barata cabe en el presupuesto. */
  excedePresupuesto: boolean;
}

/**
 * Estrategia: arrancar con la opción más barata de cada categoría core y subir
 * de gama por orden de prioridad mientras quepa en el presupuesto.
 */
export function buildForBudget(
  ctx: EstimatorContext,
  presupuestoCop: number,
): BudgetBuild | null {
  const core = CORE_PRIORITY.map((key) =>
    ctx.categories.find((c) => c.key === key),
  ).filter((c): c is NonNullable<typeof c> => Boolean(c && c.options.length));

  if (core.length === 0) return null;

  // Índice elegido por categoría; arranca en la opción más barata.
  const chosen = new Map<string, number>();
  for (const cat of core) {
    const cheapest = cat.options.reduce(
      (best, o, i) => (o.precioCop < cat.options[best].precioCop ? i : best),
      0,
    );
    chosen.set(cat.key, cheapest);
  }

  const totalOf = () =>
    core.reduce(
      (sum, cat) => sum + cat.options[chosen.get(cat.key) ?? 0].precioCop,
      0,
    ) + ctx.servicioBase;

  const excedePresupuesto = totalOf() > presupuestoCop;

  // Sube de gama por prioridad mientras el total siga cabiendo.
  let mejoro = true;
  while (mejoro) {
    mejoro = false;
    for (const cat of core) {
      const actual = chosen.get(cat.key) ?? 0;
      const precioActual = cat.options[actual].precioCop;
      // Siguiente opción más cara disponible.
      const siguiente = cat.options
        .map((o, i) => ({ o, i }))
        .filter(({ o }) => o.precioCop > precioActual)
        .sort((a, b) => a.o.precioCop - b.o.precioCop)[0];
      if (!siguiente) continue;

      const delta = siguiente.o.precioCop - precioActual;
      if (totalOf() + delta <= presupuestoCop) {
        chosen.set(cat.key, siguiente.i);
        mejoro = true;
      }
    }
  }

  const picks: BudgetPick[] = core.map((cat) => {
    const opt = cat.options[chosen.get(cat.key) ?? 0];
    return { categoria: cat.label, opcion: opt.label, precioCop: opt.precioCop };
  });

  const subtotal = picks.reduce((sum, p) => sum + p.precioCop, 0);

  return {
    picks,
    subtotal,
    servicioBase: ctx.servicioBase,
    total: subtotal + ctx.servicioBase,
    excedePresupuesto,
  };
}
