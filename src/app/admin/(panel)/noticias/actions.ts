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
import { runNewsScan } from "@/lib/news/scan";
import { slugify } from "@/lib/slug";

export interface ScanActionResult {
  ok: boolean;
  creados: number;
  borrados: number;
  errores: string[];
}

/** Dispara el escaneo manual (botón en el panel) — crea borradores, nunca publica. */
export async function runScanAction(): Promise<ScanActionResult> {
  if (!(await getSession())) return { ok: false, creados: 0, borrados: 0, errores: [] };
  const result = await runNewsScan();
  revalidatePath("/admin/noticias");
  revalidatePath("/admin");
  return { ok: true, creados: result.creados, borrados: result.borrados, errores: result.errores };
}

export async function publishPostAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;

  const col = await collections.newsPosts();
  await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { estado: "publicado", publicado: new Date(), actualizado: new Date() } },
  );

  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
}

export async function unpublishPostAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;

  const col = await collections.newsPosts();
  await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { estado: "borrador", publicado: null, actualizado: new Date() } },
  );

  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
}

export async function deletePostAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;

  const col = await collections.newsPosts();
  await col.deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
}

export async function updatePostAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;

  const titulo = String(form.get("titulo") ?? "").trim();
  const resumen = String(form.get("resumen") ?? "").trim();
  const cuerpo = String(form.get("cuerpo") ?? "").trim();
  if (!titulo) return;

  const col = await collections.newsPosts();
  await col.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        titulo,
        slug: slugify(titulo),
        resumen,
        cuerpo,
        actualizado: new Date(),
      },
    },
  );

  revalidatePath("/admin/noticias");
  revalidatePath(`/admin/noticias/${id}`);
  revalidatePath("/noticias");
}
