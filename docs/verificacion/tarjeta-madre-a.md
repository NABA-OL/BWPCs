# Verificación de datos técnicos — Tarjeta madre, parte A

- **Fecha de consulta:** 2026-10-13
- **Alcance:** todos los `hechos` de las partes `socket` (incluidas sus `opciones`), `chipset`, `vrm`, `conector-cpu`, `ranuras-ram`, `pcie-principal`, `pcie-secundarias` y de la sección de texto `elegir`, en `src/lib/piezas/tarjeta-madre.contenido.ts`. Total: 28 hechos. La parte B (`m2`, `sata`, `conector-24-pines`, `puertos-traseros`, `cabezales-ventilador`, `conectores-frontales`, `bateria-cmos`, `tamanos`, `errores`, `factoresForma`) la cubre otro agente.
- **Estado de partida:** los 28 hechos están en `verificadoEn: null`. Este documento NO cambia nada en el repo; es solo la evidencia para que decidas.

## Resumen de conteos

| Estado | Cantidad |
|---|---|
| ✅ coincide con fuente primaria | 18 |
| 🟡 coincide en parte / con matices | 10 |
| ❌ la fuente lo contradice | 0 |
| ⚪ sin fuente primaria encontrada | 0 |

Ningún hecho está contradicho. Los 10 en amarillo son imprecisiones de redacción (faltan casos, o la cifra/nombre no aparece tal cual en la fuente) que se arreglan con la reformulación propuesta, o datos que solo pude respaldar con fuentes de fabricantes de sistemas y no con el estándar.

## Cómo leer este documento

- **Primaria** = el estándar, el fabricante del chip (AMD, Intel) o el fabricante de la placa/módulo/fuente (Gigabyte, ASRock, ASUS, Kingston, Corsair), o una publicación del propio consorcio. **Secundaria** = reseñas, foros, wikis, tiendas, sistemas de terceros.
- Todas las URLs de la lista las abrí de verdad ese día (por la herramienta de lectura web, o con `curl` y lectura del texto). Las páginas de Intel (ARK y soporte) solo se abrieron por la herramienta de lectura web; con `curl` devuelven 403.
- Lo que NO pude abrir: `pcisig.com` (bloqueado por Cloudflare y, además, la herramienta de búsqueda lo excluye), `uefi.org` (Cloudflare 403), el PDF de JESD79-4/79-5 en `jedec.org` (la página de catálogo abre, pero el documento exige iniciar sesión), el blog de Kingston, Crucial y Micron (403/rechazado) y la página de compatibilidad de Noctua (429). Donde un hecho dependía de eso, lo digo en su ficha.
- Corrección a una nota anterior: la nota de `socket-disipadores-am4-am5` decía que el artículo de AMD `partner/socket-am5-change-game` no menciona los disipadores de AM4. Sí los menciona (ver ficha).
- Las paráfrasis no reproducen texto de las fuentes. Hay una sola cita corta (menos de 15 palabras) y va entre comillas.

### Datos que cambian con el tiempo (revisar periódicamente)
Listas de chipsets (AMD e Intel), qué procesadores usa cada socket, nombres de la serie Core Ultra, y la tabla de overclock por chipset de AMD. Todo se consultó el 2026-10-13; conviene revisarlo cada 6 meses o al salir una plataforma nueva.

---

## Parte: Socket del procesador (`socket`)

