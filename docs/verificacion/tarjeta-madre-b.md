# Verificación de hechos, /piezas/tarjeta-madre, parte B

- **Fecha:** 2026-10-13
- **Archivo revisado:** `src/lib/piezas/tarjeta-madre.contenido.ts` (estado: borrador, ningún hecho verificado antes de esta hoja)
- **Alcance (parte B):** partes `m2`, `sata`, `conector-24-pines`, `puertos-traseros`, `cabezales-ventilador`, `conectores-frontales`, `bateria-cmos`; hechos de las secciones `errores` y `tamanos`; hechos de `factoresForma`. La parte A (otro agente) cubre `socket`, `chipset`, `vrm`, `conector-cpu`, `ranuras-ram`, `pcie-principal`, `pcie-secundarias` y `elegir`.
- **Total de hechos revisados:** 30

## Resumen de conteos

| Estado | Cantidad |
|---|---|
| ✅ coincide con fuente primaria | 15 |
| 🟡 coincide en parte (matices) | 13 |
| ❌ no coincide | 1 |
| ⚪ sin fuente primaria | 1 |

Leyenda de fuentes: «primaria» = especificación, manual o ficha oficial del fabricante o del organismo que define la norma. «Copia de terceros» = documento primario alojado en un sitio que no es el del autor (se indica). «Secundaria» = Wikipedia, guías editoriales, foros.

Cosas que NO pude abrir (ningún dato de esta hoja depende de ellas): las especificaciones M.2 y PCIe de PCI-SIG (acceso bloqueado o con membresía), la especificación de ventiladores PWM de 4 hilos de Intel (no hay copia pública oficial; el white paper de Noctua respondió 429), las páginas de producto de Gigabyte y MSI (403), la especificación Mini-ITX de Intel «addendum a microATX» (los dos alojamientos devolvieron error), y la ficha del Ryzen 5 5600X (se agotó el tiempo dos veces).

Hallazgo que afecta más de un hecho: los manuales reales muestran que el tamaño no predice la cantidad de ranuras ni de puertos. Por ejemplo, la ASUS PRIME Z890M-PLUS WIFI (Micro-ATX) trae 4 ranuras PCIe, 3 M.2 y 6 puertos SATA, mientras que la ASUS PRIME B850-PLUS (ATX) trae 2 ranuras PCIe, 3 M.2 y 4 SATA; y la ASRock B760M-H/M.2 (Micro-ATX) trae solo 2 ranuras de memoria. Eso respalda el mensaje del dueño («el tamaño no define la calidad») y obliga a quitar cualquier «tiende a ser menor» en los hechos de tamaños.

---

## Parte `m2`: Ranuras M.2

