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
import { CardPayButton, RefreshWhilePending } from "@/components/account/card-payment";
import { QrZoom } from "@/components/account/qr-zoom";
import { ProofLink } from "@/components/proof-viewer";
import { CuentaCobroActions, ExpiredNotice } from "@/components/account/cuenta-cobro-actions";
import { PaymentMethodPicker, type MethodChoice } from "@/components/account/payment-method-picker";
import { getMyCuentaCobro } from "@/lib/account/cuentas-cobro";
import { boldAvailable, reconcileBoldLink } from "@/lib/bold-payments";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { ESTADO_LABEL, estadoDe } from "@/lib/cuenta-cobro-estado";
import { estaVencida } from "@/lib/cuenta-cobro-vigencia";
import { formatCOP } from "@/lib/format";
import { withPaymentMethod } from "@/lib/cuenta-cobro";
import { getSettings } from "@/lib/admin/settings";
import {
  DEFAULT_PAYMENT_METHOD,
  OFFERED_PAYMENT_METHODS,
  PAYMENT_LABEL,
  cardIsManual,
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
  // Vencida: pasaron las 72 h y sigue "por pagar"; no se muestra cómo pagar hasta que B & W revise los precios.
  const vencida = estaVencida(cuenta);
  const payable = estado === "enviada" && !vencida;
  const { cuentaBanco: banco } = cuenta;
  const method = cuenta.formaPago ?? DEFAULT_PAYMENT_METHOD;
  const isCash = method === "efectivo";
  const isCard = method === "tarjeta" || method === "pse";
  // Tarjeta que se cobra sola con Bold, o con enlace que crea el admin (sobre el tope de Bold o sin Bold).
  const manualCard = method === "tarjeta" && cardIsManual(cuenta.total, boldAvailable());
  const autoCard = method === "tarjeta" && !manualCard;
  const cardLink = cuenta.enlacePagoTarjeta ?? null;
  const canReportPayment = method === "bre-b" || method === "transferencia" || (manualCard && cardLink !== null);
  // Total de la cuenta con cada medio (el recargo de la tarjeta se suma al valor base).
  const { mediosPago } = await getSettings();
  const choices: MethodChoice[] = OFFERED_PAYMENT_METHODS.map((m) => {
    const total = withPaymentMethod(
      cuenta.items,
      cuenta.descuentoPct,
      surchargePct(m.id, mediosPago),
      surchargeConcept(m.id),
    ).total;
    return { id: m.id, label: m.label, total, disabledReason: null };
  });
  const lastProof = cuenta.comprobantes?.at(-1);
  const lastCorrection =
    estado === "correccion_solicitada"
      ? cuenta.historial?.findLast((h) => h.estado === "correccion_solicitada")?.nota
      : null;
  // La nota interna de "pidió revisar precios" no se le muestra al cliente como si la hubiera escrito él.
  const askedReprice = lastCorrection?.startsWith("Cuenta vencida") ?? false;

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
            <span className="font-medium text-panda">{vencida ? "Vencida" : ESTADO_LABEL[estado]}</span>
            {payable && cuenta.venceEn && <> · válida hasta el {fmtMoment.format(new Date(cuenta.venceEn))}</>}
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

      {payable && cuenta.venceEn && (
        <p className="mt-6 border border-hairline bg-hairline/30 px-4 py-3 text-sm">
          <strong className="font-medium">Vigencia de 72 horas.</strong> Los precios pueden cambiar por ofertas o por
          subidas y bajadas de precio en Estados Unidos y el dólar. Si pagas después del {fmtMoment.format(new Date(cuenta.venceEn))},
          tendrás que enviar la cuenta a revisión para que confirmemos los precios.
        </p>
      )}

      {vencida && cuenta.venceEn && (
        <div className="mt-6">
          <ExpiredNotice id={id} venceEn={fmtMoment.format(new Date(cuenta.venceEn))} />
        </div>
      )}

      {payable && (
        <div className="mt-6">
          <PaymentMethodPicker id={id} current={method} choices={choices} hasChoice={cuenta.formaPago !== undefined} />
        </div>
      )}

      {(payable || estado === "pago_reportado") && (
        <div className="mt-6 border border-hairline p-5 text-sm">
          <h2 className="font-semibold">Cómo pagar con {PAYMENT_LABEL[method]}</h2>

          {method === "bre-b" && (
            <div className="mt-3 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <QrZoom
                src={BRE_B_QR.src}
                width={BRE_B_QR.width}
                height={BRE_B_QR.height}
                alt="Código QR de Bre-B para pagar"
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

          {autoCard && estado === "enviada" && (
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
                  Bold no aprobó el pago. Puedes intentarlo de nuevo con otra tarjeta o elegir Bre-B.
                </p>
              )}
              <CardPayButton id={id} total={cuenta.total} />
            </>
          )}

          {manualCard && (
            <div className="mt-3 space-y-3">
              <p className="text-component">El total incluye el recargo de la tarjeta.</p>
              {cardLink ? (
                <>
                  <a
                    href={cardLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-panda px-6 py-3 text-sm font-medium uppercase tracking-wide text-vanilla transition-colors hover:bg-accent"
                  >
                    Pagar con tarjeta · {formatCOP(cuenta.total)}
                  </a>
                  <p className="text-xs text-component">
                    Pagas en Bold, una pasarela segura; B &amp; W no ve los datos de tu tarjeta. Cuando termines, guarda el
                    comprobante (captura o descarga) y súbelo abajo para que lo confirmemos.
                  </p>
                </>
              ) : (
                <p className="border border-hairline p-3">
                  Estamos preparando tu enlace de pago con tarjeta. Te avisamos por correo cuando esté listo.
                </p>
              )}
            </div>
          )}

          {isCard && !autoCard && !manualCard && (
            <p className="mt-3 text-component">
              Te contactamos para hacer el cobro con tarjeta por un enlace de pago seguro. El total incluye el recargo del medio.
            </p>
          )}
        </div>
      )}

      <div className="mt-8">
        {payable && <CuentaCobroActions id={id} canReportPayment={canReportPayment} />}
        {estado === "pago_reportado" && (
          <p className="border border-hairline p-5 text-sm">
            Avisaste tu pago
            {cuenta.pagoReportadoEn ? ` el ${fmtMoment.format(new Date(cuenta.pagoReportadoEn))}` : ""}.
            Lo confirmamos contra el banco y te dejamos la cuenta como pagada.
          </p>
        )}
        {estado === "correccion_solicitada" && (
          <div className="space-y-2 border border-hairline p-5 text-sm">
            <p className="font-medium">
              {askedReprice
                ? "Enviaste la cuenta a revisión de precios. Confirmamos que sigan iguales (o los actualizamos) y te avisamos por correo con la cuenta y una vigencia nueva."
                : "Pediste una corrección. Te enviamos la cuenta corregida por correo."}
            </p>
            {lastCorrection && !askedReprice && (
              <p className="whitespace-pre-line border-l-2 border-hairline pl-3 text-component">
                {lastCorrection}
              </p>
            )}
          </div>
        )}
        {lastProof && (estado === "pago_reportado" || estado === "pagada") && (
          <p className="mt-3 text-sm">
            <ProofLink
              proofs={(cuenta.comprobantes ?? []).map((c) => ({ id: c.id, width: c.width, height: c.height }))}
            >
              Ver el comprobante que enviaste
            </ProofLink>
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
