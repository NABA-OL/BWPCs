/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { ProofRejectedError } from "@/lib/comprobantes";
import { reportPaymentWithProof } from "@/lib/comprobantes-report";
import { formatCOP } from "@/lib/format";
import { ImageError } from "@/lib/images/process";
import { shortName } from "@/lib/reviews/rules";
import { StorageNotConfiguredError } from "@/lib/storage";
import { sendTelegramMessage } from "@/lib/telegram";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { getUserSession } from "@/lib/user-auth/session";
import { siteUrl } from "@/lib/user-auth/site-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BYTES = 8 * 1024 * 1024;
const MULTIPART_OVERHEAD = 64 * 1024;

const json = (body: object, status = 200) => Response.json(body, { status });

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Segunda barrera contra peticiones cruzadas (la cookie ya es SameSite=Lax).
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

/**
 * El cliente avisa que ya pagó adjuntando el comprobante (multipart, campo `file`).
 * Solo lleva la cuenta a "pago por confirmar": pasar a "pagada" es exclusivo del admin.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!ACCOUNTS_ENABLED) return json({ error: "No disponible." }, 404);
  if (!sameOrigin(req)) return json({ error: "Origen no permitido." }, 403);
  const session = await getUserSession();
  if (!session) return json({ error: "Inicia sesión." }, 401);
  const { user } = session;

  const { allowed } = await rateLimitStorage.consume(`comprobante:${user.id}`, {
    window: 86400,
    max: 10,
  });
  if (!allowed) return json({ error: "Enviaste muchos comprobantes hoy. Prueba mañana o escríbenos por WhatsApp." }, 429);

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES + MULTIPART_OVERHEAD) {
    return json({ error: "La imagen pesa demasiado (máximo 8 MB)." }, 413);
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get("file");
  } catch {
    return json({ error: "Solicitud no válida." }, 400);
  }
  if (!(file instanceof File) || file.size === 0) {
    return json({ error: "Adjunta la imagen del comprobante." }, 400);
  }
  if (file.size > MAX_BYTES) return json({ error: "La imagen pesa demasiado (máximo 8 MB)." }, 413);

  const { id } = await params;
  try {
    const updated = await reportPaymentWithProof(id, user.id, Buffer.from(await file.arrayBuffer()));
    after(() =>
      sendTelegramMessage(
        `💸 <b>Pago reportado</b>\n` +
          `<b>De:</b> ${escapeHtml(shortName(user.name))}\n` +
          `<b>Cuenta de cobro:</b> ${escapeHtml(updated.numero)} · ${formatCOP(updated.total)}\n\n` +
          `${siteUrl}/admin/cuentas-cobro/${id}`,
        "pagos",
      ),
    );
    revalidatePath("/cuenta", "layout");
    revalidatePath(`/cuenta/cuentas-cobro/${id}`);
    revalidatePath("/cuenta/cuentas-cobro");
    revalidatePath("/admin/cuentas-cobro");
    revalidatePath("/admin");
    return json({ ok: true });
  } catch (error) {
    if (error instanceof ImageError || error instanceof ProofRejectedError) {
      return json({ error: error.message }, 400);
    }
    if (error instanceof StorageNotConfiguredError) {
      console.error("[comprobantes]", error.message);
      return json({ error: "Los comprobantes no están disponibles por ahora. Escríbenos por WhatsApp." }, 503);
    }
    console.error("[comprobantes] fallo al guardar el comprobante", error);
    return json({ error: "No se pudo guardar el comprobante." }, 500);
  }
}
