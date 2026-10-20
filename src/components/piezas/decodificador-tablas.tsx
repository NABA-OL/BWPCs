/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Tablas estáticas del decodificador de nombres de procesador (docs/piezas-plan-2.md §2.2). Componente de servidor: es lo que ve quien navega
// sin JS. Los ejemplos se desglosan con la MISMA función que usa la isla (decodificarNombre), así la tabla y el formulario no pueden diferir.
import type { ReactNode } from "react";
import { AVISO_PATRON, decodificarNombre } from "@/lib/piezas/procesador/decodificador";
import type { DatosDecodificador, EquivalenciaGama, FamiliaCpu, ResultadoDecodificacion, SegmentoCpu, SufijoCpu } from "@/lib/piezas/types";

const ETIQUETA_SEGMENTO: Readonly<Record<SegmentoCpu, string>> = { escritorio: "Escritorio", portatil: "Portátil" };
const SIN_DATO = "—";

function Tabla({ titulo, columnas, filas }: { titulo: string; columnas: readonly string[]; filas: readonly { clave: string; celdas: readonly ReactNode[] }[] }) {
  return (
    <div role="region" aria-label={`Tabla: ${titulo}`} tabIndex={0} className="mt-6 overflow-x-auto border border-hairline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panda">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="border-b border-hairline px-3 py-3 text-left text-base font-semibold text-panda">{titulo}</caption>
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c} scope="col" className="px-3 py-2 align-bottom text-xs font-medium text-component">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={fila.clave} className="border-t border-hairline align-top">
              {fila.celdas.map((celda, i) =>
                i === 0 ? (
                  <th key={`${fila.clave}-${i}`} scope="row" className="px-3 py-3 font-mono text-sm font-medium text-panda">
                    {celda}
                  </th>
                ) : (
                  <td key={`${fila.clave}-${i}`} className="break-words px-3 py-3 text-panda">
                    {celda}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Desglose({ resultado }: { resultado: ResultadoDecodificacion }) {
  if (resultado.estado === "invalido") return <>{SIN_DATO}</>;
  return (
    <ul className="space-y-1">
      {resultado.trozos.map((t, i) => (
        <li key={`${i}-${t.texto}`}>
          <span className="font-mono font-medium">{t.texto}</span>
          <span className="text-component">{": "}</span>
          {t.significado}
        </li>
      ))}
    </ul>
  );
}

const celdaLista = (valores: readonly string[]): string => (valores.length > 0 ? valores.join(", ") : SIN_DATO);

function filaFamilia(f: FamiliaCpu) {
  return { clave: f.id, celdas: [f.nombre, f.marca, f.resumen] };
}

function filaSufijo(s: SufijoCpu, nombresFamilia: ReadonlyMap<string, string>) {
  const familias = s.familias.map((id) => nombresFamilia.get(id) ?? id);
  const token = s.compone === undefined ? s.token : `${s.token} (${s.compone.join(" + ")})`;
  return { clave: `${s.token}-${s.familias.join("-")}`, celdas: [token, celdaLista(familias), ETIQUETA_SEGMENTO[s.segmento], s.significado] };
}

function filaEquivalencia(e: EquivalenciaGama) {
  return { clave: e.gama, celdas: [e.gama, e.amd ?? SIN_DATO, e.intelClasico ?? SIN_DATO, celdaLista(e.intelActual)] };
}

export function DecodificadorTablas({ datos }: { datos: DatosDecodificador }) {
  const nombresFamilia = new Map(datos.familias.map((f) => [f.id, f.nombre]));
  return (
    <>
      <p className="mt-6 max-w-prose text-sm text-component">{AVISO_PATRON}</p>
      {datos.familias.length > 0 ? <Tabla titulo="Familias" columnas={["Familia", "Marca", "Qué es"]} filas={datos.familias.map(filaFamilia)} /> : null}
      {datos.ejemplos.length > 0 ? (
        <Tabla
          titulo="Ejemplos desglosados"
          columnas={["Nombre", "Cómo se lee"]}
          filas={datos.ejemplos.map((e) => ({ clave: e.nombre, celdas: [e.nombre, <Desglose key="d" resultado={decodificarNombre(e.nombre, datos)} />] }))}
        />
      ) : null}
      {datos.series.length > 0 ? (
        <Tabla
          titulo="Series"
          columnas={["Familia", "Primeras cifras del número", "Qué indican"]}
          filas={datos.series.map((s) => ({ clave: `${s.familia}-${s.prefijo}-${s.digitos}`, celdas: [nombresFamilia.get(s.familia) ?? s.familia, s.prefijo, s.etiqueta] }))}
        />
      ) : null}
      {datos.sufijos.length > 0 ? (
        <Tabla titulo="Sufijos" columnas={["Sufijo", "Familias", "Segmento", "Qué significa"]} filas={datos.sufijos.map((s) => filaSufijo(s, nombresFamilia))} />
      ) : null}
      {datos.equivalencias.length > 0 ? (
        <>
          <Tabla
            titulo="Gamas: números parecidos en cada marca"
            columnas={["Gama", "AMD", "Intel (nombre anterior)", "Intel (nombre actual)"]}
            filas={datos.equivalencias.map(filaEquivalencia)}
          />
          <p className="mt-2 max-w-prose text-sm text-component">
            Las dos marcas usan un número parecido para indicar la gama dentro de su propia línea; no significa que rindan igual. «—» quiere decir que no hay un equivalente confirmado.
          </p>
        </>
      ) : null}
      <p className="mt-4 font-mono text-xs text-component">Tablas revisadas por última vez el {datos.revisadoEn}.</p>
    </>
  );
}
