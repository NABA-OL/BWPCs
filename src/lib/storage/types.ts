/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

/** Almacenamiento de objetos (fotos). Hoy Cloudflare R2; ver `index.ts`. */
export interface ObjectStorage {
  /** Guarda un objeto público e inmutable (las claves llevan un id aleatorio). */
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  /** Borra objetos; los que no existan se ignoran. */
  remove(keys: string[]): Promise<void>;
  /** URL pública de un objeto. */
  url(key: string): string;
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super("El almacenamiento de imágenes no está configurado (variables R2_*).");
  }
}
