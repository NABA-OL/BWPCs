"use server";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { getMyQuote, isQuotePurchased } from "@/lib/account/quotes";
import { collections } from "@/lib/db/collections";
import { ensureClientForUser } from "@/lib/clients";
import { issueCuentaFromPurchase } from "@/lib/cuenta-cobro-draft";
import { notifyCuentaSent } from "@/lib/cuenta-cobro-send";
import { cotizacionVigente, VIGENCIA_HORAS } from "@/lib/cuenta-cobro-vigencia";
import { getCuentaForQuote } from "@/lib/cuentas-cobro";
import { formatCOP } from "@/lib/format";
import { CARD_MAX_COP, OFFERED_PAYMENT_METHODS, PAYMENT_LABEL, totalFor } from "@/lib/payment-methods";
import {
  MAX_PURCHASES_PER_QUOTE,
  MAX_REVISIONS_PER_QUOTE,
  REVISION_MAX_CHARS,
  REVISION_MIN_CHARS,
} from "@/lib/quote-limits";
import { createQuoteRequest, type CreateRequestResult } from "@/lib/quote-requests";
import { shortName } from "@/lib/reviews/rules";
import { sendTelegramMessage } from "@/lib/telegram";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { getUserSession } from "@/lib/user-auth/session";
import { siteUrl } from "@/lib/user-auth/site-url";

export type RequestResult = { ok: true } | { ok: false; error: string };

const LIVE_CUENTA_ESTADOS = ["enviada", "correccion_solicitada", "pago_reportado"];

const fmtVence = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "numeric",
  minute: "2-digit",
});

const revisionSchema = z.object({
  quoteId: z.string().max(40),
  opcionPreferida: z.number().int().min(0).max(20).nullable(),
  comentario: z.string().trim().min(REVISION_MIN_CHARS).max(REVISION_MAX_CHARS),
});

const paymentIds = OFFERED_PAYMENT_METHODS.map((m) => m.id) as [string, ...string[]];

const purchaseSchema = z.object({
  quoteId: z.string().max(40),
  opcion: z.number().int().min(0).max(20),
  formaPago: z.enum(paymentIds),
  // Cédula o NIT: dígitos, letras, puntos, guion y espacios.
  identificacion: z
    .string()
    .trim()
    .max(20)
    .regex(/^[0-9A-Za-z.\- ]*$/),
  direccion: z.string().trim().max(160),
  comentario: z.string().trim().max(500),
});

const PURCHASED_ERROR = "Esta cotización ya fue comprada. Si quieres algo nuevo, solicita otra cotización.";

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Sin caracteres de control y sin más de una línea en blanco seguida. */
const clean = (v: string) =>
  v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/\n{3,}/g, "\n\n");

function refusal(result: Extract<CreateRequestResult, { ok: false }>, limit: number): string {
  return result.reason === "pending"
    ? "Ya tienes una solicitud pendiente para esta cotización. Te respondemos por aquí y por correo."
    : `Llegaste al máximo de ${limit} solicitudes de este tipo para esta cotización. Escríbenos por WhatsApp.`;
}

