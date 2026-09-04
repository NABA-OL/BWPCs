"use server";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { revalidatePath } from "next/cache";
import { collections } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { fetchTrmOficial } from "@/lib/trm";

export interface SettingsState {
  ok?: boolean;
  error?: string;
}

export interface TrmState {
  ok?: boolean;
  error?: string;
  trm?: number;
}

/**
 * Trae la TRM oficial de la Superfinanciera y la guarda en `trmScrapeado`.
 * Útil para refrescar a demanda sin esperar al cron diario.
 */
export async function refreshTrmAction(): Promise<TrmState> {
  if (!(await getSession())) return { error: "Sesión expirada." };

  try {
    const trm = await fetchTrmOficial();
    const col = await collections.settings();
    await col.updateOne(
      {},
      {
        $set: {
          trmScrapeado: trm.value,
          trmActualizado: new Date(),
          actualizado: new Date(),
        },
      },
      { upsert: true },
    );

    revalidatePath("/admin/configuracion");
    revalidatePath("/admin");
    revalidatePath("/cotizador");
    return { ok: true, trm: trm.value };
  } catch (e) {
    return {
      error:
        e instanceof Error ? e.message : "No se pudo consultar la TRM oficial.",
    };
  }
}

function num(form: FormData, key: string): number {
  const raw = String(form.get(key) ?? "").replace(/[^\d.-]/g, "");
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export async function saveSettingsAction(
  _prev: SettingsState,
  form: FormData,
): Promise<SettingsState> {
  if (!(await getSession())) return { error: "Sesión expirada." };

  const trmManualRaw = String(form.get("trmManual") ?? "").trim();
  const trmManual = trmManualRaw === "" ? null : num(form, "trmManual");

  const tarjetaPct = num(form, "tarjetaPct");
  const psePct = num(form, "psePct");
  const breBPct = num(form, "breBPct");

  const whatsapp = String(form.get("whatsapp") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();

  if (!whatsapp || !email) {
    return { error: "WhatsApp y correo son obligatorios." };
  }

  // Frases del wordmark (lista [{left, right}]); se descartan las vacías.
  let wordmarkPhrases: { left: string; right: string }[] = [];
  try {
    const raw = JSON.parse(String(form.get("wordmarkPhrases") ?? "[]"));
    if (Array.isArray(raw)) {
      wordmarkPhrases = raw
        .map((p) => ({
          left: String(p?.left ?? "").trim(),
          right: String(p?.right ?? "").trim(),
        }))
        .filter((p) => p.left !== "" && p.right !== "");
    }
  } catch {
    // si el JSON viene mal, se deja la lista vacía
  }

  try {
    const col = await collections.settings();
    await col.updateOne(
      {},
      {
        $set: {
          trmManual,
          trmRecargo: num(form, "trmRecargo"),
          envioCPU: num(form, "envioCPU"),
          envioGPU: num(form, "envioGPU"),
          servicioBase: num(form, "servicioBase"),
          "mediosPago.tarjeta": tarjetaPct / 100,
          "mediosPago.pse": psePct / 100,
          "mediosPago.breB": breBPct / 100,
          "contacto.whatsapp": whatsapp,
          "contacto.email": email,
          wordmarkPhrases,
          actualizado: new Date(),
        },
      },
      { upsert: true },
    );
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Error al guardar.",
    };
  }

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin");
  revalidatePath("/cotizador");
  return { ok: true };
}
