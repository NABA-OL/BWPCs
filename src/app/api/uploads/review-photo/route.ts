/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { hasPublishedQuote } from "@/lib/account/quotes";
import { ImageError } from "@/lib/images/process";
import { StorageNotConfiguredError } from "@/lib/storage";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";
import { getUserSession } from "@/lib/user-auth/session";
import {
  UploadLimitError,
  deletePendingPhoto,
  saveReviewPhoto,
} from "@/lib/uploads/review-photos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30; // procesar una foto grande no debe colgar la función

const MAX_BYTES = 8 * 1024 * 1024; // foto original de celular
const MULTIPART_OVERHEAD = 64 * 1024;

const json = (body: object, status = 200) => Response.json(body, { status });

// La cookie de sesión es SameSite=Lax (no viaja en POST de otros sitios); esto
// es una segunda barrera contra peticiones cruzadas.
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

async function authorize(req: Request) {
  if (!ACCOUNTS_ENABLED) return { error: json({ error: "No disponible." }, 404) };
  if (!sameOrigin(req)) return { error: json({ error: "Origen no permitido." }, 403) };
  const session = await getUserSession();
  if (!session) return { error: json({ error: "Inicia sesión." }, 401) };
  return { userId: session.user.id };
}

/** Sube una foto de reseña (multipart, campo `file`). Devuelve la foto procesada. */
export async function POST(req: Request) {
  const auth = await authorize(req);
  if (auth.error) return auth.error;
  const { userId } = auth;

  if (!(await hasPublishedQuote(userId))) {
    return json({ error: "Las fotos se pueden subir después de tener una cotización con B & W." }, 403);
  }

  const { allowed } = await rateLimitStorage.consume(`upload:${userId}`, {
    window: 3600,
    max: 30,
  });
  if (!allowed) return json({ error: "Demasiadas subidas. Prueba más tarde." }, 429);

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES + MULTIPART_OVERHEAD) {
    return json({ error: "La foto pesa demasiado (máximo 8 MB)." }, 413);
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get("file");
  } catch {
    return json({ error: "Solicitud no válida." }, 400);
  }
  if (!(file instanceof File) || file.size === 0) {
    return json({ error: "Falta la foto." }, 400);
  }
  if (file.size > MAX_BYTES) {
    return json({ error: "La foto pesa demasiado (máximo 8 MB)." }, 413);
  }

  try {
    const photo = await saveReviewPhoto(userId, Buffer.from(await file.arrayBuffer()));
    return json(photo, 201);
  } catch (error) {
    if (error instanceof ImageError) return json({ error: error.message }, 400);
    if (error instanceof UploadLimitError) return json({ error: error.message }, 409);
    if (error instanceof StorageNotConfiguredError) {
      console.error("[uploads]", error.message);
      return json({ error: "Las fotos no están disponibles por ahora." }, 503);
    }
    console.error("[uploads] fallo al guardar la foto", error);
    return json({ error: "No se pudo guardar la foto." }, 500);
  }
}

/** Quita una foto propia que aún no está en una reseña: DELETE ?id=... */
export async function DELETE(req: Request) {
  const auth = await authorize(req);
  if (auth.error) return auth.error;

  const id = new URL(req.url).searchParams.get("id") ?? "";
  const removed = await deletePendingPhoto(auth.userId, id);
  return removed ? json({ ok: true }) : json({ error: "No encontrada." }, 404);
}
