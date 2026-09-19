/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";
import { getQuoteBuilderData } from "@/lib/admin/quote-data";
import { QuoteBuilder } from "@/components/admin/quote-builder";
import { QuotePublishPanel } from "@/components/admin/quote-publish-panel";
import { getCuentaForQuote } from "@/lib/cuentas-cobro";
import { listQuoteRequests } from "@/lib/quote-requests";
import { getPublicUser, listPublicUsers } from "@/lib/user-auth/users";
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

  const [data, users, owner, requests, cuenta] = await Promise.all([
    getQuoteBuilderData(),
    listPublicUsers(),
    quote.userId ? getPublicUser(quote.userId) : null,
    listQuoteRequests(id),
    getCuentaForQuote(id),
  ]);

  const initial: QuoteInput = {
    codigo: quote.codigo,
    cliente: quote.cliente ?? "",
    userId: quote.userId ?? "",
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

      <QuotePublishPanel
        quote={quote}
        userLabel={owner ? `${owner.name} (${owner.email})` : null}
        requests={requests}
        cuenta={cuenta}
      />

      <QuoteBuilder
        users={users}
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
