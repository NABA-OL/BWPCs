/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import {
  closeRequestAction,
  publishQuoteAction,
  resendQuoteNoticeAction,
  sendRevisionAction,
  unpublishQuoteAction,
} from "@/app/admin/(panel)/cotizaciones/actions";
import Link from "next/link";
import type { CuentaCobroEstado, Quote, QuoteRequest } from "@/lib/db/types";
import { ESTADO_LABEL, estadoDe } from "@/lib/cuenta-cobro-estado";
import { formatCOP } from "@/lib/format";
import { PAYMENT_LABEL } from "@/lib/payment-methods";

function fmt(d: Date): string {
  return new Date(d).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const BTN =
  "border px-3 py-1.5 text-xs font-medium transition-colors hover:border-panda hover:text-panda";

/** Estado de publicación de una cotización y sus acciones (solo admin). */
export function QuotePublishPanel({
  quote,
  userLabel,
  requests,
  cuenta,
}: {
  quote: Quote;
  userLabel: string | null;
  requests: QuoteRequest[];
  /** Cuenta de cobro generada desde esta cotización (si ya existe). */
  cuenta: { id: string; numero: string; estado?: CuentaCobroEstado } | null;
}) {
  const id = quote._id!.toString();
  const published = quote.estado === "publicada";
  const pending = requests.find((r) => r.estado === "pendiente");
  const version = quote.version ?? 1;

  return (
    <section className="mt-8 border border-hairline p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Publicación</h2>
          {!quote.userId ? (
            <p className="mt-1 text-sm text-component">
              Asigna una cuenta de cliente y guarda para poder publicarla.
            </p>
          ) : (
            <p className="mt-1 text-sm text-component">
              Para: <strong className="font-medium text-panda">{userLabel ?? "cuenta eliminada"}</strong>
              {" · "}
              {published ? (
                <span className="font-medium text-panda">
                  Publicada{quote.publicadaEn ? ` el ${fmt(quote.publicadaEn)}` : ""}
                </span>
              ) : (
                "Borrador (el cliente no la ve)"
              )}
            </p>
          )}
          {published && (
            <p className="mt-1 text-xs text-component">
              Versión {version} ·{" "}
              {quote.avisoEnviadoEn
                ? `Aviso por correo enviado el ${fmt(quote.avisoEnviadoEn)}`
                : "El aviso por correo no salió. Reenvíalo."}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {quote.userId && !published && (
            <form action={publishQuoteAction}>
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                className="bg-panda px-4 py-2 text-xs font-medium uppercase tracking-wide text-vanilla transition-colors hover:bg-accent"
              >
                Publicar y avisar
              </button>
            </form>
          )}
          {published && (
            <>
              <form action={resendQuoteNoticeAction}>
                <input type="hidden" name="id" value={id} />
                <button type="submit" className={`${BTN} border-hairline text-component`}>
                  Reenviar aviso
                </button>
              </form>
              <form action={unpublishQuoteAction}>
                <input type="hidden" name="id" value={id} />
                <button type="submit" className={`${BTN} border-hairline text-component`}>
                  Despublicar
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {published && (
        <div className="mt-6 border-t border-hairline pt-5">
          {pending?.tipo === "compra" ? (
            <div className="mb-4 border border-accent/30 bg-accent/5 p-4 text-sm">
              <p className="font-medium text-accent">
                El cliente quiere comprar ({fmt(pending.creado)})
              </p>
              <p className="mt-1 text-component">
                Opción:{" "}
                <strong className="font-medium text-panda">
                  {quote.opciones[pending.opcionPreferida ?? -1]?.titulo ?? "opción eliminada"}
                </strong>
                {" · "}
                Pago:{" "}
                <strong className="font-medium text-panda">
                  {pending.formaPago ? PAYMENT_LABEL[pending.formaPago] : "—"}
                  {pending.totalCop ? ` · ${formatCOP(pending.totalCop)}` : ""}
                </strong>
              </p>
              {pending.comentario && <p className="mt-2 whitespace-pre-line">{pending.comentario}</p>}
              <p className="mt-2 text-sm">
                {cuenta ? (
                  <>
                    Cuenta de cobro <span className="font-mono">{cuenta.numero}</span> (
                    {ESTADO_LABEL[estadoDe(cuenta)]}):{" "}
                    <Link href={`/admin/cuentas-cobro/${cuenta.id}`} className="font-medium text-accent hover:underline">
                      revisarla y enviarla
                    </Link>
                  </>
                ) : (
                  <span className="text-component">
                    Todavía no hay cuenta de cobro generada. Recarga en unos segundos; si no aparece, créala a mano en Cuentas de cobro.
                  </span>
                )}
              </p>
              <p className="mt-2 text-xs text-component">
                Sus datos de facturación (si los dio) están en{" "}
                <Link href="/admin/clientes" className="underline hover:no-underline">
                  Clientes
                </Link>
                .
              </p>
              <form action={closeRequestAction} className="mt-3">
                <input type="hidden" name="id" value={id} />
                <button type="submit" className={`${BTN} border-hairline text-component`}>
                  Marcar como atendida
                </button>
              </form>
            </div>
          ) : pending ? (
            <div className="mb-4 border border-accent/30 bg-accent/5 p-4 text-sm">
              <p className="font-medium text-accent">
                El cliente pidió cambios ({fmt(pending.creado)})
              </p>
              <p className="mt-1 text-component">
                Opción preferida:{" "}
                <strong className="font-medium text-panda">
                  {pending.opcionPreferida === null
                    ? "sin preferencia"
                    : (quote.opciones[pending.opcionPreferida]?.titulo ?? "opción eliminada")}
                </strong>
              </p>
              <p className="mt-2 whitespace-pre-line">{pending.comentario}</p>
            </div>
          ) : null}
          <form action={sendRevisionAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="id" value={id} />
            <label className="block min-w-64 flex-1">
              <span className="text-xs font-medium text-component">
                Qué cambió (lo ve el cliente, opcional)
              </span>
              <input
                name="nota"
                maxLength={500}
                placeholder="Ej.: subimos la RAM a 32 GB y cambiamos la fuente"
                className="mt-1 w-full border border-hairline bg-vanilla px-3 py-2 text-sm outline-none focus:border-panda"
              />
            </label>
            <button
              type="submit"
              className="bg-panda px-4 py-2 text-xs font-medium uppercase tracking-wide text-vanilla transition-colors hover:bg-accent"
            >
              Enviar versión {version + 1} y avisar
            </button>
          </form>
          <p className="mt-2 text-xs text-component">
            Guarda antes tus cambios en el formulario de abajo: el cliente ve la cotización tal
            como está guardada.
          </p>
          {requests.some((r) => r.estado !== "pendiente") && (
            <ul className="mt-4 space-y-1 text-xs text-component">
              {requests
                .filter((r) => r.estado !== "pendiente")
                .map((r) => (
                  <li key={r._id!.toString()}>
                    <span className="font-mono">{fmt(r.creado)}</span> ·{" "}
                    {r.tipo === "compra" ? "compra" : "cambios"} · {r.estado}
                    {r.comentario ? ` · ${r.comentario}` : ""}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
