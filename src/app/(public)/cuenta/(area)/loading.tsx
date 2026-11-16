/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-11-15
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { Skeleton } from "@/components/ui/skeleton";

// Mientras carga una página del área de cuenta (el menú lateral ya está en pantalla).
export default function CuentaAreaLoading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Cargando…</span>
      <Skeleton className="h-9 w-2/3 max-w-sm" />
      <Skeleton className="mt-3 h-4 w-full max-w-md" />
      <div className="mt-8 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="border border-hairline p-5">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="mt-3 h-4 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
