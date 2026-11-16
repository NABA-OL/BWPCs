"use client";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-11-15
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { RouteError } from "@/components/route-error";

// Error en una página del panel: el menú del panel se conserva.
export default function PanelError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <RouteError error={error} retry={retry} homeHref="/admin" homeLabel="Ir al resumen" />
  );
}
