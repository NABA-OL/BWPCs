// Desarrollado por NABA-OL
"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { collections } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import type { Graphic, GpuBrand, PriceMode } from "@/lib/db/types";

const GPU_BRANDS: GpuBrand[] = ["AMD", "NVIDIA", "Intel"];

export interface GraphicFormState {
  ok?: boolean;
  error?: string;
}

function num(v: FormDataEntryValue | null): number | null {
  const raw = String(v ?? "").replace(/[^\d.-]/g, "");
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function saveGraphicAction(
  _prev: GraphicFormState,
  form: FormData,
): Promise<GraphicFormState> {
  if (!(await getSession())) return { error: "Sesión expirada." };

  const id = String(form.get("id") ?? "").trim();
  const modelo = String(form.get("modelo") ?? "").trim();
  const marcaRaw = String(form.get("marca") ?? "NVIDIA");
  const marca: GpuBrand = GPU_BRANDS.includes(marcaRaw as GpuBrand)
    ? (marcaRaw as GpuBrand)
    : "NVIDIA";
  const ensambladora = String(form.get("ensambladora") ?? "").trim();
  const modoPrecio = String(form.get("modoPrecio") ?? "USD") as PriceMode;
  const baseUsd = num(form.get("baseUsd"));
  const precioManualCop = num(form.get("precioManualCop"));

  if (!modelo) return { error: "El modelo es obligatorio." };
  if (modoPrecio === "USD" && baseUsd == null)
    return { error: "En modo USD ingresa el precio base en dólares." };
  if (modoPrecio === "COP" && precioManualCop == null)
    return { error: "En modo COP ingresa el precio en pesos." };

  const data: Omit<Graphic, "_id"> = {
    modelo,
    marca,
    ensambladora,
    modoPrecio,
    baseUsd: modoPrecio === "USD" ? baseUsd : null,
    precioManualCop: modoPrecio === "COP" ? precioManualCop : null,
    activo: true,
    actualizado: new Date(),
  };

  try {
    const col = await collections.graphics();
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

  revalidatePath("/admin/graficas");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteGraphicAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;
  const col = await collections.graphics();
  await col.deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/admin/graficas");
  revalidatePath("/admin");
}

export async function toggleGraphicAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  const activo = String(form.get("activo") ?? "") === "true";
  if (!id) return;
  const col = await collections.graphics();
  await col.updateOne({ _id: new ObjectId(id) }, { $set: { activo: !activo } });
  revalidatePath("/admin/graficas");
}
