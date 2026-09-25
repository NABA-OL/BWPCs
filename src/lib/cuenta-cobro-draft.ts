/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { MongoServerError } from "mongodb";
import { CATEGORY_LABELS } from "@/lib/categories";
import { withPaymentMethod } from "@/lib/cuenta-cobro";
import { getSettings } from "@/lib/admin/settings";
import { cuentasCol, nextCuentaNumero } from "@/lib/cuentas-cobro";
import { sendCuentaCobro, type SentCuenta } from "@/lib/cuenta-cobro-send";
import { collections } from "@/lib/db/collections";
import type { BankAccount, CuentaCobro, CuentaCobroItem, PaymentMethod, Quote } from "@/lib/db/types";
import { surchargeConcept, surchargePct } from "@/lib/payment-methods";

interface DraftInput {
  quote: Quote & { _id: NonNullable<Quote["_id"]> };
  userId: string;
  requestId: string;
  opcion: number;
  formaPago: PaymentMethod;
}

/** ¿La cuenta bancaria sirve para este medio? (Bre-B necesita llave; transferencia, número de cuenta.) */
const bankFits = (bank: BankAccount, method: PaymentMethod) =>
  method === "bre-b" ? !!bank.llave : method === "transferencia" ? !!bank.numero : true;

/**
 * Cuenta bancaria de la cuenta de cobro: la predeterminada de Configuración si sirve para el medio de pago;
 * si no, la que mejor calza (llave para Bre-B, cuenta normal para transferencia) o la primera.
 */
function pickBankAccount(banks: BankAccount[], method: PaymentMethod, defaultId: string | null | undefined): BankAccount | null {
  const preferred = defaultId ? banks.find((b) => b._id?.toString() === defaultId) : undefined;
  if (preferred && bankFits(preferred, method)) return preferred;
  return banks.find((b) => bankFits(b, method)) ?? banks[0] ?? null;
}

/** Fecha de hoy en Bogotá como medianoche UTC (misma convención que el formulario). */
function todayBogota(): Date {
  return new Date(new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" }));
}

/**
 * Crea la cuenta de cobro en BORRADOR a partir de la opción que eligió el cliente:
 * un renglón por ítem, el ensamblaje y, si paga con tarjeta, el recargo (el cliente puede
 * cambiar de medio después y el total se ajusta). Es idempotente por solicitud. Devuelve el id o null.
 * Quien la emite (el sistema al momento, o el admin después de revisarla) es asunto de `issueCuentaFromPurchase`.
 */
export async function createDraftFromPurchase(input: DraftInput): Promise<string | null> {
  const { quote, userId, requestId, opcion, formaPago } = input;
  const chosen = quote.opciones[opcion];
  if (!chosen) return null;

  const [clients, banks, admins] = await Promise.all([
    collections.clients(),
    collections.bankAccounts(),
    collections.admins(),
  ]);
  const [client, bankDocs, adminDocs, settings] = await Promise.all([
    clients.findOne({ userId }),
    banks.find({}).sort({ creado: 1 }).toArray(),
    admins.find({}).sort({ usuario: 1 }).toArray(),
    getSettings(),
  ]);
  if (!client) return null;
  // Con tarjeta no hay cuenta bancaria (se paga por un enlace); con otro medio, la predeterminada o la que calce.
  const bank = formaPago === "tarjeta" ? null : pickBankAccount(bankDocs, formaPago, settings.bancoDefaultId);
  // Firmante: el predeterminado de Configuración; si no hay, quien tenga firma cargada y, si nadie, el primero.
  const signer =
    adminDocs.find((a) => settings.firmanteDefaultId && a._id?.toString() === settings.firmanteDefaultId) ??
    adminDocs.find((a) => a.firmaBase64) ??
    adminDocs[0];

  const baseItems: CuentaCobroItem[] = chosen.items.map((i) => ({
    descripcion: `${CATEGORY_LABELS[i.categoria] ?? i.categoria}: ${i.modelo}`,
    cantidad: 1,
    valorUnitario: i.precioCop,
  }));
  if (chosen.servicio > 0) {
    baseItems.push({ descripcion: "Servicio de ensamblaje", cantidad: 1, valorUnitario: chosen.servicio });
  }
  // Con tarjeta el total lleva el recargo; con Bre-B o transferencia es el valor base.
  const { items, ...totals } = withPaymentMethod(
    baseItems,
    0,
    surchargePct(formaPago, settings.mediosPago),
    surchargeConcept(formaPago),
  );

  const doc: Omit<CuentaCobro, "_id"> = {
    numero: await nextCuentaNumero(),
    fecha: todayBogota(),
    cliente: {
      nombre: client.nombre,
      identificacion: client.identificacion,
      direccion: client.direccion,
      telefono: client.telefono,
      email: client.email,
    },
    cuentaBanco: {
      banco: bank?.banco ?? "",
      tipoCuenta: bank?.tipoCuenta ?? null,
      numero: bank?.numero ?? null,
      llave: bank?.llave ?? null,
      titular: bank?.titular ?? "",
    },
    firmante: {
      nombre: signer ? signer.nombreCompleto?.trim() || signer.usuario : "",
      cedula: signer?.cedula ?? "",
      firmaBase64: signer?.firmaBase64 ?? null,
    },
    items,
    descuentoPct: 0,
    formaPago,
    ...totals,
    creado: new Date(),
    estado: "borrador",
    userId,
    origen: { quoteId: quote._id.toString(), requestId },
    historial: [
      {
        estado: "borrador",
        en: new Date(),
        por: "sistema",
        nota: `Generada desde la solicitud de compra de la cotización ${quote.codigo}`,
      },
    ],
  };

  try {
    const { insertedId } = await (await cuentasCol()).insertOne(doc);
    return insertedId.toString();
  } catch (error) {
    // Ya existía el borrador de esta solicitud (índice único): no es un error.
    if (error instanceof MongoServerError && error.code === 11000 && /origen/.test(error.message)) return null;
    throw error;
  }
}

/**
 * Deja lista la cuenta de cobro de una solicitud de compra: la crea y, si tiene todo lo necesario (cédula,
 * banco o llave, firmante, total; y la tarjeta no necesita enlace manual), la emite sola en nombre del sistema.
 * Si falta algo se queda en borrador para que el admin la complete. Devuelve el id y si ya salió al cliente.
 */
export async function issueCuentaFromPurchase(
  input: DraftInput & { autoEmit: boolean },
): Promise<{ id: string; sent: SentCuenta | null } | null> {
  const id = await createDraftFromPurchase(input);
  if (!id) return null;
  return { id, sent: input.autoEmit ? await sendCuentaCobro(id, "sistema") : null };
}
