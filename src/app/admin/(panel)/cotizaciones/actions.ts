"use server";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { collections } from "@/lib/db/collections";
import { getSettings } from "@/lib/admin/settings";
import { getSession } from "@/lib/auth/session";
import { optionTotals, type QuoteInput } from "@/lib/quote";
import { COMPONENT_CATEGORIES, type Quote } from "@/lib/db/types";

export interface QuoteFormState {
  ok?: boolean;
  error?: string;
  id?: string;
}

function sanitize(raw: unknown): QuoteInput | null {
  if (!raw || typeof raw !== "object") return null;
  const q = raw as Record<string, unknown>;
  const opcionesRaw = Array.isArray(q.opciones) ? q.opciones : [];

  const opciones = opcionesRaw.map((o) => {
    const oo = o as Record<string, unknown>;
    const itemsRaw = Array.isArray(oo.items) ? oo.items : [];
    const items = itemsRaw
      .map((i) => {
        const ii = i as Record<string, unknown>;
        const categoria = String(ii.categoria ?? "");
        return {
          categoria: (COMPONENT_CATEGORIES.includes(categoria as never)
            ? categoria
            : "Procesador") as QuoteInput["opciones"][0]["items"][0]["categoria"],
          modelo: String(ii.modelo ?? "").trim(),
          precioCop: Math.max(0, Math.round(Number(ii.precioCop) || 0)),
          descripcion: String(ii.descripcion ?? "").trim(),
        };
      })
      .filter((i) => i.modelo !== "" || i.precioCop > 0);
    return {
      titulo: String(oo.titulo ?? "Opción").trim() || "Opción",
      items,
      servicio: Math.max(0, Math.round(Number(oo.servicio) || 0)),
    };
  });

  return {
    codigo: String(q.codigo ?? "").trim(),
    cliente: String(q.cliente ?? "").trim(),
    fecha: String(q.fecha ?? "").trim(),
    opciones: opciones.length > 0 ? opciones : [],
  };
}

export async function saveQuoteAction(
  _prev: QuoteFormState,
  form: FormData,
): Promise<QuoteFormState> {
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
  if (!input.codigo) return { error: "El código es obligatorio." };
  if (input.opciones.length === 0)
    return { error: "Agrega al menos una opción con ítems." };

  const settings = await getSettings();

  const opciones: Quote["opciones"] = input.opciones.map((o) => ({
    titulo: o.titulo,
    items: o.items,
    servicio: o.servicio,
    totales: optionTotals(o, settings),
  }));

  const fecha = input.fecha ? new Date(input.fecha) : new Date();
  let newId: string | null = null;

  try {
    const col = await collections.quotes();
    if (id) {
      await col.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            codigo: input.codigo,
            cliente: input.cliente || null,
            fecha,
            opciones,
          },
        },
      );
    } else {
      const { insertedId } = await col.insertOne({
        codigo: input.codigo,
        cliente: input.cliente || null,
        fecha,
        opciones,
        creado: new Date(),
      });
      newId = insertedId.toString();
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }

  revalidatePath("/admin/cotizaciones");
  revalidatePath("/admin");

  // redirect() debe ir fuera del try/catch (lanza NEXT_REDIRECT a propósito).
  if (newId) redirect(`/admin/cotizaciones/${newId}`);
  return { ok: true, id };
}

export async function deleteQuoteAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  const id = String(form.get("id") ?? "").trim();
  if (!id) return;
  const col = await collections.quotes();
  await col.deleteOne({ _id: new ObjectId(id) });
  revalidatePath("/admin/cotizaciones");
  revalidatePath("/admin");
}
