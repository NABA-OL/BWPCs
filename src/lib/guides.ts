/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-04
 */

/**
 * Contenido de las guías públicas (/guias). Texto plano estructurado: sin CMS,
 * sin markdown que parsear. Si crece mucho, mover a la BD.
 */

export interface GuideSection {
  h2: string;
  parrafos: string[];
  lista?: string[];
}

export interface Guide {
  slug: string;
  titulo: string;
  /** H1 de la página; puede diferir del title del SERP. */
  h1: string;
  descripcion: string;
  keywords: string[];
  /** ISO yyyy-mm-dd. Se muestra y alimenta el schema Article. */
  publicado: string;
  actualizado: string;
  resumen: string[];
  intro: string[];
  secciones: GuideSection[];
  faqs: { q: string; a: string }[];
  /** Marca la guía pilar: incluye la tabla de presupuestos en vivo. */
  incluyeTablaPresupuestos?: boolean;
}

export const GUIDES: Guide[] = [
  {
    slug: "cuanto-cuesta-armar-un-pc-en-colombia",
    titulo: "Cuánto cuesta armar un PC en Colombia",
    h1: "Cuánto cuesta armar un PC en Colombia",
    descripcion:
      "Cuánto vale armar un computador en Colombia según el uso y el presupuesto, con precios reales de componentes y qué esperar en cada rango.",
    keywords: [
      "cuánto cuesta armar un pc colombia",
      "precio pc gamer colombia",
      "cuánto vale un pc gamer en colombia",
      "presupuesto pc gamer colombia",
      "armar pc colombia precio",
    ],
    publicado: "2026-09-04",
    actualizado: "2026-09-04",
    incluyeTablaPresupuestos: true,
    resumen: [
      "Un equipo funcional para jugar en 1080p arranca cerca de los 3 millones de pesos.",
      "El salto de calidad más grande está entre los 3 y los 5 millones.",
      "Gráfica y procesador se llevan más de la mitad del presupuesto.",
      "El precio se mueve con el dólar: lo importado cambia mes a mes.",
    ],
    intro: [
      "La respuesta corta es que depende de para qué lo quieras, pero eso no le sirve a nadie que esté haciendo cuentas. La respuesta útil es un rango: hoy en Colombia, un computador armado que sirva de verdad para jugar arranca alrededor de los 3 millones de pesos, y de ahí para arriba lo que compras es margen — más cuadros por segundo, más resolución, más años antes de tener que actualizar.",
      "Debajo de ese piso todavía se puede armar algo, pero ya no es un equipo para juegos: es un computador de oficina que corre algunos títulos ligeros. Vale la pena decirlo claro antes de que alguien gaste 2 millones esperando otra cosa.",
    ],
    secciones: [
      {
        h2: "Por qué los precios se mueven tanto",
        parrafos: [
          "Las tarjetas gráficas y los procesadores son importados. Su precio en pesos es, en el fondo, un precio en dólares multiplicado por la TRM del día más los costos de traerlos. Cuando el dólar sube, el mismo componente cuesta más al día siguiente sin que nada haya cambiado en el mercado.",
          "Eso explica algo que confunde a mucha gente: dos cotizaciones de la misma máquina, con un mes de diferencia, pueden variar cientos de miles de pesos. No es que le estén cobrando de más — es que el insumo cambió de precio.",
          "El resto de piezas (board, RAM, fuente, chasis, almacenamiento) se mueve menos, pero también responde al dólar con retraso.",
        ],
      },
      {
        h2: "En qué se va la plata",
        parrafos: [
          "En un equipo pensado para jugar, la gráfica y el procesador se llevan típicamente entre el 55% y el 65% del presupuesto. Es donde más se nota cada peso adicional, y es donde menos conviene ahorrar si el objetivo es rendimiento.",
          "El resto se reparte entre piezas que no dan cuadros por segundo pero sí determinan si el equipo funciona bien: la fuente de poder, que si es mala se lleva todo lo demás por delante; la RAM, que decide cuántas cosas puedes tener abiertas; el almacenamiento, que define cuánto esperas para que algo abra; y el chasis, que decide qué tan caliente trabaja todo.",
        ],
        lista: [
          "Gráfica: entre el 30% y el 40% del total en un equipo gamer.",
          "Procesador: entre el 20% y el 25%.",
          "RAM y almacenamiento: cerca del 15% combinado.",
          "Board y fuente: alrededor del 15%.",
          "Chasis y refrigeración: el 10% restante.",
        ],
      },
      {
        h2: "Dónde no ahorrar",
        parrafos: [
          "La fuente de poder es el error más caro que vemos. Una fuente genérica sin certificación puede fallar y llevarse componentes de varios millones con ella. La diferencia entre una fuente mala y una decente son unos 150.000 pesos, y es la mejor póliza de seguro que se puede comprar.",
          "El segundo error es el almacenamiento mecánico. Un disco duro tradicional cuesta menos por gigabyte, pero el equipo se siente lento todos los días. Un SSD NVMe cambia por completo la percepción de velocidad, incluso más que subir de procesador.",
          "El tercero es comprar poca RAM pensando en ampliarla después. Se puede, pero si compras un solo módulo pierdes el rendimiento de doble canal, que es gratis si compras dos desde el principio.",
        ],
      },
      {
        h2: "Armado propio o ensamblado",
        parrafos: [
          "Armar uno mismo ahorra el costo del servicio, y si ya tienes experiencia es perfectamente razonable. Lo que se paga al encargarlo no es solo el atornillado: es la selección de componentes compatibles, la instalación y configuración del sistema, el manejo de cables que mantiene las temperaturas bajas y las pruebas de estabilidad antes de entregar.",
          "También está el tema de la garantía. Comprando pieza por pieza en distintos lados, cada componente responde por su lado. Con un equipo ensamblado hay un solo responsable si algo sale mal.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cuál es el presupuesto mínimo para un PC gamer en Colombia?",
        a: "Alrededor de 3 millones de pesos para un equipo que juegue bien en 1080p en títulos competitivos. Por debajo de eso se puede armar un computador funcional, pero ya no es un equipo para juegos exigentes.",
      },
      {
        q: "¿Es más barato armarlo uno mismo?",
        a: "Se ahorra el costo del servicio de ensamblaje, sí. Pero hay que sumar el tiempo de investigar compatibilidades, el riesgo de equivocarse en una pieza y que cada componente responde por su garantía por separado.",
      },
      {
        q: "¿Por qué las gráficas son tan caras en Colombia?",
        a: "Son importadas y su precio depende del dólar más los costos de importación. Por eso el mismo modelo puede variar de precio mes a mes sin que cambie nada del producto.",
      },
      {
        q: "¿Cada cuánto hay que actualizar el equipo?",
        a: "Un equipo bien armado en gama media aguanta entre 4 y 5 años jugando cómodo si se le baja algún ajuste gráfico con el tiempo. Lo primero que se suele cambiar es la gráfica, y luego se amplía RAM o almacenamiento.",
      },
      {
        q: "¿Puedo pagar el equipo por partes?",
        a: "Aceptamos Bre-B, tarjeta, PSE, Daviplata y Nequi. Con tarjeta puedes diferir a cuotas según tu banco; el recargo por medio de pago se ve en el cotizador antes de confirmar.",
      },
    ],
  },
  {
    slug: "cuanta-ram-necesito",
    titulo: "Cuánta RAM necesito en 2026",
    h1: "Cuánta RAM necesito",
    descripcion:
      "16, 32 o 64 GB de RAM: cuánta memoria necesitas de verdad según si juegas, editas video o trabajas, y por qué importa comprar dos módulos.",
    keywords: [
      "cuánta ram necesito",
      "cuánta ram para gaming",
      "16gb o 32gb ram gaming",
      "ram ddr5 colombia",
      "cuánta memoria ram necesito pc",
    ],
    publicado: "2026-09-04",
    actualizado: "2026-09-04",
    resumen: [
      "16 GB sigue siendo suficiente para jugar en 2026, pero sin margen.",
      "32 GB es el punto dulce si además editas, transmites o trabajas.",
      "Comprar dos módulos en vez de uno da rendimiento gratis.",
      "Más allá de 64 GB solo tiene sentido en cargas profesionales específicas.",
    ],
    intro: [
      "La RAM no hace que el equipo sea más rápido: hace que no se ponga lento. Es la diferencia entre tener el juego, el navegador con quince pestañas y Discord abiertos sin que nada se trabe, y tener que ir cerrando cosas para poder jugar.",
      "Por eso la pregunta correcta no es «cuánta RAM rinde más», sino «cuánta RAM necesito para lo que hago sin quedarme corto».",
    ],
    secciones: [
      {
        h2: "16 GB: el mínimo razonable",
        parrafos: [
          "Para jugar en 2026, 16 GB todavía alcanzan. La mayoría de títulos funcionan sin problema, y si el equipo es solo para juegos y navegar, no vas a notar limitaciones el primer año.",
          "El problema es el margen. Con 16 GB, un juego moderno pesado más el navegador más un programa de chat ya empieza a rozar el techo. Cuando eso pasa, el sistema empieza a mover datos al disco y el equipo se siente entrecortado aunque el procesador y la gráfica estén sobrados.",
        ],
      },
      {
        h2: "32 GB: donde deja de importar",
        parrafos: [
          "Es el punto en el que dejas de pensar en la RAM. Puedes tener el juego abierto, transmitir, editar en segundo plano y no acercarte al límite.",
          "Si editas video, trabajas con archivos grandes, modelas en 3D o corres máquinas virtuales, 32 GB no es lujo: es el mínimo cómodo. En edición 4K con varias capas y efectos, 16 GB se queda corto rápido.",
          "La diferencia de precio entre 16 y 32 GB es de las más rentables del presupuesto — cuesta bastante menos que subir un escalón de gráfica y se siente todos los días.",
        ],
      },
      {
        h2: "Dos módulos, no uno",
        parrafos: [
          "Esto se pasa por alto constantemente. La memoria trabaja en doble canal cuando hay dos módulos instalados, y eso da un rendimiento medible — especialmente en procesadores con gráficos integrados, donde la diferencia es grande.",
          "Comprar un solo módulo de 32 GB en vez de dos de 16 GB significa pagar lo mismo por menos rendimiento. La única razón para hacerlo es dejar ranuras libres para ampliar después, y casi nunca compensa.",
        ],
      },
      {
        h2: "Velocidad y latencia",
        parrafos: [
          "Después de la capacidad viene la velocidad. En DDR5, el rango que hoy tiene sentido en precio-rendimiento está entre 6000 y 6400 MT/s. Subir más allá cuesta desproporcionadamente para una ganancia que casi no se nota.",
          "Un detalle que importa: la memoria no corre a su velocidad anunciada por defecto. Hay que activar el perfil (EXPO en AMD, XMP en Intel) en la BIOS. Si no se hace, estás pagando por velocidad que no estás usando — es una de las cosas que dejamos configuradas al entregar un equipo.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿16 GB de RAM son suficientes para jugar en 2026?",
        a: "Sí, para la mayoría de juegos. Pero es el mínimo, no lo cómodo: si además tienes navegador, chat o grabas, te vas a quedar corto.",
      },
      {
        q: "¿Vale la pena pasar de 32 a 64 GB?",
        a: "Solo si trabajas con cargas específicas: render 3D pesado, edición 8K, máquinas virtuales o simulación. Para jugar no aporta nada.",
      },
      {
        q: "¿Puedo mezclar módulos de RAM distintos?",
        a: "Técnicamente sí, pero funcionarán a la velocidad del más lento y puede haber inestabilidad. Lo recomendable es un kit de dos módulos iguales comprados juntos.",
      },
      {
        q: "¿Importa la marca de la RAM?",
        a: "Menos de lo que parece. Lo que importa es la capacidad, que sean dos módulos, la velocidad y que el perfil quede activado en la BIOS.",
      },
    ],
  },
  {
    slug: "cuantos-vatios-necesita-mi-fuente",
    titulo: "Cuántos vatios necesita mi fuente de poder",
    h1: "Cuántos vatios necesita tu fuente",
    descripcion:
      "Cómo calcular los vatios que necesita tu PC, por qué la certificación 80 Plus importa y por qué la fuente es la peor pieza para ahorrar.",
    keywords: [
      "cuántos vatios necesita mi fuente",
      "calcular fuente de poder pc",
      "fuente 80 plus colombia",
      "qué fuente de poder comprar",
      "vatios fuente pc gamer",
    ],
    publicado: "2026-09-04",
    actualizado: "2026-09-04",
    resumen: [
      "Suma el consumo de gráfica y procesador y añade un 30% de margen.",
      "La certificación 80 Plus mide eficiencia, no calidad absoluta — pero correlaciona.",
      "Una fuente mala puede dañar el resto del equipo al fallar.",
      "Es la pieza donde ahorrar sale más caro.",
    ],
    intro: [
      "La fuente de poder es la pieza más aburrida del equipo y la que más daño hace cuando se elige mal. No da cuadros por segundo, no aparece en los benchmarks y nadie la presume. Pero es la única pieza que, al fallar, puede llevarse a las demás con ella.",
      "Calcular cuántos vatios necesitas no es complicado, y hacerlo bien evita tanto quedarse corto como pagar por potencia que nunca vas a usar.",
    ],
    secciones: [
      {
        h2: "El cálculo, sin complicarlo",
        parrafos: [
          "La gráfica y el procesador son el 80% del consumo. El resto del equipo —board, RAM, discos, ventiladores— suma entre 50 y 100 vatios en total, y no vale la pena calcularlo pieza por pieza.",
          "Toma el consumo declarado de tu gráfica, súmale el del procesador, agrega 100 vatios por el resto y multiplica el resultado por 1,3. Ese 30% de margen no es paranoia: cubre los picos instantáneos de las gráficas modernas, que pueden superar bastante su consumo nominal por milisegundos, y deja espacio para actualizar más adelante.",
        ],
        lista: [
          "Equipo con gráfica de gama media: entre 550 y 650 vatios es suficiente.",
          "Gama alta: entre 750 y 850 vatios.",
          "Gama entusiasta o tope: 1000 vatios en adelante.",
          "Sin gráfica dedicada: 450 a 500 vatios sobran.",
        ],
      },
      {
        h2: "Qué significa 80 Plus",
        parrafos: [
          "La certificación 80 Plus mide eficiencia: cuánta de la energía que entra de la pared llega efectivamente a los componentes, y cuánta se pierde como calor. Bronze, Silver, Gold y Platinum son escalones de esa escala.",
          "Una fuente más eficiente genera menos calor, hace menos ruido y consume un poco menos de luz. Pero el beneficio real es indirecto: las fuentes con certificación alta suelen usar mejores componentes internos, porque el fabricante ya invirtió en calidad para conseguir la certificación.",
          "Para la mayoría de equipos, 80 Plus Bronze es el piso aceptable y Gold es el punto de equilibrio entre precio y calidad.",
        ],
      },
      {
        h2: "Por qué no ahorrar aquí",
        parrafos: [
          "Una fuente genérica sin certificación puede entregar voltajes inestables, y eso desgasta silenciosamente el resto de componentes. Cuando falla, no siempre falla sola: puede arrastrar la board, el procesador o la gráfica.",
          "La diferencia de precio entre una fuente sin marca y una certificada decente ronda los 150.000 pesos. Frente a un equipo de varios millones, es la mejor relación entre lo que cuesta y lo que protege.",
          "También importa el cableado. Una fuente modular deja meter solo los cables que usas, lo que mejora el flujo de aire y baja las temperaturas de todo el equipo.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Qué pasa si mi fuente se queda corta de vatios?",
        a: "El equipo se apaga solo bajo carga, normalmente jugando o renderizando. No siempre da un error claro, así que es una falla difícil de diagnosticar si no se sospecha de la fuente.",
      },
      {
        q: "¿Una fuente de más vatios consume más luz?",
        a: "No. La fuente entrega lo que el equipo pide, no su máximo. Una fuente de 850 W en un equipo que consume 400 W entrega 400 W.",
      },
      {
        q: "¿Vale la pena una fuente modular?",
        a: "Para la mayoría sí: mejora el flujo de aire, facilita el mantenimiento y deja el interior mucho más ordenado. En chasis pequeños es prácticamente necesaria.",
      },
      {
        q: "¿Puedo reutilizar la fuente de mi equipo anterior?",
        a: "Depende de su edad, potencia y certificación. Si tiene más de cinco años o no tiene certificación, no lo recomendamos: es la pieza que más se degrada con el uso.",
      },
    ],
  },
];

export function findGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}
