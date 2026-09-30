/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Comprobaciones rápidas de la lógica del flujo de compra que no necesitan base de datos.
// Uso: pnpm check:logic
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { ESTADOS_VISIBLES, esEditable, estadoDe, sendMissing } from "../src/lib/cuenta-cobro-estado.ts";
import { env } from "../src/lib/env.ts";
import { boldReference, boldSignature, expirationNanos, parseBoldCheckoutUrl, verifyBoldSignature } from "../src/lib/bold-signature.ts";
import { CUENTA_NUMEROS_POR_ANIO, computeCuentaCobro, cuentaNumero, withPaymentMethod } from "../src/lib/cuenta-cobro.ts";
import { VIGENCIA_HORAS, cotizacionVigente, estaVencida, ultimoEnvioCotizacion, vencimientoDesde } from "../src/lib/cuenta-cobro-vigencia.ts";
import { INTRO_FAILSAFE_MS, INTRO_INIT_SCRIPT, INTRO_TTL_MS, easeOutExpo, lineBoost } from "../src/lib/intro.ts";
import { CARD_MAX_COP, DEFAULT_PAYMENT_METHOD, OFFERED_PAYMENT_METHODS, cardIsManual, surchargePct, totalFor } from "../src/lib/payment-methods.ts";

// --- Estados de la cuenta de cobro ---
assert.equal(estadoDe({}), "enviada", "sin estado = cuenta anterior, ya emitida");
assert.equal(estadoDe({ estado: "borrador" }), "borrador");
for (const estado of ["borrador", "correccion_solicitada"]) assert.ok(esEditable({ estado }), estado);
assert.ok(esEditable({}), "las cuentas antiguas siguen editables");
for (const estado of ["enviada", "pago_reportado", "pagada", "anulada"]) assert.ok(!esEditable({ estado }), estado);
assert.ok(!ESTADOS_VISIBLES.includes("borrador"), "el cliente nunca ve borradores");

const completa = {
  userId: "u1",
  cliente: { nombre: "A", identificacion: "123", direccion: "", telefono: "", email: "" },
  cuentaBanco: { banco: "B", tipoCuenta: "Ahorros", numero: "1", llave: null, titular: "T" },
  firmante: { nombre: "N", cedula: "1", firmaBase64: null },
  total: 1000,
};
assert.deepEqual(sendMissing(completa, false), []);
assert.ok(sendMissing({ ...completa, userId: null }, false).length === 1);
assert.ok(sendMissing({ ...completa, cliente: { ...completa.cliente, identificacion: " " } }, false).length === 1);
assert.ok(sendMissing({ ...completa, cuentaBanco: { ...completa.cuentaBanco, numero: null } }, false).length === 1);
assert.deepEqual(sendMissing({ ...completa, cuentaBanco: { ...completa.cuentaBanco, numero: null, llave: "@llave" } }, false), []);
assert.ok(sendMissing({ ...completa, firmante: { ...completa.firmante, nombre: "" } }, false).length === 1);
assert.ok(sendMissing({ ...completa, total: 0 }, false).length === 1);
// Con tarjeta no se pide cuenta bancaria; se pide el enlace solo si la tarjeta no se cobra sola.
const sinBanco = { ...completa, formaPago: "tarjeta", cuentaBanco: { banco: "", tipoCuenta: null, numero: null, llave: null, titular: "" } };
assert.deepEqual(sendMissing(sinBanco, false), [], "tarjeta automática: sin banco ni enlace");
assert.equal(sendMissing(sinBanco, true).length, 1, "tarjeta manual sin enlace: falta el enlace");
assert.deepEqual(sendMissing({ ...sinBanco, enlacePagoTarjeta: "https://checkout.bold.co/payment/LNK_X" }, true), []);
assert.equal(sendMissing({ ...sinBanco, formaPago: "bre-b" }, false).length, 1, "con Bre-B sí se pide la cuenta bancaria");
assert.equal(parseBoldCheckoutUrl("https://checkout.bold.co/payment/LNK_X"), "https://checkout.bold.co/payment/LNK_X");
assert.equal(parseBoldCheckoutUrl("http://checkout.bold.co/x"), null, "solo https");
assert.equal(parseBoldCheckoutUrl("https://evil.example.com/x"), null, "solo dominios de Bold");
assert.equal(parseBoldCheckoutUrl("https://checkout.bold.co.evil.com/x"), null, "el host debe ser exacto");
assert.equal(parseBoldCheckoutUrl("javascript:alert(1)"), null);

