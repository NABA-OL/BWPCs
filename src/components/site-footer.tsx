// Desarrollado por NABA-OL
import Image from "next/image";
import Link from "next/link";
import { siteConfig, whatsappLink } from "@/lib/site-config";
import { SecretAdminTrigger } from "@/components/secret-admin-trigger";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline bg-panda text-vanilla">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
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
          <p className="mt-3 max-w-xs text-sm text-vanilla/70">
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
              className="w-fit text-vanilla/70 transition-colors hover:text-vanilla"
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
            className="mt-2 block font-mono text-vanilla/70 transition-colors hover:text-vanilla"
          >
            WhatsApp {siteConfig.contact.whatsappDisplay}
          </a>
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="mt-1 block text-vanilla/70 transition-colors hover:text-vanilla"
          >
            {siteConfig.contact.email}
          </a>
        </div>
      </div>

      <div className="border-t border-vanilla/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-vanilla/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <SecretAdminTrigger>
            © {year}&nbsp;B &amp; W. Todos los derechos reservados.
          </SecretAdminTrigger>
          <span>
            Desarrollado por{" "}
            <a
              href="https://nabaol.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-vanilla/70 transition-colors hover:text-vanilla"
            >
              NABA-OL
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
