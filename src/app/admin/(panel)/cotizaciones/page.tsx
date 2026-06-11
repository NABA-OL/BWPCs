import type { Metadata } from "next";
import Link from "next/link";
import { collections } from "@/lib/db/collections";
import { ButtonLink } from "@/components/ui/button";
import { QuoteList } from "@/components/admin/quote-list";

export const metadata: Metadata = {
  title: "Cotizaciones",
  robots: { index: false, follow: false },
};

const fmtDate = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

export default async function CotizacionesPage() {
  let rows: {
    id: string;
    codigo: string;
    cliente: string | null;
    fecha: string;
    total: number;
  }[] = [];
  let error: string | null = null;

  try {
    const col = await collections.quotes();
    const docs = await col.find({}).sort({ creado: -1 }).toArray();
    rows = docs.map((q) => ({
      id: q._id!.toString(),
      codigo: q.codigo,
      cliente: q.cliente,
      fecha: fmtDate.format(new Date(q.fecha)),
      total: q.opciones[0]?.totales.base ?? 0,
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar cotizaciones.";
  }

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Cotizaciones
          </h1>
          <p className="mt-1 text-component">
            Crea, edita y descarga tus cotizaciones en PDF.
          </p>
        </div>
        <ButtonLink href="/admin/cotizaciones/nueva">Nueva</ButtonLink>
      </header>

      {error ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">{error}</p>
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-component">
          Aún no hay cotizaciones.{" "}
          <Link
            href="/admin/cotizaciones/nueva"
            className="text-accent hover:underline"
          >
            Crea la primera
          </Link>
          .
        </p>
      ) : (
        <QuoteList rows={rows} />
      )}
    </>
  );
}
