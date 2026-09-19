"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useEffect, useState } from "react";

export interface SectionNavItem {
  /** id del elemento de la página al que apunta. */
  id: string;
  label: string;
}

/** Alto de cada renglón (rem) y del marcador: el marcador se mueve por múltiplos exactos, sin medir el DOM. */
const ROW_REM = 2;
const HEADER_PX = 64;

/**
 * Indicador de sección de las páginas largas (inicio y servicios), en el margen izquierdo (solo pantallas anchas). Un cuadrado de
 * acento marca dónde estás y, al pasar a la siguiente sección, se desliza y gira 45°: cuadrado →
 * rombo → cuadrado… Con menos de 1536 px de ancho solo se ven las marcas (con la etiqueta como
 * tooltip); con menos de 1280 px no se muestra.
 */
export function SectionNav({ items }: { items: SectionNavItem[] }) {
  const [active, setActive] = useState(0);
  const key = items.map((i) => i.id).join("|");

  useEffect(() => {
    const ids = key.split("|");
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      // Al final de la página gana la última sección aunque sea corta.
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) {
        setActive(ids.length - 1);
        return;
      }
      const line = window.innerHeight * 0.35;
      let current = 0;
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = i;
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [key]);

  function go(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.getBoundingClientRect().top + window.scrollY - (id === items[0]?.id ? 0 : HEADER_PX);
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <nav
      aria-label="Secciones de la página"
      className="pointer-events-none fixed left-5 top-1/2 z-30 hidden -translate-y-1/2 xl:block"
    >
      <ul className="pointer-events-auto relative pl-6">
        {/* línea de tiempo */}
        <span aria-hidden="true" className="absolute bottom-3 left-[3.5px] top-3 w-px bg-hairline" />
        {/* marcador: cuadrado que se desliza y gira 45° por sección */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 h-2 w-2 bg-accent transition-[translate,rotate] duration-300 ease-out"
          style={{
            top: `${ROW_REM / 2}rem`,
            marginTop: "-0.25rem",
            translate: `0 ${active * ROW_REM}rem`,
            rotate: `${active * 45}deg`,
          }}
        />
        {items.map((item, i) => (
          <li key={item.id} style={{ height: `${ROW_REM}rem` }}>
            <a
              href={`#${item.id}`}
              title={item.label}
              aria-current={i === active ? "true" : undefined}
              onClick={(e) => {
                e.preventDefault();
                go(item.id);
              }}
              className={`flex h-full items-center text-sm transition-colors duration-200 hover:text-panda focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                i === active ? "font-medium text-panda" : "text-component"
              }`}
            >
              <span className="sr-only 2xl:not-sr-only">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
