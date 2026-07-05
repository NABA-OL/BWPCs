// Desarrollado por NABA-OL
import type { MetadataRoute } from "next";

const BASE = "https://bwpcs.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/cotizador`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/servicios`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/ensambles`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/contacto`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/nosotros`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
