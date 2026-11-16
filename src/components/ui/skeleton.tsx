/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-11-15
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

/**
 * Bloque que pulsa mientras llega el contenido. Es decorativo: el estado de carga se
 * anuncia en el contenedor (`role="status"`). `prefers-reduced-motion` lo deja quieto
 * por la regla global de `globals.css`.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse bg-hairline/70 ${className}`} />;
}
