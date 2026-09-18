/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyLeads, getMyQuotes } from "@/lib/account/quotes";
import { formatCOP } from "@/lib/format";
import { whatsappLink } from "@/lib/site-config";
import { getUserSession } from "@/lib/user-auth/session";
import { deleteSavedEstimateAction } from "./actions";

export const metadata: Metadata = { title: "Mis cotizaciones" };

// `fecha` de una cotización es solo fecha (guardada a medianoche UTC): se
// muestra en UTC para no correrla un día. `creado` sí es un instante (Bogotá).
const fmtFecha = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const fmtFechaCotizacion = new Intl.DateTimeFormat("es-CO", {
  timeZone: "UTC",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function MisCotizacionesPage() {
  const session = await getUserSession();
  if (!session) redirect("/cuenta/ingresar?next=/cuenta/cotizaciones");

  const [quotes, leads] = await Promise.all([
    getMyQuotes(session.user.id),
    getMyLeads(session.user.id),
  ]);

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <Link href="/cuenta" className="text-sm text-component hover:text-panda">
        ← Mi cuenta
      </Link>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
        Mis cotizaciones
      </h1>

      <h2 className="mt-10 text-lg font-semibold">Cotizaciones de B &amp; W</h2>
      {quotes.length === 0 ? (
        <p className="mt-3 border border-hairline p-6 text-sm text-component">
          Aún no tienes cotizaciones. Cuando preparemos una para ti, te
          avisaremos por correo y aparecerá aquí.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-hairline border border-hairline">
          {quotes.map((q) => (
            <li key={q._id!.toString()}>
              <Link
                href={`/cuenta/cotizaciones/${q._id!.toString()}`}
                className="flex flex-wrap items-center justify-between gap-3 p-5 transition-colors hover:bg-hairline/30"
              >
                <div>
                  <p className="font-mono font-medium">{q.codigo}</p>
                  <p className="mt-0.5 text-xs text-component">
                    {fmtFechaCotizacion.format(new Date(q.fecha))} ·{" "}
                    {q.opciones.length === 1
                      ? "1 opción"
                      : `${q.opciones.length} opciones`}
                  </p>
                </div>
                <p className="font-mono text-sm">
                  desde{" "}
                  {formatCOP(Math.min(...q.opciones.map((o) => o.totales.base)))}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 text-lg font-semibold">
        Mis selecciones y solicitudes
      </h2>
      {leads.length === 0 ? (
        <p className="mt-3 border border-hairline p-6 text-sm text-component">
          Aquí aparecen las selecciones que guardes desde el{" "}
          <Link href="/cotizador" className="text-accent hover:underline">
            cotizador
          </Link>{" "}
          y las solicitudes que envíes con tu sesión iniciada.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-hairline border border-hairline">
          {leads.map((l) => {
            const saved = l.tipo === "guardada";
            const id = l._id!.toString();
            return (
              <li key={id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-component">
                    <span className="mr-2 border border-hairline px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide">
                      {saved ? "Guardada" : "Enviada"}
                    </span>
                    {fmtFecha.format(new Date(l.creado))}
                  </p>
                  {saved && (
                    <div className="flex items-center gap-4 text-sm">
                      <a
                        href={whatsappLink(
                          `Hola B & W, quiero cotizar esta selección:\n${l.resumen}`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        Pedir por WhatsApp
                      </a>
                      <form action={deleteSavedEstimateAction}>
                        <input type="hidden" name="id" value={id} />
                        <button
                          type="submit"
                          className="text-component hover:text-panda"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  )}
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">
                  {l.resumen}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
