"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { INPUT, LABEL } from "@/components/account/shared";
import { requestPurchaseAction } from "@/app/(public)/cuenta/(area)/cotizaciones/[id]/actions";
import type { PaymentMethod, QuoteOption } from "@/lib/db/types";
import { formatCOP } from "@/lib/format";
import { CARD_MAX_COP, DEFAULT_PAYMENT_METHOD, OFFERED_PAYMENT_METHODS, totalFor } from "@/lib/payment-methods";
import { CARD_AND_PSE_TEXT } from "@/lib/site-config";

interface PurchaseOption {
  titulo: string;
  totales: QuoteOption["totales"];
}

/** "Quiero esta opción": opción + forma de pago (con su total) + datos de facturación opcionales. */
export function PurchaseForm({
  quoteId,
  options,
  idKnown,
}: {
  quoteId: string;
  options: PurchaseOption[];
  /** Ya tenemos su cédula o NIT guardada: no hace falta pedirla de nuevo. */
  idKnown: boolean;
}) {
  const router = useRouter();
  const [option, setOption] = useState<number | null>(options.length === 1 ? 0 : null);
  const [method, setMethod] = useState<PaymentMethod>(DEFAULT_PAYMENT_METHOD);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (option === null) return setError("Elige la opción que quieres.");
    const data = new FormData(e.currentTarget);
    setError(null);
    setPending(true);
    try {
      const result = await requestPurchaseAction({
        quoteId,
        opcion: option,
        formaPago: method,
        identificacion: String(data.get("identificacion") ?? ""),
        direccion: String(data.get("direccion") ?? ""),
        comentario: String(data.get("comentario") ?? ""),
      });
      if (!result.ok) return setError(result.error);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {options.length > 1 && (
        <fieldset className="space-y-2">
          <legend className={LABEL}>¿Cuál opción quieres?</legend>
          {options.map((o, i) => (
            <label key={o.titulo} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="option"
                checked={option === i}
                onChange={() => setOption(i)}
                className="h-4 w-4 accent-accent"
              />
              <span className="flex-1">{o.titulo}</span>
              <span className="font-mono text-component">{formatCOP(o.totales.base)}</span>
            </label>
          ))}
        </fieldset>
      )}

      <fieldset className="space-y-2">
        <legend className={LABEL}>¿Cómo pagarías?</legend>
        {OFFERED_PAYMENT_METHODS.map((m) => {
          const total = option === null ? null : totalFor(m.id, options[option].totales);
          const overCardCap = m.id === "tarjeta" && total !== null && total > CARD_MAX_COP;
          return (
            <label key={m.id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="method"
                checked={method === m.id}
                onChange={() => setMethod(m.id)}
                className="h-4 w-4 accent-accent"
              />
              <span className="flex-1">
                {m.label}
                {overCardCap && (
                  <span className="block text-xs text-component">
                    Sobre $5.000.000 te enviamos un enlace de pago y subes el comprobante
                  </span>
                )}
              </span>
              <span className="font-mono text-component">{total === null ? "" : formatCOP(total)}</span>
            </label>
          );
        })}
        <p className="text-xs text-component">
          {CARD_AND_PSE_TEXT.charAt(0).toUpperCase() + CARD_AND_PSE_TEXT.slice(1)} lleva{CARD_AND_PSE_TEXT.includes(" y ") ? "n" : ""} un recargo. Al enviar se genera tu cuenta de cobro; el pago lo haces tú desde tu cuenta.
        </p>
      </fieldset>

      <div className="grid items-end gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="purchase-id" className={LABEL}>
            Cédula o NIT{" "}
            <span className="font-normal">{idKnown ? "(ya la tenemos; solo si quieres cambiarla)" : "(obligatoria)"}</span>
          </label>
          <input
            id="purchase-id"
            name="identificacion"
            required={!idKnown}
            maxLength={20}
            autoComplete="off"
            className={`${INPUT} font-mono`}
          />
        </div>
        <div>
          <label htmlFor="purchase-address" className={LABEL}>
            Dirección <span className="font-normal">(opcional)</span>
          </label>
          <input
            id="purchase-address"
            name="direccion"
            maxLength={160}
            autoComplete="street-address"
            className={INPUT}
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-component">
        La cédula o NIT es necesaria para tu cuenta de cobro; la dirección es opcional. Solo las usamos para
        eso. Más en la{" "}
        <Link href="/tratamiento-de-datos" className="text-accent hover:underline">
          política de tratamiento de datos
        </Link>
        .
      </p>

      <div>
        <label htmlFor="purchase-note" className={LABEL}>
          Comentario <span className="font-normal">(opcional)</span>
        </label>
        <textarea
          id="purchase-note"
          name="comentario"
          rows={2}
          maxLength={500}
          className={INPUT}
        />
      </div>

      {error && (
        <p role="alert" className="border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Quiero esta opción"}
      </Button>
    </form>
  );
}
