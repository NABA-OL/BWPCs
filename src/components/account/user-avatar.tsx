/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { avatarUrl } from "@/lib/avatar-styles";

interface UserAvatarProps {
  style: string;
  seed: string;
  size: number;
  className?: string;
}

/** Avatar de cuenta: SVG generado por /api/avatar (decorativo, sin alt). */
export function UserAvatar({ style, seed, size, className }: UserAvatarProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG dinámico ya optimizado y cacheado
    <img
      src={avatarUrl(style, seed)}
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
}
