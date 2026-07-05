// Desarrollado por NABA-OL
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

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
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 text-sm font-medium text-panda transition-colors hover:text-accent ${
                  active
                    ? "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-accent"
                    : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <ButtonLink href="/cotizador">Cotiza tu PC</ButtonLink>
        </nav>

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