### socket-disipadores-am4-am5 — Socket del procesador
- **Texto publicado:** Muchos disipadores diseñados para AM4 se pueden montar en AM5 sin cambiar el soporte, porque se mantuvo la distancia entre los orificios de montaje. Confirma el soporte con el fabricante de tu disipador.
- **Estado:** 🟡
- **Fuente consultada:** Meet The AMD Socket AM5 Platform (artículo para socios de AMD) — https://www.amd.com/en/partner/articles/socket-am5-change-game.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** En la lista de novedades de AM5, AMD afirma que las soluciones de refrigeración existentes de AM4 seguirán siendo compatibles. No explica el motivo (distancia entre orificios) ni dice que no haga falta cambiar ninguna pieza de montaje.
- **Propuesta:** reformular a: «AMD indicó que los disipadores de AM4 siguen siendo compatibles con AM5. Aun así, algunos modelos pueden necesitar piezas de montaje nuevas, así que confirma el soporte con el fabricante de tu disipador.» (La causa "se mantuvo la distancia entre los orificios" solo la respaldan fuentes secundarias que aparecieron en una búsqueda y no abrí; mejor no afirmarla. La parte "algunos modelos pueden necesitar piezas nuevas" también viene de esas fuentes secundarias; por eso va con "pueden".)
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### socket-disipadores-lga1700-lga1851 — Socket del procesador
- **Texto publicado:** Los disipadores diseñados para LGA 1700 suelen servir también en LGA 1851, según lo que indique el fabricante de cada disipador.
- **Estado:** ✅
- **Fuente consultada:** Information About Intel® Core™ Ultra Boxed Desktop Processors (Series 2) — https://www.intel.com/content/www/us/en/support/articles/000099656/processors.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** Intel indica que los disipadores con ventilador pueden usarse entre LGA 1700 y LGA 1851 porque, para la solución térmica, los sockets son mecánicamente parecidos. También recuerda que el disipador debe cubrir la potencia del procesador y que los procesadores no son intercambiables entre ambos sockets.
- **Propuesta:** mantener. Sustituir en `fuentes` la ficha genérica de ARK por este artículo de soporte de Intel (es la fuente real).
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### socket-mismo-no-garantiza — Socket del procesador
- **Texto publicado:** Compartir socket no garantiza compatibilidad: AMD indica que una placa de la serie 600 puede necesitar una actualización de BIOS para procesadores Ryzen 8000 y 9000, y en AM4 la compatibilidad depende del chipset y de la versión de BIOS.
- **Estado:** ✅
- **Fuente consultada:** AMD Socket AM5 Chipset for Motherboards — https://www.amd.com/en/products/processors/chipsets/am5.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** AMD Socket AM4 Chipset — https://www.amd.com/en/products/processors/chipsets/am4.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Intel® Core™ i5-13500 Processor Does Not Boot on a Motherboard with Intel® Z690 Chipset — https://www.intel.com/content/www/us/en/support/articles/000095894/processors/intel-core-processors.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** AMD aclara en AM5 que puede hacer falta actualizar la BIOS de las placas serie 600 para Ryzen 8000 y 9000, y en AM4 su tabla marca combinaciones chipset/procesador que piden una BIOS beta y avisa de que el soporte puede requerir una BIOS nueva. Intel, por su parte, dice que los procesadores de 13.ª generación funcionan en placas Z690 solo tras actualizar la BIOS.
- **Propuesta:** mantener. Opcional: añadir el caso de Intel al texto («…y en Intel, los procesadores de 13.ª generación en placas serie 600 también piden BIOS actualizada») y agregar este artículo de Intel a `fuentes`.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### socket-marca-pin-uno — Socket del procesador
- **Texto publicado:** El procesador y el socket traen una marca de alineación, normalmente un triángulo en una esquina, que indica dónde está el pin 1 y evita instalar el procesador girado.
- **Estado:** ✅
- **Fuente consultada:** B650 AORUS ELITE AX — Manual de usuario (Rev. 1204), sección de instalación del procesador — https://download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1204_e.pdf (consultada 2026-10-13) · primaria (fabricante de la placa)
- **Fuente consultada:** Processor Handling Guidance (AMD) — https://www.amd.com/en/resources/support-articles/faqs/CPU-100.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** How to Install the LGA115x and LGA1200 Processor into the Socket (Intel) — https://www.intel.com/content/www/us/en/support/articles/000005762/processors.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** El manual de la placa AM5 pide alinear la marca de pin uno (un triángulo) del procesador con la esquina de pin uno del socket, o alternativamente las muescas del procesador con las llaves del socket. AMD solo habla del patrón de pines que debe coincidir y de no forzar el procesador; Intel (para sockets anteriores) habla de pin 1 y muescas, sin mencionar un triángulo.
- **Propuesta:** mantener. Las guías de AMD e Intel no nombran el triángulo; el manual de una placa sí. Fijar en `fuentes` el manual de la placa (o uno equivalente) y la guía CPU-100 de AMD; quitar la ficha CPU-7 (trata del disipador) que hoy está como candidata.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### am4-pga-ryzen — Socket del procesador · opción AM4
- **Texto publicado:** AM4 es un socket de tipo PGA: los pines están en el procesador y la placa tiene orificios. AMD lo usa con procesadores Ryzen de la serie 5000 y anteriores, con memoria DDR4.
- **Estado:** ✅
- **Fuente consultada:** AMD Socket AM4 Chipset — https://www.amd.com/en/products/processors/chipsets/am4.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** AMD Ryzen 5 5600X — https://www.amd.com/en/products/processors/desktops/ryzen/5000-series/amd-ryzen-5-5600x.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Catálogo AMD Platform Solutions de ASRock — https://download.asrock.com/Download/e-catalog/AMDPlatformSolutionsCatalog.pdf (consultada 2026-10-13) · primaria (fabricante de placas)
- **Qué dice la fuente:** AMD indica que AM4 es de memoria DDR4 y la ficha del 5600X da socket AM4 con DDR4. El catálogo de ASRock describe sus placas como «Socket AM4 (PGA1331)» para Ryzen 5000, 4000G, 3000G y 3000.
- **Propuesta:** mantener. El tipo PGA no aparece en las páginas de AMD, solo en el catálogo del fabricante de placas; conviene agregar el catálogo de ASRock a `fuentes`. Evitar «y anteriores» si no se quiere enumerar: es correcto, pero el catálogo cita 3000 a 5000.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### am5-lga — Socket del procesador · opción AM5
- **Texto publicado:** AM5 es un socket de tipo LGA: los contactos están en la placa y el procesador no lleva pines. Tiene 1718 contactos.
- **Estado:** ✅
- **Fuente consultada:** AMD Expands Ryzen Embedded Processor Family… (nota de prensa de AMD, 2023-11-14) — https://www.amd.com/en/newsroom/press-releases/2023-11-14-amd-expands-ryzen-embedded-processor-family-for-h.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Catálogo AMD Platform Solutions de ASRock — https://download.asrock.com/Download/e-catalog/AMDPlatformSolutionsCatalog.pdf (consultada 2026-10-13) · primaria (fabricante de placas)
- **Fuente consultada:** ROG STRIX B850-F GAMING WIFI7 NEO (ASUS) — https://rog.asus.com/motherboards/rog-strix/rog-strix-b850-f-gaming-wifi7-neo/ (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** AMD describe el socket AM5 de sus procesadores Ryzen Embedded 7000 como LGA de 40 × 40 mm y 1718 pines (es el mismo socket de escritorio). ASRock lo rotula «Socket AM5 (LGA1718)». ASUS lo llama «Socket AM5» sin nombrar LGA.
- **Propuesta:** mantener. Ninguna página de AMD de escritorio dice LGA ni 1718; la cifra sale del comunicado de AMD para la línea embebida y del catálogo de ASRock. Agregar ambos a `fuentes`.
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### am5-memoria-ddr5 — Socket del procesador · opción AM5
- **Texto publicado:** Los procesadores Ryzen para AM5 usan memoria DDR5; AMD no lista DDR4 para esta plataforma.
- **Estado:** ✅
- **Fuente consultada:** AMD Ryzen 7 7700X — https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7700x.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** AMD Socket AM5 Chipset for Motherboards — https://www.amd.com/en/products/processors/chipsets/am5.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** La ficha del 7700X indica socket AM5, memoria DDR5 y dos canales; la página de chipsets AM5 habla solo de memoria DDR5 en toda la plataforma.
- **Propuesta:** mantener.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### lga1700-generaciones-memoria — Socket del procesador · opción LGA 1700
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
- **Texto publicado:** LGA 1851 (FCLGA1851 en ARK) es el socket de los procesadores Intel Core Ultra de la serie 200S, y esos procesadores usan memoria DDR5.
- **Estado:** 🟡
- **Fuente consultada:** Intel® Core™ Ultra 7 Processor 265K (ARK) — https://www.intel.com/content/www/us/en/products/sku/241063/intel-core-ultra-7-processor-265k-30m-cache-up-to-5-50-ghz/specifications.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Information About Intel® Core™ Ultra Boxed Desktop Processors (Series 2) — https://www.intel.com/content/www/us/en/support/articles/000099656/processors.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** ARK da para el 265K socket FCLGA1851 y memoria solo DDR5 (hasta 6400 MT/s), dentro de «Core Ultra (Series 2)» (código Arrow Lake). El artículo de soporte de Intel dice socket LGA 1851 con chipset de la serie 800 y DDR5. Ninguna de las dos páginas usa la etiqueta «200S».
- **Propuesta:** reformular a: «LGA 1851 (FCLGA1851 en ARK) es el socket de los procesadores Intel Core Ultra para escritorio (serie 2), y esos procesadores usan memoria DDR5.» Revisar periódicamente: Intel ha ido agregando modelos a este socket.
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

