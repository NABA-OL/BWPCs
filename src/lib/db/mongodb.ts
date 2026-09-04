/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { MongoClient, type Db } from "mongodb";
import { env } from "@/lib/env";

/**
 * Conexión a MongoDB reutilizada entre invocaciones (patrón recomendado para
 * serverless/Vercel). En desarrollo se cachea en globalThis para sobrevivir al
 * hot-reload; en producción se crea una sola vez por instancia.
 */
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

function clientPromise(): Promise<MongoClient> {
  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(env.mongodbUri);
    globalForMongo._mongoClientPromise = client.connect();
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  return client.db(env.mongodbDb);
}
