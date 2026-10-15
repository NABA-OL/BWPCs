/*
 * Propiedad de BlacKraken Solutions
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-10-14
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
// Fuentes que usan varios módulos de contenido (la tarjeta madre y los hechos comunes). Salen del contenido del piloto sin cambios:
// los comentarios de abajo indican cuáles se abrieron en la verificación A y B del 2026-10-13.
import { HOY, FECHA_VERIFICACION, consultadaEnVerificacion } from "./constructores.ts";
import type { Fuente } from "./types.ts";

/* ---------- Fuentes candidatas ---------- */
export const AMD_CHIPSETS_AM5: Fuente = {
  titulo: "AMD Socket AM5 Chipsets",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/chipsets/am5.html",
  consultadoEn: HOY,
};
export const AMD_CHIPSETS_AM4: Fuente = {
  titulo: "AMD Socket AM4 Chipsets: especificaciones y compatibilidad de procesadores",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/chipsets/am4.html",
  consultadoEn: HOY,
};
export const AMD_RYZEN_7700X: Fuente = {
  titulo: "AMD Ryzen 7 7700X: especificaciones",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7700x.html",
  consultadoEn: HOY,
};
export const AMD_RYZEN_5600X: Fuente = {
  titulo: "AMD Ryzen 5 5600X: especificaciones",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-5-5600x.html",
  consultadoEn: HOY,
};
export const AMD_INSTALAR_DISIPADOR: Fuente = {
  titulo: "How to Install or Remove an AMD CPU Cooler",
  editor: "AMD",
  url: "https://www.amd.com/en/resources/support-articles/faqs/CPU-7.html",
  consultadoEn: HOY,
};
export const AMD_DISIPADORES: Fuente = {
  titulo: "AMD Ryzen Processor Cooling Solutions",
  editor: "AMD",
  url: "https://www.amd.com/en/products/processors/ecosystem/cpu-cooler-solutions.html",
  consultadoEn: "",
};
export const INTEL_ARK_12700: Fuente = {
  titulo: "Procesador Intel Core i7-12700: especificaciones (ARK)",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/products/sku/134591/intel-core-i712700-processor-25m-cache-up-to-4-90-ghz/specifications.html",
  consultadoEn: HOY,
};
export const INTEL_ARK: Fuente = {
  titulo: "Intel Product Specifications (ARK)",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/ark.html",
  consultadoEn: "",
};
export const INTEL_CORE_ULTRA: Fuente = {
  titulo: "Procesadores Intel Core Ultra",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/products/details/processors/core-ultra.html",
  consultadoEn: "",
};
export const INTEL_FRONT_PANEL: Fuente = {
  titulo: "Conector USB frontal: asignación de pines (soporte de Intel)",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/support/articles/000060175/server-products/server-boards.html",
  consultadoEn: "",
};
export const PWM_FAN_SPEC: Fuente = {
  titulo: "Noctua PWM specifications white paper (cita la especificación de Intel de ventiladores PWM de cuatro hilos)",
  editor: "Noctua",
  url: "https://noctua.at/pub/media/wysiwyg/Noctua_PWM_specifications_white_paper.pdf",
  consultadoEn: "",
};
export const PCI_SIG: Fuente = {
  titulo: "Especificaciones de PCI Express",
  editor: "PCI-SIG",
  url: "https://pcisig.com/specifications",
  consultadoEn: "",
};
export const JEDEC_DDR5: Fuente = {
  titulo: "JESD79-5: DDR5 SDRAM",
  editor: "JEDEC",
  url: "https://www.jedec.org/standards-documents/docs/jesd79-5d",
  consultadoEn: "",
};
export const JEDEC_DDR4: Fuente = {
  titulo: "Main Memory: DDR4 y DDR5 SDRAM (JESD79-4)",
  editor: "JEDEC",
  url: "https://www.jedec.org/category/technology-focus-area/main-memory-ddr3-ddr4-sdram",
  consultadoEn: "",
};
export const NVME: Fuente = {
  titulo: "Especificaciones NVM Express",
  editor: "NVM Express",
  url: "https://nvmexpress.org/specifications/",
  consultadoEn: HOY,
};
export const SATA_IO: Fuente = {
  titulo: "SATA-IO",
  editor: "SATA-IO",
  url: "https://sata-io.org/",
  consultadoEn: HOY,
};
export const ATX_22: Fuente = {
  titulo: "ATX Specification, Version 2.2",
  editor: "Intel (formfactors.org)",
  url: "https://xdevs.com/doc/_PC_HW/Form_factors/atx2_2.pdf",
  consultadoEn: HOY,
};
export const VIA_MINI_ITX: Fuente = {
  titulo: "Formato Mini-ITX",
  editor: "VIA Technologies",
  url: "https://www.viatech.com/en/",
  consultadoEn: "",
};
export const USB_IF: Fuente = {
  titulo: "USB-IF Document Library",
  editor: "USB-IF",
  url: "https://www.usb.org/documents",
  consultadoEn: HOY,
};
export const UEFI_FORUM: Fuente = {
  titulo: "UEFI Specifications",
  editor: "UEFI Forum",
  url: "https://uefi.org/specifications",
  consultadoEn: "",
};
export const MS_WINDOWS_11: Fuente = {
  titulo: "Windows 11 requirements",
  editor: "Microsoft",
  url: "https://learn.microsoft.com/windows/whats-new/windows-11-requirements",
  consultadoEn: HOY,
};
export const MANUAL_ASUS: Fuente = {
  titulo: "Soporte y manuales de placas ASUS (falta fijar el manual de un modelo concreto)",
  editor: "Manual <modelo> (ASUS)",
  url: "https://www.asus.com/support/",
  consultadoEn: "",
};
export const MANUAL_ASROCK: Fuente = {
  titulo: "Soporte y manuales de placas ASRock (falta fijar el manual de un modelo concreto)",
  editor: "Manual <modelo> (ASRock)",
  url: "https://www.asrock.com/support/index.asp",
  consultadoEn: "",
};
export const NOTA_MANUAL = "No hay un manual público estable que citar: quien verifica debe fijar un modelo de ejemplo y enlazar su PDF (ASUS, MSI, Gigabyte o ASRock) antes de publicar.";

