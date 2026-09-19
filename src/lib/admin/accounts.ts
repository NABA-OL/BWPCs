/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import type { Filter } from "mongodb";
import { collections } from "@/lib/db/collections";
import type { Review } from "@/lib/db/types";
import { getDb } from "@/lib/db/mongodb";
import type { PublicUser } from "@/lib/user-auth/users";

export const ACCOUNTS_PAGE_SIZE = 20;

export interface AccountRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  verified: boolean;
  createdAt: Date | null;
  publishedQuotes: number;
  /** Compras confirmadas: cuentas de cobro suyas en estado "pagada". */
  purchases: number;
  review: Review["estado"] | null;
}

export interface AccountsPage {
  rows: AccountRow[];
  total: number;
  page: number;
  totalPages: number;
}

const escapeRegex = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Cuentas de usuario público (solo lectura), las más recientes primero. */
export async function listAccounts(
  search: string,
  requestedPage: number,
): Promise<AccountsPage> {
  const users = (await getDb()).collection<PublicUser>("users");
  const q = search.trim().slice(0, 80);
  const filter: Filter<PublicUser> = q
    ? {
        $or: [
          { name: { $regex: escapeRegex(q), $options: "i" } },
          { email: { $regex: escapeRegex(q), $options: "i" } },
        ],
      }
    : {};

  const total = await users.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / ACCOUNTS_PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const docs = await users
    .find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * ACCOUNTS_PAGE_SIZE)
    .limit(ACCOUNTS_PAGE_SIZE)
    .toArray();

  const ids = docs.map((u) => u._id.toString());
  const [quotesCol, reviewsCol, cuentasCol] = await Promise.all([
    collections.quotes(),
    collections.reviews(),
    collections.cuentasCobro(),
  ]);
  const [quoteCounts, reviews, purchaseCounts] = await Promise.all([
    quotesCol
      .aggregate<{ _id: string; n: number }>([
        { $match: { userId: { $in: ids }, estado: "publicada" } },
        { $group: { _id: "$userId", n: { $sum: 1 } } },
      ])
      .toArray(),
    reviewsCol
      .find({ userId: { $in: ids } }, { projection: { userId: 1, estado: 1 } })
      .toArray(),
    cuentasCol
      .aggregate<{ _id: string; n: number }>([
        { $match: { userId: { $in: ids }, estado: "pagada" } },
        { $group: { _id: "$userId", n: { $sum: 1 } } },
      ])
      .toArray(),
  ]);
  const purchasesByUser = new Map(purchaseCounts.map((c) => [c._id, c.n]));
  const quotesByUser = new Map(quoteCounts.map((c) => [c._id, c.n]));
  const reviewByUser = new Map(reviews.map((r) => [r.userId, r.estado]));

  const rows = docs.map((u) => {
    const id = u._id.toString();
    return {
      id,
      name: u.name,
      email: u.email,
      phone: u.phone?.trim() || null,
      verified: u.emailVerified === true,
      createdAt: u.createdAt ?? null,
      publishedQuotes: quotesByUser.get(id) ?? 0,
      purchases: purchasesByUser.get(id) ?? 0,
      review: reviewByUser.get(id) ?? null,
    };
  });
  return { rows, total, page, totalPages };
}
