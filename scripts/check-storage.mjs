/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Comprueba las credenciales de R2: sube un archivo de prueba, lo lee por la URL
// pública y lo borra. Uso: pnpm check:storage
import { createR2Storage } from "../src/lib/storage/r2.ts";

const {
  R2_ACCOUNT_ID: accountId,
  R2_ACCESS_KEY_ID: accessKeyId,
  R2_SECRET_ACCESS_KEY: secretAccessKey,
  R2_BUCKET: bucket,
  R2_PUBLIC_URL: publicUrl,
} = process.env;

const missing = Object.entries({
  R2_ACCOUNT_ID: accountId,
  R2_ACCESS_KEY_ID: accessKeyId,
  R2_SECRET_ACCESS_KEY: secretAccessKey,
  R2_BUCKET: bucket,
  R2_PUBLIC_URL: publicUrl,
})
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length) {
  console.error(`Faltan variables en .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

if (publicUrl.includes("r2.cloudflarestorage.com")) {
  console.error(
    "R2_PUBLIC_URL apunta a la API S3 (r2.cloudflarestorage.com): solo sirve para subir. Usa la URL PÚBLICA del bucket, su dominio propio (https://img.bw-pcs.com) o la URL pública de desarrollo (https://pub-xxxx.r2.dev).",
  );
  process.exit(1);
}

const storage = createR2Storage({
  accountId,
  accessKeyId,
  secretAccessKey,
  bucket,
  publicUrl: publicUrl.replace(/\/+$/, ""),
});

const key = `_check/ping-${Date.now()}.txt`;
try {
  await storage.put(key, Buffer.from("ok"), "text/plain");
  console.log("1/3 subida con el token: OK");

  const res = await fetch(storage.url(key));
  const body = res.ok ? await res.text() : "";
  console.log(
    body === "ok"
      ? "2/3 lectura por la URL pública: OK"
      : `2/3 lectura por la URL pública: FALLÓ (HTTP ${res.status}). ¿Está conectado el dominio público del bucket?`,
  );

  await storage.remove([key]);
  console.log("3/3 borrado: OK");
} catch (error) {
  console.error("Falló:", error instanceof Error ? error.message : error);
  process.exit(1);
}
