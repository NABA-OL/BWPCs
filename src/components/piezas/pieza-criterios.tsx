/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Criterios de B & W (docs/piezas-plan-2.md §2.1): opinión de taller aprobada por el dueño, nunca un dato con fuente.
// Formato «A favor» / «A considerar» bajo el rótulo «Criterio de B & W». Sin las palabras «mejor» ni «peor». Componente de servidor.
import type { Criterio } from "@/lib/piezas/types";

export const ROTULO_CRITERIO = "Criterio de B & W";

interface PiezaCriteriosProps {
  aFavor?: readonly Criterio[];
  aConsiderar?: readonly Criterio[];
  /** Criterios sin lado (los de la pieza entera): se listan bajo el mismo rótulo. */
  sueltos?: readonly Criterio[];
  /** Nivel del encabezado de «A favor» / «A considerar», según dónde se coloque (3 bajo un h2, 4 bajo un h3). */
  nivel?: 3 | 4;
}

function Lista({ titulo, criterios, nivel }: { titulo?: string; criterios: readonly Criterio[]; nivel: 3 | 4 }) {
  if (criterios.length === 0) return null;
  const Encabezado = nivel === 3 ? "h3" : "h4";
  return (
    <div>
      {titulo ? <Encabezado className="text-sm font-semibold text-panda">{titulo}</Encabezado> : null}
      <ul className={`${titulo ? "mt-2 " : ""}list-disc space-y-2 pl-5 text-base text-panda marker:text-component`}>
        {criterios.map((c) => (
          <li key={c.id}>{c.texto}</li>
        ))}
      </ul>
    </div>
  );
}

export function PiezaCriterios({ aFavor = [], aConsiderar = [], sueltos = [], nivel = 4 }: PiezaCriteriosProps) {
  if (aFavor.length + aConsiderar.length + sueltos.length === 0) return null;
  const lados = aFavor.length > 0 && aConsiderar.length > 0;
  return (
    <div className="mt-6 border border-hairline p-4">
      <p className="font-mono text-xs text-component">{ROTULO_CRITERIO}</p>
      <div className={`mt-3 grid gap-6 ${lados ? "sm:grid-cols-2" : ""}`}>
        <Lista titulo="A favor" criterios={aFavor} nivel={nivel} />
        <Lista titulo="A considerar" criterios={aConsiderar} nivel={nivel} />
        <Lista criterios={sueltos} nivel={nivel} />
      </div>
    </div>
  );
}
