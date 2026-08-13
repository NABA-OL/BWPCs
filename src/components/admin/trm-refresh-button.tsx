"use client";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useActionState } from "react";
import {
  refreshTrmAction,
  type TrmState,
} from "@/app/admin/(panel)/configuracion/actions";
import { formatNumber } from "@/lib/format";

/**
 * Botón "Actualizar TRM ahora": consulta el servicio oficial de la
 * Superfinanciera a demanda. El cron diario hace lo mismo automáticamente.
 */
export function TrmRefreshButton({
  actualizado,
}: {
  actualizado: Date | null;
}) {
  const [state, action, pending] = useActionState<TrmState, FormData>(
    async () => refreshTrmAction(),
    {},
  );

  const fecha = actualizado
    ? new Date(actualizado).toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        className="border border-panda px-4 py-2 text-sm font-medium text-panda transition-colors hover:bg-panda hover:text-vanilla disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "Consultando…" : "Actualizar TRM ahora"}
      </button>
      {state.ok && state.trm != null && (
        <span role="status" className="text-sm text-component">
          TRM oficial:{" "}
          <span className="font-mono text-panda">
            {formatNumber(state.trm)}
          </span>{" "}
          ✓
        </span>
      )}
      {state.error && (
        <span role="alert" className="text-sm text-accent">
          {state.error}
        </span>
      )}
      {!state.ok && !state.error && fecha && (
        <span className="text-sm text-component">
          Última actualización: {fecha}
        </span>
      )}
    </form>
  );
}
