/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/db/collections";
import type { Review } from "@/lib/db/types";
import { cuentasCol } from "@/lib/cuentas-cobro";
import { shortName } from "@/lib/reviews/rules";
import { getPublicUser, getPublicUsers } from "@/lib/user-auth/users";
import {
  assertReviewPhotos,
  deleteReviewPhotos,
  getPhotos,
  syncReviewPhotos,
  type PhotoDto,
} from "@/lib/uploads/review-photos";

let indexReady: Promise<unknown> | null = null;

/** Una reseña por cuenta, garantizado por índice único (se crea una vez). */
async function reviewsCol() {
  const col = await collections.reviews();
  indexReady ??= (async () => {
    // Índice anterior (total): no admitía varias reseñas conservadas sin userId.
    await col.dropIndex("userId_1").catch(() => undefined);
    await col.createIndex(
      { userId: 1 },
      {
        name: "userId_unique",
        unique: true,
        partialFilterExpression: { userId: { $type: "string" } },
      },
    );
    // Solo acelera el listado del admin: si falla, no debe tumbar las reseñas.
    await col
      .createIndex({ estado: 1, actualizado: -1 }, { name: "estado_actualizado" })
      .catch((error: unknown) => console.error("[reviews] índice estado_actualizado", error));
  })();
  await indexReady;
  return col;
}

export interface MyReview {
  review: Review & { _id: ObjectId };
  photos: PhotoDto[];
}

export async function getMyReview(userId: string): Promise<MyReview | null> {
  const review = await (await reviewsCol()).findOne({ userId });
  if (!review) return null;
  return {
    review: { ...review, _id: review._id! },
    photos: await getPhotos(review.fotoIds),
  };
}

interface SaveInput {
  userId: string;
  estrellas: number;
  comentario: string;
  fotoIds: string[];
}

/**
 * Crea o edita la reseña de la cuenta. Toda edición vuelve a "pendiente": lo
 * aprobado deja de verse hasta que se modere de nuevo.
 */
export async function saveMyReview(input: SaveInput): Promise<Review> {
  const col = await reviewsCol();
  const existing = await col.findOne({ userId: input.userId });
  await assertReviewPhotos(
    input.userId,
    input.fotoIds,
    existing?._id?.toString() ?? null,
  );

  const now = new Date();
  const fields = {
    estrellas: input.estrellas,
    comentario: input.comentario,
    fotoIds: input.fotoIds,
    compraVerificada: true, // quien llega aquí pasó `hasPaidPurchase` en la acción
    estado: "pendiente" as const,
    motivo: null,
    autor: null,
    moderadaEn: null,
    actualizado: now,
  };

  let saved: Review;
  if (existing) {
    await col.updateOne({ _id: existing._id }, { $set: fields });
    saved = { ...existing, ...fields };
  } else {
    const doc: Review = { userId: input.userId, ...fields, creado: now };
    const { insertedId } = await col.insertOne(doc);
    saved = { ...doc, _id: insertedId };
  }

  await syncReviewPhotos(
    input.userId,
    saved._id!.toString(),
    input.fotoIds,
    existing?.fotoIds ?? [],
  );
  return saved;
}

export interface PublicReview {
  id: string;
  estrellas: number;
  comentario: string;
  autor: { nombre: string; avatarStyle: string; avatarSeed: string };
  fotos: PhotoDto[];
  compraVerificada: boolean;
  componentes: string[];
}

/** Reseñas aprobadas para la home (las más recientes primero). */
export async function getApprovedReviews(limit = 6): Promise<PublicReview[]> {
  const docs = await (await reviewsCol())
    .find({ estado: "aprobada", autor: { $ne: null } })
    .sort({ moderadaEn: -1 })
    .limit(limit)
    .toArray();
  return Promise.all(
    docs.map(async (r) => ({
      id: r._id!.toString(),
      estrellas: r.estrellas,
      comentario: r.comentario,
      autor: r.autor!,
      fotos: await getPhotos(r.fotoIds),
      compraVerificada: r.compraVerificada === true,
      componentes: r.componentes ?? [],
    })),
  );
}

/** Datos públicos de una reseña aprobada para dibujarla como imagen de historia. */
export interface StoryReview {
  nombre: string;
  avatarStyle: string;
  avatarSeed: string;
  estrellas: number;
  comentario: string;
  componentes: string[];
  compraVerificada: boolean;
}

