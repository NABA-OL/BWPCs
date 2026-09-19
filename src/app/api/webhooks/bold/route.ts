/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { boldConfig } from "@/lib/bold";
import { handleBoldEvent } from "@/lib/bold-payments";
import { verifyBoldSignature } from "@/lib/bold-signature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 64 * 1024;

/** Lee el cuerpo crudo cortando la lectura al pasar el tope (no confía en Content-Length). */
async function readCapped(req: Request, max: number): Promise<string | null> {
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * Webhook de Bold (pagos con tarjeta). No hay sesión: lo autentica la firma HMAC del
 * cuerpo crudo con la llave secreta. Bold exige responder 200 en menos de 2 s y reintenta
 * si no lo recibe; por eso el trabajo es corto y todo es idempotente.
 */
export async function POST(req: Request) {
  const config = boldConfig();
  if (!config) return new Response("Bold no está configurado.", { status: 503 });

  const rawBody = await readCapped(req, MAX_BODY_BYTES);
  if (rawBody === null) return new Response("Cuerpo demasiado grande.", { status: 413 });

  // En pruebas Bold firma con clave vacía (por eso el modo de pruebas nunca corre en producción).
  const secrets = config.mode === "test" ? ["", config.secret] : [config.secret];
  if (!verifyBoldSignature(rawBody, req.headers.get("x-bold-signature"), secrets)) {
    return new Response("Firma no válida.", { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("JSON no válido.", { status: 400 });
  }

  try {
    await handleBoldEvent(event, config);
  } catch (error) {
    console.error("[bold] fallo al procesar el webhook", error);
    return new Response("Error al procesar.", { status: 500 }); // Bold reintenta
  }
  return Response.json({ ok: true });
}
