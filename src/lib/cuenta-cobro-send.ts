/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-25
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { ObjectId } from "mongodb";
import { boldAvailable } from "@/lib/bold-payments";
import { sendMissing } from "@/lib/cuenta-cobro-estado";
import { vencimientoDesde } from "@/lib/cuenta-cobro-vigencia";
import { moveCuentaCobro } from "@/lib/cuentas-cobro";
import { collections } from "@/lib/db/collections";
import type { CuentaCobro } from "@/lib/db/types";
import { consumeNoticeMail } from "@/lib/email/budget";
import { sendCuentaCobroEmail } from "@/lib/email/cuenta-cobro-ready";
import { cardIsManual } from "@/lib/payment-methods";
import { closePurchaseRequest } from "@/lib/quote-requests";
import { getPublicUser } from "@/lib/user-auth/users";

export interface SentCuenta {
  cuenta: CuentaCobro;
  /** Era una corrección que el cliente había pedido. */
  corrected: boolean;
}

/**
 * Envía la cuenta al cliente (o la reenvía corregida): la pasa a "enviada" y, si nació de una solicitud de
 * compra, cierra esa solicitud y le pone su hora de vencimiento (72 h desde este envío; cada reenvío la renueva).
 * Devuelve null si faltan datos o la cuenta no estaba en borrador/corrección. `por` es quien la emite: el admin
 * a mano o el "sistema" al pedir el cliente la compra. No manda el correo: usa `notifyCuentaSent`.
 */
export async function sendCuentaCobro(id: string, por: "admin" | "sistema"): Promise<SentCuenta | null> {
  if (!ObjectId.isValid(id)) return null;
  const current = await (await collections.cuentasCobro()).findOne({ _id: new ObjectId(id) });
  // Para emitirla hace falta destinatario, identificación (C.C. o NIT), datos de pago y firmante.
  if (!current || sendMissing(current, cardIsManual(current.total, boldAvailable())).length > 0) return null;

  const corrected = current.estado === "correccion_solicitada";
  const updated = await moveCuentaCobro(id, {
    from: ["borrador", "correccion_solicitada"],
    to: "enviada",
    por,
    nota: corrected ? "Corregida y reenviada" : por === "sistema" ? "Emitida automáticamente al pedir la compra" : null,
    set: current.origen ? { venceEn: vencimientoDesde(new Date()) } : {},
  });
  if (!updated) return null;
  // Si venía de una solicitud de compra, esa solicitud ya está atendida.
  if (current.origen) await closePurchaseRequest(current.origen.requestId);
  return { cuenta: updated, corrected };
}

/** Le avisa por correo al cliente que su cuenta de cobro está lista (respeta el cupo diario de avisos). */
export async function notifyCuentaSent({ cuenta, corrected }: SentCuenta): Promise<void> {
  if (!cuenta.userId || !cuenta._id) return;
  const user = await getPublicUser(cuenta.userId);
  if (!user || !(await consumeNoticeMail())) return;
  try {
    await sendCuentaCobroEmail({
      to: user.email,
      name: user.name,
      numero: cuenta.numero,
      totalCop: cuenta.total,
      cuentaId: cuenta._id.toString(),
      corrected,
      venceEn: cuenta.venceEn ?? null,
    });
  } catch (error) {
    console.error("[cuentas-cobro] fallo al enviar el aviso", error);
  }
}
