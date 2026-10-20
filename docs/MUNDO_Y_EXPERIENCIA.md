# El mundo de Emilia: concepto, sesiones y experiencia del niño

> Define **cómo se vive el juego** desde los ojos de un niño de 3 a 6 años: el mundo, los personajes, cómo es una sesión de juego y las reglas de interfaz.
> Complementa [ESTUDIO.md](ESTUDIO.md), [EVALUACION.md](EVALUACION.md) e [IDIOMAS.md](IDIOMAS.md). Octubre 2026.

---

## 1. Concepto en una frase

**Emilia tiene una escuelita mágica en su barrio, y cada día invita al niño a jugar, explorar y aprender con ella y sus amigos.**

No es "una app con ejercicios": es **un lugar al que el niño vuelve**, con personajes que lo conocen, un barrio que crece a medida que aprende y una rutina parecida a la del jardín.

### Los tres pilares de la experiencia

| Pilar | Qué significa para el niño |
|---|---|
| 🏡 **Un lugar propio** | Un barrio con casas, una plaza, una granja y una tiendita. Siempre sabe dónde está y cómo volver. |
| 🤝 **Amigos que lo acompañan** | Emilia y su mascota lo saludan por su nombre (alias), lo animan y nunca lo retan. |
| 🌱 **Ver crecer lo que aprende** | Cada cosa que aprende de verdad hace florecer algo en el barrio. |

---

## 2. Personajes

| Personaje | Quién es | Rol en el juego |
|---|---|---|
| 👧 **Emilia** | Niña de 6 años, curiosa, alegre, a veces se equivoca y se ríe de sí misma. | Guía principal: explica, celebra, da pistas y cierra cada sesión. |
| 🦌 **Tito, el pudú** | La mascota de Emilia. El pudú es el ciervo más pequeño del mundo y vive en el sur de Chile y Argentina. Tímido, tierno, no habla: hace sonidos y gestos. | Compañero emocional: aparece cuando el niño se frustra, en el rincón de la calma y en las celebraciones. Es el "peluche" de la marca. |
| 🧢 **Max** · 🎨 **Bia** · 🥐 **Léa** · 🐼 **Xiao Lin** | Amigos de otros países que visitan el barrio. Cada uno habla solo su idioma. | Enseñan idiomas ([IDIOMAS.md](IDIOMAS.md)). Aparecen como clientes en la tiendita, en la plaza o en su propia casa. |
| 👵 **Doña Rosa** | La almacenera del barrio. | Cliente y dueña de la Tiendita. |
| 🧑‍⚕️ **Dr. Lucas** | El veterinario. | Mundo de roles de la Veterinaria. |
| 🧑‍🌾 **Don Pedro** | Cuida la granja y el huerto. | Animales, plantas y conteo. |
| 🧒 **El niño** | Su propio personaje, creado por él. | Protagonista: Emilia le habla a él. |

**Reglas para los personajes:**
- Hablan en frases cortas (5 a 8 palabras), con calidez y humor.
- **Nunca dicen "mal" ni "incorrecto".** Dicen *"¡Casi!"*, *"Probemos otra vez"* o *"¡Uy, me confundí yo también!"*.
- Emilia también se equivoca a propósito a veces, para que el niño la corrija. Esto enseña que equivocarse es normal y le da al niño el rol de experto.

### El personaje del niño (avatar)

Al empezar, el niño arma su personaje con imágenes, sin texto:
- Color de piel, pelo, ojos y ropa.
- Opciones inclusivas: lentes, audífonos para la audición, silla de ruedas, hiyab, entre otras.
- Elige su **color favorito** (se usa en su casa y en sus pegatinas).
- El adulto escribe el **alias**, desde la zona de padres.

---

## 3. El mundo: el barrio de Emilia

El inicio deja de ser una lista de botones y se convierte en un **mapa del barrio** que se recorre deslizando el dedo. Cada lugar es un módulo del juego.

