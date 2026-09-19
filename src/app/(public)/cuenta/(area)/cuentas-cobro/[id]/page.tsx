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
import Image from "next/image";
import { CardPayButton, RefreshWhilePending } from "@/components/account/card-payment";
import { CuentaCobroActions } from "@/components/account/cuenta-cobro-actions";
import { PaymentMethodPicker, type MethodChoice } from "@/components/account/payment-method-picker";
import { getMyCuentaCobro } from "@/lib/account/cuentas-cobro";
import { boldAvailable, reconcileBoldLink } from "@/lib/bold-payments";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { ESTADO_LABEL, estadoDe } from "@/lib/cuenta-cobro-estado";
import { formatCOP } from "@/lib/format";
import { withPaymentMethod } from "@/lib/cuenta-cobro";
import { getSettings } from "@/lib/admin/settings";
import {
  CARD_MAX_COP,
  OFFERED_PAYMENT_METHODS,
  PAYMENT_LABEL,
  surchargeConcept,
  surchargePct,
} from "@/lib/payment-methods";
import { BRE_B_QR, whatsappLink } from "@/lib/site-config";
import { getUserSession } from "@/lib/user-auth/session";

export const metadata: Metadata = { title: "Cuenta de cobro" };

const fmtMoment = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function CuentaCobroPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bold?: string }>;
}) {
  const { id } = await params;
  const { bold } = await searchParams;
  const session = await getUserSession();
  if (!session) {
    redirect(`/cuenta/ingresar?next=${encodeURIComponent(`/cuenta/cuentas-cobro/${id}`)}`);
  }

  let cuenta = await getMyCuentaCobro(session.user.id, id);
  if (!cuenta) notFound();

  // Al volver del checkout de Bold se consulta el estado del enlace (no dependemos solo del webhook).
  let boldStatus: string | null = null;
  if (bold && cuenta.pagoBold && estadoDe(cuenta) === "enviada") {
    const { allowed } = await rateLimitStorage.consume(`bold-consulta:${session.user.id}`, { window: 3600, max: 40 });
    if (allowed) {
      try {
        boldStatus = (await reconcileBoldLink(cuenta))?.status ?? null;
      } catch (error) {
        console.error("[bold] no se pudo consultar al volver del checkout", error);
      }
      cuenta = (await getMyCuentaCobro(session.user.id, id)) ?? cuenta;
    }
  }

  const estado = estadoDe(cuenta);
  const { cuentaBanco: banco } = cuenta;
  const method = cuenta.formaPago ?? "transferencia";
  const isCash = method === "efectivo";
  const isCard = method === "tarjeta" || method === "pse";
  // Total de la cuenta con cada medio (el recargo de la tarjeta se suma al valor base).
  const { mediosPago } = await getSettings();
  const choices: MethodChoice[] = OFFERED_PAYMENT_METHODS.map((m) => {
    const total = withPaymentMethod(
      cuenta.items,
      cuenta.descuentoPct,
      surchargePct(m.id, mediosPago),
      surchargeConcept(m.id),
    ).total;
    return {
      id: m.id,
      label: m.label,
      total,
      disabledReason:
        m.id === "tarjeta" && total > CARD_MAX_COP ? "Solo disponible hasta $5.000.000" : null,
    };
  });
  const lastProof = cuenta.comprobantes?.at(-1);
  const lastCorrection =
    estado === "correccion_solicitada"
      ? cuenta.historial?.findLast((h) => h.estado === "correccion_solicitada")?.nota
      : null;

  return (
    <section className="max-w-3xl">
      <Link href="/cuenta/cuentas-cobro" className="text-sm text-component hover:text-panda">
        ← Cuentas de cobro
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Cuenta de cobro <span className="font-mono">{cuenta.numero}</span>
          </h1>
          <p className="mt-1 text-sm text-component">
            <span className="font-medium text-panda">{ESTADO_LABEL[estado]}</span>
          </p>
        </div>
        <a
          href={`/cuenta/cuentas-cobro/${id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-panda px-5 py-2.5 text-sm font-medium uppercase tracking-wide transition-colors hover:bg-panda hover:text-vanilla"
        >
          Descargar PDF
        </a>
      </div>

      <div className="mt-8 border border-hairline bg-vanilla">
        <ul className="divide-y divide-hairline">
          {cuenta.items.map((i, n) => (
            <li key={n} className="flex items-start justify-between gap-4 px-5 py-3 text-sm">
              <div>
                <p className="font-medium">{i.descripcion}</p>
                <p className="text-xs text-component">
                  {i.cantidad} × {formatCOP(i.valorUnitario)}
                </p>
              </div>
              <p className="shrink-0 font-mono">{formatCOP(i.cantidad * i.valorUnitario)}</p>
            </li>
          ))}
        </ul>
        <dl className="space-y-1 border-t border-hairline bg-hairline/30 px-5 py-4 text-sm">
          {cuenta.descuentoValor > 0 && (
            <div className="flex justify-between text-component">
              <dt>Descuento ({cuenta.descuentoPct}%)</dt>
              <dd className="font-mono">−{formatCOP(cuenta.descuentoValor)}</dd>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <dt>Total a pagar</dt>
            <dd className="font-mono">{formatCOP(cuenta.total)}</dd>
          </div>
        </dl>
      </div>

      {estado === "enviada" && (
        <div className="mt-6">
          <PaymentMethodPicker id={id} current={method} choices={choices} />
        </div>
      )}

      {(estado === "enviada" || estado === "pago_reportado") && (
        <div className="mt-6 border border-hairline p-5 text-sm">
          <h2 className="font-semibold">Cómo pagar con {PAYMENT_LABEL[method]}</h2>

          {method === "bre-b" && (
            <div className="mt-3 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <Image
                src={BRE_B_QR.src}
                width={BRE_B_QR.width}
                height={BRE_B_QR.height}
                alt="Código QR de Bre-B para pagar"
                className="h-auto w-56 border border-hairline"
              />
              <div className="space-y-2">
                <p>
                  Escanea el QR con la app de tu banco o pega la llave. El QR no trae el valor: escribe{" "}
                  <strong className="font-mono">{formatCOP(cuenta.total)}</strong>.
                </p>
                {banco.llave && (
                  <p>
                    Llave Bre-B: <span className="font-mono">{banco.llave}</span>
                  </p>
                )}
                <p className="text-component">
                  {banco.banco} · {banco.titular}
                </p>
              </div>
            </div>
          )}

          {method === "transferencia" && (
            <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
              <dt className="text-component">Banco</dt>
              <dd>{banco.banco}</dd>
              {banco.numero && (
                <>
                  <dt className="text-component">Cuenta {banco.tipoCuenta?.toLowerCase()}</dt>
                  <dd className="font-mono">{banco.numero}</dd>
                </>
              )}
              <dt className="text-component">Titular</dt>
              <dd>{banco.titular}</dd>
              <dt className="text-component">Valor exacto</dt>
              <dd className="font-mono">{formatCOP(cuenta.total)}</dd>
            </dl>
          )}

          {isCash && (
            <p className="mt-3 text-component">
              Coordinamos contigo el pago en efectivo. No tienes que subir comprobante: lo confirmamos nosotros al recibirlo.
            </p>
          )}

          {isCard && estado === "enviada" && boldAvailable() && method === "tarjeta" && (
            <>
              <p className="mt-3 text-component">El total incluye el recargo de la tarjeta.</p>
              {boldStatus === "PROCESSING" && (
                <>
                  <p className="mt-3 border border-hairline p-3">Estamos confirmando tu pago con Bold. Esta página se actualiza sola.</p>
                  <RefreshWhilePending />
                </>
              )}
              {boldStatus === "REJECTED" && (
                <p className="mt-3 border border-accent/30 bg-accent/5 p-3 text-accent">
                  Bold no aprobó el pago. Puedes intentarlo de nuevo con otra tarjeta o elegir Bre-B o transferencia.
                </p>
              )}
              <CardPayButton id={id} total={cuenta.total} />
            </>
          )}
          {isCard && !(estado === "enviada" && boldAvailable() && method === "tarjeta") && (
            <p className="mt-3 text-component">
              Te contactamos para hacer el cobro con tarjeta por un enlace de pago seguro. El total incluye el recargo del medio.
            </p>
          )}
        </div>
      )}

      <div className="mt-8">
        {estado === "enviada" && <CuentaCobroActions id={id} canReportPayment={!isCash && !isCard} />}
        {estado === "pago_reportado" && (
          <p className="border border-hairline p-5 text-sm">
            Avisaste tu pago
            {cuenta.pagoReportadoEn ? ` el ${fmtMoment.format(new Date(cuenta.pagoReportadoEn))}` : ""}.
            Lo confirmamos contra el banco y te dejamos la cuenta como pagada.
          </p>
        )}
        {estado === "correccion_solicitada" && (
          <div className="space-y-2 border border-hairline p-5 text-sm">
            <p className="font-medium">Pediste una corrección. Te enviamos la cuenta corregida por correo.</p>
            {lastCorrection && (
              <p className="whitespace-pre-line border-l-2 border-hairline pl-3 text-component">
                {lastCorrection}
              </p>
            )}
          </div>
        )}
        {lastProof && (estado === "pago_reportado" || estado === "pagada") && (
          <p className="mt-3 text-sm">
            <a
              href={`/api/comprobantes/${lastProof.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Ver el comprobante que enviaste
            </a>
          </p>
        )}
        {estado === "pagada" && (
          <p className="border border-hairline p-5 text-sm">
            Pago confirmado
            {cuenta.pagadaEn ? ` el ${fmtMoment.format(new Date(cuenta.pagadaEn))}` : ""}. ¡Gracias!
          </p>
        )}
        {estado === "anulada" && (
          <p className="border border-hairline p-5 text-sm text-component">
            Esta cuenta de cobro fue anulada; no tienes que pagarla.
          </p>
        )}
      </div>

      <p className="mt-6 text-sm text-component">
        ¿Dudas?{" "}
        <a
          href={whatsappLink(`Hola B & W, tengo una duda sobre mi cuenta de cobro ${cuenta.numero}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Escríbenos por WhatsApp
        </a>
        .
      </p>
    </section>
  );
}
