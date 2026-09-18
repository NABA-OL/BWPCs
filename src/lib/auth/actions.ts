"use server";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { collections } from "@/lib/db/collections";
import { verifyPassword } from "@/lib/auth/password";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import {
  signSession,
  createSessionCookie,
  clearSessionCookie,
} from "@/lib/auth/session";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const usuario = String(formData.get("usuario") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!usuario || !password) {
    return { error: "Ingresa usuario y contraseña." };
  }

  // Fuerza bruta: 10 intentos cada 15 min por IP y por usuario (el de usuario
  // frena a quien rota IPs contra un mismo admin).
  const ip = (await headers()).get("x-real-ip") ?? "sin-ip";
  const userKey = createHash("sha256").update(usuario.toLowerCase()).digest("hex");
  const rule = { window: 900, max: 10 };
  const [byIp, byUser] = await Promise.all([
    rateLimitStorage.consume(`admin-login:ip:${ip}`, rule),
    rateLimitStorage.consume(`admin-login:user:${userKey}`, rule),
  ]);
  if (!byIp.allowed || !byUser.allowed) {
    return { error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." };
  }

  const admins = await collections.admins();
  const admin = await admins.findOne({ usuario });

  // Mensaje genérico para no revelar si el usuario existe.
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  const token = await signSession({
    sub: admin._id!.toString(),
    usuario: admin.usuario,
  });
  await createSessionCookie(token);

  // Solo permitimos redirecciones internas a /admin.
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/admin/login");
}
