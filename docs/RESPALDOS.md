# Respaldos y cómo volver atrás

Todo el proyecto está guardado en git: cada cambio es un *commit* en la rama `ccr-f4f1b1f4-3kewf4` de GitHub, y se puede volver a cualquiera de ellos.

## Puntos de respaldo

| Fecha | Commit | Qué tiene | Cuándo volver aquí |
|---|---|---|---|
| 2026-11-03 | `b03e5b3` | Todo lo anterior + **prueba del barrio en 3D** | Versión más reciente |
| 2026-11-03 | `6fa65e2` | **Estable antes del 3D:** voz al ganar monedas, lápiz óptico, casa/granja/almacén para recorrer, escribir con el dedo | Si la prueba 3D trae problemas |
| 2026-11-03 | `7d51800` | Lápiz óptico (sin la voz al ganar monedas) | Si la voz de las monedas molesta |
| 2026-11-03 | `3d4a709` | Casa, granja y almacén para recorrer (sin lápiz) | Si el lápiz trae problemas |
| 2026-11-03 | `db9e39f` | Escribir con el dedo (antes de las escenas para recorrer) | Si las escenas para recorrer fallan |
| 2026-10-29 | `9399d73` | Veterinaria, huerto para caminar, 5 juegos nuevos | Versión probada con los niños antes de las escenas nuevas |
| 2026-10-28 | `5fbe7b1` | Jugar juntos y arenero | — |

> El historial completo se ve con `git log --oneline` o en GitHub, en la lista de commits de la rama.

## Cómo volver atrás

### Opción 1 — Desde Vercel (lo más rápido, sin tocar el código)
1. Entra al proyecto `la-escuelita-de-emilia-8hyg` en Vercel → **Deployments**.
2. Busca la versión que funcionaba (cada una muestra el mensaje del commit).
3. Menú **⋯** → **Promote to Production** (o **Instant Rollback**).

La app publicada vuelve a esa versión en segundos; el código no cambia.

### Opción 2 — Pedírselo a Claude
Basta con decir, por ejemplo: *"vuelve a la versión `6fa65e2`"* o *"deshaz el último cambio"*. Se hace con un commit nuevo que revierte, sin borrar historia.

### Opción 3 — Con git (para quien programe)
```bash
# Deshacer solo el último cambio, dejando constancia en el historial:
git revert HEAD

# Ver una versión antigua sin perder nada:
git switch --detach 6fa65e2

# Crear una rama nueva desde un respaldo:
git switch -c rescate 6fa65e2
```

## Copia completa fuera de GitHub
El archivo `La-escuelita-de-emilia-respaldo-AAAA-MM-DD.bundle` es una copia completa del proyecto con todo su historial. Para recuperarlo:
```bash
git clone La-escuelita-de-emilia-respaldo-2026-11-03.bundle La-escuelita-de-emilia
```
Conviene guardar una copia nueva después de cada avance importante (por ejemplo, en Google Drive).
