/**
 * Acceso centralizado a variables de entorno del servidor.
 * Lanza temprano si falta algo crítico (mejor fallar en build que en runtime).
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Defínela en .env.local (local) y en Vercel (producción).`,
    );
  }
  return value;
}

export const env = {
  get mongodbUri() {
    return required("MONGODB_URI");
  },
  get mongodbDb() {
    // Nombre de la base; por defecto "bwpcs" si no se especifica.
    return process.env.MONGODB_DB ?? "bwpcs";
  },
  get authSecret() {
    return required("AUTH_SECRET");
  },
};
