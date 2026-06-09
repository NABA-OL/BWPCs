"use client";

import { useMemo, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { formatCOP } from "@/lib/format";
import { whatsappLink } from "@/lib/site-config";

export interface EstimatorCategory {
  key: string;
  label: string;
  promedio: number;
  defaultOn: boolean;
}

export function CotizadorEstimator({
  categories,
  servicioBase,
  tarjetaPct,
  psePct,
}: {
  categories: EstimatorCategory[];
  servicioBase: number;
  tarjetaPct: number;
  psePct: number;
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(categories.map((c) => [c.key, c.defaultOn])),
  );
  const [servicio, setServicio] = useState(true);

  const { total, conTarjeta, conPse, chosen } = useMemo(() => {
    const chosen = categories.filter((c) => selected[c.key]);
    const sub = chosen.reduce((acc, c) => acc + c.promedio, 0);
    const total = sub + (servicio ? servicioBase : 0);
    return {
      chosen,
      total,
      conTarjeta: Math.round(total * (1 + tarjetaPct)),
      conPse: Math.round(total * (1 + psePct)),
    };
  }, [categories, selected, servicio, servicioBase, tarjetaPct, psePct]);

  function toggle(key: string) {
    setSelected((s) => ({ ...s, [key]: !s[key] }));
  }

  const waMessage = useMemo(() => {
    const items = chosen.map((c) => `• ${c.label}`).join("\n");
    return (
      `Hola B & W, quiero cotizar un PC con:\n${items}` +
      `${servicio ? "\n• Ensamblaje" : ""}\n\n` +
      `Estimado aproximado: ${formatCOP(total)} ` +
      `(con tarjeta ${formatCOP(conTarjeta)}). ¿Me ayudan a afinarlo?`
    );
  }, [chosen, servicio, total, conTarjeta]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      {/* Selección de componentes */}
      <div>
        <h2 className="text-xl font-semibold">¿Qué quieres incluir?</h2>
        <p className="mt-1 text-sm text-component">
          Marca los componentes. No necesitas elegir modelos: te damos un
          aproximado.
        </p>

        <div className="mt-5 grid gap-px overflow-hidden border border-hairline bg-hairline sm:grid-cols-2">
          {categories.map((c) => {
            const on = selected[c.key];
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(c.key)}
                className={`flex items-center justify-between gap-3 bg-vanilla px-4 py-3.5 text-left transition-colors ${
                  on ? "" : "opacity-55 hover:opacity-100"
                }`}
              >
                <span className="font-medium">{c.label}</span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border ${
                    on
                      ? "border-accent bg-accent text-accent-ink"
                      : "border-component"
                  }`}
                  aria-hidden
                >
                  {on && (
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                      <path
                        d="M3 8.5l3.5 3.5L13 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Servicio de ensamble */}
        <button
          type="button"
          aria-pressed={servicio}
          onClick={() => setServicio((v) => !v)}
          className="mt-4 flex w-full items-center justify-between gap-3 border border-hairline px-4 py-3.5 text-left"
        >
          <span>
            <span className="font-medium">Servicio de ensamblaje</span>
            <span className="block text-xs text-component">
              Armado, formateo y configuración completos.
            </span>
          </span>
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border ${
              servicio
                ? "border-accent bg-accent text-accent-ink"
                : "border-component"
            }`}
            aria-hidden
          >
            {servicio && (
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                <path
                  d="M3 8.5l3.5 3.5L13 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </button>
      </div>

      {/* Panel de estimado */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="border border-panda bg-panda p-6 text-vanilla">
          <p className="font-mono text-sm text-vanilla/60">
            Estimado aproximado
          </p>
          <p className="mt-1 font-mono text-4xl font-semibold tracking-tight">
            {formatCOP(total)}
          </p>

          <dl className="mt-5 space-y-2 border-t border-vanilla/15 pt-5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-vanilla/60">Con tarjeta</dt>
              <dd className="font-mono">{formatCOP(conTarjeta)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-vanilla/60">Con PSE / Bre-B</dt>
              <dd className="font-mono">{formatCOP(conPse)}</dd>
            </div>
          </dl>

          <ButtonLink
            href={whatsappLink(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            className="mt-6 w-full bg-accent text-accent-ink hover:bg-vanilla hover:text-panda"
          >
            Enviar por WhatsApp
          </ButtonLink>
        </div>

        <p className="mt-3 px-1 text-xs italic text-component">
          Precio aproximado, sujeto a cambios. El valor final lo confirmamos
          contigo según los modelos exactos y la disponibilidad.
        </p>
      </div>
    </div>
  );
}
