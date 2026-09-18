/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import "server-only";
import { Redis } from "@upstash/redis";

const PREFIX = "bw:rl:";

let redis: Redis | null = null;

function getRedis(): Redis {
  redis ??= Redis.fromEnv();
  return redis;
}

/**
 * Límite de intentos de Better Auth sobre Upstash. Ventana fija: un INCR
 * atómico por petición y EXPIRE solo la primera vez (NX). Si Redis falla se
 * DENIEGA (fail-closed): en login y códigos es preferible bloquear que dejar
 * pasar intentos sin límite.
 */
export const rateLimitStorage = {
  async consume(key: string, rule: { window: number; max: number }) {
    try {
      const k = `${PREFIX}${key}`;
      // Resultados en orden: INCR, EXPIRE (se ignora), TTL.
      const [count, , ttl] = await getRedis()
        .multi()
        .incr(k)
        .expire(k, rule.window, "NX")
        .ttl(k)
        .exec<[number, number, number]>();
      if (count <= rule.max) return { allowed: true, retryAfter: null };
      return { allowed: false, retryAfter: Math.max(ttl, 1) };
    } catch (error: unknown) {
      console.error("[user-auth] Upstash no responde, se deniega", error);
      return { allowed: false, retryAfter: rule.window };
    }
  },
};
