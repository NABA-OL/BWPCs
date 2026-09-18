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
import { hasPublishedQuote } from "@/lib/account/quotes";
import {
  REVIEW_MAX_CHARS,
  REVIEW_MAX_PHOTOS,
  REVIEW_MIN_CHARS,
} from "@/lib/reviews/rules";
import { saveMyReview } from "@/lib/reviews/reviews";
import { sendTelegramMessage } from "@/lib/telegram";
import { InvalidPhotosError } from "@/lib/uploads/review-photos";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { getUserSession } from "@/lib/user-auth/session";
import { siteUrl } from "@/lib/user-auth/site-url";

export type ReviewResult = { ok: true } | { ok: false; error: string };

const reviewSchema = z.object({
  estrellas: z.number().int().min(1).max(5),
  comentario: z.string().trim().min(REVIEW_MIN_CHARS).max(REVIEW_MAX_CHARS),
  fotoIds: z.array(z.string().max(40)).max(REVIEW_MAX_PHOTOS),
});

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Envía (o edita) la reseña de la cuenta; queda pendiente de moderación. */
export async function submitReviewAction(input: unknown): Promise<ReviewResult> {
  if (!ACCOUNTS_ENABLED) return { ok: false, error: "No disponible." };

  const session = await getUserSession();
  if (!session) return { ok: false, error: "Tu sesión expiró. Ingresa de nuevo." };
  const { user } = session;

  if (!(await hasPublishedQuote(user.id))) {
    return {
      ok: false,
      error: "Podrás dejar tu reseña cuando tengas una cotización con B & W.",
    };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Elige de 1 a 5 estrellas y escribe entre ${REVIEW_MIN_CHARS} y ${REVIEW_MAX_CHARS} caracteres.`,
    };
  }

  const { allowed } = await rateLimitStorage.consume(`review:${user.id}`, {
    window: 86400,
    max: 5,
  });
  if (!allowed) {
    return { ok: false, error: "Ya editaste tu reseña varias veces hoy. Prueba mañana." };
  }

  // Sin caracteres de control y sin más de una línea en blanco seguida.
  const comentario = parsed.data.comentario
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\n{3,}/g, "\n\n");

  try {
    await saveMyReview({
      userId: user.id,
      estrellas: parsed.data.estrellas,
      comentario,
      fotoIds: parsed.data.fotoIds,
    });
  } catch (error) {
    if (error instanceof InvalidPhotosError) return { ok: false, error: error.message };
    throw error;
  }

  after(() =>
    sendTelegramMessage(
      `⭐ <b>Reseña por moderar</b> (${"★".repeat(parsed.data.estrellas)}${"☆".repeat(5 - parsed.data.estrellas)})\n` +
        `<b>De:</b> ${escapeHtml(user.name)}\n` +
        `<b>Fotos:</b> ${parsed.data.fotoIds.length}\n\n` +
        `${escapeHtml(comentario.slice(0, 300))}\n\n` +
        `${siteUrl}/admin/resenas`,
      "contenido",
    ),
  );

  revalidatePath("/cuenta/resena");
  revalidatePath("/"); // si estaba aprobada, deja de verse hasta moderarla
  return { ok: true };
}
