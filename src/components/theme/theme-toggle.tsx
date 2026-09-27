"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-27
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useSyncExternalStore } from "react";
import { applyTheme, readStoredTheme, THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "@/lib/theme";

/** ¿Está oscuro ahora mismo? Se deriva del atributo real en `<html>`, no de un estado propio. */
function getIsDark(): boolean {
  return document.documentElement.getAttribute(THEME_ATTRIBUTE) === "dark";
}

/**
 * Se suscribe a cambios del atributo de tema (lo puede cambiar este botón, otra
 * pestaña vía `ThemeSync`, o una navegación bloqueada). `getServerSnapshot` es
 * siempre `false`: el servidor no sabe la preferencia, así que el botón nace en
 * claro y se corrige apenas monta, sin desajuste de hidratación.
 */
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [THEME_ATTRIBUTE] });
  return () => observer.disconnect();
}

/** Deja las transiciones quietas mientras cambian los colores, para que no se vea el fondo animando de golpe. */
function withoutTransitions(run: () => void) {
  const root = document.documentElement;
  root.setAttribute("data-theme-switching", "");
  run();
  requestAnimationFrame(() => requestAnimationFrame(() => root.removeAttribute("data-theme-switching")));
}

/**
 * Botón del pie de página que alterna el modo oscuro. Ícono propio de marca (un
 * cuadrado mitad claro/mitad oscuro que gira 180°, como el "B & W" y el cuadrito
 * que ya gira en el logo y en `SectionNav`) con texto visible al lado, para que
 * se entienda sin adivinar qué hace.
 */
export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getIsDark, () => false);

  function toggle() {
    const next = isDark ? "light" : "dark";
    withoutTransitions(() => {
      applyTheme(next);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Almacenamiento bloqueado (privado, cuota): el cambio dura la sesión, sin romper nada.
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      className="inline-flex min-h-11 items-center gap-2 text-vanilla-static/70 transition-colors hover:text-vanilla-static focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
        className="shrink-0 transition-transform duration-300 ease-out"
        style={{ transform: isDark ? "rotate(180deg)" : "rotate(0deg)" }}
      >
        <rect x="5" y="5" width="14" height="14" />
        <path d="M19 5 L19 19 L5 19 Z" fill="currentColor" stroke="none" />
      </svg>
      Modo oscuro
    </button>
  );
}
