// Después de exportar la web: escribe en sw.js la lista de TODOS los archivos del juego,
// para que al instalar la app se descargue completa y funcione sin internet.
// Uso: node scripts/precache.mjs dist
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const raiz = path.resolve(process.argv[2] ?? "dist");
const fuera = new Set(["sw.js", "metadata.json"]);
const archivos = [];
(function recorrer(dir) {
  for (const n of fs.readdirSync(dir)) {
    const f = path.join(dir, n);
    if (fs.statSync(f).isDirectory()) recorrer(f);
    else if (!fuera.has(path.relative(raiz, f))) archivos.push("/" + path.relative(raiz, f).split(path.sep).map(encodeURIComponent).join("/"));
  }
})(raiz);

const huella = createHash("sha256");
for (const a of archivos.sort()) huella.update(a + fs.statSync(path.join(raiz, decodeURIComponent(a))).size);
const version = "escuelita-" + huella.digest("hex").slice(0, 10);

const sw = path.join(raiz, "sw.js");
const texto = fs.readFileSync(sw, "utf8")
  .replace(/const VERSION = "[^"]*";/, `const VERSION = "${version}";`)
  .replace("const ARCHIVOS = [];", `const ARCHIVOS = ${JSON.stringify(archivos)};`);
fs.writeFileSync(sw, texto);
const peso = archivos.reduce((t, a) => t + fs.statSync(path.join(raiz, decodeURIComponent(a))).size, 0);
console.log(`sw.js: ${archivos.length} archivos (${(peso / 1e6).toFixed(1)} MB) para jugar sin internet, versión ${version}`);
