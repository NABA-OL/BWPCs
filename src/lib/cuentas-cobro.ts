/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { MongoServerError, ObjectId, type Filter } from "mongodb";
import { collections } from "@/lib/db/collections";
import { getSettings } from "@/lib/admin/settings";
import { withPaymentMethod } from "@/lib/cuenta-cobro";
import type { CuentaCobro, CuentaCobroEstado, PaymentMethod } from "@/lib/db/types";
import { CARD_MAX_COP, PAYMENT_LABEL, surchargeConcept, surchargePct } from "@/lib/payment-methods";
import { suggestCode } from "@/lib/quote";

let indexReady: Promise<unknown> | null = null;

async function cuentasCol() {
  const col = await collections.cuentasCobro();
  // Un número nunca se repite. Si ya hubiera duplicados el índice no se crea y solo se registra.
  indexReady ??= Promise.all([
    col.createIndex({ numero: 1 }, { name: "numero_unique", unique: true }),
    // Una solicitud de compra genera a lo sumo un borrador.
    col.createIndex(
      { "origen.requestId": 1 },
      {
        name: "origen_requestId_unique",
        unique: true,
        partialFilterExpression: { "origen.requestId": { $type: "string" } },
      },
    ),
  ]).catch((error: unknown) => console.error("[cuentas-cobro] índices", error));
  await indexReady;
  return col;
}

/**
 * Siguiente número "AAAA-NN" del año, atómico: dos cuentas creadas a la vez no
 * comparten número. El contador arranca en la cantidad de cuentas ya emitidas ese año.
 */
export async function nextCuentaNumero(now = new Date()): Promise<string> {
  const year = now.getFullYear();
  const counters = await collections.counters();
  const key = `cuentaCobro-${year}`;
  const existing = await (await cuentasCol()).countDocuments({ numero: { $regex: `^${year}-` } });
  try {
    await counters.updateOne({ _id: key }, { $setOnInsert: { seq: existing } }, { upsert: true });
  } catch (error) {
    // Otra petición lo creó a la vez: basta con incrementarlo.
    if (!(error instanceof MongoServerError && error.code === 11000)) throw error;
  }
  const updated = await counters.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { returnDocument: "after" },
  );
  return suggestCode(year, updated?.seq ?? existing + 1);
}

export { cuentasCol };

interface MoveOptions {
  /** Estados desde los que se permite el cambio (las cuentas sin estado cuentan como `enviada`). */
  from: CuentaCobroEstado[];
  to: CuentaCobroEstado;
  por: "admin" | "cliente" | "sistema";
  nota?: string | null;
  /** Solo la cuenta de este usuario (el cliente nunca toca las de otros). */
  userId?: string;
  set?: Partial<CuentaCobro>;
}

/**
 * Cambia el estado con la condición de partida dentro de la propia escritura:
 * es atómico y una petición repetida o cruzada no salta pasos. Devuelve la cuenta
 * ya actualizada, o null si no existía o no estaba en un estado de partida.
 */
export async function moveCuentaCobro(id: string, opts: MoveOptions): Promise<CuentaCobro | null> {
  if (!ObjectId.isValid(id)) return null;
  const filter: Filter<CuentaCobro> = {
    _id: new ObjectId(id),
    $or: [
      { estado: { $in: opts.from } },
      ...(opts.from.includes("enviada") ? [{ estado: { $exists: false } }] : []),
    ],
    ...(opts.userId ? { userId: opts.userId } : {}),
  };
  const col = await cuentasCol();
  return col.findOneAndUpdate(
    filter,
    {
      $set: { ...opts.set, estado: opts.to },
      $push: {
        historial: { estado: opts.to, en: new Date(), por: opts.por, nota: opts.nota ?? null },
      },
    },
    { returnDocument: "after" },
  );
}

/** Cuenta de cobro más reciente generada desde una cotización (para enlazarla en el admin). */
export async function getCuentaForQuote(quoteId: string) {
  const col = await cuentasCol();
  const cuenta = await col.findOne(
    { "origen.quoteId": quoteId },
    { sort: { creado: -1 }, projection: { numero: 1, estado: 1 } },
  );
  return cuenta ? { id: cuenta._id!.toString(), numero: cuenta.numero, estado: cuenta.estado } : null;
}

export type SetMethodResult = { ok: true } | { ok: false; error: string };

/**
 * El cliente elige (o cambia) con qué medio va a pagar mientras la cuenta está "por pagar":
 * el total sigue al medio —con tarjeta lleva el recargo, con Bre-B, transferencia o efectivo
 * vuelve al valor base—. La escritura exige el estado y el dueño, así que no pisa un pago
 * ya reportado. La tarjeta no se ofrece sobre el tope de Bold.
 */
export async function setCuentaPaymentMethod(
  id: string,
  userId: string,
  method: PaymentMethod,
): Promise<SetMethodResult> {
  if (!ObjectId.isValid(id)) return { ok: false, error: "No encontramos esa cuenta de cobro." };
  const col = await cuentasCol();
  const cuenta = await col.findOne({ _id: new ObjectId(id), userId, estado: "enviada" });
  if (!cuenta) return { ok: false, error: "Esta cuenta de cobro ya no admite cambiar el medio de pago." };
  if (cuenta.formaPago === method) return { ok: true }; // ya estaba elegido: nada que registrar

  const { mediosPago } = await getSettings();
  const next = withPaymentMethod(
    cuenta.items,
    cuenta.descuentoPct,
    surchargePct(method, mediosPago),
    surchargeConcept(method),
  );
  if (method === "tarjeta" && next.total > CARD_MAX_COP) {
    return { ok: false, error: "El pago con tarjeta solo está disponible hasta $5.000.000. Elige Bre-B o transferencia." };
  }

  const updated = await col.updateOne(
    { _id: cuenta._id, userId, estado: "enviada" },
    {
      $set: {
        items: next.items,
        subtotal: next.subtotal,
        descuentoValor: next.descuentoValor,
        total: next.total,
        formaPago: method,
      },
      $push: {
        historial: {
          estado: "enviada",
          en: new Date(),
          por: "cliente",
          nota: `Medio de pago: ${PAYMENT_LABEL[method]}`,
        },
      },
    },
  );
  return updated.modifiedCount === 1
    ? { ok: true }
    : { ok: false, error: "Esta cuenta de cobro ya no admite cambiar el medio de pago." };
}
