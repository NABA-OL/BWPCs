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
import { generateBlogDraft, type GenerateBlogDraftResult } from "@/lib/blog/generate";
import { GuideSeccionesSchema, GuideFaqsSchema } from "@/lib/blog/schema";
import { slugify } from "@/lib/slug";

export interface CreateGuideResult {
  ok: boolean;
  error?: string;
}

/** Crea un borrador vacío para redactar a mano. El slug se fija acá y nunca se recalcula. */
export async function createGuideAction(
  _prev: CreateGuideResult,
  form: FormData,
): Promise<CreateGuideResult> {
  if (!(await getSession())) return { ok: false, error: "Sesión inválida." };
  const titulo = String(form.get("titulo") ?? "").trim();
  if (!titulo) return { ok: false, error: "Falta el título." };

  const hoy = new Date().toISOString().slice(0, 10);
  const col = await collections.guides();
  const { insertedId } = await col.insertOne({
    slug: slugify(titulo),
    titulo,
    h1: titulo,
    descripcion: "",
    keywords: [],
    publicado: null,
    actualizado: hoy,
    resumen: [],
    intro: [],
    secciones: [],
    faqs: [],
    estado: "borrador",
    creado: new Date(),
  });

  revalidatePath("/admin/blog");
  redirect(`/admin/blog/${insertedId.toString()}`);
}

export async function generateDraftAction(): Promise<GenerateBlogDraftResult> {
  if (!(await getSession())) return { ok: false, error: "Sesión inválida." };
  const result = await generateBlogDraft();
  revalidatePath("/admin/blog");
  revalidatePath("/admin");
  return result;
}

export async function publishGuideAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;

  const hoy = new Date().toISOString().slice(0, 10);
  const col = await collections.guides();
  await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { estado: "publicado", publicado: hoy, actualizado: hoy } },
  );

  revalidatePath("/admin/blog");
  revalidatePath("/guias");
}

export async function unpublishGuideAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;

  const col = await collections.guides();
  await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { estado: "borrador", publicado: null } },
  );

  revalidatePath("/admin/blog");
  revalidatePath("/guias");
}

export async function deleteGuideAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;

  const col = await collections.guides();
  await col.deleteOne({ _id: new ObjectId(id) });

  revalidatePath("/admin/blog");
  revalidatePath("/guias");
}

export interface UpdateGuideResult {
  ok: boolean;
  error?: string;
}

/** El slug nunca se toca acá — cambiar el slug de una guía publicada rompería su URL. */
export async function updateGuideAction(
  _prev: UpdateGuideResult,
  form: FormData,
): Promise<UpdateGuideResult> {
  if (!(await getSession())) return { ok: false, error: "Sesión inválida." };
  const id = String(form.get("id") ?? "").trim();
  if (!id) return { ok: false, error: "Falta id." };

  const titulo = String(form.get("titulo") ?? "").trim();
  const h1 = String(form.get("h1") ?? "").trim();
  const descripcion = String(form.get("descripcion") ?? "").trim();
  const keywords = String(form.get("keywords") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const resumen = String(form.get("resumen") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const intro = String(form.get("intro") ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (!titulo || !h1 || resumen.length === 0 || intro.length === 0) {
    return { ok: false, error: "Faltan título, H1, resumen o intro." };
  }

  let secciones;
  let faqs;
  try {
    secciones = GuideSeccionesSchema.parse(JSON.parse(String(form.get("secciones") ?? "[]")));
    faqs = GuideFaqsSchema.parse(JSON.parse(String(form.get("faqs") ?? "[]")));
  } catch {
    return { ok: false, error: "Secciones o FAQs no son JSON válido con la forma esperada." };
  }
  if (secciones.length === 0) {
    return { ok: false, error: "Necesitas al menos una sección." };
  }

  const col = await collections.guides();
  await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { titulo, h1, descripcion, keywords, resumen, intro, secciones, faqs } },
  );

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/guias");
  return { ok: true };
}
