/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { getRecaptchaToken } from "@/lib/user-auth/recaptcha-client";

export const INPUT =
  "mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 text-panda outline-none focus:border-panda";
export const LABEL = "block text-sm font-medium text-component";
export const CAPTCHA_ERROR =
  "No se pudo verificar la solicitud. Recarga la página e intenta de nuevo.";

export interface AuthError {
  code?: string;
  message?: string;
  status: number;
}

const ERRORS_BY_CODE: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Correo o contraseña incorrectos.",
  INVALID_PASSWORD: "La contraseña actual no es correcta.",
  INVALID_OTP: "Código incorrecto.",
  OTP_EXPIRED: "El código venció. Pide uno nuevo.",
  TOO_MANY_ATTEMPTS: "Demasiados intentos con este código. Pide uno nuevo.",
  PASSWORD_TOO_SHORT: "La contraseña debe tener al menos 8 caracteres.",
  PASSWORD_TOO_LONG: "La contraseña es demasiado larga.",
  INVALID_EMAIL: "El correo no es válido.",
};

export function errorText(error: AuthError): string {
  if (error.status === 429) {
    return "Demasiados intentos. Espera unos minutos e intenta de nuevo.";
  }
  if (error.code && ERRORS_BY_CODE[error.code]) return ERRORS_BY_CODE[error.code];
  // Los mensajes propios del servidor (guards) ya vienen en español.
  return error.message || "Ocurrió un error. Intenta de nuevo.";
}

/** Opciones de fetch con el token de reCAPTCHA, o null si no se obtuvo. */
export async function captchaOptions(action: string) {
  const token = await getRecaptchaToken(action);
  return token ? { headers: { "x-recaptcha-token": token } } : null;
}
