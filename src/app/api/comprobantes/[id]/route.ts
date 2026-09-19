/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { getSession } from "@/lib/auth/session";
import { findProofOwner } from "@/lib/comprobantes";
import { getPrivateStorage } from "@/lib/storage";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { getUserSession } from "@/lib/user-auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const notFound = () => new Response("No encontrado", { status: 404 });

/**
 * Sirve un comprobante. El bucket es privado: solo lo ve el admin (sesión de admin)
 * o la cuenta a la que pertenece la cuenta de cobro. Cualquier otra persona recibe
 * 404 (no se revela si el id existe). Nunca se guarda en cachés.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owner = await findProofOwner(id);
  if (!owner) return notFound();

  const isAdmin = (await getSession()) !== null;
  if (!isAdmin) {
    if (!ACCOUNTS_ENABLED) return notFound();
    const session = await getUserSession();
    if (!session || !owner.userId || owner.userId !== session.user.id) return notFound();
    const { allowed } = await rateLimitStorage.consume(`comprobante-ver:${session.user.id}`, {
      window: 3600,
      max: 60,
    });
    if (!allowed) return new Response("Demasiadas consultas. Prueba más tarde.", { status: 429 });
  }

  const object = await getPrivateStorage().get(owner.proof.key);
  if (!object) return notFound();

  return new Response(new Uint8Array(object.body), {
    headers: {
      "Content-Type": "image/webp", // siempre WebP: lo generamos nosotros, nunca el tipo que declaró quien subió
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; sandbox",
    },
  });
}
