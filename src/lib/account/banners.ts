/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-19
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { purchasedQuoteIds } from "@/lib/account/quotes";
import { estaVencida } from "@/lib/cuenta-cobro-vigencia";
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
    cuentasCol.find({ userId, estado: "enviada" }, { projection: { numero: 1, estado: 1, venceEn: 1 } }).limit(20).toArray(),
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
  // Las vencidas no se pagan: piden revisión de precios, así que su aviso es otro.
  const expired = cuentas.filter((c) => estaVencida(c));
  const payable = cuentas.filter((c) => !estaVencida(c));
  if (payable.length === 1) {
    banners.push({
      text: `Tienes una cuenta de cobro por pagar (${payable[0].numero})`,
      href: `/cuenta/cuentas-cobro/${payable[0]._id!.toString()}`,
    });
  } else if (payable.length > 1) {
    banners.push({ text: `Tienes ${payable.length} cuentas de cobro por pagar`, href: "/cuenta/cuentas-cobro" });
  }
  if (expired.length === 1) {
    banners.push({
      text: `Tu cuenta de cobro ${expired[0].numero} venció: envíala a revisión de precios`,
      href: `/cuenta/cuentas-cobro/${expired[0]._id!.toString()}`,
    });
  } else if (expired.length > 1) {
    banners.push({ text: `Tienes ${expired.length} cuentas de cobro vencidas: envíalas a revisión de precios`, href: "/cuenta/cuentas-cobro" });
  }
  return banners;
}
