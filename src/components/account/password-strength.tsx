"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { passwordLevel, type PasswordLevel } from "@/lib/password-strength";

const LEVELS: Record<Exclude<PasswordLevel, 0>, { label: string; bar: string; text: string; hint: string | null }> = {
  1: {
    label: "Débil",
    bar: "bg-red-600",
    text: "text-red-700",
    hint: "Usa al menos 8 caracteres mezclando letras y números.",
  },
  2: {
    label: "Media",
    bar: "bg-amber-500",
    text: "text-amber-700",
    hint: "Mejórala con 12 o más caracteres, mayúsculas y símbolos.",
  },
  3: { label: "Fuerte", bar: "bg-green-600", text: "text-green-700", hint: null },
};

/** Indicador rojo / amarillo / verde de la fortaleza de la contraseña. */
export function PasswordStrength({ password }: { password: string }) {
  const level = passwordLevel(password);
  if (level === 0) return null;
  const info = LEVELS[level];

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-1.5 flex-1 ${n <= level ? info.bar : "bg-hairline"}`}
          />
        ))}
      </div>
      <p className={`mt-1 text-xs ${info.text}`}>
        <span className="font-medium">Contraseña {info.label.toLowerCase()}.</span>
        {info.hint ? ` ${info.hint}` : ""}
      </p>
    </div>
  );
}
