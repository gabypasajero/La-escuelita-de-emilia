# La Escuelita de Emilia — Estudio de producto

> Juego educativo multiplataforma (iOS, Android, Web/tablet) para niños de **3 a 6 años**:
> pintar, letras, números, animales y sus sonidos, minijuegos interactivos e **idiomas** (inglés, portugués, francés, chino y más).
> Fecha del estudio: octubre 2026.

---

## 1. Resumen ejecutivo

| Punto | Conclusión |
|---|---|
| **Oportunidad** | Mercado preescolar digital en crecimiento (~USD 3.8 mil M en 2025, CAGR ~11 %) dominado por apps en inglés. El español latinoamericano está **sub-atendido** con contenido nativo (no traducido). |
| **Propuesta de valor** | "Aprender jugando en español, sin anuncios y sin internet obligatorio, con una **evaluación tipo educadora** que le dice a la familia qué aprendió su hijo y cómo seguir en casa". |
| **Diferenciador clave** | Contenido 100 % hispano (voz, acentos, animales y canciones de la región), **modo offline**, y un **panel docente/familia** que lo convierte en herramienta para jardines infantiles (B2B). |
| **Modelo de negocio** | **90 % gratis y sin anuncios para todos.** Plan **Plus: $4.990 CLP al mes o $24.990 CLP al año**, con evaluación tipo educadora, informes, actividades para casa, 10 % de contenido extra y 1 idioma incluido. Ver [EVALUACION.md](EVALUACION.md). |
| **Idiomas** | Los amigos de Emilia (Max, Bia, Léa, Xiao Lin) enseñan inglés, portugués, francés y chino con los mismos juegos. Plus incluye 1 idioma; todos los idiomas por + $1.990 CLP al mes. Ver [IDIOMAS.md](IDIOMAS.md). |
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

**Síntesis — nuestra fórmula:** *mundos de roles tipo Cocobi* + *minijuegos cortos* + *progreso y reportes tipo Lingokids*, todo **en español nativo**, en **una sola app**, con **90 % gratis sin anuncios**, **evaluación tipo educadora** y un plan anual de **$24.990 CLP**, al alcance de toda familia.

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
| 🌍 **Idiomas** (suscripción) | Amigos de otros países: tiendita, animales, memoria, canciones y "haz lo que dice" en inglés, portugués, francés, chino y más. Muestra gratis del primer nivel de cada idioma. | Segundo idioma por inmersión | 3–6 |
| 🎵 **Música** (fase 2) | Instrumentos, xilófono, canciones con karaoke de letras. | Ritmo, memoria auditiva | 3–6 |

**Bucle de recompensa (sin manipular):** cada actividad completada da una **estrella**; las estrellas desbloquean pegatinas y ropa para Emilia. **No** hay rachas que castiguen, temporizadores de presión ni moneda comprable.

---

## 6. Modelo de negocio

> **Misión antes que lucro:** más que ganar dinero, entregar una herramienta efectiva. Los niños pasan mucho tiempo en el celular; la idea es sacar lo mejor de ese tiempo para que crezcan con más capacidades. El precio está pensado para que **toda familia pueda pagar el plan anual**.

### 6.1 Principios (no negociables)

1. **Cero anuncios para todos**, paguen o no. El niño nunca ve una interrupción.
2. **El 90 % del contenido es gratis.** Aprender no depende de pagar.
3. **Lo que se paga es el acompañamiento al adulto:** evaluación tipo educadora, informes, recomendaciones y actividades para casa ([EVALUACION.md](EVALUACION.md)).
4. **Sin candados visibles para el niño.** La venta ocurre solo en la zona de padres, detrás de la puerta parental.
5. **El plan anual es la opción natural:** cuesta lo mismo que 5 meses.

### 6.2 Planes (Chile, mercado de lanzamiento)

| | 🆓 Gratis | ⭐ **Plus** | 🌍 Todos los idiomas (complemento) | 🏫 Jardín / Colegio |
|---|---|---|---|---|
| **Mensual** | $0 | **$4.990 CLP** | + $1.990 CLP | Por niño/mes |
| **Anual** | $0 | **$24.990 CLP** (≈ $2.083 al mes, 58 % de ahorro) | + $9.990 CLP | Licencia anual por sala |
| **Contenido** | 90 % | 100 % (+10 % extra) | Todos los idiomas | 100 % |
| **Anuncios** | Ninguno | Ninguno | Ninguno | Ninguno |
| **Evaluación tipo educadora** | Solo el primer informe, de muestra | ✅ Completa | — | ✅ Por sala y por niño |
| **Informes y recomendaciones** | Título de cada logro | ✅ Semanal y trimestral | — | ✅ |
| **Actividades para casa** (dibujo, lenguaje, matemática, idiomas) | — | ✅ | — | ✅ Actividades para la sala |
| **Idiomas** | Muestra del primer nivel de cada idioma | ✅ **1 idioma incluido** a elección | ✅ Todos | Según licencia |
| **Perfiles** | Hasta 4 | Hasta 4 | | Ilimitados |

