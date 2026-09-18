"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { saveEstimateAction } from "@/lib/leads/actions";
import { authClient } from "@/lib/user-auth/client";

interface AccountContact {
  name: string;
  phone: string;
  email: string;
}

/**
 * "Guardar en mi cuenta" del cotizador. Con sesión también entrega los datos
 * de contacto para prellenar el formulario. Solo se monta si las cuentas están
 * activas; la sesión se lee en el navegador para que /cotizador siga estático.
 */
export function SaveEstimate({
  resumen,
  disabled,
  onUser,
}: {
  resumen: string;
  disabled: boolean;
  onUser: (contact: AccountContact) => void;
}) {
  const { data, isPending } = authClient.useSession();
  const user = data?.user;
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const userId = user?.id;
  useEffect(() => {
    if (user) onUser({ name: user.name, phone: user.phone, email: user.email });
    // Solo al aparecer la sesión, no en cada render del padre.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Cambiar la selección deja de ser "lo guardado".
  useEffect(() => setSaved(false), [resumen]);

  if (isPending) return null;

  if (!user) {
    return (
      <p className="mt-4 text-center text-xs text-vanilla/60">
        <Link
          href="/cuenta/ingresar?next=/cotizador"
          className="underline hover:no-underline"
        >
          Inicia sesión
        </Link>{" "}
        para guardar esta cotización en tu cuenta.
      </p>
    );
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveEstimateAction({ resumen });
      if (result.ok) setSaved(true);
      else setError(result.error ?? "No se pudo guardar.");
    });
  }

  return (
    <div className="mt-4 space-y-2 text-center">
      <button
        type="button"
        onClick={save}
        disabled={disabled || pending || saved}
        className="w-full rounded-[2px] border border-vanilla/40 px-6 py-3 text-sm font-medium uppercase tracking-wide text-vanilla transition-colors hover:bg-vanilla hover:text-panda disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "Guardando…" : saved ? "Guardada en tu cuenta" : "Guardar en mi cuenta"}
      </button>
      {saved && (
        <p className="text-xs text-vanilla/60">
          <Link href="/cuenta/cotizaciones" className="underline hover:no-underline">
            Ver mis cotizaciones
          </Link>
        </p>
      )}
      {error && <p className="text-xs text-accent">{error}</p>}
    </div>
  );
}