---

## Parte: Chipset (`chipset`)

### chipsets-am5 — Chipset
- **Texto publicado:** Los chipsets de la plataforma AM5 incluyen A620, B650, B650E, X670, X670E, B840, B850, X870 y X870E; los de la serie 600 pueden necesitar actualización de BIOS para Ryzen 8000 y 9000.
- **Estado:** ✅
- **Fuente consultada:** AMD Ryzen 7 7700X — https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7700x.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** AMD Socket AM5 Chipset for Motherboards — https://www.amd.com/en/products/processors/chipsets/am5.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** La ficha del 7700X lista como chipsets compatibles exactamente A620, X670E, X670, B650E, B650, X870E, X870, B840 y B850. La página de chipsets AM5 describe X870E, X870, B850, B840, X670E, X670 y A620/A620A (más PRO 600 y PRO 665 solo para proveedores de sistemas) y repite el aviso de BIOS para Ryzen 8000 y 9000 en placas serie 600. B650 y B650E ya no aparecen en esa página, pero sí en la ficha del procesador.
- **Propuesta:** mantener. Dato que envejece: revisar cuando AMD anuncie chipsets nuevos.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### chipsets-overclock — Chipset
- **Texto publicado:** No todos los chipsets permiten ajustar la frecuencia del procesador: en AM5, AMD presenta X870E, X870 y B850 con soporte de overclock, mientras que el A620 es una opción de entrada. En Intel depende además de la serie del procesador.
- **Estado:** 🟡
- **Fuente consultada:** AMD Socket AM5 Chipset for Motherboards (tabla de especificaciones) — https://www.amd.com/en/products/processors/chipsets/am5.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Desktop Chipsets Product Specifications (Intel ARK) — https://www.intel.com/content/www/us/en/ark/products/series/46645/desktop-chipsets.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** What Are the Hardware Requirements for Overclocking an Intel® Processor? — https://www.intel.com/content/www/us/en/support/articles/000097808/processors/intel-core-processors.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** La tabla de AMD marca overclock del procesador habilitado en X870E, X870, B850, X670E y X670, y no habilitado en B840 ni A620; el ajuste de memoria (EXPO) figura habilitado en todos los de la tabla. En Intel, ARK marca ajuste de procesador y de reloj base solo en los Z (Z890, Z790, Z690); los B y H permiten como mucho ajustar la memoria (H610 y H810 ni eso). El artículo de Intel pide un procesador con multiplicador desbloqueado (sufijo K o X) y, en general, un chipset de la serie Z.
- **Propuesta:** reformular a: «No todos los chipsets permiten ajustar la frecuencia del procesador. En AM5, AMD lo habilita en X870E, X870, B850, X670E y X670, pero no en B840 ni A620. En Intel hace falta un procesador desbloqueado (sufijo K) y un chipset de la serie Z; con otros chipsets, como mucho se puede ajustar la memoria.» El texto actual no es falso, pero omite X670/X670E y pone el A620 solo como «entrada». Dato que envejece.
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### chipsets-intel — Chipset
- **Texto publicado:** Los chipsets de LGA 1700 son H610, B660, H670, Z690, B760 y Z790; los de LGA 1851 incluyen Z890, B860 y H810.
- **Estado:** 🟡
- **Fuente consultada:** Desktop Chipsets Product Specifications (Intel ARK) — https://www.intel.com/content/www/us/en/ark/products/series/46645/desktop-chipsets.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Intel® Z890 Chipset (ARK) — https://www.intel.com/content/www/us/en/products/sku/237777/intel-z890-chipset/specifications.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** ARK lista, en la serie 600: H610, B660, H670, Z690 (y variantes de negocio); en la 700: B760, H770, Z790; en la 800: Z890, B860, H810 (y variantes de negocio Q870, W880, W890). Faltan en el texto el H770 (LGA 1700) y la palabra «incluyen» para LGA 1700 (está como «son»). Los de LGA 1851 coinciden.
- **Propuesta:** reformular a: «Entre los chipsets de LGA 1700 están H610, B660, H670, Z690, H770, B760 y Z790; entre los de LGA 1851, Z890, B860 y H810.» Revisar cuando Intel agregue chipsets.
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### chipset-enlace-procesador — Chipset
- **Texto publicado:** El chipset se conecta al procesador mediante un enlace único: en Intel se llama DMI y en AMD usa líneas PCIe. Los dispositivos que cuelgan del chipset comparten ese enlace.
- **Estado:** 🟡
- **Fuente consultada:** Intel® Z890 Chipset (ARK) — https://www.intel.com/content/www/us/en/products/sku/237777/intel-z890-chipset/specifications.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** AMD Socket AM5 Chipset for Motherboards — https://www.amd.com/en/products/processors/chipsets/am5.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** La ficha de Intel lista las líneas DMI del chipset (8) y la revisión DMI (4.0): confirma que Intel une chipset y procesador por DMI. La página de AMD separa las líneas PCIe del procesador de las que provee el chipset, pero no describe en palabras el enlace entre ambos ni que sea PCIe. Lo de «los dispositivos comparten el enlace» no aparece expresado en ninguna de las dos.
- **Propuesta:** reformular a: «El chipset se conecta al procesador mediante un enlace dedicado; en Intel se llama DMI. Los dispositivos que cuelgan del chipset comparten el ancho de banda de ese enlace.» Quitar la afirmación de que en AMD son líneas PCIe (solo la respaldan fuentes secundarias que aparecieron en una búsqueda y no abrí), o respaldarla con un documento técnico de AMD.
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### chipset-vs-procesador-lineas — Chipset
- **Texto publicado:** Parte de las líneas PCIe, los puertos USB y las ranuras M.2 salen directamente del procesador y otra parte sale del chipset; la distribución cambia según el modelo de placa.
- **Estado:** ✅
- **Fuente consultada:** AMD Socket AM5 Chipset for Motherboards (tabla) — https://www.amd.com/en/products/processors/chipsets/am5.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** AMD Socket AM4 Chipset — https://www.amd.com/en/products/processors/chipsets/am4.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual de la B650 AORUS ELITE AX (Gigabyte) — https://download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1204_e.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual de la Z790 AORUS ELITE AX (Gigabyte) — https://download.gigabyte.com/FileList/Manual/mb_manual_z790-ae-series_1105_e.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** La tabla de AMD distingue «Direct Processor PCIe Lanes» (gráfica y NVMe) de «Chipset-Provided USB and SATA»; la página de AM4 habla de SATA y USB directos desde el procesador. Los dos manuales de Gigabyte rotulan cada ranura PCIe y cada M.2 como «integrada en el CPU» o «del chipset» y su diagrama de bloques lo muestra.
- **Propuesta:** mantener.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

