// Desarrollado por NABA-OL
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/",
    },
    sitemap: "https://bwpcs.vercel.app/sitemap.xml",
  };
}
