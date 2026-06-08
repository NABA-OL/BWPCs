"use server";

import { revalidatePath } from "next/cache";
import { collections } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";

export interface SettingsState {
  ok?: boolean;
  error?: string;
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

  const whatsapp = String(form.get("whatsapp") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();

  if (!whatsapp || !email) {
    return { error: "WhatsApp y correo son obligatorios." };
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
          "contacto.whatsapp": whatsapp,
          "contacto.email": email,
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
  return { ok: true };
}
