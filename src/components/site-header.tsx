"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

/**
 * Menú de escritorio que se abre en línea, hacia la izquierda de la
 * flechita — mismo truco de grid 0fr→1fr que el wordmark (ver .bw-grow en
 * globals.css): no relayouta el header al animar.
 */
function ExpandableNav({
  links,
  activeHref,
}: {
  links: { label: string; href: string }[];
  activeHref: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function hide() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div
      className="flex items-center"
      onMouseEnter={show}
      onMouseLeave={hide}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <div
        className="grid overflow-hidden transition-[grid-template-columns] duration-300 ease-out"
        style={{ gridTemplateColumns: open ? "1fr" : "0fr" }}
      >
        <nav className="flex min-w-0 items-center gap-6 whitespace-nowrap pr-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                activeHref === link.href ? "text-accent" : "text-panda"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Más páginas"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center text-panda transition-colors hover:text-accent"
      >
        <svg
          width="8"
          height="14"
          viewBox="0 0 8 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M1 1l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  // `open` controla el estado visual (entra/sale); `mounted` controla la
  // presencia en el DOM. Al cerrar, se anima la salida y luego se desmonta.
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // El cotizador es el CTA; no se repite como link de texto en la barra.
  const links = siteConfig.nav.filter((l) => l.href !== "/cotizador");

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function openMenu() {
    setMounted(true);
    setOpen(true);
  }

  function closeMenu() {
    setOpen(false);
    // Sin animación (reduced-motion) no hay `animationend`: desmontamos ya.
    if (prefersReducedMotion()) setMounted(false);
  }

  function toggleMenu() {
    if (open) closeMenu();
    else openMenu();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-vanilla/90 backdrop-blur supports-[backdrop-filter]:bg-vanilla/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandLogo />

        {/* Nav desktop */}
        <div className="hidden items-center gap-4 md:flex">
          <ExpandableNav links={links} activeHref={pathname} />
          <ButtonLink href="/cotizador">Cotiza tu PC</ButtonLink>
        </div>

        {/* Toggle móvil */}
        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={toggleMenu}
          className="flex h-10 w-10 items-center justify-center md:hidden"
        >
          <div className="flex flex-col gap-1.5">
            <span
              className={`block h-0.5 w-6 bg-panda transition-transform ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-panda transition-opacity ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-panda transition-transform ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Menú móvil */}
      {mounted && (
        <nav
          id="mobile-nav"
          onAnimationEnd={(e) => {
            // Solo al terminar la animación de salida del propio panel
            // (no las de los ítems, que burbujean) desmontamos.
            if (
              !open &&
              e.target === e.currentTarget &&
              e.animationName === "bw-menu-out"
            ) {
              setMounted(false);
            }
          }}
          className={`bw-menu ${
            open ? "" : "bw-menu-leaving"
          } border-t border-hairline bg-vanilla px-4 pb-6 pt-2 md:hidden`}
        >
          {links.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              style={{ "--bw-i": i } as React.CSSProperties}
              className="bw-menu-item block border-b border-hairline py-3 text-base font-medium text-panda last:border-0"
            >
              {link.label}
            </Link>
          ))}
          <ButtonLink
            href="/cotizador"
            size="lg"
            className="bw-menu-item mt-4 w-full"
            style={{ "--bw-i": links.length } as React.CSSProperties}
            onClick={closeMenu}
          >
            Cotiza tu PC
          </ButtonLink>
        </nav>
      )}
    </header>
  );
}
