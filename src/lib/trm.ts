import "server-only";

/**
 * Consumo del Servicio Web oficial de la TRM de la Superintendencia Financiera
 * de Colombia (guía A-GU-GTI-027). Es un servicio SOAP: se hace POST con un
 * sobre XML y devuelve el valor de la TRM para la fecha solicitada (o la
 * vigente si no se envía fecha).
 *
 * No requiere el keystore/certificado del PDF: ese paso es solo para el cliente
 * Java de ejemplo. El certificado del sitio lo emite GlobalSign, una CA que
 * Node/Vercel ya confían, así que un `fetch` normal sobre TLS basta.
 */

const TRM_WSDL_ENDPOINT =
  "https://www.superfinanciera.gov.co/SuperfinancieraWebServiceTRM/TCRMServicesWebService/TCRMServicesWebService";

const NS_ACTION =
  "http://action.trm.services.generic.action.superfinanciera.nexura.sc.com.co/";

export interface TrmOficial {
  /** Valor de la TRM en COP (ej. 3581.46). */
  value: number;
  /** Vigente desde (ISO con offset -05:00), tal como lo devuelve el servicio. */
  validityFrom: string | null;
  /** Vigente hasta. */
  validityTo: string | null;
}

/** Sobre SOAP para `queryTCRM`. Si se pasa fecha, consulta esa TRM histórica. */
function buildEnvelope(date?: string): string {
  const dateNode = date
    ? `<tcrmQueryAssociatedDate>${date}</tcrmQueryAssociatedDate>`
    : "";
  return (
    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:act="${NS_ACTION}">` +
    `<soapenv:Header/><soapenv:Body><act:queryTCRM>${dateNode}</act:queryTCRM></soapenv:Body>` +
    `</soapenv:Envelope>`
  );
}

function tag(xml: string, name: string): string | null {
  const m = xml.match(new RegExp(`<${name}>([^<]*)</${name}>`, "i"));
  return m ? m[1].trim() : null;
}

/**
 * Obtiene la TRM oficial. `date` opcional en formato `yyyy-mm-dd`; si se omite,
 * el servicio devuelve la TRM vigente para la fecha actual.
 * Lanza si la petición falla, expira (timeout) o el servicio no reporta éxito.
 */
export async function fetchTrmOficial(date?: string): Promise<TrmOficial> {
  const res = await fetch(TRM_WSDL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "",
    },
    body: buildEnvelope(date),
    // El servicio puede tardar; lo cortamos para no colgar el cron.
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Servicio TRM respondió HTTP ${res.status}.`);
  }

  const xml = await res.text();

  if (tag(xml, "success") === "false") {
    throw new Error("El servicio TRM reportó success=false.");
  }

  const rawValue = tag(xml, "value");
  const value = rawValue ? Number(rawValue) : NaN;
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("No se pudo leer un valor de TRM válido en la respuesta.");
  }

  return {
    value,
    validityFrom: tag(xml, "validityFrom"),
    validityTo: tag(xml, "validityTo"),
  };
}
