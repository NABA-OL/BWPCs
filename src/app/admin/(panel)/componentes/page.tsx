/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { collections } from "@/lib/db/collections";
import { getSettings } from "@/lib/admin/settings";
import { componentPrice, effectiveTrm } from "@/lib/pricing";
import {
  ComponentManager,
  type ComponentRow,
} from "@/components/admin/component-manager";

export const metadata: Metadata = {
  title: "Componentes",
  robots: { index: false, follow: false },
};

export default async function ComponentesPage() {
  let rows: ComponentRow[] = [];
  let trmReady = false;
  let error: string | null = null;

  try {
    const settings = await getSettings();
    trmReady = effectiveTrm(settings) != null;
    const col = await collections.components();
    const docs = await col.find({}).sort({ categoria: 1, modelo: 1 }).toArray();
    rows = docs.map((c) => ({
      id: c._id!.toString(),
      categoria: c.categoria,
      marca: c.marca,
      modelo: c.modelo,
      descripcion: c.descripcion,
      modoPrecio: c.modoPrecio,
      baseUsd: c.baseUsd,
      precioManualCop: c.precioManualCop,
      activo: c.activo,
      precioCalculado: componentPrice(c, settings),
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar componentes.";
  }

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Componentes</h1>
        <p className="mt-1 text-component">
          Catálogo en pesos (fuente, RAM, board, chasis, etc.).
        </p>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : (
        <ComponentManager rows={rows} trmReady={trmReady} />
      )}
    </>
  );
}
