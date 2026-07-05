// Desarrollado por NABA-OL
import type { Metadata } from "next";
import { collections } from "@/lib/db/collections";
import { getSettings } from "@/lib/admin/settings";
import { graphicPrice, effectiveTrm } from "@/lib/pricing";
import {
  GraphicManager,
  type GraphicRow,
} from "@/components/admin/graphic-manager";

export const metadata: Metadata = {
  title: "Gráficas",
  robots: { index: false, follow: false },
};

export default async function GraficasPage() {
  let rows: GraphicRow[] = [];
  let trmReady = false;
  let error: string | null = null;

  try {
    const settings = await getSettings();
    trmReady = effectiveTrm(settings) != null;
    const col = await collections.graphics();
    const docs = await col.find({}).sort({ modelo: 1 }).toArray();
    rows = docs.map((g) => ({
      id: g._id!.toString(),
      modelo: g.modelo,
      marca: g.marca ?? "NVIDIA",
      ensambladora: g.ensambladora ?? "",
      modoPrecio: g.modoPrecio,
      baseUsd: g.baseUsd,
      precioManualCop: g.precioManualCop,
      activo: g.activo,
      precioCalculado: graphicPrice(g, settings),
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar gráficas.";
  }

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Gráficas</h1>
        <p className="mt-1 text-component">
          Modelos en USD (se convierten con el TRM) o en COP fijo.
        </p>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : (
        <GraphicManager rows={rows} trmReady={trmReady} />
      )}
    </>
  );
}