---

## Parte: VRM (`vrm`)

### vrm-funcion — VRM (alimentación del procesador)
- **Texto publicado:** El VRM reduce los 12 V que entrega la fuente al voltaje de funcionamiento del procesador.
- **Estado:** 🟡
- **Fuente consultada:** EPS12V Power Supply Design Guide, v2.91 (SSI; copia alojada en xDevs.com) — https://xDevs.com/doc/xDevs.com/Neutron/pdf/eps_designguide_2.91.pdf (consultada 2026-10-13) · primaria (documento del estándar, pero la copia no está en el sitio de SSI)
- **Fuente consultada:** Manual de la B650 AORUS ELITE AX (Gigabyte) — https://download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1204_e.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** La guía de SSI dice que la energía del procesador debe obtenerse con convertidores locales CC-CC que idealmente parten del riel de +12 V, aunque pueden partir de otros rieles. El manual de Gigabyte dice que el conector de 12 V alimenta principalmente al procesador y que sin él el equipo no enciende. Ninguna fuente usa el término VRM ni la frase exacta.
- **Propuesta:** reformular a: «El VRM toma la energía de 12 V que llega por el conector del procesador y la convierte al voltaje con el que trabaja el procesador.» Sigue sin cifras de «fases» (regla V2 del plan).
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

---

## Parte: Conector de energía del procesador (`conector-cpu`)

### eps-ocho-pines — Conector de energía del procesador (EPS)
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
- **Texto publicado:** El cable EPS 4+4 del procesador y el cable PCIe 6+2 de la tarjeta gráfica no son intercambiables: sus conectores tienen codificación distinta.
- **Estado:** ✅
- **Fuente consultada:** Can I use a PCI-e cable in the 8-pin motherboard plug? (Corsair) — https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/can-i-use-a-pci-e-cable-in-the-8-pin-motherboard-plug/ (consultada 2026-10-13) · primaria (fabricante de fuentes)
- **Fuente consultada:** Which PSU cables go where? (Corsair) — https://www.corsair.com/us/en/explorer/diy-builder/power-supply-units/which-psu-cables-go-where/ (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** Corsair indica que el conector EPS de 8 pines no es intercambiable con el de 8 pines de la gráfica: se parecen pero son físicamente distintos y están cableados distinto, y usar uno por otro puede dañar componentes. Describe el cable PCIe 6+2 como un conector de 6 pines con uno de 2 acoplado.
- **Propuesta:** reformular a: «El cable EPS 4+4 del procesador y el cable PCIe 6+2 de la tarjeta gráfica no son intercambiables: aunque se parezcan, están cableados distinto y usar uno por otro puede dañar componentes.» («Codificación» es una interpretación; Corsair habla de cableado, no de codificación.)
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

