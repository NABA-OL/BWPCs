/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */

/** Serializa JSON-LD para un <script>: escapa `<` para que ningún texto pueda cerrar la etiqueta (`</script>`). */
export function jsonLdString(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Emite un bloque JSON-LD. Parte del contenido (guías, FAQ) viene de la BD, por eso se escapa. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString(data) }}
    />
  );
}
