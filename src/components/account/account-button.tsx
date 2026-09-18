"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import Link from "next/link";
import { UserAvatar } from "@/components/account/user-avatar";
import { authClient } from "@/lib/user-auth/client";

/**
 * Botón rojo junto al CTA "Cotiza tu PC". Siempre apunta a /cuenta (allí se
 * redirige a /cuenta/ingresar si no hay sesión). Con sesión muestra el avatar
 * en vez del icono; la sesión se pide al montar, así el header sigue estático.
 */
export function AccountButton({ compact = false }: { compact?: boolean }) {
  const { data } = authClient.useSession();
  const user = data?.user;
  const label = user ? "Mi cuenta" : "Ingresar o crear cuenta";
  const box = compact ? "h-10 w-10" : "h-11 w-11";

  return (
    <Link
      href="/cuenta"
      aria-label={label}
      title={label}
      className={`inline-flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-accent text-vanilla transition-colors hover:bg-panda focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
    >
      {user?.avatarStyle && user.avatarSeed ? (
        <UserAvatar
          style={user.avatarStyle}
          seed={user.avatarSeed}
          size={compact ? 40 : 44}
          className="h-full w-full bg-vanilla"
        />
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
      )}
    </Link>
  );
}
