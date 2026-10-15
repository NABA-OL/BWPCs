/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Tabla comparativa de una pieza (docs/piezas-plan-2.md §2.3). Componente de servidor. Tabla accesible: <caption>, scope en encabezados
// y una región con foco para desplazarla en pantallas angostas. Las celdas son un dato con fuente, un criterio de B & W o texto.
import type { Celda, Comparacion } from "@/lib/piezas/types";
import { ROTULO_CRITERIO } from "./pieza-criterios";

interface PiezaComparacionProps {
  comparacion: Comparacion<string>;
  /** Rótulo de cada columna (la etiqueta de la vista); sin él se usa el id. */
  etiquetas: Readonly<Record<string, string>>;
}

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panda";

function ContenidoCelda({ celda }: { celda: Celda }) {
  switch (celda.tipo) {
    case "hecho":
      return <span className="font-mono text-sm text-panda">{celda.hecho.texto}</span>;
    case "criterio":
      return (
        <>
          <span className="text-panda">{celda.criterio.texto}</span>
          <span className="mt-1 block font-mono text-xs text-component">{ROTULO_CRITERIO}</span>
        </>
      );
    case "texto":
      return <span className="text-panda">{celda.texto}</span>;
  }
}

export function PiezaComparacion({ comparacion, etiquetas }: PiezaComparacionProps) {
  return (
    <div role="region" aria-label={`Tabla: ${comparacion.titulo}`} tabIndex={0} className={`${FOCO} overflow-x-auto border border-hairline`}>
      <table className="w-full border-collapse text-left text-sm">
        <caption className="border-b border-hairline px-3 py-3 text-left text-base font-semibold text-panda">{comparacion.titulo}</caption>
        <thead>
          <tr>
            <th scope="col" className="w-1/4 px-3 py-2 align-bottom text-xs font-medium text-component">
              <span className="sr-only">Característica</span>
            </th>
            {comparacion.columnas.map((columna) => (
              <th key={columna} scope="col" className="px-3 py-2 align-bottom font-mono text-xs font-medium text-panda">
                {etiquetas[columna] ?? columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparacion.filas.map((fila) => (
            <tr key={fila.etiqueta} className="border-t border-hairline align-top">
              <th scope="row" className="px-3 py-3 text-sm font-medium text-panda">
                {fila.etiqueta}
              </th>
              {comparacion.columnas.map((columna) => (
                <td key={columna} className="break-words px-3 py-3 text-sm">
                  <ContenidoCelda celda={fila.valores[columna]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
