"use server";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { collections } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { CATALOG_CATEGORIES } from "@/lib/categories";
import type { ComponentCategory, ComponentItem } from "@/lib/db/types";

export interface ComponentFormState {
  ok?: boolean;
  error?: string;
}

function num(v: FormDataEntryValue | null): number | null {
  const raw = String(v ?? "").replace(/[^\d.-]/g, "");
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function saveComponentAction(
  _prev: ComponentFormState,
  form: FormData,
): Promise<ComponentFormState> {
  if (!(await getSession())) return { error: "Sesión expirada." };

  const id = String(form.get("id") ?? "").trim();
  const categoria = String(form.get("categoria") ?? "") as ComponentCategory;
  const marca = String(form.get("marca") ?? "").trim();
  const modelo = String(form.get("modelo") ?? "").trim();
  const descripcion = String(form.get("descripcion") ?? "").trim();
  const precioCop = num(form.get("precioCop"));

  if (!CATALOG_CATEGORIES.includes(categoria))
    return { error: "Categoría inválida." };
  if (!modelo) return { error: "El modelo es obligatorio." };
  if (precioCop == null) return { error: "Ingresa el precio en pesos." };

  const data: Omit<ComponentItem, "_id"> = {
    categoria,
    marca,
    modelo,
    descripcion,
    precioCop,
    activo: true,
    actualizado: new Date(),
  };

  try {
    const col = await collections.components();
    if (id) {
      const { activo, ...rest } = data;
      void activo;
      await col.updateOne({ _id: new ObjectId(id) }, { $set: rest });
    } else {
      await col.insertOne(data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }

  revalidatePath("/admin/componentes");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteComponentAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;
  const col = await collections.components();
  await col.deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/admin/componentes");
  revalidatePath("/admin");
}

export async function toggleComponentAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  const activo = String(form.get("activo") ?? "") === "true";
  if (!id) return;
  const col = await collections.components();
  await col.updateOne({ _id: new ObjectId(id) }, { $set: { activo: !activo } });
  revalidatePath("/admin/componentes");
}