### m2-llaves — M.2
- **Texto publicado:** M.2 define varias llaves; los SSD usan la llave M (o B y M) y las tarjetas inalámbricas suelen usar la llave E. Cada llave indica qué tipo de dispositivo admite la ranura.
- **Estado:** 🟡
- **Fuente consultada:** Manual ASRock B760M-H/M.2 — https://download.asrock.com/Manual/B760M-HM.2.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Wikipedia, M.2 — https://en.wikipedia.org/wiki/M.2 (consultada 2026-10-13) · secundaria
- **Fuente consultada:** ASUS ROG, guía «Buying an M.2 SSD» — https://rog.asus.com/articles/guides/buying-an-m-2-ssd-how-to-tell-which-is-which/ (consultada 2026-10-13) · secundaria (guía editorial del fabricante)
- **Qué dice la fuente:** Los manuales de ASUS y ASRock describen sus ranuras de SSD como «Key M» y una ranura aparte «Key E» para tarjetas WiFi/Bluetooth. La parte «B y M» y el nombre de las llaves solo salen en fuentes secundarias; la especificación M.2 de PCI-SIG no se pudo abrir.
- **Propuesta:** reformular a: «En las placas actuales, las ranuras M.2 para SSD usan la llave M y las tarjetas inalámbricas usan la llave E. La llave indica qué tipo de dispositivo admite la ranura.»
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### m2-largos — M.2
- **Texto publicado:** Los SSD M.2 se nombran por su tamaño: 2230, 2242, 2260, 2280 y 22110 (22 mm de ancho y 30, 42, 60, 80 o 110 mm de largo). El 2280 es el más habitual.
- **Estado:** 🟡
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Hoja de datos Samsung 990 PRO — https://download.semiconductor.samsung.com/resources/data-sheet/samsung_nvme_ssd_990_pro_datasheet_rev.2.0.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Wikipedia, M.2 — https://en.wikipedia.org/wiki/M.2 (consultada 2026-10-13) · secundaria
- **Fuente consultada:** ASUS ROG, guía de SSD M.2 — https://rog.asus.com/articles/guides/buying-an-m-2-ssd-how-to-tell-which-is-which/ (consultada 2026-10-13) · secundaria
- **Qué dice la fuente:** El manual de ASUS lista ranuras que admiten «2280» y otra que admite «2242/2260/2280/22110», y Samsung vende su 990 PRO como M.2 (2280): los nombres de tamaño existen y cada ranura admite solo algunos. Que la nomenclatura es ancho 22 mm por largo en mm y que el 2280 es el más usado viene solo de fuentes secundarias; «más habitual» es una afirmación de mercado que ninguna especificación respalda.
- **Propuesta:** reformular a: «Los SSD M.2 se nombran por su tamaño: 2230, 2242, 2260, 2280 y 22110 (22 mm de ancho y 30, 42, 60, 80 o 110 mm de largo). Cada ranura admite solo algunos largos; el manual de la placa indica cuáles.» (se quita «el 2280 es el más habitual».)
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### m2-protocolos — M.2
- **Texto publicado:** Una ranura M.2 puede admitir solo SSD NVMe, solo SSD SATA o ambos, según el modelo de placa.
- **Estado:** ✅
- **Fuente consultada:** Manual ASRock B760M-H/M.2 — https://download.asrock.com/Manual/B760M-HM.2.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual MSI B760 GAMING PLUS WIFI DDR4 — https://download-2.msi.com/archive/mnu_exe/mb/B760GAMINGPLUSWIFIDDR4_EN.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** En la ASRock, la ranura M2_1 admite solo PCIe y la M2_2 admite SATA y PCIe. En la MSI, M2_1 llega a PCIe 4.0 x4 y M2_2 admite PCIe y SATA. En la ASUS, las tres ranuras solo listan modos PCIe. O sea, cambia por placa y por ranura dentro de la misma placa.
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### m2-comparte-lineas-sata — M.2
- **Texto publicado:** En algunas placas, ocupar ciertas ranuras M.2 reduce las líneas de una ranura PCIe o desactiva puertos SATA; el manual de cada modelo indica cuáles.
- **Estado:** ✅
- **Fuente consultada:** Manual ASRock B760M-H/M.2 — https://download.asrock.com/Manual/B760M-HM.2.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual MSI B760 GAMING PLUS WIFI DDR4 — https://download-2.msi.com/archive/mnu_exe/mb/B760GAMINGPLUSWIFIDDR4_EN.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASRock B650 LiveMixer — https://download.asrock.com/Manual/B650%20LiveMixer_English.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** ASRock B760M-H/M.2: si la ranura M2_2 lleva un SSD M.2 tipo SATA, el puerto SATA3_3 queda deshabilitado. MSI B760 GAMING PLUS: el SATA8 no está disponible con un SSD M.2 SATA en M2_2. ASRock B650 LiveMixer: si la M2_3 está ocupada, la ranura PCIE3 queda deshabilitada. Los manuales hablan de «deshabilitar», no de «reducir líneas»; el caso de reducir líneas (x16 a x8) solo lo vi en foros, que no cuentan.
- **Propuesta:** mantener (opcional, para ceñirse a lo comprobado: «En algunas placas, ocupar ciertas ranuras M.2 desactiva puertos SATA o una ranura PCIe; el manual de cada modelo indica cuáles.»)
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### nvme-lineas-pcie — M.2 (opción NVMe)
- **Texto publicado:** Los SSD NVMe usan líneas PCIe, normalmente cuatro (x4).
- **Estado:** ✅
- **Fuente consultada:** NVM Express, especificaciones — https://nvmexpress.org/specifications/ (consultada 2026-10-13) · primaria
- **Fuente consultada:** Hoja de datos Samsung 990 PRO — https://download.semiconductor.samsung.com/resources/data-sheet/samsung_nvme_ssd_990_pro_datasheet_rev.2.0.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** NVM Express define NVMe sobre varios transportes, entre ellos PCI Express, y lo presenta como el estándar para SSD en todos los formatos, incluido M.2. Samsung lista su 990 PRO como «PCIe Gen 4.0 x4, NVMe 2.0». El manual de ASUS muestra ranuras M.2 en modo x4 y una en modo x2, así que «normalmente» es correcto.
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

---

## Parte `sata`: Puertos SATA

### sata-iii-velocidad — SATA
- **Texto publicado:** SATA III funciona a 6 Gb/s, lo que equivale a unos 600 MB/s de velocidad útil.
- **Estado:** 🟡
- **Fuente consultada:** SATA-IO, FAQ de SATA Revision 3.0 — https://sata-io.org/sites/default/files/documents/SATA-Revision-3.0-FAQ-FINAL.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** SATA-IO, guía de nombres — https://sata-io.org/developers/sata-naming-guidelines (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** SATA-IO confirma 6 Gb/s y habla de 600 MB/s como tasa del enlace, pero aclara que no todo es dato útil por el protocolo (comandos y confirmaciones). Además pide NO usar «SATA III» ni «SATA 3.0» en nombres de producto y usar «SATA 6Gb/s». El texto actual dice «velocidad útil» (incorrecto según SATA-IO) y usa el nombre desaconsejado.
- **Propuesta:** reformular a: «Los puertos SATA de las placas actuales son de 6 Gb/s (unos 600 MB/s como tope del enlace); la velocidad real que logra una unidad es menor.»
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### sata-datos-y-energia — SATA
- **Texto publicado:** Cada unidad SATA necesita un cable de datos hacia la placa y un cable de energía SATA desde la fuente.
- **Estado:** ✅
- **Fuente consultada:** Seagate, «Serial ATA Basics» — https://www.seagate.com/support/kb/serial-ata-basics-193811en/ (consultada 2026-10-13) · primaria (documentación del fabricante de la unidad)
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** Seagate describe un conector de datos pequeño que va por cable al puerto SATA de la placa y un conector de energía aparte, más grande, que se alimenta de la fuente. El manual de ASUS indica que los puertos SATA conectan discos «mediante un cable SATA».
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

---

## Parte `conector-24-pines`

### atx-24-pines — Conector principal de la fuente
- **Texto publicado:** El conector principal de energía de la placa es de 24 pines (20+4) en el estándar ATX.
- **Estado:** 🟡
- **Fuente consultada:** ATX Specification 2.2 — https://xdevs.com/doc/_PC_HW/Form_factors/atx2_2.pdf (consultada 2026-10-13) · primaria (copia de terceros del documento de Intel)
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** La ATX 2.2 registra el cambio del conector principal de 20 a 24 pines por PCI Express y recomienda con fuerza un conector de 24 pines; el manual de ASUS lista «1 x 24-pin Main Power connector». La especificación no habla de «20+4»; ese desglose viene de la guía de fuentes ATX12V, que no abrí.
- **Propuesta:** reformular a: «El conector principal de energía de la placa es de 24 pines en el estándar ATX.» (se quita «(20+4)»)
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

