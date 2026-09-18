/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CuentaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!ACCOUNTS_ENABLED) notFound();
  return <>{children}</>;
}
