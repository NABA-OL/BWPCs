/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import "server-only";
import { collections } from "@/lib/db/collections";

export type { Guide, GuideSection, GuideFaq } from "@/lib/db/types";
import type { Guide } from "@/lib/db/types";

/** Guías publicadas, más recientes primero. */
export async function getPublishedGuides(): Promise<Guide[]> {
  const col = await collections.guides();
  return col.find({ estado: "publicado" }).sort({ publicado: -1 }).toArray();
}

export async function findGuide(slug: string): Promise<Guide | null> {
  const col = await collections.guides();
  return col.findOne({ slug, estado: "publicado" });
}
