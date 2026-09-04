/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-08-13
 *  * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import { getDb } from "@/lib/db/mongodb";
import type {
  Admin,
  BankAccount,
  Build,
  CategoryAverage,
  CategoryOptions,
  Client,
  ComponentItem,
  CuentaCobro,
  Graphic,
  Processor,
  Quote,
  Settings,
  WebLead,
} from "@/lib/db/types";

/** Acceso tipado a las colecciones. */
export const collections = {
  async settings() {
    return (await getDb()).collection<Settings>("settings");
  },
  async processors() {
    return (await getDb()).collection<Processor>("processors");
  },
  async graphics() {
    return (await getDb()).collection<Graphic>("graphics");
  },
  async components() {
    return (await getDb()).collection<ComponentItem>("components");
  },
  async categoryAverages() {
    return (await getDb()).collection<CategoryAverage>("categoryAverages");
  },
  async categoryOptions() {
    return (await getDb()).collection<CategoryOptions>("categoryOptions");
  },
  async quotes() {
    return (await getDb()).collection<Quote>("quotes");
  },
  async admins() {
    return (await getDb()).collection<Admin>("admins");
  },
  async builds() {
    return (await getDb()).collection<Build>("builds");
  },
  async clients() {
    return (await getDb()).collection<Client>("clients");
  },
  async bankAccounts() {
    return (await getDb()).collection<BankAccount>("bankAccounts");
  },
  async cuentasCobro() {
    return (await getDb()).collection<CuentaCobro>("cuentasCobro");
  },
  async leads() {
    return (await getDb()).collection<WebLead>("leads");
  },
};

/** Valores por defecto del documento único de configuración. */
export const DEFAULT_SETTINGS: Omit<Settings, "_id"> = {
  trmScrapeado: 0,
  trmRecargo: 148,
  trmManual: null,
  trmActualizado: null,
  envioCPU: 110000,
  envioGPU: 170000,
  servicioBase: 200000,
  mediosPago: { tarjeta: 0.06, pse: 0.03, breB: 0 },
  contacto: {
    whatsapp: "+573188422533",
    email: "bandwmount@gmail.com",
  },
  wordmarkPhrases: [
    { left: "Build", right: "Wire" },
    { left: "Bits", right: "Watts" },
  ],
  actualizado: new Date(),
};
