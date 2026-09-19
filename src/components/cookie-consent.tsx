"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "bw-cookie-consent";

/**
 * Aviso de cookies. El sitio usa cookies necesarias (sesión de la cuenta y del
 * panel, httpOnly) y Google reCAPTCHA como antiabuso en formularios; no hay
 * cookies de seguimiento ni publicidad. El banner informa y recuerda la
 * elección en localStorage (no en cookies).
 */
export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
    } catch {
      // localStorage no disponible → no mostramos para no molestar.
    }
  }, []);

  function choose(value: "accepted" | "rejected") {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 border border-hairline bg-vanilla p-4 shadow-[0_4px_24px_rgba(0,0,0,0.1)] sm:flex-row sm:items-center sm:gap-6">
        <p className="text-sm leading-relaxed text-panda">
          Usamos cookies{" "}
          <strong className="font-medium">necesarias</strong> para que el sitio
          funcione (como la sesión de tu cuenta) y Google reCAPTCHA para frenar
          el spam en los formularios. No usamos cookies de seguimiento ni de
          publicidad.{" "}
          <Link href="/privacidad" className="text-accent hover:underline">
            Ver detalles
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("rejected")}
            className="rounded-[2px] border border-hairline px-4 py-2 text-sm font-medium text-component transition-colors hover:border-panda hover:text-panda"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="rounded-[2px] bg-panda px-4 py-2 text-sm font-medium uppercase tracking-wide text-vanilla transition-colors hover:bg-accent"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
