/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";
import { getQuoteBuilderData } from "@/lib/admin/quote-data";
import { QuoteBuilder } from "@/components/admin/quote-builder";
import { getPublicUser, listPublicUsers } from "@/lib/user-auth/users";
import type { QuoteInput } from "@/lib/quote";

export const metadata: Metadata = {
  title: "Nueva cotización",
  robots: { index: false, follow: false },
};

export default async function NuevaCotizacionPage({
  searchParams,
}: {
  searchParams: Promise<{ solicitud?: string }>;
}) {
  const { solicitud } = await searchParams;
  let error: string | null = null;
  let data = null;
  try {
    data = await getQuoteBuilderData();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error al cargar datos.";
  }

  const users = data ? await listPublicUsers() : [];

  // Viene de una solicitud del cotizador: se muestra lo que pidió y, si tenía sesión, se liga su cuenta.
  const lead =
    data && solicitud && ObjectId.isValid(solicitud)
      ? await (await collections.leads()).findOne({ _id: new ObjectId(solicitud) })
      : null;
  const leadUser = lead?.userId ? await getPublicUser(lead.userId) : null;
  if (leadUser && !users.some((u) => u.id === lead?.userId)) {
    users.unshift({ id: leadUser._id.toString(), name: leadUser.name, email: leadUser.email });
  }

  const initial: QuoteInput | null = data
    ? {
        codigo: data.nextCode,
        // Con cuenta ligada el nombre sale de la cuenta; sin ella se usa el que dejó en la solicitud.
        cliente: leadUser ? "" : (lead?.nombre ?? ""),
        userId: leadUser ? leadUser._id.toString() : "",
        fecha: new Date().toISOString().slice(0, 10),
        opciones: [
          {
            titulo: "Opción 1",
            items: [], // empieza vacía; el admin agrega los ítems
            servicio: data.servicioBase,
          },
        ],
      }
    : null;

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Nueva cotización
        </h1>
        <p className="mt-1 text-component">
          Arma las opciones, agrega ítems desde el catálogo o manualmente.
        </p>
      </header>

      {lead && (
        <section className="mt-6 border border-hairline bg-hairline/30 p-5 text-sm">
          <h2 className="font-semibold">Solicitud de {lead.nombre}</h2>
          <p className="mt-0.5 font-mono text-xs text-component">
            {lead.telefono} · {lead.correo}
          </p>
          <p className="mt-3 whitespace-pre-line leading-relaxed">{lead.resumen}</p>
          {!leadUser && (
            <p className="mt-3 text-xs text-component">
              No tenía sesión al enviarla: la cotización no se puede ligar a una cuenta, se le envía por WhatsApp o
              correo.
            </p>
          )}
        </section>
      )}

      {error || !data || !initial ? (
        <div className="mt-8 border border-accent/30 bg-accent/5 p-6">
          <p className="text-sm text-panda">
            {error ?? "No se pudieron cargar los datos."}
          </p>
        </div>
      ) : (
        <QuoteBuilder
          users={users}
          id=""
          initial={initial}
          catalog={data.catalog}
          tarjetaPct={data.tarjetaPct}
          psePct={data.psePct}
        />
      )}
    </>
  );
}
