/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 */
import { ButtonLink } from "@/components/ui/button";
import { ShareButton } from "@/components/share-button";

export function PageHero({
  eyebrow,
  title,
  summary,
  ctaLabel,
  ctaHref,
  ctaExternal,
  children,
}: {
  eyebrow?: string;
  title: string;
  /** Puntos clave, mostrados justo después del párrafo de apertura. */
  summary?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  ctaExternal?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-hairline">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {eyebrow && (
          <p className="font-mono text-sm text-component">{eyebrow}</p>
        )}
        <h1 className="mt-3 text-balance text-[clamp(2.25rem,6vw,4rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
          {title}
        </h1>
        {children && (
          <div className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-panda">
            {children}
          </div>
        )}

        {summary && summary.length > 0 && (
          <ul className="mt-5 max-w-2xl space-y-1.5">
            {summary.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2 text-sm leading-relaxed text-panda"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 h-1 w-1 shrink-0 bg-accent"
                />
                {point}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-5">
          {ctaLabel && ctaHref && (
            <ButtonLink
              href={ctaHref}
              target={ctaExternal ? "_blank" : undefined}
              rel={ctaExternal ? "noopener noreferrer" : undefined}
            >
              {ctaLabel}
            </ButtonLink>
          )}
          <ShareButton title={title} />
        </div>
      </div>
    </section>
  );
}