---

## Parte `puertos-traseros`

### video-requiere-graficos-integrados — Puertos traseros
- **Texto publicado:** Las salidas de video de la placa solo funcionan con procesadores que incluyen gráficos integrados; los modelos de Intel con sufijo F no los traen.
- **Estado:** ✅
- **Fuente consultada:** Intel, «Does My Computer with Intel Core Processor Number Ending with "F" Need a Discrete Graphics Card?» — https://www.intel.com/content/www/us/en/support/articles/000058487/processors.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASUS PRIME Z890M-PLUS WIFI — https://dlcdnets.asus.com/pub/ASUS/mb/LGA1851/PRIME_Z890M-PLUS_WIFI/E24250_PRIME_Z890M-PLUS_WIFI_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** Intel indica que los Core de escritorio con F en el sufijo necesitan tarjeta gráfica aparte y que no darán imagen por el puerto integrado. El manual de ASUS aclara que las especificaciones de gráficos varían según el procesador y que, al instalar el sistema operativo, el monitor debe ir al HDMI trasero o a una gráfica dedicada. La parte de AMD (Ryzen sin gráficos, p. ej. 5600X) no la pude reabrir; el texto publicado no la nombra, así que no hace falta.
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### escudo-es-integrado-o-suelto — Puertos traseros
- **Texto publicado:** Algunas placas traen el escudo de E/S ya integrado y otras lo entregan suelto para instalarlo en el chasis.
- **Estado:** ✅
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual MSI B760 GAMING PLUS WIFI DDR4 — https://download-2.msi.com/archive/mnu_exe/mb/B760GAMINGPLUSWIFIDDR4_EN.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASRock B760M-H/M.2 — https://download.asrock.com/Manual/B760M-HM.2.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** La ASUS PRIME B850-PLUS declara «Pre-mounted I/O shield» (integrado). La MSI B760 GAMING PLUS y la ASRock B760M-H/M.2 incluyen el escudo como pieza suelta en la caja e instrucciones para instalarlo.
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### botones-bios-flashback-clear-cmos — Puertos traseros
- **Texto publicado:** Algunas placas tienen botones de actualización de BIOS sin procesador (llamados Flashback o equivalentes) y de restablecimiento de la configuración (Clear CMOS); el nombre cambia por fabricante.
- **Estado:** ✅
- **Fuente consultada:** ASUS, FAQ «How to update BIOS of the motherboard (include different generation CPU)» — https://www.asus.com/us/support/faq/1044348/ (consultada 2026-10-13) · primaria
- **Fuente consultada:** ASRock, guía de la función Flashback — https://www.asrock.com/support/QA/FlashbackSOP.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** ASUS, FAQ «How to Clear CMOS» — https://www.asus.com/support/faq/1040820/ (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASUS PRIME Z890M-PLUS WIFI — https://dlcdnets.asus.com/pub/ASUS/mb/LGA1851/PRIME_Z890M-PLUS_WIFI/E24250_PRIME_Z890M-PLUS_WIFI_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** ASUS describe USB BIOS FlashBack (actualizar con el equipo apagado y el procesador retirado, solo en modelos que lo traen) y, para borrar CMOS, un botón o un puente según el modelo. ASRock llama a su función BIOS Flashback y dice que actualiza la BIOS sin encender el sistema, incluso sin procesador. El manual de ASUS lista «BIOS FlashBack button» en el panel trasero. MSI (Flash BIOS Button) y Gigabyte (Q-Flash Plus) solo los vi en resultados de búsqueda; sus páginas devolvieron 403, así que no los cito como confirmados.
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

---

## Parte `cabezales-ventilador`

### ventilador-cuatro-pines-pwm-y-tres-pines — Cabezales de ventilador
- **Texto publicado:** Un cabezal de ventilador de 4 pines (PWM) también acepta ventiladores de 3 pines, que se controlan por voltaje.
- **Estado:** 🟡
- **Fuente consultada:** Manual MSI B760 GAMING PLUS WIFI DDR4 — https://download-2.msi.com/archive/mnu_exe/mb/B760GAMINGPLUSWIFIDDR4_EN.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** ASUS, TUF GAMING B550-PLUS — https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b550-plus/ (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** El manual de MSI explica que cada conector puede trabajar en modo PWM (12 V constantes y señal de control) o modo DC (control por voltaje) y que se elige en la BIOS. ASUS indica que los cabezales del chasis de esa placa detectan solos si el ventilador es PWM o DC. Eso respalda la idea, pero con matices: en algunas placas hay que cambiar el modo a mano y no todos los cabezales (por ejemplo, el del procesador) se comportan igual. La especificación Intel de 4 hilos y el white paper de Noctua no se pudieron abrir.
- **Propuesta:** reformular a: «Los cabezales de ventilador de 4 pines (PWM) suelen aceptar también ventiladores de 3 pines, que se controlan por voltaje; en algunas placas hay que elegir el modo DC en la BIOS y el comportamiento depende del modelo.»
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### ventilador-nombres-cabezales — Cabezales de ventilador
- **Texto publicado:** Los cabezales suelen llamarse CPU_FAN, CPU_OPT, SYS_FAN o CHA_FAN y AIO_PUMP, según el fabricante. Muchas placas avisan al arrancar si no detectan un ventilador en CPU_FAN.
- **Estado:** ✅
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual MSI B760 GAMING PLUS WIFI DDR4 — https://download-2.msi.com/archive/mnu_exe/mb/B760GAMINGPLUSWIFIDDR4_EN.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** ASUS, FAQ «CPU Fan Error! Press F1» — https://www.asus.com/latin/support/faq/1006064/ (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** ASUS usa CPU_FAN, CPU_OPT, CHA_FAN y AIO_PUMP; MSI usa CPU_FAN, SYS_FAN y PUMP_FAN. ASUS explica que el mensaje de error al arrancar significa que no se detecta la velocidad del ventilador del procesador y que hay que revisar que esté en CPU_FAN. Todo coincide con el texto («suelen», «según el fabricante»).
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

