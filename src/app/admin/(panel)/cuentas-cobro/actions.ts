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
import { redirect } from "next/navigation";
import { collections } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { computeCuentaCobro, type CuentaCobroInput } from "@/lib/cuenta-cobro";
import type { BankAccount, CuentaCobro } from "@/lib/db/types";

export interface CuentaCobroFormState {
  ok?: boolean;
  error?: string;
  id?: string;
}

function sanitize(raw: unknown): CuentaCobroInput | null {
  if (!raw || typeof raw !== "object") return null;
  const q = raw as Record<string, unknown>;

  const cliente = (q.cliente ?? {}) as Record<string, unknown>;
  const cuentaBanco = (q.cuentaBanco ?? {}) as Record<string, unknown>;
  const firmante = (q.firmante ?? {}) as Record<string, unknown>;
  const itemsRaw = Array.isArray(q.items) ? q.items : [];

  const numero = String(cuentaBanco.numero ?? "").trim();
  const llave = String(cuentaBanco.llave ?? "").trim();
  const tipoCuenta =
    String(cuentaBanco.tipoCuenta ?? "") === "Corriente" ? "Corriente" : "Ahorros";

  const items = itemsRaw
    .map((i) => {
      const ii = i as Record<string, unknown>;
      return {
        descripcion: String(ii.descripcion ?? "").trim(),
        cantidad: Math.max(0, Math.round(Number(ii.cantidad) || 0)),
        valorUnitario: Math.max(0, Math.round(Number(ii.valorUnitario) || 0)),
      };
    })
    .filter((i) => i.descripcion !== "" || i.cantidad > 0 || i.valorUnitario > 0);

  return {
    numero: String(q.numero ?? "").trim(),
    fecha: String(q.fecha ?? "").trim(),
    cliente: {
      nombre: String(cliente.nombre ?? "").trim(),
      identificacion: String(cliente.identificacion ?? "").trim(),
      direccion: String(cliente.direccion ?? "").trim(),
      telefono: String(cliente.telefono ?? "").trim(),
      email: String(cliente.email ?? "").trim(),
    },
    cuentaBanco: {
      banco: String(cuentaBanco.banco ?? "").trim(),
      tipoCuenta: numero
        ? (tipoCuenta as NonNullable<BankAccount["tipoCuenta"]>)
        : null,
      numero: numero || null,
      llave: llave || null,
      titular: String(cuentaBanco.titular ?? "").trim(),
    },
    firmante: {
      nombre: String(firmante.nombre ?? "").trim(),
      cedula: String(firmante.cedula ?? "").trim(),
      firmaBase64:
        typeof firmante.firmaBase64 === "string" ? firmante.firmaBase64 : null,
    },
    items,
    descuentoPct: Math.min(100, Math.max(0, Number(q.descuentoPct) || 0)),
  };
}

export async function saveCuentaCobroAction(
  _prev: CuentaCobroFormState,
  form: FormData,
): Promise<CuentaCobroFormState> {
  if (!(await getSession())) return { error: "Sesión expirada." };

  const id = String(form.get("id") ?? "").trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(String(form.get("payload") ?? "{}"));
  } catch {
    return { error: "Datos inválidos." };
  }

  const input = sanitize(parsed);
  if (!input) return { error: "Datos inválidos." };
  if (!input.numero) return { error: "El número es obligatorio." };
  if (!input.cliente.nombre) return { error: "El nombre del cliente es obligatorio." };
  if (!input.firmante.nombre) return { error: "Selecciona un firmante." };
  if (!input.cuentaBanco.numero && !input.cuentaBanco.llave)
    return {
      error: "Agrega una cuenta bancaria, una llave Bre-B, o ambas.",
    };
  if (input.items.length === 0)
    return { error: "Agrega al menos un ítem." };

  // Recálculo server-side: nunca confiar en el total que mandó el cliente.
  const totals = computeCuentaCobro(input.items, input.descuentoPct);

  const fecha = input.fecha ? new Date(input.fecha) : new Date();
  let newId: string | null = null;

  const doc: Omit<CuentaCobro, "_id" | "creado"> = {
    numero: input.numero,
    fecha,
    cliente: input.cliente,
    cuentaBanco: input.cuentaBanco,
    firmante: input.firmante,
    items: input.items,
    descuentoPct: input.descuentoPct,
    subtotal: totals.subtotal,
    descuentoValor: totals.descuentoValor,
    total: totals.total,
  };

  try {
    const col = await collections.cuentasCobro();
    if (id) {
      await col.updateOne({ _id: new ObjectId(id) }, { $set: doc });
    } else {
      const { insertedId } = await col.insertOne({ ...doc, creado: new Date() });
      newId = insertedId.toString();
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }

  revalidatePath("/admin/cuentas-cobro");
  revalidatePath("/admin");

  // redirect() debe ir fuera del try/catch (lanza NEXT_REDIRECT a propósito).
  if (newId) redirect(`/admin/cuentas-cobro/${newId}`);
  return { ok: true, id };
}

export async function deleteCuentaCobroAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;
  const col = await collections.cuentasCobro();
  await col.deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/admin/cuentas-cobro");
  revalidatePath("/admin");
}
