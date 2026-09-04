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
import { processorPrice, effectiveTrm } from "@/lib/pricing";
import {
  ProcessorManager,
  type ProcessorRow,
} from "@/components/admin/processor-manager";

export const metadata: Metadata = {
  title: "Procesadores",
  robots: { index: false, follow: false },
};

export default async function ProcesadoresPage() {
  let rows: ProcessorRow[] = [];
  let trmReady = false;
  let error: string | null = null;

  try {
    const settings = await getSettings();
    trmReady = effectiveTrm(settings) != null;
    const col = await collections.processors();
    const docs = await col.find({}).sort({ modelo: 1 }).toArray();
    rows = docs.map((p) => ({
      id: p._id!.toString(),
      modelo: p.modelo,
      marca: p.marca,
      modoPrecio: p.modoPrecio,
      baseUsd: p.baseUsd,
      precioManualCop: p.precioManualCop,
      activo: p.activo,
      precioCalculado: processorPrice(p, settings),
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar procesadores.";
  }

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Procesadores</h1>
        <p className="mt-1 text-component">
          Modelos en USD (se convierten con el TRM) o en COP fijo.
        </p>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : (
        <ProcessorManager rows={rows} trmReady={trmReady} />
      )}
    </>
  );
}
