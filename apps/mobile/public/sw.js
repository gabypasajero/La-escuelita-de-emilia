/*
 * Modo sin internet de La Escuelita de Emilia.
 * - La página se pide primero a internet (para recibir versiones nuevas) y,
 *   si no hay conexión, se usa la guardada.
 * - Al instalarse descarga todos los archivos del juego (código, 3D,
 *   imágenes, íconos) y después los sirve desde la tablet, sin internet.
 */
const VERSION = "escuelita-v1";
const BASICOS = ["/", "/index.html", "/manifest.webmanifest", "/iconos/icono-192.png", "/iconos/icono-512.png"];
// Lista completa del juego: la escribe scripts/precache.mjs al compilar (VERSION cambia con cada versión nueva).
const ARCHIVOS = [];

// Al instalar se descarga TODO el juego, para que funcione completo sin internet.
// Cada archivo se guarda por separado: si uno falla, el resto igual queda guardado.
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(VERSION)
      .then((c) => Promise.all([...new Set([...BASICOS, ...ARCHIVOS])].map((a) => c.add(a).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // Páginas: primero internet, si no hay, la copia guardada (la app es de una sola página).
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copia = r.clone();
          caches.open(VERSION).then((c) => c.put("/index.html", copia));
          return r;
        })
        .catch(() => caches.match("/index.html")),
    );
    return;
  }

  // Archivos del juego: primero la copia guardada; si no está, se descarga y se guarda.
  e.respondWith(
    caches.match(req).then(
      (guardado) =>
        guardado ||
        fetch(req).then((r) => {
          if (r.ok) {
            const copia = r.clone();
            caches.open(VERSION).then((c) => c.put(req, copia));
          }
          return r;
        }),
    ),
  );
});