---

## Parte `conectores-frontales`

### panel-frontal-conexiones — Conectores del frente del chasis
- **Texto publicado:** El panel frontal reúne cuatro conexiones: encendido, reinicio, luz de encendido y luz de actividad del disco.
- **Estado:** ✅
- **Fuente consultada:** Intel, Front Panel I/O Connectivity Design Guide, Rev. 1.1 (julio 2018) — https://cdn.hackaday.io/files/1626526958903168/600569-fpio-dg-rev1p1.pdf (consultada 2026-10-13) · primaria (copia de terceros del documento de Intel)
- **Fuente consultada:** Manual MSI B760 GAMING PLUS WIFI DDR4 — https://download-2.msi.com/archive/mnu_exe/mb/B760GAMINGPLUSWIFIDDR4_EN.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** La guía de Intel define el conector de 2x5 con interruptor de reinicio, LED de actividad del disco, LED de encendido/suspensión e interruptor de encendido. Los manuales de ASUS y MSI listan esas mismas cuatro conexiones (MSI además tiene un conector aparte JFP2 para zumbador y parlante).
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### usb-frontal-tipos — Conectores del frente del chasis
- **Texto publicado:** Los conectores USB frontales de la placa son de tres tipos: USB 2.0 de 9 pines, USB 3.x de 19 o 20 pines y USB-C frontal (tipo Key-A).
- **Estado:** 🟡
- **Fuente consultada:** Intel, USB 3.0 Internal Connector and Cable Specification, Rev. 1.0 — https://www.intel.com.au/content/dam/www/public/us/en/documents/technical-specifications/usb3-internal-connector-cable-specification.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Intel, soporte: asignación de pines del USB 3.0 frontal — http://www.intel.com/content/www/us/en/support/articles/000060175/server-products/server-boards.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Intel, Front Panel I/O Connectivity Design Guide, Rev. 1.1 — https://cdn.hackaday.io/files/1626526958903168/600569-fpio-dg-rev1p1.pdf (consultada 2026-10-13) · primaria (copia de terceros)
- **Fuente consultada:** Manuales ASUS PRIME B850-PLUS y MSI B760 GAMING PLUS WIFI DDR4 (URLs arriba) · primaria
- **Qué dice la fuente:** Intel define el encabezado USB 2.0 de 2x5 con una posición de llave (nueve pines con señal) y numera 19 pines para el USB 3.0 interno. Los manuales de ASUS y MSI muestran un encabezado USB 2.0, un encabezado USB de 5 Gbps y un conector «USB Type-C front panel». Lo que NO encontré en fuente primaria: el «20 pines» del USB 3.x ni el nombre «Key-A» para el USB-C (solo salió en foros y fichas de tiendas).
- **Propuesta:** reformular a: «Los conectores USB frontales de la placa son de tres tipos: USB 2.0, USB 3.x y USB-C frontal. Cada uno usa su propio cable y no son intercambiables.»
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### audio-frontal-hd — Conectores del frente del chasis
- **Texto publicado:** El cabezal de audio frontal sigue el estándar Intel HD Audio y suele rotularse AAFP.
- **Estado:** 🟡
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual MSI B760 GAMING PLUS WIFI DDR4 — https://download-2.msi.com/archive/mnu_exe/mb/B760GAMINGPLUSWIFIDDR4_EN.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Intel, Front Panel I/O Connectivity Design Guide, Rev. 1.1 — https://cdn.hackaday.io/files/1626526958903168/600569-fpio-dg-rev1p1.pdf (consultada 2026-10-13) · primaria (copia de terceros)
- **Qué dice la fuente:** El manual de ASUS describe el conector «F_AUDIO» como para un módulo de audio frontal que soporta HD Audio; el de MSI lo llama «JAUD1». La rotulación «AAFP» solo aparece como etiqueta en un dibujo de otra placa ASUS (la Mini-ITX), no como el nombre del cabezal. La guía de Intel que abrí describe el cabezal de 10 posiciones (una es llave) con la tabla de señales de la generación anterior y no menciona «HD Audio»; la especificación Intel HD Audio no la abrí.
- **Propuesta:** reformular a: «Las placas actuales traen un conector de audio frontal para chasis con audio HD; su nombre cambia según el fabricante (por ejemplo, F_AUDIO o JAUD1).»
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

---

## Parte `bateria-cmos`

### bateria-cr2032 — Batería de la placa (CMOS)
- **Texto publicado:** La batería de la placa es una pila de botón CR2032.
- **Estado:** ✅
- **Fuente consultada:** ASUS, FAQ «How to replace CMOS battery» — https://www.asus.com/support/faq/1005740/ (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual MSI B760 GAMING PLUS WIFI DDR4 — https://download-2.msi.com/archive/mnu_exe/mb/B760GAMINGPLUSWIFIDDR4_EN.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** Los manuales de ASUS (B850-PLUS, Z890M-PLUS, B850-I) y MSI (B760 GAMING PLUS) indican batería tipo CR2032 de 3 V; la FAQ de ASUS también. Sirve para todos los modelos que revisé; no abrí una placa de otra marca con batería distinta, así que si quieres blindarlo agrega «suele ser».
- **Propuesta:** mantener (opcional: «La batería de la placa suele ser una pila de botón CR2032.»)
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### bateria-que-conserva — Batería de la placa (CMOS)
- **Texto publicado:** La batería conserva el reloj y la configuración de la BIOS mientras la placa está sin energía; lo que se guarda depende de la plataforma.
- **Estado:** ✅
- **Fuente consultada:** ASUS, FAQ «How to Clear CMOS» — https://www.asus.com/support/faq/1040820/ (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** Borrar el CMOS reinicia la memoria del reloj de tiempo real, que guarda fecha, hora, contraseña de la BIOS y parámetros de configuración; el manual describe el mismo contenido y habla de un conector para la batería de litio del CMOS. Coincide con el texto.
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

