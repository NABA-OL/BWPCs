/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import Image from "next/image";
import Link from "next/link";
import { BrandWordmark } from "@/components/brand-wordmark";

/**
 * Wordmark de marca: panda + "B & W".
 * `variant="mark"` muestra solo el osito; `variant="full"` añade el wordmark.
 */
export function BrandLogo({
  variant = "full",
  className = "",
}: {
  variant?: "mark" | "full";
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="B & W — inicio"
      className={`inline-flex items-center gap-2.5 ${className}`}
    >
      <Image
        src="/brand/logo-solo.png"
        alt=""
        width={40}
        height={40}
        priority
        className="h-9 w-9 object-contain"
      />
      {variant === "full" && <BrandWordmark />}
    </Link>
  );
}
