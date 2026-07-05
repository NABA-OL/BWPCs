// Desarrollado por NABA-OL
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
