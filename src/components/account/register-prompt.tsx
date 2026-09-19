"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Aviso antes de abrir WhatsApp a quien no tiene sesión: con una cuenta se le atiende mejor.
 * Dos salidas: crear cuenta / iniciar sesión (se conserva la selección) o seguir solo por WhatsApp.
 */
export function RegisterPrompt({
  pending,
  onRegister,
  onContinue,
  onClose,
}: {
  /** Enviando la solicitud (al elegir "solo WhatsApp"). */
  pending: boolean;
  /** Guarda la selección para después de crear la cuenta; el enlace navega solo. */
  onRegister: () => void;
  onContinue: () => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const scroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = scroll;
      previous?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-panda/70 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-prompt-title"
        className="w-full max-w-md border border-hairline bg-vanilla p-6 text-panda"
      >
        <h2 id="register-prompt-title" className="text-xl font-extrabold tracking-tight">
          Podemos atenderte mejor con una cuenta
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm text-component">
          <li>• Guardas esta cotización y las que hagas después.</li>
          <li>• Recibes tu cotización formal aquí, y puedes pedir cambios.</li>
          <li>• Sigues tu compra y tus cuentas de cobro en un solo lugar.</li>
        </ul>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/cuenta/registro?next=/cotizador"
            onClick={onRegister}
            className="inline-flex items-center justify-center rounded-[2px] bg-accent px-8 py-4 text-sm font-medium uppercase tracking-wide text-accent-ink transition-colors hover:bg-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Crear cuenta y guardar
          </Link>
          <Button type="button" variant="secondary" size="lg" disabled={pending} onClick={onContinue}>
            {pending ? "Enviando…" : "Solo cotizar por WhatsApp"}
          </Button>
        </div>

        <p className="mt-4 text-center text-xs text-component">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/cuenta/ingresar?next=/cotizador"
            onClick={onRegister}
            className="text-accent underline hover:no-underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>,
    document.body,
  );
}
