// Desarrollado por BlacKraken Solutions
import bcrypt from "bcryptjs";

/** Hashea una contraseña en texto plano (solo en runtime Node). */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/** Compara una contraseña con su hash. */
export function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
