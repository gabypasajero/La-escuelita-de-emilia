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

- `adultos.plan` (`gratis` | `familia` | `institucional`) decide qué se desbloquea. "Familia" es el premium de USD 1,99/mes o USD 19,99/año.
- Cada actividad o mundo del contenido lleva `premium: true | false`. La meta es que solo el ~10 % sea premium; un test en `packages/core` puede verificarlo.
- **El juego del niño no consulta el plan para mostrar candados.** Simplemente no lista lo premium si no está activo.
- Las estadísticas detalladas (`/v1/perfiles/:id/resumen` y el reporte semanal) solo responden con datos completos para planes pagados. El resumen básico es gratis.
- Pagos con RevenueCat (App Store + Google Play + web con Stripe) para tener una sola fuente de verdad de suscripciones.

## Próximos pasos técnicos

1. `pnpm install` y `pnpm --filter @escuelita/mobile web` para ver la app en el navegador.
2. Lienzo de pintura con `@shopify/react-native-skia`.
3. Grabar audios reales (letras, animales) y reemplazar el TTS de respaldo.
4. Conectar Supabase Auth y la cola de sincronización.
5. CI con GitHub Actions: typecheck + tests.
