"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */

import { useState, useTransition } from "react";
import { runScanAction } from "@/app/admin/(panel)/noticias/actions";

/** Dispara el escaneo manual de YouTube + RSS. Provisional: hasta activar el cron. */
export function NewsScanButton() {
  const [pending, startTransition] = useTransition();
  const [resultado, setResultado] = useState<string | null>(null);

  function handleClick() {
    setResultado(null);
    startTransition(async () => {
      const r = await runScanAction();
      if (!r.ok) {
        setResultado("No se pudo escanear. Revisa la sesión.");
        return;
      }
      const partes = [
        r.creados > 0
          ? `${r.creados} borrador${r.creados === 1 ? "" : "es"} nuevo${r.creados === 1 ? "" : "s"}.`
          : "Nada nuevo por ahora.",
      ];
      if (r.errores.length > 0) {
        partes.push(`Fallaron: ${r.errores.join(", ")}.`);
      }
      setResultado(partes.join(" "));
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
        {pending ? "Escaneando…" : "Escanear ahora"}
      </button>
      {resultado && (
        <p className="mt-2 text-sm text-component">{resultado}</p>
      )}
    </div>
  );
}
