/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { rateLimitStorage } from "@/lib/user-auth/rate-limit";

/**
 * Correos de cotización por día. El plan gratis de Resend permite 100 al día:
 * 55 son para códigos de registro (`MAX_OTP_MAILS_PER_DAY`) y 35 para avisos,
 * dejando 10 de margen. Súbelos al pasar a un plan de pago.
 */
const MAX_NOTICE_MAILS_PER_DAY = 35;

/** ¿Queda cupo para otro aviso? Consume uno si lo hay. */
export async function consumeNoticeMail(): Promise<boolean> {
  const { allowed } = await rateLimitStorage.consume("mail:avisos", {
    window: 86400,
    max: MAX_NOTICE_MAILS_PER_DAY,
  });
  return allowed;
}
