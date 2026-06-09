"use client";

import { useActionState } from "react";
import {
  saveAveragesAction,
  type AveragesState,
} from "@/app/admin/(panel)/promedios/actions";
import { Button } from "@/components/ui/button";
import { ESTIMATOR_CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import type { ComponentCategory } from "@/lib/db/types";

export function AveragesForm({
  initial,
}: {
  initial: Record<string, number>;
}) {
  const [state, formAction, pending] = useActionState<AveragesState, FormData>(
    saveAveragesAction,
    {},
  );

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <div className="grid gap-5 border border-hairline p-6 sm:grid-cols-2">
        {ESTIMATOR_CATEGORIES.map((cat: ComponentCategory) => (
          <label key={cat} className="block">
            <span className="text-sm font-medium text-component">
              {CATEGORY_LABELS[cat]} (COP)
            </span>
            <input
              name={`avg_${cat}`}
              inputMode="numeric"
              defaultValue={initial[cat] || ""}
              placeholder="0"
              className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 font-mono outline-none focus:border-panda"
            />
          </label>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Guardando…" : "Guardar promedios"}
        </Button>
        {state.ok && (
          <span className="text-sm text-accent">Promedios guardados ✓</span>
        )}
        {state.error && (
          <span role="alert" className="text-sm text-accent">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
