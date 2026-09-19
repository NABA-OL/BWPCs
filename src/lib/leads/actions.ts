"use server";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { collections } from "@/lib/db/collections";
import { sendTelegramMessage } from "@/lib/telegram";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { RECAPTCHA_ACTION } from "@/lib/leads/constants";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { getUserSession } from "@/lib/user-auth/session";

const LeadInput = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre completo."),
  telefono: z.string().trim().min(7, "Escribe un teléfono válido."),
  correo: z.string().trim().email("Escribe un correo válido."),
  // Tope: el resumen viaja por Telegram (límite de 4096 caracteres) y se guarda tal cual.
  resumen: z.string().trim().min(1).max(2000),
  pagina: z.string().trim().min(1),
  recaptchaToken: z.string().optional(),
});

export interface SubmitLeadResult {
  ok: boolean;
  error?: string;
}

/**
 * Guarda la solicitud (para seguimiento interno) y notifica por Telegram.
 * No bloquea al usuario si Telegram falla — solo se registra el error.
 * No requiere sesión: la llama cualquier visitante público del cotizador.
 */
export async function submitLead(
  input: z.infer<typeof LeadInput>,
): Promise<SubmitLeadResult> {
  const parsed = LeadInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { nombre, telefono, correo, resumen, pagina, recaptchaToken } =
    parsed.data;

  const captcha = await verifyRecaptcha(recaptchaToken, RECAPTCHA_ACTION);
  if (!captcha.ok) {
    return { ok: false, error: captcha.error };
  }

  // Con sesión iniciada la solicitud queda también en la cuenta. Si la sesión
  // no se puede leer, la solicitud se guarda igual (sin cuenta).
  const userId = await currentUserId();

  try {
    const col = await collections.leads();
    await col.insertOne({
      nombre,
      telefono,
      correo,
      resumen,
      pagina,
      revisado: false,
      creado: new Date(),
      userId,
    });
  } catch {
    return { ok: false, error: "No se pudo guardar la solicitud. Intenta de nuevo." };
  }

  // La notificación no debe demorar la respuesta al usuario.
  after(() => notifyNewLead({ nombre, telefono, correo, resumen }));

  return { ok: true };
}

function notifyNewLead(lead: { nombre: string; telefono: string; correo: string; resumen: string }) {
  return sendTelegramMessage(
    `🖥️ <b>Nueva cotización</b>\n` +
      `<b>Nombre:</b> ${escapeHtml(lead.nombre)}\n` +
      `<b>Teléfono:</b> ${escapeHtml(lead.telefono)}\n` +
      `<b>Correo:</b> ${escapeHtml(lead.correo)}\n\n` +
      `${escapeHtml(lead.resumen)}`,
  );
}

async function currentUserId(): Promise<string | null> {
  if (!ACCOUNTS_ENABLED) return null;
  try {
    return (await getUserSession())?.user.id ?? null;
  } catch {
    return null;
  }
}

const MAX_SAVED_ESTIMATES = 20;

/**
 * Guarda la selección del cotizador en la cuenta, sin abrir WhatsApp ni avisar por Telegram
 * (no es una solicitud a B & W). Ya no tiene botón propio: la usa `SaveEstimate` al volver de
 * crear una cuenta o iniciar sesión con una selección pendiente.
 */
export async function saveEstimateAction(input: {
  resumen: string;
}): Promise<SubmitLeadResult> {
  if (!ACCOUNTS_ENABLED) return { ok: false, error: "No disponible." };

  const parsed = z.string().trim().min(1).max(2000).safeParse(input.resumen);
  if (!parsed.success) return { ok: false, error: "Selecciona algo para guardar." };

  const session = await getUserSession();
  if (!session) return { ok: false, error: "Inicia sesión para guardar." };
  const { user } = session;

  const { allowed } = await rateLimitStorage.consume(`saveest:${user.id}`, {
    window: 3600,
    max: 10,
  });
  if (!allowed) {
    return { ok: false, error: "Demasiados intentos. Prueba de nuevo más tarde." };
  }

  const col = await collections.leads();
  const saved = await col.countDocuments({ userId: user.id, tipo: "guardada" });
  if (saved >= MAX_SAVED_ESTIMATES) {
    return {
      ok: false,
      error: `Ya tienes ${MAX_SAVED_ESTIMATES} selecciones guardadas. Elimina alguna en Mis cotizaciones.`,
    };
  }

  await col.insertOne({
    nombre: user.name,
    telefono: user.phone,
    correo: user.email,
    resumen: parsed.data,
    pagina: "cotizador",
    revisado: true,
    creado: new Date(),
    userId: user.id,
    tipo: "guardada",
  });
  return { ok: true };
}

/**
 * "Solicitar cotización" con la sesión iniciada: manda la selección a B & W (solicitudes del
 * admin + Telegram) con los datos de la cuenta, sin pasar por WhatsApp, y queda en la cuenta
 * como "Enviada". Sin reCAPTCHA: la cuenta ya está verificada y el límite es por usuario.
 */
export async function requestEstimateAction(input: {
  resumen: string;
}): Promise<SubmitLeadResult> {
  if (!ACCOUNTS_ENABLED) return { ok: false, error: "No disponible." };

  const parsed = z.string().trim().min(1).max(2000).safeParse(input.resumen);
  if (!parsed.success) return { ok: false, error: "Selecciona algo para cotizar." };

  const session = await getUserSession();
  if (!session) return { ok: false, error: "Inicia sesión para solicitar la cotización." };
  const { user } = session;

  const { allowed } = await rateLimitStorage.consume(`solicitud:${user.id}`, {
    window: 3600,
    max: 5,
  });
  if (!allowed) {
    return { ok: false, error: "Enviaste varias solicitudes seguidas. Prueba de nuevo más tarde." };
  }

  const lead = { nombre: user.name, telefono: user.phone, correo: user.email, resumen: parsed.data };
  try {
    await (await collections.leads()).insertOne({
      ...lead,
      pagina: "cotizador",
      revisado: false,
      creado: new Date(),
      userId: user.id,
    });
  } catch {
    return { ok: false, error: "No se pudo enviar la solicitud. Intenta de nuevo." };
  }

  after(() => notifyNewLead(lead));
  revalidatePath("/cuenta");
  return { ok: true };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
