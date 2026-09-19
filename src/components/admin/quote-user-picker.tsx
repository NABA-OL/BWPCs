"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { Combobox } from "@/components/admin/combobox";

export interface PickerUser {
  id: string;
  name: string;
  email: string;
}

/** Elige la cuenta de usuario a la que se le muestra la cotización. */
export function QuoteUserPicker({
  users,
  value,
  onChange,
  label = "Cuenta del cliente (opcional)",
  hint = "Si eliges una cuenta, podrás publicarle esta cotización y avisarle por correo.",
  className = "sm:col-span-3",
}: {
  users: PickerUser[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  hint?: string;
  className?: string;
}) {
  const selected = users.find((u) => u.id === value);

  return (
    <div className={className}>
      <span className="text-sm font-medium text-component">{label}</span>
      <p className="mt-0.5 text-xs text-component">{hint}</p>
      <div className="mt-1.5">
        {value && !selected ? (
          <p className="text-sm text-accent">
            La cuenta asignada ya no existe.{" "}
            <button
              type="button"
              onClick={() => onChange("")}
              className="underline hover:no-underline"
            >
              Quitar
            </button>
          </p>
        ) : selected ? (
          <div className="flex flex-wrap items-center gap-3 border border-hairline px-3 py-2.5 text-sm">
            <span className="font-medium">{selected.name}</span>
            <span className="font-mono text-xs text-component">
              {selected.email}
            </span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="ml-auto text-xs text-component underline hover:text-panda hover:no-underline"
            >
              Quitar
            </button>
          </div>
        ) : (
          <Combobox
            groups={[{ label: "Cuentas", items: users }]}
            getId={(u) => u.id}
            searchText={(u) => `${u.name} ${u.email}`}
            placeholder="Buscar cuenta por nombre o correo…"
            onPick={(u) => onChange(u.id)}
            renderItem={(u) => (
              <span className="flex flex-col">
                <span className="font-medium">{u.name}</span>
                <span className="font-mono text-xs text-component">{u.email}</span>
              </span>
            )}
          />
        )}
      </div>
    </div>
  );
}
