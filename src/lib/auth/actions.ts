"use server";

import { redirect } from "next/navigation";
import { collections } from "@/lib/db/collections";
import { verifyPassword } from "@/lib/auth/password";
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
