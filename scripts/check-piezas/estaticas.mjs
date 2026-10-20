/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Guardas estáticas: nada de sharp, db, auth ni dangerouslySetInnerHTML en las carpetas de piezas.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { RAIZ } from "./comun.mjs";

// ---------------------------------------------------------------- guardas estáticas
{
  const DIRECTORIOS = ["src/components/piezas", "src/app/(public)/piezas", "src/lib/piezas"];
  const archivos = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const ruta = join(dir, e.name);
      if (e.isDirectory()) return archivos(ruta);
      return /\.(ts|tsx|mjs|js)$/.test(e.name) ? [ruta] : [];
    });
  const sinComentarios = (texto) => texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const PROHIBIDOS = [/(^|\/)sharp$/, /images\/process/, /user-auth\/auth/, /(^|\/)db(\/|$)/, /lib\/db/];
  let revisados = 0;
  for (const dir of DIRECTORIOS) {
    const absoluto = join(RAIZ, dir);
    assert.ok(existsSync(absoluto), `existe ${dir}`);
    for (const archivo of archivos(absoluto)) {
      revisados++;
      const texto = sinComentarios(readFileSync(archivo, "utf8"));
      assert.ok(!texto.includes("dangerouslySetInnerHTML"), `dangerouslySetInnerHTML en ${archivo}`);
      const especificadores = [
        ...[...texto.matchAll(/\bfrom\s*["']([^"']+)["']/g)].map((m) => m[1]),
        ...[...texto.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]),
        ...[...texto.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]),
        ...[...texto.matchAll(/^\s*import\s+["']([^"']+)["']/gm)].map((m) => m[1]),
      ];
      for (const especificador of especificadores) {
        for (const prohibido of PROHIBIDOS) assert.ok(!prohibido.test(especificador), `import prohibido «${especificador}» en ${archivo}`);
      }
    }
  }
  assert.ok(revisados >= 8, `se revisaron ${revisados} archivos de piezas`);
}

// ---------------------------------------------------------------- guardas ampliadas: archivos nuevos y subcarpetas
{
  const todos = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const ruta = join(dir, e.name);
      return e.isDirectory() ? todos(ruta) : [ruta];
    });
  const sinComentarios = (texto) => texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const rel = (ruta) => ruta.slice(RAIZ.length);
  const escaneados = [
    ...todos(join(RAIZ, "src/components/piezas")),
    ...todos(join(RAIZ, "src/app/(public)/piezas")),
    ...todos(join(RAIZ, "src/lib/piezas")),
  ].map(rel);

  // Los archivos que se agregaron para generalizar la página están dentro de lo que se vigila.
  for (const esperado of [
    "src/components/piezas/pieza-casos.tsx",
    "src/components/piezas/pieza-comparacion.tsx",
    "src/components/piezas/pieza-criterios.tsx",
    "src/components/piezas/pieza-nombres.tsx",
    "src/components/piezas/pieza-partes.tsx",
    "src/lib/piezas/pagina.ts",
    "src/lib/piezas/registro.ts",
    "src/lib/piezas/procesador.datos.ts",
    "src/app/(public)/piezas/[pieza]/page.tsx",
  ]) {
    assert.ok(escaneados.includes(esperado), `las guardas estáticas cubren ${esperado}`);
  }

  // Cualquier subcarpeta futura (p. ej. lib/piezas/procesador/) entra sola: se verifica que el recorrido sea recursivo.
  const subcarpetas = escaneados.filter((r) => r.split("/").length > 4 && r.startsWith("src/lib/piezas/"));
  for (const r of subcarpetas) assert.ok(!r.includes("node_modules"), `subcarpeta inesperada ${r}`);

  // `src/lib/piezas` es lógica pura: la cargan `check:logic` (node), `next.config.ts` y BWReel, así que no depende de React, Next ni del alias @/.
  for (const ruta of escaneados.filter((r) => r.startsWith("src/lib/piezas/") && /\.(ts|mjs|js)$/.test(r))) {
    const texto = sinComentarios(readFileSync(join(RAIZ, ruta), "utf8"));
    const especificadores = [...texto.matchAll(/\bfrom\s*["']([^"']+)["']/g)].map((m) => m[1]);
    for (const especificador of especificadores) {
      assert.ok(especificador.startsWith("."), `${ruta}: importa «${especificador}» (la lógica pura solo importa archivos relativos)`);
      assert.ok(!/^\.\.\/(\.\.\/)*(components|app)\b/.test(especificador), `${ruta}: la lógica no importa componentes ni páginas`);
    }
  }

  // Los componentes y la página no tocan la base de datos, la sesión ni sharp (más allá de la lista de arriba): tampoco `fs`, `child_process` ni `process.env` salvo el entorno.
  for (const ruta of escaneados.filter((r) => /^src\/(components|app)\//.test(r) && r.endsWith(".tsx"))) {
    const texto = sinComentarios(readFileSync(join(RAIZ, ruta), "utf8"));
    for (const prohibido of [/from\s*["']node:/, /from\s*["'](fs|child_process|path)["']/, /\beval\s*\(/, /new Function\s*\(/, /\.innerHTML\b/]) assert.ok(!prohibido.test(texto), `${ruta}: ${prohibido}`);
    assert.ok(!/process\.env\.(?!NODE_ENV)/.test(texto), `${ruta}: no lee variables de entorno directamente (usa lib/piezas/entorno)`);
  }
}
