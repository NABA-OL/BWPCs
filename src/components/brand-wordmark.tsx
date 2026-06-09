"use client";

import { useEffect, useState } from "react";

export interface WordmarkPhrase {
  left: string; // empieza con B (ej. "Build", "Bits")
  right: string; // empieza con W (ej. "Wire", "Watts")
}

const FALLBACK: WordmarkPhrase[] = [{ left: "Build", right: "Wire" }];

/**
 * Wordmark "B & W" que ocasionalmente se expande revelando una frase de marca
 * ("Build & Wire", "Bits & Watts", …) y se contrae de vuelta a "B & W".
 * Rota por la lista `phrases` en cada iteración (gestionable desde el admin).
 * La revelación/ocultación es un "barrido" simétrico de ancho (overflow hidden).
 * Corre al cargar y cada minuto. Respeta prefers-reduced-motion.
 */
export function BrandWordmark({ className = "" }: { className?: string }) {
  const [phrases, setPhrases] = useState<WordmarkPhrase[]>(FALLBACK);
  const [expanded, setExpanded] = useState(false);
  const [index, setIndex] = useState(0);

  // Carga la lista editable desde el admin (cae al fallback si falla).
  useEffect(() => {
    let active = true;
    fetch("/api/wordmark")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && Array.isArray(d?.phrases) && d.phrases.length > 0) {
          setPhrases(d.phrases);
          setIndex(0);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const list = phrases.length > 0 ? phrases : FALLBACK;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let collapse: ReturnType<typeof setTimeout>;
    let advance: ReturnType<typeof setTimeout>;
    const run = () => {
      setExpanded(true);
      collapse = setTimeout(() => {
        setExpanded(false);
        // Tras colapsar (oculto), pasa a la siguiente frase para la próxima vez.
        advance = setTimeout(
          () => setIndex((i) => (i + 1) % list.length),
          1200,
        );
      }, 3500);
    };

    const start = setTimeout(run, 900); // al cargar
    const interval = setInterval(run, 60000); // cada minuto

    return () => {
      clearTimeout(start);
      clearTimeout(collapse);
      clearTimeout(advance);
      clearInterval(interval);
    };
  }, [list]);

  const current = list[index % list.length] ?? FALLBACK[0];
  const leftRest = current.left.slice(1);
  const rightRest = current.right.slice(1);

  return (
    <span
      aria-label="B & W"
      className={`font-sans text-xl font-extrabold tracking-tight ${className}`}
    >
      <span aria-hidden="true">
        B
        <span
          className="bw-grow"
          style={{ gridTemplateColumns: expanded ? "1fr" : "0fr" }}
        >
          <span>{leftRest}</span>
        </span>
        &nbsp;&amp;&nbsp;W
        <span
          className="bw-grow"
          style={{ gridTemplateColumns: expanded ? "1fr" : "0fr" }}
        >
          <span>{rightRest}</span>
        </span>
      </span>
    </span>
  );
}
