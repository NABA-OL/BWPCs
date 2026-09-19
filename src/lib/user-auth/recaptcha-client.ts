/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const SCRIPT_WAIT_MS = 5000;

/**
 * Token de reCAPTCHA v3 para una acción. Espera a que cargue el script (el
 * usuario puede enviar el formulario antes). Devuelve undefined si no hay
 * clave o falla: el servidor lo rechaza (en cuentas no hay fail-open).
 */
export async function getRecaptchaToken(
  action: string,
): Promise<string | undefined> {
  if (!RECAPTCHA_SITE_KEY) return undefined;

  const deadline = Date.now() + SCRIPT_WAIT_MS;
  while (!window.grecaptcha && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const grecaptcha = window.grecaptcha;
  if (!grecaptcha) return undefined;

  return new Promise((resolve) => {
    grecaptcha.ready(() => {
      grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action })
        .then(resolve)
        .catch(() => resolve(undefined));
    });
  });
}
