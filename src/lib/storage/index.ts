/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { createDevStorage } from "./dev";
import { createR2Storage } from "./r2";
import { StorageNotConfiguredError, type ObjectStorage } from "./types";

export { StorageNotConfiguredError, type ObjectStorage } from "./types";

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
