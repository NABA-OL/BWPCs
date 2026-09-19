/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { getMyCuentaCobro } from "@/lib/account/cuentas-cobro";
import { renderCuentaCobroPdf } from "@/lib/cuenta-cobro-pdf";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { getUserSession } from "@/lib/user-auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PDF de una cuenta de cobro para su dueña: exige sesión y que la cuenta sea de
// esta cuenta y ya esté enviada. Sin enlaces con token: solo la sesión autoriza.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!ACCOUNTS_ENABLED) return new Response("No encontrado", { status: 404 });
  const session = await getUserSession();
  if (!session) return new Response("No autorizado", { status: 401 });

  // Generar el PDF es costoso (CPU): tope por usuario (compartido con el de cotizaciones).
  const { allowed } = await rateLimitStorage.consume(`pdf:${session.user.id}`, {
    window: 3600,
    max: 20,
  });
  if (!allowed) return new Response("Demasiadas descargas. Prueba más tarde.", { status: 429 });

  const { id } = await params;
  const cuenta = await getMyCuentaCobro(session.user.id, id);
  if (!cuenta) return new Response("No encontrado", { status: 404 });

  return renderCuentaCobroPdf(cuenta);
}
