/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

export interface LegalSection {
  titulo: string;
  parrafos?: readonly string[];
  lista?: readonly string[];
}

/** Cuerpo de las páginas legales: una sección por bloque, con párrafos y lista opcional. */
export function LegalSections({
  sections,
}: {
  sections: readonly LegalSection[];
}) {
  return (
    <section className="border-b border-hairline/50">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="space-y-8 text-panda">
          {sections.map((s) => (
            <div key={s.titulo}>
              <h2 className="text-xl font-bold">{s.titulo}</h2>
              {s.parrafos?.map((p) => (
                <p key={p} className="mt-2 leading-relaxed">
                  {p}
                </p>
              ))}
              {s.lista && (
                <ul className="mt-3 list-disc space-y-1.5 pl-6 leading-relaxed">
                  {s.lista.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