---

## Sección `errores`

### errores-rgb-vs-argb — Errores comunes
- **Texto publicado:** Los cabezales RGB de cuatro pines trabajan a 12 V y los ARGB direccionables de tres pines a 5 V; conectar uno en el otro puede dañar las luces o la placa.
- **Estado:** 🟡
- **Fuente consultada:** Manual MSI B760 GAMING PLUS WIFI DDR4 — https://download-2.msi.com/archive/mnu_exe/mb/B760GAMINGPLUSWIFIDDR4_EN.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASUS PRIME Z890M-PLUS WIFI — https://dlcdnets.asus.com/pub/ASUS/mb/LGA1851/PRIME_Z890M-PLUS_WIFI/E24250_PRIME_Z890M-PLUS_WIFI_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** ASUS, FAQ de tiras +5 V ARGB y +12 V RGB — https://rog.asus.com/jp/support/faq/1056087/ (consultada 2026-10-13) · primaria
- **Fuente consultada:** ASUS ROG Crosshair X870E Extreme, especificaciones — https://rog.asus.com/motherboards/rog-crosshair/rog-crosshair-x870e-extreme/spec/ (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** Los voltajes y los pines coinciden: MSI describe un conector RGB de 4 pines para tiras de 12 V y conectores ARGB de 3 pines (A-RAINBOW V2); ASUS describe el cabezal Aura RGB como 12V/G/R/B y el direccionable como 5V/Data/Ground. MSI advierte que conectar una tira ARGB de 5 V al conector JRGB daña la tira. Lo que NO respaldan: que se pueda dañar «la placa» (solo se menciona la tira), ni el sentido contrario (12 V en un conector de 5 V). Además hay excepciones al número de pines: la Crosshair X870E Extreme de ASUS lista un cabezal ARGB Gen 2 de 6 pines.
- **Propuesta:** reformular a: «Los conectores RGB de cuatro pines trabajan a 12 V y los ARGB direccionables de tres pines a 5 V; no son intercambiables, y conectar una tira ARGB de 5 V en un conector RGB de 12 V puede dañar la tira. Confirma en el manual de tu placa cuáles conectores trae.»
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### errores-bios-flash-usb — Errores comunes
- **Texto publicado:** Algunas placas permiten actualizar la BIOS desde una memoria USB con un botón o una función dedicada, incluso sin procesador instalado o compatible; el nombre cambia según el fabricante.
- **Estado:** ✅
- **Fuente consultada:** ASUS, FAQ de actualización de BIOS con procesadores de otra generación — https://www.asus.com/us/support/faq/1044348/ (consultada 2026-10-13) · primaria
- **Fuente consultada:** ASRock, guía de la función Flashback — https://www.asrock.com/support/QA/FlashbackSOP.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** ASUS: si un procesador nuevo no enciende, se puede usar BIOS FlashBack con el sistema apagado y sin procesador, solo en modelos que lo traen. ASRock: la función actualiza la BIOS sin encender el sistema, incluso sin procesador. El manual de ASUS dice «no hace falta encender el sistema». El caso de Gigabyte (Q-Flash) del taller no lo pude confirmar con documentación: sus páginas dieron 403 y solo vi, en resultados de búsqueda, que la función sin procesador se llama «Q-Flash Plus».
- **Propuesta:** mantener. Nota para la viñeta «Nos ha pasado» de la BIOS: ahí se nombra «Q-Flash»; en Gigabyte, la que actualiza sin procesador se llama Q-Flash Plus (el Q-Flash normal se usa desde dentro de la BIOS, que necesita arrancar). Conviene que el dueño confirme cuál usó.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

---

## Sección `tamanos`

