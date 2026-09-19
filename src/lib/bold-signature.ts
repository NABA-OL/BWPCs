/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Firma de un webhook de Bold: HMAC-SHA256 (hex) con la llave secreta sobre el cuerpo
 * CRUDO codificado en base64 (así lo define su documentación). En pruebas la clave es
 * la cadena vacía.
 */
export function boldSignature(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(Buffer.from(rawBody, "utf8").toString("base64")).digest("hex");
}

/** ¿La firma recibida coincide con alguna de las claves válidas? Comparación en tiempo constante. */
export function verifyBoldSignature(rawBody: string, received: string | null, secrets: string[]): boolean {
  if (!received) return false;
  const got = Buffer.from(received.trim().toLowerCase(), "utf8");
  return secrets.some((secret) => {
    const expected = Buffer.from(boldSignature(rawBody, secret), "utf8");
    // timingSafeEqual lanza con longitudes distintas: se compara antes.
    return got.length === expected.length && timingSafeEqual(got, expected);
  });
}

/** Fecha de vigencia de un enlace en NANOSEGUNDOS (lo que pide Bold; en milisegundos da error). */
export function expirationNanos(expiresAtMs: number): string {
  // ms × 1e6 supera 2^53: se agregan seis ceros al texto en vez de multiplicar (sin perder precisión).
  return `${Math.trunc(expiresAtMs)}000000`;
}

/** Referencia única (máx. 60 caracteres, solo letras, números y guiones) que vuelve en el webhook. */
export function boldReference(cuentaId: string, nowMs: number): string {
  return `${cuentaId}-${nowMs.toString(36)}`.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 60);
}

/** Hosts de los que puede venir un enlace de pago de Bold (los de su checkout). */
const BOLD_LINK_HOSTS = new Set(["checkout.bold.co", "bold.co", "www.bold.co"]);

/** Enlace de pago de Bold normalizado, o null si no es https de un dominio de Bold. */
export function parseBoldCheckoutUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    return url.protocol === "https:" && BOLD_LINK_HOSTS.has(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}