// --- Vigencia de la cuenta de cobro (72 h) ---
const t0 = new Date("2026-09-25T15:00:00Z");
const hora = 3_600_000;
assert.equal(VIGENCIA_HORAS, 72);
assert.equal(vencimientoDesde(t0).getTime() - t0.getTime(), 72 * hora, "vence 72 horas después del envío");
const conVigencia = { estado: "enviada", venceEn: vencimientoDesde(t0) };
assert.ok(!estaVencida(conVigencia, new Date(t0.getTime() + 71 * hora)), "a las 71 h sigue vigente");
assert.ok(estaVencida(conVigencia, new Date(t0.getTime() + 72 * hora)), "a las 72 h ya venció");
assert.ok(!estaVencida({ estado: "enviada" }, new Date(t0.getTime() + 999 * hora)), "sin venceEn (manual o anterior) nunca vence");
assert.ok(!estaVencida({ estado: "enviada", venceEn: null }, new Date(t0.getTime() + 999 * hora)), "venceEn null tampoco");
for (const estado of ["borrador", "correccion_solicitada", "pago_reportado", "pagada", "anulada"]) {
  assert.ok(!estaVencida({ estado, venceEn: new Date(0) }, t0), `${estado}: solo "por pagar" puede figurar vencida`);
}
assert.ok(estaVencida({ venceEn: new Date(0) }, t0), "sin estado cuenta como enviada");
// Cotización: cuenta desde el último envío al cliente (versión nueva o publicación).
const publicada = { publicadaEn: new Date(t0.getTime() - 10 * hora), historial: [] };
assert.ok(cotizacionVigente(publicada, t0), "publicada hace 10 h: vigente");
assert.ok(!cotizacionVigente({ publicadaEn: new Date(t0.getTime() - 73 * hora), historial: [] }, t0), "publicada hace 73 h: hay que revisar precios");
const reenviada = { publicadaEn: new Date(t0.getTime() - 500 * hora), historial: [{ enviadaEn: new Date(t0.getTime() - hora) }] };
assert.equal(ultimoEnvioCotizacion(reenviada)?.getTime(), t0.getTime() - hora, "manda el último envío del historial");
assert.ok(cotizacionVigente(reenviada, t0), "una versión enviada hace 1 h renueva la vigencia");
assert.ok(!cotizacionVigente({ publicadaEn: null, historial: [] }, t0), "sin fecha de envío no se emite sola");

// --- Total según el medio de pago ---
const totales = { base: 100, conTarjeta: 110, conPse: 105 };
assert.equal(totalFor("transferencia", totales), 100);
assert.equal(totalFor("bre-b", totales), 100);
assert.equal(totalFor("efectivo", totales), 100);
assert.equal(totalFor("tarjeta", totales), 110);
assert.equal(totalFor("pse", totales), 105);

