/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getMyQuote } from "@/lib/account/quotes";
import { CATEGORY_LABELS } from "@/lib/categories";
import { formatCOP } from "@/lib/format";
import { whatsappLink } from "@/lib/site-config";
import { getUserSession } from "@/lib/user-auth/session";

export const metadata: Metadata = { title: "Cotización" };

// Solo fecha, guardada a medianoche UTC: se muestra en UTC para no correrla un día.
const fmtFecha = new Intl.DateTimeFormat("es-CO", {
  timeZone: "UTC",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default async function CotizacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getUserSession();
  if (!session) redirect(
      `/cuenta/ingresar?next=${encodeURIComponent(`/cuenta/cotizaciones/${id}`)}`,
    );

  const quote = await getMyQuote(session.user.id, id);
  if (!quote) notFound();

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/cuenta/cotizaciones"
        className="text-sm text-component hover:text-panda"
      >
        ← Mis cotizaciones
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Cotización <span className="font-mono">{quote.codigo}</span>
          </h1>
          <p className="mt-1 text-sm text-component">
            {fmtFecha.format(new Date(quote.fecha))}
          </p>
        </div>
        <a
          href={`/cuenta/cotizaciones/${id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-panda px-5 py-2.5 text-sm font-medium uppercase tracking-wide transition-colors hover:bg-panda hover:text-vanilla"
        >
          Descargar PDF
        </a>
      </div>

      <div className="mt-8 space-y-6">
        {quote.opciones.map((o) => (
          <div key={o.titulo} className="border border-hairline bg-vanilla">
            <h2 className="border-b border-hairline px-5 py-3 font-semibold">
              {o.titulo}
            </h2>
            <ul className="divide-y divide-hairline">
              {o.items.map((i, n) => (
                <li
                  key={`${i.categoria}-${n}`}
                  className="flex items-start justify-between gap-4 px-5 py-3 text-sm"
                >
                  <div>
                    <p className="text-xs text-component">
                      {CATEGORY_LABELS[i.categoria] ?? i.categoria}
                    </p>
                    <p className="font-medium">{i.modelo}</p>
                    {i.descripcion && (
                      <p className="mt-0.5 text-xs text-component">
                        {i.descripcion}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 font-mono">{formatCOP(i.precioCop)}</p>
                </li>
              ))}
              {o.servicio > 0 && (
                <li className="flex justify-between gap-4 px-5 py-3 text-sm">
                  <p className="font-medium">Ensamblaje</p>
                  <p className="font-mono">{formatCOP(o.servicio)}</p>
                </li>
              )}
            </ul>
            <dl className="space-y-1 border-t border-hairline bg-hairline/30 px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt>Total (efectivo / transferencia)</dt>
                <dd className="font-mono font-semibold">
                  {formatCOP(o.totales.base)}
                </dd>
              </div>
              <div className="flex justify-between text-component">
                <dt>Con tarjeta</dt>
                <dd className="font-mono">{formatCOP(o.totales.conTarjeta)}</dd>
              </div>
              <div className="flex justify-between text-component">
                <dt>Con PSE</dt>
                <dd className="font-mono">{formatCOP(o.totales.conPse)}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-component">
        Los precios son de referencia y pueden variar según disponibilidad.{" "}
        <a
          href={whatsappLink(
            `Hola B & W, tengo una duda sobre mi cotización ${quote.codigo}.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Escríbenos por WhatsApp
        </a>{" "}
        para afinarla.
      </p>
    </section>
  );
}
