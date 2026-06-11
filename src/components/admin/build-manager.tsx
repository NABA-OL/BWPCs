"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveBuildAction,
  deleteBuildAction,
  toggleBuildAction,
  type BuildFormState,
} from "@/app/admin/(panel)/ensambles/actions";
import { Button } from "@/components/ui/button";
import { Pagination, PAGE_SIZE } from "@/components/admin/pagination";

export interface BuildRow {
  id: string;
  titulo: string;
  specs: string;
  imagenUrl: string;
  orden: number;
  activo: boolean;
}

const EMPTY = {
  id: "",
  titulo: "",
  specs: "",
  imagenUrl: "",
  orden: 0,
};

export function BuildManager({ rows }: { rows: BuildRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [state, formAction, pending] = useActionState<BuildFormState, FormData>(
    saveBuildAction,
    {},
  );
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (state.ok) {
      setForm(EMPTY);
      setPreviewError(false);
      router.refresh();
    }
  }, [state, router]);

  // Reset preview error when URL changes
  useEffect(() => { setPreviewError(false); }, [form.imagenUrl]);

  function edit(r: BuildRow) {
    setForm({
      id: r.id,
      titulo: r.titulo,
      specs: r.specs,
      imagenUrl: r.imagenUrl,
      orden: r.orden,
    });
    setPreviewError(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const editing = form.id !== "";

  const visible = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.titulo.toLowerCase().includes(q) ||
        r.specs.toLowerCase().includes(q),
    );
  }, [rows, query]);

  useEffect(() => { setPage(1); }, [query]);

  const totalPages = Math.ceil(visible.length / PAGE_SIZE);
  const paginated = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const showPreview = form.imagenUrl.startsWith("http") && !previewError;

  return (
    <div className="mt-8 space-y-8">
      {/* Formulario */}
      <form
        action={formAction}
        className="border border-hairline p-6"
        key={form.id || "new"}
      >
        <h2 className="text-lg font-semibold">
          {editing ? "Editar ensamble" : "Agregar ensamble"}
        </h2>
        <input type="hidden" name="id" value={form.id} />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-component">
              URL de imagen
            </span>
            <input
              name="imagenUrl"
              type="url"
              required
              value={form.imagenUrl}
              onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })}
              placeholder="https://i.imgur.com/abc123.jpg"
              className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
            />
            <span className="mt-1 block text-xs text-component">
              Sube la foto a Imgur, Google Fotos, o donde prefieras y pega el link directo.
            </span>
          </label>

          {/* Live preview */}
          {showPreview && (
            <div className="sm:col-span-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.imagenUrl}
                alt="Vista previa"
                onError={() => setPreviewError(true)}
                className="h-40 w-40 border border-hairline object-cover"
              />
            </div>
          )}

          <label className="block">
            <span className="text-sm font-medium text-component">Título</span>
            <input
              name="titulo"
              required
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Gaming Mid · Bogotá"
              className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-component">Orden</span>
            <input
              name="orden"
              type="number"
              min={0}
              value={form.orden}
              onChange={(e) =>
                setForm({ ...form, orden: Number(e.target.value) || 0 })
              }
              className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 font-mono outline-none focus:border-panda"
            />
            <span className="mt-1 block text-xs text-component">
              Menor número = aparece primero.
            </span>
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-component">
              Specs <span className="text-component/60">(opcional)</span>
            </span>
            <input
              name="specs"
              value={form.specs}
              onChange={(e) => setForm({ ...form, specs: e.target.value })}
              placeholder="Ryzen 5 7600 · RTX 4060 · 32GB DDR5 · 1TB NVMe"
              className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda"
            />
          </label>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando…" : editing ? "Guardar cambios" : "Agregar"}
          </Button>
          {editing && (
            <button
              type="button"
              onClick={() => { setForm(EMPTY); setPreviewError(false); }}
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
      <div className="relative max-w-xs">
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
          placeholder="Buscar por título o specs…"
          className="w-full border border-hairline bg-vanilla py-2 pl-8 pr-3 text-sm outline-none focus:border-panda"
        />
      </div>

      {rows.length === 0 ? (
        <p className="text-component">
          Aún no hay ensambles. Agrega el primero arriba.
        </p>
      ) : visible.length === 0 ? (
        <p className="text-component">
          Sin resultados para &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="border border-hairline">
          <table className="w-full text-sm">
            <thead className="border-b border-hairline bg-hairline/30 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Foto</th>
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Orden</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r) => (
                <tr key={r.id} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.imagenUrl}
                      alt={r.titulo}
                      className="h-12 w-12 border border-hairline object-cover"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{r.titulo}</span>
                    {r.specs && (
                      <span className="block max-w-xs truncate text-xs text-component">
                        {r.specs}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-component">
                    {r.orden}
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleBuildAction}>
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
                        action={deleteBuildAction}
                        onSubmit={(e) => {
                          if (!confirm(`¿Eliminar "${r.titulo}"?`))
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
          <Pagination
            page={page}
            totalPages={totalPages}
            total={visible.length}
            shown={paginated.length}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
            onPage={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
