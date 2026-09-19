/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";

/** Cotizaciones PUBLICADAS para esta cuenta (las más recientes primero). */
export async function getMyQuotes(userId: string) {
  const col = await collections.quotes();
  return col
    .find({ userId, estado: "publicada" })
    .sort({ fecha: -1 })
    .limit(100)
    .toArray();
}

/** Una cotización, solo si es de esta cuenta y está publicada. */
export async function getMyQuote(userId: string, id: string) {
  if (!ObjectId.isValid(id)) return null;
  const col = await collections.quotes();
  return col.findOne({
    _id: new ObjectId(id),
    userId,
    estado: "publicada",
  });
}

/** Solicitudes enviadas y selecciones guardadas de esta cuenta. */
export async function getMyLeads(userId: string) {
  const col = await collections.leads();
  return col.find({ userId }).sort({ creado: -1 }).limit(50).toArray();
}

/**
 * ¿Tiene al menos una compra confirmada? (alguna cuenta de cobro suya en estado "pagada", sea cual
 * sea el medio). Es el requisito para reseñar y subir fotos: solo opina quien compró.
 */
export async function hasPaidPurchase(userId: string): Promise<boolean> {
  const col = await collections.cuentasCobro();
  return (await col.countDocuments({ userId, estado: "pagada" }, { limit: 1 })) > 0;
}

/** Cotizaciones (de estos ids) que ya se compraron: alguna cuenta de cobro nacida de ellas quedó pagada. */
export async function purchasedQuoteIds(quoteIds: string[]): Promise<Set<string>> {
  if (quoteIds.length === 0) return new Set();
  const col = await collections.cuentasCobro();
  const paid = await col.distinct("origen.quoteId", { "origen.quoteId": { $in: quoteIds }, estado: "pagada" });
  return new Set(paid.filter((id): id is string => typeof id === "string"));
}

export async function isQuotePurchased(quoteId: string): Promise<boolean> {
  return (await purchasedQuoteIds([quoteId])).has(quoteId);
}
