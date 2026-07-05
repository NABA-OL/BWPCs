// Desarrollado por NABA-OL
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const COOKIE_NAME = "bw_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas

export interface SessionPayload {
  sub: string; // id del admin
  usuario: string;
}

function secretKey(): Uint8Array {
  return new TextEncoder().encode(env.authSecret);
}

/** Firma un JWT de sesión. */
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ usuario: payload.usuario })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

/** Verifica un token; devuelve el payload o null. Sirve también en Edge/middleware. */
export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub) return null;
    return { sub: payload.sub, usuario: String(payload.usuario ?? "") };
  } catch {
    return null;
  }
}

/** Crea la cookie de sesión (httpOnly). */
export async function createSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Borra la cookie de sesión. */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Devuelve la sesión actual desde la cookie (en Server Components / actions). */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(COOKIE_NAME)?.value);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
