/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { renderQuotePdf } from "@/lib/quote-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Doble verificación (además del proxy que protege /admin/*).
  if (!(await getSession())) {
    return new Response("No autorizado", { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return new Response("No encontrado", { status: 404 });
  }

  const col = await collections.quotes();
  const quote = await col.findOne({ _id: new ObjectId(id) });
  if (!quote) {
    return new Response("No encontrado", { status: 404 });
  }

  return renderQuotePdf(quote);
}
