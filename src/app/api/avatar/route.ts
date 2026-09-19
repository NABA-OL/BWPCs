/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { renderAvatarSvg } from "@/lib/avatar";
import {
  AVATAR_SEED_RE,
  isAvatarStyle,
} from "@/lib/avatar-styles";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";

export const runtime = "nodejs";

/**
 * SVG del avatar: GET /api/avatar?style=...&seed=... Es determinista (misma
 * URL → mismo SVG), así que se cachea para siempre en el CDN. Solo acepta los
 * estilos de la lista y semillas cortas alfanuméricas.
 */
export async function GET(req: Request) {
  if (!ACCOUNTS_ENABLED) return new Response(null, { status: 404 });

  // Solo las combinaciones NUEVAS llegan aquí (el CDN sirve las repetidas): este
  // tope frena a quien recorre semillas para gastar CPU. Complementa la regla de
  // límite del WAF de Vercel para /api/avatar.
  const ip = req.headers.get("x-real-ip") ?? "sin-ip";
  const { allowed } = await rateLimitStorage.consume(`avatar:${ip}`, {
    window: 60,
    max: 120,
  });
  if (!allowed) return new Response("Demasiadas solicitudes", { status: 429 });

  const params = new URL(req.url).searchParams;
  const style = params.get("style");
  const seed = params.get("seed");
  if (!isAvatarStyle(style) || !seed || !AVATAR_SEED_RE.test(seed)) {
    return new Response("Parámetros no válidos", { status: 400 });
  }

  return new Response(renderAvatarSvg(style, seed), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      // El SVG solo se muestra vía <img>; esto evita scripts si se abre suelto.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}
