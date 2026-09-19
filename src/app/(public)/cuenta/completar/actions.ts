"use server";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { siteConfig } from "@/lib/site-config";
import { auth } from "@/lib/user-auth/auth";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { PHONE_CO, isProfileComplete } from "@/lib/user-auth/profile";
import { notifyNewAccount } from "@/lib/user-auth/account-telegram";
import { notifyWelcome } from "@/lib/user-auth/notices";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { getRawUserSession } from "@/lib/user-auth/session";
import { completeUserProfile, discardIncompleteUser } from "@/lib/user-auth/users";

export type CompleteResult = { ok: true } | { ok: false; error: string };

const schema = z.object({
  phone: z.string().regex(PHONE_CO, "Escribe un celular colombiano de 10 dígitos (ej. 3001234567)."),
  acceptTerms: z.literal(true, { error: "Debes aceptar los términos y la política de datos." }),
});

/** Cuenta de Google: la persona da su celular y acepta los términos y el tratamiento de datos. */
export async function completeProfileAction(input: unknown): Promise<CompleteResult> {
  if (!ACCOUNTS_ENABLED) return { ok: false, error: "No disponible." };
  const session = await getRawUserSession();
  if (!session) return { ok: false, error: "Tu sesión expiró. Ingresa de nuevo." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }
  if (isProfileComplete(session.user)) return { ok: true };

  const { allowed } = await rateLimitStorage.consume(`completar:${session.user.id}`, {
    window: 3600,
    max: 10,
  });
  if (!allowed) return { ok: false, error: "Demasiados intentos. Prueba de nuevo más tarde." };

  const saved = await completeUserProfile(
    session.user.id,
    parsed.data.phone,
    siteConfig.legal.versionPolitica,
  );
  if (!saved) return { ok: false, error: "No se pudo guardar. Intenta de nuevo." };
  // La cuenta de Google recién queda lista aquí (con el consentimiento dado): aviso interno y bienvenida.
  notifyNewAccount(session.user.name);
  notifyWelcome(session.user.email, session.user.name);
  revalidatePath("/cuenta", "layout");
  return { ok: true };
}

/**
 * La persona no quiere seguir: se borra la cuenta recién creada (solo si aún no aceptó los
 * términos) para no conservar sus datos sin autorización. Cierra la sesión.
 */
export async function discardIncompleteAccountAction(): Promise<void> {
  if (!ACCOUNTS_ENABLED) return;
  const session = await getRawUserSession();
  if (!session || isProfileComplete(session.user)) return;
  await auth.api.signOut({ headers: await headers() }).catch(() => undefined);
  await discardIncompleteUser(session.user.id);
}
