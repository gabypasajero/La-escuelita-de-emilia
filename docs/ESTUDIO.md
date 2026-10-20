# La Escuelita de Emilia — Estudio de producto

> Juego educativo multiplataforma (iOS, Android, Web/tablet) para niños de **3 a 6 años**:
> pintar, letras, números, animales y sus sonidos, y minijuegos interactivos.
> Fecha del estudio: octubre 2026.

---

## 1. Resumen ejecutivo

| Punto | Conclusión |
|---|---|
| **Oportunidad** | Mercado preescolar digital en crecimiento (~USD 3.8 mil M en 2025, CAGR ~11 %) dominado por apps en inglés. El español latinoamericano está **sub-atendido** con contenido nativo (no traducido). |
| **Propuesta de valor** | "Aprender jugando en español, sin anuncios, sin internet obligatorio y con un panel para padres que muestra avances reales". |
| **Diferenciador clave** | Contenido 100 % hispano (voz, acentos, animales y canciones de la región), **modo offline**, y un **panel docente/familia** que lo convierte en herramienta para jardines infantiles (B2B). |
| **Modelo de negocio** | **90 % del contenido gratis y sin anuncios para todos.** Premium ultra accesible: **USD 1,99/mes o USD 19,99/año**, que desbloquea estadísticas para padres y un 10 % de contenido extra. Complemento: licencias para jardines/colegios. |
| **Stack recomendado** | Monorepo TypeScript: **Expo (React Native + Web)** para una sola base de código en 3 plataformas, **Fastify** como API, **PostgreSQL (Supabase)** para datos, contenido versionado como datos. |
| **MVP (≈10–12 semanas)** | 4 módulos: Pintar, Letras (A–Z + Ñ), Números (1–10), Animales y sonidos + perfil de niño + puerta parental + progreso local. |

---

## 2. Usuario objetivo

Hay **dos usuarios** y hay que diseñar para ambos:

### 2.1 El niño (3–6 años) — quien juega
| Edad | Capacidades | Implicaciones de diseño |
|---|---|---|
| **3–4** | No lee. Motricidad gruesa: toca, arrastra mal. Atención 3–5 min. | Todo por **voz e íconos**. Objetivos táctiles ≥ 64 px. Solo *tap* y arrastre simple. Sesiones de 2–3 min. |
| **4–5** | Reconoce algunas letras, cuenta hasta 10, arrastra con precisión media. | Introducir trazado de letras, emparejar, ordenar 3 elementos. |
| **5–6** | Pre-lectura, sílabas, suma simple, sigue instrucciones de 2 pasos. | Sílabas, palabras cortas, sumas con objetos, secuencias, memoria. |

**Principios pedagógicos aplicados:**
- **Sin fracaso punitivo**: el error no resta, se reintenta con pista (andamiaje / *scaffolding*).
- **Refuerzo positivo inmediato** (sonido + animación) en < 300 ms.
- **Repetición espaciada**: lo que el niño falla vuelve a aparecer más tarde.
- **Dificultad adaptativa**: 3 niveles por actividad; subir tras 3 aciertos seguidos, bajar tras 2 errores.
- **Multisensorial**: ver + escuchar + tocar (método tipo Montessori para letras de lija → trazado).
- **Juego libre** (pintar, explorar animales) además de juego dirigido.

### 2.2 El adulto (padre/madre/educadora) — quien paga y decide
- Quiere: seguridad, **cero anuncios**, control de tiempo de pantalla, ver progreso.
- Teme: compras accidentales, contenido inapropiado, recolección de datos.
- Por eso: **puerta parental** (p. ej. "mantén presionado + resuelve 7 + 5") antes de ajustes, compras o enlaces externos.

---

## 3. Mercado

- Mercado global de apps preescolares: **~USD 3.82 mil M (2025) → ~USD 9.94 mil M (2031)**, CAGR ~11.5 % (Deep Market Insights; cifra de una sola fuente, validar).
- Mercado de apps educativas en general: **~USD 6.0–6.2 mil M en 2024** (Educational App Store, IMARC).
- El segmento "aprendizaje en casa" es el principal; tablets y teléfonos de los padres son el dispositivo dominante en 3–6 años.

