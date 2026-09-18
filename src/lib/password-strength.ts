/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

export type PasswordLevel = 0 | 1 | 2 | 3; // 0 = vacía, 1 = débil, 2 = media, 3 = fuerte

// Contraseñas y patrones muy comunes (lista corta a propósito: es un indicador,
// no una política; el servidor solo exige 8 caracteres).
const COMMON = [
  "password",
  "contraseña",
  "contrasena",
  "12345678",
  "123456789",
  "qwerty",
  "abcdefgh",
  "abc12345",
  "iloveyou",
  "admin123",
  "letmein",
  "colombia",
  "bogota",
];

/** Fortaleza estimada de una contraseña. Indicativa; no bloquea el envío. */
export function passwordLevel(password: string): PasswordLevel {
  if (password.length === 0) return 0;

  const lower = password.toLowerCase();
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) =>
    re.test(password),
  ).length;

  const tooSimple =
    password.length < 8 ||
    COMMON.some((c) => lower.includes(c)) ||
    /^(.)\1+$/.test(password) || // todo el mismo carácter
    classes < 2;
  if (tooSimple) return 1;

  if ((password.length >= 12 && classes >= 3) || password.length >= 16) return 3;
  return 2;
}