// --- Número de cuenta de cobro: AAAA-LLLNNN incremental ---
assert.equal(cuentaNumero(2026, 0), "2026-AAA000");
assert.equal(cuentaNumero(2026, 1), "2026-AAA001");
assert.equal(cuentaNumero(2026, 999), "2026-AAA999");
assert.equal(cuentaNumero(2026, 1000), "2026-AAB000", "tras AAA999 sigue AAB000");
assert.equal(cuentaNumero(2026, 26_000), "2026-ABA000");
assert.equal(cuentaNumero(2026, 676_000), "2026-BAA000");
assert.equal(cuentaNumero(2027, CUENTA_NUMEROS_POR_ANIO - 1), "2027-ZZZ999");
assert.throws(() => cuentaNumero(2026, CUENTA_NUMEROS_POR_ANIO), RangeError, "sin números: falla en vez de repetir");
assert.throws(() => cuentaNumero(2026, -1), RangeError);
const numeros = new Set(Array.from({ length: 5000 }, (_, i) => cuentaNumero(2026, i)));
assert.equal(numeros.size, 5000, "sin repetidos");

// --- El total sigue al medio de pago ---
const base = [{ descripcion: "PC", cantidad: 1, valorUnitario: 100_000 }];
const conRecargo = withPaymentMethod(base, 0, 0.06, "Recargo por pago con tarjeta");
assert.equal(conRecargo.total, 106_000);
assert.equal(conRecargo.items.length, 2);
assert.equal(conRecargo.items[1].recargo, true);
assert.equal(withPaymentMethod(conRecargo.items, 0, 0.06, "x").total, 106_000, "aplicar dos veces no duplica el recargo");
const vuelta = withPaymentMethod(conRecargo.items, 0, 0, "x");
assert.equal(vuelta.total, 100_000, "al cambiar a Bre-B vuelve el valor original");
assert.equal(vuelta.items.length, 1);
const conDescuento = withPaymentMethod(base, 10, 0.06, "r"); // el descuento no rebaja el recargo
assert.equal(computeCuentaCobro(conDescuento.items, 10).descuentoValor, 10_000);
assert.equal(conDescuento.total, 95_400);
const medios = { tarjeta: 0.06, pse: 0.03, breB: 0 };
assert.equal(surchargePct("tarjeta", medios), 0.06);
assert.equal(surchargePct("bre-b", medios), 0);
assert.equal(surchargePct("transferencia", medios), 0);
assert.deepEqual(OFFERED_PAYMENT_METHODS.map((m) => m.id), ["bre-b", "tarjeta"], "solo Bre-B y tarjeta (PSE oculto con SHOW_PSE=false)");
assert.equal(DEFAULT_PAYMENT_METHOD, "bre-b");
assert.ok(cardIsManual(CARD_MAX_COP + 1, true), "sobre el tope de Bold el enlace lo crea el admin");
assert.ok(!cardIsManual(CARD_MAX_COP, true), "hasta el tope se cobra solo con Bold");
assert.ok(cardIsManual(1_000, false), "sin Bold configurado la tarjeta también es manual");

// --- Bold: firma del webhook, vigencia en nanosegundos, referencia ---
const body = '{"id":"evt-1","type":"SALE_APPROVED","data":{"metadata":{"reference":"ref-1"}}}';
const firmaVacia = boldSignature(body, "");
assert.match(firmaVacia, /^[0-9a-f]{64}$/, "HMAC-SHA256 en hex");
// Vector fijo: HMAC-SHA256 con clave vacía sobre base64(cuerpo), como en la documentación de Bold.
assert.equal(firmaVacia, boldSignature(body, ""), "determinista");
assert.notEqual(boldSignature(body, "otra"), firmaVacia, "la clave cambia la firma");
assert.ok(verifyBoldSignature(body, firmaVacia, [""]), "firma válida con clave vacía (pruebas)");
assert.ok(verifyBoldSignature(body, firmaVacia.toUpperCase(), [""]), "acepta mayúsculas");
assert.ok(verifyBoldSignature(body, boldSignature(body, "secreta"), ["", "secreta"]));
assert.ok(!verifyBoldSignature(body + " ", firmaVacia, [""]), "un cuerpo alterado no pasa");
assert.ok(!verifyBoldSignature(body, boldSignature(body, "otra"), ["secreta"]), "clave equivocada");
assert.ok(!verifyBoldSignature(body, null, [""]) && !verifyBoldSignature(body, "", [""]), "sin firma no pasa");
assert.ok(!verifyBoldSignature(body, "abc", [""]), "longitud distinta no lanza");
assert.equal(expirationNanos(1_789_794_259_551), "1789794259551000000", "ms × 1e6 sin perder precisión");
assert.equal(expirationNanos(1_789_794_259_551).length, 19);
const ref = boldReference("6aadf11d88590260b764280d", Date.now());
assert.ok(ref.length <= 60 && /^[A-Za-z0-9_-]+$/.test(ref), "referencia válida para Bold");
assert.notEqual(boldReference("6aadf11d88590260b764280d", 1), boldReference("6aadf11d88590260b764280d", 2));

