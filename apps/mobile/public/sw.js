/*
 * Modo sin internet de La Escuelita de Emilia.
 * - La página se pide primero a internet (para recibir versiones nuevas) y,
 *   si no hay conexión, se usa la guardada.
 * - Los archivos del juego (código, imágenes, íconos) se guardan la primera
 *   vez y después se sirven desde la tablet, rápido y sin internet.
 */
const VERSION = "escuelita-v1";
const BASICOS = ["/", "/index.html", "/manifest.webmanifest", "/iconos/icono-192.png", "/iconos/icono-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(BASICOS)).then(() => self.skipWaiting()));
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
