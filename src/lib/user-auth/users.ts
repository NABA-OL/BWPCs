/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db/mongodb";

/** Datos básicos de una cuenta de usuario público (colección `users`, de Better Auth). */
export interface PublicUser {
  _id: ObjectId;
  name: string;
  email: string;
  phone?: string;
  acceptTerms?: boolean;
  consentAt?: Date;
  updatedAt?: Date;
  avatarStyle?: string;
  avatarSeed?: string;
  emailVerified?: boolean;
  createdAt?: Date;
}

async function users() {
  return (await getDb()).collection<PublicUser>("users");
}

export async function getPublicUser(id: string): Promise<PublicUser | null> {
  if (!ObjectId.isValid(id)) return null;
  return (await users()).findOne({ _id: new ObjectId(id) });
}

/** Cuentas para el selector del admin (las más recientes primero). */
export async function listPublicUsers(limit = 500) {
  const docs = await (await users())
    .find({}, { projection: { name: 1, email: 1 } })
    .sort({ _id: -1 })
    .limit(limit)
    .toArray();
  return docs.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
  }));
}

/** Cuentas por id (para el admin); las que ya no existen se omiten. */
export async function getPublicUsers(ids: string[]) {
  const valid = ids.filter((i) => ObjectId.isValid(i));
  if (valid.length === 0) return new Map<string, PublicUser>();
  const docs = await (await users())
    .find({ _id: { $in: valid.map((i) => new ObjectId(i)) } })
    .toArray();
  return new Map(docs.map((u) => [u._id.toString(), u]));
}

const UNVERIFIED_TTL_MS = 24 * 60 * 60 * 1000;
const escapeRegex = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Borra cuentas SIN verificar (y sus cuentas de acceso, sesiones y códigos): la
 * del correo dado, si existe, y cualquiera con más de 24 h. Así un registro sin
 * verificar no bloquea ni "pre-secuestra" el correo de otra persona, y no se
 * acumula basura.
 */
export async function purgeUnverifiedUsers(email: string): Promise<void> {
  const col = await users();
  const normalized = email.trim().toLowerCase();
  const stale = await col
    .find({
      $or: [
        {
          emailVerified: false,
          $or: [
            { email: normalized },
            { createdAt: { $lt: new Date(Date.now() - UNVERIFIED_TTL_MS) } },
          ],
        },
        // Cuentas de Google que nunca completaron su perfil (sin celular ni aceptar los términos).
        {
          emailVerified: true,
          acceptTerms: { $ne: true },
          consentAt: { $exists: false },
          createdAt: { $lt: new Date(Date.now() - UNVERIFIED_TTL_MS) },
        },
      ],
    })
    .toArray();
  await deleteUsersCascade(stale);
}

/** Celular y aceptación de términos de una cuenta de Google (paso "completar perfil"). */
export async function completeUserProfile(id: string, phone: string, consentVersion: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const now = new Date();
  const { matchedCount } = await (await users()).updateOne(
    { _id: new ObjectId(id) },
    { $set: { phone, acceptTerms: true, consentAt: now, consentVersion, updatedAt: now } },
  );
  return matchedCount > 0;
}

/** Borra una cuenta que no completó su perfil (la persona canceló) con todo lo que la rodea. */
export async function discardIncompleteUser(id: string): Promise<void> {
  if (!ObjectId.isValid(id)) return;
  const user = await (await users()).findOne({
    _id: new ObjectId(id),
    acceptTerms: { $ne: true },
    consentAt: { $exists: false },
  });
  if (user) await deleteUsersCascade([user]);
}

/** Cuentas, sesiones, códigos y el usuario mismo. */
async function deleteUsersCascade(list: PublicUser[]): Promise<void> {
  if (list.length === 0) return;
  const db = await getDb();
  const ids = list.flatMap((u) => [u._id, u._id.toString()]);
  const emails = list.map((u) => new RegExp(escapeRegex(u.email), "i"));
  await Promise.all([
    db.collection("user_accounts").deleteMany({ userId: { $in: ids } }),
    db.collection("user_sessions").deleteMany({ userId: { $in: ids } }),
    db.collection("user_verifications").deleteMany({ identifier: { $in: emails } }),
  ]);
  await (await users()).deleteMany({ _id: { $in: list.map((u) => u._id) } });
}

/**
 * ¿Tiene Google vinculado? Con el correo de esa cuenta de Google (puede ser distinto del principal),
 * leído del `id_token` que Google entregó al vincular; sin él, solo se sabe que está vinculado.
 */
export async function getGoogleLink(userId: string): Promise<{ id: string; email: string | null } | null> {
  const db = await getDb();
  const ids = ObjectId.isValid(userId) ? [userId, new ObjectId(userId)] : [userId];
  const account = await db
    .collection("user_accounts")
    .findOne({ userId: { $in: ids }, providerId: "google" }, { projection: { idToken: 1 } });
  if (!account) return null;
  let email: string | null = null;
  try {
    const payload = JSON.parse(Buffer.from(String(account.idToken).split(".")[1], "base64url").toString("utf8"));
    if (typeof payload.email === "string") email = payload.email;
  } catch {
    // sin id_token legible: solo se muestra que está vinculado
  }
  return { id: account._id.toString(), email };
}

/** ¿Tiene contraseña propia? (las cuentas creadas solo con Google no la tienen). */
export async function hasPasswordAccount(userId: string): Promise<boolean> {
  const db = await getDb();
  const ids = ObjectId.isValid(userId) ? [userId, new ObjectId(userId)] : [userId];
  return (await db.collection("user_accounts").countDocuments({ userId: { $in: ids }, providerId: "credential" }, { limit: 1 })) > 0;
}

export async function isEmailVerified(email: string): Promise<boolean> {
  const user = await (await users()).findOne(
    { email: email.trim().toLowerCase() },
    { projection: { emailVerified: 1 } },
  );
  return user?.emailVerified === true;
}

let indexesReady: Promise<unknown> | null = null;

/**
 * Índices de las colecciones de Better Auth (su adaptador de Mongo no crea
 * ninguno): correo único —sin él dos registros simultáneos duplican la cuenta—,
 * consultas por usuario y borrado automático de códigos vencidos. Se crean una
 * vez por proceso; si falla (p. ej. ya hay correos duplicados) se registra.
 */
export function ensureAuthIndexes(): Promise<unknown> {
  indexesReady ??= (async () => {
    const db = await getDb();
    await Promise.all([
      db.collection("users").createIndex({ email: 1 }, { unique: true }),
      db.collection("user_sessions").createIndex({ token: 1 }, { unique: true }),
      db.collection("user_sessions").createIndex({ userId: 1 }),
      db.collection("user_accounts").createIndex({ userId: 1 }),
      db.collection("user_verifications").createIndex({ identifier: 1 }),
      db
        .collection("user_verifications")
        .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      db.collection("uploads").createIndex({ userId: 1 }),
      db.collection("uploads").createIndex({ reviewId: 1 }),
      db.collection("uploads").createIndex({ estado: 1, creado: 1 }),
    ]);
  })().catch((error: unknown) => {
    indexesReady = null; // reintentar en la próxima petición
    console.error("[user-auth] no se pudieron crear los índices", error);
  });
  return indexesReady;
}