// --- Temas de Telegram: variable propia y respaldo a la configuración anterior ---
const THREAD_VARS = [
  "TELEGRAM_THREAD_ID",
  "TELEGRAM_CONTENT_THREAD_ID",
  ...["SOLICITUDES", "COTIZACIONES", "COMPRAS", "PAGOS", "RESENAS", "CUENTAS", "CONTENIDO"].map(
    (t) => `TELEGRAM_THREAD_${t}`,
  ),
];
for (const name of THREAD_VARS) delete process.env[name];
assert.equal(env.telegramThread("pagos"), null, "sin variables: al tema General");
process.env.TELEGRAM_THREAD_ID = "10";
process.env.TELEGRAM_CONTENT_THREAD_ID = "20";
assert.equal(env.telegramThread("compras"), "10", "respaldo: TELEGRAM_THREAD_ID");
assert.equal(env.telegramThread("contenido"), "20");
assert.equal(env.telegramThread("resenas"), "20", "las reseñas seguían yendo al tema de contenido");
process.env.TELEGRAM_THREAD_PAGOS = "33";
process.env.TELEGRAM_THREAD_RESENAS = "44";
assert.equal(env.telegramThread("pagos"), "33", "la variable propia manda");
assert.equal(env.telegramThread("resenas"), "44");
assert.equal(env.telegramThread("compras"), "10");
for (const name of THREAD_VARS) delete process.env[name];

