"use client";
/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-11-15
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { Button, ButtonLink } from "@/components/ui/button";

interface RouteErrorProps {
  error: Error & { digest?: string };
  /** `retry` de Next: vuelve a pedir y a renderizar el segmento (a diferencia de `reset`, que no vuelve al servidor). */
  retry: () => void;
  homeHref: string;
  homeLabel: string;
}

/** Pantalla de error compartida por los `error.tsx` y `global-error.tsx` del sitio. */
export function RouteError({ error, retry, homeHref, homeLabel }: RouteErrorProps) {
  return (
    <div
      role="alert"
      className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-24 text-center"
    >
      <p className="font-mono text-sm text-component">Error</p>
      <h1 className="mt-2 text-balance text-[clamp(2rem,6vw,3.5rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
        Algo salió mal de nuestro lado.
      </h1>
      <p className="mt-4 max-w-sm text-pretty text-lg leading-relaxed text-panda">
        No pudimos cargar esta página. Inténtalo de nuevo; si sigue pasando, escríbenos.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button onClick={() => retry()}>Reintentar</Button>
        <ButtonLink href={homeHref} variant="secondary">
          {homeLabel}
        </ButtonLink>
      </div>
      {error.digest && (
        <p className="mt-10 font-mono text-xs text-component">
          Referencia: {error.digest}
        </p>
      )}
    </div>
  );
}
