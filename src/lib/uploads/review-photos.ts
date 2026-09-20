/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
// OJO: este módulo NO debe importar `@/lib/images/process` (sharp): lo importan `auth.ts` y casi todas las
// rutas, y sharp pesa ~18 MB por función en Vercel. La subida (con sharp) vive en `review-photo-upload.ts`.
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";
import type { Upload } from "@/lib/db/types";
import { getStorage } from "@/lib/storage";

/** Fotos subidas que aún no van en una reseña, por usuario. */
export const MAX_PENDING_PHOTOS = 12;
export const PENDING_TTL_MS = 24 * 60 * 60 * 1000;

// Carpeta (prefijo) del bucket donde van las fotos de reseñas.
export const KEY_PREFIX = "img-resenas";

export class UploadLimitError extends Error {}

export interface PhotoDto {
  id: string;
  url: string;
  thumbUrl: string;
  width: number;
  height: number;
}

export function toDto(upload: Upload & { _id: ObjectId }): PhotoDto {
  const storage = getStorage();
  return {
    id: upload._id.toString(),
    url: storage.url(upload.key),
    thumbUrl: storage.url(upload.thumbKey),
    width: upload.width,
    height: upload.height,
  };
}

export async function removeUploads(uploads: Upload[]) {
  if (uploads.length === 0) return;
  await getStorage().remove(uploads.flatMap((u) => [u.key, u.thumbKey]));
  const col = await collections.uploads();
  await col.deleteMany({ _id: { $in: uploads.map((u) => u._id!) } });
}

/** Borra una foto propia que todavía no está en una reseña. */
export async function deletePendingPhoto(
  userId: string,
  id: string,
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await collections.uploads();
  const upload = await col.findOne({
    _id: new ObjectId(id),
    userId,
    estado: "pendiente",
  });
  if (!upload) return false;
  await removeUploads([upload]);
  return true;
}

/** Borra TODAS las fotos de un usuario (al eliminar su cuenta). */
export async function deleteAllUserPhotos(userId: string) {
  const col = await collections.uploads();
  await removeUploads(await col.find({ userId }).toArray());
}

export class InvalidPhotosError extends Error {}

/**
 * Fotos que una reseña puede llevar: las pendientes de este usuario o las que
 * ya son de esa misma reseña. Lanza si alguna no existe o es de otra persona.
 */
export async function assertReviewPhotos(
  userId: string,
  ids: string[],
  reviewId: string | null,
): Promise<void> {
  if (ids.length === 0) return;
  if (new Set(ids).size !== ids.length || !ids.every((i) => ObjectId.isValid(i))) {
    throw new InvalidPhotosError("Las fotos no son válidas.");
  }
  const col = await collections.uploads();
  const found = await col.countDocuments({
    _id: { $in: ids.map((i) => new ObjectId(i)) },
    userId,
    $or: [
      { estado: "pendiente" },
      ...(reviewId ? [{ estado: "adjunta" as const, reviewId }] : []),
    ],
  });
  if (found !== ids.length) {
    throw new InvalidPhotosError("Alguna foto ya no está disponible. Súbela de nuevo.");
  }
}

/** Deja `keep` como las fotos de la reseña y borra las que sobran (`previous`). */
export async function syncReviewPhotos(
  userId: string,
  reviewId: string,
  keep: string[],
  previous: string[],
): Promise<void> {
  const col = await collections.uploads();
  if (keep.length > 0) {
    await col.updateMany(
      { _id: { $in: keep.map((i) => new ObjectId(i)) }, userId },
      { $set: { estado: "adjunta", reviewId } },
    );
  }
  const dropped = previous.filter((id) => !keep.includes(id));
  if (dropped.length > 0) {
    await removeUploads(
      await col
        .find({ _id: { $in: dropped.map((i) => new ObjectId(i)) }, userId })
        .toArray(),
    );
  }
}

/** Borra todas las fotos de una reseña (al eliminarla). */
export async function deleteReviewPhotos(reviewId: string): Promise<void> {
  const col = await collections.uploads();
  await removeUploads(await col.find({ reviewId }).toArray());
}

/** Fotos por id, en el orden pedido y solo las que existen. */
export async function getPhotos(ids: string[]): Promise<PhotoDto[]> {
  const valid = ids.filter((i) => ObjectId.isValid(i));
  if (valid.length === 0) return [];
  const col = await collections.uploads();
  const docs = await col
    .find({ _id: { $in: valid.map((i) => new ObjectId(i)) } })
    .toArray();
  const byId = new Map(docs.map((d) => [d._id!.toString(), d]));
  return valid.flatMap((id) => {
    const doc = byId.get(id);
    return doc ? [toDto({ ...doc, _id: doc._id! })] : [];
  });
}
