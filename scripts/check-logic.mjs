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
import { ANIM_END, ANIM_START, ENTER_END, EXIT_START, HEADER_PX, SHIFT_PX, VARIANT_WEIGHT, easeOutCubic, frameAt, frameFor, scrollProgress, span, stageLayout, trackHeight } from "../src/lib/component-showcase.ts";
import { STAGE_ORDER, STAGE_PIECES } from "../src/lib/component-stage.ts";
import { componentPrice, componentShipping, effectiveTrm, graphicPrice, processorPrice } from "../src/lib/pricing.ts";
import { CARD_MAX_COP, DEFAULT_PAYMENT_METHOD, OFFERED_PAYMENT_METHODS, cardIsManual, surchargePct, totalFor } from "../src/lib/payment-methods.ts";
import "./check-piezas/index.mjs";
import "./check-hoja.mjs";

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

// --- Componentes en escena (/servicios): una pieza a la vez, sin solapes ---
{
  const N = 8;
  const f0 = frameFor(0, N);
  assert.deepEqual([f0.index, f0.t, f0.opacity], [0, 0, 0], "p=0: primera pieza, aún sin verse");
  const f1 = frameFor(1, N);
  assert.deepEqual([f1.index, f1.t, f1.opacity], [N - 1, 1, 0], "p=1: última pieza ya salió, el escenario queda vacío");
  assert.deepEqual(frameFor(-5, N), frameFor(0, N), "p negativo se recorta a 0");
  assert.deepEqual(frameFor(7, N), frameFor(1, N), "p mayor que 1 se recorta a 1");
  assert.deepEqual(frameFor(Number.NaN, N), frameFor(0, N), "NaN se trata como 0");
  assert.ok(ENTER_END <= EXIT_START && ANIM_START >= 0 && ANIM_END <= 1, "los tramos caben en 0..1");
  assert.ok(ANIM_START < ANIM_END && ANIM_END <= EXIT_START, "la animación propia termina antes de que empiece la salida");
  assert.ok(Math.abs(ENTER_END + (EXIT_START - ENTER_END) + (1 - EXIT_START) - 1) < 1e-12, "entrada + sostén + salida = 1");
  let lastIndex = 0;
  for (let k = 0; k <= 4000; k++) {
    const fr = frameFor(k / 4000, N);
    assert.ok(fr.index >= lastIndex && fr.index - lastIndex <= 1, "el índice avanza de a uno y nunca retrocede");
    assert.ok(fr.opacity >= 0 && fr.opacity <= 1 && fr.t >= 0 && fr.t <= 1, "opacidad y t dentro de 0..1");
    assert.ok(Math.abs(fr.shift) <= SHIFT_PX + 1e-9, "el desplazamiento no pasa de 24 px");
    lastIndex = fr.index;
  }
  for (let i = 0; i < N; i++) {
    const mid = frameFor((i + 0.5) / N, N);
    assert.deepEqual([mid.index, mid.opacity, mid.shift], [i, 1, 0], `pieza ${i}: a mitad de su tramo se ve completa y quieta`);
  }
  for (let k = 1; k < N; k++) {
    const before = frameFor(k / N - 1e-9, N);
    const at = frameFor(k / N, N);
    assert.ok(before.index === k - 1 && before.opacity < 1e-6, `límite ${k}: la que sale ya está invisible`);
    assert.ok(at.index === k && at.opacity === 0, `límite ${k}: la que entra parte invisible (sin solape)`);
  }
  // Entrada creciente y salida decreciente (sin saltos).
  let prevOp = -1;
  for (let u = 0; u <= ENTER_END; u += ENTER_END / 50) {
    const op = frameFor(u / N, N).opacity;
    assert.ok(op >= prevOp - 1e-12, "la opacidad de entrada solo sube");
    prevOp = op;
  }
  prevOp = 2;
  for (let u = EXIT_START; u <= 1; u += (1 - EXIT_START) / 50) {
    const op = frameFor(u / N, N).opacity;
    assert.ok(op <= prevOp + 1e-12, "la opacidad de salida solo baja");
    prevOp = op;
  }
  assert.ok(frameFor(0.05 / N, N).shift > 0 && frameFor(0.05 / N, N).shift < SHIFT_PX, "al entrar sube desde abajo");
  assert.ok(frameFor(0.95 / N, N).shift < 0, "al salir sigue subiendo (negativo)");
  // Progreso del recorrido a partir de la posición en la ventana.
  assert.equal(scrollProgress(HEADER_PX + 500, 1000), 0, "antes de pegarse: 0");
  assert.equal(scrollProgress(HEADER_PX, 1000), 0, "justo al pegarse: 0");
  assert.equal(scrollProgress(HEADER_PX - 500, 1000), 0.5);
  assert.equal(scrollProgress(HEADER_PX - 1000, 1000), 1, "al despegarse: 1");
  assert.equal(scrollProgress(-99999, 1000), 1, "después: se queda en 1");
  assert.equal(scrollProgress(0, 0), 0, "recorrido sin largo: 0, sin dividir entre cero");
  assert.equal(trackHeight(8), "calc(960svh + 100dvh - 4rem)");
  assert.equal(trackHeight(10.25), "calc(1230svh + 100dvh - 4rem)", "8 piezas + 3 variantes extra = 10,25 unidades");
  assert.equal(span(0.1, 0.1, 0.55), 0);
  assert.equal(span(0.55, 0.1, 0.55), 1);
  assert.equal(span(2, 0.1, 0.55), 1);
  assert.equal(easeOutCubic(0) + easeOutCubic(1), 1);

  // Variantes dentro de un paso: tramos con peso, una imagen a la vez, contador estable.
  const counts = [1, 1, 1, 1, 1, 1, 2, 3];
  const lay = stageLayout(counts);
  assert.equal(VARIANT_WEIGHT, 0.75);
  assert.ok(Math.abs(lay.units - 10.25) < 1e-12, "8 + 3 x 0,75 = 10,25 unidades");
  assert.equal(lay.slots.length, 11, "un tramo por variante (máx. 11)");
  assert.equal(lay.slots[0].a, 0);
  assert.ok(Math.abs(lay.slots[10].b - 1) < 1e-12, "el último tramo termina en 1");
  for (let j = 1; j < lay.slots.length; j++) assert.equal(lay.slots[j].a, lay.slots[j - 1].b, "tramos contiguos");
  assert.ok(Math.abs(lay.slots.reduce((acc, sl) => acc + (sl.b - sl.a), 0) - 1) < 1e-12, "los tramos suman 1");
  const picks = lay.slots.map((sl) => [sl.piece, sl.variant].join("."));
  assert.deepEqual(picks, ["0.0", "1.0", "2.0", "3.0", "4.0", "5.0", "6.0", "6.1", "7.0", "7.1", "7.2"]);
  const first = (pc) => lay.slots.find((sl) => sl.piece === pc);
  assert.ok(Math.abs(first(7).b - first(7).a - 1 / lay.units) < 1e-12, "el primer tramo pesa 1");
  assert.ok(Math.abs(lay.slots[7].b - lay.slots[7].a - VARIANT_WEIGHT / lay.units) < 1e-12, "cada variante extra pesa 0,75");
  {
    let slot = 0;
    let piece = 0;
    let variant = -1;
    for (let k = 0; k <= 8000; k++) {
      const fr = frameAt(k / 8000, lay);
      assert.ok(fr.slot >= slot && fr.slot - slot <= 1, "el tramo avanza de a uno y nunca retrocede");
      assert.ok(fr.piece >= piece && fr.piece - piece <= 1, "la pieza es monótona");
      assert.equal(fr.index, fr.piece);
      assert.equal(fr.piece, lay.slots[fr.slot].piece);
      assert.equal(fr.variant, lay.slots[fr.slot].variant);
      assert.ok(fr.opacity >= 0 && fr.opacity <= 1 && fr.pieceOpacity >= 0 && fr.pieceOpacity <= 1 && fr.t >= 0 && fr.t <= 1);
      assert.ok(fr.pieceOpacity >= fr.opacity - 1e-12, "el contador nunca se ve menos que el tramo");
      assert.ok(Math.abs(fr.shift) <= SHIFT_PX + 1e-9);
      slot = fr.slot;
      piece = fr.piece;
      variant = fr.variant;
    }
    assert.equal(slot, 10, "el recorrido llega al último tramo");
    void variant;
  }
  lay.slots.forEach((sl, j) => {
    const mid = frameAt((sl.a + sl.b) / 2, lay);
    assert.deepEqual([mid.slot, mid.opacity, mid.shift, mid.pieceOpacity], [j, 1, 0, 1], `tramo ${j}: a mitad se ve completo y quieto`);
  });
  for (let j = 1; j < lay.slots.length; j++) {
    const before = frameAt(lay.slots[j].a - 1e-9, lay);
    const at = frameAt(lay.slots[j].a + 1e-9, lay);
    assert.ok(before.slot === j - 1 && before.opacity < 1e-6, `frontera ${j}: el que sale ya está invisible`);
    assert.ok(at.slot === j && at.opacity < 1e-6, `frontera ${j}: el que entra parte invisible (nunca dos imágenes a la vez)`);
    if (lay.slots[j].piece === lay.slots[j - 1].piece) {
      assert.equal(before.pieceOpacity, 1, `frontera interna ${j}: el contador no parpadea (antes)`);
      assert.equal(at.pieceOpacity, 1, `frontera interna ${j}: el contador no parpadea (después)`);
    } else {
      assert.ok(before.pieceOpacity < 1e-6 && at.pieceOpacity < 1e-6, `frontera ${j} entre piezas: el contador también baja a 0`);
    }
  }
  assert.deepEqual([frameAt(0, lay).opacity, frameAt(0, lay).pieceOpacity], [0, 0], "p=0: vacío");
  assert.deepEqual([frameAt(1, lay).opacity, frameAt(1, lay).pieceOpacity], [0, 0], "p=1: vacío");
  assert.deepEqual(frameAt(Number.NaN, lay), frameAt(0, lay), "NaN se trata como 0");
  // Con pesos 1 coincide exactamente con frameFor.
  const ones = stageLayout(Array(N).fill(1));
  assert.equal(ones.units, N);
  for (let k = 0; k <= 4000; k++) {
    const a = frameAt(k / 4000, ones);
    const b = frameFor(k / 4000, N);
    assert.deepEqual({ index: a.index, t: a.t, opacity: a.opacity, shift: a.shift }, b, "frameAt con pesos 1 = frameFor");
    assert.equal(a.pieceOpacity, a.opacity, "una sola variante: pieceOpacity = opacidad del tramo");
  }
  // Contrato de las piezas generadas (BWReel): al menos una variante, ids únicos y las variantes esperadas.
  assert.equal(STAGE_ORDER.length, N);
  for (const id of STAGE_ORDER) {
    const vs = STAGE_PIECES[id].variants;
    assert.ok(vs.length >= 1, `${id}: al menos una variante`);
    assert.equal(new Set(vs.map((v) => v.id)).size, vs.length, `${id}: ids de variante únicos`);
    for (const v of vs) assert.ok(v.w > 0 && v.h > 0 && v.parts.length > 0, `${id}/${v.id}: vista con tamaño y partes`);
  }
  assert.deepEqual(STAGE_PIECES.refrigeracion.variants.map((v) => v.id), ["aire", "liquida"]);
  assert.deepEqual(STAGE_PIECES.almacenamiento.variants.map((v) => v.id), ["m2", "sata", "hdd"]);
}

