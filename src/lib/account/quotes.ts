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

/** ¿Tiene al menos una cotización publicada? (requisito para subir fotos/reseñar). */
export async function hasPublishedQuote(userId: string): Promise<boolean> {
  const col = await collections.quotes();
  return (await col.countDocuments({ userId, estado: "publicada" }, { limit: 1 })) > 0;
}
