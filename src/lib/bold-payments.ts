/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { MongoServerError, ObjectId } from "mongodb";
import { after } from "next/server";
import { boldReference } from "@/lib/bold-signature";
import { boldConfig, getPaymentLink, createPaymentLink, BoldError, type BoldConfig } from "@/lib/bold";
import { VENCIDA_ERROR, estaVencida } from "@/lib/cuenta-cobro-vigencia";
import { cuentasCol, moveCuentaCobro } from "@/lib/cuentas-cobro";
import { collections } from "@/lib/db/collections";
import type { CuentaCobro, PagoBold } from "@/lib/db/types";
import { formatCOP } from "@/lib/format";
import { CARD_MAX_COP } from "@/lib/payment-methods";
import { shortName } from "@/lib/reviews/rules";
import { sendTelegramMessage } from "@/lib/telegram";
import { siteUrl } from "@/lib/user-auth/site-url";

const LINK_TTL_MS = 2 * 60 * 60 * 1000;
/** Un enlace vivo solo se reutiliza si le queda al menos esto (para no mandar al cliente a uno por vencer). */
const MIN_REUSE_MS = 10 * 60 * 1000;
/** Mínimo por enlace con tarjeta en Bold. */
const CARD_MIN_COP = 1_000;

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Aviso al tema "pagos" sin frenar la respuesta (fuera de una petición se envía directo). */
function notify(text: string) {
  const run = () => sendTelegramMessage(text, "pagos");
  try {
    after(run);
  } catch {
    void run();
  }
}

const adminLink = (cuenta: CuentaCobro) => `${siteUrl}/admin/cuentas-cobro/${cuenta._id!.toString()}`;
const who = (cuenta: CuentaCobro) => escapeHtml(shortName(cuenta.cliente.nombre));

export function boldAvailable(): boolean {
  return boldConfig() !== null;
}

export type LinkResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Enlace de pago con tarjeta de una cuenta de cobro propia y "por pagar" cuyo medio es
 * tarjeta. Reutiliza el enlace vivo del mismo valor; si no, crea uno (2 h de vigencia).
 */
export async function getOrCreateBoldLink(
  cuentaId: string,
  user: { id: string; email: string },
): Promise<LinkResult> {
  const config = boldConfig();
  if (!config) return { ok: false, error: "El pago con tarjeta no está disponible por ahora. Elige Bre-B o transferencia." };
  if (!ObjectId.isValid(cuentaId)) return { ok: false, error: "No encontramos esa cuenta de cobro." };

  const col = await cuentasCol();
  const cuenta = await col.findOne({ _id: new ObjectId(cuentaId), userId: user.id, estado: "enviada" });
  if (!cuenta) return { ok: false, error: "Esta cuenta de cobro ya no admite pagos." };
  if (estaVencida(cuenta)) return { ok: false, error: VENCIDA_ERROR };
  if (cuenta.formaPago !== "tarjeta") return { ok: false, error: "Elige la tarjeta como medio de pago." };
  if (cuenta.total > CARD_MAX_COP || cuenta.total < CARD_MIN_COP) {
    return { ok: false, error: "El valor no está dentro de lo que se puede pagar con tarjeta. Elige Bre-B o transferencia." };
  }

  const now = Date.now();
  const live = cuenta.pagoBold;
  if (
    live &&
    live.mode === config.mode &&
    live.totalCop === cuenta.total &&
    !live.paymentId &&
    live.expiraEn.getTime() - now > MIN_REUSE_MS
  ) {
    return { ok: true, url: live.url };
  }

  const expiresAtMs = now + LINK_TTL_MS;
  const reference = boldReference(cuentaId, now);
  let created: { linkId: string; url: string };
  try {
    created = await createPaymentLink(config, {
      totalCop: cuenta.total,
      reference,
      description: `Cuenta de cobro ${cuenta.numero} - BW`,
      payerEmail: user.email,
      expiresAtMs,
      callbackUrl: `${siteUrl}/cuenta/cuentas-cobro/${cuentaId}?bold=1`,
    });
  } catch (error) {
    if (error instanceof BoldError) return { ok: false, error: error.message };
    throw error;
  }

  const pagoBold: PagoBold = {
    linkId: created.linkId,
    url: created.url,
    reference,
    totalCop: cuenta.total,
    mode: config.mode,
    creadoEn: new Date(now),
    expiraEn: new Date(expiresAtMs),
  };
  // Solo si la cuenta sigue "por pagar" y con el mismo total (nadie cambió el medio mientras tanto).
  const saved = await col.updateOne(
    {
      _id: cuenta._id,
      userId: user.id,
      estado: "enviada",
      total: cuenta.total,
      $or: [{ venceEn: null }, { venceEn: { $exists: false } }, { venceEn: { $gt: new Date() } }],
    },
    { $set: { pagoBold } },
  );
  if (saved.modifiedCount !== 1) return { ok: false, error: "La cuenta cambió mientras preparábamos el pago. Inténtalo de nuevo." };
  return { ok: true, url: created.url };
}

