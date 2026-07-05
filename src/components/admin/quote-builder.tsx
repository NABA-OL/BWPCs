// Desarrollado por NABA-OL
"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import {
  saveQuoteAction,
  type QuoteFormState,
} from "@/app/admin/(panel)/cotizaciones/actions";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/categories";
import { COMPONENT_CATEGORIES, type ComponentCategory } from "@/lib/db/types";
import type { QuoteInput, QuoteItemInput } from "@/lib/quote";

export interface CatalogOption {
  id: string;
  label: string;
  categoria: ComponentCategory;
  modelo: string;
  precioCop: number;
  descripcion: string;
}

const emptyItem = (categoria: ComponentCategory = "Procesador"): QuoteItemInput => ({
  categoria,
  modelo: "",
  precioCop: 0,
  descripcion: "",
});

export function QuoteBuilder({
  id,
  initial,
  catalog,
  tarjetaPct,
  psePct,
  pdfHref,
}: {
  id: string;
  initial: QuoteInput;
  catalog: CatalogOption[];
  tarjetaPct: number;
  psePct: number;
  pdfHref?: string;
}) {
  const [data, setData] = useState<QuoteInput>(initial);
  const [state, formAction, pending] = useActionState<QuoteFormState, FormData>(
    saveQuoteAction,
    {},
  );

  function setOption(oi: number, patch: Partial<QuoteInput["opciones"][number]>) {
    setData((d) => {
      const opciones = d.opciones.map((o, i) =>
        i === oi ? { ...o, ...patch } : o,
      );
      return { ...d, opciones };
    });
  }
  function setItem(oi: number, ii: number, patch: Partial<QuoteItemInput>) {
    setData((d) => {
      const opciones = d.opciones.map((o, i) => {
        if (i !== oi) return o;
        const items = o.items.map((it, j) =>
          j === ii ? { ...it, ...patch } : it,
        );
        return { ...o, items };
      });
      return { ...d, opciones };
    });
  }
  function addItem(oi: number, item: QuoteItemInput) {
    setData((d) => {
      const opciones = d.opciones.map((o, i) =>
        i === oi ? { ...o, items: [...o.items, item] } : o,
      );
      return { ...d, opciones };
    });
  }
  function removeItem(oi: number, ii: number) {
    setData((d) => {
      const opciones = d.opciones.map((o, i) =>
        i === oi ? { ...o, items: o.items.filter((_, j) => j !== ii) } : o,
      );
      return { ...d, opciones };
    });
  }
  function addOption() {
    setData((d) => ({
      ...d,
      opciones: [
        ...d.opciones,
        {
          titulo: `Opción ${d.opciones.length + 1}`,
          items: [emptyItem()],
          servicio: d.opciones[0]?.servicio ?? 0,
        },
      ],
    }));
  }
  function removeOption(oi: number) {
    setData((d) => ({
      ...d,
      opciones: d.opciones.filter((_, i) => i !== oi),
    }));
  }

  return (
    <form action={formAction} className="mt-8 space-y-8">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="payload" value={JSON.stringify(data)} />

      {/* Encabezado */}
      <section className="grid gap-4 border border-hairline p-6 sm:grid-cols-3">
        <Field
          label="Código"
          value={data.codigo}
          onChange={(v) => setData({ ...data, codigo: v })}
          placeholder="2025-31"
        />
        <Field
          label="Cliente (opcional)"
          value={data.cliente}
          onChange={(v) => setData({ ...data, cliente: v })}
          placeholder="Nombre"
          mono={false}
        />
        <label className="block">
          <span className="text-sm font-medium text-component">Fecha</span>
          <input
            type="date"
            value={data.fecha}
            onChange={(e) => setData({ ...data, fecha: e.target.value })}
            className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 font-mono outline-none focus:border-panda"
          />
        </label>
      </section>

      {/* Opciones */}
      {data.opciones.map((opt, oi) => (
        <OptionEditor
          key={oi}
          option={opt}
          catalog={catalog}
          tarjetaPct={tarjetaPct}
          psePct={psePct}
          canRemove={data.opciones.length > 1}
          onTitulo={(v) => setOption(oi, { titulo: v })}
          onServicio={(v) => setOption(oi, { servicio: v })}
          onItem={(ii, patch) => setItem(oi, ii, patch)}
          onAddItem={(item) => addItem(oi, item)}
          onRemoveItem={(ii) => removeItem(oi, ii)}
          onRemoveOption={() => removeOption(oi)}
        />
      ))}

      <button
        type="button"
        onClick={addOption}
        className="w-full border border-dashed border-hairline py-3 text-sm text-component transition-colors hover:border-panda hover:text-panda"
      >
        + Agregar otra opción
      </button>

      {/* Acciones */}
      <div className="flex flex-wrap items-center gap-4 border-t border-hairline pt-6">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Guardando…" : id ? "Guardar cambios" : "Crear cotización"}
        </Button>
        {pdfHref && (
          <a
            href={pdfHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-panda px-6 py-3 text-sm font-medium uppercase tracking-wide transition-colors hover:bg-panda hover:text-vanilla"
          >
            Descargar PDF
          </a>
        )}
        <Link
          href="/admin/cotizaciones"
          className="text-sm text-component hover:text-panda"
        >
          Volver a la lista
        </Link>
        {state.ok && (
          <span className="text-sm text-accent">Guardado ✓</span>
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

function OptionEditor({
  option,
  catalog,
  tarjetaPct,
  psePct,
  canRemove,
  onTitulo,
  onServicio,
  onItem,
  onAddItem,
  onRemoveItem,
  onRemoveOption,
}: {
  option: QuoteInput["opciones"][number];
  catalog: CatalogOption[];
  tarjetaPct: number;
  psePct: number;
  canRemove: boolean;
  onTitulo: (v: string) => void;
  onServicio: (v: number) => void;
  onItem: (ii: number, patch: Partial<QuoteItemInput>) => void;
  onAddItem: (item: QuoteItemInput) => void;
  onRemoveItem: (ii: number) => void;
  onRemoveOption: () => void;
}) {
  const totals = useMemo(() => {
    const sub =
      option.items.reduce((a, i) => a + (i.precioCop || 0), 0) +
      (option.servicio || 0);
    return {
      base: sub,
      conTarjeta: Math.round(sub * (1 + tarjetaPct)),
      conPse: Math.round(sub * (1 + psePct)),
    };
  }, [option, tarjetaPct, psePct]);

  return (
    <section className="border border-hairline">
      <header className="flex items-center justify-between gap-3 border-b border-hairline bg-hairline/30 px-4 py-3">
        <input
          value={option.titulo}
          onChange={(e) => onTitulo(e.target.value)}
          className="bg-transparent font-semibold outline-none"
        />
        {canRemove && (
          <button
            type="button"
            onClick={onRemoveOption}
            className="text-sm text-accent hover:underline"
          >
            Quitar opción
          </button>
        )}
      </header>

      <div className="space-y-3 p-4">
        {/* Ítems */}
        {option.items.map((item, ii) => (
          <div
            key={ii}
            className="grid items-start gap-2 sm:grid-cols-[140px_1fr_120px_1fr_auto]"
          >
            <select
              value={item.categoria}
              onChange={(e) =>
                onItem(ii, { categoria: e.target.value as ComponentCategory })
              }
              className="border border-hairline bg-vanilla px-2 py-2 text-sm outline-none focus:border-panda"
            >
              {COMPONENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
            <input
              value={item.modelo}
              onChange={(e) => onItem(ii, { modelo: e.target.value })}
              placeholder="Modelo"
              className="border border-hairline bg-vanilla px-2 py-2 text-sm outline-none focus:border-panda"
            />
            <input
              value={item.precioCop || ""}
              onChange={(e) =>
                onItem(ii, {
                  precioCop: Math.max(
                    0,
                    Math.round(Number(e.target.value.replace(/\D/g, "")) || 0),
                  ),
                })
              }
              inputMode="numeric"
              placeholder="Precio"
              className="border border-hairline bg-vanilla px-2 py-2 font-mono text-sm outline-none focus:border-panda"
            />
            <input
              value={item.descripcion}
              onChange={(e) => onItem(ii, { descripcion: e.target.value })}
              placeholder="Descripción"
              className="border border-hairline bg-vanilla px-2 py-2 text-sm outline-none focus:border-panda"
            />
            <button
              type="button"
              onClick={() => onRemoveItem(ii)}
              aria-label="Quitar ítem"
              className="px-2 py-2 text-component hover:text-accent"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Agregar ítem */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => onAddItem(emptyItem())}
            className="text-sm text-component hover:text-panda"
          >
            + Línea manual
          </button>
          <CatalogPicker catalog={catalog} onPick={onAddItem} />
        </div>

        {/* Servicio + totales */}
        <div className="mt-3 grid gap-4 border-t border-hairline pt-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-component">
              Servicio (COP)
            </span>
            <input
              value={option.servicio || ""}
              onChange={(e) =>
                onServicio(
                  Math.max(
                    0,
                    Math.round(Number(e.target.value.replace(/\D/g, "")) || 0),
                  ),
                )
              }
              inputMode="numeric"
              placeholder="200000"
              className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2 font-mono outline-none focus:border-panda"
            />
          </label>
          <dl className="space-y-1 text-sm sm:text-right">
            <div className="flex justify-between sm:justify-end sm:gap-6">
              <dt className="text-component">Total</dt>
              <dd className="font-mono font-semibold">
                {formatCOP(totals.base)}
              </dd>
            </div>
            <div className="flex justify-between sm:justify-end sm:gap-6">
              <dt className="text-component">Con tarjeta</dt>
              <dd className="font-mono">{formatCOP(totals.conTarjeta)}</dd>
            </div>
            <div className="flex justify-between sm:justify-end sm:gap-6">
              <dt className="text-component">Con PSE</dt>
              <dd className="font-mono">{formatCOP(totals.conPse)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function CatalogPicker({
  catalog,
  onPick,
}: {
  catalog: CatalogOption[];
  onPick: (item: QuoteItemInput) => void;
}) {
  if (catalog.length === 0) return null;

  // Agrupar por categoría (orden de COMPONENT_CATEGORIES) para usar <optgroup>.
  const grupos = COMPONENT_CATEGORIES.map((cat) => ({
    cat,
    items: catalog.filter((c) => c.categoria === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <select
      value=""
      onChange={(e) => {
        const c = catalog.find((x) => x.id === e.target.value);
        if (c)
          onPick({
            categoria: c.categoria,
            modelo: c.modelo,
            precioCop: c.precioCop,
            descripcion: c.descripcion,
          });
        e.target.value = "";
      }}
      className="border border-hairline bg-vanilla px-2 py-1.5 text-sm text-component outline-none focus:border-panda"
    >
      <option value="">+ Desde catálogo…</option>
      {grupos.map((g) => (
        <optgroup key={g.cat} label={CATEGORY_LABELS[g.cat]}>
          {g.items.map((c) => (
            <option key={c.id} value={c.id}>
              {c.modelo} · {formatCOP(c.precioCop)}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  mono = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-component">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda ${
          mono ? "font-mono" : ""
        }`}
      />
    </label>
  );
}