// --- Regla dura: "pagada" solo la fija el admin o el pago de Bold verificado ---
const ADMIN_ACTIONS = join("src", "app", "admin", "(panel)", "cuentas-cobro", "actions.ts");
const BOLD_PAYMENTS = join("src", "lib", "bold-payments.ts");
function* sources(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* sources(path);
    else if (/\.(ts|tsx)$/.test(name)) yield path;
  }
}
const files = [...sources("src")];
const offenders = files.filter(
  (file) => ![ADMIN_ACTIONS, BOLD_PAYMENTS].includes(file) && /to:\s*["']pagada["']/.test(readFileSync(file, "utf8")),
);
assert.deepEqual(offenders, [], `solo ${ADMIN_ACTIONS} y ${BOLD_PAYMENTS} pueden llevar una cuenta a "pagada"`);
// Y en el módulo de Bold, solo a través de applyBoldApproval (que exige un pago verificado).
const applyCallers = files.filter((f) => f !== BOLD_PAYMENTS && /applyBoldApproval\(/.test(readFileSync(f, "utf8")));
assert.deepEqual(applyCallers, [], "applyBoldApproval solo se usa dentro de bold-payments.ts (webhook firmado y consulta a Bold)");
const boldSource = readFileSync(BOLD_PAYMENTS, "utf8");
assert.equal((boldSource.match(/to:\s*["']pagada["']/g) ?? []).length, 1, "un único punto de aprobación");

// --- Intro de la home: cuándo se muestra (script en línea previo a la pintura) ---
function runIntro({ path = "/", search = "", hash = "", referrer = "", hidden = false, reduce = false, saveData = false, stored = null, storageThrows = false } = {}) {
  const attrs = {};
  const store = stored === null ? {} : { "bw-intro": String(stored) };
  const timers = [];
  const storage = storageThrows
    ? { getItem() { throw new Error("bloqueado"); }, setItem() { throw new Error("bloqueado"); } }
    : { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; } };
  const doc = {
    documentElement: { setAttribute: (k, v) => { attrs[k] = v; }, getAttribute: (k) => attrs[k] ?? null },
    visibilityState: hidden ? "hidden" : "visible",
    referrer,
    addEventListener() {},
    removeEventListener() {},
  };
  const nav = { connection: saveData ? { saveData: true } : undefined };
  const win = {
    location: { pathname: path, search, hash },
    matchMedia: () => ({ matches: reduce }),
    localStorage: storage,
    addEventListener() {},
    removeEventListener() {},
  };
  vm.runInNewContext(INTRO_INIT_SCRIPT, {
    window: win, document: doc, navigator: nav, performance: { now: () => 100 },
    Date, URL, RegExp, setTimeout: (_fn, ms) => { timers.push(ms); return 1; },
  });
  return { phase: attrs["data-intro"] ?? null, marked: store["bw-intro"] !== undefined, timers };
}
assert.equal(runIntro().phase, "play", "primera visita a la home: hay intro");
assert.ok(runIntro().marked, "al mostrarla guarda la marca de las 24 h");
assert.deepEqual(runIntro().timers, [INTRO_FAILSAFE_MS + 100], "programa el respaldo de fin");
assert.equal(runIntro({ path: "/servicios" }).phase, null, "solo la home");
assert.equal(runIntro({ path: "/cotizador", search: "?intro=1" }).phase, null, "?intro=1 no la fuerza fuera de la home");
assert.equal(runIntro({ hash: "#cotizar" }).phase, null, "con ancla no hay intro");
assert.equal(runIntro({ hidden: true }).phase, null, "pestaña oculta o prerender: sin intro");
assert.equal(runIntro({ reduce: true }).phase, null, "movimiento reducido: sin intro");
assert.equal(runIntro({ reduce: true, search: "?intro=1" }).phase, null, "?intro=1 nunca salta el movimiento reducido");
assert.equal(runIntro({ saveData: true }).phase, null, "ahorro de datos: sin intro");
assert.equal(runIntro({ referrer: "https://www.google.com/" }).phase, null, "viniendo de Google: sin intro");
assert.equal(runIntro({ referrer: "https://duckduckgo.com/?q=pc" }).phase, null, "viniendo de un buscador: sin intro");
assert.equal(runIntro({ referrer: "https://www.googleapis.evil.example/" }).phase, "play", "solo dominios de buscadores reales");
assert.equal(runIntro({ stored: Date.now() - 1000 }).phase, null, "vista hace poco: no se repite");
assert.equal(runIntro({ stored: Date.now() - INTRO_TTL_MS - 1000 }).phase, "play", "pasadas 24 h vuelve");
assert.equal(runIntro({ stored: Date.now() - 1000, search: "?intro=1" }).phase, "play", "?intro=1 salta la marca de 24 h");
assert.equal(runIntro({ referrer: "https://www.google.com/", search: "?intro=1" }).phase, "play", "?intro=1 salta el filtro de buscador");
assert.equal(runIntro({ storageThrows: true }).phase, "play", "localStorage bloqueado: igual hay intro (sin recordar)");
assert.equal(easeOutExpo(0), 0);
assert.equal(easeOutExpo(1), 1);
let prev = -1;
for (let u = 0; u <= 1.0001; u += 0.05) {
  const e = easeOutExpo(u);
  assert.ok(e >= prev, "easeOutExpo es monótona");
  prev = e;
}
assert.equal(lineBoost(1), 1, "las líneas vuelven a su intensidad normal al terminar");
assert.ok(lineBoost(0) > lineBoost(0.5), "el realce decrece durante la explosión");

console.log("check:logic OK");
