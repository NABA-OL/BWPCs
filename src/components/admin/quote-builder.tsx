"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

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
import type { CatalogOption } from "@/lib/admin/catalog-data";
import { Combobox } from "@/components/admin/combobox";

export type { CatalogOption };

const emptyItem = (
  categoria: ComponentCategory = "Procesador",
): QuoteItemInput => ({
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
  // Claves estables por opción (no el índice): así el colapsado y el drag
  // siguen a la opción correcta aunque se reordenen.
  const [optionKeys, setOptionKeys] = useState<string[]>(() =>
    initial.opciones.map(() => crypto.randomUUID()),
  );
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [dragOptIdx, setDragOptIdx] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState<QuoteFormState, FormData>(
    saveQuoteAction,
    {},
  );

  function setOption(
    oi: number,
    patch: Partial<QuoteInput["opciones"][number]>,
  ) {
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
  function moveItem(oi: number, from: number, to: number) {
    setData((d) => {
      const opciones = d.opciones.map((o, i) => {
        if (i !== oi) return o;
        const items = [...o.items];
        const [moved] = items.splice(from, 1);
        items.splice(to, 0, moved);
        return { ...o, items };
      });
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
    setOptionKeys((k) => [...k, crypto.randomUUID()]);
  }
  function removeOption(oi: number) {
    setData((d) => ({
      ...d,
      opciones: d.opciones.filter((_, i) => i !== oi),
    }));
    setOptionKeys((k) => k.filter((_, i) => i !== oi));
  }
  function duplicateOption(oi: number) {
    setData((d) => {
      const source = d.opciones[oi];
      const copy = {
        ...source,
        titulo: `${source.titulo} (copia)`,
        items: source.items.map((it) => ({ ...it })),
      };
      const opciones = [...d.opciones];
      opciones.splice(oi + 1, 0, copy);
      return { ...d, opciones };
    });
    setOptionKeys((k) => {
      const next = [...k];
      next.splice(oi + 1, 0, crypto.randomUUID());
      return next;
    });
  }
  function moveOption(from: number, to: number) {
    setData((d) => {
      const opciones = [...d.opciones];
      const [moved] = opciones.splice(from, 1);
      opciones.splice(to, 0, moved);
      return { ...d, opciones };
    });
    setOptionKeys((k) => {
      const next = [...k];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }
  function toggleCollapsed(key: string) {
    setCollapsed((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
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
        <div
          key={optionKeys[oi]}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (dragOptIdx !== null && dragOptIdx !== oi)
              moveOption(dragOptIdx, oi);
            setDragOptIdx(null);
          }}
          className={dragOptIdx === oi ? "opacity-40" : ""}
        >
          <OptionEditor
            option={opt}
            catalog={catalog}
            tarjetaPct={tarjetaPct}
            psePct={psePct}
            canRemove={data.opciones.length > 1}
            isOpen={!collapsed.has(optionKeys[oi])}
            onToggleOpen={() => toggleCollapsed(optionKeys[oi])}
            onDragHandleStart={() => setDragOptIdx(oi)}
            onDragHandleEnd={() => setDragOptIdx(null)}
            onTitulo={(v) => setOption(oi, { titulo: v })}
            onServicio={(v) => setOption(oi, { servicio: v })}
            onItem={(ii, patch) => setItem(oi, ii, patch)}
            onAddItem={(item) => addItem(oi, item)}
            onRemoveItem={(ii) => removeItem(oi, ii)}
            onMoveItem={(from, to) => moveItem(oi, from, to)}
            onRemoveOption={() => removeOption(oi)}
            onDuplicateOption={() => duplicateOption(oi)}
          />
        </div>
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
        {state.ok && <span className="text-sm text-accent">Guardado ✓</span>}
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
  isOpen,
  onToggleOpen,
  onDragHandleStart,
  onDragHandleEnd,
  onTitulo,
  onServicio,
  onItem,
  onAddItem,
  onRemoveItem,
  onMoveItem,
  onRemoveOption,
  onDuplicateOption,
}: {
  option: QuoteInput["opciones"][number];
  catalog: CatalogOption[];
  tarjetaPct: number;
  psePct: number;
  canRemove: boolean;
  isOpen: boolean;
  onToggleOpen: () => void;
  onDragHandleStart: () => void;
  onDragHandleEnd: () => void;
  onTitulo: (v: string) => void;
  onServicio: (v: number) => void;
  onItem: (ii: number, patch: Partial<QuoteItemInput>) => void;
  onAddItem: (item: QuoteItemInput) => void;
  onRemoveItem: (ii: number) => void;
  onMoveItem: (from: number, to: number) => void;
  onRemoveOption: () => void;
  onDuplicateOption: () => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
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
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            draggable
            onDragStart={onDragHandleStart}
            onDragEnd={onDragHandleEnd}
            aria-label="Reordenar opción"
            title="Arrastra para reordenar"
            className="hidden shrink-0 cursor-grab select-none text-component hover:text-panda active:cursor-grabbing sm:block"
          >
            <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">
              <circle cx="2" cy="2" r="1.5" />
              <circle cx="8" cy="2" r="1.5" />
              <circle cx="2" cy="8" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="2" cy="14" r="1.5" />
              <circle cx="8" cy="14" r="1.5" />
            </svg>
          </span>
          <button
            type="button"
            onClick={onToggleOpen}
            aria-label={isOpen ? "Colapsar opción" : "Expandir opción"}
            className="shrink-0 text-component hover:text-panda"
          >
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${isOpen ? "" : "-rotate-90"}`}
            >
              <path d="M1 1.5l5 5 5-5" />
            </svg>
          </button>
          <input
            value={option.titulo}
            onChange={(e) => onTitulo(e.target.value)}
            className="min-w-0 flex-1 bg-transparent font-semibold outline-none"
          />
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={onDuplicateOption}
            className="text-sm text-component hover:text-panda"
          >
            Duplicar opción
          </button>
          {canRemove && (
            <button
              type="button"
              onClick={onRemoveOption}
              className="text-sm text-accent hover:underline"
            >
              Quitar opción
            </button>
          )}
        </div>
      </header>

      {isOpen && (
      <div className="space-y-3 p-4">
        {/* Ítems */}
        {option.items.map((item, ii) => (
          <div
            key={ii}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIdx !== null && dragIdx !== ii) onMoveItem(dragIdx, ii);
              setDragIdx(null);
            }}
            className={`grid items-start gap-2 sm:grid-cols-[20px_140px_1fr_120px_1fr_auto] ${
              dragIdx === ii ? "opacity-40" : ""
            }`}
          >
            <span
              draggable
              onDragStart={() => setDragIdx(ii)}
              onDragEnd={() => setDragIdx(null)}
              aria-label="Reordenar ítem"
              title="Arrastra para reordenar"
              className="mt-2 hidden cursor-grab select-none self-center text-component hover:text-panda active:cursor-grabbing sm:block"
            >
              <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">
                <circle cx="2" cy="2" r="1.5" />
                <circle cx="8" cy="2" r="1.5" />
                <circle cx="2" cy="8" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="2" cy="14" r="1.5" />
                <circle cx="8" cy="14" r="1.5" />
              </svg>
            </span>
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
      )}
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

  // Agrupar por categoría (orden de COMPONENT_CATEGORIES).
  const grupos = COMPONENT_CATEGORIES.map((cat) => ({
    label: CATEGORY_LABELS[cat],
    items: catalog.filter((c) => c.categoria === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <Combobox
      groups={grupos}
      getId={(c) => c.id}
      searchText={(c) => `${c.modelo} ${c.descripcion}`}
      placeholder="+ Desde catálogo…"
      onPick={(c) =>
        onPick({
          categoria: c.categoria,
          modelo: c.modelo,
          precioCop: c.precioCop,
          descripcion: c.descripcion,
        })
      }
      renderItem={(c) => (
        <>
          {c.modelo}
          {c.descripcion ? ` (${c.descripcion})` : ""} ·{" "}
          {formatCOP(c.precioCop)}
        </>
      )}
    />
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
