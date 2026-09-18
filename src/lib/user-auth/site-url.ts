/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

const isProd = process.env.NODE_ENV === "production";

// En local se ignora BETTER_AUTH_URL (apunta al sitio QA) para que las cookies
// y el chequeo de origen funcionen sobre http://localhost:3000.
export const siteUrl = isProd
  ? (process.env.BETTER_AUTH_URL ?? "https://bw-pcs.com")
  : "http://localhost:3000";