**Lectura estratégica:** el mercado crece, pero los líderes compiten en inglés. Para LATAM/España la ventaja está en **contenido culturalmente propio** y en un **precio regional** (paridad de poder adquisitivo) más bajo que USD 13.99/mes.

---

## 4. Competencia

| Competidor | Modelo | Fortalezas | Debilidades / hueco que dejamos de aprovechar |
|---|---|---|---|
| **Khan Academy Kids** | Gratis (ONG) | Muy completo, sin anuncios, gran calidad. | Contenido originalmente en inglés; español limitado; sin enfoque B2B regional. |
| **ABCmouse** | Suscripción (~USD 13.99/mes) | Currículo completo 2–8 años, marca fuerte en EE. UU. | Caro para LATAM, solo inglés, interfaz recargada. |
| **Lingokids** | Freemium (2–8 años) | Empresa española, fuerte en LATAM, enfoque en inglés como 2.ª lengua. | Su foco es **aprender inglés**, no lectoescritura en español. |
| **Sago Mini / Toca Boca** | Pago / suscripción | Juego libre de excelente calidad visual. | Poco contenido académico explícito (letras/números). |
| **Smile and Learn** | Suscripción + colegios | Español, catálogo grande, venta a colegios. | Interfaz fragmentada en cientos de juegos; menos identidad de personaje. |
| **Cocobi (KIGLE, Corea)** | Decenas de apps gratis separadas + compras dentro de la app | Personajes muy queribles (dinosaurios), juegos de roles de la vida diaria (supermercado, hospital, cocina, limpieza), arte y animación excelentes. | Contenido académico débil; catálogo fragmentado en muchas apps; textos traducidos. |
| **"Juegos educativos infantiles" (genéricas)** | Gratis + compras / anuncios | Muchas actividades cortas (puzzles, colores, formas), se descargan mucho por búsqueda en la tienda. | Sin personaje ni historia, calidad irregular, poca progresión. |
| **Apps de dibujo genéricas** | Gratis con anuncios | Fáciles. | Anuncios, sin progreso ni aprendizaje. |

**Posicionamiento propuesto:**

```
                 Contenido académico explícito
                            ▲
          ABCmouse ●        │        ● Khan Kids
                            │
   Inglés  ◄────────────────┼────────────────►  Español nativo
                            │     ★ La Escuelita de Emilia
           Toca Boca ●      │   ● Smile and Learn
                            │
                 Juego libre / exploración
```

### 4.1 Referentes: qué tomar de cada uno

| | 🦖 Cocobi | 🧩 "Juegos educativos infantiles" | 🦊 Lingokids |
|---|---|---|---|
| **Qué es** | Juegos de roles con personajes: supermercado, hospital, panadería, camión de helados, cuidar mascotas, hábitos. | Colecciones de minijuegos cortos: puzzles, formas, colores, emparejar, contar. | Plataforma de suscripción: juegos, canciones, videos y reportes; enfocada en inglés, 2–8 años. |
| **Lo que hace muy bien** | **Juego de roles** con objetos tocables, causa-efecto y "mundo vivo". Cada acción da una reacción divertida. | **Sesiones de 1–2 min**, cero instrucciones, mucha variedad. | **Mapa de progreso**, objetivos de aprendizaje medibles, **reportes a padres**, hasta 4 perfiles, sin anuncios. |
| **Monetización** | Apps gratis + compras dentro de la app (sin evidencia de suscripción). | Gratis + compras o anuncios. | Lingokids Plus: USD 13,49/mes según su centro de ayuda (varía por país y promoción). |
| **Lo que tomamos** | Mundos de roles: **La Tiendita de Emilia** (contar), luego cocina (formas/colores), veterinaria (animales). | Formato de minijuego corto y sin texto dentro de cada módulo. | Ruta de aprendizaje visible, objetivos por actividad, reporte semanal a padres, multi-perfil. |
| **Lo que evitamos** | Fragmentar en decenas de apps: **una sola app**. | Anuncios y falta de progresión. | Precio alto para LATAM y foco en inglés. |

