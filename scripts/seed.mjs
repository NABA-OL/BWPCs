/**
 * Seed inicial de la base de datos.
 * Uso: node --env-file=.env.local scripts/seed.mjs
 *
 * Crea (si no existen):
 *  - El administrador inicial (usuario "admin").
 *  - El documento de configuración con valores por defecto.
 *  - Índices básicos.
 *
 * La contraseña inicial se toma de ADMIN_PASSWORD o, por defecto, "bwadmin2026".
 * Cámbiala luego desde el panel (o reseteándola en la BD).
 */
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "bwpcs";
const adminUser = process.env.ADMIN_USER || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "bwadmin2026";

if (!uri) {
  console.error("✗ Falta MONGODB_URI. Define .env.local y vuelve a correr.");
  process.exit(1);
}

const DEFAULT_SETTINGS = {
  trmScrapeado: 0,
  trmRecargo: 148,
  trmManual: null,
  trmActualizado: null,
  envioCPU: 110000,
  envioGPU: 170000,
  servicioBase: 200000,
  mediosPago: { tarjeta: 0.06, pse: 0.03 },
  contacto: { whatsapp: "+573188422533", email: "bandwmount@gmail.com" },
  actualizado: new Date(),
};

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  console.log(`→ Conectado a "${dbName}"`);

  // Índices
  await db.collection("admins").createIndex({ usuario: 1 }, { unique: true });
  await db.collection("processors").createIndex({ modelo: 1 });
  await db.collection("graphics").createIndex({ modelo: 1 });
  await db.collection("components").createIndex({ categoria: 1, modelo: 1 });
  await db
    .collection("categoryAverages")
    .createIndex({ categoria: 1 }, { unique: true });
  console.log("→ Índices listos");

  // Admin
  const existing = await db.collection("admins").findOne({ usuario: adminUser });
  if (existing) {
    console.log(`• Admin "${adminUser}" ya existe (sin cambios).`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await db.collection("admins").insertOne({
      usuario: adminUser,
      passwordHash,
      nombreCompleto: "",
      cedula: "",
      firmaBase64: null,
      creado: new Date(),
    });
    console.log(`✓ Admin creado:  usuario="${adminUser}"  contraseña="${adminPassword}"`);
    console.log("  ⚠ Cámbiala pronto.");
  }

  // Settings
  const settings = await db.collection("settings").findOne({});
  if (settings) {
    console.log("• Configuración ya existe (sin cambios).");
  } else {
    await db.collection("settings").insertOne(DEFAULT_SETTINGS);
    console.log("✓ Configuración por defecto creada.");
  }

  console.log("\n✅ Seed completado.");
} catch (err) {
  console.error("✗ Error en el seed:", err.message);
  process.exitCode = 1;
} finally {
  await client.close();
}
