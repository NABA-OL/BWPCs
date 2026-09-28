/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import Image from "next/image";
import Link from "next/link";
import { siteConfig, whatsappLink } from "@/lib/site-config";
import { SecretAdminTrigger } from "@/components/secret-admin-trigger";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline bg-panda-static text-vanilla-static">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        {/* Marca */}
        <div>
          <div className="flex items-center gap-2.5">
            <Image
              src="/brand/logo-solo.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 object-contain invert"
            />
            <span className="text-lg font-extrabold tracking-tight">
              B&nbsp;&amp;&nbsp;W
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-vanilla-static/70">
            {siteConfig.tagline}. Ensamble de computadores y venta de
            componentes en Colombia.
          </p>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-2 text-sm">
          {siteConfig.nav.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="w-fit text-vanilla-static/70 transition-colors hover:text-vanilla-static"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Equipos por presupuesto y uso */}
        <nav aria-label="Equipos" className="flex flex-col gap-2 text-sm">
          {siteConfig.footerLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="w-fit text-vanilla-static/70 transition-colors hover:text-vanilla-static"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Contacto */}
        <div className="text-sm">
          <h3 className="font-semibold">Contacto</h3>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block font-mono text-vanilla-static/70 transition-colors hover:text-vanilla-static"
          >
            WhatsApp {siteConfig.contact.whatsappDisplay}
          </a>
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="mt-1 block text-vanilla-static/70 transition-colors hover:text-vanilla-static"
          >
            {siteConfig.contact.email}
          </a>
          <a
            href={siteConfig.contact.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de B & W (@bw_mountpc)"
            className="mt-3 inline-flex text-vanilla-static/70 transition-colors hover:text-vanilla-static focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4.2" />
              <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>
      </div>

      <div className="border-t border-vanilla-static/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-vanilla-static/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <SecretAdminTrigger>
            © {year}&nbsp;B &amp; W · All rights reserved.
          </SecretAdminTrigger>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <ThemeToggle />
            <Link href="/privacidad" className="hover:text-vanilla-static">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-vanilla-static">
              Términos
            </Link>
            <Link href="/tratamiento-de-datos" className="hover:text-vanilla-static">
              Tratamiento de datos
            </Link>
            <a
              href="https://blackraken.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-vanilla-static"
            >
              Developed by BlacKraken Solutions.
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
