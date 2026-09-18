"use server";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { headers } from "next/headers";
import { z } from "zod";
import { APIError } from "better-auth/api";
import { setKeepReviewOnDelete } from "@/lib/reviews/reviews";
import { auth } from "@/lib/user-auth/auth";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { getUserSession } from "@/lib/user-auth/session";

export type ActionResult = { ok: true } | { ok: false; error: string };

const deleteAccountSchema = z.object({
  password: z.string().min(1).max(128),
  keepReview: z.boolean(),
});

const requestEmailChangeSchema = z.object({
  newEmail: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
});

/**
 * Paso 1 del cambio de correo: confirma la contraseña y envía el código al
 * correo NUEVO. Vive en una server action (y no en el endpoint HTTP de Better
 * Auth, que está bloqueado en guards.ts) para poder exigir la contraseña.
 */
export async function requestEmailChangeAction(
  input: unknown,
): Promise<ActionResult> {
  if (!ACCOUNTS_ENABLED) return { ok: false, error: "No disponible." };

  const parsed = requestEmailChangeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revisa el correo y la contraseña." };
  }
  const { newEmail, password } = parsed.data;

  const session = await getUserSession();
  if (!session) return { ok: false, error: "Tu sesión expiró. Ingresa de nuevo." };
  if (newEmail === session.user.email.toLowerCase()) {
    return { ok: false, error: "Ese ya es tu correo actual." };
  }

  // Límite por usuario: la contraseña se comprueba aquí, así que también frena
  // a quien tenga una sesión robada y pruebe contraseñas.
  const { allowed } = await rateLimitStorage.consume(
    `emailchange:${session.user.id}`,
    { window: 600, max: 5 },
  );
  if (!allowed) {
    return {
      ok: false,
      error: "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
    };
  }

  const requestHeaders = await headers();
  try {
    await auth.api.verifyPassword({
      body: { password },
      headers: requestHeaders,
    });
  } catch (error) {
    if (error instanceof APIError) {
      return { ok: false, error: "La contraseña no es correcta." };
    }
    throw error;
  }

  try {
    await auth.api.requestEmailChangeEmailOTP({
      body: { newEmail },
      headers: requestHeaders,
    });
  } catch (error) {
    if (error instanceof APIError) {
      return { ok: false, error: error.message || "No se pudo enviar el código." };
    }
    throw error;
  }
  return { ok: true };
}

/**
 * Elimina la cuenta. Va por server action (y no por el endpoint HTTP de Better
 * Auth, cerrado en guards.ts) para registrar antes la elección de la autora sobre
 * su reseña aprobada: conservarla (sin cuenta, correo ni teléfono) o borrarla. Sin
 * elección explícita todo se borra.
 */
export async function deleteAccountAction(input: unknown): Promise<ActionResult> {
  if (!ACCOUNTS_ENABLED) return { ok: false, error: "No disponible." };

  const parsed = deleteAccountSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Revisa los datos e intenta de nuevo." };

  const session = await getUserSession();
  if (!session) return { ok: false, error: "Tu sesión expiró. Ingresa de nuevo." };
  const userId = session.user.id;

  const { allowed } = await rateLimitStorage.consume(`delaccount:${userId}`, {
    window: 600,
    max: 5,
  });
  if (!allowed) {
    return { ok: false, error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." };
  }

  const requestHeaders = await headers();
  try {
    await auth.api.verifyPassword({
      body: { password: parsed.data.password },
      headers: requestHeaders,
    });
  } catch (error) {
    if (error instanceof APIError) return { ok: false, error: "La contraseña no es correcta." };
    throw error;
  }

  // La elección se guarda solo tras verificar la contraseña, y se revierte si el
  // borrado falla, para que no quede una preferencia colgada.
  await setKeepReviewOnDelete(userId, parsed.data.keepReview);
  try {
    await auth.api.deleteUser({
      body: { password: parsed.data.password },
      headers: requestHeaders,
    });
  } catch (error) {
    await setKeepReviewOnDelete(userId, false);
    // Incluye fallos al borrar las fotos del almacenamiento: el borrado se aborta
    // entero (no queda una cuenta a medias) y se puede reintentar.
    console.error("[cuenta] no se pudo eliminar la cuenta", error);
    return {
      ok: false,
      error:
        error instanceof APIError && error.message
          ? error.message
          : "No pudimos eliminar la cuenta ahora. Intenta de nuevo en unos minutos.",
    };
  }
  return { ok: true };
}
