// Desarrollado por BlacKraken Solutions
"use server";

import { randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { collections } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";

export interface PasswordState {
  ok?: boolean;
  error?: string;
}

export interface CreateUserState {
  error?: string;
  createdUser?: string;
  generatedPassword?: string;
}

const MIN_PASSWORD = 6;

/** Genera una contraseña legible (sin caracteres ambiguos). */
function generatePassword(len = 10): string {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(len);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

/** Cambia la contraseña del admin de la sesión actual. */
export async function changePasswordAction(
  _prev: PasswordState,
  form: FormData,
): Promise<PasswordState> {
  const session = await getSession();
  if (!session) return { error: "Sesión expirada." };

  const nueva = String(form.get("password") ?? "");
  const confirmar = String(form.get("confirmar") ?? "");

  if (nueva.length < MIN_PASSWORD)
    return { error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` };
  if (nueva !== confirmar) return { error: "Las contraseñas no coinciden." };

  try {
    const admins = await collections.admins();
    await admins.updateOne(
      { _id: new ObjectId(session.sub) },
      { $set: { passwordHash: await hashPassword(nueva) } },
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al cambiar la contraseña." };
  }

  return { ok: true };
}

/** Crea un nuevo admin con contraseña autogenerada (para compartir). */
export async function createAdminAction(
  _prev: CreateUserState,
  form: FormData,
): Promise<CreateUserState> {
  if (!(await getSession())) return { error: "Sesión expirada." };

  const usuario = String(form.get("usuario") ?? "")
    .trim()
    .toLowerCase();
  if (!/^[a-z0-9._-]{3,}$/.test(usuario))
    return {
      error: "Usuario inválido (mín. 3 caracteres: letras, números, . _ -).",
    };

  const admins = await collections.admins();
  if (await admins.findOne({ usuario }))
    return { error: "Ese usuario ya existe." };

  const password = generatePassword();
  try {
    await admins.insertOne({
      usuario,
      passwordHash: await hashPassword(password),
      nombreCompleto: "",
      cedula: "",
      firmaBase64: null,
      creado: new Date(),
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al crear el usuario." };
  }

  revalidatePath("/admin/usuarios");
  return { createdUser: usuario, generatedPassword: password };
}

export interface ProfileState {
  ok?: boolean;
  error?: string;
}

/** Strips an accidental "data:image/...;base64," prefix if pasted by mistake. */
function stripDataUriPrefix(raw: string): string {
  const idx = raw.indexOf("base64,");
  return idx >= 0 ? raw.slice(idx + "base64,".length) : raw;
}

/** Actualiza nombre completo, cédula y firma (base64) del admin de la sesión actual. */
export async function updateProfileAction(
  _prev: ProfileState,
  form: FormData,
): Promise<ProfileState> {
  const session = await getSession();
  if (!session) return { error: "Sesión expirada." };

  const nombreCompleto = String(form.get("nombreCompleto") ?? "").trim();
  const cedula = String(form.get("cedula") ?? "").trim();
  const firmaRaw = String(form.get("firmaBase64") ?? "").trim();
  const firmaBase64 = firmaRaw ? stripDataUriPrefix(firmaRaw) : null;

  try {
    const admins = await collections.admins();
    await admins.updateOne(
      { _id: new ObjectId(session.sub) },
      { $set: { nombreCompleto, cedula, firmaBase64 } },
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar el perfil." };
  }

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export interface ResetPasswordState {
  error?: string;
  resetUser?: string;
  generatedPassword?: string;
}

/** Resetea la contraseña de cualquier admin y devuelve la nueva (mostrar una vez). */
export async function resetAdminPasswordAction(
  _prev: ResetPasswordState,
  form: FormData,
): Promise<ResetPasswordState> {
  if (!(await getSession())) return { error: "Sesión expirada." };

  const id = String(form.get("id") ?? "").trim();
  if (!id) return { error: "ID inválido." };

  const admins = await collections.admins();
  const target = await admins.findOne({ _id: new ObjectId(id) });
  if (!target) return { error: "Usuario no encontrado." };

  const password = generatePassword();
  try {
    await admins.updateOne(
      { _id: new ObjectId(id) },
      { $set: { passwordHash: await hashPassword(password) } },
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al resetear contraseña." };
  }

  revalidatePath("/admin/usuarios");
  return { resetUser: target.usuario, generatedPassword: password };
}

/** Elimina un admin (no permite borrarse a sí mismo ni al admin "admin" por defecto). */
export async function deleteAdminAction(form: FormData): Promise<void> {
  const session = await getSession();
  if (!session) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id || id === session.sub) return; // no auto-eliminación

  const admins = await collections.admins();
  const target = await admins.findOne({ _id: new ObjectId(id) });
  if (!target) return;
  if (target.usuario === "admin") return; // admin por defecto protegido

  await admins.deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/admin/usuarios");
}
