/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ObjectStorage, PrivateStorage } from "./types";

const ROOT = join(process.cwd(), "public", "_dev-uploads");

/** Solo desarrollo, sin R2: guarda en public/_dev-uploads (ignorado por git). */
export function createDevStorage(): ObjectStorage {
  return {
    async put(key, body) {
      const path = join(ROOT, key);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, body);
    },
    async remove(keys) {
      await Promise.all(keys.map((k) => rm(join(ROOT, k), { force: true })));
    },
    url: (key) => `/_dev-uploads/${key}`,
  };
}

// Fuera de `public/`: nada de esto se sirve como archivo estático.
const PRIVATE_ROOT = join(process.cwd(), ".dev-private-uploads");

/** Solo desarrollo, sin bucket privado: guarda en .dev-private-uploads (ignorado por git). */
export function createDevPrivateStorage(): PrivateStorage {
  return {
    async put(key, body) {
      const path = join(PRIVATE_ROOT, key);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, body);
    },
    async get(key) {
      try {
        return { body: await readFile(join(PRIVATE_ROOT, key)), contentType: "image/webp" };
      } catch {
        return null;
      }
    },
    async remove(keys) {
      await Promise.all(keys.map((k) => rm(join(PRIVATE_ROOT, k), { force: true })));
    },
  };
}
