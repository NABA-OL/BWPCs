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
import { PurchaseForm } from "@/components/account/purchase-form";
import { RevisionForm } from "@/components/account/revision-form";
import { getMyQuote } from "@/lib/account/quotes";
import { listQuoteRequests } from "@/lib/quote-requests";
import { CATEGORY_LABELS } from "@/lib/categories";
import { formatCOP } from "@/lib/format";
import { PAYMENT_LABEL } from "@/lib/payment-methods";
import { whatsappLink, SHOW_PSE } from "@/lib/site-config";
import { getUserSession } from "@/lib/user-auth/session";

export const metadata: Metadata = { title: "Cotización" };

// Solo fecha, guardada a medianoche UTC: se muestra en UTC para no correrla un día.
const fmtFecha = new Intl.DateTimeFormat("es-CO", {
  timeZone: "UTC",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const fmtMoment = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
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

  const requests = await listQuoteRequests(id);
  const pendingRequest = requests.find((r) => r.estado === "pendiente");
  const pastRequests = requests.filter((r) => r.estado === "atendida");
  const version = quote.version ?? 1;
  const lastChange = version > 1 ? quote.historial?.at(-1) : undefined;
  const optionName = (index: number | null) =>
    index === null ? "Sin preferencia" : (quote.opciones[index]?.titulo ?? "Opción eliminada");

  return (
    <section className="max-w-3xl">
      <Link
        href="/cuenta"
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
            {version > 1 && <span className="ml-2 font-mono text-xs">· versión {version}</span>}
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

      {lastChange?.nota && (
        <p className="mt-6 border border-hairline bg-hairline/30 px-4 py-3 text-sm">
          <strong className="font-medium">Qué cambió en la versión {version}:</strong>{" "}
          {lastChange.nota}
        </p>
      )}

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
              {SHOW_PSE && (
                <div className="flex justify-between text-component">
                  <dt>Con PSE</dt>
                  <dd className="font-mono">{formatCOP(o.totales.conPse)}</dd>
                </div>
              )}
            </dl>
          </div>
        ))}
      </div>

      <section className="mt-10 space-y-6" aria-labelledby="ajustes">
        <h2 id="ajustes" className="text-lg font-semibold">
          ¿Y ahora?
        </h2>

        {pendingRequest?.tipo === "compra" ? (
          <div className="space-y-2 border border-hairline p-6 text-sm">
            <p className="font-medium">
              Pediste comprar el {fmtMoment.format(new Date(pendingRequest.creado))}. Te
              contactamos para coordinar el pago y la entrega.
            </p>
            <p className="text-component">
              <strong className="font-medium text-panda">Opción:</strong>{" "}
              {optionName(pendingRequest.opcionPreferida)}
              {pendingRequest.formaPago && (
                <>
                  {" · "}
                  <strong className="font-medium text-panda">Pago:</strong>{" "}
                  {PAYMENT_LABEL[pendingRequest.formaPago]}
                  {pendingRequest.totalCop ? ` · ${formatCOP(pendingRequest.totalCop)}` : ""}
                </>
              )}
            </p>
            {pendingRequest.comentario && (
              <p className="whitespace-pre-line border-l-2 border-hairline pl-3 text-component">
                {pendingRequest.comentario}
              </p>
            )}
          </div>
        ) : pendingRequest ? (
          <div className="space-y-2 border border-hairline p-6 text-sm">
            <p className="font-medium">
              Pediste cambios el {fmtMoment.format(new Date(pendingRequest.creado))}. Te avisamos
              por correo cuando la nueva versión esté lista.
            </p>
            <p className="text-component">
              <strong className="font-medium text-panda">Opción:</strong>{" "}
              {optionName(pendingRequest.opcionPreferida)}
            </p>
            <p className="whitespace-pre-line border-l-2 border-hairline pl-3 text-component">
              {pendingRequest.comentario}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="border border-hairline p-6">
              <h3 className="font-semibold">Quiero comprar</h3>
              <p className="mb-4 mt-1 text-sm text-component">
                Elige la opción y cómo pagarías. No se cobra nada: te contactamos para acordar
                todo.
              </p>
              <PurchaseForm
                quoteId={id}
                options={quote.opciones.map((o) => ({ titulo: o.titulo, totales: o.totales }))}
              />
            </div>
            <div className="border border-hairline p-6">
              <h3 className="font-semibold">Quiero ajustar algo</h3>
              <p className="mb-4 mt-1 text-sm text-component">
                Cuéntanos qué te gustaría cambiar y preparamos una versión nueva.
              </p>
              <RevisionForm quoteId={id} options={quote.opciones.map((o) => o.titulo)} />
            </div>
          </div>
        )}

        {pastRequests.length > 0 && (
          <div className="border-t border-hairline pt-4">
            <h3 className="text-sm font-medium text-component">Solicitudes anteriores</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {pastRequests.map((r) => (
                <li key={r._id!.toString()} className="text-component">
                  <span className="font-mono text-xs">{fmtMoment.format(new Date(r.creado))}</span>{" "}
                  · {r.tipo === "compra" ? "Compra" : "Cambios"} · {optionName(r.opcionPreferida)}
                  {r.comentario ? `: ${r.comentario}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

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
