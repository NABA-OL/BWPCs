/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import "server-only";
import { env } from "@/lib/env";

// Por debajo de este puntaje (0.0 = bot, 1.0 = humano) se rechaza el envío.
const MIN_SCORE = 0.5;

interface SiteverifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
}

/**
 * Verifica un token de reCAPTCHA v3 contra la API de Google.
 * Si RECAPTCHA_SECRET_KEY no está configurada, no bloquea el envío —
 * la protección es opcional hasta que se active.
 */
export async function verifyRecaptcha(
  token: string | undefined,
  expectedAction: string,
): Promise<{ ok: boolean; error?: string }> {
  const secret = env.recaptchaSecretKey;
  if (!secret) return { ok: true };

  if (!token) {
    return { ok: false, error: "No se pudo verificar la solicitud." };
  }

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });

    const data = (await res.json()) as SiteverifyResponse;

    if (!data.success || data.action !== expectedAction) {
      return { ok: false, error: "No se pudo verificar la solicitud." };
    }
    if ((data.score ?? 0) < MIN_SCORE) {
      return { ok: false, error: "No pudimos procesar tu solicitud. Intenta de nuevo." };
    }
    return { ok: true };
  } catch {
    // Si Google no responde, no dejamos a un usuario real sin poder cotizar.
    return { ok: true };
  }
}