/* ---------- Fuentes primarias abiertas en la verificación A (2026-10-13) ---------- */
export const V_AMD_AM5 = consultadaEnVerificacion(AMD_CHIPSETS_AM5);
export const V_AMD_AM4 = consultadaEnVerificacion(AMD_CHIPSETS_AM4);
export const V_AMD_7700X = consultadaEnVerificacion(AMD_RYZEN_7700X);
export const V_AMD_5600X = consultadaEnVerificacion(AMD_RYZEN_5600X);
export const V_INTEL_ARK_12700 = consultadaEnVerificacion(INTEL_ARK_12700);
export const V_INTEL_ARK_14700KF: Fuente = {
  titulo: "Intel® Core™ i7-14700KF (ARK)",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/products/sku/236789/intel-core-i7-processor-14700kf-33m-cache-up-to-5-60-ghz/specifications.html",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_INTEL_BOXED_ULTRA_S2: Fuente = {
  titulo: "Information About Intel® Core™ Ultra Boxed Desktop Processors (Series 2)",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/support/articles/000099656/processors.html",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_INTEL_Z690_BIOS: Fuente = {
  titulo: "Intel® Core™ i5-13500 Processor Does Not Boot on a Motherboard with Intel® Z690 Chipset",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/support/articles/000095894/processors/intel-core-processors.html",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_INTEL_LGA1700: Fuente = {
  titulo: "Socket LGA1700 with Comparison to Socket LGA1200",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/support/articles/000088168/processors/intel-core-processors.html",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_AMD_CPU_100: Fuente = {
  titulo: "Processor Handling Guidance",
  editor: "AMD",
  url: "https://www.amd.com/en/resources/support-articles/faqs/CPU-100.html",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_MANUAL_GIGABYTE_B650: Fuente = {
  titulo: "B650 AORUS ELITE AX: manual de usuario (Rev. 1204)",
  editor: "Gigabyte",
  url: "https://download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1204_e.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_MANUAL_GIGABYTE_Z790: Fuente = {
  titulo: "Z790 AORUS ELITE AX / AX DDR4: manual de usuario (Rev. 1105)",
  editor: "Gigabyte",
  url: "https://download.gigabyte.com/FileList/Manual/mb_manual_z790-ae-series_1105_e.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_ASUS_B850F: Fuente = {
  titulo: "ROG STRIX B850-F GAMING WIFI7 NEO",
  editor: "ASUS",
  url: "https://rog.asus.com/motherboards/rog-strix/rog-strix-b850-f-gaming-wifi7-neo/",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_ASROCK_CATALOGO_AMD: Fuente = {
  titulo: "AMD Platform Solutions: catálogo de placas",
  editor: "ASRock",
  url: "https://download.asrock.com/Download/e-catalog/AMDPlatformSolutionsCatalog.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_SSI_EPS12V: Fuente = {
  titulo: "EPS12V Power Supply Design Guide, v2.91 (copia alojada en xDevs.com)",
  editor: "SSI",
  url: "https://xDevs.com/doc/xDevs.com/Neutron/pdf/eps_designguide_2.91.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_CORSAIR_CABLES: Fuente = {
  titulo: "Which PSU cables go where?",
  editor: "Corsair",
  url: "https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/which-psu-cables-go-where/",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_CORSAIR_EPS_VS_PCIE: Fuente = {
  titulo: "Can I use a PCI-e cable in the 8-pin motherboard plug?",
  editor: "Corsair",
  url: "https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/can-i-use-a-pci-e-cable-in-the-8-pin-motherboard-plug/",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_KINGSTON_DDR5: Fuente = {
  titulo: "Ficha de Kingston FURY DDR5, KF560C30BBEK2-32",
  editor: "Kingston",
  url: "https://www.kingston.com/datasheets/KF560C30BBEK2-32.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_KINGSTON_DDR4: Fuente = {
  titulo: "Ficha de Kingston FURY DDR4, KF432C16BBK2/16",
  editor: "Kingston",
  url: "https://www.kingston.com/dataSheets/KF432C16BBK2_16.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_CORSAIR_DDR5_COMPAT: Fuente = {
  titulo: "Is DDR5 backwards compatible with DDR4?",
  editor: "Corsair",
  url: "https://www.corsair.com/us/en/explorer/diy-builder/memory/is-ddr5-backwards-compatible/",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_MS_UEFI: Fuente = {
  titulo: "UEFI firmware requirements",
  editor: "Microsoft",
  url: "https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-uefi",
  consultadoEn: FECHA_VERIFICACION,
};

/* ---------- Fuentes primarias abiertas en la verificación B (2026-10-13) ---------- */
export const V_NVME = consultadaEnVerificacion(NVME);
export const V_ATX_22 = consultadaEnVerificacion(ATX_22); // copia de terceros (xDevs.com) del documento de Intel
export const V_MANUAL_ASROCK_B760M: Fuente = {
  titulo: "Manual de la ASRock B760M-H/M.2",
  editor: "ASRock",
  url: "https://download.asrock.com/Manual/B760M-HM.2.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_MANUAL_ASROCK_B650_LIVEMIXER: Fuente = {
  titulo: "Manual de la ASRock B650 LiveMixer",
  editor: "ASRock",
  url: "https://download.asrock.com/Manual/B650%20LiveMixer_English.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_MANUAL_MSI_B760: Fuente = {
  titulo: "Manual de la MSI B760 GAMING PLUS WIFI DDR4",
  editor: "MSI",
  url: "https://download-2.msi.com/archive/mnu_exe/mb/B760GAMINGPLUSWIFIDDR4_EN.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_MANUAL_ASUS_B850_PLUS: Fuente = {
  titulo: "Manual de la ASUS PRIME B850-PLUS",
  editor: "ASUS",
  url: "https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_MANUAL_ASUS_Z890M: Fuente = {
  titulo: "Manual de la ASUS PRIME Z890M-PLUS WIFI",
  editor: "ASUS",
  url: "https://dlcdnets.asus.com/pub/ASUS/mb/LGA1851/PRIME_Z890M-PLUS_WIFI/E24250_PRIME_Z890M-PLUS_WIFI_EM_WEB.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_MANUAL_ASUS_B850I: Fuente = {
  titulo: "Manual de la ASUS ROG STRIX B850-I GAMING WIFI",
  editor: "ASUS",
  url: "https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/ROG_STRIX_B850-I_GAMING_WIFI/E25172_ROG_STRIX_B850-I_GAMING_WIFI_EM_WEB_new.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_ASUS_B650M_A: Fuente = {
  titulo: "PRIME B650M-A: especificaciones técnicas",
  editor: "ASUS",
  url: "https://asus.com/motherboards-components/motherboards/prime/prime-b650m-a/techspec",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_SAMSUNG_990_PRO: Fuente = {
  titulo: "Hoja de datos del Samsung 990 PRO (rev. 2.0)",
  editor: "Samsung",
  url: "https://download.semiconductor.samsung.com/resources/data-sheet/samsung_nvme_ssd_990_pro_datasheet_rev.2.0.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_SEAGATE_SATA_BASICS: Fuente = {
  titulo: "Serial ATA Basics",
  editor: "Seagate",
  url: "https://www.seagate.com/support/kb/serial-ata-basics-193811en/",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_INTEL_SUFIJO_F: Fuente = {
  titulo: "Does My Computer with Intel Core Processor Number Ending with \"F\" Need a Discrete Graphics Card?",
  editor: "Intel",
  url: "https://www.intel.com/content/www/us/en/support/articles/000058487/processors.html",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_ASUS_FAQ_BIOS_FLASHBACK: Fuente = {
  titulo: "How to update BIOS of the motherboard (include different generation CPU)",
  editor: "ASUS",
  url: "https://www.asus.com/us/support/faq/1044348/",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_ASROCK_FLASHBACK: Fuente = {
  titulo: "Guía de la función BIOS Flashback",
  editor: "ASRock",
  url: "https://www.asrock.com/support/QA/FlashbackSOP.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_ASUS_FAQ_CLEAR_CMOS: Fuente = {
  titulo: "How to Clear CMOS",
  editor: "ASUS",
  url: "https://www.asus.com/support/faq/1040820/",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_ASUS_FAQ_CPU_FAN: Fuente = {
  titulo: "CPU Fan Error! Press F1",
  editor: "ASUS",
  url: "https://www.asus.com/latin/support/faq/1006064/",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_ASUS_FAQ_BATERIA: Fuente = {
  titulo: "How to replace CMOS battery",
  editor: "ASUS",
  url: "https://www.asus.com/support/faq/1005740/",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_INTEL_FRONT_PANEL_GUIA: Fuente = {
  titulo: "Front Panel I/O Connectivity Design Guide, Rev. 1.1 (julio 2018; copia alojada en hackaday.io)",
  editor: "Intel",
  url: "https://cdn.hackaday.io/files/1626526958903168/600569-fpio-dg-rev1p1.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
export const V_VIA_MINI_ITX_WHITE_PAPER: Fuente = {
  titulo: "Mini-ITX Mainboard Specification White Paper (copia alojada en linuxdevices.org)",
  editor: "VIA Technologies",
  url: "https://linuxdevices.org/ldfiles/misc/Mini-ITX.pdf",
  consultadoEn: FECHA_VERIFICACION,
};
