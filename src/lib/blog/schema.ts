/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */
import { z } from "zod";

export const GuideSectionSchema = z.object({
  h2: z.string(),
  parrafos: z.array(z.string()).min(1),
  lista: z.array(z.string()).optional(),
});

export const GuideFaqSchema = z.object({ q: z.string(), a: z.string() });

export const GuideSeccionesSchema = z.array(GuideSectionSchema);
export const GuideFaqsSchema = z.array(GuideFaqSchema);