- Los precios se fijan como $4.990 y $24.990 porque las tiendas usan precios terminados en 990; equivalen a los **$5.000 y $25.000** propuestos.
- **Por qué Plus incluye 1 idioma:** *"inglés incluido"* hace que el plan anual sea muy difícil de rechazar. Quien quiera más idiomas suma el complemento.
- **Otros países:** precio equivalente ajustado al poder adquisitivo de cada país (las tiendas permiten fijar precio por país).

### 6.3 Qué va en el 10 % premium

El 10 % extra debe ser **"más de lo mismo, más entretenido"**, nunca contenido clave para aprender:
- Mundos de temporada: Navidad, Fiestas Patrias, Día de Muertos, verano.
- Mundos de roles extra (por ejemplo, Veterinaria o Heladería).
- Paquetes de voz con acento regional.
- Ropa y accesorios extra para Emilia y un álbum de pegatinas ampliado.

### 6.4 Comparación de precio

Valores mensuales de referencia, convertidos a ~950 CLP por dólar (verificar el tipo de cambio).

| App | Precio mensual aprox. | Qué incluye |
|---|---|---|
| Studycat | ~$14.200 CLP | **Un** idioma |
| ABCmouse | ~$13.300 CLP | Currículo en inglés |
| Lingokids Plus | ~$12.800 CLP | Inglés |
| Khan Academy Kids | Gratis (ONG) | Contenido en inglés, español limitado |
| **La Escuelita de Emilia Plus** | **$4.990 CLP, o $2.083 al mes en el plan anual** | Todo el contenido en español + evaluación tipo educadora + actividades para casa + 1 idioma |

Mensaje: *"Por menos de lo que cuesta un helado al mes, sabes qué aprendió tu hijo y cómo seguir ayudándolo en casa."*

### 6.5 Números: ¿es viable?

**Ingreso neto por familia** (Chile: IVA 19 % incluido en el precio y 15 % de comisión de tienda para desarrolladores pequeños):

| Plan | Precio | Sin IVA | Neto tras tienda | Neto al mes |
|---|---|---|---|---|
| Mensual | $4.990 | $4.193 | $3.564 | **$3.564** |
| Anual | $24.990 | $21.000 | $17.850 | **$1.488** |
| Mezcla esperada (80 % anual, 20 % mensual) | | | | **≈ $1.900 (≈ USD 2)** |

**Punto de equilibrio:** un equipo pequeño cuesta unos **$5,7 millones CLP al mes** (≈ USD 6.000: 2 personas, servidores, audio y asesora pedagógica). Se cubre con **unas 3.000 familias pagando**.

**Tamaño del mercado chileno:** hay alrededor de **700 mil niños de 3 a 6 años**, estimado a partir de los nacimientos de los últimos años (validar con datos del INE). 3.000 familias son menos del **0,5 %** de ellos.

**Escenarios en Chile** (ingreso neto al mes; familias activas × porcentaje que paga × $1.900):

| Familias activas/mes | 3 % pagan | 6 % pagan | 10 % pagan |
|---|---|---|---|
| 30.000 | $1,7 M | $3,4 M | **$5,7 M** ✅ |
| 60.000 | $3,4 M | **$6,8 M** ✅ | $11,4 M |
| 120.000 | **$6,8 M** ✅ | $13,7 M | $22,8 M |

✅ = cubre el punto de equilibrio. El complemento de idiomas y los jardines suman por encima de esto.

**Lectura honesta:**
- Las apps gratuitas suelen convertir entre 2 % y 5 %. Apostamos a **5–10 %** porque el informe tipo educadora es un valor que la familia ve y entiende, y porque el precio anual es muy bajo. Hay que medirlo en la beta.
- El costo por familia gratis es casi cero (el juego funciona en el teléfono), así que crecer no genera pérdidas.
- Con el precio anual tan bajo, la **renovación** es la métrica clave: el informe trimestral debe recordarle a la familia todo lo que su hijo avanzó en el año.

### 6.6 Ingresos complementarios (sin tocar al niño)

| Fuente | Cómo funciona | Potencial |
|---|---|---|
| 🏫 **Jardines y colegios** | Licencia por sala con evaluación alineada a las Bases Curriculares e informes para apoderados. | **Alto** |
| 🏛️ **Municipios, JUNJI, Fundación Integra** | Licencias masivas para jardines públicos y programas de primera infancia. | Alto, ciclo de venta lento |
| 💛 **"Regala una Escuelita"** | Una familia o empresa paga el plan anual de un niño o de un jardín rural. | Medio, muy bueno para la marca |
| 🎓 **Fondos públicos y privados** | Por ejemplo, CORFO y fundaciones de primera infancia. | Medio: financia el arranque |
| 📚 **Productos físicos** (fase 4) | Cuadernos de trazado, láminas e instructivos impresos, peluche de Emilia. | Medio–alto si la marca crece |

