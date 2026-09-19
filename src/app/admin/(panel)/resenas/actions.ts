"use server";
/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  approveReview,
  deleteReview,
  rejectReview,
  setReviewDetails,
} from "@/lib/reviews/reviews";
import { parseAssemblyDetails } from "@/lib/reviews/rules";

function refresh() {
  revalidatePath("/admin/resenas");
  revalidatePath("/admin");
  revalidatePath("/"); // la home muestra las aprobadas
}

const idOf = (form: FormData) => String(form.get("id") ?? "").trim();

export async function approveReviewAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  await approveReview(
    idOf(form),
    String(form.get("version") ?? ""),
    parseAssemblyDetails(String(form.get("componentes") ?? "")),
  );
  refresh();
}

export async function saveReviewDetailsAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  await setReviewDetails(idOf(form), parseAssemblyDetails(String(form.get("componentes") ?? "")));
  refresh();
}

export async function rejectReviewAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  await rejectReview(idOf(form), String(form.get("motivo") ?? ""));
  refresh();
}

export async function deleteReviewAction(form: FormData): Promise<void> {
  if (!(await getSession())) return;
  await deleteReview(idOf(form));
  refresh();
}