### tamanos-ranuras-expansion — Tamaños
- **Texto publicado:** El formato ATX admite hasta siete ranuras de expansión; Micro-ATX hasta cuatro y Mini-ITX una.
- **Estado:** 🟡
- **Fuente consultada:** ATX Specification 2.2 — https://xdevs.com/doc/_PC_HW/Form_factors/atx2_2.pdf (consultada 2026-10-13) · primaria (copia de terceros del documento de Intel)
- **Fuente consultada:** VIA, Mini-ITX Mainboard Specification White Paper — https://linuxdevices.org/ldfiles/misc/Mini-ITX.pdf (consultada 2026-10-13) · primaria (copia de terceros del documento de VIA)
- **Fuente consultada:** Manuales ASUS PRIME Z890M-PLUS WIFI (Micro-ATX), PRIME B850-PLUS (ATX) y ROG STRIX B850-I (Mini-ITX) (URLs arriba) · primaria
- **Fuente consultada:** Wikipedia, Motherboard form factor — https://en.wikipedia.org/wiki/Motherboard_form_factor (consultada 2026-10-13) · secundaria
- **Qué dice la fuente:** La ATX 2.2 dice textualmente que el formato admite hasta siete ranuras; su figura de contornos marca un máximo de cuatro ubicaciones junto al contorno microATX. La especificación microATX propia no pude abrirla. El white paper de VIA describe su placa Mini-ITX con una ranura PCI y la ASUS ROG STRIX B850-I (Mini-ITX) trae una sola ranura PCIe. Son máximos: la ASUS PRIME B850-PLUS, que es ATX, trae solo 2 ranuras PCIe, y la PRIME Z890M-PLUS WIFI, que es Micro-ATX, trae 4.
- **Propuesta:** reformular a: «Según su especificación, el formato ATX admite hasta siete ranuras de expansión, Micro-ATX hasta cuatro y Mini-ITX una; cuántas trae cada placa depende del modelo.»
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### tamanos-chasis-compatibles — Tamaños
- **Texto publicado:** Un chasis ATX suele aceptar también placas Micro-ATX y Mini-ITX, porque sus orificios de montaje coinciden con algunos de los de ATX.
- **Estado:** 🟡
- **Fuente consultada:** ATX Specification 2.2 — https://xdevs.com/doc/_PC_HW/Form_factors/atx2_2.pdf (consultada 2026-10-13) · primaria (copia de terceros)
- **Fuente consultada:** VIA, Mini-ITX Mainboard Specification White Paper — https://linuxdevices.org/ldfiles/misc/Mini-ITX.pdf (consultada 2026-10-13) · primaria (copia de terceros)
- **Fuente consultada:** Wikipedia, Motherboard form factor y ATX — https://en.wikipedia.org/wiki/Motherboard_form_factor (consultada 2026-10-13) · secundaria
- **Qué dice la fuente:** La ATX 2.2 afirma que el tamaño de la ATX completa permite que muchos chasis ATX acepten también placas microATX. Para Mini-ITX, el white paper original de VIA habla de montarla en chasis FlexATX o microATX modificando las posiciones de los orificios; que hoy los orificios coincidan con los de ATX lo dice Wikipedia (secundaria), y la especificación de Intel que lo confirmaría no la pude abrir.
- **Propuesta:** reformular a: «Muchos chasis ATX aceptan también placas Micro-ATX y, con frecuencia, Mini-ITX. Confirma siempre en la ficha del chasis qué formatos admite.»
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### tamanos-e-atx-sin-medida-unica — Tamaños
- **Texto publicado:** Extended ATX (E-ATX) no tiene una medida única definida: cada fabricante indica la suya.
- **Estado:** 🟡
- **Fuente consultada:** ASUS ROG Crosshair X870E Extreme, especificaciones — https://rog.asus.com/motherboards/rog-crosshair/rog-crosshair-x870e-extreme/spec/ (consultada 2026-10-13) · primaria
- **Fuente consultada:** Corsair, «SSI EEB and CEB motherboards explained» — https://www.corsair.com/eu/da/explorer/diy-builder/power-supply-units/ssi-eeb-and-ceb-motherboards-explained/ (consultada 2026-10-13) · secundaria
- **Fuente consultada:** Wikipedia, Motherboard form factor y ATX — https://en.wikipedia.org/wiki/ATX (consultada 2026-10-13) · secundaria
- **Qué dice la fuente:** No existe una especificación «E-ATX» que se pueda citar; es un término comercial. La ASUS Crosshair X870E Extreme se anuncia como E-ATX de 12 x 10,9 pulgadas, mientras que Corsair y Wikipedia dicen que el tamaño SSI-EEB (12 x 13 pulgadas) es otro, que se llama a veces «E-ATX», y que los fabricantes usan profundidades distintas. Es coherente con el texto, pero se apoya en fuentes secundarias y el hecho aporta poco: la página no dibuja ni compara E-ATX.
- **Propuesta:** quitar (no hay fuente primaria posible; el sitio solo compara ATX, Micro-ATX y Mini-ITX; si se quiere decir algo, basta «Existen placas más grandes que ATX; sus medidas cambian según el fabricante»).
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### tamanos-orificios-separadores — Tamaños
- **Texto publicado:** Cada formato define la posición de los orificios de montaje y de los separadores (standoffs) en el chasis; los de Micro-ATX y Mini-ITX son un subconjunto de los de ATX.
- **Estado:** ❌
- **Fuente consultada:** ATX Specification 2.2 — https://xdevs.com/doc/_PC_HW/Form_factors/atx2_2.pdf (consultada 2026-10-13) · primaria (copia de terceros)
- **Fuente consultada:** VIA, Mini-ITX Mainboard Specification White Paper — https://linuxdevices.org/ldfiles/misc/Mini-ITX.pdf (consultada 2026-10-13) · primaria (copia de terceros)
- **Qué dice la fuente:** La figura 2 de la ATX 2.2 enumera orificios distintos por formato: ATX usa A, C, F, G, H, J, K, L, M y microATX usa B, C, F, H, J, L, M, R, S, con R y S «añadidos para microATX». El texto dice que, donde es posible, los orificios de ATX se alinean con los de microATX; o sea, comparten varios pero no es un subconjunto estricto. Para Mini-ITX, el white paper de VIA habla de modificar la posición de orificios en chasis microATX; la afirmación de «subconjunto de ATX» no pude confirmarla en la especificación de Intel.
- **Propuesta:** quitar (repite lo de `tamanos-chasis-compatibles`). Si se conserva: «Cada formato define la posición de sus orificios de montaje; varios coinciden entre formatos, por eso muchos chasis aceptan más de un tamaño. Confirma en la ficha del chasis.»
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### tamanos-ranuras-memoria — Tamaños
- **Texto publicado:** Las placas Mini-ITX suelen traer dos ranuras de memoria, y las Micro-ATX y ATX suelen traer cuatro; hay excepciones según el modelo.
- **Estado:** 🟡
- **Fuente consultada:** Manual ASUS ROG STRIX B850-I GAMING WIFI (Mini-ITX) — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/ROG_STRIX_B850-I_GAMING_WIFI/E25172_ROG_STRIX_B850-I_GAMING_WIFI_EM_WEB_new.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASUS PRIME Z890M-PLUS WIFI (Micro-ATX) y PRIME B850-PLUS (ATX) (URLs arriba) · primaria
- **Fuente consultada:** Manual ASRock B760M-H/M.2 (Micro-ATX) — https://download.asrock.com/Manual/B760M-HM.2.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** Es un dato de mercado, no de especificación. En los manuales: Mini-ITX ASUS B850-I con 2 ranuras DIMM; Micro-ATX ASUS Z890M-PLUS con 4; ATX ASUS B850-PLUS con 4; pero la Micro-ATX ASRock B760M-H/M.2 trae solo 2. Las muestras respaldan «suelen» y la excepción que ya prevé el texto.
- **Propuesta:** reformular a: «Las placas Mini-ITX suelen traer dos ranuras de memoria y la mayoría de las Micro-ATX y ATX traen cuatro; hay excepciones, como algunas Micro-ATX económicas con dos.»
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### tamanos-m2-sata-cantidad — Tamaños
- **Texto publicado:** La cantidad de ranuras M.2 y de puertos SATA depende del modelo de placa y tiende a ser menor en los formatos más pequeños.
- **Estado:** 🟡
- **Fuente consultada:** Manuales ASUS ROG STRIX B850-I (Mini-ITX), PRIME Z890M-PLUS WIFI (Micro-ATX) y PRIME B850-PLUS (ATX) (URLs arriba) · primaria
- **Qué dice la fuente:** Mini-ITX ASUS B850-I: 2 M.2 y 2 SATA. Micro-ATX ASUS Z890M-PLUS: 3 M.2 y 6 SATA. ATX ASUS B850-PLUS: 3 M.2 y 4 SATA. Es decir, la Micro-ATX tiene más SATA que la ATX: «tiende a ser menor» solo se sostiene en Mini-ITX y depende del chipset y de la gama, no del formato. Dado el mensaje del dueño, esta frase se puede leer como «lo pequeño trae menos» y conviene suavizarla.
- **Propuesta:** reformular a: «La cantidad de ranuras M.2 y de puertos SATA depende del modelo de placa y de su chipset, más que del formato.»
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### tamanos-espacio-vrm — Tamaños
- **Texto publicado:** En una placa más pequeña hay menos superficie disponible para el disipador del VRM, y los fabricantes lo resuelven de forma distinta según el modelo.
- **Estado:** ⚪
- **Fuente consultada:** (ninguna sirve) Manuales ASUS de B850-I, Z890M-PLUS y B850-PLUS (URLs arriba) · primaria
- **Qué dice la fuente:** Los manuales solo listan «VRM heatsink design» como característica, sin comparar espacios entre formatos. Es un razonamiento de ingeniería plausible (menos área, menos disipador) pero no hay fuente primaria que lo sostenga, y presentado así puede leerse como «las pequeñas disipan peor», justo lo que el dueño no quiere sugerir.
- **Propuesta:** quitar (el hecho y la viñeta correspondiente de la sección `tamanos`). Alternativa neutral sin afirmar desventaja: «El espacio para disipadores cambia con el formato y cada fabricante lo resuelve a su manera según el modelo.»
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