**Síntesis — nuestra fórmula:** *mundos de roles tipo Cocobi* + *minijuegos cortos* + *progreso y reportes tipo Lingokids*, todo **en español nativo**, en **una sola app**, con **90 % gratis sin anuncios** y un premium de **USD 2** (~85 % más barato que Lingokids o ABCmouse).

**Ventajas competitivas a construir (moat):**
1. **Personaje guía "Emilia"** con voz humana real en español neutro (y paquetes de acento: rioplatense, chileno, mexicano, español).
2. **Fauna y cultura regional**: cóndor, llama, jaguar, pudú, carpincho, ajolote… además de los clásicos.
3. **Modo jardín infantil**: una educadora gestiona 20–30 perfiles en una tablet compartida y ve reportes por niño.
4. **Offline-first**: funciona en zonas con mala conectividad (muy relevante en LATAM).

---

## 5. Módulos de juego (catálogo inicial)

| Módulo | Actividades | Habilidad | Edad |
|---|---|---|---|
| 🎨 **Pintar** | Lienzo libre, colorear por zonas (relleno), pegatinas, galería. | Motricidad fina, creatividad, colores | 3–6 |
| 🔤 **Letras** | Conocer la letra (sonido + palabra), **trazar** con guía, encontrar la letra, letra inicial de un dibujo, sílabas (5–6). | Conciencia fonológica, grafomotricidad | 3–6 |
| 🔢 **Números** | Contar objetos, trazar números, ¿cuál tiene más?, ordenar 1–10, sumas con frutas (5–6). | Sentido numérico | 3–6 |
| 🦁 **Animales** | Granja / selva / mar / regional: tocar y escuchar nombre + sonido, adivinar por sonido, ¿dónde vive?, mamá y cría. | Vocabulario, discriminación auditiva | 3–6 |
| 🧩 **Juegos** | Memoria (parejas), rompecabezas 4–9 piezas, formas y colores, patrones, intruso, laberinto simple. | Memoria, lógica, atención | 3–6 |
| 🛒 **Mundos de roles** (inspirado en Cocobi) | **La Tiendita** (poner N productos en la canasta y pagar con monedas), Cocina (receta por colores/formas), Veterinaria (cuidar animales), Huerto (plantar y contar). | Conteo aplicado, vocabulario, hábitos, juego simbólico | 3–6 |
| 🎵 **Música** (fase 2) | Instrumentos, xilófono, canciones con karaoke de letras. | Ritmo, memoria auditiva | 3–6 |

**Bucle de recompensa (sin manipular):** cada actividad completada da una **estrella**; las estrellas desbloquean pegatinas y ropa para Emilia. **No** hay rachas que castiguen, temporizadores de presión ni moneda comprable.

---

## 6. Modelo de negocio

### 6.1 Principios (no negociables)

1. **Cero anuncios para todos**, paguen o no. El niño nunca ve una interrupción.
2. **El 90 % del contenido es gratis.** Aprender letras, números, animales, pintar y jugar no depende de pagar.
3. **El premium es para el adulto**, no para el niño: lo que se paga son estadísticas y un 10 % de extras.
4. **Precio ultra accesible:** USD 1,99/mes o USD 19,99/año (precios estándar de App Store y Google Play; equivalen a los USD 2 y 20 propuestos).

### 6.2 Planes

| | 🆓 Gratis | ⭐ Premium | 🏫 Jardín / Colegio |
|---|---|---|---|
| **Precio** | USD 0 | **USD 1,99/mes · USD 19,99/año** (el anual equivale a 10 meses) | USD 0,50–1 por niño/mes o licencia anual por sala |
| **Contenido** | **90 %**: todos los módulos y mundos de roles base | **100 %**: +10 % de extras | 100 % |
| **Anuncios** | Ninguno | Ninguno | Ninguno |
| **Perfiles** | Hasta 4 | Hasta 4 | Ilimitados |
| **Progreso del niño** | Estrellas y pegatinas dentro del juego | Igual | Igual |
| **Estadísticas para padres** | Resumen básico: tiempo de juego del día y módulos jugados | **Panel completo**: avance por habilidad, letras y números dominados, dónde le cuesta, reporte semanal, recomendaciones de qué practicar | Panel docente por sala y por niño, reportes PDF |
| **Sin internet** | Sí | Sí | Sí |

