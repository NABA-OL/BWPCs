/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { Resend } from "resend";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

let client: Resend | null = null;

function getClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Falta la variable de entorno RESEND_API_KEY.");
  client ??= new Resend(apiKey);
  return client;
}

/**
 * Envía un correo transaccional. Lanza si Resend rechaza el envío: quien
 * llame decide si espera el resultado o lo deja en segundo plano.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("Falta la variable de entorno EMAIL_FROM.");

  const { error } = await getClient().emails.send({
    from,
    to,
    subject,
    html,
    text,
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
  });
  if (error) throw new Error(`Resend: ${error.name} - ${error.message}`);
}
