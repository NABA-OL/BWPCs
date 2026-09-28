/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-20
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { MongoServerError, ObjectId } from "mongodb";
import { boldAvailable } from "@/lib/bold-payments";
import { KEY_PREFIX, ProofRejectedError, proofsCol } from "@/lib/comprobantes";
import { VENCIDA_ERROR, estaVencida } from "@/lib/cuenta-cobro-vigencia";
import { moveCuentaCobro } from "@/lib/cuentas-cobro";
import type { Comprobante, CuentaCobro } from "@/lib/db/types";
import { processProofImage } from "@/lib/images/process";
import { DEFAULT_PAYMENT_METHOD, cardIsManual } from "@/lib/payment-methods";
import { getPrivateStorage } from "@/lib/storage";

// Separado de `comprobantes.ts` a propósito: este archivo importa sharp (vía `images/process`) y solo lo
// necesita la ruta que recibe el comprobante. Ver el aviso en `comprobantes.ts`.

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
  // Con el precio vencido no se avisa el pago: primero se revisan los precios (ver `cuenta-cobro-vigencia.ts`).
  if (estaVencida(current)) throw new ProofRejectedError(`${VENCIDA_ERROR} Si ya pagaste, escríbenos por WhatsApp.`);
  // Con tarjeta cobrada por Bold (enlace automático) el pago se confirma solo; en efectivo lo confirmamos
  // nosotros. Con Bre-B, transferencia o tarjeta por enlace manual del admin se avisa con comprobante.
  const method = current.formaPago ?? DEFAULT_PAYMENT_METHOD;
  const manualCard = method === "tarjeta" && cardIsManual(current.total, boldAvailable());
  if (method !== "bre-b" && method !== "transferencia" && !(manualCard && current.enlacePagoTarjeta)) {
    throw new ProofRejectedError(
      method === "tarjeta"
        ? "El pago con tarjeta se confirma solo o cuando tengas el enlace de pago. Si ya pagaste, escríbenos por WhatsApp."
        : "Con el medio de pago elegido no se avisa con comprobante.",
    );
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
      vigencia: "vigente",
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
