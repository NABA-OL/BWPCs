"use client";

import { useActionState } from "react";
import {
  saveSettingsAction,
  type SettingsState,
} from "@/app/admin/(panel)/configuracion/actions";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format";

interface InitialSettings {
  trmScrapeado: number;
  trmManual: number | null;
  trmRecargo: number;
  envioCPU: number;
  envioGPU: number;
  servicioBase: number;
  tarjetaPct: number; // ya en porcentaje (6)
  psePct: number; // (3)
  whatsapp: string;
  email: string;
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
      {hint && <span className="mt-1 block text-xs text-component">{hint}</span>}
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

  const trmEfectivo =
    (initial.trmManual ?? initial.trmScrapeado) + initial.trmRecargo;

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <Section title="TRM y envíos">
        <Field
          label="TRM manual (override)"
          name="trmManual"
          defaultValue={initial.trmManual ?? ""}
          placeholder="vacío = usar automático"
          hint="Déjalo vacío para usar el TRM automático (cron)."
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
          label="Recargo PSE / Bre-B (%)"
          name="psePct"
          defaultValue={initial.psePct}
          hint="Ej: 3"
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

      <div className="flex items-center gap-4">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </Button>
        {state.ok && (
          <span className="text-sm text-accent">Cambios guardados ✓</span>
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
