"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { INPUT, LABEL } from "@/components/account/shared";
import { requestRevisionAction } from "@/app/(public)/cuenta/(area)/cotizaciones/[id]/actions";
import { REVISION_MAX_CHARS, REVISION_MIN_CHARS } from "@/lib/quote-limits";

/** Pedir ajustes a una cotización: opción preferida + qué cambiar. */
export function RevisionForm({
  quoteId,
  options,
}: {
  quoteId: string;
  options: string[];
}) {
  const router = useRouter();
  const [preferred, setPreferred] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await requestRevisionAction({
        quoteId,
        opcionPreferida: preferred,
        comentario: comment,
      });
      if (!result.ok) return setError(result.error);
      setComment("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {options.length > 1 && (
        <fieldset className="space-y-2">
          <legend className={LABEL}>¿Cuál opción te gusta más?</legend>
          {[null, ...options.keys()].map((i) => (
            <label key={i ?? "none"} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="preferred"
                checked={preferred === i}
                onChange={() => setPreferred(i)}
                className="h-4 w-4 accent-accent"
              />
              {i === null ? "Todavía no me decido" : options[i]}
            </label>
          ))}
        </fieldset>
      )}
      <div>
        <label htmlFor="revision-comment" className={LABEL}>
          ¿Qué quieres cambiar?
        </label>
        <textarea
          id="revision-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          minLength={REVISION_MIN_CHARS}
          maxLength={REVISION_MAX_CHARS}
          required
          placeholder="Ej.: más almacenamiento, otra tarjeta gráfica, ajustar el presupuesto…"
          className={INPUT}
        />
        <p className="mt-1 text-xs text-component">
          {comment.trim().length}/{REVISION_MAX_CHARS}
        </p>
      </div>
      {error && (
        <p role="alert" className="border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Pedir cambios"}
      </Button>
    </form>
  );
}
