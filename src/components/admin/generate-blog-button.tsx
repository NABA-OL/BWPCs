"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */

import { useState, useTransition } from "react";
import { generateDraftAction } from "@/app/admin/(panel)/blog/actions";

/** Dispara la redacción de un borrador de blog con IA (además del cron semanal). */
export function GenerateBlogButton() {
  const [pending, startTransition] = useTransition();
  const [resultado, setResultado] = useState<string | null>(null);

  function handleClick() {
    setResultado(null);
    startTransition(async () => {
      const r = await generateDraftAction();
      setResultado(r.ok ? `Borrador creado: "${r.titulo}".` : r.error ?? "No se pudo generar.");
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="border border-panda px-4 py-2 text-sm font-medium text-panda transition-colors hover:bg-panda hover:text-vanilla disabled:opacity-50"
      >
        {pending ? "Redactando…" : "Redactar borrador nuevo"}
      </button>
      {resultado && <p className="mt-2 text-sm text-component">{resultado}</p>}
    </div>
  );
}
