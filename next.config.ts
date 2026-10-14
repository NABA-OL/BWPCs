import type { NextConfig } from "next";

/**
 * Headers de seguridad aplicados a todas las respuestas.
 * No incluimos CSP para no romper el embed de Instagram (carga su propio
 * script e iframes); el resto son seguros y sin impacto visual.
 */
const securityHeaders = [
  // Evita que el navegador "adivine" el tipo de contenido (anti-sniffing).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Impide que otros sitios incrusten el nuestro en un iframe (anti-clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // No filtrar la URL completa como referer hacia otros dominios.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Fuerza HTTPS durante 2 años (incluye subdominios). Solo aplica en prod (HTTPS).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Desactiva APIs sensibles que el sitio no usa.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // `pnpm build:check` compila en una carpeta aparte (y la borra) para no pisar la caché de `next dev`.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Solo desarrollo: permite abrir el servidor de desarrollo desde otro dispositivo de la red local (p. ej. el celular
  // por http://192.168.x.x:3001) sin que Next bloquee el HMR. No afecta al despliegue en Vercel.
  allowedDevOrigins: ["192.168.*.*"],
  // Fija la raíz del workspace a este proyecto (hay otro lockfile en el home).
  turbopack: {
    root: __dirname,
  },
  // Sinónimos de la pieza "tarjeta madre": una sola URL canónica (docs/piezas-plan.md §2.1).
  async redirects() {
    return ["placa-base", "board", "motherboard"].map((sinonimo) => ({
      source: `/piezas/${sinonimo}`,
      destination: "/piezas/tarjeta-madre",
      permanent: true,
    }));
  },
  async headers() {
    const markdownNegotiablePaths = [
      "/",
      "/servicios",
      "/ensambles",
      "/nosotros",
      "/contacto",
      "/cotizador",
      "/privacidad",
    ];
    return [
      { source: "/:path*", headers: securityHeaders },
      // Estas rutas responden distinto según Accept (HTML vs. text/markdown) —
      // ver proxy.ts. Vary evita que un CDN sirva la variante equivocada cacheada.
      ...markdownNegotiablePaths.map((source) => ({
        source,
        headers: [{ key: "Vary", value: "Accept, Accept-Encoding" }],
      })),
    ];
  },
};

export default nextConfig;
