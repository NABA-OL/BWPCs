/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-20
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { randomUUID } from "node:crypto";
import { collections } from "@/lib/db/collections";
import type { Upload } from "@/lib/db/types";
import { processImage } from "@/lib/images/process";
import { getStorage } from "@/lib/storage";
import {
  KEY_PREFIX,
  MAX_PENDING_PHOTOS,
  PENDING_TTL_MS,
  UploadLimitError,
  removeUploads,
  toDto,
  type PhotoDto,
} from "@/lib/uploads/review-photos";

// Separado de `review-photos.ts` a propósito: este archivo importa sharp (vía `images/process`) y solo lo
// necesita la ruta de subida. Así el resto de funciones de Vercel no empaquetan libvips (~18 MB cada una).

/**
 * Procesa y guarda una foto de reseña. Antes borra fotos pendientes vencidas
 * (más de 24 h sin adjuntar).
 */
export async function saveReviewPhoto(
  userId: string,
  raw: Buffer,
): Promise<PhotoDto> {
  const col = await collections.uploads();

  // Fotos pendientes vencidas (de cualquier usuario, en lotes): nadie las adjuntó.
  // Se limpian al subir otra, así no hace falta un cron ni quedan huérfanas si el
  // dueño no vuelve.
  await removeUploads(
    await col
      .find({
        estado: "pendiente",
        creado: { $lt: new Date(Date.now() - PENDING_TTL_MS) },
      })
      .limit(25)
      .toArray(),
  );

  const pending = await col.countDocuments({ userId, estado: "pendiente" });
  if (pending >= MAX_PENDING_PHOTOS) {
    throw new UploadLimitError(
      "Tienes muchas fotos sin usar. Elimina algunas o publica tu reseña.",
    );
  }

  const image = await processImage(raw);
  const id = randomUUID();
  const key = `${KEY_PREFIX}/${id}.webp`;
  const thumbKey = `${KEY_PREFIX}/${id}-t.webp`;

  const storage = getStorage();
  await Promise.all([
    storage.put(key, image.full, "image/webp"),
    storage.put(thumbKey, image.thumb, "image/webp"),
  ]);

  const doc: Upload = {
    userId,
    key,
    thumbKey,
    width: image.width,
    height: image.height,
    bytes: image.full.byteLength,
    estado: "pendiente",
    creado: new Date(),
  };
  try {
    const { insertedId } = await col.insertOne(doc);
    return toDto({ ...doc, _id: insertedId });
  } catch (error) {
    // Sin registro en la BD el archivo quedaría huérfano: se retira.
    await storage.remove([key, thumbKey]).catch(() => undefined);
    throw error;
  }
}
