/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { MongoServerError, ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";
import type { PaymentMethod, QuoteRequest } from "@/lib/db/types";
import { MAX_PURCHASES_PER_QUOTE, MAX_REVISIONS_PER_QUOTE } from "@/lib/quote-limits";

let indexReady: Promise<unknown> | null = null;

/**
 * Un solo pedido pendiente por cotización (cambios O compra), garantizado por
 * índice único parcial: dos envíos simultáneos no crean dos.
 */
async function requestsCol() {
  const col = await collections.quoteRequests();
  indexReady ??= Promise.all([
    col.createIndex(
      { quoteId: 1 },
      {
        name: "quoteId_pending_unique",
        unique: true,
        partialFilterExpression: { estado: "pendiente" },
      },
    ),
    col.createIndex({ userId: 1 }),
    col.createIndex({ estado: 1, creado: -1 }),
  ]).catch((error: unknown) => console.error("[quote-requests] índices", error));
  await indexReady;
  return col;
}

export type CreateRequestResult =
  | { ok: true; requestId: string }
  | { ok: false; reason: "pending" | "limit" };

interface CreateInput {
  quoteId: string;
  userId: string;
  opcionPreferida: number | null;
  comentario: string;
  versionBase: number;
  formaPago?: PaymentMethod;
  totalCop?: number;
}

/** Máximo de pedidos de cada tipo por cotización. */
const MAX_PER_TYPE = { revision: MAX_REVISIONS_PER_QUOTE, compra: MAX_PURCHASES_PER_QUOTE } as const;

/** Registra el pedido y marca la cotización según su tipo. */
export async function createQuoteRequest(
  tipo: QuoteRequest["tipo"],
  input: CreateInput,
): Promise<CreateRequestResult> {
  const col = await requestsCol();
  if ((await col.countDocuments({ quoteId: input.quoteId, tipo })) >= MAX_PER_TYPE[tipo]) {
    return { ok: false, reason: "limit" };
  }
  let requestId: string;
  try {
    const { insertedId } = await col.insertOne({
      ...input,
      tipo,
      estado: "pendiente",
      creado: new Date(),
      atendidaEn: null,
    });
    requestId = insertedId.toString();
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return { ok: false, reason: "pending" };
    }
    throw error;
  }
  const quotes = await collections.quotes();
  await quotes.updateOne(
    { _id: new ObjectId(input.quoteId) },
    { $set: { estadoComercial: tipo === "compra" ? "compra_solicitada" : "en_revision" } },
  );
  return { ok: true, requestId };
}

/** Pedidos de una cotización (cambios y compra), el más reciente primero. */
export async function listQuoteRequests(quoteId: string): Promise<QuoteRequest[]> {
  return (await requestsCol())
    .find({ quoteId })
    .sort({ creado: -1 })
    .limit(MAX_REVISIONS_PER_QUOTE + MAX_PURCHASES_PER_QUOTE)
    .toArray();
}

/** Pedidos pendientes por tipo (para los avisos del admin). */
export async function countPendingRequests(): Promise<Record<QuoteRequest["tipo"], number>> {
  const groups = await (await requestsCol())
    .aggregate<{ _id: QuoteRequest["tipo"]; n: number }>([
      { $match: { estado: "pendiente" } },
      { $group: { _id: "$tipo", n: { $sum: 1 } } },
    ])
    .toArray();
  const counts = { revision: 0, compra: 0 };
  for (const g of groups) counts[g._id] = g.n;
  return counts;
}

/** Tipo del pedido pendiente de cada cotización (para la lista del admin). */
export async function pendingRequestTypes(): Promise<Map<string, QuoteRequest["tipo"]>> {
  const docs = await (await requestsCol())
    .find({ estado: "pendiente" }, { projection: { quoteId: 1, tipo: 1 } })
    .toArray();
  return new Map(docs.map((d) => [d.quoteId, d.tipo]));
}

/** Cierra el pedido pendiente (`atendida` al enviar versión nueva, `cancelada` si ya no aplica). */
export async function closePendingRequest(
  quoteId: string,
  estado: "atendida" | "cancelada",
): Promise<void> {
  const col = await requestsCol();
  await col.updateMany(
    { quoteId, estado: "pendiente" },
    { $set: { estado, atendidaEn: new Date() } },
  );
  const quotes = await collections.quotes();
  await quotes.updateOne({ _id: new ObjectId(quoteId) }, { $unset: { estadoComercial: "" } });
}

export async function deleteRevisionsOfQuote(quoteId: string): Promise<void> {
  await (await requestsCol()).deleteMany({ quoteId });
}

export async function deleteRevisionsOfUser(userId: string): Promise<void> {
  await (await requestsCol()).deleteMany({ userId });
}

/** Cierra como atendida una solicitud de compra concreta (p. ej. al enviarse su cuenta de cobro). */
export async function closePurchaseRequest(requestId: string): Promise<void> {
  if (!ObjectId.isValid(requestId)) return;
  const col = await requestsCol();
  const closed = await col.findOneAndUpdate(
    { _id: new ObjectId(requestId), tipo: "compra", estado: "pendiente" },
    { $set: { estado: "atendida", atendidaEn: new Date() } },
  );
  if (!closed) return;
  const quotes = await collections.quotes();
  await quotes.updateOne(
    { _id: new ObjectId(closed.quoteId), estadoComercial: "compra_solicitada" },
    { $unset: { estadoComercial: "" } },
  );
}
