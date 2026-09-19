"use server";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { MongoServerError, ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { collections } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import type { Client } from "@/lib/db/types";
import { clientsCol } from "@/lib/clients";
import { getPublicUser } from "@/lib/user-auth/users";

export interface ClientFormState {
  ok?: boolean;
  error?: string;
}

export async function saveClientAction(
  _prev: ClientFormState,
  form: FormData,
): Promise<ClientFormState> {
  if (!(await getSession())) return { error: "Sesión expirada." };

  const id = String(form.get("id") ?? "").trim();
  const nombre = String(form.get("nombre") ?? "").trim();
  const identificacion = String(form.get("identificacion") ?? "").trim();
  const direccion = String(form.get("direccion") ?? "").trim();
  const telefono = String(form.get("telefono") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const userId = String(form.get("userId") ?? "").trim();

  if (!nombre) return { error: "El nombre es obligatorio." };
  if (userId && !(await getPublicUser(userId))) {
    return { error: "La cuenta elegida ya no existe." };
  }

  const data: Omit<Client, "_id" | "creado" | "origen"> = {
    nombre,
    identificacion,
    direccion,
    telefono,
    email,
    userId: userId || null,
  };

  try {
    const col = await clientsCol();
    if (id) {
      await col.updateOne({ _id: new ObjectId(id) }, { $set: data });
    } else {
      await col.insertOne({ ...data, origen: "manual", creado: new Date() });
    }
  } catch (e) {
    if (e instanceof MongoServerError && e.code === 11000) {
      return { error: "Esa cuenta ya está ligada a otro cliente." };
    }
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }

  revalidatePath("/admin/clientes");
  return { ok: true };
}

export async function deleteClientAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;
  const col = await collections.clients();
  await col.deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/admin/clientes");
}
