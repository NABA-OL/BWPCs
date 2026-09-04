/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";

const BASE = "https://bw-pcs.com";

const BUDGETS = ["3-millones", "5-millones", "8-millones"];
const USE_CASES = ["edicion-de-video", "arquitectura-y-render", "streaming"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/cotizador`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/servicios`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/componentes`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/ensambles`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/guias`, changeFrequency: "weekly", priority: 0.7 },
    ...GUIDES.map((g) => ({
      url: `${BASE}/guias/${g.slug}`,
      lastModified: new Date(g.actualizado),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...BUDGETS.map((slug) => ({
      url: `${BASE}/pc-gamer/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...USE_CASES.map((slug) => ({
      url: `${BASE}/pc-para/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${BASE}/contacto`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/nosotros`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/privacidad`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
