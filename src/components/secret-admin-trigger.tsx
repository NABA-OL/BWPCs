"use client";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const HOLD_MS = 5000;

/**
 * Acceso oculto al panel admin: envuelve el texto de derechos reservados.
 * Mantener presionado (mouse o touch) por más de 5s redirige a /admin/login.
 * Diseñado para no estorbar: no hay pista visual, solo una barra de progreso
 * sutil que aparece tras ~1s de presión sostenida.
 */
export function SecretAdminTrigger({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false);

  function start() {
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      router.push("/admin/login");
    }, HOLD_MS);
  }

  function cancel() {
    setHolding(false);
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  return (
    <span
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onContextMenu={(e) => e.preventDefault()}
      className="relative inline-block cursor-default select-none"
    >
      {children}
      {holding && (
        <span
          aria-hidden
          className="absolute -bottom-1 left-0 h-px bg-accent"
          style={{ animation: `bw-hold ${HOLD_MS}ms linear forwards` }}
        />
      )}
      <style>{`@keyframes bw-hold { from { width: 0 } to { width: 100% } }`}</style>
    </span>
  );
}
