/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

export interface StatItem {
  label: string;
  value: number;
}

/** Barras horizontales con el valor a la derecha. Sin librería de gráficos. */
export function StatBars({ items }: { items: StatItem[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.label} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-sm">
          <span className="truncate text-component">{i.label}</span>
          <span className="h-3 bg-hairline/50">
            <span
              className="block h-full bg-panda"
              style={{ width: `${(i.value / max) * 100}%` }}
            />
          </span>
          <span className="text-right font-mono tabular-nums">{i.value}</span>
        </li>
      ))}
    </ul>
  );
}

/** Columnas verticales (serie en el tiempo); la última se resalta con el acento. */
export function StatColumns({ items }: { items: StatItem[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div
      role="img"
      aria-label={items.map((i) => `${i.label}: ${i.value}`).join(", ")}
      className="flex h-32 items-end gap-1.5"
    >
      {items.map((i, idx) => (
        <div key={i.label} className="flex h-full flex-1 flex-col justify-end gap-1" title={`${i.label}: ${i.value}`}>
          <span className="text-center font-mono text-[10px] leading-none tabular-nums text-component">
            {i.value > 0 ? i.value : ""}
          </span>
          <span
            className={idx === items.length - 1 ? "bg-accent" : "bg-panda"}
            style={{ height: `${(i.value / max) * 80}%`, minHeight: i.value > 0 ? 3 : 1 }}
          />
        </div>
      ))}
    </div>
  );
}
