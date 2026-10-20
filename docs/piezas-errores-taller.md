# Errores reales del taller (material para las páginas de "Piezas a fondo")

Fuente: relato del dueño (2026-10-11). Es experiencia de primera mano de B & W: lo que más pesa para E-E-A-T y para que los buscadores y motores de IA citen las páginas. Reglas al usarlo:

- **Vivido** = le ha pasado en el taller; se puede escribir «Nos ha pasado». **Puede pasar** = riesgo conocido que el dueño no ha vivido; se escribe «Puede pasar», nunca como experiencia propia.
- Sin datos de clientes. Sin cifras en la prosa (los voltajes, longitudes y conectores van como `Hecho` con fuente y verificación, como en `src/lib/piezas/types.ts`).
- Lo marcado «verificar» son afirmaciones de memoria del dueño: no se publican sin fuente primaria o manual concreto.
- La board ya usa los de su página (ver `errores` en `src/lib/piezas/tarjeta-madre.contenido.ts`). El resto queda aquí para cuando se hagan las otras piezas.

## Ya usados en la página de tarjeta madre
- Vivido: BIOS que no reconocía un procesador compatible; el equipo giraba ventiladores y se apagaba; se resolvió actualizando la BIOS por USB (en ese caso, Gigabyte, función Q-Flash).
- Vivido: cliente que trajo memoria DDR5 para una placa DDR4.
- Vivido: luces/ventiladores RGB no compatibles (cuatro pines vs tres pines). El dueño no recuerda cuál es 12 V y cuál 5 V: verificar.
- Vivido: monitor conectado a la placa teniendo gráfica dedicada (rendimiento bajo) y, al revés, sin gráficos integrados (sin imagen).
- Puede pasar: pines del socket doblados por mala instalación; cable de ventilador o luz en un cabezal equivocado (puede dañar la pieza o la placa); M.2 en ranura no compatible o que comparte líneas con SATA; placa que no cabe en el chasis; RAM a medio insertar; olvidar el EPS.

## Procesador y disipación (página de procesador / refrigeración)
- Puede pasar: olvidar quitar el plástico protector de la base del disipador (de aire o líquido): el equipo se calienta porque no hay contacto con el procesador.
- Puede pasar: pasta térmica mal aplicada.
- Vivido (criterio de taller): procesador de gama alta con el disipador básico que trae de fábrica, que solo alcanza para uno de gama baja. B & W prefiere, como mínimo, un disipador de torre aunque sea de un solo ventilador. Si el chasis no lo permite (por ejemplo, ITX pequeño), usar uno de bajo perfil bueno. Es criterio comercial, no dato verificable: el dueño debe aprobar la redacción.
- Idea de contenido: tabla "qué disipador para qué procesador" sin cifras de vatios en la prosa (TDP como `Hecho` con fuente).

## Gráfica (página de gráfica)
- Vivido: gráfica conectada a la ranura PCIe de la placa pero sin el cable de alimentación.
- Vivido (recomendación de taller): si la gráfica tiene dos o tres conectores de ocho pines, usar un cable independiente de la fuente para cada uno, no un solo cable que se ramifique. Verificar con la guía del fabricante de la gráfica o de la fuente antes de afirmarlo como regla.
- Puede pasar: conector nuevo de doce pines (12VHPWR / 12V-2x6) no insertado hasta el fondo. El dueño lo relaciona con los casos de conectores quemados en la serie 4000 de NVIDIA: **verificar con fuente primaria y redactar con cuidado, sin culpar a una marca**; decir solo que el conector debe quedar insertado por completo.
- Vivido: gráfica de tres ventiladores muy larga para el chasis: no entra o hay que improvisar (por ejemplo, quitar un ventilador frontal).

## Fuente de poder (página de fuente)
- Vivido: ventilador de la fuente mal orientado (colocada al revés), que no respira bien. Verificar la regla según la ubicación de la fuente en el chasis.
- Vivido: entrega de la torre con el interruptor de la fuente en apagado; el cliente escribe que no enciende. Dato útil para el cierre de la entrega y para preguntas frecuentes.
- Puede pasar: cables SATA de datos o de energía mal conectados.

## Chasis y flujo de aire (página de chasis; el dueño dijo que el chasis no lleva página propia, usarlo en las guías o en el cierre de ensamble)
- Vivido: equipos que llegan con todos los ventiladores empujando aire hacia adentro (por ejemplo, seis entrando y uno saliendo): el flujo queda mal.
- Vivido: chasis demasiado pequeño para una placa ATX; gráfica demasiado larga.

## Almacenamiento y cliente
- Puede pasar: SSD M.2 SATA en una ranura que solo admite NVMe, o al revés (ya cubierto en la página de la placa; ampliar si hay página de almacenamiento).
- Vivido: mala interpretación del cliente sobre el tamaño de la placa («pequeña = de baja calidad»). Ya cubierto en la sección de tamaños.

## Cómo usarlo después
Cuando se haga la página de una pieza, tomar de aquí lo que le corresponda, convertir cada afirmación técnica en un `Hecho` con fuente, y dejar `verificadoEn: null` hasta que una persona lo verifique. Conservar la distinción «Nos ha pasado» / «Puede pasar».
