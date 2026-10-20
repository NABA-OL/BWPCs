"use client";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Isla de cliente del decodificador de nombres de procesador (docs/piezas-plan-2.md §2.2). Estado: el texto, el trozo elegido y el anuncio.
// No guarda ni mide lo que se escribe. La lógica es la misma función pura que usan las tablas del servidor (decodificarNombre).
// El anuncio en vivo (aria-live) solo cambia al enviar o elegir un ejemplo, nunca en cada tecla.
import { useId, useMemo, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
import { AVISO_PATRON, LARGO_MAXIMO_NOMBRE, MENSAJE_FALTA, MENSAJE_INVALIDO, decodificarNombre, describirResultado } from "@/lib/piezas/procesador/decodificador";
import type { DatosDecodificador, ResultadoDecodificacion, TrozoNombre } from "@/lib/piezas/types";

/** Altura reservada del resultado: así escribir no mueve lo que hay debajo (y el HTML del servidor ya ocupa su sitio). */
const ALTO_RESULTADO = "26rem";
const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-panda";
const ETIQUETA_TIPO: Readonly<Record<TrozoNombre["tipo"], string>> = {
  marca: "Marca",
  familia: "Familia",
  gama: "Gama",
  serie: "Serie",
  modelo: "Modelo",
  sufijo: "Sufijo",
};

const suscribirSinCambios = (): (() => void) => () => undefined;
const yaHidratado = (): boolean => true;
const antesDeHidratar = (): boolean => false;

function trozosDe(resultado: ResultadoDecodificacion): readonly TrozoNombre[] {
  return resultado.estado === "invalido" ? [] : resultado.trozos;
}

function Aviso({ resultado }: { resultado: ResultadoDecodificacion }) {
  if (resultado.estado === "reconocido") return null;
  if (resultado.estado === "invalido") return <p className="mt-3 text-base text-panda">{MENSAJE_INVALIDO[resultado.motivo]}</p>;
  return (
    <p className="mt-3 text-base text-panda">
      {MENSAJE_FALTA[resultado.falta]}
      {resultado.resto === undefined ? "" : ` Quedó sin explicar: «${resultado.resto}».`}
    </p>
  );
}

export function DecodificadorProcesador({ datos }: { datos: DatosDecodificador }) {
  const idCampo = useId();
  const idAyuda = `${idCampo}-ayuda`;
  const idEjemplos = `${idCampo}-ejemplos`;
  const listo = useSyncExternalStore(suscribirSinCambios, yaHidratado, antesDeHidratar);
  const [valor, setValor] = useState("");
  const [elegido, setElegido] = useState<number | null>(null);
  const [anuncio, setAnuncio] = useState("");

  const ejemploInicial = datos.ejemplos[0]?.nombre ?? "";
  const enEjemplo = valor.trim() === "";
  const entrada = enEjemplo ? ejemploInicial : valor;
  const resultado = useMemo(() => decodificarNombre(entrada, datos), [entrada, datos]);
  const trozos = trozosDe(resultado);
  const activo = elegido !== null && elegido < trozos.length ? elegido : null;

  const cambiar = (texto: string): void => {
    setValor(texto);
    setElegido(null);
  };
  const anunciar = (texto: string): void => setAnuncio(describirResultado(decodificarNombre(texto, datos)));
  const enviar = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    anunciar(entrada);
  };
  const probar = (nombre: string): void => {
    cambiar(nombre);
    anunciar(nombre);
  };

  return (
    <div className="mt-8 border border-hairline p-4 sm:p-6">
      <div style={{ visibility: listo ? "visible" : "hidden" }}>
        <form onSubmit={enviar} noValidate>
          <label htmlFor={idCampo} className="block text-base font-semibold text-panda">
            Escribe el nombre de un procesador
          </label>
          <p id={idAyuda} className="mt-1 text-sm text-component">
            {AVISO_PATRON}
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              id={idCampo}
              type="text"
              value={valor}
              onChange={(e) => cambiar(e.target.value)}
              maxLength={LARGO_MAXIMO_NOMBRE}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-describedby={idAyuda}
              placeholder={ejemploInicial}
              className={`${FOCO} min-h-11 w-full border border-hairline bg-vanilla px-3 font-mono text-base text-panda placeholder:text-component sm:max-w-sm`}
            />
            <button
              type="submit"
              className={`${FOCO} min-h-11 bg-panda px-5 text-sm font-medium uppercase tracking-wide text-vanilla transition-colors hover:bg-accent hover:text-accent-ink`}
            >
              Desglosar
            </button>
          </div>
        </form>
        <div role="group" aria-labelledby={idEjemplos} className="mt-4">
          <p id={idEjemplos} className="text-sm text-component">
            Probar con un ejemplo
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {datos.ejemplos.map((e) => (
              <button
                key={e.nombre}
                type="button"
                onClick={() => probar(e.nombre)}
                className={`${FOCO} min-h-11 border border-hairline px-3 font-mono text-sm text-panda hover:border-panda`}
              >
                {e.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {anuncio}
      </p>

      <div className="mt-6 border-t border-hairline pt-4" style={{ minHeight: ALTO_RESULTADO }}>
        <p className="font-mono text-sm text-component">{enEjemplo ? `Ejemplo: ${ejemploInicial}` : `Desglose de «${valor.trim()}»`}</p>
        <div aria-hidden="true" className="mt-3 flex flex-wrap gap-2">
          {trozos.map((t, i) => (
            <span key={`${i}-${t.texto}`} className={`border px-2 pb-1 pt-0.5 font-mono text-lg ${activo === i ? "border-accent text-accent" : "border-hairline text-panda"}`}>
              <span className="block text-[10px] leading-none text-component">{i + 1}</span>
              {t.texto}
            </span>
          ))}
        </div>
        <Aviso resultado={resultado} />
        {trozos.length > 0 ? (
          <ol aria-label="Partes del nombre" className="mt-4 divide-y divide-hairline border-y border-hairline">
            {trozos.map((t, i) => (
              <li key={`${i}-${t.texto}`}>
                <button
                  type="button"
                  aria-pressed={activo === i}
                  onClick={() => setElegido(activo === i ? null : i)}
                  className={`${FOCO} flex min-h-11 w-full items-baseline gap-3 px-1 py-2 text-left ${activo === i ? "text-accent" : "text-panda"}`}
                >
                  <span className="w-5 shrink-0 font-mono text-sm text-component">{i + 1}.</span>
                  <span className="min-w-0">
                    <span className="font-mono text-base font-medium">{t.texto}</span>
                    <span className="ml-2 text-xs text-component">{ETIQUETA_TIPO[t.tipo]}</span>
                    <span className="mt-1 block text-sm text-panda">{t.significado}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </div>
  );
}
