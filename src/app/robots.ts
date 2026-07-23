// Desarrollado por BlacKraken Solutions
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/",
    },
    sitemap: "https://bw-pcs.vercel.app/sitemap.xml",
  };
}