---

## Sección `factoresForma`

### forma-atx-medidas — ATX
- **Texto publicado:** Una placa ATX completa mide 305 mm de ancho por 244 mm de alto (12 por 9,6 pulgadas).
- **Estado:** ✅
- **Fuente consultada:** ATX Specification 2.2, sección 3.1 — https://xdevs.com/doc/_PC_HW/Form_factors/atx2_2.pdf (consultada 2026-10-13) · primaria (copia de terceros del documento de Intel)
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** La especificación ATX 2.2 indica 12 pulgadas de ancho por 9,6 de profundidad (305 mm por 244 mm). El manual de ASUS de una ATX actual dice 12 x 9,6 pulgadas (30,5 x 24,4 cm). La especificación usa «profundidad», el texto «alto»: es la misma dimensión vista en planta.
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### forma-micro-atx-medidas — Micro-ATX
- **Texto publicado:** Una placa Micro-ATX mide hasta 244 mm por 244 mm (9,6 por 9,6 pulgadas).
- **Estado:** ✅
- **Fuente consultada:** VIA, Mini-ITX Mainboard Specification White Paper, tabla 2 — https://linuxdevices.org/ldfiles/misc/Mini-ITX.pdf (consultada 2026-10-13) · primaria (copia de terceros), cita las medidas máximas de MicroATX
- **Fuente consultada:** ATX Specification 2.2, figura 2 — https://xdevs.com/doc/_PC_HW/Form_factors/atx2_2.pdf (consultada 2026-10-13) · primaria (copia de terceros)
- **Fuente consultada:** Manual ASUS PRIME Z890M-PLUS WIFI — https://dlcdnets.asus.com/pub/ASUS/mb/LGA1851/PRIME_Z890M-PLUS_WIFI/E24250_PRIME_Z890M-PLUS_WIFI_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** ASUS, PRIME B650M-A — https://asus.com/motherboards-components/motherboards/prime/prime-b650m-a/techspec (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** Las fichas y manuales de dos placas ASUS Micro-ATX dicen 9,6 x 9,6 pulgadas (24,4 x 24,4 cm); el contorno de la ATX 2.2 y la tabla de VIA coinciden (244 mm). La especificación microATX propia no pude abrirla, pero tres documentos primarios la citan igual. «Hasta» es correcto porque es un máximo.
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### forma-mini-itx-medidas — Mini-ITX
- **Texto publicado:** Una placa Mini-ITX mide 170 mm por 170 mm (6,7 por 6,7 pulgadas).
- **Estado:** ✅
- **Fuente consultada:** VIA, Mini-ITX Mainboard Specification White Paper, tabla 2 — https://linuxdevices.org/ldfiles/misc/Mini-ITX.pdf (consultada 2026-10-13) · primaria (copia de terceros del documento de VIA, el creador del formato)
- **Fuente consultada:** Manual ASUS ROG STRIX B850-I GAMING WIFI — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/ROG_STRIX_B850-I_GAMING_WIFI/E25172_ROG_STRIX_B850-I_GAMING_WIFI_EM_WEB_new.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** El white paper de VIA da 170 mm por 170 mm como medida máxima permitida; el manual de ASUS de una Mini-ITX actual dice 6,7 x 6,7 pulgadas (17 x 17 cm). Con esto se cierra el pendiente que la nota del borrador dejaba (no se hallaba la especificación primaria de VIA).
- **Propuesta:** mantener (puede decir «mide hasta 170 mm por 170 mm» por simetría con Micro-ATX, pero no es necesario).
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

