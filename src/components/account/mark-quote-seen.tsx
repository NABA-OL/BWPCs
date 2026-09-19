"use client";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { useEffect } from "react";
import { markQuoteSeenAction } from "@/app/(public)/cuenta/(area)/cotizaciones/[id]/actions";

/** Al abrir una cotización nueva o actualizada la marca como vista (quita el aviso de la cuenta). */
export function MarkQuoteSeen({ id, unseen }: { id: string; unseen: boolean }) {
  useEffect(() => {
    if (unseen) void markQuoteSeenAction(id);
  }, [id, unseen]);
  return null;
}
