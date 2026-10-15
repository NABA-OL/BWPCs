/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Casos del taller de una pieza (docs/piezas-plan-2.md §2.1): «Nos ha pasado» (lo vivió el dueño) y «Puede pasar» (hipótesis razonable).
// Componente de servidor. El rótulo lo pone la interfaz; el texto del caso nunca lo repite. Solo tokens del sitio (claro y oscuro).
import type { Caso } from "@/lib/piezas/types";

interface PiezaCasosProps {
  casos: readonly Caso[];
}

/** Rótulos que la interfaz antepone al texto de un caso. */
export const ROTULO_CASO: Readonly<Record<Caso["tipo"], string>> = { vivido: "Nos ha pasado", "puede-pasar": "Puede pasar" };

const SCROLL_BAJO_ENCABEZADO = { scrollMarginTop: "5rem" } as const; // el encabezado fijo mide 64 px

export function PiezaCasos({ casos }: PiezaCasosProps) {
  if (casos.length === 0) return null;
  return (
    <div id="casos" className="mt-10 max-w-prose" style={SCROLL_BAJO_ENCABEZADO}>
      <h3 className="text-lg font-semibold text-panda">Casos del taller</h3>
      <ul className="mt-4 space-y-5">
        {casos.map((caso) => (
          <li key={caso.id} className={`border-l-2 pl-4 ${caso.tipo === "vivido" ? "border-panda" : "border-hairline"}`}>
            <p className="text-base leading-relaxed text-panda">
              <span className={`block font-mono text-xs font-medium ${caso.tipo === "vivido" ? "text-panda" : "text-component"}`}>
                {ROTULO_CASO[caso.tipo]}
                <span className="sr-only">:</span>
              </span>
              {caso.texto}
            </p>
            {caso.hechos && caso.hechos.length > 0 ? (
              <dl className="mt-3 space-y-2">
                {caso.hechos.map((h, i) => (
                  <div key={h.id}>
                    <dt className={h.etiqueta ? "mb-1 text-xs font-medium text-component" : "sr-only"}>{h.etiqueta ?? `Dato ${i + 1}`}</dt>
                    <dd className="m-0 border-l-2 border-hairline pl-3 font-mono text-sm text-panda">{h.texto}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
