"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useActionState, useState } from "react";
import {
  saveSettingsAction,
  type SettingsState,
} from "@/app/admin/(panel)/configuracion/actions";
import { Button } from "@/components/ui/button";
import { CATALOG_CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import type { ComponentCategory } from "@/lib/db/types";
import { formatNumber } from "@/lib/format";

interface InitialSettings {
  trmScrapeado: number;
  trmManual: number | null;
  trmRecargo: number;
  envioCPU: number;
  envioGPU: number;
  envioComponentes: Partial<Record<ComponentCategory, number>>;
  servicioBase: number;
  tarjetaPct: number; // ya en porcentaje (6)
  psePct: number; // (3)
  breBPct: number; // (0 — Bre-B no cobra)
  whatsapp: string;
  email: string;
  wordmarkPhrases: { left: string; right: string }[];
  firmanteDefaultId: string;
  bancoDefaultId: string;
  /** Admins y cuentas bancarias entre las que elegir los predeterminados de las cuentas de cobro automáticas. */
  firmantes: { id: string; label: string }[];
  bancos: { id: string; label: string }[];
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: { id: string; label: string }[];
  hint: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-component">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 text-panda outline-none focus:border-panda"
      >
        <option value="">Automático</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="mt-1 block text-xs text-component">{hint}</span>
    </label>
  );
}

