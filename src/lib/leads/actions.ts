"use server";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */

import { after } from "next/server";
import { z } from "zod";
import { collections } from "@/lib/db/collections";
import { sendTelegramMessage } from "@/lib/telegram";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { RECAPTCHA_ACTION } from "@/lib/leads/constants";

const LeadInput = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre completo."),
  telefono: z.string().trim().min(7, "Escribe un teléfono válido."),
  correo: z.string().trim().email("Escribe un correo válido."),
  resumen: z.string().trim().min(1),
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
    });
  } catch {
    return { ok: false, error: "No se pudo guardar la solicitud. Intenta de nuevo." };
  }

  // La notificación no debe demorar la respuesta al usuario.
  after(() =>
    sendTelegramMessage(
      `🖥️ <b>Nueva cotización</b>\n` +
        `<b>Nombre:</b> ${escapeHtml(nombre)}\n` +
        `<b>Teléfono:</b> ${escapeHtml(telefono)}\n` +
        `<b>Correo:</b> ${escapeHtml(correo)}\n\n` +
        `${escapeHtml(resumen)}`,
    ),
  );

  return { ok: true };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
