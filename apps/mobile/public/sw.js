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

  // Páginas: primero internet, pero si tarda más de 3 segundos (wifi lento) o no hay
  // conexión, se abre la copia guardada para que la app nunca quede en blanco.
  if (req.mode === "navigate") {
    const red = fetch(req).then((r) => {
      if (r.ok) {
        const copia = r.clone();
        caches.open(VERSION).then((c) => c.put("/index.html", copia));
      }
      return r;
    });
    e.respondWith(
      Promise.race([red, new Promise((listo) => setTimeout(listo, 3000))])
        .then((r) => r || caches.match("/index.html").then((guardada) => guardada || red))
        .catch(() => caches.match("/index.html").then((guardada) => guardada || Response.error())),
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
