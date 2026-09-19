"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startCardPaymentAction } from "@/app/(public)/cuenta/(area)/cuentas-cobro/[id]/actions";
import { formatCOP } from "@/lib/format";

/** Botón "Pagar con tarjeta": crea el enlace de Bold y lleva al cliente a su checkout seguro. */
export function CardPayButton({ id, total }: { id: string; total: number }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function pay() {
    setError(null);
    setPending(true);
    const result = await startCardPaymentAction(id);
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }
    window.location.assign(result.url); // sigue "pendiente" mientras carga el checkout
  }

  return (
    <div className="mt-3 space-y-3">
      <Button type="button" disabled={pending} onClick={() => void pay()}>
        {pending ? "Abriendo el pago…" : `Pagar con tarjeta · ${formatCOP(total)}`}
      </Button>
      <p className="text-xs text-component">
        Pagas en Bold, una pasarela de pagos segura. B &amp; W no ve ni guarda los datos de tu tarjeta; cuando el pago se
        aprueba, esta cuenta queda pagada sola.
      </p>
      {error && (
        <p role="alert" className="border border-accent/30 bg-accent/5 px-3 py-2 text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

/** Mientras Bold confirma el pago, vuelve a cargar la página cada pocos segundos (máx. 1 minuto). */
export function RefreshWhilePending() {
  const router = useRouter();
  useEffect(() => {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      router.refresh();
      if (tries >= 15) clearInterval(timer);
    }, 4000);
    return () => clearInterval(timer);
  }, [router]);
  return null;
}
