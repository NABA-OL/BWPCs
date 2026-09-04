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
import type { BankAccount } from "@/lib/db/types";

export interface BankAccountFormState {
  ok?: boolean;
  error?: string;
}

export async function saveBankAccountAction(
  _prev: BankAccountFormState,
  form: FormData,
): Promise<BankAccountFormState> {
  if (!(await getSession())) return { error: "Sesión expirada." };

  const id = String(form.get("id") ?? "").trim();
  const banco = String(form.get("banco") ?? "").trim();
  const titular = String(form.get("titular") ?? "").trim();
  const tieneCuenta = String(form.get("tieneCuenta") ?? "") === "true";
  const tieneBreB = String(form.get("tieneBreB") ?? "") === "true";
  const tipoCuentaRaw = String(form.get("tipoCuenta") ?? "");
  const numero = String(form.get("numero") ?? "").trim();
  const llave = String(form.get("llave") ?? "").trim();

  if (!banco) return { error: "El banco es obligatorio." };
  if (!titular) return { error: "El titular es obligatorio." };
  if (!tieneCuenta && !tieneBreB)
    return { error: "Agrega una cuenta bancaria, una llave Bre-B, o ambas." };

  let tipoCuenta: NonNullable<BankAccount["tipoCuenta"]> | null = null;
  if (tieneCuenta) {
    if (tipoCuentaRaw !== "Ahorros" && tipoCuentaRaw !== "Corriente")
      return { error: "Tipo de cuenta inválido." };
    if (!numero) return { error: "El número de cuenta es obligatorio." };
    tipoCuenta = tipoCuentaRaw;
  }
  if (tieneBreB && !llave) return { error: "La llave Bre-B es obligatoria." };

  const data: Omit<BankAccount, "_id" | "creado"> = {
    banco,
    tipoCuenta,
    numero: tieneCuenta ? numero : null,
    llave: tieneBreB ? llave : null,
    titular,
  };

  try {
    const col = await collections.bankAccounts();
    if (id) {
      await col.updateOne({ _id: new ObjectId(id) }, { $set: data });
    } else {
      await col.insertOne({ ...data, creado: new Date() });
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }

  revalidatePath("/admin/cuentas-bancarias");
  return { ok: true };
}

export async function deleteBankAccountAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;
  const col = await collections.bankAccounts();
  await col.deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/admin/cuentas-bancarias");
}
