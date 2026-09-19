/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

/** Celular colombiano de 10 dígitos (ej. 3001234567). */
export const PHONE_CO = /^3\d{9}$/;

/**
 * Una cuenta creada con Google nace sin celular y sin haber aceptado los términos y la política
 * de datos (Ley 1581). Hasta completarlos no puede usar la cuenta: ver `/cuenta/completar`.
 */
export function isProfileComplete(user: { phone?: string | null; acceptTerms?: boolean | null }): boolean {
  return user.acceptTerms === true && PHONE_CO.test(user.phone ?? "");
}
