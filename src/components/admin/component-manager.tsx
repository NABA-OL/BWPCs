"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  saveComponentAction,
  deleteComponentAction,
  toggleComponentAction,
  type ComponentFormState,
} from "@/app/admin/(panel)/componentes/actions";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/format";
import { Pagination, PAGE_SIZE } from "@/components/admin/pagination";
import { CATALOG_CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import { Select } from "@/components/admin/select";
import type { ComponentCategory, PriceMode } from "@/lib/db/types";
import { TrashLabel } from "@/components/ui/trash-label";
import { EditLabel, RowActions } from "@/components/admin/row-actions";

export interface ComponentRow {
  id: string;
  categoria: ComponentCategory;
  marca: string;
  modelo: string;
  descripcion: string;
  modoPrecio: PriceMode;
  baseUsd: number | null;
  precioManualCop: number | null;
  activo: boolean;
  precioCalculado: number | null;
}

const EMPTY = {
  id: "",
  categoria: CATALOG_CATEGORIES[0],
  marca: "",
  modelo: "",
  descripcion: "",
  modoPrecio: "COP" as PriceMode,
  baseUsd: "",
  precioManualCop: "",
};

export function ComponentManager({
  rows,
  trmReady,
  envios,
}: {
  rows: ComponentRow[];
  trmReady: boolean;
  /** Envío (COP) que se suma a los precios en USD, por categoría. */
  envios: Partial<Record<ComponentCategory, number>>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [filter, setFilter] = useState<ComponentCategory | "Todas">("Todas");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [state, formAction, pending] = useActionState<
    ComponentFormState,
    FormData
  >(saveComponentAction, {});

  useEffect(() => {
    if (state.ok) {
      setForm(EMPTY);
      router.refresh();
    }
  }, [state, router]);

  function edit(r: ComponentRow) {
    setForm({
      id: r.id,
      categoria: r.categoria,
      marca: r.marca,
      modelo: r.modelo,
      descripcion: r.descripcion,
      modoPrecio: r.modoPrecio,
      baseUsd: r.baseUsd?.toString() ?? "",
      precioManualCop: r.precioManualCop?.toString() ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** Un combo suele cotizarse en dólares — al elegir la categoría "Combo" se
   * propone USD por defecto, pero sigue siendo editable a COP. */
  function setCategoria(categoria: ComponentCategory) {
    setForm((f) => ({
      ...f,
      categoria,
      modoPrecio: categoria === "Combo" ? "USD" : f.modoPrecio,
    }));
  }

  const editing = form.id !== "";

  // Unique brand names for autocomplete in the form
  const marcaSuggestions = useMemo(
    () => [...new Set(rows.map((r) => r.marca).filter(Boolean))].sort(),
    [rows],
  );

  const visible = useMemo(() => {
    const q = query.toLowerCase().trim();
    return rows.filter((r) => {
      if (filter !== "Todas" && r.categoria !== filter) return false;
      if (!q) return true;
      return (
        r.modelo.toLowerCase().includes(q) ||
        r.marca.toLowerCase().includes(q) ||
        r.descripcion.toLowerCase().includes(q)
      );
    });
  }, [rows, filter, query]);

  useEffect(() => {
    setPage(1);
  }, [query, filter]);

  const totalPages = Math.ceil(visible.length / PAGE_SIZE);
  const paginated = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const goPage = useCallback((p: number) => setPage(p), []);

  return (
    <div className="mt-8 space-y-8">
      <form
        action={formAction}
        className="border border-hairline p-6"
        key={form.id || "new"}
      >
        <h2 className="text-lg font-semibold">
          {editing ? "Editar componente" : "Agregar componente"}
        </h2>
        <input type="hidden" name="id" value={form.id} />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-component">
              Categoría
            </span>
            <Select
              name="categoria"
              value={form.categoria}
              onChange={setCategoria}
              options={CATALOG_CATEGORIES.map((c) => ({
                value: c,
                label: CATEGORY_LABELS[c],
              }))}
              className="mt-1.5"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-component">
              Marca <span className="text-component/60">(opcional)</span>
            </span>
            <input
              name="marca"
              list="bw-comp-brands"
              value={form.marca}
              onChange={(e) => setForm({ ...form, marca: e.target.value })}
              placeholder="Corsair"
              className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
            />
            <datalist id="bw-comp-brands">
              {marcaSuggestions.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-component">Modelo</span>
            <input
              name="modelo"
              required
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              placeholder="DDR5 32GB 6000MHz"
              className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-component">
              Modo de precio
            </span>
            <Select
              name="modoPrecio"
              value={form.modoPrecio}
              onChange={(v) => setForm({ ...form, modoPrecio: v })}
              options={[
                { value: "COP", label: "COP (precio fijo)" },
                { value: "USD", label: "USD (convierte con TRM)" },
              ]}
              className="mt-1.5"
            />
          </label>

          {form.modoPrecio === "USD" ? (
            <label className="block">
              <span className="text-sm font-medium text-component">
                Precio base (USD)
              </span>
              <input
                name="baseUsd"
                inputMode="decimal"
                value={form.baseUsd}
                onChange={(e) => setForm({ ...form, baseUsd: e.target.value })}
                placeholder="45"
                className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 font-mono outline-none focus:border-panda"
              />
            </label>
          ) : (
            <label className="block">
              <span className="text-sm font-medium text-component">
                Precio (COP)
              </span>
              <input
                name="precioManualCop"
                inputMode="numeric"
                value={form.precioManualCop}
                onChange={(e) =>
                  setForm({ ...form, precioManualCop: e.target.value })
                }
                placeholder="710000"
                className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 font-mono outline-none focus:border-panda"
              />
            </label>
          )}

          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-component">
              Descripción <span className="text-component/60">(opcional)</span>
            </span>
            <input
              name="descripcion"
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
              placeholder="DDR5 2x16GB 6000MHz CL30"
              className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
            />
          </label>
        </div>

        {form.modoPrecio === "USD" && (
          <p className="mt-3 text-sm text-component">
            El precio final = USD × TRM efectivo
            {(envios[form.categoria] ?? 0) > 0
              ? ` + ${formatCOP(envios[form.categoria] ?? 0)} de envío de ${CATEGORY_LABELS[form.categoria]}`
              : ` (sin envío configurado para ${CATEGORY_LABELS[form.categoria]}; se define en Configuración)`}
            .
          </p>
        )}

        {form.modoPrecio === "USD" && !trmReady && (
          <p className="mt-3 text-sm text-accent">
            No hay TRM configurado: el precio en pesos no se podrá calcular
            hasta definirlo en Configuración.
          </p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando…" : editing ? "Guardar cambios" : "Agregar"}
          </Button>
          {editing && (
            <button
              type="button"
              onClick={() => setForm(EMPTY)}
              className="text-sm text-component hover:text-panda"
            >
              Cancelar
            </button>
          )}
          {state.error && (
            <span role="alert" className="text-sm text-accent">
              {state.error}
            </span>
          )}
        </div>
      </form>

      {/* Búsqueda */}
      <div className="relative max-w-sm">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-component"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle cx="6.5" cy="6.5" r="5" />
          <path d="M10.5 10.5l3.5 3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por modelo, marca…"
          className="w-full border border-hairline bg-vanilla py-2 pl-8 pr-3 text-sm outline-none focus:border-panda"
        />
      </div>

      {/* Filtro por categoría */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          active={filter === "Todas"}
          onClick={() => setFilter("Todas")}
        >
          Todas
        </FilterChip>
        {CATALOG_CATEGORIES.map((c) => (
          <FilterChip
            key={c}
            active={filter === c}
            onClick={() => setFilter(c)}
          >
            {CATEGORY_LABELS[c]}
          </FilterChip>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-component">
          No hay componentes. Agrega el primero arriba.
        </p>
      ) : visible.length === 0 ? (
        <p className="text-component">
          Sin resultados
          {query ? ` para "${query}"` : ""}
          {filter !== "Todas" ? ` en ${CATEGORY_LABELS[filter]}` : ""}.
        </p>
      ) : (
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full text-sm">
            <thead className="border-b border-hairline bg-hairline/30 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Marca</th>
                <th className="px-4 py-3 font-medium">Modelo</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-center font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-hairline last:border-0"
                >
                  <td className="px-4 py-3 text-component">
                    {CATEGORY_LABELS[r.categoria]}
                  </td>
                  <td className="px-4 py-3 text-component">{r.marca || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{r.modelo}</span>
                    {r.descripcion && (
                      <span className="block text-xs text-component">
                        {r.descripcion}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {r.precioCalculado != null
                      ? formatCOP(r.precioCalculado)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleComponentAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input
                        type="hidden"
                        name="activo"
                        value={String(r.activo)}
                      />
                      <button
                        type="submit"
                        className={`rounded-[2px] border px-2 py-0.5 text-xs ${
                          r.activo
                            ? "border-panda bg-panda text-vanilla"
                            : "border-hairline text-component"
                        }`}
                      >
                        {r.activo ? "Activo" : "Inactivo"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <RowActions>
                        <button
                          type="button"
                          onClick={() => edit(r)}
                          className="text-component hover:text-panda"
                        >
                          <EditLabel />
                        </button>
                        <form
                          action={deleteComponentAction}
                          onSubmit={(e) => {
                            if (!confirm(`¿Eliminar ${r.modelo}?`))
                              e.preventDefault();
                          }}
                        >
                          <input type="hidden" name="id" value={r.id} />
                          <button
                            type="submit"
                            className="text-accent hover:underline"
                          >
                            <TrashLabel />
                          </button>
                        </form>
                                          </RowActions>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={visible.length}
            shown={paginated.length}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
            onPage={goPage}
          />
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[2px] border px-3 py-1 text-sm transition-colors ${
        active
          ? "border-panda bg-panda text-vanilla"
          : "border-hairline text-component hover:border-panda hover:text-panda"
      }`}
    >
      {children}
    </button>
  );
}
