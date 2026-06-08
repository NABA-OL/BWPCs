import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "bw_session";

/**
 * Protege todo /admin/* excepto /admin/login.
 * Verifica el JWT de sesión directamente (Edge runtime), sin tocar la BD.
 * (Next 16 renombró la convención "middleware" → "proxy".)
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
  matcher: ["/admin/:path*"],
};