---

## Parte: Ranuras de memoria RAM (`ranuras-ram`)

### ram-ddr4-ddr5-muesca — Ranuras de memoria RAM
- **Texto publicado:** Los módulos DIMM de DDR4 y de DDR5 tienen 288 contactos, pero la muesca está en otra posición, por lo que no son intercambiables.
- **Estado:** ✅
- **Fuente consultada:** Ficha de Kingston FURY DDR5, KF560C30BBEK2-32 — https://www.kingston.com/datasheets/KF560C30BBEK2-32.pdf (consultada 2026-10-13) · primaria (fabricante del módulo)
- **Fuente consultada:** Ficha de Kingston FURY DDR4, KF432C16BBK2/16 — https://www.kingston.com/dataSheets/KF432C16BBK2_16.pdf (consultada 2026-10-13) · primaria (fabricante del módulo)
- **Fuente consultada:** Is DDR5 backwards compatible with DDR4? (Corsair) — https://www.corsair.com/us/en/explorer/diy-builder/memory/is-ddr5-backwards-compatible/ (consultada 2026-10-13) · primaria (fabricante de memorias)
- **Qué dice la fuente:** Las fichas de Kingston rotulan ambos kits como DIMM de 288 pines. Corsair explica que la muesca del DDR5 queda más hacia la izquierda y la del DDR4 más hacia la derecha, que la distribución de pines es distinta, que no son intercambiables y que forzar un módulo puede romper el módulo o la ranura. No abrí el estándar de JEDEC: la página del catálogo abre pero el PDF exige iniciar sesión.
- **Propuesta:** mantener. Los SO-DIMM (portátiles) tienen otra cantidad de contactos; el texto habla de DIMM, está bien. Fijar en `fuentes` las fichas de Kingston y el artículo de Corsair; JEDEC queda como referencia del estándar (cuenta gratuita), no como respaldo abierto.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### ram-una-generacion-por-placa — Ranuras de memoria RAM
- **Texto publicado:** Cada placa admite una sola generación de memoria. En AM5 es DDR5; en LGA 1700 depende del modelo de placa, que puede ser DDR4 o DDR5.
- **Estado:** ✅
- **Fuente consultada:** AMD Ryzen 7 7700X — https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7700x.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Intel® Core™ i7-12700 (ARK) — https://www.intel.com/content/www/us/en/products/sku/134591/intel-core-i712700-processor-25m-cache-up-to-4-90-ghz/specifications.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual de la Z790 AORUS ELITE AX / AX DDR4 (Gigabyte, Rev. 1105) — https://download.gigabyte.com/FileList/Manual/mb_manual_z790-ae-series_1105_e.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** AMD da DDR5 para los Ryzen de AM5. Intel da DDR5 y DDR4 para el 12700 (el procesador admite ambas). El manual de Gigabyte cubre dos versiones de una misma placa LGA1700, una con 4 ranuras DDR5 y otra con 4 ranuras DDR4.
- **Propuesta:** mantener.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### ram-doble-canal — Ranuras de memoria RAM
- **Texto publicado:** En escritorio los procesadores usan dos canales de memoria. Con cuatro ranuras, hay dos por canal; con dos módulos, el manual indica en qué ranuras ponerlos para usar el doble canal (a menudo A2 y B2).
- **Estado:** ✅
- **Fuente consultada:** AMD Ryzen 7 7700X — https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7700x.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Intel® Core™ i7-12700 (ARK) — https://www.intel.com/content/www/us/en/products/sku/134591/intel-core-i712700-processor-25m-cache-up-to-4-90-ghz/specifications.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual de la B650 AORUS ELITE AX (Gigabyte) — https://download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1204_e.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** El 7700X y el i7-12700 indican dos canales de memoria. El manual de Gigabyte define 4 ranuras en dos canales (A1 y A2; B1 y B2), recomienda para dos módulos las ranuras A2 y B2, y aclara que con un solo módulo no hay doble canal.
- **Propuesta:** mantener. La indicación A2/B2 es de este fabricante; por eso el texto dice «a menudo», lo cual es adecuado.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

---

## Parte: Ranura PCIe principal (`pcie-principal`)