### 6.3 Qué va en el 10 % premium

El 10 % premium debe ser **"más de lo mismo, más entretenido"**, nunca contenido clave para aprender. Así nadie queda atrás por no pagar.

- Mundos de temporada: Navidad, Halloween/Día de Muertos, Fiestas Patrias, verano.
- Mundos de roles extra (por ejemplo, Veterinaria o Heladería) cuando el catálogo base ya esté completo.
- Paquetes de voz con acento regional (rioplatense, chileno, mexicano, español).
- Ropa y accesorios extra para Emilia y un álbum de pegatinas ampliado.

**Regla de diseño:** el niño **no ve candados** ni pantallas de "compra esto". El contenido premium aparece solo si está activo, y la invitación a mejorar el plan se muestra únicamente en la zona de padres, detrás de la puerta parental. Esto evita frustración y el "mamá, cómpramelo", y es lo que exigen Apple Kids y Google Families.

### 6.4 Comparación de precio

| App | Precio mensual de referencia | Anuncios | Contenido gratis |
|---|---|---|---|
| Lingokids Plus | ~USD 13,49 | No | Parcial |
| ABCmouse | ~USD 13,99 | No | No |
| Cocobi | Apps gratis + compras | Varía | Parcial por app |
| Khan Academy Kids | Gratis (ONG) | No | Total |
| **La Escuelita de Emilia** | **USD 1,99** | **No** | **90 %** |

Mensaje de marketing: *"Todo lo importante es gratis y sin anuncios. Por menos de un helado al mes, ves cómo aprende tu hijo."*

### 6.5 Números: ¿es viable?

**Ingreso neto por familia que paga** (las tiendas cobran 15 % a desarrolladores pequeños, con ingresos bajo USD 1 M/año):

| Plan | Precio | Neto tras tienda | Neto mensual |
|---|---|---|---|
| Mensual | USD 1,99 | USD 1,69 | **USD 1,69** |
| Anual | USD 19,99 | USD 16,99 | **USD 1,42** |
| Mezcla 50/50 | | | **≈ USD 1,55** |

> Ojo: en varios países de LATAM el IVA va incluido en el precio de la tienda (por ejemplo, 19 % en Chile), lo que puede bajar el neto a ~USD 1,30. Para estimar, usamos USD 1,40.

**Escenarios** (familias activas al mes × conversión a premium × USD 1,40):

| Familias activas/mes | 1 % pagan | 2 % pagan | 4 % pagan |
|---|---|---|---|
| 10.000 | USD 140 | USD 280 | USD 560 |
| 50.000 | USD 700 | USD 1.400 | USD 2.800 |
| 200.000 | USD 2.800 | USD 5.600 | USD 11.200 |
| 1.000.000 | USD 14.000 | USD 28.000 | USD 56.000 |

**Lectura honesta:**
- Con 90 % gratis y sin anuncios, la conversión será **baja (1–3 %)**: el premium tiene que valer por las estadísticas.
- Para cubrir un equipo pequeño (~USD 6.000/mes: 2 personas en LATAM, servidores, audio) se necesitan unas **4.300 familias pagando**, es decir, **~200.000 familias activas con 2 % de conversión**.
- El costo de servidores es bajo (el juego funciona en el dispositivo), así que **cada familia gratis cuesta casi nada**. Esto permite crecer sin perder dinero.
- **Conclusión:** el premium de USD 2 es la puerta de entrada y la marca, pero **no basta solo**. Hay que complementarlo con las fuentes de la sección 6.6.

### 6.6 Ingresos complementarios (sin tocar al niño)

