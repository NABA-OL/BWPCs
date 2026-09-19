/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

/**
 * Selección del cotizador que una persona sin cuenta quiere conservar: se guarda en el
 * navegador al ir a registrarse o iniciar sesión y se pasa a su cuenta al volver.
 */
const KEY = "bw-pending-estimate";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface Pending {
  resumen: string;
  at: number;
}

export function stashPendingEstimate(resumen: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ resumen, at: Date.now() } satisfies Pending));
  } catch {
    // sin almacenamiento (modo privado): simplemente no se conserva
  }
}

/** Lee y BORRA la selección pendiente (una sola vez), si es reciente. */
export function takePendingEstimate(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    localStorage.removeItem(KEY);
    const parsed = JSON.parse(raw) as Partial<Pending>;
    if (typeof parsed.resumen !== "string" || typeof parsed.at !== "number") return null;
    return Date.now() - parsed.at < MAX_AGE_MS ? parsed.resumen : null;
  } catch {
    return null;
  }
}
