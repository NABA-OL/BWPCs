/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Image
        src="/brand/logo-solo.png"
        alt=""
        width={56}
        height={56}
        className="h-14 w-14 object-contain opacity-80"
      />
      <p className="mt-6 font-mono text-sm text-component">404</p>
      <h1 className="mt-2 text-balance text-[clamp(2rem,6vw,3.5rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
        Esta ruta no está en el catálogo.
      </h1>
      <p className="mt-4 max-w-sm text-pretty text-lg leading-relaxed text-panda">
        La página que buscas no existe o cambió de lugar.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <ButtonLink href="/">Volver al inicio</ButtonLink>
        <ButtonLink href="/cotizador" variant="secondary">
          Cotiza tu PC
        </ButtonLink>
      </div>

      {/* Rutas de recuperación para agentes/crawlers que aterrizan en un 404. */}
      <nav
        aria-label="Enlaces del sitio"
        className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-xs text-component"
      >
        {siteConfig.nav.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-panda">
            {l.label}
          </Link>
        ))}
        <a href="/sitemap.xml" className="hover:text-panda">
          sitemap.xml
        </a>
        <a href="/llms.txt" className="hover:text-panda">
          llms.txt
        </a>
      </nav>
    </main>
  );
}