```
                 🏔️  🏔️   cordillera   🏔️  🏔️
   ┌──────────────────────────────────────────────────┐
   │  🌳 Bosque y        🐄 Granja de        🌻 Huerto  │
   │     laguna            Don Pedro                    │
   │     (Animales)        (Animales)                   │
   │                                                    │
   │  🎨 Taller          🏫 LA ESCUELITA     🛒 Tiendita │
   │     de arte            (Letras y          de Doña  │
   │     (Pintar)            Números)          Rosa     │
   │                                                    │
   │  🏠 Mi casita       🎠 Plaza de         🐾 Vete-   │
   │     (avatar,           juegos            rinaria   │
   │     pegatinas,         (Memoria,                   │
   │     dibujos)           puzzles)        🍳 Cocina   │
   │                                                    │
   │          🚌 Paradero de los amigos                 │
   │             (Idiomas: casas de Max, Bia,           │
   │              Léa y Xiao Lin)                       │
   └──────────────────────────────────────────────────┘
```

| Lugar | Módulo | Qué se hace |
|---|---|---|
| 🏫 **La Escuelita** | Letras y Números | Pizarra mágica para conocer y trazar letras y números; juegos de sonido inicial y conteo. |
| 🎨 **Taller de arte** | Pintar | Lienzo libre, colorear por zonas, dibujo guiado paso a paso, galería. |
| 🐄 **Granja** · 🌳 **Bosque y laguna** | Animales | Tocar animales para escuchar su nombre y sonido, adivinar por el sonido, ¿dónde vive?, mamá y cría. |
| 🛒 **Tiendita de Doña Rosa** | Mundo de roles | Atender pedidos contando productos. Ya construida ([ver app](../apps/mobile/app/juegos/tiendita.tsx)). |
| 🍳 **Cocina** · 🐾 **Veterinaria** · 🌻 **Huerto** | Mundos de roles | Recetas por colores y formas, cuidar animales, plantar y contar. |
| 🎠 **Plaza de juegos** | Minijuegos | Memoria (ya construida), puzzles, patrones, laberintos, el intruso. |
| 🚌 **Paradero de los amigos** | Idiomas | Llega el bus y baja un amigo; cada uno tiene su casa con juegos en su idioma. |
| 🏠 **Mi casita** | Espacio personal | Cambiar ropa, álbum de pegatinas, galería de dibujos, el **árbol del saber**. |

### El mundo está vivo

- **Hora del día real:** en la mañana el sol sale y Emilia llega con su mochila. En la noche el barrio se oscurece, Emilia bosteza y propone un cuento tranquilo. Ayuda a no jugar de noche.
- **Estaciones y fiestas:** lluvia en invierno, volantines en septiembre (Fiestas Patrias), Navidad. Lo que cambia es la decoración del barrio, no los juegos.
- **Pequeñas sorpresas al tocar:** el gato de la vereda maúlla, las flores se mueven, el bus toca la bocina. Explorar siempre tiene recompensa.
- **Sin elementos que distraigan:** nada parpadea pidiendo atención, no hay notificaciones dentro del juego y no hay tiendas.

### El barrio crece con lo que el niño aprende

- **El árbol del saber**, en el patio de Mi casita: cada habilidad **consolidada** ([EVALUACION.md](EVALUACION.md)) hace brotar una flor o un fruto con su ícono (una letra, un número, un animal). Es la versión visual, para el niño, del informe que recibe la familia.
- **Lugares que se despiertan jugando, nunca pagando:** al principio la Veterinaria está "en construcción" con Tito ayudando; se abre cuando el niño juega en la Granja. Esto da metas cortas y una sensación de avance.
- **Las pegatinas se ganan** con estrellas y se pegan donde el niño quiera: en su casa, en la plaza o en el árbol.

---

## 4. La sesión de juego

Una sesión ideal dura **10 a 15 minutos** y sigue la rutina de un día de jardín: saludo, actividad, juego y despedida. Así el niño sabe qué esperar, y la sesión termina de forma natural.

### 4.1 Estructura de una sesión (modo Paseo con Emilia)

