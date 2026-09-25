"use server";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { collections } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";

export async function setLeadRevisadoAction(
  form: FormData,
): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  const revisado = form.get("revisado") === "true";
  if (!id) return;

  const col = await collections.leads();
  await col.updateOne({ _id: new ObjectId(id) }, { $set: { revisado } });

  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin");
}

/**
 * Marca la solicitud como revisada y lleva al admin a "Nueva cotización" con la solicitud a la vista
 * (y, si el cliente tenía sesión, su cuenta y nombre ya puestos).
 */
export async function reviewLeadAndQuoteAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!ObjectId.isValid(id)) return;

  const col = await collections.leads();
  await col.updateOne({ _id: new ObjectId(id) }, { $set: { revisado: true } });

  revalidatePath("/admin/solicitudes");
  revalidatePath("/admin");
  // redirect() lanza NEXT_REDIRECT a propósito: va al final, fuera de cualquier try/catch.
  redirect(`/admin/cotizaciones/nueva?solicitud=${id}`);
}
