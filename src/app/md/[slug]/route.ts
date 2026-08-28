/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-27
 */
import { MARKDOWN_PAGES } from "@/lib/markdown-pages";

/** Servido internamente vía rewrite desde proxy.ts (Accept: text/markdown). No es una ruta pública navegable. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const body = MARKDOWN_PAGES[slug];
  if (!body) return new Response("Not found", { status: 404 });

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