| Momento | Duración | Qué pasa | Por qué |
|---|---|---|---|
| 👋 **1. Saludo** | ~1 min | Emilia saluda al niño por su alias. Pregunta *"¿Cómo te sientes hoy?"* con 4 caritas (feliz, tranquilo, triste, enojado). | Rutina, vínculo y educación emocional. Si elige triste o enojado, Tito lo invita a respirar juntos antes de seguir. |
| 🔁 **2. Repaso** | 2 min | Una actividad corta de algo que **ya domina** (repaso espaciado). | Empezar con un éxito da confianza. Además sirve para confirmar si lo logrado está consolidado. |
| 🌟 **3. Lo nuevo** | 4–5 min | La actividad principal: una habilidad **en práctica**, justo a su alcance. | Aquí está el aprendizaje. La dificultad se adapta sola. |
| 🎨 **4. Tú eliges** | 3–5 min | El niño elige libremente en el mapa: pintar, tiendita, animales, plaza. | Autonomía y juego libre. |
| 🌙 **5. Despedida** | ~1 min | Emilia resume con voz e imagen (*"¡Hoy aprendiste la M de mono!"*), entrega la pegatina del día y propone **un reto fuera de la pantalla** (*"¿Puedes encontrar algo rojo en tu casa?"*). Se despide con una canción corta. | Cierre claro, recuerdo de lo aprendido y paso al mundo real. |

### 4.2 Dos formas de jugar

| Modo | Para quién | Cómo funciona |
|---|---|---|
| 🚶 **Paseo con Emilia** (por defecto) | 3–4 años, o cualquier niño al empezar | Emilia lleva de la mano por la rutina de la sección 4.1. El niño solo sigue la voz y toca. |
| 🗺️ **Explorar el barrio** | 5–6 años, o cuando ya conoce el juego | Mapa libre. Emilia sugiere con una burbuja en el lugar recomendado, pero el niño decide. |

La familia elige el modo desde la zona de padres. El juego también puede sugerir el cambio cuando el niño ya domina la navegación.

### 4.3 Cómo termina el tiempo de juego

El tiempo diario lo fija la familia (por ejemplo, 15 o 20 minutos). Nunca se corta de golpe:
1. **A 2 minutos del final:** Emilia avisa *"Jugamos un ratito más y vamos a descansar"*. No se abren actividades nuevas largas.
2. **Al terminar:** la actividad en curso se completa y empieza la despedida.
3. **Pantalla de descanso:** Emilia y Tito se van a dormir (o a jugar afuera, si es de día) y proponen un reto sin pantalla. Para seguir jugando hace falta la puerta parental.

### 4.4 Sesión en el jardín (modo sala)

- **Tablet compartida:** el niño toca su avatar en una pantalla con todos los avatares de la sala.
- **Sesiones más cortas** (5–8 minutos) para que todos tengan turno.
- **Juegos por turnos** para 2–4 niños: memoria por turnos o "¿quién encuentra la letra primero?" sin competir por puntaje.
- La educadora puede elegir la **actividad del día** para toda la sala.

### 4.5 Ejemplo: la sesión de Tomi (4 años)

> 1. Emilia: *"¡Hola, Tomi! ¿Cómo te sientes hoy?"* Tomi toca la carita feliz. Tito salta contento.
> 2. **Repaso:** Doña Rosa pide *"dos manzanas"*. Tomi las pone en la canasta sin dudar. ⭐
> 3. **Lo nuevo:** en la Escuelita, Emilia muestra la **M** de **mono** y la traza con el dedo. Tomi la traza con la guía. Luego juegan a *"¿cuál empieza con M?"*. Tomi se equivoca una vez; Emilia hace brillar la respuesta y Tomi acierta. ⭐⭐
> 4. **Tú eliges:** Tomi va al Taller de arte y pinta un mono.
> 5. **Despedida:** *"¡Hoy aprendiste la M de mono! ¿Puedes encontrar algo en tu casa que empiece con M?"* Tomi gana la pegatina del mono y la pega en su casita.

---

## 5. Cómo aprende y cómo se le ayuda

### 5.1 Ayuda en escalera

El niño nunca queda trabado ni frustrado:

