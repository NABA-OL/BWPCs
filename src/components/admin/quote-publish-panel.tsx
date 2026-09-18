/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import {
  publishQuoteAction,
  resendQuoteNoticeAction,
  unpublishQuoteAction,
} from "@/app/admin/(panel)/cotizaciones/actions";
import type { Quote } from "@/lib/db/types";

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
}: {
  quote: Quote;
  userLabel: string | null;
}) {
  const id = quote._id!.toString();
  const published = quote.estado === "publicada";

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
    </section>
  );
}