Canales: tiendas (App Store / Google Play, sección Niños), web (PWA), venta directa a jardines (piloto gratuito de 1 mes), alianzas con municipios.

**Métricas clave (KPI):**
- Familias activas al mes y retención D7/D30 del adulto.
- Activación: el niño completa 3 actividades el día 1.
- **Primer logro consolidado** (y su informe gratis) en los primeros 14 días.
- **Conversión a Plus: meta 5–10 %**, con 80 % eligiendo el plan anual.
- **Renovación anual: meta 60 % o más.**
- Familias que hacen al menos una actividad en casa por semana (pregunta simple en la app).
- Minutos por sesión: meta 10–15, no más.
- Jardines con licencia activa y NPS de padres.

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
| **Ingreso por usuario muy bajo** (≈ $1.900 CLP neto al mes) | Alto | Costo por usuario casi cero, gancho del primer informe gratis, jardines y municipios, "Regala una Escuelita". Revisar el precio con datos reales a los 6 meses. |
| Evaluación poco confiable o mal entendida | Alto | Criterios definidos con una educadora de párvulos, alineados a las Bases Curriculares; aviso de que no es un diagnóstico; lenguaje siempre positivo. |
| Pagos dentro de la app cuestionados en apps infantiles | Medio | Compras solo en la zona de padres, tras la puerta parental; sin candados visibles para el niño. |

---

## 10. Roadmap

| Fase | Duración | Entregables |
|---|---|---|
| **0. Validación** | 2 sem | 15–20 entrevistas a padres y 3–5 educadoras; prototipo en Figma probado con niños. |
| **1. MVP** | 10–12 sem | Monorepo, app Expo (web + Android), Pintar, Letras A–Z+Ñ, Números 1–10, Animales (20), Memoria, perfiles, puerta parental, progreso offline. |
| **2. Beta** | 6 sem | Cuentas de adulto, sincronización en nube, panel de padres web, iOS, motor de evaluación tipo educadora, plan Plus $4.990 / $24.990 CLP (RevenueCat), informe semanal y actividades para casa. |
| **3. B2B** | 8 sem | Modo jardín, panel docente, reportes, licencias. |
| **4. Idiomas, ola 1** | 8 sem | Inglés y portugués (niveles 1–3), idioma incluido en Plus y complemento de todos los idiomas. |
| **5. Expansión** | continuo | Francés y chino (ola 2), música, sílabas y lectura inicial, acentos regionales, lenguas originarias, español como segundo idioma, contenido estacional. |

---

## Fuentes

- [Deep Market Insights — Preschool App Market](https://deepmarketinsights.com/report/preschool-app-market-research-report)
- [Educational App Store — Education App Revenue and Usage Statistics (2025)](https://www.educationalappstore.com/blog/education-app-market)
- [IMARC — Global Education Apps Market](https://www.imarcgroup.com/global-education-apps-market)
- [Technavio — Education Apps Market](https://technavio.com/report/education-apps-market-size-industry-analysis)
- [Subger — Comparativa servicios infantiles (precios de referencia, julio 2026)](https://subger.com/en/au/compare/kids-family)
- [MINEDUC — Bases Curriculares de la Educación Parvularia (2018)](https://parvularia.mineduc.cl/)
- [Lingokids — Centro de ayuda (precios Plus)](https://help.lingokids.com/hc/en-us/articles/115005120505)
- [Lingokids en App Store](https://apps.apple.com/us/app/lingokids-play-learn-english/id1002043426)
- [Cocobi Supermarket (KIGLE) en App Store](https://apps.apple.com/us/app/%EC%BD%94%EC%BD%94%EB%B9%84-%EC%8A%88%ED%8D%BC%EB%A7%88%EC%BC%93-%EB%A7%88%ED%8A%B8-%EC%87%BC%ED%95%91-%EC%97%AD%ED%95%A0-%EB%86%80%EC%9D%B4/id1594483837?l=vi)
- [AppGoblin — Cocobi Baby Pet Care (estimación de ingresos)](https://appgoblin.info/apps/6744205564)
- [Ejemplo de "juegos para niños 3–4 años" en App Store](https://apps.apple.com/es/app/juegos-para-ni%C3%B1os-de-3-4-a%C3%B1os/id1195601592)

> Las cifras de mercado provienen de informes comerciales con metodologías distintas; tomarlas como orden de magnitud. Los precios de competidores son de terceros y deben verificarse en cada tienda.
