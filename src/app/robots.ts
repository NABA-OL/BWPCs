/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { MetadataRoute } from "next";

// Agentes de IA conocidos, permitidos explícitamente (no solo por el "*" genérico) —
// algunos auditores de "agent readiness" solo reconocen reglas nombradas por user-agent.
const AI_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "CCBot",
];

// Rutas privadas o sin contenido para buscadores (el grupo de cada agente nombrado
// reemplaza al de "*", por eso se repite la lista).
const DISALLOWED = [
  "/admin/",
  "/style-guide",
  "/cuenta/",
  "/api/user-auth/",
  "/api/uploads/",
  "/api/avatar",
  "/api/comprobantes/",
  "/api/cuentas-cobro/",
  "/api/webhooks/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOWED },
      ...AI_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOWED,
      })),
    ],
    sitemap: "https://bw-pcs.com/sitemap.xml",
  };
}
