"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-10
 */

import { useEffect, useMemo, useRef, useState } from "react";

export interface ComboboxGroup<T> {
  label: string;
  items: T[];
}

/** Selector con buscador y lista con scroll — reemplazo estilizado de un <select>
 * nativo para catálogos largos (procesadores, gráficas, componentes…). */
export function Combobox<T>({
  groups,
  getId,
  renderItem,
  searchText,
  placeholder,
  onPick,
}: {
  groups: ComboboxGroup<T>[];
  getId: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  searchText: (item: T) => string;
  placeholder: string;
  onPick: (item: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function toggleGroup(label: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((it) => searchText(it).toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query, searchText]);

  function pick(item: T) {
    onPick(item);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="border border-hairline bg-vanilla px-2 py-1.5 text-left text-sm text-component outline-none transition-colors hover:border-panda focus:border-panda"
      >
        {placeholder}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-80 border border-panda bg-vanilla shadow-[0_4px_24px_rgba(0,0,0,0.10)]">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Buscar…"
            className="w-full border-b border-hairline bg-vanilla px-3 py-2.5 text-sm outline-none"
          />
          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-sm text-component">Sin resultados.</p>
            ) : (
              filtered.map((g) => {
                // Buscando, mostrar los grupos con resultado siempre abiertos.
                const isOpen = query.trim() !== "" || expanded.has(g.label);
                return (
                  <div key={g.label}>
                    <button
                      type="button"
                      onClick={() => toggleGroup(g.label)}
                      className="sticky top-0 flex w-full items-center justify-between gap-2 bg-hairline/40 px-3 py-1.5 text-left text-xs font-medium text-component outline-none hover:bg-hairline/70"
                    >
                      <span>{g.label}</span>
                      <span aria-hidden className="text-component/70">
                        {isOpen ? "▾" : "▸"}
                      </span>
                    </button>
                    {isOpen &&
                      g.items.map((it) => (
                        <button
                          key={getId(it)}
                          type="button"
                          onClick={() => pick(it)}
                          className="block w-full px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-panda hover:text-vanilla focus:bg-panda focus:text-vanilla"
                        >
                          {renderItem(it)}
                        </button>
                      ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
