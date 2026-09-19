/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { after } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { shortName } from "@/lib/reviews/rules";
import { sendTelegramMessage } from "@/lib/telegram";

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Avisos de cuentas al tema "cuentas" de Telegram: solo nombre corto, nunca correo ni teléfono. */
async function announce(title: string, name: string | undefined) {
  const total = await (await getDb()).collection("users").countDocuments({ emailVerified: true });
  await sendTelegramMessage(
    `${title}\n<b>Nombre:</b> ${escapeHtml(shortName(name ?? ""))}\n<b>Cuentas verificadas:</b> ${total}`,
    "cuentas",
  );
}

function inBackground(title: string, name: string | undefined) {
  const run = () => announce(title, name).catch((error: unknown) => console.error("[telegram] aviso de cuenta", error));
  try {
    after(run);
  } catch {
    void run(); // fuera de una petición (p. ej. un script) no hay `after`
  }
}

/** Una persona verificó su correo: cuenta nueva. */
export const notifyNewAccount = (name: string | undefined) => inBackground("👤 <b>Cuenta nueva verificada</b>", name);

/** Una persona eliminó su cuenta. */
export const notifyDeletedAccount = (name: string | undefined) => inBackground("🗑️ <b>Cuenta eliminada</b>", name);
