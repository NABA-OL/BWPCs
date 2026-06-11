"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveGraphicAction,
  deleteGraphicAction,
  toggleGraphicAction,
  type GraphicFormState,
} from "@/app/admin/(panel)/graficas/actions";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/format";

type GpuBrand = "AMD" | "NVIDIA" | "Intel";
type BrandFilter = GpuBrand | "Todas";

export interface GraphicRow {
  id: string;
  modelo: string;
  marca: GpuBrand;
  ensambladora: string;
  modoPrecio: "USD" | "COP";
  baseUsd: number | null;
  precioManualCop: number | null;
  activo: boolean;
  precioCalculado: number | null;
}

const EMPTY = {
  id: "",
  modelo: "",
  marca: "NVIDIA" as GpuBrand,
  ensambladora: "",
  modoPrecio: "USD" as "USD" | "COP",
  baseUsd: "",
  precioManualCop: "",
};

const AIBS = [
  "MSI", "ASUS", "Gigabyte", "Zotac", "PNY", "Palit",
  "Gainward", "PowerColor", "Sapphire", "XFX", "ASRock",
];

const BRANDS: BrandFilter[] = ["Todas", "NVIDIA", "AMD", "Intel"];

export function GraphicManager({
  rows,
  trmReady,
}: {
  rows: GraphicRow[];
  trmReady: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [state, formAction, pending] = useActionState<GraphicFormState, FormData>(
    saveGraphicAction,
    {},
  );
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<BrandFilter>("Todas");

  useEffect(() => {
    if (state.ok) {
      setForm(EMPTY);
      router.refresh();
    }
  }, [state, router]);

  function edit(r: GraphicRow) {
    setForm({
      id: r.id,
      modelo: r.modelo,
      marca: r.marca,
      ensambladora: r.ensambladora,
      modoPrecio: r.modoPrecio,
      baseUsd: r.baseUsd?.toString() ?? "",
      precioManualCop: r.precioManualCop?.toString() ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const editing = form.id !== "";

  // Unique model names for autocomplete in the form
  const modelSuggestions = useMemo(
    () => [...new Set(rows.map((r) => r.modelo))].sort(),
    [rows],
  );

  const visible = useMemo(() => {
    const q = query.toLowerCase().trim();
    return rows.filter((r) => {
      if (brandFilter !== "Todas" && r.marca !== brandFilter) return false;
      if (!q) return true;
      return (
        r.modelo.toLowerCase().includes(q) ||
        r.ensambladora.toLowerCase().includes(q) ||
        r.marca.toLowerCase().includes(q)
      );
    });
  }, [rows, query, brandFilter]);

  return (
    <div className="mt-8 space-y-8">
      <form
        action={formAction}
        className="border border-hairline p-6"
        key={form.id || "new"}
      >
        <h2 className="text-lg font-semibold">
          {editing ? "Editar gráfica" : "Agregar gráfica"}
        </h2>
        <input type="hidden" name="id" value={form.id} />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-component">Modelo</span>
            <input
              name="modelo"
              required
              list="bw-gpu-models"
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              placeholder="RX 9060 XT 16gb"
              className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
            />
            <datalist id="bw-gpu-models">
              {modelSuggestions.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-component">Marca</span>
            <select
              name="marca"
              value={form.marca}
              onChange={(e) =>
                setForm({ ...form, marca: e.target.value as GpuBrand })
              }
              className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
            >
              <option value="NVIDIA">NVIDIA</option>
              <option value="AMD">AMD</option>
              <option value="Intel">Intel</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-component">
              Ensambladora <span className="text-component/60">(opcional)</span>
            </span>
            <input
              name="ensambladora"
              list="bw-aibs"
              value={form.ensambladora}
              onChange={(e) =>
                setForm({ ...form, ensambladora: e.target.value })
              }
              placeholder="MSI, ASUS, Gigabyte…"
              className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
            />
            <datalist id="bw-aibs">
              {AIBS.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-component">
              Modo de precio
            </span>
            <select
              name="modoPrecio"
              value={form.modoPrecio}
              onChange={(e) =>
                setForm({ ...form, modoPrecio: e.target.value as "USD" | "COP" })
              }
              className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
            >
              <option value="USD">USD (convierte con TRM)</option>
              <option value="COP">COP (precio fijo)</option>
            </select>
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
                placeholder="389"
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
                placeholder="1680000"
                className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 font-mono outline-none focus:border-panda"
              />
            </label>
          )}
        </div>

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

      {/* Búsqueda y filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-component"
            width="14" height="14" viewBox="0 0 16 16" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
          >
            <circle cx="6.5" cy="6.5" r="5" />
            <path d="M10.5 10.5l3.5 3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por modelo, ensambladora…"
            className="w-full border border-hairline bg-vanilla py-2 pl-8 pr-3 text-sm outline-none focus:border-panda"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBrandFilter(b)}
              className={`rounded-[2px] border px-3 py-1 text-sm transition-colors ${
                brandFilter === b
                  ? "border-panda bg-panda text-vanilla"
                  : "border-hairline text-component hover:border-panda hover:text-panda"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-component">Aún no hay gráficas. Agrega la primera arriba.</p>
      ) : visible.length === 0 ? (
        <p className="text-component">
          Sin resultados para &ldquo;{query}&rdquo;
          {brandFilter !== "Todas" ? ` en ${brandFilter}` : ""}.
        </p>
      ) : (
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full text-sm">
            <thead className="border-b border-hairline bg-hairline/30 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Modelo</th>
                <th className="px-4 py-3 font-medium">Marca</th>
                <th className="px-4 py-3 font-medium">Ensambladora</th>
                <th className="px-4 py-3 font-medium">Base</th>
                <th className="px-4 py-3 font-medium">Precio COP</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-3 font-medium">{r.modelo}</td>
                  <td className="px-4 py-3 text-component">{r.marca}</td>
                  <td className="px-4 py-3 text-component">
                    {r.ensambladora || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-component">
                    {r.modoPrecio === "USD"
                      ? `$${r.baseUsd ?? "—"} USD`
                      : "COP fijo"}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {r.precioCalculado != null
                      ? formatCOP(r.precioCalculado)
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleGraphicAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="activo" value={String(r.activo)} />
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
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => edit(r)}
                        className="text-component hover:text-panda"
                      >
                        Editar
                      </button>
                      <form
                        action={deleteGraphicAction}
                        onSubmit={(e) => {
                          if (!confirm(`¿Eliminar ${r.modelo}?`)) e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="id" value={r.id} />
                        <button type="submit" className="text-accent hover:underline">
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length < rows.length && (
            <p className="border-t border-hairline px-4 py-2 text-xs text-component">
              Mostrando {visible.length} de {rows.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
