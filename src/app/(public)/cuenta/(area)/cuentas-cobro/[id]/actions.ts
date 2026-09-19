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
import { moveCuentaCobro, setCuentaPaymentMethod } from "@/lib/cuentas-cobro";
import { boldAvailable, getOrCreateBoldLink } from "@/lib/bold-payments";
import { formatCOP } from "@/lib/format";
import { OFFERED_PAYMENT_METHODS, cardIsManual } from "@/lib/payment-methods";
import type { PaymentMethod } from "@/lib/db/types";
import { shortName } from "@/lib/reviews/rules";
import { sendTelegramMessage } from "@/lib/telegram";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { getUserSession } from "@/lib/user-auth/session";
import { siteUrl } from "@/lib/user-auth/site-url";

export type CuentaCobroResult = { ok: true } | { ok: false; error: string };

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function guard(id: unknown) {
  if (!ACCOUNTS_ENABLED) return { ok: false, error: "No disponible." } as const;
  const session = await getUserSession();
  if (!session) return { ok: false, error: "Tu sesión expiró. Ingresa de nuevo." } as const;
  if (typeof id !== "string" || id.length > 40) {
    return { ok: false, error: "No encontramos esa cuenta de cobro." } as const;
  }
  const { allowed } = await rateLimitStorage.consume(`cuenta-cobro:${session.user.id}`, {
    window: 86400,
    max: 30,
  });
  if (!allowed) {
    return { ok: false, error: "Hiciste muchas acciones hoy. Prueba mañana o escríbenos por WhatsApp." } as const;
  }
  return { ok: true, user: session.user } as const;
}

function revalidate(id: string) {
  revalidatePath("/cuenta", "layout"); // avisos de la cuenta (cuentas por pagar)
  revalidatePath(`/cuenta/cuentas-cobro/${id}`);
  revalidatePath("/cuenta/cuentas-cobro");
  revalidatePath("/admin/cuentas-cobro");
  revalidatePath("/admin");
}

const correctionSchema = z.object({
  id: z.string().max(40),
  nota: z.string().trim().min(10).max(500),
});

/** El cliente pide corregir algo de la cuenta (nombre, valor, datos…). */
export async function requestCorrectionAction(input: unknown): Promise<CuentaCobroResult> {
  const parsed = correctionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Cuéntanos qué hay que corregir (entre 10 y 500 caracteres)." };
  }
  const checked = await guard(parsed.data.id);
  if (!checked.ok) return checked;
  const { user } = checked;

  // Sin caracteres de control ni líneas en blanco repetidas.
  const nota = parsed.data.nota
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\n{3,}/g, "\n\n");

  const updated = await moveCuentaCobro(parsed.data.id, {
    from: ["enviada"],
    to: "correccion_solicitada",
    por: "cliente",
    userId: user.id,
    nota,
  });
  if (!updated) return { ok: false, error: "Esta cuenta de cobro ya no admite correcciones." };

  after(() =>
    sendTelegramMessage(
      `✏️ <b>Corrección pedida a una cuenta de cobro</b>\n` +
        `<b>De:</b> ${escapeHtml(shortName(user.name))}\n` +
        `<b>Cuenta de cobro:</b> ${escapeHtml(updated.numero)}\n\n` +
        `${siteUrl}/admin/cuentas-cobro/${parsed.data.id}`,
      "pagos",
    ),
  );
  revalidate(parsed.data.id);
  return { ok: true };
}

const methodSchema = z.object({
  id: z.string().max(40),
  method: z.enum(OFFERED_PAYMENT_METHODS.map((m) => m.id) as [string, ...string[]]),
});

/** El cliente elige con qué medio va a pagar; el total de la cuenta se ajusta al medio. */
export async function setPaymentMethodAction(input: unknown): Promise<CuentaCobroResult> {
  const parsed = methodSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Elige uno de los medios de pago de la lista." };
  const checked = await guard(parsed.data.id);
  if (!checked.ok) return checked;

  const result = await setCuentaPaymentMethod(parsed.data.id, checked.user.id, parsed.data.method as PaymentMethod);
  if (!result.ok) return result;

  // Con tarjeta que no se cobra sola (sobre el tope de Bold o sin Bold) el admin debe crear el enlace.
  if (parsed.data.method === "tarjeta" && cardIsManual(result.total, boldAvailable())) {
    after(() =>
      sendTelegramMessage(
        `💳 <b>Eligió pagar con tarjeta: falta el enlace de pago</b>\n` +
          `<b>De:</b> ${escapeHtml(shortName(checked.user.name))}\n` +
          `<b>Cuenta de cobro:</b> ${escapeHtml(result.numero)} · ${formatCOP(result.total)}\n\n` +
          `${siteUrl}/admin/cuentas-cobro/${parsed.data.id}`,
        "pagos",
      ),
    );
  }
  revalidate(parsed.data.id);
  return { ok: true };
}

/** Lleva al cliente al checkout de Bold (tarjeta): crea o reutiliza el enlace de pago de su cuenta. */
export async function startCardPaymentAction(id: unknown): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const checked = await guard(id);
  if (!checked.ok) return checked;
  return getOrCreateBoldLink(id as string, { id: checked.user.id, email: checked.user.email });
}