export type ApprovalOutcome = "applied" | "already" | "blocked";

/**
 * Bold confirmó el pago: la cuenta pasa a "pagada" (actor "sistema"). Es idempotente y
 * atómica: el webhook, la consulta al volver del checkout y un reintento pueden coincidir.
 * Si el estado no lo permite (anulada, borrador…) devuelve "blocked" y NO cambia nada.
 */
export async function applyBoldApproval(
  cuenta: CuentaCobro,
  info: { paymentId: string; paidCop: number },
): Promise<ApprovalOutcome> {
  const now = new Date();
  const mismatch = info.paidCop !== cuenta.total;
  const updated = await moveCuentaCobro(cuenta._id!.toString(), {
    from: ["enviada", "pago_reportado", "correccion_solicitada"],
    to: "pagada",
    por: "sistema",
    nota:
      `Pago con tarjeta confirmado por Bold (${info.paymentId})` +
      (mismatch ? ` · pagó ${formatCOP(info.paidCop)} y la cuenta era de ${formatCOP(cuenta.total)}: revisar` : "") +
      (estaVencida(cuenta) ? " · la cuenta ya había vencido: verifica que los precios no hayan cambiado" : ""),
    set: {
      pagadaEn: now,
      formaPago: "tarjeta",
      pagoBold: cuenta.pagoBold ? { ...cuenta.pagoBold, paymentId: info.paymentId, aprobadoEn: now } : cuenta.pagoBold,
    },
  });
  if (updated) return "applied";
  const current = await (await cuentasCol()).findOne({ _id: cuenta._id }, { projection: { estado: 1, pagoBold: 1 } });
  return current?.estado === "pagada" && current.pagoBold?.paymentId === info.paymentId ? "already" : "blocked";
}

function announceApproval(cuenta: CuentaCobro, outcome: ApprovalOutcome, paidCop: number) {
  if (outcome === "applied") {
    notify(
      `💳 <b>Pago con tarjeta aprobado</b>\n<b>De:</b> ${who(cuenta)}\n` +
        `<b>Cuenta de cobro:</b> ${escapeHtml(cuenta.numero)} · ${formatCOP(paidCop)}\n` +
        (estaVencida(cuenta) ? `⚠️ Pagó con la cuenta vencida: verifica que los precios no hayan cambiado.\n` : "") +
        `\n${adminLink(cuenta)}`,
    );
  } else if (outcome === "blocked") {
    notify(
      `⚠️ <b>Pago con tarjeta recibido en una cuenta que no admite pagos</b> (${escapeHtml(cuenta.numero)}, ${formatCOP(paidCop)}). Revísalo y devuelve el dinero si corresponde.\n\n${adminLink(cuenta)}`,
    );
  }
}

export interface ReconcileResult {
  status: string;
  outcome?: ApprovalOutcome;
}

/**
 * Consulta a Bold el estado del enlace y aplica lo que corresponda. Sirve al volver del
 * checkout y como respaldo si el webhook se demora. La respuesta viene de servidor a
 * servidor con nuestra llave, así que es confiable sin firma.
 */
export async function reconcileBoldLink(cuenta: CuentaCobro, config: BoldConfig | null = boldConfig()): Promise<ReconcileResult | null> {
  const pago = cuenta.pagoBold;
  if (!config || !pago || pago.mode !== config.mode) return null;

  const link = await getPaymentLink(config, pago.linkId);
  // Llaves de pruebas y de producción nunca se mezclan; y el enlace debe ser el nuestro.
  if (link.isSandbox !== (config.mode === "test")) {
    console.error("[bold] el ambiente del enlace no coincide con BOLD_MODE");
    return null;
  }
  if (link.reference && link.reference !== pago.reference) return null;

  if (link.status === "PAID") {
    if (link.totalCop !== pago.totalCop) {
      notify(
        `⚠️ <b>Pago de Bold con monto distinto</b> (${escapeHtml(cuenta.numero)}: esperado ${formatCOP(pago.totalCop)}, pagado ${formatCOP(link.totalCop)}). No se marcó como pagada.\n\n${adminLink(cuenta)}`,
      );
      return { status: "PAID_MISMATCH" };
    }
    const outcome = await applyBoldApproval(cuenta, {
      paymentId: link.transactionId ?? `link:${pago.linkId}`,
      paidCop: link.totalCop,
    });
    announceApproval(cuenta, outcome, link.totalCop);
    return { status: link.status, outcome };
  }
  if (link.status === "REJECTED" && !pago.rechazadoEn) {
    await (await cuentasCol()).updateOne({ _id: cuenta._id }, { $set: { "pagoBold.rechazadoEn": new Date() } });
  }
  return { status: link.status };
}

interface BoldWebhookEvent {
  id?: unknown;
  type?: unknown;
  data?: {
    payment_id?: unknown;
    amount?: { currency?: unknown; total?: unknown };
    metadata?: { reference?: unknown };
  };
}

