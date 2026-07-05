// Desarrollado por NABA-OL
import type { Metadata } from "next";
import { collections } from "@/lib/db/collections";
import { BuildManager, type BuildRow } from "@/components/admin/build-manager";

export const metadata: Metadata = {
  title: "Ensambles",
  robots: { index: false, follow: false },
};

export default async function EnsamblesAdminPage() {
  let rows: BuildRow[] = [];
  let error: string | null = null;

  try {
    const col = await collections.builds();
    const docs = await col.find({}).sort({ orden: 1, creado: -1 }).toArray();
    rows = docs.map((d) => ({
      id: d._id!.toString(),
      titulo: d.titulo,
      specs: d.specs,
      imagenUrl: d.imagenUrl,
      orden: d.orden,
      activo: d.activo,
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar ensambles.";
  }

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Ensambles</h1>
        <p className="mt-1 text-component">
          Galería pública de builds realizados. Se muestran en{" "}
          <span className="font-mono">/ensambles</span> y en el inicio.
        </p>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : (
        <BuildManager rows={rows} />
      )}
    </>
  );
}