| Situación | Lo que hace el juego |
|---|---|
| No toca nada por **5 segundos** | La mano de Emilia aparece y señala suavemente; repite la consigna. |
| **Primer error** | *"¡Casi! Probemos otra vez"*. La opción tocada se mueve un poco, sin sonido de error. |
| **Segundo error** | Pista visual: la respuesta correcta brilla suavemente. |
| **Tercer error** | Emilia **muestra cómo se hace** (lo modela) y el niño lo repite. Cuenta como práctica, no como fracaso. |
| **Varios errores seguidos en el día** | Baja la dificultad sin avisar. Si el niño parece cansado, Tito propone un juego más fácil o un descanso. |

### 5.2 Celebraciones

- **Inmediatas** (en menos de 0,3 segundos) y **cortas** (2 segundos o menos) para no interrumpir el ritmo.
- **Variadas:** Emilia aplaude, Tito salta, caen confeti o estrellas; hay muchas frases distintas.
- **Proporcionales:** una celebración pequeña por cada acierto y una grande al terminar la actividad o consolidar algo nuevo (flor en el árbol del saber).
- **Elogian el esfuerzo, no solo el resultado:** *"¡Lo intentaste hasta lograrlo!"*.

### 5.3 Lo que nunca hacemos

- Vidas, castigos, puntaje que baja o pantallas de "perdiste".
- Temporizadores que presionan.
- Rachas diarias que hacen sentir culpa.
- Cajas sorpresa, ruletas o recompensas al azar que enganchan.
- Avisos o candados de compra a la vista del niño.
- Comparar al niño con otros niños.

---

## 6. Reglas de interfaz para 3 a 6 años

### 6.1 Tocar y mover

- **Objetivos grandes:** mínimo 64 px, ideal 80 a 96 px, con 16 px o más de separación.
- **Zona de toque generosa:** tocar cerca del objeto cuenta.
- **Arrastrar con imán:** al soltar cerca del destino, el objeto se acomoda solo.
- **Ignorar toques dobles accidentales** y la palma de la mano apoyada mientras dibuja.
- **Solo gestos simples:** tocar, arrastrar y trazar. Nada de pellizcar, mantener presionado ni deslizar con dos dedos.
- **Zurdos y diestros:** las herramientas de dibujo se pueden poner a la izquierda o a la derecha.

### 6.2 Ver y escuchar

- **Sin texto obligatorio:** todo botón tiene un ícono y dice su nombre al tocarlo.
- **La voz es lo primero:** cuando Emilia habla, la música baja sola. Música y efectos se ajustan por separado desde la zona de padres.
- **Botón de altavoz** en cada actividad para repetir la consigna.
- **Una sola cosa importante por pantalla.** Fondos tranquilos detrás de los elementos con los que se juega.
- **Nunca depender solo del color:** las formas también cambian (importante para niños con daltonismo).
- **Tipografía escolar:** letras como las que enseñan en el jardín, por ejemplo Andika, con la "a" y la "g" simples.

### 6.3 Navegar

- **Botón de la casa siempre visible**, en la misma esquina, para volver al barrio.
- **Máximo dos niveles:** barrio → lugar → actividad.
- **Nada se pierde:** si el niño sale de una actividad, al volver la encuentra donde la dejó.
- **Pantalla horizontal en tablet;** el teléfono acepta ambas orientaciones.
- **Funciona sin internet** siempre.

### 6.4 Accesibilidad e inclusión

- Modo de alto contraste y modo de **menos movimiento** (sin animaciones fuertes).
- **Subtítulos** opcionales en las frases de Emilia, para familias con niños con hipoacusia y para quienes acompañan.
- Idea a futuro: **Emilia en lengua de señas chilena** (LSCh), con video de un intérprete en las consignas. Muy valioso para escuelas especiales.
- Velocidad de la voz ajustable (más lenta para niños de 3 años o con dificultades del lenguaje).
- Personajes y avatares diversos en piel, cuerpo, familia y capacidades.

---

## 7. Estilo visual y sonoro

