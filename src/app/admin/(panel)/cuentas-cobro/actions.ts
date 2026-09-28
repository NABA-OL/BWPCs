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
import { computeCuentaCobro, withPaymentMethod, type CuentaCobroInput } from "@/lib/cuenta-cobro";
import type { BankAccount, CuentaCobro } from "@/lib/db/types";
import { esEditable, sendMissing } from "@/lib/cuenta-cobro-estado";
import { boldAvailable, reconcileBoldLink } from "@/lib/bold-payments";
import { parseBoldCheckoutUrl } from "@/lib/bold-signature";
import { PAYMENT_METHODS, cardIsManual, surchargeConcept, surchargePct } from "@/lib/payment-methods";
import { getSettings } from "@/lib/admin/settings";
import { moveCuentaCobro, nextCuentaNumero } from "@/lib/cuentas-cobro";
import { notifyCuentaSent, sendCuentaCobro } from "@/lib/cuenta-cobro-send";
import { consumeNoticeMail } from "@/lib/email/budget";
import { sendCuentaCobroEmail } from "@/lib/email/cuenta-cobro-ready";
import { clientsCol } from "@/lib/clients";
import { getPublicUser } from "@/lib/user-auth/users";

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
        ...(ii.recargo === true ? { recargo: true } : {}),
      };
    })
    .filter((i) => i.descripcion !== "" || i.cantidad > 0 || i.valorUnitario > 0);

  return {
    numero: String(q.numero ?? "").trim(),
    userId: String(q.userId ?? "").trim(),
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
    formaPago: PAYMENT_METHODS.some((m) => m.id === q.formaPago) ? String(q.formaPago) : "",
    enlacePagoTarjeta: String(q.enlacePagoTarjeta ?? "").trim().slice(0, 300),
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
  if (!input.cliente.nombre) return { error: "El nombre del cliente es obligatorio." };
  if (!input.firmante.nombre) return { error: "Selecciona un firmante." };
  // Con tarjeta no hay cuenta bancaria: se cobra por un enlace de pago. Con cualquier otro medio sí.
  const card = input.formaPago === "tarjeta";
  if (!card && !input.cuentaBanco.numero && !input.cuentaBanco.llave)
    return {
      error: "Agrega una cuenta bancaria, una llave Bre-B, o ambas.",
    };
  const cardLink = card && input.enlacePagoTarjeta ? parseBoldCheckoutUrl(input.enlacePagoTarjeta) : null;
  if (card && input.enlacePagoTarjeta && !cardLink) {
    return { error: "El enlace de pago debe ser un https de Bold (checkout.bold.co)." };
  }
  if (input.items.length === 0)
    return { error: "Agrega al menos un ítem." };

  // Recálculo server-side: nunca confiar en el total ni en el recargo que mandó el cliente. Con un medio de
  // pago definido el recargo (tarjeta) sale de la configuración; sin medio, los ítems se toman tal cual.
  const method = PAYMENT_METHODS.find((m) => m.id === input.formaPago)?.id ?? null;
  const priced = method
    ? withPaymentMethod(
        input.items,
        input.descuentoPct,
        surchargePct(method, (await getSettings()).mediosPago),
        surchargeConcept(method),
      )
    : { items: input.items, ...computeCuentaCobro(input.items, input.descuentoPct) };
  const totals = priced;

  if (input.userId && !(await getPublicUser(input.userId))) {
    return { error: "La cuenta de usuario elegida ya no existe." };
  }

  const fecha = input.fecha ? new Date(input.fecha) : new Date();
  let newId: string | null = null;

  // El número y el estado no salen del formulario: los fija el servidor.
  const doc: Omit<CuentaCobro, "_id" | "creado" | "numero" | "estado" | "historial"> = {
    userId: input.userId || null,
    fecha,
    cliente: input.cliente,
    cuentaBanco: input.cuentaBanco,
    firmante: input.firmante,
    items: priced.items,
    descuentoPct: input.descuentoPct,
    subtotal: totals.subtotal,
    descuentoValor: totals.descuentoValor,
    total: totals.total,
  };

  try {
    const col = await collections.cuentasCobro();
    if (id) {
      const current = await col.findOne({ _id: new ObjectId(id) });
      if (!current) return { error: "La cuenta de cobro ya no existe." };
      if (!esEditable(current)) {
        return { error: "Esta cuenta ya no se puede editar en su estado actual." };
      }
      await col.updateOne(
        { _id: current._id },
        {
          $set: { ...doc, ...(method ? { formaPago: method } : {}), ...(cardLink ? { enlacePagoTarjeta: cardLink } : {}) },
          $unset: { ...(method ? {} : { formaPago: "" }), ...(cardLink ? {} : { enlacePagoTarjeta: "" }) },
        },
      );
    } else {
      const { insertedId } = await col.insertOne({
        ...doc,
        ...(method ? { formaPago: method } : {}),
        ...(cardLink ? { enlacePagoTarjeta: cardLink } : {}),
        numero: await nextCuentaNumero(),
        estado: "borrador",
        historial: [{ estado: "borrador", en: new Date(), por: "admin", nota: null }],
        creado: new Date(),
      });
      newId = insertedId.toString();
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }

  // Si el cliente guardado (ligado a esa cuenta web) no tenía cédula o NIT y aquí se escribió, se le completa.
  if (input.userId && input.cliente.identificacion) {
    try {
      await (await clientsCol()).updateOne(
        { userId: input.userId, identificacion: "" },
        { $set: { identificacion: input.cliente.identificacion } },
      );
    } catch (error) {
      console.error("[cuentas-cobro] no se pudo completar la identificación del cliente", error);
    }
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
  // Solo se borran borradores (o cuentas antiguas sin estado): una emitida se anula, no se borra.
  await col.deleteOne({ _id: new ObjectId(id), $or: [{ estado: "borrador" }, { estado: { $exists: false } }] });
  revalidatePath("/admin/cuentas-cobro");
  revalidatePath("/admin");
}

function revalidateCuenta(id: string) {
  revalidatePath(`/admin/cuentas-cobro/${id}`);
  revalidatePath("/admin/cuentas-cobro");
  revalidatePath("/admin");
  revalidatePath("/cuenta/cuentas-cobro", "layout");
}

async function formId(form: FormData): Promise<string | null> {
  if (!(await getSession())) return null;
  const id = String(form.get("id") ?? "").trim();
  return ObjectId.isValid(id) ? id : null;
}

/** Envía la cuenta al cliente (o la reenvía corregida) y le avisa por correo. */
export async function sendCuentaCobroAction(form: FormData): Promise<void> {
  const id = await formId(form);
  if (!id) return;
  const sent = await sendCuentaCobro(id, "admin");
  if (!sent) return;
  await notifyCuentaSent(sent);
  revalidateCuenta(id);
}

/** El admin confirma que el dinero llegó. Es la única vía a `pagada`. */
export async function confirmPaymentAction(form: FormData): Promise<void> {
  const id = await formId(form);
  if (!id) return;
  await moveCuentaCobro(id, {
    from: ["enviada", "pago_reportado"],
    to: "pagada",
    por: "admin",
    set: { pagadaEn: new Date() },
  });
  revalidateCuenta(id);
}

/** El pago que reportó el cliente no aparece: vuelve a "por pagar". */
export async function rejectPaymentReportAction(form: FormData): Promise<void> {
  const id = await formId(form);
  if (!id) return;
  await moveCuentaCobro(id, {
    from: ["pago_reportado"],
    to: "enviada",
    por: "admin",
    nota: "No vimos el pago reportado",
  });
  revalidateCuenta(id);
}

/** Anula una cuenta (nunca una pagada). Queda en el historial, no se borra. */
export async function annulCuentaCobroAction(form: FormData): Promise<void> {
  const id = await formId(form);
  if (!id) return;
  await moveCuentaCobro(id, {
    from: ["borrador", "enviada", "correccion_solicitada", "pago_reportado"],
    to: "anulada",
    por: "admin",
  });
  revalidateCuenta(id);
}

/** Consulta a Bold el estado del enlace de pago con tarjeta (por si el webhook no llegó). */
export async function checkBoldPaymentAction(form: FormData): Promise<void> {
  const id = await formId(form);
  if (!id) return;
  const cuenta = await (await collections.cuentasCobro()).findOne({ _id: new ObjectId(id) });
  if (!cuenta?.pagoBold) return;
  try {
    await reconcileBoldLink(cuenta);
  } catch (error) {
    console.error("[bold] consulta desde el admin", error);
  }
  revalidateCuenta(id);
}

/**
 * El admin pega el enlace de pago con tarjeta que creó en Bold (cuando la tarjeta no se cobra
 * sola) y avisa al cliente por correo. Solo https y solo dominios de Bold.
 */
export async function saveCardLinkAction(form: FormData): Promise<void> {
  const id = await formId(form);
  if (!id) return;
  const link = parseBoldCheckoutUrl(String(form.get("enlace") ?? ""));
  if (!link) return;

  const col = await collections.cuentasCobro();
  const updated = await col.findOneAndUpdate(
    { _id: new ObjectId(id), estado: { $in: ["borrador", "enviada", "correccion_solicitada"] }, formaPago: "tarjeta" },
    { $set: { enlacePagoTarjeta: link } },
    { returnDocument: "after" },
  );
  if (!updated) return;

  const user = updated.userId ? await getPublicUser(updated.userId) : null;
  if (user && updated.estado === "enviada" && (await consumeNoticeMail())) {
    try {
      await sendCuentaCobroEmail({
        to: user.email,
        name: user.name,
        numero: updated.numero,
        totalCop: updated.total,
        cuentaId: id,
        cardLinkReady: true,
      });
    } catch (error) {
      console.error("[cuentas-cobro] fallo al avisar el enlace de pago", error);
    }
  }
  revalidateCuenta(id);
}
