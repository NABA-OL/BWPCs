"use client";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 */

import { useState } from "react";

/** Comparte la URL actual (Web Share API en móvil) o la copia al portapapeles. */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // usuario canceló el share nativo — no hacer nada
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-sm text-component transition-colors hover:text-panda"
    >
      <svg
        width="15" height="15" viewBox="0 0 16 16" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      >
        <circle cx="12.5" cy="3.5" r="2" />
        <circle cx="3.5" cy="8" r="2" />
        <circle cx="12.5" cy="12.5" r="2" />
        <line x1="5.3" y1="7" x2="10.8" y2="4.2" />
        <line x1="5.3" y1="9" x2="10.8" y2="11.8" />
      </svg>
      {copied ? "Enlace copiado" : "Compartir"}
    </button>
  );
}