### pcie-tamanos-fisicos — Ranura PCIe principal (tarjeta gráfica)
- **Texto publicado:** Las ranuras PCIe existen en tamaños físicos x1, x4, x8 y x16. La ranura x16 es la más larga y es la que usan las tarjetas gráficas.
- **Estado:** 🟡
- **Fuente consultada:** What Are PCI and PCI Express and What Is a PCIe Slot (Dell) — https://www.dell.com/support/kbdoc/en-us/000123517/what-is-pci-and-pci-express-kb-article-161614 (consultada 2026-10-13) · secundaria (fabricante de sistemas; no es el estándar)
- **Fuente consultada:** Introduction to PCI Express (Lenovo Press) — https://lenovopress.lenovo.com/tips0456 (consultada 2026-10-13) · secundaria
- **Qué dice la fuente:** Dell dice que las ranuras PCIe vienen en tamaños físicos x1, x4, x8 y x16 y que las gráficas suelen ir en la x16. Lenovo trae una tabla de compatibilidad con esos cuatro tamaños y señala x16 como el uso previsto para gráficos. Las especificaciones de PCI-SIG no se pudieron abrir (bloqueo de acceso).
- **Propuesta:** mantener (dato estándar y de bajo riesgo). Para pasar de 🟡 a ✅ haría falta abrir la especificación de PCI-SIG; el dueño puede aceptarlo con las fuentes de Dell y Lenovo.
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### pcie-ancho-banda-generaciones — Ranura PCIe principal (tarjeta gráfica)
- **Texto publicado:** Cada generación de PCIe duplica el ancho de banda de la anterior: 8 GT/s por línea en PCIe 3.0, 16 GT/s en PCIe 4.0 y 32 GT/s en PCIe 5.0 (unos 1, 2 y 4 GB/s por línea y por sentido, de forma aproximada).
- **Estado:** 🟡
- **Fuente consultada:** PCI-SIG Announces PCI Express 4.0 Evolution to 16GT/s (comunicado de PCI-SIG, copia en Design-Reuse) — https://www.design-reuse.com/news/27909/pci-express-4-0.html (consultada 2026-10-13) · primaria (comunicado del consorcio, copia de terceros)
- **Fuente consultada:** PCI-SIG Achieves 32GT/s with New PCI Express 5.0 Specification (comunicado de PCI-SIG, copia en Design-Reuse) — https://us.design-reuse.com/news/46222/32gt-s-pci-express-5-0-specification.html (consultada 2026-10-13) · primaria (copia de terceros)
- **Qué dice la fuente:** El comunicado de PCIe 4.0 dice que 16 GT/s duplica el ancho de banda de PCIe 3.0 (lo que implica 8 GT/s para la 3.0, que no lo dice con esa cifra). El de PCIe 5.0 dice que 32 GT/s duplica el ancho de banda de PCIe 4.0. Las cifras en GB/s por línea no aparecen en las fuentes que abrí; son una conversión (velocidad por la eficiencia de codificación) y coinciden con la aritmética, pero son cálculo propio.
- **Propuesta:** reformular a: «Cada generación de PCIe duplica el ancho de banda de la anterior: 8 GT/s por línea en PCIe 3.0, 16 GT/s en PCIe 4.0 y 32 GT/s en PCIe 5.0.» Quitar el paréntesis en GB/s o mantenerlo si el dueño acepta que es una conversión aproximada. Nota: el comunicado de 5.0 da dos cifras para x16 (128 y 64 GB/s según cuente uno o ambos sentidos); por eso conviene evitar GB/s.
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### pcie-compatibilidad-atras — Ranura PCIe principal (tarjeta gráfica)
- **Texto publicado:** Las tarjetas y ranuras PCIe de generaciones distintas son compatibles hacia atrás: el conjunto funciona a la velocidad de la generación menor de las dos.
- **Estado:** 🟡
- **Fuente consultada:** PCI-SIG Achieves 32GT/s with New PCI Express 5.0 Specification (comunicado de PCI-SIG, copia en Design-Reuse) — https://us.design-reuse.com/news/46222/32gt-s-pci-express-5-0-specification.html (consultada 2026-10-13) · primaria (copia de terceros)
- **Fuente consultada:** PCI-SIG Announces PCI Express 4.0 Evolution to 16GT/s (copia en Design-Reuse) — https://www.design-reuse.com/news/27909/pci-express-4-0.html (consultada 2026-10-13) · primaria (copia de terceros)
- **Qué dice la fuente:** PCI-SIG declara que PCIe 5.0 mantiene compatibilidad con 4.0, 3.x, 2.x y 1.x, y que PCIe 4.0 busca conservar la compatibilidad con arquitecturas previas. Ninguno de los dos comunicados dice explícitamente que el conjunto funcione a la velocidad de la generación menor.
- **Propuesta:** mantener. La compatibilidad está confirmada; la consecuencia «velocidad de la menor» es la lectura habitual, pero no la vi escrita en una fuente primaria que pudiera abrir. Si el dueño prefiere, reformular a: «Las tarjetas y ranuras PCIe de generaciones distintas son compatibles entre sí; el conjunto trabaja con las capacidades de la generación menor.»
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

### pcie-x16-desde-procesador — Ranura PCIe principal (tarjeta gráfica)
- **Texto publicado:** La ranura x16 principal suele salir directamente del procesador, mientras que las demás ranuras suelen depender del chipset; la asignación exacta cambia según el modelo.
- **Estado:** ✅
- **Fuente consultada:** Manual de la B650 AORUS ELITE AX (Gigabyte) — https://download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1204_e.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual de la Z790 AORUS ELITE AX (Gigabyte) — https://download.gigabyte.com/FileList/Manual/mb_manual_z790-ae-series_1105_e.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** ROG STRIX B850-F GAMING WIFI7 NEO (ASUS) — https://rog.asus.com/motherboards/rog-strix/rog-strix-b850-f-gaming-wifi7-neo/ (consultada 2026-10-13) · primaria
- **Fuente consultada:** AMD Socket AM5 Chipset for Motherboards (tabla) — https://www.amd.com/en/products/processors/chipsets/am5.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** En las tres placas (AM5 con B650, LGA1700 con Z790, AM5 con B850) la ranura x16 principal está conectada al procesador y las otras ranuras PCIe, al chipset. La tabla de AMD separa las líneas directas del procesador (gráfica y NVMe) de las del chipset. Son ejemplos concretos; el texto ya está redactado con «suele».
- **Propuesta:** mantener.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

---

## Parte: Ranuras PCIe secundarias (`pcie-secundarias`)

