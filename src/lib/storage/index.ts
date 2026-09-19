/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { createDevPrivateStorage, createDevStorage } from "./dev";
import { createR2PrivateStorage, createR2Storage } from "./r2";
import { StorageNotConfiguredError, type ObjectStorage, type PrivateStorage } from "./types";

export { StorageNotConfiguredError, type ObjectStorage, type PrivateStorage } from "./types";

let cached: ObjectStorage | null = null;

/**
 * Almacenamiento activo: R2 si están las variables R2_*; en desarrollo sin
 * ellas, una carpeta local; en producción sin ellas, falla (no hay respaldo).
 */
export function getStorage(): ObjectStorage {
  if (cached) return cached;

  const {
    R2_ACCOUNT_ID: accountId,
    R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey,
    R2_BUCKET: bucket,
    R2_PUBLIC_URL: publicUrl,
  } = process.env;

  // La URL de la API S3 solo sirve para subir (con firma); leer con ella da 400.
  // R2_PUBLIC_URL debe ser la URL PÚBLICA del bucket (dominio propio o r2.dev).
  if (publicUrl?.includes("r2.cloudflarestorage.com")) {
    throw new Error(
      "R2_PUBLIC_URL apunta a la API S3 (r2.cloudflarestorage.com). Usa la URL pública del bucket: su dominio propio (ej. https://img.bw-pcs.com) o la URL pública de desarrollo (https://pub-xxxx.r2.dev).",
    );
  }

  if (accountId && accessKeyId && secretAccessKey && bucket && publicUrl) {
    cached = createR2Storage({
      accountId,
      accessKeyId,
      secretAccessKey,
      bucket,
      publicUrl: publicUrl.replace(/\/+$/, ""),
    });
  } else if (process.env.NODE_ENV !== "production") {
    cached = createDevStorage();
  } else {
    throw new StorageNotConfiguredError();
  }
  return cached;
}

let cachedPrivate: PrivateStorage | null = null;

/**
 * Almacenamiento PRIVADO para los comprobantes: otro bucket de R2 (`R2_PRIVATE_BUCKET`,
 * con el acceso público DESACTIVADO) y las mismas credenciales. En desarrollo sin él,
 * una carpeta local fuera de `public/`; en producción sin él, falla: un comprobante
 * jamás debe caer en el bucket público.
 */
export function getPrivateStorage(): PrivateStorage {
  if (cachedPrivate) return cachedPrivate;

  const {
    R2_ACCOUNT_ID: accountId,
    R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey,
    R2_PRIVATE_BUCKET: bucket,
  } = process.env;

  if (accountId && accessKeyId && secretAccessKey && bucket) {
    if (bucket === process.env.R2_BUCKET) {
      throw new Error("R2_PRIVATE_BUCKET debe ser un bucket distinto del público (R2_BUCKET).");
    }
    cachedPrivate = createR2PrivateStorage({ accountId, accessKeyId, secretAccessKey, bucket });
  } else if (process.env.NODE_ENV !== "production") {
    cachedPrivate = createDevPrivateStorage();
  } else {
    throw new StorageNotConfiguredError();
  }
  return cachedPrivate;
}