/** El cliente pide ajustes a una cotización publicada suya. */
export async function requestRevisionAction(input: unknown): Promise<RequestResult> {
  if (!ACCOUNTS_ENABLED) return { ok: false, error: "No disponible." };

  const session = await getUserSession();
  if (!session) return { ok: false, error: "Tu sesión expiró. Ingresa de nuevo." };
  const { user } = session;

  const parsed = revisionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Cuéntanos qué quieres cambiar (entre ${REVISION_MIN_CHARS} y ${REVISION_MAX_CHARS} caracteres).`,
    };
  }
  const { opcionPreferida } = parsed.data;

  const quote = await getMyQuote(user.id, parsed.data.quoteId);
  if (!quote) return { ok: false, error: "No encontramos esa cotización." };
  // Siempre el id real del documento (isValid acepta cadenas de 12 caracteres que no son hex).
  const quoteId = quote._id.toString();
  if (await isQuotePurchased(quoteId)) return { ok: false, error: PURCHASED_ERROR };
  if (opcionPreferida !== null && opcionPreferida >= quote.opciones.length) {
    return { ok: false, error: "Elige una de las opciones de la lista." };
  }

  const { allowed } = await rateLimitStorage.consume(`revision:${user.id}`, {
    window: 86400,
    max: 5,
  });
  if (!allowed) {
    return {
      ok: false,
      error: "Ya enviaste varias solicitudes hoy. Prueba mañana o escríbenos por WhatsApp.",
    };
  }

  const result = await createQuoteRequest("revision", {
    quoteId,
    userId: user.id,
    opcionPreferida,
    comentario: clean(parsed.data.comentario),
    versionBase: quote.version ?? 1,
  });
  if (!result.ok) return { ok: false, error: refusal(result, MAX_REVISIONS_PER_QUOTE) };

  const option =
    opcionPreferida === null ? "sin preferencia" : quote.opciones[opcionPreferida].titulo;
  after(() =>
    sendTelegramMessage(
      `✏️ <b>Cambios pedidos a una cotización</b>\n` +
        `<b>De:</b> ${escapeHtml(shortName(user.name))}\n` +
        `<b>Cotización:</b> ${escapeHtml(quote.codigo)}\n` +
        `<b>Opción:</b> ${escapeHtml(option)}\n\n` +
        `${siteUrl}/admin/cotizaciones/${quoteId}`,
      "cotizaciones",
    ),
  );

  revalidateAfterRequest(quoteId);
  return { ok: true };
}

/** El cliente dice "quiero esta opción" y cómo pagaría. Crea su cliente fiscal la primera vez. */
export async function requestPurchaseAction(input: unknown): Promise<RequestResult> {
  if (!ACCOUNTS_ENABLED) return { ok: false, error: "No disponible." };

  const session = await getUserSession();
  if (!session) return { ok: false, error: "Tu sesión expiró. Ingresa de nuevo." };
  const { user } = session;

  const parsed = purchaseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisa los datos: elige la opción y la forma de pago." };
  }
  const { opcion } = parsed.data;
  const formaPago = parsed.data.formaPago as (typeof OFFERED_PAYMENT_METHODS)[number]["id"];

  const quote = await getMyQuote(user.id, parsed.data.quoteId);
  if (!quote) return { ok: false, error: "No encontramos esa cotización." };
  const quoteId = quote._id.toString();
  if (await isQuotePurchased(quoteId)) return { ok: false, error: PURCHASED_ERROR };
  const chosen = quote.opciones[opcion];
  if (!chosen) return { ok: false, error: "Elige una de las opciones de la lista." };

  // Ya tiene una cuenta de cobro viva de esta cotización: se paga esa, no se pide otra.
  const live = await getCuentaForQuote(quoteId);
  if (live?.estado && LIVE_CUENTA_ESTADOS.includes(live.estado)) {
    return { ok: false, error: "Ya tienes una cuenta de cobro de esta cotización. Págala desde Cuentas de cobro." };
  }
  // La cuenta de cobro necesita la identificación del cliente: se pide al comprar, salvo que ya la tengamos.
  const known = await (await collections.clients()).findOne({ userId: user.id }, { projection: { identificacion: 1 } });
  if (!parsed.data.identificacion && !known?.identificacion?.trim()) {
    return { ok: false, error: "Escribe tu cédula o NIT: la necesitamos para tu cuenta de cobro." };
  }

  const { allowed } = await rateLimitStorage.consume(`compra:${user.id}`, {
    window: 86400,
    max: 3,
  });
  if (!allowed) {
    return {
      ok: false,
      error: "Ya enviaste varias solicitudes hoy. Prueba mañana o escríbenos por WhatsApp.",
    };
  }

  const totalCop = totalFor(formaPago, chosen.totales);
  const result = await createQuoteRequest("compra", {
    quoteId,
    userId: user.id,
    opcionPreferida: opcion,
    formaPago,
    totalCop,
    comentario: clean(parsed.data.comentario),
    versionBase: quote.version ?? 1,
  });
  if (!result.ok) return { ok: false, error: refusal(result, MAX_PURCHASES_PER_QUOTE) };

  try {
    await ensureClientForUser(
      { id: user.id, name: user.name, email: user.email, phone: user.phone },
      { identificacion: parsed.data.identificacion, direccion: clean(parsed.data.direccion) },
    );
  } catch (error) {
    // La solicitud ya quedó registrada; el admin puede crear el cliente a mano.
    console.error("[compra] no se pudo crear el cliente", error);
  }

  // La cuenta de cobro sale sola si el precio de la cotización sigue vigente y no falta ningún dato; si no,
  // queda en borrador para que el admin revise los precios o complete lo que falte.
  const fresh = cotizacionVigente(quote);
  let issued: Awaited<ReturnType<typeof issueCuentaFromPurchase>> = null;
  try {
    issued = await issueCuentaFromPurchase({
      quote,
      userId: user.id,
      requestId: result.requestId,
      opcion,
      formaPago,
      autoEmit: fresh,
    });
  } catch (error) {
    console.error("[compra] no se pudo generar la cuenta de cobro", error);
  }
  const sent = issued?.sent ?? null;
  if (sent) after(() => notifyCuentaSent(sent));
  revalidatePath("/admin/cuentas-cobro");

  const outcome = sent
    ? `✅ Cuenta de cobro ${escapeHtml(sent.cuenta.numero)} enviada automáticamente` +
      (sent.cuenta.venceEn ? ` (vence ${fmtVence.format(sent.cuenta.venceEn)}).\n` : ".\n")
    : !fresh
      ? `⏰ La cotización tiene más de ${VIGENCIA_HORAS} h: revisa los precios y envía la cuenta de cobro (quedó en borrador).\n`
      : `📝 La cuenta de cobro quedó en borrador: falta algún dato (o es tarjeta con enlace manual).\n`;

  after(() =>
    sendTelegramMessage(
      `🛒 <b>Quiere comprar</b>\n` +
        `<b>De:</b> ${escapeHtml(shortName(user.name))}\n` +
        `<b>Cotización:</b> ${escapeHtml(quote.codigo)}\n` +
        `<b>Opción:</b> ${escapeHtml(chosen.titulo)}\n` +
        `<b>Pago:</b> ${PAYMENT_LABEL[formaPago]} · ${formatCOP(totalCop)}\n` +
        (formaPago === "tarjeta" && totalCop > CARD_MAX_COP ? `⚠️ Sobre el tope de Bold: genera tú el enlace de pago.\n` : "") +
        outcome +
        `\n` +
        `${siteUrl}/admin/cotizaciones/${quoteId}`,
      "compras",
    ),
  );

  revalidateAfterRequest(quoteId);
  revalidatePath("/admin/clientes");
  return { ok: true };
}

function revalidateAfterRequest(quoteId: string) {
  revalidatePath("/cuenta", "layout"); // avisos de la cuenta (cuenta de cobro por pagar)
  revalidatePath("/cuenta/cuentas-cobro");
  revalidatePath(`/cuenta/cotizaciones/${quoteId}`);
  revalidatePath("/admin/cotizaciones");
  revalidatePath("/admin");
}

/** El cliente abrió su cotización: deja de contar como "nueva" en los avisos de su cuenta. */
export async function markQuoteSeenAction(id: unknown): Promise<void> {
  if (!ACCOUNTS_ENABLED || typeof id !== "string" || id.length > 40) return;
  const session = await getUserSession();
  if (!session) return;
  const quote = await getMyQuote(session.user.id, id);
  if (!quote) return;
  const version = quote.version ?? 1;
  if ((quote.vistaVersion ?? 0) >= version) return;
  await (await collections.quotes()).updateOne({ _id: quote._id }, { $set: { vistaVersion: version } });
  revalidatePath("/cuenta", "layout"); // refresca el aviso de arriba
}
