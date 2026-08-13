"use client";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveBankAccountAction,
  deleteBankAccountAction,
  type BankAccountFormState,
} from "@/app/admin/(panel)/cuentas-bancarias/actions";
import { Button } from "@/components/ui/button";
import type { BankAccount } from "@/lib/db/types";

export interface BankAccountRow {
  id: string;
  banco: string;
  tipoCuenta: BankAccount["tipoCuenta"];
  numero: string | null;
  llave: string | null;
  titular: string;
}

const EMPTY = {
  id: "",
  banco: "",
  titular: "",
  tieneCuenta: true,
  tipoCuenta: "Ahorros" as NonNullable<BankAccount["tipoCuenta"]>,
  numero: "",
  tieneBreB: false,
  llave: "",
};

export function BankAccountManager({ rows }: { rows: BankAccountRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [state, formAction, pending] = useActionState<
    BankAccountFormState,
    FormData
  >(saveBankAccountAction, {});

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
          {editing ? "Editar cuenta bancaria" : "Agregar cuenta bancaria"}
        </h2>
        <input type="hidden" name="id" value={form.id} />
        <input
          type="hidden"
          name="tieneCuenta"
          value={String(form.tieneCuenta)}
        />
        <input type="hidden" name="tieneBreB" value={String(form.tieneBreB)} />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-component">Banco</span>
            <input
              name="banco"
              required
              value={form.banco}
              onChange={(e) => setForm({ ...form, banco: e.target.value })}
              placeholder="Bancolombia"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-component">Titular</span>
            <input
              name="titular"
              required
              value={form.titular}
              onChange={(e) => setForm({ ...form, titular: e.target.value })}
              className={inputCls}
            />
          </label>
        </div>

        {/* Cuenta bancaria normal */}
        <div className="mt-5 border-t border-hairline pt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-component">
            <input
              type="checkbox"
              checked={form.tieneCuenta}
              onChange={(e) =>
                setForm({ ...form, tieneCuenta: e.target.checked })
              }
            />
            Tiene cuenta bancaria (transferencia normal)
          </label>
          {form.tieneCuenta && (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-component">
                  Tipo de cuenta
                </span>
                <select
                  name="tipoCuenta"
                  value={form.tipoCuenta}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tipoCuenta: e.target.value as NonNullable<
                        BankAccount["tipoCuenta"]
                      >,
                    })
                  }
                  className={inputCls}
                >
                  <option value="Ahorros">Ahorros</option>
                  <option value="Corriente">Corriente</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-component">
                  Número de cuenta
                </span>
                <input
                  name="numero"
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  className={`${inputCls} font-mono`}
                />
              </label>
            </div>
          )}
        </div>

        {/* Llave Bre-B */}
        <div className="mt-5 border-t border-hairline pt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-component">
            <input
              type="checkbox"
              checked={form.tieneBreB}
              onChange={(e) =>
                setForm({ ...form, tieneBreB: e.target.checked })
              }
            />
            Tiene llave Bre-B (transferencia inmediata interbancaria)
          </label>
          {form.tieneBreB && (
            <label className="mt-3 block">
              <span className="text-sm font-medium text-component">
                Llave{" "}
                <span className="text-component/60">
                  (celular, email, cédula o llave alfanumérica)
                </span>
              </span>
              <input
                name="llave"
                value={form.llave}
                onChange={(e) => setForm({ ...form, llave: e.target.value })}
                className={`${inputCls} font-mono`}
              />
            </label>
          )}
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
          No hay cuentas bancarias. Agrega la primera arriba.
        </p>
      ) : (
        <div className="overflow-x-auto border border-hairline">
          <table className="w-full text-sm">
            <thead className="border-b border-hairline bg-hairline/30 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Banco</th>
                <th className="px-4 py-3 font-medium">Cuenta</th>
                <th className="px-4 py-3 font-medium">Bre-B</th>
                <th className="px-4 py-3 font-medium">Titular</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-hairline last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{r.banco}</td>
                  <td className="px-4 py-3 font-mono text-component">
                    {r.numero ? `${r.tipoCuenta} · ${r.numero}` : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-component">
                    {r.llave || "—"}
                  </td>
                  <td className="px-4 py-3 text-component">{r.titular}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            id: r.id,
                            banco: r.banco,
                            titular: r.titular,
                            tieneCuenta: Boolean(r.numero),
                            tipoCuenta: r.tipoCuenta ?? "Ahorros",
                            numero: r.numero ?? "",
                            tieneBreB: Boolean(r.llave),
                            llave: r.llave ?? "",
                          });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-component hover:text-panda"
                      >
                        Editar
                      </button>
                      <form
                        action={deleteBankAccountAction}
                        onSubmit={(e) => {
                          if (!confirm(`¿Eliminar la cuenta de ${r.banco}?`))
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
