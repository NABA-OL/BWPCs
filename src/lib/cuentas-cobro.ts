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
import { cuentaNumero, withPaymentMethod } from "@/lib/cuenta-cobro";
import { VENCIDA_ERROR, estaVencida } from "@/lib/cuenta-cobro-vigencia";
import type { CuentaCobro, CuentaCobroEstado, PaymentMethod } from "@/lib/db/types";
import { PAYMENT_LABEL, surchargeConcept, surchargePct } from "@/lib/payment-methods";

let indexReady: Promise<unknown> | null = null;

async function cuentasCol() {
  const col = await collections.cuentasCobro();
  // Un número nunca se repite. Si ya hubiera duplicados el índice no se crea y solo se registra.
  indexReady ??= Promise.all([
    col.createIndex({ numero: 1 }, { name: "numero_unique", unique: true }),
    col.createIndex({ "origen.quoteId": 1 }, { name: "origen_quoteId" }),
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

/** Año actual en Bogotá (en Vercel el reloj es UTC: cerca del 31 de diciembre el año cambiaría antes de hora). */
const bogotaYear = (now: Date) => Number(now.toLocaleDateString("en-CA", { timeZone: "America/Bogota" }).slice(0, 4));

/**
 * Siguiente número "AAAA-LLLNNN" (2026-AAA000, 2026-AAA001…), atómico: dos cuentas creadas a la vez no
 * comparten número. Vale igual para las hechas a mano y para los borradores automáticos. El contador es
 * nuevo (`v2`): las cuentas con el formato anterior ("2026-01") conservan su número.
 */
export async function nextCuentaNumero(now = new Date()): Promise<string> {
  const year = bogotaYear(now);
  const counters = await collections.counters();
  const key = `cuentaCobro-v2-${year}`;
  for (let attempt = 0; ; attempt++) {
    try {
      // Un único $inc con upsert es atómico; solo la primera vez dos peticiones pueden chocar al crear el documento.
      const updated = await counters.findOneAndUpdate(
        { _id: key },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" },
      );
      return cuentaNumero(year, (updated?.seq ?? 1) - 1);
    } catch (error) {
      if (attempt < 2 && error instanceof MongoServerError && error.code === 11000) continue;
      throw error;
    }
  }
}

/** Número que se asignaría ahora (solo para mostrarlo en el formulario; no reserva nada). */
export async function peekNextCuentaNumero(now = new Date()): Promise<string> {
  const year = bogotaYear(now);
  const current = await (await collections.counters()).findOne({ _id: `cuentaCobro-v2-${year}` });
  return cuentaNumero(year, current?.seq ?? 0);
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
  /**
   * Exige, dentro de la misma escritura, que el precio siga vigente (`vigente`: sin `venceEn` o aún por vencer)
   * o que ya haya vencido (`vencida`). Sin esto la vigencia no aplica.
   */
  vigencia?: "vigente" | "vencida";
  set?: Partial<CuentaCobro>;
}

/**
 * Cambia el estado con la condición de partida dentro de la propia escritura:
 * es atómico y una petición repetida o cruzada no salta pasos. Devuelve la cuenta
 * ya actualizada, o null si no existía o no estaba en un estado de partida.
 */
export async function moveCuentaCobro(id: string, opts: MoveOptions): Promise<CuentaCobro | null> {
  if (!ObjectId.isValid(id)) return null;
  const now = new Date();
  const vigencia: Filter<CuentaCobro>[] =
    opts.vigencia === "vigente"
      ? [{ $or: [{ venceEn: null }, { venceEn: { $exists: false } }, { venceEn: { $gt: now } }] }]
      : opts.vigencia === "vencida"
        ? [{ venceEn: { $lte: now } }]
        : [];
  const filter: Filter<CuentaCobro> = {
    _id: new ObjectId(id),
    $and: [
      {
        $or: [
          { estado: { $in: opts.from } },
          ...(opts.from.includes("enviada") ? [{ estado: { $exists: false } }] : []),
        ],
      },
      ...vigencia,
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
    { sort: { creado: -1 }, projection: { numero: 1, estado: 1, venceEn: 1 } },
  );
  return cuenta
    ? { id: cuenta._id!.toString(), numero: cuenta.numero, estado: cuenta.estado, venceEn: cuenta.venceEn ?? null }
    : null;
}

export type SetMethodResult = { ok: true; total: number; numero: string } | { ok: false; error: string };

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
  if (estaVencida(cuenta)) return { ok: false, error: VENCIDA_ERROR };
  if (cuenta.formaPago === method) return { ok: true, total: cuenta.total, numero: cuenta.numero }; // ya estaba elegido

  const { mediosPago } = await getSettings();
  const next = withPaymentMethod(
    cuenta.items,
    cuenta.descuentoPct,
    surchargePct(method, mediosPago),
    surchargeConcept(method),
  );
  // Con tarjeta no se muestra cuenta bancaria; al pasar a otro medio sin datos bancarios se pone la de por defecto.
  const needsBank = method !== "tarjeta" && !cuenta.cuentaBanco.numero && !cuenta.cuentaBanco.llave;
  const defaultBank = needsBank ? await defaultBankFor(method) : null;
  const updated = await col.updateOne(
    { _id: cuenta._id, userId, estado: "enviada", $or: [{ venceEn: null }, { venceEn: { $exists: false } }, { venceEn: { $gt: new Date() } }] },
    {
      $set: {
        items: next.items,
        subtotal: next.subtotal,
        descuentoValor: next.descuentoValor,
        total: next.total,
        formaPago: method,
        ...(defaultBank ? { cuentaBanco: defaultBank } : {}),
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
    ? { ok: true, total: next.total, numero: cuenta.numero }
    : { ok: false, error: "Esta cuenta de cobro ya no admite cambiar el medio de pago." };
}

/** Datos bancarios por defecto para un medio de pago: llave para Bre-B, cuenta normal para transferencia, si no la primera. */
export async function defaultBankFor(method: PaymentMethod): Promise<CuentaCobro["cuentaBanco"] | null> {
  const banks = await (await collections.bankAccounts()).find({}).sort({ creado: 1 }).toArray();
  const bank =
    (method === "bre-b" ? banks.find((b) => b.llave) : method === "transferencia" ? banks.find((b) => b.numero) : undefined) ??
    banks[0];
  return bank
    ? { banco: bank.banco, tipoCuenta: bank.tipoCuenta, numero: bank.numero, llave: bank.llave, titular: bank.titular }
    : null;
}
