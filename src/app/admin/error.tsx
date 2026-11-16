"use client";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-11-15
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { RouteError } from "@/components/route-error";

// Error fuera de las páginas del panel (su propio layout o el ingreso): no hay menú que conservar.
export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <RouteError error={error} retry={retry} homeHref="/admin/login" homeLabel="Ir al ingreso" />
  );
}
