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
  saveCuentaCobroAction,
  type CuentaCobroFormState,
} from "@/app/admin/(panel)/cuentas-cobro/actions";
import { Button } from "@/components/ui/button";
import { formatCOP } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/categories";
import {
  computeCuentaCobro,
  type CuentaCobroInput,
  type CuentaCobroItemInput,
} from "@/lib/cuenta-cobro";
import { COMPONENT_CATEGORIES } from "@/lib/db/types";
import type { BankAccount } from "@/lib/db/types";
import type { CatalogOption } from "@/lib/admin/catalog-data";
import { Combobox } from "@/components/admin/combobox";
import { QuoteUserPicker, type PickerUser } from "@/components/admin/quote-user-picker";

export interface ClientOption {
  id: string;
  nombre: string;
  identificacion: string;
  direccion: string;
  telefono: string;
  email: string;
  /** Cuenta de usuario ligada a este cliente ("" = ninguna). */
  userId: string;
}

export interface BankAccountOption {
  id: string;
  banco: string;
  tipoCuenta: BankAccount["tipoCuenta"];
  numero: string | null;
  llave: string | null;
  titular: string;
}

export interface SignerOption {
  id: string;
  usuario: string;
  nombre: string;
  cedula: string;
  firmaBase64: string | null;
}

const emptyItem = () => ({ descripcion: "", cantidad: 1, valorUnitario: 0 });

