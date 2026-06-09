"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { collections } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import type { PriceMode, Processor } from "@/lib/db/types";

export interface ProcessorFormState {
  ok?: boolean;
  error?: string;
}

function num(v: FormDataEntryValue | null): number | null {
  const raw = String(v ?? "").replace(/[^\d.-]/g, "");
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function saveProcessorAction(
  _prev: ProcessorFormState,
  form: FormData,
): Promise<ProcessorFormState> {
  if (!(await getSession())) return { error: "Sesión expirada." };

  const id = String(form.get("id") ?? "").trim();
  const modelo = String(form.get("modelo") ?? "").trim();
  const marca = String(form.get("marca") ?? "AMD").trim() as "AMD" | "Intel";
  const modoPrecio = String(form.get("modoPrecio") ?? "USD") as PriceMode;
  const baseUsd = num(form.get("baseUsd"));
  const precioManualCop = num(form.get("precioManualCop"));

  if (!modelo) return { error: "El modelo es obligatorio." };
  if (modoPrecio === "USD" && baseUsd == null)
    return { error: "En modo USD ingresa el precio base en dólares." };
  if (modoPrecio === "COP" && precioManualCop == null)
    return { error: "En modo COP ingresa el precio en pesos." };

  const data: Omit<Processor, "_id"> = {
    modelo,
    marca: marca === "Intel" ? "Intel" : "AMD",
    modoPrecio,
    baseUsd: modoPrecio === "USD" ? baseUsd : null,
    precioManualCop: modoPrecio === "COP" ? precioManualCop : null,
    activo: true,
    actualizado: new Date(),
  };

  try {
    const col = await collections.processors();
    if (id) {
      // En edición conservamos el estado activo actual.
      const { activo, ...rest } = data;
      void activo;
      await col.updateOne({ _id: new ObjectId(id) }, { $set: rest });
    } else {
      await col.insertOne(data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }

  revalidatePath("/admin/procesadores");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteProcessorAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;
  const col = await collections.processors();
  await col.deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/admin/procesadores");
  revalidatePath("/admin");
}

export async function toggleProcessorAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  const activo = String(form.get("activo") ?? "") === "true";
  if (!id) return;
  const col = await collections.processors();
  await col.updateOne({ _id: new ObjectId(id) }, { $set: { activo: !activo } });
  revalidatePath("/admin/procesadores");
}