/** Solo lo que ya se muestra en la home (nombre corto, avatar, texto): nunca correo ni teléfono. */
export async function getReviewForStory(id: string): Promise<StoryReview | null> {
  if (!ObjectId.isValid(id)) return null;
  const r = await (await reviewsCol()).findOne({ _id: new ObjectId(id), estado: "aprobada" });
  if (!r?.autor) return null;
  return {
    nombre: r.autor.nombre,
    avatarStyle: r.autor.avatarStyle,
    avatarSeed: r.autor.avatarSeed,
    estrellas: r.estrellas,
    comentario: r.comentario,
    componentes: r.componentes ?? [],
    compraVerificada: r.compraVerificada === true,
  };
}

/** Cantidad y promedio de estrellas de las reseñas aprobadas. */
export async function getReviewStats(): Promise<{ count: number; average: number }> {
  const [row] = await (await reviewsCol())
    .aggregate<{ count: number; average: number }>([
      { $match: { estado: "aprobada" } },
      { $group: { _id: null, count: { $sum: 1 }, average: { $avg: "$estrellas" } } },
    ])
    .toArray();
  return { count: row?.count ?? 0, average: row?.average ?? 0 };
}

export async function countPendingReviews(): Promise<number> {
  return (await reviewsCol()).countDocuments({ estado: "pendiente" });
}

export interface AdminReview {
  id: string;
  /** `actualizado` en ISO: versión que se envía al aprobar. */
  version: string;
  estado: Review["estado"];
  estrellas: number;
  comentario: string;
  motivo: string | null;
  autorNombre: string;
  autorCorreo: string;
  cuentaEliminada: boolean;
  fotos: PhotoDto[];
  actualizado: Date;
  /** Detalles del ensamble ya guardados. */
  componentes: string[];
  /** Sugeridos desde la cuenta de cobro pagada de la autora (solo si aún no hay detalles). */
  sugeridos: string[];
}

export const REVIEWS_PAGE_SIZE = 10;

export interface AdminReviewPage {
  reviews: AdminReview[];
  page: number;
  totalPages: number;
  /** Conteo por estado, para las pestañas. */
  counts: Record<Review["estado"], number>;
}

/** Reseñas de un estado, la más reciente primero, paginadas en el servidor. */
export async function listReviewsForAdmin(
  estado: Review["estado"],
  requestedPage: number,
): Promise<AdminReviewPage> {
  const col = await reviewsCol();
  const counts: AdminReviewPage["counts"] = { pendiente: 0, aprobada: 0, rechazada: 0 };
  const grouped = await col
    .aggregate<{ _id: Review["estado"]; n: number }>([
      { $group: { _id: "$estado", n: { $sum: 1 } } },
    ])
    .toArray();
  for (const g of grouped) counts[g._id] = g.n;

  const totalPages = Math.max(1, Math.ceil(counts[estado] / REVIEWS_PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const docs = await col
    .find({ estado })
    .sort({ actualizado: -1 })
    .skip((page - 1) * REVIEWS_PAGE_SIZE)
    .limit(REVIEWS_PAGE_SIZE)
    .toArray();

  const [users, photos] = await Promise.all([
    getPublicUsers(docs.flatMap((d) => (d.userId ? [d.userId] : []))),
    getPhotos(docs.flatMap((d) => d.fotoIds)),
  ]);
  const photoById = new Map(photos.map((p) => [p.id, p]));
  const suggestions = await suggestAssemblyDetails(
    docs.flatMap((d) => (d.userId && !d.componentes?.length ? [d.userId] : [])),
  );

  const reviews = docs.map((r) => ({
    id: r._id!.toString(),
    version: r.actualizado.toISOString(),
    estado: r.estado,
    estrellas: r.estrellas,
    comentario: r.comentario,
    motivo: r.motivo ?? null,
    autorNombre:
      (r.userId && users.get(r.userId)?.name) ||
      r.autor?.nombre ||
      "Cuenta eliminada",
    autorCorreo: (r.userId && users.get(r.userId)?.email) || "",
    cuentaEliminada: !r.userId,
    fotos: r.fotoIds.flatMap((id) => photoById.get(id) ?? []),
    actualizado: r.actualizado,
    componentes: r.componentes ?? [],
    sugeridos: (r.userId && suggestions.get(r.userId)) || [],
  }));
  return { reviews, page, totalPages, counts };
}

/** Renglones de la cuenta de cobro que no describen un componente (se quitan de la sugerencia). */
const NOT_A_COMPONENT = /ensambl|recargo|env[ií]o|flete|mano de obra/i;

/**
 * Para cada cuenta, los componentes de su cuenta de cobro pagada más reciente ("Procesador: Ryzen 5
 * 7600"…), sin precios ni servicios: es solo el punto de partida que el admin revisa al moderar.
 */
async function suggestAssemblyDetails(userIds: string[]): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();
  if (userIds.length === 0) return result;
  const cuentas = await (await cuentasCol())
    .find({ userId: { $in: userIds }, estado: "pagada" })
    .sort({ creado: -1 })
    .toArray();
  for (const c of cuentas) {
    if (!c.userId || result.has(c.userId)) continue;
    const lines = c.items
      .filter((i) => !i.recargo && !NOT_A_COMPONENT.test(i.descripcion))
      .map((i) => i.descripcion.trim())
      .filter(Boolean);
    result.set(c.userId, lines);
  }
  return result;
}

/** Guarda los detalles del ensamble de una reseña (sin cambiar su estado ni su versión). */
export async function setReviewDetails(id: string, componentes: string[]): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const { matchedCount } = await (await reviewsCol()).updateOne(
    { _id: new ObjectId(id) },
    { $set: { componentes } },
  );
  return matchedCount > 0;
}

