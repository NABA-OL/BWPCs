"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useActionState, useState } from "react";
import {
  saveOptionsAction,
  type OptionsState,
} from "@/app/admin/(panel)/promedios/actions";
import { Button } from "@/components/ui/button";
import { ESTIMATOR_CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import type { ComponentCategory } from "@/lib/db/types";

type Option = { label: string; precioCop: number };
type OptionsMap = Record<string, Option[]>;

export function EstimatorOptionsForm({ initial }: { initial: OptionsMap }) {
  const [data, setData] = useState<OptionsMap>(() =>
    Object.fromEntries(ESTIMATOR_CATEGORIES.map((c) => [c, initial[c] ?? []])),
  );
  const [state, formAction, pending] = useActionState<OptionsState, FormData>(
    saveOptionsAction,
    {},
  );

  function setOpt(cat: string, i: number, patch: Partial<Option>) {
    setData((d) => ({
      ...d,
      [cat]: d[cat].map((o, j) => (j === i ? { ...o, ...patch } : o)),
    }));
  }
  function addOpt(cat: string) {
    setData((d) => ({ ...d, [cat]: [...d[cat], { label: "", precioCop: 0 }] }));
  }
  function removeOpt(cat: string, i: number) {
    setData((d) => ({ ...d, [cat]: d[cat].filter((_, j) => j !== i) }));
  }

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <input type="hidden" name="options" value={JSON.stringify(data)} />

      {ESTIMATOR_CATEGORIES.map((cat: ComponentCategory) => (
        <section key={cat} className="border border-hairline p-6">
          <h2 className="text-lg font-semibold">{CATEGORY_LABELS[cat]}</h2>
          <div className="mt-3 space-y-2">
            {data[cat]?.length ? (
              data[cat].map((o, i) => (
                <div
                  key={i}
                  className="grid items-center gap-2 sm:grid-cols-[1fr_160px_auto]"
                >
                  <input
                    aria-label={`${CATEGORY_LABELS[cat]} opción ${i + 1}: etiqueta`}
                    value={o.label}
                    onChange={(e) => setOpt(cat, i, { label: e.target.value })}
                    placeholder="Gama media · Core i5 / Ryzen 5"
                    className="border border-hairline bg-vanilla px-3 py-2 text-sm outline-none focus:border-panda"
                  />
                  <input
                    aria-label={`${CATEGORY_LABELS[cat]} opción ${i + 1}: precio COP`}
                    value={o.precioCop || ""}
                    onChange={(e) =>
                      setOpt(cat, i, {
                        precioCop: Math.max(
                          0,
                          Math.round(
                            Number(e.target.value.replace(/\D/g, "")) || 0,
                          ),
                        ),
                      })
                    }
                    inputMode="numeric"
                    placeholder="Precio COP"
                    className="border border-hairline bg-vanilla px-3 py-2 font-mono text-sm outline-none focus:border-panda"
                  />
                  <button
                    type="button"
                    aria-label="Quitar opción"
                    onClick={() => removeOpt(cat, i)}
                    className="px-2 py-2 text-component hover:text-accent"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-component">Sin opciones.</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => addOpt(cat)}
            className="mt-3 text-sm text-accent hover:underline"
          >
            + Agregar opción
          </button>
        </section>
      ))}

      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Guardando…" : "Guardar opciones"}
        </Button>
        {state.ok && (
          <span role="status" className="text-sm text-component">
            Opciones guardadas ✓
          </span>
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