| Fuente | Cómo funciona | Potencial |
|---|---|---|
| 🏫 **Jardines y colegios (B2B)** | Licencia por sala con panel docente. Un jardín de 100 niños a USD 0,75 equivale a ~54 familias premium. | **Alto**: es la palanca principal |
| 🏛️ **Municipios y gobiernos** | Licencias masivas para jardines públicos, programas de alfabetización temprana. | Alto, ciclo de venta lento |
| 💛 **"Regala una Escuelita"** | Un padre o empresa paga premium para un jardín rural o una familia vulnerable. Responsabilidad social empresarial. | Medio, muy bueno para la marca |
| 🎓 **Fondos y concursos** | Fondos de innovación y emprendimiento (por ejemplo, CORFO en Chile o BID Lab) y fundaciones de primera infancia. | Medio: financia el arranque |
| 📚 **Productos físicos** (fase 4) | Cuadernos de trazado, láminas para colorear y peluche de Emilia que se conectan con la app. | Medio–alto si la marca crece |

### 6.7 Cómo hacer que el premium valga USD 2

- **Reporte semanal** por correo o notificación: *"Esta semana Tomi reconoció 5 letras nuevas y contó hasta 8"*. Es lo que más convierte.
- **Mapa de habilidades:** qué domina, qué está aprendiendo, qué le cuesta.
- **Recomendaciones para casa:** *"Le cuesta la B y la D: jueguen a buscar cosas que empiecen con B"*.
- **Prueba gratis de 14 días** del panel completo, activada desde la zona de padres.
- **Plan anual destacado** (2 meses gratis): mejora la retención y el flujo de caja.

Canales: tiendas (App Store / Google Play, sección Niños), web (PWA), venta directa a jardines (piloto gratuito de 1 mes), alianzas con municipios y ministerios.

**Métricas clave (KPI):**
- Familias activas al mes y retención D7/D30 del adulto.
- Activación: el niño completa 3 actividades el día 1.
- **Conversión a premium: meta 2–3 %**, con un 50 % o más eligiendo el plan anual.
- *Churn* mensual del premium: meta bajo 6 %.
- Jardines con licencia activa.
- Minutos por sesión: meta 10–15, no más.
- NPS de padres.

---

## 7. Regulación y seguridad (no negociable)

| Norma | Qué exige | Cómo cumplimos |
|---|---|---|
| **COPPA** (EE. UU.) | Consentimiento verificable de padres antes de recolectar datos de < 13. | El niño **no** tiene cuenta: solo un *alias* y avatar. La cuenta es del adulto. |
| **GDPR-K / RGPD** (UE/España) | Minimización de datos, base legal, derecho de borrado. | Sin datos personales del niño; exportar/borrar desde el panel. |
| **Leyes locales** (Ley 19.628 Chile, LGPDP México, Ley 25.326 Argentina, etc.) | Protección de datos personales. | Política de privacidad por país, servidores con cifrado. |
| **Apple Kids Category / Google Families Policy** | Sin publicidad conductual, sin SDK de terceros de tracking, puerta parental en enlaces y compras. | Analítica propia anónima y agregada; sin SDKs de anuncios. |

Otras reglas de diseño: sin chat, sin contenido generado por otros usuarios, sin enlaces externos sin puerta parental, límite de tiempo configurable con pantalla de "¡a descansar!".

---

## 8. Diseño (UX/UI) para 3–6 años

- **Navegación de un nivel**: inicio = 5 burbujas grandes (Pintar, Letras, Números, Animales, Juegos). Siempre un botón "casa" fijo.
- **Sin texto obligatorio**: todo botón tiene ícono + locución al tocar.
- **Tamaños**: objetivos táctiles ≥ 64 px (ideal 80–96 px), separación ≥ 16 px.
- **Paleta**: colores saturados pero suaves, alto contraste para formas importantes; nunca depender solo del color (daltonismo).
- **Tipografía**: escolar, "a" y "g" de una sola panza (estilo ligada/script escolar o *Andika*, *Lexend*).
- **Audio**: voz humana para letras y palabras (TTS solo como respaldo); música desactivable desde el panel de padres.
- **Orientación horizontal** en tablet, vertical aceptable en teléfono.
- **Accesibilidad**: modo de alto contraste, reducción de movimiento, subtítulos opcionales para adultos.

