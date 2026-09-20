/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
// OJO: este módulo NO debe importar `@/lib/images/process` (sharp): así `GET /api/comprobantes/[id]` no
// empaqueta libvips (~18 MB). El aviso de pago con la imagen (con sharp) vive en `comprobantes-report.ts`.
import { cuentasCol } from "@/lib/cuentas-cobro";

export const KEY_PREFIX = "comprobantes";
export const PROOF_ID = /^[0-9a-f-]{36}$/;

let indexReady: Promise<unknown> | null = null;

/** Una misma imagen no puede respaldar dos pagos (índice único sobre el hash). */
export async function proofsCol() {
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

/** Busca la cuenta que tiene este comprobante (para autorizar quién puede verlo). */
export async function findProofOwner(proofId: string) {
  if (!PROOF_ID.test(proofId)) return null;
  const cuenta = await (await proofsCol()).findOne({ "comprobantes.id": proofId });
  const proof = cuenta?.comprobantes?.find((c) => c.id === proofId);
  return cuenta && proof ? { userId: cuenta.userId ?? null, proof } : null;
}

