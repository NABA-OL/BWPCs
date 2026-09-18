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
import { getSettings } from "@/lib/admin/settings";
import { getSession } from "@/lib/auth/session";
import { optionTotals, type QuoteInput } from "@/lib/quote";
import { COMPONENT_CATEGORIES, type Quote } from "@/lib/db/types";
import { sendQuoteReadyEmail } from "@/lib/email/quote-ready";
import { getPublicUser } from "@/lib/user-auth/users";

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
    userId: String(q.userId ?? "").trim(),
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

  if (input.userId && !(await getPublicUser(input.userId))) {
    return { error: "El usuario elegido ya no existe." };
  }

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
      const previous = await col.findOne({ _id: new ObjectId(id) });
      // Si cambia el usuario, la cotización deja de estar publicada: no debe
      // quedar visible (ni avisada) para alguien que ya no es su destinatario.
      const ownerChanged = (previous?.userId ?? "") !== input.userId;
      await col.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            codigo: input.codigo,
            cliente: input.cliente || null,
            userId: input.userId || null,
            fecha,
            opciones,
            ...(ownerChanged
              ? { estado: "borrador" as const, publicadaEn: null, avisoEnviadoEn: null }
              : {}),
          },
        },
      );
    } else {
      const { insertedId } = await col.insertOne({
        codigo: input.codigo,
        cliente: input.cliente || null,
        userId: input.userId || null,
        estado: "borrador",
        publicadaEn: null,
        avisoEnviadoEn: null,
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

/** Envía el correo "tu cotización está lista"; true si Resend lo aceptó. */
async function notifyQuoteReady(quote: Quote): Promise<boolean> {
  if (!quote._id || !quote.userId) return false;
  const user = await getPublicUser(quote.userId);
  if (!user) return false;
  try {
    await sendQuoteReadyEmail({
      to: user.email,
      name: user.name,
      codigo: quote.codigo,
      quoteId: quote._id.toString(),
      optionCount: quote.opciones.length,
      desdeCop: Math.min(...quote.opciones.map((o) => o.totales.base)),
    });
    return true;
  } catch (error) {
    console.error("[cotizaciones] fallo al enviar el aviso", error);
    return false;
  }
}

async function loadQuote(form: FormData) {
  if (!(await getSession())) return null;
  const id = String(form.get("id") ?? "").trim();
  if (!ObjectId.isValid(id)) return null;
  const col = await collections.quotes();
  const quote = await col.findOne({ _id: new ObjectId(id) });
  return quote ? { col, quote } : null;
}

function revalidateQuote(id: string) {
  revalidatePath(`/admin/cotizaciones/${id}`);
  revalidatePath("/admin/cotizaciones");
  revalidatePath("/cuenta/cotizaciones");
}

/** Publica la cotización para su usuario y le envía el aviso por correo. */
export async function publishQuoteAction(form: FormData): Promise<void> {
  const loaded = await loadQuote(form);
  if (!loaded || !loaded.quote.userId) return;
  const { col, quote } = loaded;

  const sent = await notifyQuoteReady(quote);
  await col.updateOne(
    { _id: quote._id },
    {
      $set: {
        estado: "publicada",
        publicadaEn: quote.publicadaEn ?? new Date(),
        avisoEnviadoEn: sent ? new Date() : null,
      },
    },
  );
  revalidateQuote(quote._id!.toString());
}

/** Reenvía el aviso de una cotización ya publicada. */
export async function resendQuoteNoticeAction(form: FormData): Promise<void> {
  const loaded = await loadQuote(form);
  if (!loaded || loaded.quote.estado !== "publicada") return;
  const { col, quote } = loaded;

  if (await notifyQuoteReady(quote)) {
    await col.updateOne({ _id: quote._id }, { $set: { avisoEnviadoEn: new Date() } });
  }
  revalidateQuote(quote._id!.toString());
}

/** Vuelve la cotización a borrador: el cliente deja de verla. */
export async function unpublishQuoteAction(form: FormData): Promise<void> {
  const loaded = await loadQuote(form);
  if (!loaded) return;
  await loaded.col.updateOne(
    { _id: loaded.quote._id },
    { $set: { estado: "borrador", publicadaEn: null, avisoEnviadoEn: null } },
  );
  revalidateQuote(loaded.quote._id!.toString());
}
