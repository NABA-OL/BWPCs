/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import Link from "next/link";
import {
  annulCuentaCobroAction,
  checkBoldPaymentAction,
  confirmPaymentAction,
  rejectPaymentReportAction,
  saveCardLinkAction,
  sendCuentaCobroAction,
} from "@/app/admin/(panel)/cuentas-cobro/actions";
import { ESTADO_LABEL, estadoDe, sendMissing } from "@/lib/cuenta-cobro-estado";
import type { CuentaCobro } from "@/lib/db/types";
import { boldAvailable } from "@/lib/bold-payments";
import { formatCOP } from "@/lib/format";
import { PAYMENT_LABEL, cardIsManual } from "@/lib/payment-methods";

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
  "border border-hairline px-3 py-1.5 text-xs font-medium text-component transition-colors hover:border-panda hover:text-panda";
const PRIMARY =
  "bg-panda px-4 py-2 text-xs font-medium uppercase tracking-wide text-vanilla transition-colors hover:bg-accent";

function ActionForm({
  id,
  action,
  className,
  children,
}: {
  id: string;
  action: (form: FormData) => Promise<void>;
  className: string;
  children: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}

/** Estado de una cuenta de cobro, su historial y las acciones del admin. */
export function CuentaCobroStatusPanel({
  cuenta,
  ownerLabel,
}: {
  cuenta: CuentaCobro;
  ownerLabel: string | null;
}) {
  const id = cuenta._id!.toString();
  const estado = estadoDe(cuenta);
  const missing = sendMissing(cuenta, cardIsManual(cuenta.total, boldAvailable()));
  const canSend = (estado === "borrador" || estado === "correccion_solicitada") && missing.length === 0;
  const lastNote = cuenta.historial?.at(-1)?.nota;

  return (
    <section className="mt-8 border border-hairline p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            Estado:{" "}
            <span className={estado === "pago_reportado" || estado === "correccion_solicitada" ? "text-accent" : ""}>
              {ESTADO_LABEL[estado]}
            </span>
          </h2>
          {cuenta.formaPago && (
            <p className="mt-1 text-sm text-component">
              Medio de pago: <strong className="font-medium text-panda">{PAYMENT_LABEL[cuenta.formaPago]}</strong>
            </p>
          )}
          <p className="mt-1 text-sm text-component">
            {cuenta.origen && (
              <>
                Generada desde una solicitud de compra.{" "}
                <Link
                  href={`/admin/cotizaciones/${cuenta.origen.quoteId}`}
                  className="underline hover:no-underline"
                >
                  Ver cotización
                </Link>
                <br />
              </>
            )}
            {cuenta.userId ? (
              <>
                Para: <strong className="font-medium text-panda">{ownerLabel ?? "cuenta eliminada"}</strong>
              </>
            ) : (
              "Sin cuenta de cliente en la web: solo registro tuyo."
            )}
          </p>
          {estado === "correccion_solicitada" && lastNote && (
            <p className="mt-3 border border-accent/30 bg-accent/5 p-3 text-sm">
              <strong className="font-medium text-accent">El cliente pide corregir:</strong> {lastNote}
            </p>
          )}
          {estado === "pago_reportado" && (
            <p className="mt-3 border border-accent/30 bg-accent/5 p-3 text-sm">
              El cliente avisó que ya pagó. Confirma en el banco y marca el pago recibido.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(estado === "borrador" || estado === "correccion_solicitada") && (
            <form action={sendCuentaCobroAction}>
              <input type="hidden" name="id" value={id} />
              <button type="submit" disabled={!canSend} className={`${PRIMARY} disabled:cursor-not-allowed disabled:opacity-40`}>
                {estado === "borrador" ? "Enviar al cliente y avisar" : "Reenviar corregida"}
              </button>
            </form>
          )}
          {(estado === "enviada" || estado === "pago_reportado") && (
            <ActionForm id={id} action={confirmPaymentAction} className={PRIMARY}>
              Confirmar pago recibido
            </ActionForm>
          )}
          {estado === "pago_reportado" && (
            <ActionForm id={id} action={rejectPaymentReportAction} className={BTN}>
              No vi el pago
            </ActionForm>
          )}
          {cuenta.pagoBold && !cuenta.pagoBold.paymentId && estado !== "pagada" && estado !== "anulada" && (
            <ActionForm id={id} action={checkBoldPaymentAction} className={BTN}>
              Consultar pago en Bold
            </ActionForm>
          )}
          {estado !== "pagada" && estado !== "anulada" && (
            <ActionForm id={id} action={annulCuentaCobroAction} className={`${BTN} text-accent`}>
              Anular
            </ActionForm>
          )}
        </div>
      </div>

      {cuenta.formaPago === "tarjeta" &&
        cardIsManual(cuenta.total, boldAvailable()) &&
        estado === "enviada" && (
        <form action={saveCardLinkAction} className="mt-5 border-t border-hairline pt-4">
          <input type="hidden" name="id" value={id} />
          <h3 className="text-sm font-medium">Enlace de pago con tarjeta</h3>
          <p className="mt-1 text-xs text-component">
            Este valor no se cobra solo con tarjeta. Crea el enlace en Bold por{" "}
            <strong className="font-mono text-panda">{formatCOP(cuenta.total)}</strong> y pégalo aquí.{" "}
            Le avisamos por correo. Él paga allá y sube el comprobante.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              name="enlace"
              type="url"
              required
              defaultValue={cuenta.enlacePagoTarjeta ?? ""}
              placeholder="https://checkout.bold.co/payment/LNK_…"
              className="min-w-64 flex-1 border border-hairline bg-vanilla px-3 py-2 font-mono text-xs outline-none focus:border-panda"
            />
            <button type="submit" className={PRIMARY}>
              {cuenta.enlacePagoTarjeta ? "Actualizar enlace" : "Guardar y avisar"}
            </button>
          </div>
        </form>
      )}

      {cuenta.pagoBold && (
        <p className="mt-4 border-t border-hairline pt-4 text-xs text-component">
          Bold ({cuenta.pagoBold.mode === "test" ? "pruebas" : "producción"}): enlace{" "}
          <span className="font-mono">{cuenta.pagoBold.linkId}</span> por{" "}
          <span className="font-mono">{formatCOP(cuenta.pagoBold.totalCop)}</span>, creado el {fmt(cuenta.pagoBold.creadoEn)}
          {cuenta.pagoBold.aprobadoEn
            ? ` · aprobado el ${fmt(cuenta.pagoBold.aprobadoEn)} (pago ${cuenta.pagoBold.paymentId})`
            : cuenta.pagoBold.rechazadoEn
              ? ` · rechazado el ${fmt(cuenta.pagoBold.rechazadoEn)}`
              : ""}
          .
        </p>
      )}

      {cuenta.comprobantes && cuenta.comprobantes.length > 0 && (
        <div className="mt-5 border-t border-hairline pt-4">
          <h3 className="text-sm font-medium">
            Comprobante{cuenta.comprobantes.length > 1 ? "s" : ""} del cliente
          </h3>
          <ul className="mt-3 flex flex-wrap gap-4">
            {cuenta.comprobantes.map((c) => (
              <li key={c.id} className="text-xs text-component">
                <a href={`/api/comprobantes/${c.id}`} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element -- imagen privada servida con sesión */}
                  <img
                    src={`/api/comprobantes/${c.id}`}
                    alt="Comprobante de pago"
                    width={c.width}
                    height={c.height}
                    className="max-h-56 w-auto border border-hairline"
                  />
                </a>
                <p className="mt-1 font-mono">{fmt(c.subidoEn)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(estado === "borrador" || estado === "correccion_solicitada") && (
        <p className="mt-3 text-xs text-component">
          {missing.length > 0
            ? `Para enviarla: ${missing.join(", ")}.`
            : "Guarda antes tus cambios en el formulario de abajo: el cliente ve la cuenta tal como está guardada."}
        </p>
      )}

      {cuenta.historial && cuenta.historial.length > 0 && (
        <ol className="mt-5 space-y-1 border-t border-hairline pt-4 text-xs text-component">
          {cuenta.historial.map((h, i) => (
            <li key={i}>
              <span className="font-mono">{fmt(h.en)}</span> · {ESTADO_LABEL[h.estado]} ({h.por}
              {h.nota ? ` · ${h.nota}` : ""})
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
