"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveGraphicAction,
  deleteGraphicAction,
  toggleGraphicAction,
  type GraphicFormState,
} from "@/app/admin/(panel)/graficas/actions";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/format";

export interface GraphicRow {
  id: string;
  modelo: string;
  modoPrecio: "USD" | "COP";
  baseUsd: number | null;
  precioManualCop: number | null;
  activo: boolean;
  precioCalculado: number | null;
}

const EMPTY = {
  id: "",
  modelo: "",
  modoPrecio: "USD" as "USD" | "COP",
  baseUsd: "",
  precioManualCop: "",
};

export function GraphicManager({
  rows,
  trmReady,
}: {
  rows: GraphicRow[];
  trmReady: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [state, formAction, pending] = useActionState<
    GraphicFormState,
    FormData
  >(saveGraphicAction, {});

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
      modoPrecio: r.modoPrecio,
      baseUsd: r.baseUsd?.toString() ?? "",
      precioManualCop: r.precioManualCop?.toString() ?? "",
    });
  }

  const editing = form.id !== "";

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
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-component">Modelo</span>
            <input
              name="modelo"
              required
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              placeholder="RX 9060 XT 16gb"
              className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-component">
              Modo de precio
            </span>
            <select
              name="modoPrecio"
              value={form.modoPrecio}
              onChange={(e) =>
                setForm({
                  ...form,
                  modoPrecio: e.target.value as "USD" | "COP",
                })
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
            No hay TRM configurado: el precio en pesos no se podrá calcular hasta
            definirlo en Configuración.
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

      {rows.length === 0 ? (
        <p className="text-component">Aún no hay gráficas. Agrega la primera arriba.</p>
      ) : (
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full text-sm">
            <thead className="border-b border-hairline bg-hairline/30 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Modelo</th>
                <th className="px-4 py-3 font-medium">Base</th>
                <th className="px-4 py-3 font-medium">Precio COP</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-3 font-medium">{r.modelo}</td>
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
                          if (!confirm(`¿Eliminar ${r.modelo}?`))
                            e.preventDefault();
                        }}
                      >
                        <input type="hidden" name="id" value={r.id} />
                        <button
                          type="submit"
                          className="text-accent hover:underline"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