### pcie-x16-cableada-menos-lineas — Ranuras PCIe secundarias
- **Texto publicado:** Una ranura PCIe de tamaño físico x16 puede estar conectada eléctricamente a menos líneas, por ejemplo x4 u x8, según el modelo de placa.
- **Estado:** ✅
- **Fuente consultada:** Manual de la Z790 AORUS ELITE AX (Gigabyte) — https://download.gigabyte.com/FileList/Manual/mb_manual_z790-ae-series_1105_e.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual de la B650 AORUS ELITE AX (Gigabyte) — https://download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1204_e.pdf (consultada 2026-10-13) · primaria
- **Fuente consultada:** ROG STRIX B850-F GAMING WIFI7 NEO (ASUS) — https://rog.asus.com/motherboards/rog-strix/rog-strix-b850-f-gaming-wifi7-neo/ (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** La Z790 de Gigabyte lista dos ranuras «PCI Express x16» del chipset que funcionan a x4; la B650 las lista funcionando a x1; la B850 de ASUS tiene una ranura x16 que corre a x4 por el chipset. En el manual de la B650 la ranura del procesador baja a x8 o x4 con ciertos Ryzen 8000.
- **Propuesta:** mantener. Si se quiere un ejemplo más fiel a lo observado: «…por ejemplo x1, x4 u x8…».
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

---

## Sección: Qué mirar al elegir (`elegir`)

### uefi-reemplazo-bios — Qué mirar al elegir una tarjeta madre
- **Texto publicado:** UEFI reemplazó a la BIOS clásica en las placas actuales, aunque en el uso diario se le siga llamando BIOS.
- **Estado:** ✅
- **Fuente consultada:** UEFI firmware requirements (Microsoft Learn) — https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-uefi (consultada 2026-10-13) · primaria (fabricante de sistema operativo; miembro del UEFI Forum)
- **Fuente consultada:** Manual de la B650 AORUS ELITE AX (Gigabyte) — https://download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1204_e.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** Microsoft escribe que UEFI es un reemplazo de la interfaz de firmware BIOS anterior. El manual de Gigabyte declara usar un «UEFI BIOS» con licencia (AMI) y sigue usando la palabra BIOS para la configuración. La página `uefi.org` no se pudo abrir (bloqueo de Cloudflare).
- **Propuesta:** mantener. Cambiar en `fuentes` la ficha de UEFI Forum (que no abre) por la página de Microsoft Learn, o dejar ambas.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### bios-procesador-nuevo-flashback — Qué mirar al elegir una tarjeta madre
- **Texto publicado:** Un procesador más nuevo que la placa puede requerir actualizar la BIOS para ser reconocido. Algunas placas permiten actualizarla sin procesador con un botón (Flashback o equivalente).
- **Estado:** ✅
- **Fuente consultada:** AMD Socket AM5 Chipset for Motherboards — https://www.amd.com/en/products/processors/chipsets/am5.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** AMD Socket AM4 Chipset — https://www.amd.com/en/products/processors/chipsets/am4.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** Intel® Core™ i5-13500 Processor Does Not Boot on a Motherboard with Intel® Z690 Chipset — https://www.intel.com/content/www/us/en/support/articles/000095894/processors/intel-core-processors.html (consultada 2026-10-13) · primaria
- **Fuente consultada:** ROG STRIX B850-F GAMING WIFI7 NEO (ASUS) — https://rog.asus.com/motherboards/rog-strix/rog-strix-b850-f-gaming-wifi7-neo/ (consultada 2026-10-13) · primaria
- **Fuente consultada:** Manual de la B650 AORUS ELITE AX (Gigabyte) — https://download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1204_e.pdf (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** AMD e Intel confirman que puede hacer falta una BIOS nueva para que una placa reconozca ciertos procesadores. ASUS afirma que su BIOS FlashBack permite actualizar incluso sin memoria ni procesador instalados. Gigabyte describe Q-Flash Plus, que actualiza la BIOS con el sistema apagado desde una memoria USB mediante un botón, pero su manual no dice expresamente «sin procesador».
- **Propuesta:** mantener. La parte «sin procesador» está respaldada por ASUS (no por todos los fabricantes); el texto dice «algunas placas», lo que es correcto.
- **Decisión del dueño:** ☑ aprobar  ☐ ajustar  ☐ quitar   Nota: aprobado por NB (2026-10-13)

### windows-tpm-arranque-seguro — Qué mirar al elegir una tarjeta madre
- **Texto publicado:** Windows 11 exige firmware UEFI con arranque seguro (Secure Boot) y TPM versión 2.0; muchas placas lo ofrecen como fTPM (AMD) o PTT (Intel) dentro de la BIOS.
- **Estado:** 🟡
- **Fuente consultada:** Windows 11 requirements (Microsoft Learn) — https://learn.microsoft.com/en-us/windows/whats-new/windows-11-requirements (consultada 2026-10-13) · primaria
- **Fuente consultada:** Enable TPM 2.0 on your PC (Soporte de Microsoft) — https://support.microsoft.com/en-us/windows/enable-tpm-2-0-on-your-pc-1fd5a332-360d-4f46-a1e7-ae6b0c90645c (consultada 2026-10-13) · primaria
- **Fuente consultada:** What Is Trusted Platform Model (TPM) and Its Relation to Intel® Platform Trust Technology (Intel® PTT)? — https://www.intel.com/content/www/us/en/support/articles/000094205/processors/intel-core-processors.html (consultada 2026-10-13) · primaria
- **Qué dice la fuente:** Microsoft pide firmware UEFI «con capacidad de arranque seguro» (no dice que deba estar activado) y TPM versión 2.0. Su página de soporte dice que la opción puede llamarse «AMD fTPM switch», «AMD PSP fTPM», «Intel PTT» o «Intel Platform Trust Technology» y estar en menús de seguridad de la BIOS. Intel describe PTT como un TPM 2.0 integrado en el firmware, presente desde la 8.ª generación Core.
- **Propuesta:** reformular a: «Windows 11 requiere firmware UEFI con capacidad de arranque seguro (Secure Boot) y TPM versión 2.0; muchas placas ofrecen el TPM dentro de la BIOS como fTPM (AMD) o PTT (Intel).» (Cambio clave: «exige arranque seguro» → «capacidad de arranque seguro».)
- **Decisión del dueño:** ☐ aprobar  ☐ ajustar  ☐ quitar   Nota: ______

