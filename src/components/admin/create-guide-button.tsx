"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-05
 */

import { useActionState } from "react";
import { createGuideAction, type CreateGuideResult } from "@/app/admin/(panel)/blog/actions";

const initialState: CreateGuideResult = { ok: true };

/** Crea un borrador vacío a partir de un título, para redactar la guía a mano. */
export function CreateGuideButton() {
  const [state, formAction, pending] = useActionState(createGuideAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-start gap-2">
      <input
        name="titulo"
        placeholder="Título de la guía nueva"
        required
        className="min-w-64 border border-hairline bg-vanilla px-3 py-2 text-sm outline-none focus:border-panda"
      />
      <button
        type="submit"
        disabled={pending}
        className="border border-hairline px-4 py-2 text-sm font-medium text-component transition-colors hover:border-panda hover:text-panda disabled:opacity-50"
      >
        {pending ? "Creando…" : "Crear borrador manual"}
      </button>
      {state.error && <p className="w-full text-sm text-accent">{state.error}</p>}
    </form>
  );
}
