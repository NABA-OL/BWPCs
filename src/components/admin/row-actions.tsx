"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Contenido de un botón/enlace "Editar" o "Abrir": solo el lápiz (con texto para lectores de pantalla). */
export function EditLabel({ label = "Editar" }: { label?: string }) {
  return (
    <span title={label} className="inline-flex items-center">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

type Position = { right: number; top?: number; bottom?: number };

/**
 * Columna "Acciones" de las tablas del admin: un botón de tres puntos que abre, al pulsarlo, los
 * iconos de las acciones (editar, eliminar…). El panel es `fixed` para que la tabla con scroll no
 * lo recorte, y sus hijos siguen montados (solo ocultos) para que formularios y `confirm` funcionen.
 */
export function RowActions({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Position>({ right: 0, top: 0 });
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!button.current?.contains(target) && !panel.current?.contains(target)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      close();
      button.current?.focus();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function toggle() {
    if (!open && button.current) {
      const r = button.current.getBoundingClientRect();
      const right = window.innerWidth - r.right;
      // Cerca del borde inferior el panel se abre hacia arriba.
      setPos(
        window.innerHeight - r.bottom < 64
          ? { right, bottom: window.innerHeight - r.top + 4 }
          : { right, top: r.bottom + 4 },
      );
    }
    setOpen((v) => !v);
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Acciones"
        title="Acciones"
        onClick={toggle}
        className="flex h-8 w-8 items-center justify-center border-0 bg-transparent text-component outline-none transition-colors hover:text-panda focus-visible:bg-hairline/60 focus-visible:text-panda"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>
      <div
        ref={panel}
        role="group"
        aria-label="Acciones"
        hidden={!open}
        onClick={() => setOpen(false)}
        style={pos}
        className="fixed z-50 items-center gap-1 border border-hairline bg-vanilla p-1 shadow-md [&:not([hidden])]:flex [&_a]:flex [&_a]:h-8 [&_a]:w-8 [&_a]:items-center [&_a]:justify-center [&_a]:no-underline [&_a:hover]:bg-hairline/50 [&_button]:flex [&_button]:h-8 [&_button]:w-8 [&_button]:items-center [&_button]:justify-center [&_button:hover]:bg-hairline/50 [&_button:hover]:no-underline"
      >
        {children}
      </div>
    </>
  );
}
