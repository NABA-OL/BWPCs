"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";

export interface BuildFormState {
  ok?: boolean;
  error?: string;
}

export async function saveBuildAction(
  _prev: BuildFormState,
  form: FormData,
): Promise<BuildFormState> {
  if (!(await getSession())) return { error: "Sesión expirada." };

  const id = String(form.get("id") ?? "").trim();
  const titulo = String(form.get("titulo") ?? "").trim();
  const specs = String(form.get("specs") ?? "").trim();
  const imagenUrl = String(form.get("imagenUrl") ?? "").trim();
  const orden = Number(form.get("orden") ?? 0);

  if (!titulo) return { error: "El título es obligatorio." };
  if (!imagenUrl) return { error: "La URL de imagen es obligatoria." };

  const col = await collections.builds();

  try {
    if (id) {
      await col.updateOne(
        { _id: new ObjectId(id) },
        { $set: { titulo, specs, imagenUrl, orden } },
      );
    } else {
      await col.insertOne({
        titulo,
        specs,
        imagenUrl,
        orden,
        activo: true,
        creado: new Date(),
      });
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }

  revalidatePath("/admin/ensambles");
  revalidatePath("/ensambles");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteBuildAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;
  const col = await collections.builds();
  await col.deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/admin/ensambles");
  revalidatePath("/ensambles");
  revalidatePath("/");
}

export async function toggleBuildAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  const activo = form.get("activo") === "true";
  if (!id) return;
  const col = await collections.builds();
  await col.updateOne({ _id: new ObjectId(id) }, { $set: { activo: !activo } });
  revalidatePath("/admin/ensambles");
  revalidatePath("/ensambles");
  revalidatePath("/");
}