export function CuentaCobroBuilder({
  id,
  initial,
  clients,
  bankAccounts,
  signers,
  catalog,
  users,
  locked = false,
  pdfHref,
}: {
  id: string;
  initial: CuentaCobroInput;
  users: PickerUser[];
  /** Cuenta ya enviada/pagada/anulada: solo lectura. */
  locked?: boolean;
  clients: ClientOption[];
  bankAccounts: BankAccountOption[];
  signers: SignerOption[];
  catalog: CatalogOption[];
  pdfHref?: string;
}) {
  const [data, setData] = useState<CuentaCobroInput>(initial);
  const [clientChoice, setClientChoice] = useState("otro");
  const [bankChoice, setBankChoice] = useState("otro");
  const [signerChoice, setSignerChoice] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState<
    CuentaCobroFormState,
    FormData
  >(saveCuentaCobroAction, {});

  const totals = useMemo(
    () => computeCuentaCobro(data.items, data.descuentoPct),
    [data.items, data.descuentoPct],
  );

  function setItem(
    ii: number,
    patch: Partial<CuentaCobroInput["items"][number]>,
  ) {
    setData((d) => ({
      ...d,
      items: d.items.map((it, i) => (i === ii ? { ...it, ...patch } : it)),
    }));
  }
  function addItem(item: CuentaCobroItemInput = emptyItem()) {
    setData((d) => ({ ...d, items: [...d.items, item] }));
  }
  function removeItem(ii: number) {
    setData((d) => ({ ...d, items: d.items.filter((_, i) => i !== ii) }));
  }
  function moveItemTo(from: number, to: number) {
    setData((d) => {
      if (to < 0 || to >= d.items.length || from === to) return d;
      const items = [...d.items];
      const [moved] = items.splice(from, 1);
      items.splice(to, 0, moved);
      return { ...d, items };
    });
  }

  function pickClient(clientId: string) {
    setClientChoice(clientId);
    if (clientId === "otro") return;
    const c = clients.find((x) => x.id === clientId);
    if (c) setData((d) => ({ ...d, cliente: { ...c }, userId: c.userId || d.userId }));
  }
  function pickBank(bankId: string) {
    setBankChoice(bankId);
    if (bankId === "otro") return;
    const b = bankAccounts.find((x) => x.id === bankId);
    if (b) setData((d) => ({ ...d, cuentaBanco: { ...b } }));
  }
  function pickSigner(signerId: string) {
    setSignerChoice(signerId);
    const s = signers.find((x) => x.id === signerId);
    if (s)
      setData((d) => ({
        ...d,
        firmante: {
          nombre: s.nombre,
          cedula: s.cedula,
          firmaBase64: s.firmaBase64,
        },
      }));
  }

  const inputCls =
    "mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda";

  return (
    <form action={formAction} className="mt-8 space-y-8">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="payload" value={JSON.stringify(data)} />
      <fieldset disabled={locked} className="contents">

      {/* Encabezado */}
      <section className="grid gap-4 border border-hairline p-6 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-component">Número</span>
          <input
            value={data.numero || "Se asigna al guardar"}
            readOnly
            className={`${inputCls} bg-hairline/30 font-mono text-component`}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-component">Fecha</span>
          <input
            type="date"
            value={data.fecha}
            onChange={(e) => setData({ ...data, fecha: e.target.value })}
            className={`${inputCls} font-mono`}
          />
        </label>
        <QuoteUserPicker
          users={users}
          value={data.userId}
          onChange={(userId) => setData({ ...data, userId })}
          label="Cuenta del cliente en la web (opcional)"
          hint="Si eliges una cuenta, podrás enviarle esta cuenta de cobro y ella podrá verla y avisar su pago."
          className="sm:col-span-2"
        />
      </section>

      {/* Cliente */}
      <section className="border border-hairline p-6">
        <h2 className="text-lg font-semibold">Cliente</h2>
        <select
          value={clientChoice}
          onChange={(e) => pickClient(e.target.value)}
          className={`${inputCls} max-w-sm`}
        >
          <option value="otro">Otro (llenar a mano)</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.identificacion ? `${c.nombre} · ${c.identificacion}` : c.nombre}
            </option>
          ))}
        </select>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Nombre"
            value={data.cliente.nombre}
            onChange={(v) =>
              setData({ ...data, cliente: { ...data.cliente, nombre: v } })
            }
          />
          <Field
            label="Identificación"
            value={data.cliente.identificacion}
            onChange={(v) =>
              setData({
                ...data,
                cliente: { ...data.cliente, identificacion: v },
              })
            }
            mono
          />
          <Field
            label="Dirección"
            value={data.cliente.direccion}
            onChange={(v) =>
              setData({ ...data, cliente: { ...data.cliente, direccion: v } })
            }
          />
          <Field
            label="Teléfono"
            value={data.cliente.telefono}
            onChange={(v) =>
              setData({ ...data, cliente: { ...data.cliente, telefono: v } })
            }
            mono
          />
          <Field
            label="Email"
            value={data.cliente.email}
            onChange={(v) =>
              setData({ ...data, cliente: { ...data.cliente, email: v } })
            }
          />
        </div>
      </section>

      {/* Cuenta bancaria */}
      <section className="border border-hairline p-6">
        <h2 className="text-lg font-semibold">Cuenta bancaria</h2>
        <p className="mt-1 text-sm text-component">
          Llena cuenta normal, llave Bre-B, o ambas — lo que dejes en blanco no
          aparece en el PDF.
        </p>
        <select
          value={bankChoice}
          onChange={(e) => pickBank(e.target.value)}
          className={`${inputCls} max-w-sm`}
        >
          <option value="otro">Otra (llenar a mano)</option>
          {bankAccounts.map((b) => (
            <option key={b.id} value={b.id}>
              {b.banco}
              {b.numero ? ` · ${b.tipoCuenta} ${b.numero}` : ""}
              {b.llave ? ` · Bre-B ${b.llave}` : ""}
            </option>
          ))}
        </select>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Banco"
            value={data.cuentaBanco.banco}
            onChange={(v) =>
              setData({
                ...data,
                cuentaBanco: { ...data.cuentaBanco, banco: v },
              })
            }
          />
          <Field
            label="Titular"
            value={data.cuentaBanco.titular}
            onChange={(v) =>
              setData({
                ...data,
                cuentaBanco: { ...data.cuentaBanco, titular: v },
              })
            }
          />
        </div>

        <div className="mt-5 grid gap-4 border-t border-hairline pt-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-component">
              Tipo de cuenta{" "}
              <span className="text-component/60">(opcional)</span>
            </span>
            <select
              value={data.cuentaBanco.tipoCuenta ?? ""}
              onChange={(e) =>
                setData({
                  ...data,
                  cuentaBanco: {
                    ...data.cuentaBanco,
                    tipoCuenta:
                      (e.target.value as BankAccount["tipoCuenta"]) || null,
                  },
                })
              }
              className={inputCls}
            >
              <option value="">— No aplica —</option>
              <option value="Ahorros">Ahorros</option>
              <option value="Corriente">Corriente</option>
            </select>
          </label>
          <Field
            label="Número de cuenta (opcional)"
            value={data.cuentaBanco.numero ?? ""}
            onChange={(v) =>
              setData({
                ...data,
                cuentaBanco: { ...data.cuentaBanco, numero: v },
              })
            }
            mono
          />
          <Field
            label="Llave Bre-B (opcional)"
            value={data.cuentaBanco.llave ?? ""}
            onChange={(v) =>
              setData({
                ...data,
                cuentaBanco: { ...data.cuentaBanco, llave: v },
              })
            }
            mono
          />
        </div>
      </section>

      {/* Firmante */}
      <section className="border border-hairline p-6">
        <h2 className="text-lg font-semibold">Firmante</h2>
        <select
          value={signerChoice}
          onChange={(e) => pickSigner(e.target.value)}
          className={`${inputCls} max-w-sm`}
        >
          <option value="">Selecciona un administrador…</option>
          {signers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
              {!s.firmaBase64 ? " (sin firma cargada)" : ""}
            </option>
          ))}
        </select>
        {data.firmante.nombre && (
          <p className="mt-3 text-sm text-component">
            Firma: <span className="font-mono">{data.firmante.nombre}</span> ·
            C.C.{" "}
            <span className="font-mono">{data.firmante.cedula || "—"}</span>
            {!data.firmante.firmaBase64 && (
              <span className="ml-2 text-accent">
                Este admin no tiene firma cargada (Usuarios → Mi perfil).
              </span>
            )}
          </p>
        )}
        {signerChoice &&
          signers.find((s) => s.id === signerChoice)?.nombre ===
            signers.find((s) => s.id === signerChoice)?.usuario && (
            <p className="mt-1 text-sm text-accent">
              Este admin no tiene nombre completo cargado — está saliendo el
              usuario de acceso (Usuarios → Mi perfil).
            </p>
          )}
      </section>

      {/* Ítems */}
      <section className="border border-hairline p-6">
        <h2 className="text-lg font-semibold">Ítems</h2>
        <div className="mt-4 space-y-3">
          {data.items.map((item, ii) => (
            <div
              key={ii}
              onDragOver={(e) => {
                if (dragIndex !== null) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) moveItemTo(dragIndex, ii);
                setDragIndex(null);
              }}
              className={`grid items-start gap-2 sm:grid-cols-[auto_1fr_100px_160px_auto] ${
                dragIndex === ii ? "opacity-40" : ""
              }`}
            >
              <button
                type="button"
                draggable
                onDragStart={(e) => {
                  setDragIndex(ii);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => setDragIndex(null)}
                aria-label="Arrastrar para reordenar"
                className="cursor-grab touch-none self-stretch px-1.5 py-2 text-component hover:text-panda active:cursor-grabbing"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <line x1="1" y1="3" x2="13" y2="3" />
                  <line x1="1" y1="7" x2="13" y2="7" />
                  <line x1="1" y1="11" x2="13" y2="11" />
                </svg>
              </button>
              <input
                value={item.descripcion}
                onChange={(e) => setItem(ii, { descripcion: e.target.value })}
                placeholder="Descripción del servicio"
                className="border border-hairline bg-vanilla px-2 py-2 text-sm outline-none focus:border-panda"
              />
              <input
                value={item.cantidad || ""}
                onChange={(e) =>
                  setItem(ii, {
                    cantidad: Math.max(
                      0,
                      Math.round(Number(e.target.value) || 0),
                    ),
                  })
                }
                inputMode="numeric"
                placeholder="Cant."
                className="border border-hairline bg-vanilla px-2 py-2 font-mono text-sm outline-none focus:border-panda"
              />
              <input
                value={item.valorUnitario || ""}
                onChange={(e) =>
                  setItem(ii, {
                    valorUnitario: Math.max(
                      0,
                      Math.round(
                        Number(e.target.value.replace(/\D/g, "")) || 0,
                      ),
                    ),
                  })
                }
                inputMode="numeric"
                placeholder="Valor unitario"
                className="border border-hairline bg-vanilla px-2 py-2 font-mono text-sm outline-none focus:border-panda"
              />
              <button
                type="button"
                onClick={() => removeItem(ii)}
                disabled={data.items.length <= 1}
                aria-label="Quitar ítem"
                className="px-2 py-2 text-component hover:text-accent disabled:opacity-30"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => addItem()}
            className="text-sm text-component hover:text-panda"
          >
            + Línea manual
          </button>
          <CatalogPicker catalog={catalog} onPick={addItem} />
        </div>

        {/* Descuento + totales */}
        <div className="mt-5 grid gap-4 border-t border-hairline pt-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-component">
              Descuento (%)
            </span>
            <input
              value={data.descuentoPct || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  descuentoPct: Math.min(
                    100,
                    Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0),
                  ),
                })
              }
              inputMode="numeric"
              placeholder="0"
              className={`${inputCls} font-mono`}
            />
          </label>
          <dl className="space-y-1 text-sm sm:text-right">
            <div className="flex justify-between sm:justify-end sm:gap-6">
              <dt className="text-component">Subtotal</dt>
              <dd className="font-mono">{formatCOP(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between sm:justify-end sm:gap-6">
              <dt className="text-component">Descuento</dt>
              <dd className="font-mono">-{formatCOP(totals.descuentoValor)}</dd>
            </div>
            <div className="flex justify-between font-semibold sm:justify-end sm:gap-6">
              <dt>Total</dt>
              <dd className="font-mono">{formatCOP(totals.total)}</dd>
            </div>
          </dl>
        </div>
      </section>

      </fieldset>

      {/* Acciones */}
      <div className="flex flex-wrap items-center gap-4 border-t border-hairline pt-6">
        {!locked && (
          <Button type="submit" size="lg" disabled={pending}>
            {pending
              ? "Guardando…"
              : id
                ? "Guardar cambios"
                : "Crear cuenta de cobro"}
          </Button>
        )}
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
          href="/admin/cuentas-cobro"
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

function CatalogPicker({
  catalog,
  onPick,
}: {
  catalog: CatalogOption[];
  onPick: (item: CuentaCobroItemInput) => void;
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
          descripcion: c.descripcion ? `${c.modelo} — ${c.descripcion}` : c.modelo,
          cantidad: 1,
          valorUnitario: c.precioCop,
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
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-component">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda ${
          mono ? "font-mono" : ""
        }`}
      />
    </label>
  );
}
