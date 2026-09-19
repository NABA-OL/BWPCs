/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import "server-only";
import { env } from "@/lib/env";
import { siteUrl } from "@/lib/user-auth/site-url";

// Por debajo de este puntaje (0.0 = bot, 1.0 = humano) se rechaza el envío.
const MIN_SCORE = 0.5;

interface SiteverifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
}

function isOwnHostname(hostname: string | undefined): boolean {
  if (!hostname) return false;
  const own = new URL(siteUrl).hostname;
  return hostname === own || hostname === `www.${own}`;
}

/**
 * Verifica un token de reCAPTCHA v3 contra la API de Google.
 * Por defecto es "fail-open": sin RECAPTCHA_SECRET_KEY o si Google no responde
 * no bloquea el envío (formularios de cotización). Con `strict: true` (cuentas
 * de usuario) falla cerrado en ambos casos.
 */
export async function verifyRecaptcha(
  token: string | undefined,
  expectedAction: string,
  { strict = false }: { strict?: boolean } = {},
): Promise<{ ok: boolean; error?: string }> {
  const secret = env.recaptchaSecretKey;
  if (!secret) {
    return strict
      ? { ok: false, error: "No se pudo verificar la solicitud." }
      : { ok: true };
  }

  if (!token) {
    return { ok: false, error: "No se pudo verificar la solicitud." };
  }

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(5000), // sin esto, un Google lento cuelga la petición
    });

    const data = (await res.json()) as SiteverifyResponse;

    if (!data.success || data.action !== expectedAction) {
      return { ok: false, error: "No se pudo verificar la solicitud." };
    }
    // En modo estricto el token debe haberse generado en NUESTRO sitio (una clave
    // compartida con otro dominio, p. ej. QA, no debe valer aquí).
    if (strict && !isOwnHostname(data.hostname)) {
      return { ok: false, error: "No se pudo verificar la solicitud." };
    }
    if ((data.score ?? 0) < MIN_SCORE) {
      return { ok: false, error: "No pudimos procesar tu solicitud. Intenta de nuevo." };
    }
    return { ok: true };
  } catch {
    // Si Google no responde, no dejamos a un usuario real sin poder cotizar
    // (salvo en modo estricto: en login/registro es preferible bloquear).
    return strict
      ? { ok: false, error: "No se pudo verificar la solicitud." }
      : { ok: true };
  }
}
