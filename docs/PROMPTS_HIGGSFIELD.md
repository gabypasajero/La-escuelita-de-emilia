# Prompts para Higgsfield: lavado de manos y cepillado de dientes

> Videos cortos con movimiento real para las rutinas de la casa de Emilia (`app/casa/rutina.tsx`).
> Pensados para niños de 3 a 6 años: un solo movimiento por video, lento, exagerado y claro, con fondo simple y sin texto.
> Noviembre 2026.

## Cómo se hacen

1. **Dos imágenes base** (Nano Banana Pro, 2 créditos cada una): las manos del niño en el lavamanos, y Emilia frente al espejo con su cepillo. Así todos los videos parten del mismo dibujo y se ven parejos.
2. **Un video por paso** (Kling 3.0, 3 segundos, sin sonido, formato cuadrado, 4,5 créditos cada uno), animando la imagen base. En la app cada video se repite en bucle durante el paso, mientras Emilia guía con su voz.
3. Se revisa cada resultado (sobre todo que las manos tengan 5 dedos) y se rehace el que salga mal.

**Costo estimado:** 2 imágenes (4 créditos) + 13 videos (58,5 créditos) = **62,5 créditos**. Quedan unos 37 créditos de la prueba para rehacer los que salgan mal.

**Por qué los prompts van en inglés:** los modelos de Higgsfield entienden mejor el inglés y dan resultados más fieles. Al lado va la traducción.

## Estilo común (se agrega a todos los prompts)

> Soft 3D animated style like a preschool educational TV show, bright friendly colors, soft lighting, simple clean background, slow and clearly exaggerated movements so a 3-year-old can copy them, static camera, no text, no logos.

*Estilo 3D suave como un programa educativo de preescolar, colores alegres, luz suave, fondo simple, movimientos lentos y bien marcados para que un niño de 3 años los imite, cámara quieta, sin texto ni logos.*

## Imágenes base

| # | Prompt (inglés) | Traducción |
|---|---|---|
| IMG-1 Manos | Close-up of a small child's two hands (about 5 years old) above a white bathroom sink with a chrome faucet, light blue tiled wall, pink soap dispenser on the left. Hands centered, fully visible with five fingers each and wrists, front view at the child's eye level. + estilo común | Primer plano de las dos manos de un niño de unos 5 años sobre un lavamanos blanco con llave cromada, pared de azulejos celestes y dispensador de jabón rosado a la izquierda. Manos al centro, completas, con 5 dedos cada una, vistas de frente. |
| IMG-2 Emilia | Emilia, a cheerful 6-year-old cartoon girl with brown hair in two pigtails with red hair ties and a yellow dress (follow the reference image for her look), standing in front of a bathroom mirror and facing the viewer, holding a small turquoise toothbrush with a pea-sized dab of toothpaste near her smiling mouth. Light blue tiled bathroom, face and upper body centered, teeth clearly visible. + estilo común | Emilia, niña alegre de 6 años con dos colitas de pelo café con colets rojos y vestido amarillo (según la imagen de referencia), frente al espejo del baño mirando al niño, con un cepillo turquesa con pasta del tamaño de una arveja junto a su boca sonriente. |

## Videos: lavado de manos (desde IMG-1)

| Código | Paso | Prompt (inglés) | Traducción |
|---|---|---|---|
| VID-M1 | Mojar | A gentle stream of water falls from the faucet; the hands move under the water and get wet. | Cae un chorrito de agua y las manos se mojan debajo. |
| VID-M2 | Jabón | One hand presses the pink soap dispenser once and a small drop of soap falls into the other palm. | Una mano aprieta el dispensador y cae una gota de jabón en la otra palma. |
| VID-M3 | Palmas | The hands rub palm against palm in slow circles while white soap foam and bubbles grow. | Las palmas se frotan en círculos lentos y crece la espuma. |
| VID-M4 | Dorso | One palm rubs the back of the other hand, fingers interlaced, then the hands switch. Soapy foam. | Una palma frota el dorso de la otra mano con los dedos entrelazados, y luego cambian. |
| VID-M5 | Entre los dedos | Palm to palm with fingers interlaced, the fingers slide between each other back and forth. Soapy foam. | Palma con palma y dedos entrelazados, deslizándose entre sí. |
| VID-M6 | Uñas y pulgares | The fingertips rub in small circles on the opposite palm, then one hand wraps around the other thumb and twists. Soapy foam. | Las puntas de los dedos frotan en circulitos la otra palma; luego una mano envuelve y gira el pulgar de la otra. |
| VID-M7 | Enjuagar | The hands under running water; all the foam washes away down the sink and the hands become clean and shiny. | Bajo el agua, la espuma se va por el desagüe y las manos quedan limpias y brillantes. |
| VID-M8 | Secar | The hands pat dry with a fluffy orange towel, then open to show clean fingers with small sparkles. | Se secan con una toalla naranja esponjosa y se abren mostrando los dedos limpios con brillitos. |

## Videos: cepillado de dientes (desde IMG-2)

| Código | Paso | Prompt (inglés) | Traducción |
|---|---|---|---|
| VID-D1 | Arriba | Emilia brushes her upper teeth with small gentle circles, mouth open in a big smile, a little white foam, looking at the viewer as if in a mirror. | Emilia cepilla los dientes de arriba con circulitos suaves, boca abierta y sonriente, un poco de espuma, mirando al niño como en un espejo. |
| VID-D2 | Abajo | Emilia brushes her lower teeth with small gentle circles, mouth open, a little white foam, looking at the viewer. | Cepilla los dientes de abajo con circulitos suaves. |
| VID-D3 | Adelante | Emilia closes her teeth in a big smile and brushes her front teeth with small circles, looking at the viewer. | Junta los dientes en una gran sonrisa y cepilla los de adelante en circulitos. |
| VID-D4 | Muelas | Emilia opens wide and brushes her back molars on one side, then the other side, with small back-and-forth strokes. | Abre bien la boca y cepilla las muelas de un lado y luego del otro. |
| VID-D5 | Lengua | Emilia sticks out her tongue and gently brushes it from back to front, then smiles. | Saca la lengua, la cepilla suavecito de atrás hacia adelante y sonríe. |

Todos los videos: Kling 3.0, 3 segundos, modo estándar, sin sonido, formato 1:1, con la imagen base como primer cuadro y el estilo común agregado al final.

## Próxima versión: video continuo (sin bucles)

> Idea anotada en noviembre 2026, después de probar los 13 videos en bucle. Para los niños el bucle funciona (repetir el movimiento ayuda a imitarlo), pero un video continuo se verá más natural y profesional.

- **Un video por rutina:** unos 40 segundos para el lavado de manos y unos 2 minutos para el cepillado (el tiempo recomendado por los dentistas).
- **Encadenar tramos:** cada tramo parte del último cuadro del anterior (extensión de video de Seedance 2.5, hasta 30 segundos por tramo), para que no haya saltos entre pasos.
- **Sincronizar la app con el video:** los pasos, la voz de Emilia y los indicadores de abajo avanzan según el segundo del video, en vez de un temporizador aparte.
- **Costo estimado:** 100 a 150 créditos para las dos rutinas en calidad pro (cabe en un mes del plan Plus).
- Partir de las mismas imágenes base (`docs/capturas/manos-3d-base-lavado.png` y `docs/capturas/emilia-3d-base-cepillado.png`) para mantener el estilo.
