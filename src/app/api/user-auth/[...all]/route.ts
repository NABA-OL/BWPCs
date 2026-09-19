/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/user-auth/auth";
import { ACCOUNTS_ENABLED } from "@/lib/user-auth/enabled";

export const runtime = "nodejs";

const handlers = toNextJsHandler(auth);

const notFound = () => new Response(null, { status: 404 });

export const GET = (req: Request) =>
  ACCOUNTS_ENABLED ? handlers.GET(req) : notFound();
export const POST = (req: Request) =>
  ACCOUNTS_ENABLED ? handlers.POST(req) : notFound();
