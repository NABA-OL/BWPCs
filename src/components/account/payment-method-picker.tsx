"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setPaymentMethodAction } from "@/app/(public)/cuenta/(area)/cuentas-cobro/[id]/actions";
import type { PaymentMethod } from "@/lib/db/types";
import { formatCOP } from "@/lib/format";

export interface MethodChoice {
  id: PaymentMethod;
  label: string;
  /** Total de la cuenta si se paga con este medio. */
  total: number;
  /** Si no se puede elegir, por qué. */
  disabledReason: string | null;
}

/** Elegir con qué medio se paga: el total de la cuenta sigue al medio (la tarjeta lleva recargo). */
export function PaymentMethodPicker({
  id,
  current,
  choices,
}: {
  id: string;
  current: PaymentMethod;
  choices: MethodChoice[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PaymentMethod | null>(null);

  async function choose(method: PaymentMethod) {
    if (method === current || pending) return;
    setError(null);
    setPending(method);
    try {
      const result = await setPaymentMethodAction({ id, method });
      if (!result.ok) return setError(result.error);
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <fieldset className="border border-hairline p-5">
      <legend className="px-1 font-semibold">¿Cómo vas a pagar?</legend>
      <div className="space-y-2">
        {choices.map((c) => (
          <label
            key={c.id}
            className={`flex items-center gap-3 text-sm ${c.disabledReason ? "opacity-50" : "cursor-pointer"}`}
          >
            <input
              type="radio"
              name="payment-method"
              checked={(pending ?? current) === c.id}
              disabled={c.disabledReason !== null || pending !== null}
              onChange={() => void choose(c.id)}
              className="h-4 w-4 accent-accent"
            />
            <span className="flex-1">
              {c.label}
              {c.disabledReason && <span className="block text-xs text-component">{c.disabledReason}</span>}
            </span>
            <span className="font-mono">{formatCOP(c.total)}</span>
          </label>
        ))}
      </div>
      <p className="mt-3 text-xs text-component">
        El valor de la cuenta cambia según el medio: la tarjeta lleva un recargo; con Bre-B o transferencia pagas el valor
        original.
      </p>
      {error && (
        <p role="alert" className="mt-3 border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
          {error}
        </p>
      )}
    </fieldset>
  );
}
