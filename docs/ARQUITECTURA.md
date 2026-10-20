# Arquitectura técnica

## Visión general

```
┌──────────────────────── apps/mobile (Expo) ────────────────────────┐
│  iOS · Android · Web (react-native-web)  — una sola base de código │
│  expo-router  ·  Skia (lienzo de pintura)  ·  expo-av / expo-speech │
│  Almacenamiento local (offline-first) → cola de sincronización      │
└───────────────┬──────────────────────────────────────▲─────────────┘
                │  usa                                  │ HTTPS (JWT del adulto)
        ┌───────▼────────┐                     ┌────────┴────────┐
        │ packages/core  │◄────── usa ─────────│   apps/api      │
        │ tipos, contenido│                    │ Fastify + Zod    │
        │ lógica de juego │                    │ perfiles/progreso│
        └────────────────┘                     └────────┬────────┘
                                                        │
                                          ┌─────────────▼────────────┐
                                          │ PostgreSQL (Supabase)    │
                                          │ Auth adulto · Storage    │
                                          └──────────────────────────┘
```

**Por qué este stack**
- **Expo + React Native Web**: 1 código → 3 plataformas. Publicación en tiendas con EAS. Actualizaciones OTA del contenido.
- **packages/core en TypeScript puro**: la lógica pedagógica (generar rondas, dificultad adaptativa, estrellas) se prueba sin UI y la comparten app y API.
- **Contenido como datos** (no como código): letras, números y animales son registros tipados → luego se pueden mover a un CMS sin tocar las pantallas.
- **Fastify**: ligero, rápido, validación con Zod. Se puede desplegar en cualquier lado (Vercel, Fly, Render) o reemplazar por funciones de Supabase.
- **Supabase**: Postgres + Auth del adulto + Storage para audios/dibujos + Row Level Security.

## Estructura del monorepo

```
.
├── apps/
│   ├── mobile/           # App Expo (iOS, Android, Web)
│   │   └── app/          # Rutas (expo-router): inicio, pintar, letras, numeros, animales, juegos, padres
│   └── api/              # API REST Fastify
├── packages/
│   └── core/             # Tipos, contenido y lógica de juego (con tests)
├── supabase/migrations/  # Esquema SQL
└── docs/                 # Estudio y arquitectura
```

## Modelo de datos

| Tabla | Descripción |
|---|---|
| `adultos` | Cuenta del padre/madre/educadora (enlazada a `auth.users`). Único con datos personales (email). |
| `organizaciones` | Jardín o colegio (plan B2B). |
| `perfiles` | Niño: **solo alias, avatar y rango de edad**. Nunca nombre real, foto ni fecha de nacimiento. |
| `intentos` | Cada respuesta en una actividad: módulo, actividad, ítem, acierto, tiempo. Base de la analítica. |
| `progreso` | Resumen por perfil/actividad: nivel actual, estrellas, dominio (0–1). |
| `dibujos` | Dibujos guardados (ruta en Storage). |

## Offline-first

1. La app guarda intentos y progreso en el dispositivo (AsyncStorage → SQLite más adelante).
2. Si hay un adulto con sesión, una cola envía los intentos a `POST /v1/intentos` en lotes.
3. El servidor es la fuente de verdad para el panel de padres; el dispositivo, para el juego.

## Seguridad infantil (implementada en la arquitectura)

- Sin SDKs de anuncios ni de tracking de terceros.
- Toda la zona de adultos (`/padres`) detrás de una **puerta parental** (`crearPuertaParental` en `core`).
- Row Level Security: un adulto solo ve sus perfiles.

## Planes y acceso premium

- `adultos.plan` (`gratis` | `familia` | `institucional`) decide qué se desbloquea. "Familia" es el plan **Plus** de $4.990 CLP al mes o $24.990 CLP al año (incluye 1 idioma elegido).
- Cada actividad o mundo del contenido lleva `premium: true | false`. La meta es que solo el ~10 % sea premium; un test en `packages/core` puede verificarlo.
- **El juego del niño no consulta el plan para mostrar candados.** Simplemente no lista lo premium si no está activo.
- La evaluación tipo educadora, los informes y las actividades para casa solo se entregan completos a planes pagados. El primer informe es gratis como muestra.
- Pagos con RevenueCat (App Store + Google Play + web con Stripe) para tener una sola fuente de verdad de suscripciones.

## Motor de evaluación tipo educadora

Detalle de producto en [EVALUACION.md](EVALUACION.md).

| Pieza | Dónde | Qué hace |
|---|---|---|
| **Catálogo de habilidades** | `packages/core` (datos) | Cada habilidad tiene id, núcleo de las Bases Curriculares, nivel de referencia y su "próximo desafío". |
| **Etiquetas en el contenido** | `packages/core` (datos) | Cada actividad e ítem apunta a una o más habilidades (por ejemplo, la letra M en Letras y en la Tiendita). |
| **Intentos** | Tabla `intentos` (+ campos `uso_pista` y `habilidades`) | La evidencia: acierto, tiempo, pista, juego, fecha. |
| **Motor de estados** | `packages/core` (función pura, con tests) | Calcula *explorando → en práctica → logrado → consolidado* con los criterios de EVALUACION.md §2. Corre en el teléfono, sin internet. |
| **Repasos espaciados** | `packages/core` | Agenda volver a mostrar lo logrado 7 días después para confirmar que está consolidado. |
| **Estado por habilidad** | Tabla nueva `habilidades_perfil` | Estado actual, fecha de logro y de consolidación. Reemplaza al resumen simple de `progreso`. |
| **Catálogo de recomendaciones** | Contenido escrito por la asesora pedagógica | Une cada habilidad con actividades para casa: instructivos de dibujo, lenguaje, matemática, audios de idiomas. |
| **Informes** | `apps/api` + tarea programada | Informe semanal (notificación o correo) y PDF trimestral, solo para planes pagados. |

## Idiomas

- Contenido con **id común por concepto** (por ejemplo, `manzana`) y una entrada por idioma: `es`, `en`, `pt`, `fr`, `zh`… con texto, audio y la misma imagen.
- Los juegos de `packages/core` reciben `idioma` como parámetro; no hay un juego distinto por idioma.
- El audio de cada idioma es un paquete descargable aparte (offline y app liviana).
- Suscripciones por producto en RevenueCat: `plus` (con el idioma elegido guardado en la cuenta) e `idiomas:todos`.
- Interfaz de adultos traducida por separado (es, pt, en) para vender también "español como segundo idioma".

Detalle de producto en [IDIOMAS.md](IDIOMAS.md).

## Próximos pasos técnicos

1. `pnpm install` y `pnpm --filter @escuelita/mobile web` para ver la app en el navegador.
2. Lienzo de pintura con `@shopify/react-native-skia`.
3. Grabar audios reales (letras, animales) y reemplazar el TTS de respaldo.
4. Conectar Supabase Auth y la cola de sincronización.
5. CI con GitHub Actions: typecheck + tests.
