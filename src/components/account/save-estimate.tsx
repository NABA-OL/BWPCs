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
import { requestEstimateAction, saveEstimateAction } from "@/lib/leads/actions";
import { stashPendingEstimate, takePendingEstimate } from "@/lib/pending-estimate";
import { authClient } from "@/lib/user-auth/client";

interface AccountContact {
  name: string;
  phone: string;
  email: string;
}

/**
 * Con sesión, "Solicitar cotización" del cotizador: envía la solicitud a B & W con los
 * datos de la cuenta (sin pasar por WhatsApp) y queda en Mis cotizaciones. También
 * entrega los datos de contacto para prellenar el formulario de WhatsApp. Solo se monta si las cuentas están
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
  // Cuenta de Google que aún no da su celular ni acepta los términos: no puede solicitar todavía.
  const incomplete = Boolean(user) && (!user?.phone || user?.acceptTerms !== true);
  useEffect(() => {
    if (user) onUser({ name: user.name, phone: user.phone, email: user.email });
    // Solo al aparecer la sesión, no en cada render del padre.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Vuelve de crear una cuenta o iniciar sesión con una selección pendiente: se guarda en la cuenta.
  const [restored, setRestored] = useState<"saved" | "error" | null>(null);
  useEffect(() => {
    if (!userId || incomplete) return;
    const pendingResumen = takePendingEstimate();
    if (!pendingResumen) return;
    void saveEstimateAction({ resumen: pendingResumen }).then((result) => setRestored(result.ok ? "saved" : "error"));
  }, [userId]);

  // Cambiar la selección deja de ser "lo guardado".
  useEffect(() => setSaved(false), [resumen]);

  if (isPending) return null;

  if (user && incomplete) {
    return (
      <p className="mt-4 text-center text-xs text-vanilla/60">
        <Link href="/cuenta/completar?next=/cotizador" className="underline hover:no-underline">
          Completa tu cuenta
        </Link>{" "}
        (celular y términos) para solicitar tu cotización.
      </p>
    );
  }

  if (!user) {
    // Botón principal del panel: crear cuenta ya deja la cotización guardada (stashPendingEstimate
    // + SaveEstimate la recupera sola al volver, ver el efecto de "restored" más abajo). El avisito
    // de siempre queda debajo, para quien ya tiene cuenta.
    return (
      <div className="mt-6 space-y-3">
        <Link
          href="/cuenta/registro?next=/cotizador"
          onClick={() => !disabled && stashPendingEstimate(resumen)}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : undefined}
          className={`flex w-full items-center justify-center rounded-[2px] px-8 py-4 text-sm font-medium uppercase tracking-wide transition-colors ${
            disabled
              ? "pointer-events-none bg-accent/40 text-accent-ink/70"
              : "bg-accent text-accent-ink hover:bg-accent-deep"
          }`}
        >
          Crear cuenta y guardar
        </Link>
        <p className="text-center text-xs text-vanilla/60">
          <Link
            href="/cuenta/registro?next=/cotizador"
            onClick={() => !disabled && stashPendingEstimate(resumen)}
            className="underline hover:no-underline"
          >
            Crea una cuenta
          </Link>{" "}
          o{" "}
          <Link
            href="/cuenta/ingresar?next=/cotizador"
            onClick={() => !disabled && stashPendingEstimate(resumen)}
            className="underline hover:no-underline"
          >
            inicia sesión
          </Link>{" "}
          para guardar tu cotización.
        </p>
      </div>
    );
  }

  function request() {
    setError(null);
    startTransition(async () => {
      const result = await requestEstimateAction({ resumen });
      if (result.ok) setSaved(true);
      else setError(result.error ?? "No se pudo enviar la solicitud.");
    });
  }

  return (
    <div className="mt-6 space-y-2 text-center">
      {restored === "saved" && (
        <p className="border border-vanilla/20 px-3 py-2 text-xs text-vanilla/80">
          Guardamos en tu cuenta la cotización que estabas armando.{" "}
          <Link href="/cuenta" className="underline hover:no-underline">
            Ver mis cotizaciones
          </Link>
        </p>
      )}
      {restored === "error" && (
        <p className="text-xs text-accent">No pudimos guardar la cotización que armaste antes. Guárdala de nuevo abajo.</p>
      )}
      <button
        type="button"
        onClick={request}
        disabled={disabled || pending || saved}
        className="w-full rounded-[2px] bg-accent px-8 py-4 text-sm font-medium uppercase tracking-wide text-accent-ink transition-colors hover:bg-accent-deep disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "Enviando…" : saved ? "Solicitud enviada" : "Solicitar cotización"}
      </button>
      {saved && (
        <p className="text-xs text-vanilla/60">
          Recibimos tu solicitud y te respondemos por WhatsApp o correo.{" "}
          <Link href="/cuenta" className="underline hover:no-underline">
            Ver mis cotizaciones
          </Link>
        </p>
      )}
      {error && <p className="text-xs text-accent">{error}</p>}
    </div>
  );
}
