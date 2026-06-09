"use server";

import { revalidatePath } from "next/cache";
import { collections } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { ESTIMATOR_CATEGORIES } from "@/lib/categories";

export interface AveragesState {
  ok?: boolean;
  error?: string;
}

function num(v: FormDataEntryValue | null): number {
  const raw = String(v ?? "").replace(/[^\d.-]/g, "");
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

export async function saveAveragesAction(
  _prev: AveragesState,
  form: FormData,
): Promise<AveragesState> {
  if (!(await getSession())) return { error: "Sesión expirada." };

  try {
    const col = await collections.categoryAverages();
    await Promise.all(
      ESTIMATOR_CATEGORIES.map((cat) =>
        col.updateOne(
          { categoria: cat },
          { $set: { promedioCop: num(form.get(`avg_${cat}`)) } },
          { upsert: true },
        ),
      ),
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }

  revalidatePath("/admin/promedios");
  revalidatePath("/cotizador");
  return { ok: true };
}
