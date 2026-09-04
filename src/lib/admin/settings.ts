/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { collections, DEFAULT_SETTINGS } from "@/lib/db/collections";
import type { Settings } from "@/lib/db/types";

/** Devuelve el documento de settings, creándolo con valores por defecto si no existe. */
export async function getSettings(): Promise<Settings> {
  const col = await collections.settings();
  const existing = await col.findOne({});
  if (existing) return existing;

  const doc = { ...DEFAULT_SETTINGS, actualizado: new Date() };
  const { insertedId } = await col.insertOne(doc);
  return { ...doc, _id: insertedId };
}
