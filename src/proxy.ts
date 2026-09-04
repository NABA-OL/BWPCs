/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { MARKDOWN_ELIGIBLE_PATHS } from "@/lib/markdown-pages";

const SESSION_COOKIE_NAME = "bw_session";

/**
 * Protege todo /admin/* excepto /admin/login.
 * En páginas públicas, negocia contenido: si el cliente pide
 * `Accept: text/markdown` (convención acceptmarkdown.com), reescribe a la
 * versión Markdown de esa misma URL en vez del HTML renderizado.
 * (Next 16 renombró la convención "middleware" → "proxy".)
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    // La página de login es pública.
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const valid = token ? await isValid(token) : false;

    if (!valid) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  const slug = MARKDOWN_ELIGIBLE_PATHS[pathname];
  const accept = req.headers.get("accept") ?? "";
  if (slug && accept.includes("text/markdown")) {
    const url = req.nextUrl.clone();
    url.pathname = `/md/${slug}`;
    const res = NextResponse.rewrite(url);
    res.headers.set("Vary", "Accept, Accept-Encoding");
    return res;
  }

  const res = NextResponse.next();
  if (slug) res.headers.set("Vary", "Accept, Accept-Encoding");
  return res;
}

async function isValid(token: string): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/",
    "/servicios",
    "/ensambles",
    "/nosotros",
    "/contacto",
    "/cotizador",
    "/privacidad",
  ],
};
