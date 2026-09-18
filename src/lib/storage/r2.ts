/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { AwsClient } from "aws4fetch";
import type { ObjectStorage } from "./types";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** Base pública del bucket (dominio propio), sin "/" final. */
  publicUrl: string;
}

// 1 día: al borrar una foto, el CDN y los navegadores la dejan de servir en
// menos de 24 h (con caché de un año un borrado —Ley 1581— no se notaría).
const CACHE_CONTROL = "public, max-age=86400, s-maxage=86400";

/** Cloudflare R2 por su API compatible con S3 (firmada con aws4fetch). */
export function createR2Storage(config: R2Config): ObjectStorage {
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    service: "s3",
    region: "auto",
  });
  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}`;
  const objectUrl = (key: string) =>
    `${endpoint}/${key.split("/").map(encodeURIComponent).join("/")}`;

  return {
    async put(key, body, contentType) {
      const url = objectUrl(key);
      const payload = new Uint8Array(body);
      const headers = {
        "Content-Type": contentType,
        "Cache-Control": CACHE_CONTROL,
        "Content-Length": String(body.byteLength),
      };
      let res: Response;
      try {
        // Se firma aquí y se envía con `fetch(url, { body })`. Con `client.fetch()`
        // el cuerpo pasa por un objeto Request y llega como flujo SIN Content-Length:
        // R2 responde 411 en cuanto la foto supera unos KB.
        const signed = await client.sign(url, { method: "PUT", headers, body: payload });
        res = await fetch(url, {
          method: "PUT",
          headers: signed.headers,
          body: payload,
          cache: "no-store",
        });
      } catch (error) {
        // Un R2_ACCOUNT_ID que no existe da "handshake failure" de TLS: el host
        // <id>.r2.cloudflarestorage.com no tiene certificado.
        throw new Error(
          `R2: no se pudo conectar a ${config.accountId}.r2.cloudflarestorage.com (¿R2_ACCOUNT_ID correcto? es el de 32 caracteres de la URL S3 del bucket): ${String(error)}`,
        );
      }
      if (!res.ok) throw new Error(`R2 PUT ${key}: HTTP ${res.status}`);
    },

    async remove(keys) {
      await Promise.all(
        keys.map(async (key) => {
          const res = await client.fetch(objectUrl(key), { method: "DELETE" });
          if (!res.ok && res.status !== 404) {
            throw new Error(`R2 DELETE ${key}: HTTP ${res.status}`);
          }
        }),
      );
    },

    url: (key) => `${config.publicUrl}/${key}`,
  };
}