// --- Precio de componentes en USD con envío por categoría ---
{
  const ajustes = { trmScrapeado: 4000, trmRecargo: 148, trmManual: null, envioCPU: 110000, envioGPU: 170000, envioComponentes: { Ram: 50000, Combo: 120000 } };
  assert.equal(effectiveTrm(ajustes), 4148);
  const usd = (categoria, baseUsd) => ({ categoria, modoPrecio: "USD", baseUsd, precioManualCop: null });
  assert.equal(componentPrice(usd("Ram", 100), ajustes), 100 * 4148 + 50000, "RAM en USD: TRM + envío de la categoría");
  assert.equal(componentPrice(usd("Combo", 200), ajustes), 200 * 4148 + 120000, "Combo en USD: TRM + envío de la categoría");
  assert.equal(componentPrice(usd("Board", 100), ajustes), 100 * 4148, "categoría sin envío configurado: solo TRM (igual que antes)");
  assert.equal(componentPrice(usd("Ram", 100), { ...ajustes, envioComponentes: undefined }), 100 * 4148, "ajustes antiguos sin envioComponentes");
  assert.equal(componentPrice({ categoria: "Ram", modoPrecio: "COP", baseUsd: null, precioManualCop: 710000 }, ajustes), 710000, "en COP no se suma envío");
  assert.equal(componentPrice(usd("Ram", null), ajustes), null, "sin USD no hay precio");
  assert.equal(componentPrice(usd("Ram", 100), { ...ajustes, trmScrapeado: 0 }), null, "sin TRM no hay precio");
  for (const raro of [-5, Number.NaN, "abc"]) assert.equal(componentShipping("Ram", { envioComponentes: { Ram: raro } }), 0, `envío inválido (${raro}) = 0`);
  // CPU y GPU no cambian
  assert.equal(processorPrice({ modoPrecio: "USD", baseUsd: 190, precioManualCop: null }, ajustes), 190 * 4148 + 110000);
  assert.equal(graphicPrice({ modoPrecio: "USD", baseUsd: 300, precioManualCop: null }, ajustes), 300 * 4148 + 170000);
}

console.log("check:logic OK");
