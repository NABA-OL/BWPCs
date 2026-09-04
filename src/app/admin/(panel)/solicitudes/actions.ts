"use server";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
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