/** Aprueba y fija cómo se verá el autor en la home (nombre corto + avatar) y los detalles del ensamble. */
export async function approveReview(
  id: string,
  version: string,
  componentes: string[],
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await reviewsCol();
  const review = await col.findOne({ _id: new ObjectId(id) });
  if (!review) return false;
  if (!review.userId) return false; // conservada sin cuenta: ya estaba aprobada
  const user = await getPublicUser(review.userId);
  if (!user) return false;

  // Solo si la reseña no cambió desde que el admin la leyó (`version` = su
  // `actualizado`): si la autora la editó en medio, no se aprueba texto no revisado.
  const { matchedCount } = await col.updateOne(
    { _id: review._id, actualizado: new Date(version) },
    {
      $set: {
        estado: "aprobada",
        motivo: null,
        componentes,
        moderadaEn: new Date(),
        autor: {
          nombre: shortName(user.name),
          avatarStyle: user.avatarStyle ?? "lorelei-neutral",
          avatarSeed: user.avatarSeed ?? user._id.toString(),
        },
      },
    },
  );
  return matchedCount > 0;
}

export async function rejectReview(id: string, motivo: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const { matchedCount } = await (await reviewsCol()).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        estado: "rechazada",
        motivo: motivo.trim().slice(0, 200) || null,
        autor: null,
        moderadaEn: new Date(),
      },
    },
  );
  return matchedCount > 0;
}

/** Elimina la reseña y sus fotos (admin). */
export async function deleteReview(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const col = await reviewsCol();
  await deleteReviewPhotos(id);
  const { deletedCount } = await col.deleteOne({ _id: new ObjectId(id) });
  return deletedCount > 0;
}

/** Borra la reseña de una cuenta (al eliminar la cuenta; las fotos ya se borran aparte). */
export async function deleteUserReview(userId: string): Promise<void> {
  await (await reviewsCol()).deleteMany({ userId });
}

export async function hasApprovedReview(userId: string): Promise<boolean> {
  return (
    (await (await reviewsCol()).countDocuments(
      { userId, estado: "aprobada" },
      { limit: 1 },
    )) > 0
  );
}

/** Guarda la elección de la autora sobre su reseña aprobada al eliminar la cuenta. */
export async function setKeepReviewOnDelete(
  userId: string,
  keep: boolean,
): Promise<void> {
  await (await reviewsCol()).updateOne(
    { userId, estado: "aprobada" },
    { $set: { conservarAlEliminar: keep } },
  );
}

/**
 * Al eliminar la cuenta: si la autora eligió conservar su reseña APROBADA, se
 * desvincula de la cuenta (queda con su nombre corto, avatar, comentario y fotos,
 * sin correo ni teléfono ni userId). Devuelve true si se conservó; si no, el
 * llamador debe borrarla.
 */
export async function detachKeptReview(userId: string): Promise<boolean> {
  const col = await reviewsCol();
  const review = await col.findOne({ userId });
  if (!review || review.estado !== "aprobada" || review.conservarAlEliminar !== true) {
    return false;
  }
  await (await collections.uploads()).updateMany(
    { reviewId: review._id!.toString() },
    { $set: { userId: null } },
  );
  await col.updateOne(
    { _id: review._id },
    { $unset: { userId: "", conservarAlEliminar: "" }, $set: { cuentaEliminada: true } },
  );
  return true;
}
