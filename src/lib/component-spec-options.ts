/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-11-01
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import type { ComponentCategory, Settings } from "@/lib/db/types";

/** Opciones de especificación (capacidad, potencia…) que se ofrecen al crear un componente, por categoría. */
export type SpecOptions = Partial<Record<ComponentCategory, string[]>>;

/** Cómo se llama la especificación ante el usuario, por categoría (internamente siempre es "especificación"). */
const SPEC_LABELS: Partial<Record<ComponentCategory, string>> = {
  Almacenamiento: "Capacidad",
  Ram: "Capacidad",
  Fuente: "Bateaje",
};

export function specLabel(categoria: ComponentCategory): string {
  return SPEC_LABELS[categoria] ?? "Especificación";
}

/** Separador entre la descripción y la especificación elegida. */
const SPEC_SEPARATOR = " · ";

const MAX_OPTIONS_PER_CATEGORY = 40;
const MAX_OPTION_LENGTH = 60;

/** Listas iniciales; solo se usan mientras Configuración no haya guardado ninguna. */
export const DEFAULT_SPEC_OPTIONS: SpecOptions = {
  Almacenamiento: ["128 GB", "256 GB", "512 GB", "1 TB", "2 TB", "4 TB", "8 TB"],
  Ram: [
    "4 GB",
    "8 GB",
    "16 GB (1 × 16 GB)",
    "16 GB (2 × 8 GB)",
    "24 GB",
    "32 GB (1 × 32 GB)",
    "32 GB (2 × 16 GB)",
    "48 GB",
    "64 GB (2 × 32 GB)",
  ],
  Fuente: ["500 W", "550 W", "600 W", "650 W", "700 W", "750 W", "850 W", "1000 W", "1100 W", "1200 W"],
};

/** Listas vigentes: las de Configuración (aunque estén vacías) o, si nunca se guardaron, las iniciales. */
export function specOptionsFrom(settings: Pick<Settings, "opcionesComponentes">): SpecOptions {
  return settings.opcionesComponentes ?? DEFAULT_SPEC_OPTIONS;
}

/** Texto de un cuadro (una opción por línea) → lista limpia, sin vacías ni repetidas. */
export function parseSpecOptions(text: string): string[] {
  const seen = new Set<string>();
  const options: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const option = line.trim().replace(/\s+/g, " ").slice(0, MAX_OPTION_LENGTH);
    if (option === "" || seen.has(option)) continue;
    seen.add(option);
    options.push(option);
    if (options.length === MAX_OPTIONS_PER_CATEGORY) break;
  }
  return options;
}

/** Quita de la descripción la especificación elegida antes (si sigue al final de ella). */
function withoutSpec(descripcion: string, spec: string): string {
  if (spec === "") return descripcion;
  const trimmed = descripcion.trimEnd();
  if (trimmed === spec) return "";
  return trimmed.endsWith(SPEC_SEPARATOR + spec)
    ? trimmed.slice(0, -(SPEC_SEPARATOR + spec).length)
    : descripcion;
}

/** Cambia la especificación al final de la descripción: quita la anterior y concatena la nueva. */
export function replaceSpec(descripcion: string, previous: string, next: string): string {
  const base = withoutSpec(descripcion, previous).trimEnd();
  if (next === "") return base;
  return base === "" ? next : base + SPEC_SEPARATOR + next;
}

/** Opción de la lista con la que termina la descripción (para preseleccionarla al editar), o "". */
export function detectSpec(descripcion: string, options: string[]): string {
  const trimmed = descripcion.trimEnd();
  const matches = options.filter(
    (o) => trimmed === o || trimmed.endsWith(SPEC_SEPARATOR + o),
  );
  return matches.sort((a, b) => b.length - a.length)[0] ?? "";
}
