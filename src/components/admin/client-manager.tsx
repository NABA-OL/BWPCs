"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveClientAction,
  deleteClientAction,
  type ClientFormState,
} from "@/app/admin/(panel)/clientes/actions";
import { Button } from "@/components/ui/button";

export interface ClientRow {
  id: string;
  nombre: string;
  identificacion: string;
  direccion: string;
  telefono: string;
  email: string;
  /** id de la cuenta de usuario ligada ("" = ninguna). */
  userId: string;
  /** Correo de la cuenta ligada, para mostrarlo en la tabla. */
  cuenta: string | null;
}

interface AccountOption {
  id: string;
  name: string;
  email: string;
}

const EMPTY = {
  id: "",
  nombre: "",
  identificacion: "",
  direccion: "",
  telefono: "",
  email: "",
  userId: "",
};

export function ClientManager({
  rows,
  accounts,
}: {
  rows: ClientRow[];
  accounts: AccountOption[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [state, formAction, pending] = useActionState<
    ClientFormState,
    FormData
  >(saveClientAction, {});

  useEffect(() => {
    if (state.ok) {
      setForm(EMPTY);
      router.refresh();
    }
  }, [state, router]);

  const editing = form.id !== "";
  const inputCls =
    "mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda";

  return (
    <div className="mt-8 space-y-8">
      <form
        action={formAction}
        className="border border-hairline p-6"
        key={form.id || "new"}
      >
        <h2 className="text-lg font-semibold">
          {editing ? "Editar cliente" : "Agregar cliente"}
        </h2>
        <input type="hidden" name="id" value={form.id} />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-component">Nombre</span>
            <input
              name="nombre"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Juan Pérez"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-component">
              Identificación{" "}
              <span className="text-component/60">
                (opcional; se exige al emitir una cuenta de cobro)
              </span>
            </span>
            <input
              name="identificacion"
              value={form.identificacion}
              onChange={(e) =>
                setForm({ ...form, identificacion: e.target.value })
              }
              placeholder="C.C. / NIT"
              className={`${inputCls} font-mono`}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-component">
              Dirección <span className="text-component/60">(opcional)</span>
            </span>
            <input
              name="direccion"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-component">
              Teléfono <span className="text-component/60">(opcional)</span>
            </span>
            <input
              name="telefono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className={`${inputCls} font-mono`}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-component">
              Email <span className="text-component/60">(opcional)</span>
            </span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-component">
              Cuenta en la web <span className="text-component/60">(opcional)</span>
            </span>
            <select
              name="userId"
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              className={inputCls}
            >
              <option value="">Sin cuenta</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {a.email}
                </option>
              ))}
            </select>
          </label>
        </div>

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
        <p className="text-component">
          No hay clientes. Agrega el primero arriba.
        </p>
      ) : (
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full text-sm">
            <thead className="border-b border-hairline bg-hairline/30 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Identificación</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3 font-medium">Cuenta</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-hairline last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{r.nombre}</td>
                  <td className="px-4 py-3 font-mono text-component">
                    {r.identificacion || "—"}
                  </td>
                  <td className="px-4 py-3 text-component">
                    {[r.telefono, r.email].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-component">
                    {r.cuenta ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...r });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-component hover:text-panda"
                      >
                        Editar
                      </button>
                      <form
                        action={deleteClientAction}
                        onSubmit={(e) => {
                          if (!confirm(`¿Eliminar a ${r.nombre}?`))
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
