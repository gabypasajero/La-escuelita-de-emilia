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
| **Modelo de negocio** | Freemium (1 módulo por categoría gratis) + suscripción familiar + licencias para jardines/colegios. |
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
| 🎵 **Música** (fase 2) | Instrumentos, xilófono, canciones con karaoke de letras. | Ritmo, memoria auditiva | 3–6 |

**Bucle de recompensa (sin manipular):** cada actividad completada da una **estrella**; las estrellas desbloquean pegatinas y ropa para Emilia. **No** hay rachas que castiguen, temporizadores de presión ni moneda comprable.

---

## 6. Modelo de negocio

| Plan | Precio sugerido (validar con encuestas) | Incluye |
|---|---|---|
| **Gratis** | USD 0 | 1–2 actividades por módulo, 1 perfil, sin anuncios. |
| **Familia** | USD 3.99–5.99/mes · USD 29.99–39.99/año (precio regional) | Todo el contenido, hasta 4 perfiles, panel de padres, descargas offline. |
| **Jardín / Colegio** | USD 1–2 por niño/mes o licencia anual por sala | Perfiles ilimitados, panel docente, reportes PDF, soporte. |

Canales: tiendas (App Store / Google Play — sección Niños), web (PWA), venta directa a jardines (piloto gratuito de 1 mes), alianzas con municipios / ministerios.

**Métricas clave (KPI):** activación (niño completa 3 actividades el día 1), retención D7/D30 del **adulto**, conversión gratis→pago (meta 3–5 %), minutos por sesión (meta 10–15, no más), *churn* mensual, NPS de padres.

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

---

## 10. Roadmap

| Fase | Duración | Entregables |
|---|---|---|
| **0. Validación** | 2 sem | 15–20 entrevistas a padres y 3–5 educadoras; prototipo en Figma probado con niños. |
| **1. MVP** | 10–12 sem | Monorepo, app Expo (web + Android), Pintar, Letras A–Z+Ñ, Números 1–10, Animales (20), Memoria, perfiles, puerta parental, progreso offline. |
| **2. Beta** | 6 sem | Cuentas de adulto, sincronización en nube, panel de padres web, iOS, suscripción (RevenueCat / Stripe). |
| **3. B2B** | 8 sem | Modo jardín, panel docente, reportes, licencias. |
| **4. Expansión** | continuo | Música, sílabas y lectura inicial, acentos regionales, inglés como 2.ª lengua, contenido estacional. |

---

## Fuentes

- [Deep Market Insights — Preschool App Market](https://deepmarketinsights.com/report/preschool-app-market-research-report)
- [Educational App Store — Education App Revenue and Usage Statistics (2025)](https://www.educationalappstore.com/blog/education-app-market)
- [IMARC — Global Education Apps Market](https://www.imarcgroup.com/global-education-apps-market)
- [Technavio — Education Apps Market](https://technavio.com/report/education-apps-market-size-industry-analysis)
- [Subger — Comparativa servicios infantiles (precios de referencia, julio 2026)](https://subger.com/en/au/compare/kids-family)

> Las cifras de mercado provienen de informes comerciales con metodologías distintas; tomarlas como orden de magnitud. Los precios de competidores son de terceros y deben verificarse en cada tienda.
