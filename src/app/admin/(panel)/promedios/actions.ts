"use server";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { revalidatePath } from "next/cache";
import { collections } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { ESTIMATOR_CATEGORIES } from "@/lib/categories";
import type { ComponentCategory } from "@/lib/db/types";

export interface OptionsState {
  ok?: boolean;
  error?: string;
}

export async function saveOptionsAction(
  _prev: OptionsState,
  form: FormData,
): Promise<OptionsState> {
  if (!(await getSession())) return { error: "Sesión expirada." };

  let parsed: Record<string, { label: string; precioCop: number }[]> = {};
  try {
    const raw = JSON.parse(String(form.get("options") ?? "{}"));
    if (raw && typeof raw === "object") parsed = raw;
  } catch {
    return { error: "Datos inválidos." };
  }

  try {
    const col = await collections.categoryOptions();
    await Promise.all(
      ESTIMATOR_CATEGORIES.map((cat: ComponentCategory) => {
        const opciones = (Array.isArray(parsed[cat]) ? parsed[cat] : [])
          .map((o) => ({
            label: String(o?.label ?? "").trim(),
            precioCop: Math.max(0, Math.round(Number(o?.precioCop) || 0)),
          }))
          .filter((o) => o.label !== "" && o.precioCop > 0);
        return col.updateOne(
          { categoria: cat },
          { $set: { opciones } },
          { upsert: true },
        );
      }),
    );
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }

  revalidatePath("/admin/promedios");
  revalidatePath("/cotizador");
  return { ok: true };
}
