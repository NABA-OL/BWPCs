/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { purchasedQuoteIds } from "@/lib/account/quotes";
import { collections } from "@/lib/db/collections";

export interface AccountBanner {
  text: string;
  href: string;
}

/**
 * Avisos que ve el cliente apenas entra a su cuenta: cotizaciones nuevas o actualizadas que aún no abrió
 * y cuentas de cobro por pagar. Las cotizaciones ya compradas no cuentan.
 */
export async function getAccountBanners(userId: string): Promise<AccountBanner[]> {
  const [quotesCol, cuentasCol] = await Promise.all([collections.quotes(), collections.cuentasCobro()]);
  const [quotes, cuentas] = await Promise.all([
    quotesCol
      .find(
        {
          userId,
          estado: "publicada",
          $expr: { $gt: [{ $ifNull: ["$version", 1] }, { $ifNull: ["$vistaVersion", 0] }] },
        },
        { projection: { codigo: 1, version: 1 } },
      )
      .limit(20)
      .toArray(),
    cuentasCol.find({ userId, estado: "enviada" }, { projection: { numero: 1 } }).limit(20).toArray(),
  ]);

  const bought = await purchasedQuoteIds(quotes.map((q) => q._id!.toString()));
  const unseen = quotes.filter((q) => !bought.has(q._id!.toString()));

  const banners: AccountBanner[] = [];
  if (unseen.length === 1) {
    const q = unseen[0];
    banners.push({
      text: (q.version ?? 1) > 1 ? `Actualizamos tu cotización ${q.codigo}` : "Tienes una cotización nueva",
      href: `/cuenta/cotizaciones/${q._id!.toString()}`,
    });
  } else if (unseen.length > 1) {
    banners.push({ text: `Tienes ${unseen.length} cotizaciones nuevas o actualizadas`, href: "/cuenta" });
  }
  if (cuentas.length === 1) {
    banners.push({
      text: `Tienes una cuenta de cobro por pagar (${cuentas[0].numero})`,
      href: `/cuenta/cuentas-cobro/${cuentas[0]._id!.toString()}`,
    });
  } else if (cuentas.length > 1) {
    banners.push({ text: `Tienes ${cuentas.length} cuentas de cobro por pagar`, href: "/cuenta/cuentas-cobro" });
  }
  return banners;
}
