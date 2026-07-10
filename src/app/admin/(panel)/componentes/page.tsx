// Desarrollado por BlacKraken Solutions
import type { Metadata } from "next";
import { collections } from "@/lib/db/collections";
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
  let error: string | null = null;

  try {
    const col = await collections.components();
    const docs = await col
      .find({})
      .sort({ categoria: 1, modelo: 1 })
      .toArray();
    rows = docs.map((c) => ({
      id: c._id!.toString(),
      categoria: c.categoria,
      marca: c.marca,
      modelo: c.modelo,
      descripcion: c.descripcion,
      precioCop: c.precioCop,
      activo: c.activo,
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
        <ComponentManager rows={rows} />
      )}
    </>
  );
}
