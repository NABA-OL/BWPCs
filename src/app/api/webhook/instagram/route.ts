/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-25
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { after, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface InstagramWebhookEntry {
  id: string;
  time: number;
  messaging?: unknown[];
  changes?: unknown[];
}

interface InstagramWebhookPayload {
  object: string;
  entry: InstagramWebhookEntry[];
}

function isInstagramWebhookPayload(
  value: unknown,
): value is InstagramWebhookPayload {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.object === "string" && Array.isArray(record.entry);
}

/** Compara la firma HMAC SHA256 de Meta contra el body crudo, en tiempo constante. */
function isValidSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string,
): boolean {
  if (!signatureHeader) return false;

  const expectedHex = createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");
  const expected = `sha256=${expectedHex}`;

  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(signatureHeader, "utf8");

  // timingSafeEqual lanza si los buffers tienen longitud distinta.
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

/** Procesa el payload ya verificado. Corre después del ACK — nunca debe lanzar. */
async function processWebhookPayload(rawBody: string): Promise<void> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch (error) {
    console.error(
      "[webhook/instagram] No se pudo parsear el payload:",
      error,
    );
    return;
  }

  if (!isInstagramWebhookPayload(parsed)) {
    console.error(
      "[webhook/instagram] Payload con forma inesperada:",
      parsed,
    );
    return;
  }

  // TODO: despachar cada entry.messaging / entry.changes según el tipo de evento
  // (mensajes, comentarios, menciones, etc.) una vez se defina la lógica de negocio.
  console.log(
    "[webhook/instagram] Evento recibido:",
    JSON.stringify(parsed),
  );
}

/** Verificación del webhook (handshake inicial de Meta). */
export async function GET(request: NextRequest): Promise<Response> {
  const verifyToken = process.env.INSTAGRAM_VERIFY_TOKEN;
  if (!verifyToken) {
    console.error(
      "[webhook/instagram] Falta la variable de entorno INSTAGRAM_VERIFY_TOKEN.",
    );
    return new Response("Server misconfigured", { status: 500 });
  }

  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new Response("Forbidden", { status: 403 });
}

/** Recepción de eventos (mensajes, comentarios, etc.). */
export async function POST(request: NextRequest): Promise<Response> {
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appSecret) {
    console.error(
      "[webhook/instagram] Falta la variable de entorno INSTAGRAM_APP_SECRET.",
    );
    return new Response("Server misconfigured", { status: 500 });
  }

  // Body crudo — request.text() no lo parsea, necesario para validar la firma.
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-hub-signature-256");

  if (!isValidSignature(rawBody, signatureHeader, appSecret)) {
    console.error("[webhook/instagram] Firma x-hub-signature-256 inválida.");
    return new Response("Invalid signature", { status: 401 });
  }

  // ACK inmediato: Meta espera 200 rápido y reintenta agresivamente si no responde.
  // El procesamiento real corre después de enviar la respuesta (no la bloquea).
  after(() => processWebhookPayload(rawBody));

  return new Response("EVENT_RECEIVED", { status: 200 });
}
