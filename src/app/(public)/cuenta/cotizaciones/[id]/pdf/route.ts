/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { renderQuotePdf } from "@/lib/quote-pdf";
import { getMyQuote } from "@/lib/account/quotes";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { getUserSession } from "@/lib/user-auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PDF de una cotización para su dueño: exige sesión, que la cotización sea de
// esta cuenta y esté publicada. Sin enlaces con token: solo la sesión autoriza.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getUserSession();
  if (!session) return new Response("No autorizado", { status: 401 });

  // Generar el PDF es costoso (CPU): tope por usuario.
  const { allowed } = await rateLimitStorage.consume(`pdf:${session.user.id}`, {
    window: 3600,
    max: 20,
  });
  if (!allowed) return new Response("Demasiadas descargas. Prueba más tarde.", { status: 429 });

  const { id } = await params;
  const quote = await getMyQuote(session.user.id, id);
  if (!quote) return new Response("No encontrado", { status: 404 });

  return renderQuotePdf(quote);
}
