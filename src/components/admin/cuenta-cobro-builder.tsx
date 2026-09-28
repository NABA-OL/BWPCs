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
  withPaymentMethod,
  type CuentaCobroInput,
  type CuentaCobroItemInput,
} from "@/lib/cuenta-cobro";
import { COMPONENT_CATEGORIES } from "@/lib/db/types";
import { CARD_MAX_COP, OFFERED_PAYMENT_METHODS, PAYMENT_LABEL, cardIsManual, surchargeConcept } from "@/lib/payment-methods";
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
  tarjetaPct,
  boldEnabled,
  locked = false,
  pdfHref,
}: {
  id: string;
  initial: CuentaCobroInput;
  users: PickerUser[];
  /** Recargo de la tarjeta (fracción, p. ej. 0.06). */
  tarjetaPct: number;
  /** Bold está configurado: la tarjeta hasta el tope se cobra sola. */
  boldEnabled: boolean;
  /** Cuenta ya enviada/pagada/anulada: solo lectura. */
  locked?: boolean;
  clients: ClientOption[];
  bankAccounts: BankAccountOption[];
  signers: SignerOption[];
  catalog: CatalogOption[];
  pdfHref?: string;
}) {
  // Cliente: si el documento ya trae uno, se busca entre los guardados (misma cuenta web o mismos datos).
  // Si coincide, se abre seleccionado y con los datos ACTUALES del cliente guardado; si no, en "Otro".
  const matchedClient = (() => {
    const c = initial.cliente;
    if (!c.nombre && !c.identificacion && !c.email) return null;
    return (
      clients.find((x) => initial.userId !== "" && x.userId === initial.userId) ??
      clients.find((x) => x.nombre === c.nombre && x.identificacion === c.identificacion && x.email === c.email) ??
      null
    );
  })();
  const [data, setData] = useState<CuentaCobroInput>(() =>
    matchedClient && !locked
      ? {
          ...initial,
          cliente: {
            nombre: matchedClient.nombre,
            identificacion: matchedClient.identificacion,
            direccion: matchedClient.direccion,
            telefono: matchedClient.telefono,
            email: matchedClient.email,
          },
        }
      : initial,
  );
  // "" = aún sin elegir (no se muestran los campos), "otro" = a mano (editables) o el id de un cliente
  // guardado (campos bloqueados).
  const [clientChoice, setClientChoice] = useState(() => {
    const c = initial.cliente;
    if (!c.nombre && !c.identificacion && !c.email) return "";
    return matchedClient ? matchedClient.id : "otro";
  });
  // Cuenta bancaria: "" = aún sin elegir (no se muestran los campos), "otro" = a mano (campos editables) o el id
  // de una cuenta guardada (campos bloqueados). Si el documento ya trae datos, se parte de la guardada que
  // coincida (bloqueada) o, si no hay, de "a mano".
  const [bankChoice, setBankChoice] = useState(() => {
    const b = initial.cuentaBanco;
    if (!b.banco && !b.numero && !b.llave) return "";
    const same = bankAccounts.find(
      (x) => x.banco === b.banco && (x.numero ?? "") === (b.numero ?? "") && (x.llave ?? "") === (b.llave ?? "") && x.titular === b.titular,
    );
    return same ? same.id : "otro";
  });
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

  // Medio de pago: cambia el total (la tarjeta lleva recargo) y qué se muestra abajo: cuenta bancaria o enlace de pago.
  const cardChosen = data.formaPago === "tarjeta";
  function changeMethod(formaPago: string) {
    setData((d) => {
      const method = formaPago === "tarjeta" ? "tarjeta" : "";
      const next = withPaymentMethod(
        d.items,
        d.descuentoPct,
        method === "tarjeta" ? tarjetaPct : 0,
        surchargeConcept("tarjeta"),
      );
      return { ...d, formaPago, items: next.items };
    });
  }

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
    if (clientId === "otro") {
      // A mano: campos vacíos para llenar (la cuenta web ligada no se toca).
      setData((d) => ({ ...d, cliente: { nombre: "", identificacion: "", direccion: "", telefono: "", email: "" } }));
      return;
    }
    const c = clients.find((x) => x.id === clientId);
    if (c) {
      setData((d) => ({
        ...d,
        cliente: { nombre: c.nombre, identificacion: c.identificacion, direccion: c.direccion, telefono: c.telefono, email: c.email },
        userId: c.userId || d.userId,
      }));
    }
  }
  const clientLocked = clientChoice !== "" && clientChoice !== "otro";
  // Si el cliente guardado no tiene cédula/NIT, se puede escribir aquí (se le completa al guardar la cuenta).
  const savedClientNoId = clientLocked && (clients.find((x) => x.id === clientChoice)?.identificacion ?? "") === "";
  function pickBank(bankId: string) {
    setBankChoice(bankId);
    if (bankId === "otro") {
      // A mano: campos vacíos para llenar.
      setData((d) => ({ ...d, cuentaBanco: { banco: "", tipoCuenta: null, numero: "", llave: "", titular: "" } }));
      return;
    }
    const b = bankAccounts.find((x) => x.id === bankId);
    if (b) setData((d) => ({ ...d, cuentaBanco: { banco: b.banco, tipoCuenta: b.tipoCuenta, numero: b.numero, llave: b.llave, titular: b.titular } }));
  }
  const bankLocked = bankChoice !== "" && bankChoice !== "otro";
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
          {!id && (
            <span className="mt-1 block text-xs text-component">
              Automático: se confirma al guardar (si otra cuenta se crea antes, toma el siguiente).
            </span>
          )}
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
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-component">Medio de pago</span>
          <select
            value={data.formaPago}
            onChange={(e) => changeMethod(e.target.value)}
            className={`${inputCls} max-w-sm`}
          >
            <option value="">Sin definir (lo elige el cliente)</option>
            {OFFERED_PAYMENT_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
            {data.formaPago !== "" && !OFFERED_PAYMENT_METHODS.some((m) => m.id === data.formaPago) && (
              <option value={data.formaPago}>{PAYMENT_LABEL[data.formaPago as keyof typeof PAYMENT_LABEL] ?? data.formaPago}</option>
            )}
          </select>
          <span className="mt-1 block text-xs text-component">
            Con tarjeta el total lleva recargo y en lugar de la cuenta bancaria se pide un enlace de pago.
          </span>
        </label>
      </section>

      {/* Cliente */}
      <section className="border border-hairline p-6">
        <h2 className="text-lg font-semibold">Cliente</h2>
        <select
          value={clientChoice}
          onChange={(e) => pickClient(e.target.value)}
          className={`${inputCls} max-w-sm`}
        >
          {clientChoice === "" && <option value="">Selecciona un cliente…</option>}
          <option value="otro">Otro (llenar a mano)</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.identificacion ? `${c.nombre} · ${c.identificacion}` : c.nombre}
            </option>
          ))}
        </select>
        {clientChoice !== "" && (
          <>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            disabled={clientLocked}
            label="Nombre"
            value={data.cliente.nombre}
            onChange={(v) =>
              setData({ ...data, cliente: { ...data.cliente, nombre: v } })
            }
          />
          <Field
            disabled={clientLocked && !savedClientNoId}
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
            disabled={clientLocked}
            label="Dirección"
            value={data.cliente.direccion}
            onChange={(v) =>
              setData({ ...data, cliente: { ...data.cliente, direccion: v } })
            }
          />
          <Field
            disabled={clientLocked}
            label="Teléfono"
            value={data.cliente.telefono}
            onChange={(v) =>
              setData({ ...data, cliente: { ...data.cliente, telefono: v } })
            }
            mono
          />
          <Field
            disabled={clientLocked}
            label="Email"
            value={data.cliente.email}
            onChange={(v) =>
              setData({ ...data, cliente: { ...data.cliente, email: v } })
            }
          />
        </div>
            {savedClientNoId && (
              <p className="text-xs text-component sm:col-span-2">
                Este cliente no tiene cédula o NIT guardado: escríbelo aquí y se le guarda también en Clientes.
              </p>
            )}
          </>
        )}
      </section>

      {cardChosen ? (
        <section className="border border-hairline p-6">
          <h2 className="text-lg font-semibold">Pago con tarjeta</h2>
          {cardIsManual(totals.total, boldEnabled) ? (
            <>
              <p className="mt-1 text-sm text-component">
                {boldEnabled && totals.total > CARD_MAX_COP
                  ? "Este valor pasa el tope de Bold para cobrar solo. "
                  : ""}
                Crea el enlace de pago en Bold por{" "}
                <strong className="font-mono text-panda">{formatCOP(totals.total)}</strong> y pégalo aquí. El cliente paga
                allá y sube el comprobante.
              </p>
              <label className="mt-4 block max-w-2xl">
                <span className="text-sm font-medium text-component">Enlace de pago (Bold)</span>
                <input
                  type="url"
                  value={data.enlacePagoTarjeta}
                  onChange={(e) => setData({ ...data, enlacePagoTarjeta: e.target.value })}
                  placeholder="https://checkout.bold.co/payment/LNK_…"
                  className={`${inputCls} font-mono text-sm`}
                />
              </label>
            </>
          ) : (
            <p className="mt-1 text-sm text-component">
              Este valor se cobra solo con Bold (hasta $5.000.000): no hace falta cuenta bancaria ni enlace. El cliente ve el
              botón de pago en su cuenta.
            </p>
          )}
        </section>
      ) : (
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
          {bankChoice === "" && <option value="">Selecciona una cuenta…</option>}
          <option value="otro">Otra (llenar a mano)</option>
          {bankAccounts.map((b) => (
            <option key={b.id} value={b.id}>
              {b.banco}
              {b.numero ? ` · ${b.tipoCuenta} ${b.numero}` : ""}
              {b.llave ? ` · Bre-B ${b.llave}` : ""}
            </option>
          ))}
        </select>

        {bankChoice !== "" && (
          <>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            disabled={bankLocked}
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
            disabled={bankLocked}
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
              disabled={bankLocked}
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
            disabled={bankLocked}
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
            disabled={bankLocked}
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
          </>
        )}
      </section>
      )}

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
      searchText={(c) => `${c.marca} ${c.modelo} ${c.descripcion}`}
      placeholder="+ Desde catálogo…"
      onPick={(c) => {
        const nombre = c.marca ? `${c.marca} · ${c.modelo}` : c.modelo;
        onPick({
          descripcion: c.descripcion ? `${nombre} — ${c.descripcion}` : nombre,
          cantidad: 1,
          valorUnitario: c.precioCop,
        });
      }}
      renderItem={(c) => (
        <>
          {c.marca ? `${c.marca} · ${c.modelo}` : c.modelo}
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
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-component">{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 outline-none focus:border-panda disabled:bg-hairline/30 disabled:text-component ${
          mono ? "font-mono" : ""
        }`}
      />
    </label>
  );
}
