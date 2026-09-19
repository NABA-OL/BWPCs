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
import { ESTADOS_VISIBLES } from "@/lib/cuenta-cobro-estado";

/** Cuentas de cobro de esta cuenta que ya le fueron enviadas (nunca los borradores). */
export async function getMyCuentasCobro(userId: string) {
  const col = await collections.cuentasCobro();
  return col
    .find({ userId, estado: { $in: [...ESTADOS_VISIBLES] } })
    .sort({ creado: -1 })
    .limit(100)
    .toArray();
}

/** Una cuenta de cobro, solo si es de esta cuenta y ya fue enviada. */
export async function getMyCuentaCobro(userId: string, id: string) {
  if (!ObjectId.isValid(id)) return null;
  const col = await collections.cuentasCobro();
  return col.findOne({
    _id: new ObjectId(id),
    userId,
    estado: { $in: [...ESTADOS_VISIBLES] },
  });
}
