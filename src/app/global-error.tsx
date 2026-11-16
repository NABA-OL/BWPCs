"use client";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-11-15
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { RouteError } from "@/components/route-error";
import "./globals.css";

// Último recurso: falla el layout raíz. Reemplaza al layout, así que define su propio <html> y <body>.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="es-CO" className="h-full antialiased">
      <body className="min-h-full bg-vanilla text-panda">
        <RouteError error={error} retry={retry} homeHref="/" homeLabel="Volver al inicio" />
      </body>
    </html>
  );
}
