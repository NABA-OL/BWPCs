"use server";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { APIError } from "better-auth/api";
import { setKeepReviewOnDelete } from "@/lib/reviews/reviews";
import { auth } from "@/lib/user-auth/auth";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { googleEnabled } from "@/lib/user-auth/google";
import { notifyGoogleUnlinked } from "@/lib/user-auth/notices";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { getUserSession } from "@/lib/user-auth/session";
import { getGoogleLink, hasPasswordAccount } from "@/lib/user-auth/users";

export type ActionResult = { ok: true } | { ok: false; error: string };

const deleteAccountSchema = z.object({
  // Sin contraseña solo para cuentas que entran únicamente con Google (se comprueba en la acción).
  password: z.string().min(1).max(128).optional(),
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
  // Con contraseña propia se exige siempre; solo una cuenta sin contraseña (entra con Google) puede
  // omitirla, y entonces Better Auth pide una sesión reciente.
  const hasPassword = await hasPasswordAccount(userId);
  const password = parsed.data.password;
  if (hasPassword) {
    if (!password) return { ok: false, error: "Escribe tu contraseña para eliminar la cuenta." };
    try {
      await auth.api.verifyPassword({ body: { password }, headers: requestHeaders });
    } catch (error) {
      if (error instanceof APIError) return { ok: false, error: "La contraseña no es correcta." };
      throw error;
    }
  }

  // La elección se guarda solo tras verificar la contraseña, y se revierte si el
  // borrado falla, para que no quede una preferencia colgada.
  await setKeepReviewOnDelete(userId, parsed.data.keepReview);
  try {
    await auth.api.deleteUser({ body: hasPassword ? { password } : {}, headers: requestHeaders });
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

const googlePasswordSchema = z.object({ password: z.string().min(1).max(128) });

/** Confirma la contraseña de quien tiene sesión antes de tocar sus inicios de sesión. */
async function confirmOwnPassword(input: unknown) {
  if (!ACCOUNTS_ENABLED) return { ok: false, error: "No disponible." } as const;
  const parsed = googlePasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Escribe tu contraseña." } as const;
  const session = await getUserSession();
  if (!session) return { ok: false, error: "Tu sesión expiró. Ingresa de nuevo." } as const;
  const userId = session.user.id;
  if (!(await hasPasswordAccount(userId))) {
    return { ok: false, error: "Primero crea una contraseña para tu cuenta." } as const;
  }
  const { allowed } = await rateLimitStorage.consume(`googlelink:${userId}`, { window: 600, max: 5 });
  if (!allowed) {
    return { ok: false, error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." } as const;
  }
  const requestHeaders = await headers();
  try {
    await auth.api.verifyPassword({ body: { password: parsed.data.password }, headers: requestHeaders });
  } catch (error) {
    if (error instanceof APIError) return { ok: false, error: "La contraseña no es correcta." } as const;
    throw error;
  }
  return { ok: true, user: session.user, requestHeaders } as const;
}

/**
 * Vincular Google (otro método de entrada a esta misma cuenta, aunque su correo sea distinto):
 * exige la contraseña y devuelve la dirección de Google a la que hay que llevar a la persona.
 * El retorno lo atiende `/callback/google` de Better Auth y termina en /cuenta/seguridad.
 */
export async function linkGoogleAction(input: unknown): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!googleEnabled()) return { ok: false, error: "No disponible." };
  const checked = await confirmOwnPassword(input);
  if (!checked.ok) return checked;
  if (await getGoogleLink(checked.user.id)) return { ok: false, error: "Ya tienes Google vinculado." };
  try {
    const result = await auth.api.linkSocialAccount({
      body: {
        provider: "google",
        callbackURL: "/cuenta/seguridad?google=vinculado",
        errorCallbackURL: "/cuenta/seguridad?google=error",
      },
      headers: checked.requestHeaders,
    });
    if (!result.url) return { ok: false, error: "No pudimos abrir Google. Intenta de nuevo." };
    return { ok: true, url: result.url };
  } catch (error) {
    console.error("[cuenta] no se pudo iniciar la vinculación con Google", error);
    return { ok: false, error: "No pudimos abrir Google. Intenta de nuevo." };
  }
}

/** Desvincular Google: exige la contraseña (y que exista, para no dejar la cuenta sin forma de entrar). */
export async function unlinkGoogleAction(input: unknown): Promise<ActionResult> {
  const checked = await confirmOwnPassword(input);
  if (!checked.ok) return checked;
  const link = await getGoogleLink(checked.user.id);
  if (!link) return { ok: false, error: "No tienes Google vinculado." };
  try {
    await auth.api.unlinkAccount({ body: { accountId: link.id }, headers: checked.requestHeaders });
  } catch (error) {
    // Better Auth exige una sesión reciente para desvincular.
    console.error("[cuenta] no se pudo desvincular Google", error);
    return {
      ok: false,
      error:
        error instanceof APIError && error.status === "FORBIDDEN"
          ? "Por seguridad, cierra sesión, vuelve a entrar e inténtalo de nuevo."
          : "No pudimos desvincular Google. Intenta de nuevo.",
    };
  }
  notifyGoogleUnlinked(checked.user.email);
  revalidatePath("/cuenta/seguridad");
  return { ok: true };
}
