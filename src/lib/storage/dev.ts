/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ObjectStorage } from "./types";

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
