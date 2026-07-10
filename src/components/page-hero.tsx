// Desarrollado por BlacKraken Solutions
export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="border-b border-hairline">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {eyebrow && (
          <p className="font-mono text-sm text-component">{eyebrow}</p>
        )}
        <h1 className="mt-3 text-[clamp(2.25rem,6vw,4rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
          {title}
        </h1>
        {children && (
          <div className="mt-5 max-w-2xl text-lg leading-relaxed text-panda">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
