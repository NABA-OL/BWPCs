// Desarrollado por BlacKraken Solutions
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";
import { getQuoteBuilderData } from "@/lib/admin/quote-data";
import { QuoteBuilder } from "@/components/admin/quote-builder";
import type { QuoteInput } from "@/lib/quote";

export const metadata: Metadata = {
  title: "Editar cotización",
  robots: { index: false, follow: false },
};

export default async function EditarCotizacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) notFound();

  const col = await collections.quotes();
  const quote = await col.findOne({ _id: new ObjectId(id) });
  if (!quote) notFound();

  const data = await getQuoteBuilderData();

  const initial: QuoteInput = {
    codigo: quote.codigo,
    cliente: quote.cliente ?? "",
    fecha: new Date(quote.fecha).toISOString().slice(0, 10),
    opciones: quote.opciones.map((o) => ({
      titulo: o.titulo,
      servicio: o.servicio,
      items: o.items.map((i) => ({
        categoria: i.categoria,
        modelo: i.modelo,
        precioCop: i.precioCop,
        descripcion: i.descripcion,
      })),
    })),
  };

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Cotización {quote.codigo}
        </h1>
        <p className="mt-1 text-component">Edita y descarga el PDF.</p>
      </header>

      <QuoteBuilder
        id={id}
        initial={initial}
        catalog={data.catalog}
        tarjetaPct={data.tarjetaPct}
        psePct={data.psePct}
        pdfHref={`/admin/cotizaciones/${id}/pdf`}
      />
    </>
  );
}
