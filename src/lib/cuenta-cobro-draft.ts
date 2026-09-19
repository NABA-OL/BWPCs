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

/** Cuenta bancaria que mejor calza con el medio de pago: llave para Bre-B, cuenta normal para transferencia. */
function pickBankAccount(banks: BankAccount[], method: PaymentMethod): BankAccount | null {
  const wanted =
    method === "bre-b" ? banks.find((b) => b.llave) : method === "transferencia" ? banks.find((b) => b.numero) : undefined;
  return wanted ?? banks[0] ?? null;
}

/** Fecha de hoy en Bogotá como medianoche UTC (misma convención que el formulario). */
function todayBogota(): Date {
  return new Date(new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" }));
}

/**
 * Crea la cuenta de cobro en BORRADOR a partir de la opción que eligió el cliente:
 * un renglón por ítem, el ensamblaje y, si paga con tarjeta, el recargo (el cliente puede
 * cambiar de medio después y el total se ajusta). El admin la revisa, completa lo que falte
 * (p. ej. la cédula) y la envía. Es idempotente por solicitud. Devuelve el id o null.
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
  const [client, bankDocs, adminDocs] = await Promise.all([
    clients.findOne({ userId }),
    banks.find({}).sort({ creado: 1 }).toArray(),
    admins.find({}).sort({ usuario: 1 }).toArray(),
  ]);
  if (!client) return null;
  // Con tarjeta no hay cuenta bancaria (se paga por un enlace); con otro medio, la de por defecto.
  const bank = formaPago === "tarjeta" ? null : pickBankAccount(bankDocs, formaPago);
  // Firmante: quien tenga firma cargada; si nadie, el primero (igual que el selector del formulario).
  const signer = adminDocs.find((a) => a.firmaBase64) ?? adminDocs[0];

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
    surchargePct(formaPago, (await getSettings()).mediosPago),
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
        por: "admin",
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
