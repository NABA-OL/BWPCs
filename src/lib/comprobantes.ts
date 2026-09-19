/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { MongoServerError, ObjectId } from "mongodb";
import { ImageError, processProofImage } from "@/lib/images/process";
import { cuentasCol, moveCuentaCobro } from "@/lib/cuentas-cobro";
import type { Comprobante, CuentaCobro } from "@/lib/db/types";
import { getPrivateStorage } from "@/lib/storage";

const KEY_PREFIX = "comprobantes";
export const PROOF_ID = /^[0-9a-f-]{36}$/;

let indexReady: Promise<unknown> | null = null;

/** Una misma imagen no puede respaldar dos pagos (índice único sobre el hash). */
async function proofsCol() {
  const col = await cuentasCol();
  indexReady ??= col
    .createIndex(
      { "comprobantes.sha256": 1 },
      {
        name: "comprobantes_sha256_unique",
        unique: true,
        partialFilterExpression: { "comprobantes.sha256": { $type: "string" } },
      },
    )
    .catch((error: unknown) => console.error("[comprobantes] índice único del hash", error));
  await indexReady;
  return col;
}

export class ProofRejectedError extends Error {}

/**
 * El cliente reporta su pago con el comprobante: valida y re-codifica la imagen
 * (sin metadatos), la guarda en el bucket PRIVADO y pasa la cuenta de "enviada" a
 * "pago_reportado" con el comprobante adjunto, todo dentro de la misma condición de
 * estado. Nunca marca la cuenta como pagada.
 */
export async function reportPaymentWithProof(
  cuentaId: string,
  userId: string,
  file: Buffer,
): Promise<CuentaCobro> {
  if (!ObjectId.isValid(cuentaId)) throw new ProofRejectedError("No encontramos esa cuenta de cobro.");
  const col = await proofsCol();
  const { data, width, height } = await processProofImage(file);
  const sha256 = createHash("sha256").update(data).digest("hex");

  if (await col.findOne({ "comprobantes.sha256": sha256 }, { projection: { _id: 1 } })) {
    throw new ProofRejectedError(
      "Ese comprobante ya se usó en una cuenta de cobro. Sube el de este pago.",
    );
  }

  const current = await col.findOne({ _id: new ObjectId(cuentaId), userId });
  if (!current) throw new ProofRejectedError("Esta cuenta de cobro ya no admite ese aviso.");
  // Con tarjeta se paga en línea y en efectivo lo confirmamos nosotros: no hay comprobante que subir.
  if (current.formaPago && current.formaPago !== "transferencia" && current.formaPago !== "bre-b") {
    throw new ProofRejectedError("Con el medio de pago elegido no se avisa con comprobante. Cámbialo a Bre-B o transferencia.");
  }

  const id = randomUUID();
  const key = `${KEY_PREFIX}/${current._id!.toString()}/${id}.webp`;
  const storage = getPrivateStorage();
  await storage.put(key, data, "image/webp");

  const proof: Comprobante = { id, key, sha256, bytes: data.byteLength, width, height, subidoEn: new Date() };
  try {
    const updated = await moveCuentaCobro(cuentaId, {
      from: ["enviada"],
      to: "pago_reportado",
      por: "cliente",
      userId,
      set: { comprobantes: [...(current.comprobantes ?? []), proof], pagoReportadoEn: new Date() },
    });
    if (!updated) {
      await storage.remove([key]);
      throw new ProofRejectedError("Esta cuenta de cobro ya no admite ese aviso.");
    }
    return updated;
  } catch (error) {
    if (error instanceof ProofRejectedError) throw error;
    await storage.remove([key]).catch(() => undefined);
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new ProofRejectedError("Ese comprobante ya se usó en una cuenta de cobro. Sube el de este pago.");
    }
    throw error;
  }
}

/** Busca la cuenta que tiene este comprobante (para autorizar quién puede verlo). */
export async function findProofOwner(proofId: string) {
  if (!PROOF_ID.test(proofId)) return null;
  const cuenta = await (await proofsCol()).findOne({ "comprobantes.id": proofId });
  const proof = cuenta?.comprobantes?.find((c) => c.id === proofId);
  return cuenta && proof ? { userId: cuenta.userId ?? null, proof } : null;
}

export { ImageError };