---

## 9. Riesgos y mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Costo de producción de arte y audio | Alto | Estilo visual simple (vector plano), librería de assets reutilizable, voces grabadas por lote. |
| Competir con apps gratuitas de gran calidad | Alto | Nicho español nativo + B2B jardines; no competir en volumen de contenido sino en relevancia. |
| Rechazo en tiendas por políticas infantiles | Medio | Checklist de Kids Category desde el día 1; sin SDKs de terceros. |
| Rendimiento del lienzo de dibujo en equipos baratos | Medio | Skia (GPU), limitar puntos por trazo, probar en Android gama baja. |
| Baja retención del adulto | Medio | Reportes semanales por correo, logros compartibles (dibujos). |
| **Ingreso por usuario muy bajo** (USD 2 con 90 % gratis) | Alto | Costo por usuario casi cero (todo funciona en el dispositivo), B2B con jardines y municipios, "Regala una Escuelita", plan anual. Revisar el precio con datos reales a los 6 meses. |
| Pagos dentro de la app cuestionados en apps infantiles | Medio | Compras solo en la zona de padres, tras la puerta parental; sin candados visibles para el niño. |

---

## 10. Roadmap

| Fase | Duración | Entregables |
|---|---|---|
| **0. Validación** | 2 sem | 15–20 entrevistas a padres y 3–5 educadoras; prototipo en Figma probado con niños. |
| **1. MVP** | 10–12 sem | Monorepo, app Expo (web + Android), Pintar, Letras A–Z+Ñ, Números 1–10, Animales (20), Memoria, perfiles, puerta parental, progreso offline. |
| **2. Beta** | 6 sem | Cuentas de adulto, sincronización en nube, panel de padres web, iOS, premium USD 1,99/19,99 (RevenueCat), reporte semanal. |
| **3. B2B** | 8 sem | Modo jardín, panel docente, reportes, licencias. |
| **4. Expansión** | continuo | Música, sílabas y lectura inicial, acentos regionales, inglés como 2.ª lengua, contenido estacional. |

---

## Fuentes

- [Deep Market Insights — Preschool App Market](https://deepmarketinsights.com/report/preschool-app-market-research-report)
- [Educational App Store — Education App Revenue and Usage Statistics (2025)](https://www.educationalappstore.com/blog/education-app-market)
- [IMARC — Global Education Apps Market](https://www.imarcgroup.com/global-education-apps-market)
- [Technavio — Education Apps Market](https://technavio.com/report/education-apps-market-size-industry-analysis)
- [Subger — Comparativa servicios infantiles (precios de referencia, julio 2026)](https://subger.com/en/au/compare/kids-family)
- [Lingokids — Centro de ayuda (precios Plus)](https://help.lingokids.com/hc/en-us/articles/115005120505)
- [Lingokids en App Store](https://apps.apple.com/us/app/lingokids-play-learn-english/id1002043426)
- [Cocobi Supermarket (KIGLE) en App Store](https://apps.apple.com/us/app/%EC%BD%94%EC%BD%94%EB%B9%84-%EC%8A%88%ED%8D%BC%EB%A7%88%EC%BC%93-%EB%A7%88%ED%8A%B8-%EC%87%BC%ED%95%91-%EC%97%AD%ED%95%A0-%EB%86%80%EC%9D%B4/id1594483837?l=vi)
- [AppGoblin — Cocobi Baby Pet Care (estimación de ingresos)](https://appgoblin.info/apps/6744205564)
- [Ejemplo de "juegos para niños 3–4 años" en App Store](https://apps.apple.com/es/app/juegos-para-ni%C3%B1os-de-3-4-a%C3%B1os/id1195601592)

> Las cifras de mercado provienen de informes comerciales con metodologías distintas; tomarlas como orden de magnitud. Los precios de competidores son de terceros y deben verificarse en cada tienda.
