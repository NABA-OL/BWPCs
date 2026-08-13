/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { collections } from "@/lib/db/collections";
import {
  ESTIMATOR_CATEGORIES,
  DEFAULT_ESTIMATOR_OPTIONS,
} from "@/lib/categories";
import { EstimatorOptionsForm } from "@/components/admin/estimator-options-form";

export const metadata: Metadata = {
  title: "Cotizador",
  robots: { index: false, follow: false },
};

export default async function PromediosPage() {
  let initial: Record<string, { label: string; precioCop: number }[]> = {};
  let error: string | null = null;

  try {
    const col = await collections.categoryOptions();
    const docs = await col.find({}).toArray();
    const map = new Map(docs.map((d) => [d.categoria, d.opciones]));
    initial = Object.fromEntries(
      ESTIMATOR_CATEGORIES.map((cat) => [
        cat,
        map.get(cat) ?? DEFAULT_ESTIMATOR_OPTIONS[cat] ?? [],
      ]),
    );
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar las opciones.";
  }

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Cotizador</h1>
        <p className="mt-1 max-w-2xl text-component">
          Opciones (gamas) por categoría del cotizador público. El cliente elige
          una por categoría; cada una tiene su precio aproximado.
        </p>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : (
        <EstimatorOptionsForm initial={initial} />
      )}
    </>
  );
}