---

## Resumen para decidir

### 1. Los que puedes aprobar casi sin mirar (✅, 18)
`socket-disipadores-lga1700-lga1851`, `socket-mismo-no-garantiza`, `socket-marca-pin-uno`, `am4-pga-ryzen`, `am5-lga`, `am5-memoria-ddr5`, `lga1700-generaciones-memoria`, `chipsets-am5`, `chipset-vs-procesador-lineas`, `eps-ocho-pines`, `eps-vs-pcie-grafica` (con el cambio de «codificación» a «cableado»), `ram-ddr4-ddr5-muesca`, `ram-una-generacion-por-placa`, `ram-doble-canal`, `pcie-x16-desde-procesador`, `pcie-x16-cableada-menos-lineas`, `uefi-reemplazo-bios`, `bios-procesador-nuevo-flashback`.
En varios hay que cambiar las `fuentes` (en el archivo hoy figuran fichas genéricas o candidatas): ver «Fuentes a fijar» abajo.

### 2. Los que merecen tu atención (🟡, 10)
- `socket-disipadores-am4-am5`: AMD solo dice que los disipadores de AM4 siguen soportados; la causa (distancia entre orificios) no la respalda ninguna fuente primaria abierta.
- `lga1851-procesadores-memoria`: «serie 200S» no aparece en Intel; usa «Core Ultra (serie 2) para escritorio».
- `chipsets-overclock`: AMD también habilita X670E y X670 y no B840; reformulación propuesta.
- `chipsets-intel`: falta el H770 en LGA 1700.
- `chipset-enlace-procesador`: DMI está confirmado para Intel; que AMD use PCIe y que los dispositivos «compartan» el enlace no lo dice ninguna fuente primaria abierta.
- `vrm-funcion`: la fuente es indirecta (la guía de fuentes EPS12V y el manual); no hay nota técnica de Intel/AMD que lo diga igual.
- `pcie-tamanos-fisicos`: solo fuentes de fabricantes de sistemas (Dell, Lenovo); PCI-SIG no abre.
- `pcie-ancho-banda-generaciones`: GT/s y la duplicación están en los comunicados de PCI-SIG; los GB/s son cálculo propio.
- `pcie-compatibilidad-atras`: la compatibilidad está confirmada; «a la velocidad de la menor» no está escrito en lo que pude abrir.
- `windows-tpm-arranque-seguro`: Microsoft pide «capacidad de» arranque seguro, no que esté activado.

### 3. Los que recomiendo quitar
Ninguno. Todos aportan y la mayoría se arreglan con la reformulación propuesta. Si prefieres un sitio más cualitativo, candidatos a recortar sin perder valor: la cifra «1718 contactos» de `am5-lga` (solo respaldada en la línea embebida de AMD y en un catálogo de ASRock), el paréntesis en GB/s de `pcie-ancho-banda-generaciones` y la mención de AMD en `chipset-enlace-procesador`.

### Fuentes a fijar en el archivo de contenido (sustituyen a las fichas candidatas)
- Manual de placa AM5: Gigabyte B650 AORUS ELITE AX (`download.gigabyte.com/FileList/Manual/mb_manual_b650-aorus-elite-ax_1204_e.pdf`); manual de placa LGA1700: Gigabyte Z790 AORUS ELITE AX (`.../mb_manual_z790-ae-series_1105_e.pdf`). Reemplazan a `MANUAL_ASUS` y `MANUAL_ASROCK` (que apuntan a páginas de soporte genéricas).
- Corsair: «Can I use a PCI-e cable in the 8-pin motherboard plug?» y «Which PSU cables go where?» (EPS y PCIe).
- Guía EPS12V v2.91 de SSI (copia en xDevs.com) para el conector de procesador de 8 pines.
- Intel: artículos de soporte 000099656 (LGA 1851 y disipadores), 000088168 (LGA1700), 000095894 (BIOS en Z690), 000097808 (overclock), 000094205 (PTT), y ARK de chipsets (`ark/products/series/46645`).
- AMD: comunicado de Ryzen Embedded 7000 (1718 contactos LGA) y artículo `partner/socket-am5-change-game` (disipadores AM4).
- Kingston (fichas DDR4 y DDR5) y Corsair «Is DDR5 backwards compatible?» para la muesca.
- Microsoft: UEFI firmware requirements y Enable TPM 2.0.

### Lo que NO pude confirmar (honesto)
- Nada en las especificaciones de PCI-SIG (`pcisig.com` bloquea el acceso) ni en el estándar de JEDEC (el PDF exige cuenta) ni en `uefi.org` (Cloudflare). Los hechos de PCIe y RAM se apoyan en comunicados de PCI-SIG copiados por terceros, fichas de módulos de Kingston y artículos de Corsair, no en los documentos de los estándares.
- «El tipo LGA y los 1718 contactos» de AM5 no figuran en las páginas de producto de AMD de escritorio; los saqué de un comunicado de AMD sobre su línea embebida (mismo socket) y del catálogo de ASRock.
- La afirmación sobre disipadores AM4 con piezas de montaje nuevas depende de fuentes secundarias que no abrí.
- El «sin procesador» de Flashback: lo respalda ASUS; el manual de Gigabyte no lo afirma.
