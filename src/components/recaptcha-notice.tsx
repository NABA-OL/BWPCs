/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */

/** Aviso obligatorio de Google al ocultar el badge visual de reCAPTCHA. */
export function RecaptchaNotice({ className }: { className?: string }) {
  return (
    <p className={className}>
      Este sitio está protegido por reCAPTCHA. Aplican la{" "}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:no-underline"
      >
        Política de Privacidad
      </a>{" "}
      y los{" "}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:no-underline"
      >
        Términos de Servicio
      </a>{" "}
      de Google.
    </p>
  );
}
