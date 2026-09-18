"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import type { FormEvent } from "react";
import { INPUT } from "@/components/account/shared";

// Solo dígitos, máximo 6. Si el navegador autocompleta con un correo (le pasa al
// gestor de contraseñas en el paso que sigue al registro), el campo se vacía.
function sanitize(e: FormEvent<HTMLInputElement>) {
  const el = e.currentTarget;
  if (el.value.includes("@")) {
    el.value = "";
    return;
  }
  const digits = el.value.replace(/\D/g, "").slice(0, 6);
  if (digits !== el.value) el.value = digits;
}

/** Campo del código de 6 dígitos que llega por correo. */
export function OtpInput({ id, name = "otp" }: { id: string; name?: string }) {
  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="\d{6}"
      maxLength={6}
      placeholder="123456"
      defaultValue=""
      required
      autoFocus
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      data-1p-ignore
      data-lpignore="true"
      onInput={sanitize}
      className={`${INPUT} font-mono tracking-[0.4em] placeholder:text-component/40`}
    />
  );
}
