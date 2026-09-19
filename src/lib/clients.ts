/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { collections } from "@/lib/db/collections";

let indexReady: Promise<unknown> | null = null;

/** Una cuenta de usuario, un solo cliente (índice único parcial; se crea una vez). */
export async function clientsCol() {
  const col = await collections.clients();
  indexReady ??= col.createIndex(
    { userId: 1 },
    {
      name: "userId_unique",
      unique: true,
      partialFilterExpression: { userId: { $type: "string" } },
    },
  ).catch((error: unknown) => console.error("[clients] índice único de userId", error));
  await indexReady;
  return col;
}

interface AccountData {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

/**
 * Crea (una sola vez, de forma atómica) el cliente fiscal de una cuenta al hacer
 * su primera solicitud de compra. Cédula y dirección son opcionales: si llegan y
 * el cliente aún no las tiene, se completan; nunca se pisan datos ya guardados.
 */
export async function ensureClientForUser(
  user: AccountData,
  extra: { identificacion?: string; direccion?: string } = {},
): Promise<void> {
  const col = await clientsCol();
  await col.updateOne(
    { userId: user.id },
    {
      $setOnInsert: {
        nombre: user.name,
        telefono: user.phone ?? "",
        email: user.email,
        origen: "compra",
        creado: new Date(),
        userId: user.id,
        identificacion: "",
        direccion: "",
      },
    },
    { upsert: true },
  );
  // Aparte del upsert (no puede tocar el mismo campo en $setOnInsert y $set).
  for (const field of ["identificacion", "direccion"] as const) {
    const value = extra[field]?.trim();
    if (value) await col.updateOne({ userId: user.id, [field]: "" }, { $set: { [field]: value } });
  }
}
