"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserAvatar } from "@/components/account/user-avatar";
import { authClient } from "@/lib/user-auth/client";

const ITEMS = [
  { href: "/cuenta", label: "Mis cotizaciones", match: (p: string) => p === "/cuenta" || p.startsWith("/cuenta/cotizaciones") },
  { href: "/cuenta/resena", label: "Mi reseña", match: (p: string) => p.startsWith("/cuenta/resena") },
  { href: "/cuenta/perfil", label: "Mi perfil", match: (p: string) => p.startsWith("/cuenta/perfil") },
  { href: "/cuenta/seguridad", label: "Seguridad", match: (p: string) => p.startsWith("/cuenta/seguridad") },
] as const;

interface AccountNavProps {
  name: string;
  email: string;
  avatarStyle: string;
  avatarSeed: string;
}

/**
 * Menú de la cuenta: barra lateral en escritorio y pestañas con desplazamiento
 * horizontal en móvil. La página de inicio de la cuenta son las cotizaciones.
 */
export function AccountNav({ name, email, avatarStyle, avatarSeed }: AccountNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  // En móvil las pestañas se desplazan: la activa debe quedar a la vista.
  useEffect(() => {
    document
      .querySelector('nav[aria-label="Cuenta"] [aria-current="page"]')
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);

  async function signOut() {
    setLeaving(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="md:sticky md:top-24 md:self-start">
      <div className="hidden items-center gap-3 border border-hairline bg-vanilla p-4 md:flex">
        <UserAvatar
          style={avatarStyle}
          seed={avatarSeed}
          size={44}
          className="h-11 w-11 shrink-0 border border-hairline"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate font-mono text-[11px] text-component">{email}</p>
        </div>
      </div>

      <nav
        aria-label="Cuenta"
        className="-mx-4 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-hairline px-4 sm:-mx-6 sm:px-6 md:mx-0 md:mt-3 md:flex-col md:gap-0 md:overflow-visible md:border-b-0 md:px-0"
      >
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors md:border-b-0 md:border-l-2 md:py-2.5 ${
                active
                  ? "border-accent text-panda"
                  : "border-transparent text-component hover:text-panda"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={signOut}
          disabled={leaving}
          className="shrink-0 whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-left text-sm font-medium text-component transition-colors hover:text-accent disabled:opacity-50 md:border-b-0 md:border-l-2 md:py-2.5 md:mt-3 md:border-t md:border-t-hairline"
        >
          {leaving ? "Saliendo…" : "Cerrar sesión"}
        </button>
      </nav>
    </aside>
  );
}
