/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/user-auth/auth";

/** Sesión del usuario público (cookie bw_user), o null si no hay. */
export async function getUserSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Solo rutas internas: una "/" seguida de algo que no sea otra "/" ni "\" y sin
 * caracteres de control (el navegador ignora tab y saltos de línea, así que
 * "/\t/evil.com" se leería como "//evil.com"). Acepta el arreglo que Next
 * entrega cuando el parámetro se repite.
 */
export function safeNextPath(next: string | string[] | undefined): string {
  const value = Array.isArray(next) ? next[0] : next;
  return value && /^\/(?![/\\])[^\x00-\x1f\x7f\\]*$/.test(value)
    ? value
    : "/cuenta";
}