| Elemento | Propuesta |
|---|---|
| **Ilustración** | 2D plana, formas redondeadas, contornos suaves. Personajes con ojos grandes y expresivos. |
| **Paleta** | Cálida y alegre, pero no chillona. Cada lugar tiene su color: arte naranjo, escuelita celeste, granja verde, tiendita amarillo, plaza morado. |
| **Identidad latinoamericana** | Casas de colores como en Valparaíso, cordillera de fondo, araucarias, almacén de barrio, volantines, fauna nativa (pudú, cóndor, llama, carpincho). |
| **Animación** | Suave y con rebote. Los personajes respiran y parpadean aunque estén quietos. |
| **Música** | Instrumentos acústicos y cálidos: ukelele, marimba, charango, xilófono. Volumen bajo en el fondo. |
| **Efectos** | Sonidos suaves y orgánicos (pop, campanita, tambor pequeño). Nada estridente. |
| **Voz** | Actriz de voz para Emilia con español neutro y cálido; paquetes de acento regional a futuro. |

---

## 8. Bienestar del niño

- **Rincón de la calma** (en Mi casita): Tito respira lento y el niño infla y desinfla un globo con él. Disponible siempre, y sugerido si el niño se frustra o elige una carita triste o enojada.
- **Emociones en el juego:** reconocer caritas, cuentos cortos sobre sentirse triste o enojado.
- **Retos fuera de la pantalla** al final de cada sesión.
- **Modo noche:** después de la hora que defina la familia, solo cuentos tranquilos y canciones de cuna.
- **Juguemos juntos:** juegos para niño y adulto en el mismo dispositivo (memoria por turnos, *"tú dices, yo toco"*). Convierte la pantalla en un momento compartido.

---

## 9. Ideas a futuro

| Idea | Qué es | Cuidado |
|---|---|---|
| 📚 **Cuentos interactivos** | Cuentos narrados donde el niño toca para elegir qué pasa; refuerzan vocabulario y letras. | Duración corta (3–5 min). |
| 🎤 **Repite conmigo** | El niño repite palabras (español o idiomas) y Emilia lo celebra. | Reconocimiento solo en el dispositivo; la voz no se guarda. |
| 📷 **Búsqueda del tesoro** | *"Muéstrale a Tito algo rojo"* con la cámara. | Procesado en el dispositivo; las fotos no se guardan ni se envían. Con permiso del adulto. |
| 🎵 **Karaoke de canciones** | Canciones del barrio con la letra resaltada al ritmo, para la lectura inicial. | |
| 🧸 **Peluche de Tito** | Peluche físico; tocar su imagen en la app activa juegos especiales. | Fase de productos físicos. |
| 🎭 **Teatro de títeres** | El niño mueve personajes y graba una historia con su voz, solo para su familia. | Se guarda solo en el dispositivo. |

---

## 10. Qué ya existe y qué cambia

La app que ya está en el repositorio es el punto de partida:

| Hoy (prototipo) | Hacia dónde va |
|---|---|
| Inicio con 5 burbujas | **Mapa del barrio** recorrible |
| Pantallas de Letras, Números, Animales, Pintar | Se convierten en la Escuelita, la Granja y el Taller de arte, con personajes |
| Juego de preguntas con dificultad adaptativa | Se mantiene y suma la **ayuda en escalera** (sección 5.1) |
| La Tiendita y Memoria | Tiendita de Doña Rosa y Plaza de juegos |
| Zona de padres con puerta parental | Se mantiene; ahí se configuran tiempo, modo de juego y accesibilidad |
| Sin sesiones | **Rutina de sesión** con saludo, repaso, lo nuevo, juego libre y despedida |

### Próximos pasos de diseño (por escrito)

1. **Guion de voz de Emilia:** las frases de saludo, ánimo, pistas, celebraciones y despedida (unas 150 frases).
2. **Ficha de cada lugar del barrio:** personajes, actividades, sorpresas al tocar y habilidades que trabaja.
3. **Bocetos de pantallas clave:** mapa, una actividad, Mi casita y el árbol del saber.
4. **Prueba con niños:** mostrar los bocetos a 5–10 niños para ver qué entienden sin explicación.
