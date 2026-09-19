/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

export const REVIEW_MIN_CHARS = 10;
export const REVIEW_MAX_CHARS = 600;
export const REVIEW_MAX_PHOTOS = 3;
export const ASSEMBLY_MAX_LINES = 12;
export const ASSEMBLY_LINE_MAX = 80;

/** Texto de "Detalles del ensamble" (un renglón por componente) → lista limpia y acotada. */
export function parseAssemblyDetails(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim().slice(0, ASSEMBLY_LINE_MAX))
    .filter(Boolean)
    .slice(0, ASSEMBLY_MAX_LINES);
}

/** "Laura Gómez Pérez" → "Laura P."; "Laura" → "Laura". Privacidad (Ley 1581). */
export function shortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Cliente";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}
