"use server";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { collections } from "@/lib/db/collections";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { getUserSession } from "@/lib/user-auth/session";

/** Borra una selección guardada propia (solo las de tipo "guardada"). */
export async function deleteSavedEstimateAction(form: FormData): Promise<void> {
  if (!ACCOUNTS_ENABLED) return;
  const session = await getUserSession();
  const id = String(form.get("id") ?? "");
  if (!session || !ObjectId.isValid(id)) return;

  const col = await collections.leads();
  await col.deleteOne({
    _id: new ObjectId(id),
    userId: session.user.id,
    tipo: "guardada",
  });
  revalidatePath("/cuenta");
}