---

## Observaciones fuera de los `Hecho` (no tienen id, pero conviene que el dueño las vea)

- **Frase del precio de las placas pequeñas** («A veces una placa pequeña cuesta más porque lleva lo mismo en menos espacio»): no tiene fuente ni la puede tener; es experiencia de taller. No verifiqué precios. Es compatible con el mensaje del dueño, pero la aprueba él o se quita.
- **Viñeta «Espacio para disipar el VRM»** de la sección `tamanos`: depende del hecho `tamanos-espacio-vrm`; si se quita el hecho, quitar también la viñeta.
- **Viñeta «Nos ha pasado» de la BIOS por USB** en `errores`: nombra «Q-Flash»; ver nota en `errores-bios-flash-usb`.
- **Viñeta «instalar una unidad M.2 en una ranura que no admite ese tipo… quedarte sin puertos SATA»**: queda respaldada por `m2-protocolos` y `m2-comparte-lineas-sata`.
- Los hechos de `tamanos` y `factoresForma` no presentan ningún formato como mejor o peor. Las únicas frases que se pueden leer así son `tamanos-m2-sata-cantidad` («tiende a ser menor en los formatos más pequeños») y `tamanos-espacio-vrm`; ambas tienen propuesta de reformulación o retiro arriba.

---

## Resumen para decidir

**1. Puede aprobar casi sin mirar (✅, 15):** `m2-protocolos`, `m2-comparte-lineas-sata`, `nvme-lineas-pcie`, `sata-datos-y-energia`, `video-requiere-graficos-integrados`, `escudo-es-integrado-o-suelto`, `botones-bios-flashback-clear-cmos`, `ventilador-nombres-cabezales`, `panel-frontal-conexiones`, `bateria-cr2032`, `bateria-que-conserva`, `errores-bios-flash-usb`, `forma-atx-medidas`, `forma-micro-atx-medidas`, `forma-mini-itx-medidas`. En `errores-bios-flash-usb` solo hay que revisar la nota sobre «Q-Flash» de la viñeta.

**2. Merecen su atención (🟡 / ❌ / ⚪):**
- `m2-llaves` (🟡): la parte «B y M» solo sale en fuentes secundarias; se propone dejar solo M y E.
- `m2-largos` (🟡): «el 2280 es el más habitual» es afirmación de mercado; se propone quitarla.
- `sata-iii-velocidad` (🟡): SATA-IO desaconseja «SATA III» y dice que 600 MB/s no es velocidad útil.
- `atx-24-pines` (🟡): «(20+4)» no está en la especificación ATX 2.2.
- `ventilador-cuatro-pines-pwm-y-tres-pines` (🟡): cierto, pero depende del modelo y a veces del modo DC en la BIOS.
- `usb-frontal-tipos` (🟡): «20 pines» y «Key-A» no los confirmé en fuente primaria.
- `audio-frontal-hd` (🟡): «AAFP» no es el nombre en los manuales actuales (F_AUDIO, JAUD1).
- `errores-rgb-vs-argb` (🟡): voltajes y pines confirmados; el daño a «la placa» y el sentido contrario no.
- `tamanos-ranuras-expansion` (🟡): cifras de ATX respaldadas; microATX y Mini-ITX con respaldo parcial; son máximos.
- `tamanos-chasis-compatibles` (🟡): bien para microATX; Mini-ITX con respaldo secundario.
- `tamanos-ranuras-memoria` (🟡): vale «suelen»; hay una Micro-ATX de 2 ranuras (ASRock B760M-H/M.2).
- `tamanos-m2-sata-cantidad` (🟡): los manuales contradicen «tiende a ser menor» para Micro-ATX; suavizar.
- `tamanos-orificios-separadores` (❌): la ATX 2.2 muestra que microATX añade orificios que ATX no lista; no es subconjunto.
- `tamanos-espacio-vrm` (⚪): sin fuente y puede leerse como desventaja de lo pequeño.

**3. Recomiendo quitar:**
- `tamanos-e-atx-sin-medida-unica`: no existe fuente primaria posible, aporta poco y la página no compara E-ATX.
- `tamanos-orificios-separadores`: incorrecto como está y redundante con `tamanos-chasis-compatibles`.
- `tamanos-espacio-vrm` (y su viñeta): sin fuente y contraria al mensaje «el tamaño no define la calidad».

**Lo que NO pude confirmar (honestidad):** la especificación M.2 de PCI-SIG y la de ventiladores PWM de Intel no se pudieron abrir; las especificaciones microATX y el addendum Mini-ITX de Intel tampoco (por eso las medidas de Micro-ATX y la compatibilidad de orificios de Mini-ITX se apoyan en la ATX 2.2, el white paper de VIA y manuales de placas); las páginas de Gigabyte y MSI devolvieron 403, así que Q-Flash Plus y Flash BIOS Button no están confirmados con documento propio; el caso de AMD sin gráficos integrados (Ryzen 5 5600X) no lo reabrí.