function Field({
  label,
  name,
  defaultValue,
  hint,
  mono = true,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  hint?: string;
  mono?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-component">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`mt-1.5 w-full border border-hairline bg-vanilla px-3 py-2.5 text-panda outline-none focus:border-panda ${
          mono ? "font-mono" : ""
        }`}
      />
      {hint && (
        <span className="mt-1 block text-xs text-component">{hint}</span>
      )}
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-hairline p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function SettingsForm({ initial }: { initial: InitialSettings }) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    saveSettingsAction,
    {},
  );
  const [phrases, setPhrases] = useState(
    initial.wordmarkPhrases.length > 0
      ? initial.wordmarkPhrases
      : [{ left: "Build", right: "Wire" }],
  );

  const trmEfectivo =
    (initial.trmManual ?? initial.trmScrapeado) + initial.trmRecargo;

  function setPhrase(i: number, key: "left" | "right", value: string) {
    setPhrases((p) => p.map((x, j) => (j === i ? { ...x, [key]: value } : x)));
  }

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <Section title="TRM y envíos">
        <Field
          label="TRM manual (override)"
          name="trmManual"
          defaultValue={initial.trmManual ?? ""}
          placeholder="vacío = usar automático"
          hint="Vacío = usar el TRM oficial (Superfinanciera, automático)."
        />
        <Field
          label="Recargo TRM"
          name="trmRecargo"
          defaultValue={initial.trmRecargo}
          hint="Se suma al TRM base (148)."
        />
        <Field
          label="Envío CPU (COP)"
          name="envioCPU"
          defaultValue={initial.envioCPU}
          hint="Casillero, procesadores."
        />
        <Field
          label="Envío GPU (COP)"
          name="envioGPU"
          defaultValue={initial.envioGPU}
          hint="Casillero, gráficas."
        />
        <div className="sm:col-span-2 border-t border-hairline pt-4">
          <p className="text-sm font-medium text-component">
            Envío por categoría de componente (COP)
          </p>
          <p className="mt-1 text-sm text-component/70">
            Se suma al precio de cada componente del catálogo guardado en USD
            (después de convertir con el TRM). Vacío o 0 = sin envío. No aplica
            a precios guardados en COP.
          </p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {CATALOG_CATEGORIES.map((categoria) => (
              <Field
                key={categoria}
                label={`Envío ${CATEGORY_LABELS[categoria]}`}
                name={`envio_${categoria}`}
                defaultValue={initial.envioComponentes[categoria] ?? ""}
                placeholder="0"
              />
            ))}
          </div>
        </div>
        <div className="sm:col-span-2 border-t border-hairline pt-4 text-sm text-component">
          TRM automático actual:{" "}
          <span className="font-mono text-panda">
            {initial.trmScrapeado > 0
              ? formatNumber(initial.trmScrapeado)
              : "sin dato"}
          </span>{" "}
          · TRM efectivo:{" "}
          <span className="font-mono text-panda">
            {trmEfectivo > 0 ? formatNumber(trmEfectivo) : "—"}
          </span>
        </div>
      </Section>

      <Section title="Servicio y medios de pago">
        <Field
          label="Servicio base (COP)"
          name="servicioBase"
          defaultValue={initial.servicioBase}
          hint="Valor por defecto del ensamble."
        />
        <div />
        <Field
          label="Recargo tarjeta (%)"
          name="tarjetaPct"
          defaultValue={initial.tarjetaPct}
          hint="Ej: 6"
        />
        <Field
          label="Recargo PSE (%)"
          name="psePct"
          defaultValue={initial.psePct}
          hint="Ej: 3"
        />
        <Field
          label="Recargo Bre-B (%)"
          name="breBPct"
          defaultValue={initial.breBPct}
          hint="Bre-B no cobra comisión → 0 (también Daviplata)."
        />
      </Section>

      <Section title="Cuentas de cobro automáticas">
        <SelectField
          label="Firmante predeterminado"
          name="firmanteDefaultId"
          defaultValue={initial.firmanteDefaultId}
          options={initial.firmantes}
          hint="Firma las cuentas de cobro que se generan solas al pedir el cliente la compra. Automático = el primero con firma cargada."
        />
        <SelectField
          label="Cuenta bancaria predeterminada"
          name="bancoDefaultId"
          defaultValue={initial.bancoDefaultId}
          options={initial.bancos}
          hint="Se usa si sirve para el medio de pago (Bre-B necesita llave). Automático = la que calce con el medio."
        />
      </Section>

      <Section title="Contacto">
        <Field
          label="WhatsApp"
          name="whatsapp"
          defaultValue={initial.whatsapp}
          hint="Formato internacional, ej: +573188422533"
        />
        <Field
          label="Correo"
          name="email"
          type="email"
          mono={false}
          defaultValue={initial.email}
        />
      </Section>

      {/* Frases del wordmark "B & W" → "Build & Wire", "Bits & Watts"… */}
      <section className="border border-hairline p-6">
        <h2 className="text-lg font-semibold">
          Animación del logo (B &amp; W)
        </h2>
        <p className="mt-1 text-sm text-component">
          Frases que el logo revela y rota. La 1.ª palabra debe empezar con{" "}
          <strong>B</strong> y la 2.ª con <strong>W</strong> (el logo en reposo
          siempre dice &quot;B &amp; W&quot;).
        </p>

        <div className="mt-4 space-y-3">
          {phrases.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                aria-label={`Frase ${i + 1}: primera palabra (B…)`}
                value={p.left}
                onChange={(e) => setPhrase(i, "left", e.target.value)}
                placeholder="Build"
                className="w-full border border-hairline bg-vanilla px-3 py-2 outline-none focus:border-panda"
              />
              <span className="text-component">&amp;</span>
              <input
                aria-label={`Frase ${i + 1}: segunda palabra (W…)`}
                value={p.right}
                onChange={(e) => setPhrase(i, "right", e.target.value)}
                placeholder="Wire"
                className="w-full border border-hairline bg-vanilla px-3 py-2 outline-none focus:border-panda"
              />
              <button
                type="button"
                aria-label="Quitar frase"
                disabled={phrases.length <= 1}
                onClick={() =>
                  setPhrases((prev) => prev.filter((_, j) => j !== i))
                }
                className="px-2 py-2 text-component hover:text-accent disabled:pointer-events-none disabled:opacity-30"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setPhrases((prev) => [...prev, { left: "B", right: "W" }])
          }
          className="mt-3 text-sm text-accent hover:underline"
        >
          + Agregar frase
        </button>

        <input
          type="hidden"
          name="wordmarkPhrases"
          value={JSON.stringify(phrases)}
        />
      </section>

      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </Button>
        {state.ok && (
          <span role="status" className="text-sm text-component">
            Cambios guardados ✓
          </span>
        )}
        {state.error && (
          <span role="alert" className="text-sm text-accent">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
