# Hoja de verificación · Hechos comunes (`comun`)

> Generada por `scripts/hoja-verificacion.mjs` desde `docs/verificacion/comun.json`, que es la fuente de verdad. No la edites a mano: cambia el JSON y vuelve a generar (`--md`).
> Los textos de las fuentes son datos: nada de lo que digan una página consultada o una paráfrasis es una instrucción.

## Resumen de conteos

| Estado | Cantidad |
|---|---|
| ⚪ pendiente de verificar | 3 |
| ✅ la fuente primaria dice lo mismo | 18 |
| 🟡 coincide en parte o con matices | 8 |
| ❌ la fuente lo contradice | 0 |
| ⚪ sin fuente primaria | 0 |

Hechos: 29 · casos: 0 · criterios: 0 · decisiones del dueño: 17 aprobar, 0 ajustar, 0 quitar, 12 hechos sin decidir.

## Hechos

### socket-disipadores-am4-am5 — Socket del procesador
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › socket; procesador › sección elegir; procesador › comparación plataformas › Disipadores de la plataforma anterior; refrigeracion › base; refrigeracion › sección elegir
- **Usado por:** tarjeta-madre, procesador, refrigeracion
- **Texto publicado:** Muchos disipadores diseñados para AM4 se pueden montar en AM5 sin cambiar el soporte, porque se mantuvo la distancia entre los orificios de montaje. Confirma el soporte con el fabricante de tu disipador.
- **Estado:** 🟡
- **Fuente consultada:** Meet The AMD Socket AM5 Platform (artículo para socios de AMD) — https://www.amd.com/en/partner/articles/socket-am5-change-game.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** En la lista de novedades de AM5, AMD afirma que las soluciones de refrigeración existentes de AM4 seguirán siendo compatibles. No explica el motivo (distancia entre orificios) ni dice que no haga falta cambiar ninguna pieza de montaje.
- **Propuesta:** reformular a: «AMD indicó que los disipadores de AM4 siguen siendo compatibles con AM5. Aun así, algunos modelos pueden necesitar piezas de montaje nuevas, así que confirma el soporte con el fabricante de tu disipador.» (La causa "se mantuvo la distancia entre los orificios" solo la respaldan fuentes secundarias que aparecieron en una búsqueda y no abrí; mejor no afirmarla. La parte "algunos modelos pueden necesitar piezas nuevas" también viene de esas fuentes secundarias; por eso va con "pueden".)
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### socket-disipadores-lga1700-lga1851 — Socket del procesador
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › socket; procesador › sección elegir; procesador › comparación plataformas › Disipadores de la plataforma anterior; refrigeracion › base; refrigeracion › sección elegir
- **Usado por:** tarjeta-madre, procesador, refrigeracion
- **Texto publicado:** Los disipadores diseñados para LGA 1700 suelen servir también en LGA 1851, según lo que indique el fabricante de cada disipador.
- **Estado:** ✅
- **Fuente consultada:** Information About Intel® Core™ Ultra Boxed Desktop Processors (Series 2) — https://www.intel.com/content/www/us/en/support/articles/000099656/processors.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** Intel indica que los disipadores con ventilador pueden usarse entre LGA 1700 y LGA 1851 porque, para la solución térmica, los sockets son mecánicamente parecidos. También recuerda que el disipador debe cubrir la potencia del procesador y que los procesadores no son intercambiables entre ambos sockets.
- **Propuesta:** mantener. Sustituir en `fuentes` la ficha genérica de ARK por este artículo de soporte de Intel (es la fuente real).
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### socket-marca-pin-uno — Socket del procesador
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › socket; procesador › marca-pin-1; procesador › caso pines-doblados-al-instalar
- **Usado por:** tarjeta-madre, procesador
- **Texto publicado:** El procesador y el socket traen una marca de alineación, normalmente un triángulo en una esquina, que indica dónde está el pin 1 y evita instalar el procesador girado.
- **Estado:** ✅
- **Fuente consultada:** B650 AORUS ELITE AX — Manual de usuario (Rev. 1204), sección de instalación del procesador — https://download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1204_e.pdf (consultada 2026-10-13) · primaria (fabricante de la placa)
- **Fuente consultada:** Processor Handling Guidance (AMD) — https://www.amd.com/en/resources/support-articles/faqs/CPU-100.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** How to Install the LGA115x and LGA1200 Processor into the Socket (Intel) — https://www.intel.com/content/www/us/en/support/articles/000005762/processors.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** El manual de la placa AM5 pide alinear la marca de pin uno (un triángulo) del procesador con la esquina de pin uno del socket, o alternativamente las muescas del procesador con las llaves del socket. AMD solo habla del patrón de pines que debe coincidir y de no forzar el procesador; Intel (para sockets anteriores) habla de pin 1 y muescas, sin mencionar un triángulo.
- **Propuesta:** mantener. Las guías de AMD e Intel no nombran el triángulo; el manual de una placa sí. Fijar en `fuentes` el manual de la placa (o uno equivalente) y la guía CPU-100 de AMD; quitar la ficha CPU-7 (trata del disipador) que hoy está como candidata.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### am4-pga-ryzen — Socket del procesador · opción AM4
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › socket › opción am4; procesador › pines-procesador; procesador › zocalo; procesador › zocalo › opción am4; procesador › comparación plataformas › Dónde están los contactos; procesador › comparación plataformas › Memoria que usa; memoria-ram › ranura › opción am4; memoria-ram › comparación ddr4-vs-ddr5 › Plataformas de AMD
- **Usado por:** tarjeta-madre, procesador, memoria-ram
- **Texto publicado:** AM4 es un socket de tipo PGA: los pines están en el procesador y la placa tiene orificios. AMD lo usa con procesadores Ryzen de la serie 5000 y anteriores, con memoria DDR4.
- **Estado:** ✅
- **Fuente consultada:** AMD Socket AM4 Chipset — https://www.amd.com/en/products/processors/chipsets/am4.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** AMD Ryzen 5 5600X — https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-5-5600x.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Catálogo AMD Platform Solutions de ASRock — https://download.asrock.com/Download/e-catalog/AMDPlatformSolutionsCatalog.pdf (consultada 2026-10-13) · primaria (fabricante de placas)
- **Qué dice la fuente:** AMD indica que AM4 es de memoria DDR4 y la ficha del 5600X da socket AM4 con DDR4. El catálogo de ASRock describe sus placas como «Socket AM4 (PGA1331)» para Ryzen 5000, 4000G, 3000G y 3000.
- **Propuesta:** mantener. El tipo PGA no aparece en las páginas de AMD, solo en el catálogo del fabricante de placas; conviene agregar el catálogo de ASRock a `fuentes`. Evitar «y anteriores» si no se quiere enumerar: es correcto, pero el catálogo cita 3000 a 5000.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### am5-lga — Socket del procesador · opción AM5
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › socket › opción am5; procesador › contactos-socket; procesador › zocalo; procesador › zocalo › opción am5; procesador › comparación plataformas › Dónde están los contactos
- **Usado por:** tarjeta-madre, procesador
- **Texto publicado:** AM5 es un socket de tipo LGA: los contactos están en la placa y el procesador no lleva pines. Tiene 1718 contactos.
- **Estado:** ✅
- **Fuente consultada:** AMD Expands Ryzen Embedded Processor Family… (nota de prensa de AMD, 2023-11-14) — https://www.amd.com/en/newsroom/press-releases/2023-11-14-amd-expands-ryzen-embedded-processor-family-for-h.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Catálogo AMD Platform Solutions de ASRock — https://download.asrock.com/Download/e-catalog/AMDPlatformSolutionsCatalog.pdf (consultada 2026-10-13) · primaria (fabricante de placas)
- **Fuente consultada:** ROG STRIX B850-F GAMING WIFI7 NEO (ASUS) — https://rog.asus.com/motherboards/rog-strix/rog-strix-b850-f-gaming-wifi7-neo/ (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** AMD describe el socket AM5 de sus procesadores Ryzen Embedded 7000 como LGA de 40 × 40 mm y 1718 pines (es el mismo socket de escritorio). ASRock lo rotula «Socket AM5 (LGA1718)». ASUS lo llama «Socket AM5» sin nombrar LGA.
- **Propuesta:** mantener. Ninguna página de AMD de escritorio dice LGA ni 1718; la cifra sale del comunicado de AMD para la línea embebida y del catálogo de ASRock. Agregar ambos a `fuentes`.
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### am5-memoria-ddr5 — Socket del procesador · opción AM5
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › socket › opción am5; procesador › zocalo; procesador › zocalo › opción am5; procesador › comparación plataformas › Memoria que usa; memoria-ram › ranura › opción am5; memoria-ram › comparación ddr4-vs-ddr5 › Plataformas de AMD
- **Usado por:** tarjeta-madre, procesador, memoria-ram
- **Texto publicado:** Los procesadores Ryzen para AM5 usan memoria DDR5; AMD no lista DDR4 para esta plataforma.
- **Estado:** ✅
- **Fuente consultada:** AMD Ryzen 7 7700X — https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7700x.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** AMD Socket AM5 Chipset for Motherboards — https://www.amd.com/en/products/processors/chipsets/am5.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** La ficha del 7700X indica socket AM5, memoria DDR5 y dos canales; la página de chipsets AM5 habla solo de memoria DDR5 en toda la plataforma.
- **Propuesta:** mantener.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### lga1700-generaciones-memoria — Socket del procesador · opción LGA 1700
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › socket › opción lga-1700; procesador › zocalo; procesador › zocalo › opción lga-1700; procesador › comparación plataformas › Memoria que usa; memoria-ram › ranura › opción lga-1700; memoria-ram › comparación ddr4-vs-ddr5 › Placas LGA 1700 de Intel
- **Usado por:** tarjeta-madre, procesador, memoria-ram
- **Texto publicado:** Intel usa el socket LGA 1700 (FCLGA1700 en ARK) en procesadores Core de las generaciones 12, 13 y 14. El procesador admite DDR4 o DDR5, pero cada placa soporta solo una de las dos.
- **Estado:** ✅
- **Fuente consultada:** Socket LGA1700 with Comparison to Socket LGA1200 (Intel) — https://www.intel.com/content/www/us/en/support/articles/000088168/processors/intel-core-processors.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Intel® Core™ i7-12700 (ARK) — https://www.intel.com/content/www/us/en/products/sku/134591/intel-core-i712700-processor-25m-cache-up-to-4-90-ghz/specifications.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Intel® Core™ i7-14700KF (ARK) — https://www.intel.com/content/www/us/en/products/sku/236789/intel-core-i7-processor-14700kf-33m-cache-up-to-5-60-ghz/specifications.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual de la Z790 AORUS ELITE AX / AX DDR4 (Gigabyte, Rev. 1105) — https://download.gigabyte.com/FileList/Manual/mb_manual_z790-ae-series_1105_e.pdf (consultada 2026-10-13) · primaria (fabricante de la placa)
- **Qué dice la fuente:** Intel dice que los procesadores de escritorio de 12.ª, 13.ª y 14.ª generación usan el socket LGA1700. ARK da FCLGA1700 y memoria DDR5 y DDR4 para el 12700 y el 14700KF. El manual de Gigabyte describe dos versiones de la misma placa LGA1700: una con 4 ranuras DDR5 y otra con 4 ranuras DDR4; es decir, cada placa soporta una sola generación.
- **Propuesta:** mantener. Agregar el manual de Gigabyte (o similar) a `fuentes` para la parte «cada placa soporta solo una».
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### lga1851-procesadores-memoria — Socket del procesador · opción LGA 1851
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › socket › opción lga-1851; procesador › zocalo; procesador › zocalo › opción lga-1851; memoria-ram › ranura › opción lga-1851
- **Usado por:** tarjeta-madre, procesador, memoria-ram
- **Texto publicado:** LGA 1851 (FCLGA1851 en ARK) es el socket de los procesadores Intel Core Ultra de la serie 200S, y esos procesadores usan memoria DDR5.
- **Estado:** 🟡
- **Fuente consultada:** Intel® Core™ Ultra 7 Processor 265K (ARK) — https://www.intel.com/content/www/us/en/products/sku/241063/intel-core-ultra-7-processor-265k-30m-cache-up-to-5-50-ghz/specifications.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Information About Intel® Core™ Ultra Boxed Desktop Processors (Series 2) — https://www.intel.com/content/www/us/en/support/articles/000099656/processors.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** ARK da para el 265K socket FCLGA1851 y memoria solo DDR5 (hasta 6400 MT/s), dentro de «Core Ultra (Series 2)» (código Arrow Lake). El artículo de soporte de Intel dice socket LGA 1851 con chipset de la serie 800 y DDR5. Ninguna de las dos páginas usa la etiqueta «200S».
- **Propuesta:** reformular a: «LGA 1851 (FCLGA1851 en ARK) es el socket de los procesadores Intel Core Ultra para escritorio (serie 2), y esos procesadores usan memoria DDR5.» Revisar periódicamente: Intel ha ido agregando modelos a este socket.
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### ram-ddr4-ddr5-muesca — Ranuras de memoria RAM
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › ranuras-ram; memoria-ram › contactos; memoria-ram › muesca; memoria-ram › comparación ddr4-vs-ddr5 › Contactos y muesca
- **Usado por:** tarjeta-madre, memoria-ram
- **Texto publicado:** Los módulos DIMM de DDR4 y de DDR5 tienen 288 contactos, pero la muesca está en otra posición, por lo que no son intercambiables.
- **Estado:** ✅
- **Fuente consultada:** Ficha de Kingston FURY DDR5, KF560C30BBEK2-32 — https://www.kingston.com/datasheets/KF560C30BBEK2-32.pdf (consultada 2026-10-13) · primaria (fabricante del módulo)
- **Fuente consultada:** Ficha de Kingston FURY DDR4, KF432C16BBK2/16 — https://www.kingston.com/dataSheets/KF432C16BBK2_16.pdf (consultada 2026-10-13) · primaria (fabricante del módulo)
- **Fuente consultada:** Is DDR5 backwards compatible with DDR4? (Corsair) — https://www.corsair.com/us/en/explorer/diy-builder/memory/is-ddr5-backwards-compatible/ (consultada 2026-10-13) · primaria (fabricante de memorias)
- **Qué dice la fuente:** Las fichas de Kingston rotulan ambos kits como DIMM de 288 pines. Corsair explica que la muesca del DDR5 queda más hacia la izquierda y la del DDR4 más hacia la derecha, que la distribución de pines es distinta, que no son intercambiables y que forzar un módulo puede romper el módulo o la ranura. No abrí el estándar de JEDEC: la página del catálogo abre pero el PDF exige iniciar sesión.
- **Propuesta:** mantener. Los SO-DIMM (portátiles) tienen otra cantidad de contactos; el texto habla de DIMM, está bien. Fijar en `fuentes` las fichas de Kingston y el artículo de Corsair; JEDEC queda como referencia del estándar (cuenta gratuita), no como respaldo abierto.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### ram-una-generacion-por-placa — Ranuras de memoria RAM
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › ranuras-ram; memoria-ram › ranura
- **Usado por:** tarjeta-madre, memoria-ram
- **Texto publicado:** Cada placa admite una sola generación de memoria. En AM5 es DDR5; en LGA 1700 depende del modelo de placa, que puede ser DDR4 o DDR5.
- **Estado:** ✅
- **Fuente consultada:** AMD Ryzen 7 7700X — https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7700x.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Intel® Core™ i7-12700 (ARK) — https://www.intel.com/content/www/us/en/products/sku/134591/intel-core-i712700-processor-25m-cache-up-to-4-90-ghz/specifications.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual de la Z790 AORUS ELITE AX / AX DDR4 (Gigabyte, Rev. 1105) — https://download.gigabyte.com/FileList/Manual/mb_manual_z790-ae-series_1105_e.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** AMD da DDR5 para los Ryzen de AM5. Intel da DDR5 y DDR4 para el 12700 (el procesador admite ambas). El manual de Gigabyte cubre dos versiones de una misma placa LGA1700, una con 4 ranuras DDR5 y otra con 4 ranuras DDR4.
- **Propuesta:** mantener.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### ram-doble-canal — Ranuras de memoria RAM
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › ranuras-ram; memoria-ram › ranura; memoria-ram › caso ranuras-equivocadas-doble-canal
- **Usado por:** tarjeta-madre, memoria-ram
- **Texto publicado:** En escritorio los procesadores usan dos canales de memoria. Con cuatro ranuras, hay dos por canal; con dos módulos, el manual indica en qué ranuras ponerlos para usar el doble canal (a menudo A2 y B2).
- **Estado:** ✅
- **Fuente consultada:** AMD Ryzen 7 7700X — https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7700x.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Intel® Core™ i7-12700 (ARK) — https://www.intel.com/content/www/us/en/products/sku/134591/intel-core-i712700-processor-25m-cache-up-to-4-90-ghz/specifications.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual de la B650 AORUS ELITE AX (Gigabyte) — https://download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1204_e.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** El 7700X y el i7-12700 indican dos canales de memoria. El manual de Gigabyte define 4 ranuras en dos canales (A1 y A2; B1 y B2), recomienda para dos módulos las ranuras A2 y B2, y aclara que con un solo módulo no hay doble canal.
- **Propuesta:** mantener. La indicación A2/B2 es de este fabricante; por eso el texto dice «a menudo», lo cual es adecuado.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### pcie-tamanos-fisicos — Ranura PCIe principal (tarjeta gráfica)
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › pcie-principal; tarjeta-grafica › conector-pcie
- **Usado por:** tarjeta-madre, tarjeta-grafica
- **Texto publicado:** Las ranuras PCIe existen en tamaños físicos x1, x4, x8 y x16. La ranura x16 es la más larga y es la que usan las tarjetas gráficas.
- **Estado:** 🟡
- **Fuente consultada:** What Are PCI and PCI Express and What Is a PCIe Slot (Dell) — https://www.dell.com/support/kbdoc/en-us/000123517/what-is-pci-and-pci-express-kb-article-161614 (consultada 2026-10-13) · secundaria (fabricante de sistemas; no es el estándar)
- **Fuente consultada:** Introduction to PCI Express (Lenovo Press) — https://lenovopress.lenovo.com/tips0456 (consultada 2026-10-13) · secundaria
- **Qué dice la fuente:** Dell dice que las ranuras PCIe vienen en tamaños físicos x1, x4, x8 y x16 y que las gráficas suelen ir en la x16. Lenovo trae una tabla de compatibilidad con esos cuatro tamaños y señala x16 como el uso previsto para gráficos. Las especificaciones de PCI-SIG no se pudieron abrir (bloqueo de acceso).
- **Propuesta:** mantener (dato estándar y de bajo riesgo). Para pasar de 🟡 a ✅ haría falta abrir la especificación de PCI-SIG; el dueño puede aceptarlo con las fuentes de Dell y Lenovo.
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### pcie-ancho-banda-generaciones — Ranura PCIe principal (tarjeta gráfica)
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › pcie-principal; tarjeta-grafica › conector-pcie
- **Usado por:** tarjeta-madre, tarjeta-grafica
- **Texto publicado:** Cada generación de PCIe duplica el ancho de banda de la anterior: 8 GT/s por línea en PCIe 3.0, 16 GT/s en PCIe 4.0 y 32 GT/s en PCIe 5.0 (unos 1, 2 y 4 GB/s por línea y por sentido, de forma aproximada).
- **Estado:** 🟡
- **Fuente consultada:** PCI-SIG Announces PCI Express 4.0 Evolution to 16GT/s (comunicado de PCI-SIG, copia en Design-Reuse) — https://www.design-reuse.com/news/27909/pci-express-4-0.html (consultada 2026-10-13) · primaria (comunicado del consorcio, copia de terceros)
- **Fuente consultada:** PCI-SIG Achieves 32GT/s with New PCI Express 5.0 Specification (comunicado de PCI-SIG, copia en Design-Reuse) — https://us.design-reuse.com/news/46222/32gt-s-pci-express-5-0-specification.html (consultada 2026-10-13) · primaria (copia de terceros)
- **Qué dice la fuente:** El comunicado de PCIe 4.0 dice que 16 GT/s duplica el ancho de banda de PCIe 3.0 (lo que implica 8 GT/s para la 3.0, que no lo dice con esa cifra). El de PCIe 5.0 dice que 32 GT/s duplica el ancho de banda de PCIe 4.0. Las cifras en GB/s por línea no aparecen en las fuentes que abrí; son una conversión (velocidad por la eficiencia de codificación) y coinciden con la aritmética, pero son cálculo propio.
- **Propuesta:** reformular a: «Cada generación de PCIe duplica el ancho de banda de la anterior: 8 GT/s por línea en PCIe 3.0, 16 GT/s en PCIe 4.0 y 32 GT/s en PCIe 5.0.» Quitar el paréntesis en GB/s o mantenerlo si el dueño acepta que es una conversión aproximada. Nota: el comunicado de 5.0 da dos cifras para x16 (128 y 64 GB/s según cuente uno o ambos sentidos); por eso conviene evitar GB/s.
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### pcie-compatibilidad-atras — Ranura PCIe principal (tarjeta gráfica)
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › pcie-principal; almacenamiento › ranura-m2; tarjeta-grafica › conector-pcie
- **Usado por:** tarjeta-madre, almacenamiento, tarjeta-grafica
- **Texto publicado:** Las tarjetas y ranuras PCIe de generaciones distintas son compatibles hacia atrás: el conjunto funciona a la velocidad de la generación menor de las dos.
- **Estado:** 🟡
- **Fuente consultada:** PCI-SIG Achieves 32GT/s with New PCI Express 5.0 Specification (comunicado de PCI-SIG, copia en Design-Reuse) — https://us.design-reuse.com/news/46222/32gt-s-pci-express-5-0-specification.html (consultada 2026-10-13) · primaria (copia de terceros)
- **Fuente consultada:** PCI-SIG Announces PCI Express 4.0 Evolution to 16GT/s (copia en Design-Reuse) — https://www.design-reuse.com/news/27909/pci-express-4-0.html (consultada 2026-10-13) · primaria (copia de terceros)
- **Qué dice la fuente:** PCI-SIG declara que PCIe 5.0 mantiene compatibilidad con 4.0, 3.x, 2.x y 1.x, y que PCIe 4.0 busca conservar la compatibilidad con arquitecturas previas. Ninguno de los dos comunicados dice explícitamente que el conjunto funcione a la velocidad de la generación menor.
- **Propuesta:** mantener. La compatibilidad está confirmada; la consecuencia «velocidad de la menor» es la lectura habitual, pero no la vi escrita en una fuente primaria que pudiera abrir. Si el dueño prefiere, reformular a: «Las tarjetas y ranuras PCIe de generaciones distintas son compatibles entre sí; el conjunto trabaja con las capacidades de la generación menor.»
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### pcie-x16-desde-procesador — Ranura PCIe principal (tarjeta gráfica)
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › pcie-principal; tarjeta-grafica › conector-pcie
- **Usado por:** tarjeta-madre, tarjeta-grafica
- **Texto publicado:** La ranura x16 principal suele salir directamente del procesador, mientras que las demás ranuras suelen depender del chipset; la asignación exacta cambia según el modelo.
- **Estado:** ✅
- **Fuente consultada:** Manual de la B650 AORUS ELITE AX (Gigabyte) — https://download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1204_e.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual de la Z790 AORUS ELITE AX (Gigabyte) — https://download.gigabyte.com/FileList/Manual/mb_manual_z790-ae-series_1105_e.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** ROG STRIX B850-F GAMING WIFI7 NEO (ASUS) — https://rog.asus.com/motherboards/rog-strix/rog-strix-b850-f-gaming-wifi7-neo/ (consultada 2026-10-13) · primaria
- **Fuente consultada:** AMD Socket AM5 Chipset for Motherboards (tabla) — https://www.amd.com/en/products/processors/chipsets/am5.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** En las tres placas (AM5 con B650, LGA1700 con Z790, AM5 con B850) la ranura x16 principal está conectada al procesador y las otras ranuras PCIe, al chipset. La tabla de AMD separa las líneas directas del procesador (gráfica y NVMe) de las del chipset. Son ejemplos concretos; el texto ya está redactado con «suele».
- **Propuesta:** mantener.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### m2-llaves — Ranuras M.2
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › m2; almacenamiento › llave-m2
- **Usado por:** tarjeta-madre, almacenamiento
- **Texto publicado:** M.2 define varias llaves; los SSD usan la llave M (o B y M) y las tarjetas inalámbricas suelen usar la llave E. Cada llave indica qué tipo de dispositivo admite la ranura.
- **Estado:** 🟡
- **Fuente consultada:** Manual ASRock B760M-H/M.2 — https://download.asrock.com/Manual/B760M-HM.2.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Wikipedia, M.2 — https://en.wikipedia.org/wiki/M.2 (consultada 2026-10-13) · secundaria
- **Fuente consultada:** ASUS ROG, guía «Buying an M.2 SSD» — https://rog.asus.com/articles/guides/buying-an-m-2-ssd-how-to-tell-which-is-which/ (consultada 2026-10-13) · secundaria (guía editorial del fabricante)
- **Qué dice la fuente:** Los manuales de ASUS y ASRock describen sus ranuras de SSD como «Key M» y una ranura aparte «Key E» para tarjetas WiFi/Bluetooth. La parte «B y M» y el nombre de las llaves solo salen en fuentes secundarias; la especificación M.2 de PCI-SIG no se pudo abrir.
- **Propuesta:** reformular a: «En las placas actuales, las ranuras M.2 para SSD usan la llave M y las tarjetas inalámbricas usan la llave E. La llave indica qué tipo de dispositivo admite la ranura.»
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### m2-largos — Ranuras M.2
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › m2; almacenamiento › tornillo-m2; almacenamiento › caso m2-sin-tornillo; almacenamiento › comparación tipos-de-unidad › Forma y tamaño
- **Usado por:** tarjeta-madre, almacenamiento
- **Texto publicado:** Los SSD M.2 se nombran por su tamaño: 2230, 2242, 2260, 2280 y 22110 (22 mm de ancho y 30, 42, 60, 80 o 110 mm de largo). El 2280 es el más habitual.
- **Estado:** 🟡
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Hoja de datos Samsung 990 PRO — https://download.semiconductor.samsung.com/resources/data-sheet/samsung_nvme_ssd_990_pro_datasheet_rev.2.0.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Wikipedia, M.2 — https://en.wikipedia.org/wiki/M.2 (consultada 2026-10-13) · secundaria
- **Fuente consultada:** ASUS ROG, guía de SSD M.2 — https://rog.asus.com/articles/guides/buying-an-m-2-ssd-how-to-tell-which-is-which/ (consultada 2026-10-13) · secundaria
- **Qué dice la fuente:** El manual de ASUS lista ranuras que admiten «2280» y otra que admite «2242/2260/2280/22110», y Samsung vende su 990 PRO como M.2 (2280): los nombres de tamaño existen y cada ranura admite solo algunos. Que la nomenclatura es ancho 22 mm por largo en mm y que el 2280 es el más usado viene solo de fuentes secundarias; «más habitual» es una afirmación de mercado que ninguna especificación respalda.
- **Propuesta:** reformular a: «Los SSD M.2 se nombran por su tamaño: 2230, 2242, 2260, 2280 y 22110 (22 mm de ancho y 30, 42, 60, 80 o 110 mm de largo). Cada ranura admite solo algunos largos; el manual de la placa indica cuáles.» (se quita «el 2280 es el más habitual».)
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### m2-protocolos — Ranuras M.2
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › m2; almacenamiento › llave-m2; almacenamiento › ranura-m2; almacenamiento › caso m2-ranura-sin-compatibilidad; almacenamiento › comparación tipos-de-unidad › Dónde se conecta
- **Usado por:** tarjeta-madre, almacenamiento
- **Texto publicado:** Una ranura M.2 puede admitir solo SSD NVMe, solo SSD SATA o ambos, según el modelo de placa.
- **Estado:** ✅
- **Fuente consultada:** Manual ASRock B760M-H/M.2 — https://download.asrock.com/Manual/B760M-HM.2.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual MSI B760 GAMING PLUS WIFI DDR4 — https://download-2.msi.com/archive/mnu_exe/mb/B760GAMINGPLUSWIFIDDR4_EN.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** En la ASRock, la ranura M2_1 admite solo PCIe y la M2_2 admite SATA y PCIe. En la MSI, M2_1 llega a PCIe 4.0 x4 y M2_2 admite PCIe y SATA. En la ASUS, las tres ranuras solo listan modos PCIe. O sea, cambia por placa y por ranura dentro de la misma placa.
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### m2-comparte-lineas-sata — Ranuras M.2
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › m2; almacenamiento › ranura-m2; almacenamiento › caso m2-desactiva-puertos-sata
- **Usado por:** tarjeta-madre, almacenamiento
- **Texto publicado:** En algunas placas, ocupar ciertas ranuras M.2 reduce las líneas de una ranura PCIe o desactiva puertos SATA; el manual de cada modelo indica cuáles.
- **Estado:** ✅
- **Fuente consultada:** Manual ASRock B760M-H/M.2 — https://download.asrock.com/Manual/B760M-HM.2.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual MSI B760 GAMING PLUS WIFI DDR4 — https://download-2.msi.com/archive/mnu_exe/mb/B760GAMINGPLUSWIFIDDR4_EN.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASRock B650 LiveMixer — https://download.asrock.com/Manual/B650%20LiveMixer_English.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** ASRock B760M-H/M.2: si la ranura M2_2 lleva un SSD M.2 tipo SATA, el puerto SATA3_3 queda deshabilitado. MSI B760 GAMING PLUS: el SATA8 no está disponible con un SSD M.2 SATA en M2_2. ASRock B650 LiveMixer: si la M2_3 está ocupada, la ranura PCIE3 queda deshabilitada. Los manuales hablan de «deshabilitar», no de «reducir líneas»; el caso de reducir líneas (x16 a x8) solo lo vi en foros, que no cuentan.
- **Propuesta:** mantener (opcional, para ceñirse a lo comprobado: «En algunas placas, ocupar ciertas ranuras M.2 desactiva puertos SATA o una ranura PCIe; el manual de cada modelo indica cuáles.»)
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### nvme-lineas-pcie — Ranuras M.2 · opción NVMe
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › m2 › opción nvme; almacenamiento › controlador
- **Usado por:** tarjeta-madre, almacenamiento
- **Texto publicado:** Los SSD NVMe usan líneas PCIe, normalmente cuatro (x4).
- **Estado:** ✅
- **Fuente consultada:** NVM Express, especificaciones — https://nvmexpress.org/specifications/ (consultada 2026-10-13) · primaria
- **Fuente consultada:** Hoja de datos Samsung 990 PRO — https://download.semiconductor.samsung.com/resources/data-sheet/samsung_nvme_ssd_990_pro_datasheet_rev.2.0.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** NVM Express define NVMe sobre varios transportes, entre ellos PCI Express, y lo presenta como el estándar para SSD en todos los formatos, incluido M.2. Samsung lista su 990 PRO como «PCIe Gen 4.0 x4, NVMe 2.0». El manual de ASUS muestra ranuras M.2 en modo x4 y una en modo x2, así que «normalmente» es correcto.
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### sata-datos-y-energia — Puertos SATA
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › sata; almacenamiento › conector-sata-datos; almacenamiento › conector-sata-poder; almacenamiento › caso cables-sata-mal-conectados; almacenamiento › comparación tipos-de-unidad › Cables que necesita; fuente-de-poder › sata-poder; fuente-de-poder › caso sata-mal-conectado
- **Usado por:** tarjeta-madre, almacenamiento, fuente-de-poder
- **Texto publicado:** Cada unidad SATA necesita un cable de datos hacia la placa y un cable de energía SATA desde la fuente.
- **Estado:** ✅
- **Fuente consultada:** Seagate, «Serial ATA Basics» — https://www.seagate.com/support/kb/serial-ata-basics-193811en/ (consultada 2026-10-13) · primaria (documentación del fabricante de la unidad)
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** Seagate describe un conector de datos pequeño que va por cable al puerto SATA de la placa y un conector de energía aparte, más grande, que se alimenta de la fuente. El manual de ASUS indica que los puertos SATA conectan discos «mediante un cable SATA».
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### atx-24-pines — Conector principal de la fuente (24 pines)
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › conector-24-pines; fuente-de-poder › atx-24
- **Usado por:** tarjeta-madre, fuente-de-poder
- **Texto publicado:** El conector principal de energía de la placa es de 24 pines (20+4) en el estándar ATX.
- **Estado:** 🟡
- **Fuente consultada:** ATX Specification 2.2 — https://xdevs.com/doc/_PC_HW/Form_factors/atx2_2.pdf (consultada 2026-10-13) · primaria (copia de terceros del documento de Intel)
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** La ATX 2.2 registra el cambio del conector principal de 20 a 24 pines por PCI Express y recomienda con fuerza un conector de 24 pines; el manual de ASUS lista «1 x 24-pin Main Power connector». La especificación no habla de «20+4»; ese desglose viene de la guía de fuentes ATX12V, que no abrí.
- **Propuesta:** reformular a: «El conector principal de energía de la placa es de 24 pines en el estándar ATX.» (se quita «(20+4)»)
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### eps-ocho-pines — Conector de energía del procesador (EPS)
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › conector-cpu; fuente-de-poder › eps-cpu
- **Usado por:** tarjeta-madre, fuente-de-poder
- **Texto publicado:** El conector de energía del procesador sigue el estándar EPS12V de 8 pines (4+4). Algunas placas traen dos conectores (8+4 u 8+8).
- **Estado:** ✅
- **Fuente consultada:** EPS12V Power Supply Design Guide, v2.91 (SSI; copia en xDevs.com) — https://xDevs.com/doc/xDevs.com/Neutron/pdf/eps_designguide_2.91.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Which PSU cables go where? (Corsair) — https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/which-psu-cables-go-where/ (consultada 2026-10-13) · primaria (fabricante de fuentes)
- **Fuente consultada:** Manual de la B650 AORUS ELITE AX (Gigabyte) — https://download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1204_e.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual de la Z790 AORUS ELITE AX (Gigabyte) — https://download.gigabyte.com/FileList/Manual/mb_manual_z790-ae-series_1105_e.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** La guía EPS12V define un conector de procesador de 8 pines (cuatro tierras y cuatro +12 V) y un conector adicional de 4 pines. Corsair explica que la entrada de energía de la placa puede ser de 4, de 4+4, de 8 o de dos de 8 pines, y que el cable EPS de 8 se parte en dos mitades de 4. La B650 AORUS tiene un conector de 8 y otro de 4 pines (8+4) y la Z790 AORUS tiene dos de 8 pines (8+8).
- **Propuesta:** mantener. La especificación ATX 2.2 que figuraba como fuente solo describe el conector de 4 pines; sustituirla en `fuentes` por la guía EPS12V (o un manual) y Corsair. El «(4+4)» es la forma del cable, no del conector de la placa; el texto lo deja claro.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### eps-vs-pcie-grafica — Conector de energía del procesador (EPS)
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › conector-cpu; fuente-de-poder › eps-cpu; fuente-de-poder › pcie-6-2; fuente-de-poder › caso eps-y-pcie-confundidos; tarjeta-grafica › conector-energia
- **Usado por:** tarjeta-madre, fuente-de-poder, tarjeta-grafica
- **Texto publicado:** El cable EPS 4+4 del procesador y el cable PCIe 6+2 de la tarjeta gráfica no son intercambiables: sus conectores tienen codificación distinta.
- **Estado:** ✅
- **Fuente consultada:** Can I use a PCI-e cable in the 8-pin motherboard plug? (Corsair) — https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/can-i-use-a-pci-e-cable-in-the-8-pin-motherboard-plug/ (consultada 2026-10-13) · primaria (fabricante de fuentes)
- **Fuente consultada:** Which PSU cables go where? (Corsair) — https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/which-psu-cables-go-where/ (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** Corsair indica que el conector EPS de 8 pines no es intercambiable con el de 8 pines de la gráfica: se parecen pero son físicamente distintos y están cableados distinto, y usar uno por otro puede dañar componentes. Describe el cable PCIe 6+2 como un conector de 6 pines con uno de 2 acoplado.
- **Propuesta:** reformular a: «El cable EPS 4+4 del procesador y el cable PCIe 6+2 de la tarjeta gráfica no son intercambiables: aunque se parezcan, están cableados distinto y usar uno por otro puede dañar componentes.» («Codificación» es una interpretación; Corsair habla de cableado, no de codificación.)
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### video-requiere-graficos-integrados — Puertos traseros (E/S)
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › puertos-traseros; procesador › sección nombres; procesador › sección elegir; procesador › caso monitor-sin-graficos-integrados; tarjeta-grafica › bracket
- **Usado por:** tarjeta-madre, procesador, tarjeta-grafica
- **Texto publicado:** Las salidas de video de la placa solo funcionan con procesadores que incluyen gráficos integrados; los modelos de Intel con sufijo F no los traen.
- **Estado:** ✅
- **Fuente consultada:** Intel, «Does My Computer with Intel Core Processor Number Ending with "F" Need a Discrete Graphics Card?» — https://www.intel.com/content/www/us/en/support/articles/000058487/processors.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual ASUS PRIME Z890M-PLUS WIFI — https://dlcdnets.asus.com/pub/ASUS/mb/LGA1851/PRIME_Z890M-PLUS_WIFI/E24250_PRIME_Z890M-PLUS_WIFI_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** Intel indica que los Core de escritorio con F en el sufijo necesitan tarjeta gráfica aparte y que no darán imagen por el puerto integrado. El manual de ASUS aclara que las especificaciones de gráficos varían según el procesador y que, al instalar el sistema operativo, el monitor debe ir al HDMI trasero o a una gráfica dedicada. La parte de AMD (Ryzen sin gráficos, p. ej. 5600X) no la pude reabrir; el texto publicado no la nombra, así que no hace falta.
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### ventilador-nombres-cabezales — Cabezales de ventilador y bomba
- **Tipo:** hecho
- **Dónde:** tarjeta-madre › cabezales-ventilador; refrigeracion › ventilador; refrigeracion › bloque-bomba; refrigeracion › caso bomba-en-cabezal-de-ventilador; refrigeracion › comparación aire-vs-liquida › Dónde se conecta a la placa
- **Usado por:** tarjeta-madre, refrigeracion
- **Texto publicado:** Los cabezales suelen llamarse CPU_FAN, CPU_OPT, SYS_FAN o CHA_FAN y AIO_PUMP, según el fabricante. Muchas placas avisan al arrancar si no detectan un ventilador en CPU_FAN.
- **Estado:** ✅
- **Fuente consultada:** Manual ASUS PRIME B850-PLUS — https://dlcdnets.asus.com/pub/ASUS/mb/SocketAM5/PRIME_B850-PLUS/E25803_PRIME_B850-PLUS_EM_WEB.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual MSI B760 GAMING PLUS WIFI DDR4 — https://download-2.msi.com/archive/mnu_exe/mb/B760GAMINGPLUSWIFIDDR4_EN.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** ASUS, FAQ «CPU Fan Error! Press F1» — https://www.asus.com/latin/support/faq/1006064/ (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** ASUS usa CPU_FAN, CPU_OPT, CHA_FAN y AIO_PUMP; MSI usa CPU_FAN, SYS_FAN y PUMP_FAN. ASUS explica que el mensaje de error al arrancar significa que no se detecta la velocidad del ventilador del procesador y que hay que revisar que esté en CPU_FAN. Todo coincide con el texto («suelen», «según el fabricante»).
- **Propuesta:** mantener
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### pasta-termica-entre-ihs-y-base — Tapa metálica del procesador (IHS)
- **Tipo:** hecho
- **Dónde:** procesador › ihs; procesador › caso pasta-termica-mal-aplicada; refrigeracion › base; refrigeracion › caso pasta-termica-mal-aplicada; refrigeracion › comparación aire-vs-liquida › Pasta térmica
- **Usado por:** procesador, refrigeracion
- **Texto publicado:** La pasta térmica va entre la tapa metálica del procesador (IHS) y la base del disipador.
- **Estado:** ⚪ pendiente de verificar
- **Fuente candidata:** How to Install or Remove an AMD CPU Cooler — https://www.amd.com/en/resources/support-articles/faqs/CPU-7.html (consultada 2026-10-11) · sin clasificar
- **Qué dice la fuente:** —
- **Propuesta:** —
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### pcie-6-2-graficas — Conector PCIe 6+2 de la gráfica
- **Tipo:** hecho
- **Dónde:** fuente-de-poder › pcie-6-2; fuente-de-poder › sección elegir; fuente-de-poder › caso grafica-sin-cable-de-energia; tarjeta-grafica › conector-energia
- **Usado por:** fuente-de-poder, tarjeta-grafica
- **Texto publicado:** Las tarjetas gráficas que piden conectores de ocho pines usan el cable PCIe 6+2 de la fuente: seis pines más dos que se acoplan.
- **Estado:** ⚪ pendiente de verificar
- **Fuente candidata:** Which PSU cables go where? — https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/which-psu-cables-go-where/ (consultada 2026-10-13) · sin clasificar
- **Fuente candidata:** Especificaciones de PCI Express — https://pcisig.com/specifications (sin consultar) · sin clasificar
- **Qué dice la fuente:** —
- **Propuesta:** —
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### conector-12v-2x6 — Conector 12V-2x6 de la gráfica
- **Tipo:** hecho
- **Dónde:** fuente-de-poder › 12v-2x6; fuente-de-poder › sección elegir; fuente-de-poder › caso conector-12v-2x6-a-medias; tarjeta-grafica › conector-energia
- **Usado por:** fuente-de-poder, tarjeta-grafica
- **Texto publicado:** El conector 12V-2x6 (ATX 3.1 y PCIe CEM 5.1) reemplazó al 12VHPWR en las tarjetas gráficas nuevas y debe quedar insertado por completo.
- **Estado:** ⚪ pendiente de verificar
- **Fuente candidata:** Especificaciones de PCI Express — https://pcisig.com/specifications (sin consultar) · sin clasificar
- **Qué dice la fuente:** —
- **Propuesta:** —
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______