/** Procesa un evento de webhook YA autenticado (firma válida). Idempotente por id de evento. */
export async function handleBoldEvent(raw: unknown, config: BoldConfig): Promise<void> {
  const event = raw as BoldWebhookEvent;
  const eventId = typeof event?.id === "string" ? event.id : null;
  const type = typeof event?.type === "string" ? event.type : null;
  const reference = typeof event?.data?.metadata?.reference === "string" ? event.data.metadata.reference : null;
  const paymentId = typeof event?.data?.payment_id === "string" ? event.data.payment_id : null;
  if (!eventId || !type || !reference) return; // no es un evento de nuestros enlaces

  const events = await collections.boldEvents();
  if (await events.findOne({ _id: eventId }, { projection: { _id: 1 } })) return; // reintento de algo ya procesado

  const col = await cuentasCol();
  const cuenta = await col.findOne({ "pagoBold.reference": reference, "pagoBold.mode": config.mode });
  let cuentaId: string | null = null;

  if (cuenta?.pagoBold) {
    cuentaId = cuenta._id!.toString();
    const pago = cuenta.pagoBold;
    const total = Math.round(Number(event.data?.amount?.total) || 0);

    if (type === "SALE_APPROVED" && paymentId) {
      if (event.data?.amount?.currency !== "COP" || total !== pago.totalCop) {
        notify(
          `⚠️ <b>Pago de Bold con monto distinto</b> (${escapeHtml(cuenta.numero)}: esperado ${formatCOP(pago.totalCop)}, recibido ${formatCOP(total)}). No se marcó como pagada.\n\n${adminLink(cuenta)}`,
        );
      } else {
        announceApproval(cuenta, await applyBoldApproval(cuenta, { paymentId, paidCop: total }), total);
      }
    } else if (type === "SALE_REJECTED") {
      await col.updateOne({ _id: cuenta._id }, { $set: { "pagoBold.rechazadoEn": new Date() } });
      notify(`❌ <b>Pago con tarjeta rechazado</b>\n<b>De:</b> ${who(cuenta)}\n<b>Cuenta de cobro:</b> ${escapeHtml(cuenta.numero)}\n\n${adminLink(cuenta)}`);
    } else if (type === "VOID_APPROVED" && paymentId && cuenta.estado === "pagada" && pago.paymentId === paymentId) {
      // Bold devolvió el dinero: la cuenta vuelve a "por pagar" y se vence el enlace.
      const { paymentId: _paid, aprobadoEn: _approved, ...rest } = pago;
      void _paid;
      void _approved;
      await moveCuentaCobro(cuentaId, {
        from: ["pagada"],
        to: "enviada",
        por: "sistema",
        nota: "Bold anuló el pago con tarjeta (devolución)",
        set: { pagadaEn: null, pagoBold: { ...rest, expiraEn: new Date() } },
      });
      notify(`↩️ <b>Bold anuló un pago con tarjeta</b>\n<b>Cuenta de cobro:</b> ${escapeHtml(cuenta.numero)} volvió a "por pagar".\n\n${adminLink(cuenta)}`);
    } else if (type === "VOID_APPROVED" || type === "VOID_REJECTED") {
      notify(`ℹ️ <b>Bold: ${type}</b> en la cuenta ${escapeHtml(cuenta.numero)}. Revísalo en el panel de Bold.\n\n${adminLink(cuenta)}`);
    }
  } else {
    // Una venta aprobada con referencia NUESTRA (id de cuenta + tiempo) que ya no es el enlace
    // vigente de la cuenta (p. ej. pagaron uno anterior): hay dinero recibido sin cerrar la cuenta.
    // Las ventas de otras integraciones del comercio (datáfono, etc.) no llevan este formato: se ignoran.
    const ours = /^([0-9a-f]{24})-[a-z0-9]+$/.exec(reference);
    if (type === "SALE_APPROVED" && ours) {
      const stray = ObjectId.isValid(ours[1]) ? await col.findOne({ _id: new ObjectId(ours[1]) }, { projection: { numero: 1 } }) : null;
      if (stray) {
        cuentaId = ours[1];
        notify(
          `⚠️ <b>Pago aprobado en un enlace anterior de Bold</b> (cuenta ${escapeHtml(stray.numero)}, ${formatCOP(Math.round(Number(event.data?.amount?.total) || 0))}). La cuenta no se cerró sola: confírmalo en el panel de Bold y márcala pagada si corresponde.\n\n${siteUrl}/admin/cuentas-cobro/${ours[1]}`,
        );
      }
    }
    if (!cuentaId) console.error("[bold] evento de un enlace desconocido", type);
  }

  try {
    await events.insertOne({ _id: eventId, tipo: type, paymentId, cuentaId, recibidoEn: new Date() });
  } catch (error) {
    if (!(error instanceof MongoServerError && error.code === 11000)) throw error; // otra entrega simultánea ya lo anotó
  }
}
