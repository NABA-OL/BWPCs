"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useEffect, useRef, type TouchEvent } from "react";
import { createPortal } from "react-dom";

export interface LightboxPhoto {
  url: string;
  width: number;
  height: number;
}

interface PhotoLightboxProps {
  photos: LightboxPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Descripción para lectores de pantalla, p. ej. "Fotos de la reseña de Laura P.". */
  label: string;
}

const SWIPE_PX = 45;

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
      <path d={dir === "left" ? "M19 12H5M11 6l-6 6 6 6" : "M5 12h14M13 6l6 6-6 6"} />
    </svg>
  );
}

const BTN =
  "flex h-11 w-11 items-center justify-center border border-vanilla/30 bg-panda/60 text-vanilla transition-colors hover:bg-vanilla hover:text-panda focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/**
 * Visor de fotos a pantalla completa: flechas, teclado (← → Esc), deslizar en
 * móvil y contador. Se monta en <body> porque los contenedores con transform
 * (las tarjetas del carrusel) harían que `fixed` se posicione respecto a ellos.
 */
export function PhotoLightbox({ photos, index, onIndexChange, onClose, label }: PhotoLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const count = photos.length;

  // Estado actual en refs para que el listener de teclado no se re-registre.
  const state = useRef({ index, count, onIndexChange, onClose });
  useEffect(() => {
    state.current = { index, count, onIndexChange, onClose };
  });

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const scroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      const s = state.current;
      if (e.key === "Escape") s.onClose();
      else if (e.key === "ArrowRight" && s.count > 1) s.onIndexChange((s.index + 1) % s.count);
      else if (e.key === "ArrowLeft" && s.count > 1) s.onIndexChange((s.index - 1 + s.count) % s.count);
      else if (e.key === "Tab") {
        // Foco atrapado dentro del visor.
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = scroll;
      previous?.focus?.();
    };
  }, []);

  const go = (delta: number) => onIndexChange((index + delta + count) % count);

  function onTouchStart(e: TouchEvent) {
    touchX.current = e.touches[0]?.clientX ?? null;
  }
  function onTouchEnd(e: TouchEvent) {
    if (touchX.current === null || count < 2) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
  }

  const photo = photos[index];
  if (!photo) return null;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-panda/92 p-4 sm:p-8"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- imagen ya procesada y cacheada en el CDN */}
      <img
        key={photo.url}
        src={photo.url}
        alt=""
        width={photo.width}
        height={photo.height}
        draggable={false}
        onClick={(e) => e.stopPropagation()}
        className="bw-review-in max-h-[85vh] max-w-full select-none border border-vanilla/20 object-contain"
      />

      <button
        ref={closeRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar"
        className={`${BTN} absolute right-4 top-4 sm:right-8 sm:top-8`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
          <path d="M5 5l14 14M19 5L5 19" />
        </svg>
      </button>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Foto anterior"
            className={`${BTN} absolute left-3 top-1/2 -translate-y-1/2 sm:left-8`}
          >
            <Arrow dir="left" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Foto siguiente"
            className={`${BTN} absolute right-3 top-1/2 -translate-y-1/2 sm:right-8`}
          >
            <Arrow dir="right" />
          </button>
          <p
            className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-xs text-vanilla/80"
            aria-live="polite"
          >
            {index + 1} / {count}
          </p>
        </>
      )}
    </div>,
    document.body,
  );
}
