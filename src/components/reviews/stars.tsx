/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

/** Estrellas de solo lectura (accesibles: el texto dice "4 de 5 estrellas"). */
export function Stars({
  value,
  size = 16,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span
      role="img"
      aria-label={`${value.toFixed(value % 1 === 0 ? 0 : 1)} de 5 estrellas`}
      className={`inline-flex gap-0.5 ${className ?? ""}`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={rounded >= n ? "text-accent" : "text-panda/45"}
          fill={rounded >= n ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={rounded >= n ? 0 : 1.5}
          strokeLinejoin="round"
        >
          <path d="M12 2.5l2.94 6.1 6.56.9-4.8 4.6 1.2 6.6L12 17.6l-5.9 3.1 1.2-6.6-4.8-4.6 6.56-.9L12 2.5z" />
        </svg>
      ))}
    </span>
  );
}
