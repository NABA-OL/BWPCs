/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */

// Compartido entre el server action (verifica) y el cliente (ejecuta reCAPTCHA
// con esta acción). No puede vivir en actions.ts: un archivo "use server" solo
// puede exportar funciones async.
export const RECAPTCHA_ACTION = "cotizador_lead";
