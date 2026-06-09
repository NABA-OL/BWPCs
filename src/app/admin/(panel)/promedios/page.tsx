import type { Metadata } from "next";
import { collections } from "@/lib/db/collections";
import { AveragesForm } from "@/components/admin/averages-form";

export const metadata: Metadata = {
  title: "Promedios",
  robots: { index: false, follow: false },
};

export default async function PromediosPage() {
  let initial: Record<string, number> = {};
  let error: string | null = null;

  try {
    const col = await collections.categoryAverages();
    const docs = await col.find({}).toArray();
    initial = Object.fromEntries(docs.map((d) => [d.categoria, d.promedioCop]));
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar promedios.";
  }

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Promedios</h1>
        <p className="mt-1 max-w-2xl text-component">
          Precios de referencia por categoría. Alimentan el estimado aproximado
          del cotizador público (cuando el cliente marca qué componentes quiere,
          sin elegir modelo exacto).
        </p>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : (
        <AveragesForm initial={initial} />
      )}
    </>
  );
}
