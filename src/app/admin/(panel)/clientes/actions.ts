// Desarrollado por BlacKraken Solutions
"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { collections } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import type { Client } from "@/lib/db/types";

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

  if (!nombre) return { error: "El nombre es obligatorio." };
  if (!identificacion) return { error: "La identificación es obligatoria." };

  const data: Omit<Client, "_id" | "creado"> = {
    nombre,
    identificacion,
    direccion,
    telefono,
    email,
  };

  try {
    const col = await collections.clients();
    if (id) {
      await col.updateOne({ _id: new ObjectId(id) }, { $set: data });
    } else {
      await col.insertOne({ ...data, creado: new Date() });
    }
  } catch (e) {
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
