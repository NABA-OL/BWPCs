"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-27
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useEffect, useRef, type ChangeEvent } from "react";

const onlyDigits = (v: string) => v.replace(/\D/g, "");
const grouped = (digits: string) => (digits ? Number(digits).toLocaleString("es-CO") : "");

/**
 * Campo de un valor en pesos: se ve con puntos de miles mientras se escribe
 * ("1.249.900"), pero solo guarda el número plano. Sin decimales ni signo.
 */
export function MoneyInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  // El cursor se recalcula tras formatear; se aplica en el siguiente render.
  const nextCaret = useRef<number | null>(null);

  useEffect(() => {
    if (nextCaret.current !== null) {
      ref.current?.setSelectionRange(nextCaret.current, nextCaret.current);
      nextCaret.current = null;
    }
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const cursorBefore = e.target.selectionStart ?? raw.length;
    const digitsBeforeCursor = onlyDigits(raw.slice(0, cursorBefore)).length;

    const digits = onlyDigits(raw);
    const formatted = grouped(digits);

    // Ubica el cursor tras esa misma cantidad de dígitos en el texto ya formateado.
    let seen = 0;
    let pos = formatted.length;
    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) seen++;
      if (seen === digitsBeforeCursor) {
        pos = i + 1;
        break;
      }
    }
    nextCaret.current = digitsBeforeCursor === 0 ? 0 : pos;

    onChange(digits ? Number(digits) : 0);
  }

  return (
    <input
      ref={ref}
      value={grouped(String(value || ""))}
      onChange={handleChange}
      inputMode="numeric"
      placeholder={placeholder}
      className={className}
    />
  );
}
