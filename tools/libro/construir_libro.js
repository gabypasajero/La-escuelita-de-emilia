// Genera el "Libro de guiones" imprimible (Word) a partir de los documentos Markdown del repositorio.
// Uso: node tools/libro/construir_libro.js <salida.docx> [indice.json]
// El índice con números de página se calcula en una segunda pasada (ver construir.sh).

const fs = require("fs");
const path = require("path");
const {
  AlignmentType, BorderStyle, TabStopType, Document, Footer, Header, HeadingLevel, LevelFormat, Packer, PageBreak,
  PageNumber, Paragraph,
  ShadingType, Table, TableCell, TableRow, TextRun, VerticalAlign, WidthType,
} = require(process.env.DOCX_MODULE || "docx");

const RAIZ = path.resolve(__dirname, "../..");
const DOCS = path.join(RAIZ, "docs");
const [, , SALIDA = "libro.docx", INDICE_JSON] = process.argv;
const paginas = INDICE_JSON && fs.existsSync(INDICE_JSON) ? JSON.parse(fs.readFileSync(INDICE_JSON, "utf8")) : {};

// ---------- Medidas (DXA: 1440 = 1 pulgada). Tamaño carta. ----------
const ANCHO_PAGINA = 12240;
const ALTO_PAGINA = 15840;
const MARGEN = 1080;
const ANCHO_UTIL = ANCHO_PAGINA - 2 * MARGEN;
const ANCHO_CORRECCION = 1900;
const MARGEN_NOTAS = 2000; // sangría derecha de los párrafos, para escribir a mano

const COLOR = { titulo: "3B2F5C", acento: "E07A3F", celda: "FCE9DC", borde: "BFB6CC", suave: "6B6480" };
const FUENTE = { ascii: "Calibri", hAnsi: "Calibri", cs: "Calibri", eastAsia: "Microsoft YaHei" };

// ---------- Texto ----------
const TONOS = { "😊": "alegre", "🤗": "cálida", "🤫": "tranquila", "🤩": "emocionada", "🤭": "chistosa" };

function limpiar(texto) {
  let t = texto;
  for (const [emoji, palabra] of Object.entries(TONOS)) {
    t = t.split(`${emoji} ${palabra}`).join(palabra);
    t = t.replace(new RegExp(`${emoji}\\s*(?=[^\\s|·])`, "gu"), `${palabra}. `).split(emoji).join(palabra);
  }
  t = t
    .replace(/\p{Regional_Indicator}/gu, "")
    .replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}️‍⃣]/gu, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\\\|/g, "|")
    .replace(/[ \t]{2,}/g, " ");
  // (los saltos de línea se manejan en parrafo())
  return t.trim();
}

// Convierte **negrita**, *cursiva*, `código` y [enlaces](url) en TextRuns.
function runs(texto, base = {}) {
  const t = limpiar(texto);
  const salida = [];
  const patron = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let ultimo = 0;
  for (const m of t.matchAll(patron)) {
    if (m.index > ultimo) salida.push(new TextRun({ text: t.slice(ultimo, m.index), font: FUENTE, ...base }));
    const s = m[0];
    if (s.startsWith("**")) salida.push(...runs(s.slice(2, -2), { ...base, bold: true }));
    else if (s.startsWith("`")) salida.push(new TextRun({ text: s.slice(1, -1), font: FUENTE, ...base, bold: true, color: COLOR.acento }));
    else if (s.startsWith("[")) salida.push(...runs(s.slice(1, s.indexOf("]")), base));
    else salida.push(...runs(s.slice(1, -1), { ...base, italics: true }));
    ultimo = m.index + s.length;
  }
  if (ultimo < t.length) salida.push(new TextRun({ text: t.slice(ultimo), font: FUENTE, ...base }));
  return salida;
}

// ---------- Markdown → bloques ----------
function parsear(md) {
  const lineas = md.replace(/\r/g, "").split("\n");
  const bloques = [];
  let i = 0;
  while (i < lineas.length) {
    const l = lineas[i];
    if (/^```/.test(l)) {
      const cuerpo = [];
      i++;
      while (i < lineas.length && !/^```/.test(lineas[i])) cuerpo.push(lineas[i++]);
      i++;
      bloques.push({ tipo: "codigo", lineas: cuerpo });
      continue;
    }
    const h = l.match(/^(#{1,6})\s+(.*)$/);
    if (h) { bloques.push({ tipo: "titulo", nivel: h[1].length, texto: h[2] }); i++; continue; }
    if (/^\s*\|/.test(l)) {
      const filas = [];
      while (i < lineas.length && /^\s*\|/.test(lineas[i])) {
        const fila = lineas[i].trim().replace(/^\|/, "").replace(/\|$/, "");
        if (!/^\s*:?-{2,}/.test(fila.split("|")[0] || "") ) filas.push(fila.split(/(?<!\\)\|/).map((c) => c.trim()));
        i++;
      }
      bloques.push({ tipo: "tabla", filas });
      continue;
    }
    if (/^>\s?/.test(l)) {
      const cuerpo = [];
      while (i < lineas.length && /^>\s?/.test(lineas[i])) cuerpo.push(lineas[i++].replace(/^>\s?/, ""));
      bloques.push({ tipo: "cita", lineas: cuerpo.filter((x) => x.trim()) });
      continue;
    }
    const li = l.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (li) {
      bloques.push({ tipo: "lista", ordenada: /\d/.test(li[2]), nivel: li[1].length >= 2 ? 1 : 0, texto: li[3] });
      i++;
      continue;
    }
    if (/^\s*(---+|\*\*\*+)\s*$/.test(l) || !l.trim()) { i++; continue; }
    // Un salto de línea forzado de Markdown (dos espacios o "\\" al final) se conserva: lo usan las canciones.
    let texto = l;
    i++;
    while (i < lineas.length && lineas[i].trim() && !/^(#|\||>|```|\s*([-*]|\d+\.)\s)/.test(lineas[i])) {
      const forzado = / {2,}$|\\$/.test(texto);
      texto = texto.replace(/\s+$|\\$/, "") + (forzado ? "\n" : " ") + lineas[i++];
    }
    bloques.push({ tipo: "parrafo", texto: texto.trim() });
  }
  return bloques;
}

// Extrae la sección que empieza con el título indicado hasta el siguiente título de igual o mayor nivel.
function seccion(md, titulo, { sin = [] } = {}) {
  const lineas = md.split("\n");
  const ini = lineas.findIndex((l) => l.replace(/^#+\s+/, "").trim() === titulo && /^#/.test(l));
  if (ini < 0) throw new Error(`No se encontró la sección "${titulo}"`);
  const nivel = lineas[ini].match(/^#+/)[0].length;
  let fin = lineas.findIndex((l, k) => k > ini && /^#+\s/.test(l) && l.match(/^#+/)[0].length <= nivel);
  if (fin < 0) fin = lineas.length;
  let cuerpo = lineas.slice(ini, fin).join("\n");
  for (const s of sin) cuerpo = cuerpo.replace(seccionTexto(cuerpo, s), "");
  return cuerpo;
}
function seccionTexto(md, titulo) {
  try { return seccion(md, titulo); } catch { return ""; }
}

// Cambia el nivel de los títulos para que el primero quede en `nivelDestino`.
function ajustarNiveles(md, nivelDestino) {
  const primero = md.match(/^(#+)\s/m);
  if (!primero) return md;
  const delta = nivelDestino - primero[1].length;
  return md.replace(/^(#+)(\s)/gm, (_, h, s) => "#".repeat(Math.min(6, Math.max(1, h.length + delta))) + s);
}

const leer = (archivo) => fs.readFileSync(path.join(DOCS, archivo), "utf8");

// ---------- Elementos de Word ----------
const indice = []; // [{ nivel, texto }]

function titulo(nivel, texto) {
  const limpio = limpiar(texto.replace(/\*\*/g, ""));
  if (nivel <= 2) indice.push({ nivel, texto: limpio });
  const niveles = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4];
  return new Paragraph({
    heading: niveles[Math.min(nivel, 4) - 1],
    pageBreakBefore: nivel === 1,
    keepNext: true,
    children: [new TextRun({ text: limpio, font: FUENTE })],
  });
}

function parrafo(texto, opciones = {}) {
  const lineas = texto.split("\n");
  return new Paragraph({
    indent: { right: opciones.sinMargen ? 0 : MARGEN_NOTAS },
    spacing: { after: 100 },
    ...opciones.extra,
    children: lineas.flatMap((l, k) => (k ? [new TextRun({ break: 1 }), ...runs(l, opciones.base)] : runs(l, opciones.base))),
  });
}

function anchosColumnas(filas, conCorreccion) {
  const n = filas[0].length;
  const disponible = ANCHO_UTIL - (conCorreccion ? ANCHO_CORRECCION : 0);
  const fijos = {};
  const pesos = [];
  for (let c = 0; c < n; c++) {
    const encabezado = limpiar(filas[0][c] || "").toLowerCase();
    const celdas = filas.slice(1).map((f) => limpiar(f[c] || ""));
    const largoMax = Math.max(encabezado.length, ...celdas.map((x) => x.length));
    if (/^(código|#|tono|edad|etapa)$/.test(encabezado) && largoMax <= 14) { fijos[c] = Math.max(820, Math.min(1250, largoMax * 110)); continue; }
    if (largoMax <= 8) { fijos[c] = 900; continue; }
    const promedio = celdas.reduce((a, x) => a + x.length, 0) / Math.max(1, celdas.length);
    pesos[c] = Math.max(8, Math.min(70, promedio * 0.7 + largoMax * 0.3));
  }
  const usado = Object.values(fijos).reduce((a, b) => a + b, 0);
  const sumaPesos = pesos.reduce((a, b) => a + (b || 0), 0);
  const anchos = [];
  const MINIMO = 1150;
  const libres = pesos.filter(Boolean).length;
  const repartible = disponible - usado - MINIMO * libres;
  for (let c = 0; c < n; c++) anchos[c] = fijos[c] ?? MINIMO + Math.floor((repartible * pesos[c]) / sumaPesos);
  anchos[n - 1] += disponible - anchos.reduce((a, b) => a + b, 0); // ajuste de redondeo
  if (conCorreccion) anchos.push(ANCHO_CORRECCION);
  return anchos;
}

const bordeTabla = { style: BorderStyle.SINGLE, size: 4, color: COLOR.borde };
const bordes = { top: bordeTabla, bottom: bordeTabla, left: bordeTabla, right: bordeTabla, insideHorizontal: bordeTabla, insideVertical: bordeTabla };

function celda(texto, ancho, { encabezado = false, correccion = false } = {}) {
  return new TableCell({
    width: { size: ancho, type: WidthType.DXA },
    verticalAlign: VerticalAlign.TOP,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    shading: encabezado
      ? { type: ShadingType.CLEAR, color: "auto", fill: COLOR.celda }
      : correccion ? { type: ShadingType.CLEAR, color: "auto", fill: "FBFAFD" } : undefined,
    // Respuestas largas separadas por " · " (una por opción): una línea cada una para corregirlas por separado.
    children: (texto.length > 60 && texto.includes(" · ") ? texto.split(" · ") : [texto]).map(
      (parte) => new Paragraph({ spacing: { after: 40 }, children: runs(parte, { size: 18, bold: encabezado || undefined }) }),
    ),
  });
}

function tabla(filas, { conCorreccion = true, conEncabezado = true } = {}) {
  const n = Math.max(...filas.map((f) => f.length));
  const normalizadas = filas.map((f) => Array.from({ length: n }, (_, c) => f[c] ?? ""));
  const anchos = anchosColumnas(normalizadas, conCorreccion);
  const filasWord = normalizadas.map((f, idx) => {
    const encabezado = idx === 0 && conEncabezado;
    const celdas = f.map((c, k) => celda(!conEncabezado && k === 0 && c ? `**${c.replace(/\*\*/g, "")}**` : c, anchos[k], { encabezado }));
    if (conCorreccion) celdas.push(celda(encabezado ? "Corrección" : "", ANCHO_CORRECCION, { encabezado, correccion: !encabezado }));
    return new TableRow({ tableHeader: encabezado, cantSplit: true, children: celdas });
  });
  return [
    new Table({ width: { size: ANCHO_UTIL, type: WidthType.DXA }, columnWidths: anchos, borders: bordes, rows: filasWord }),
    new Paragraph({ spacing: { after: 120 }, children: [] }),
  ];
}

function bloquesWord(md, { correccion = true } = {}) {
  const salida = [];
  for (const b of parsear(md)) {
    if (b.tipo === "titulo") salida.push(titulo(b.nivel, b.texto.replace(/^\d+(\.\d+)*\.?\s+/, "")));
    else if (b.tipo === "parrafo") salida.push(parrafo(b.texto));
    else if (b.tipo === "lista") {
      salida.push(new Paragraph({
        numbering: { reference: b.ordenada ? "numeros" : "vinetas", level: b.nivel },
        indent: { right: MARGEN_NOTAS },
        spacing: { after: 60 },
        children: runs(b.texto),
      }));
    } else if (b.tipo === "cita") {
      for (const l of b.lineas) {
        salida.push(new Paragraph({
          indent: { left: 360, right: MARGEN_NOTAS },
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: COLOR.acento, space: 8 } },
          spacing: { after: 80 },
          children: runs(l, { italics: true, color: COLOR.suave }),
        }));
      }
    } else if (b.tipo === "tabla" && b.filas.length) {
      const esFicha = b.filas[0].every((c) => !c.trim()); // tablas tipo ficha "| | |"
      salida.push(...tabla(esFicha ? b.filas.slice(1) : b.filas, { conCorreccion: correccion, conEncabezado: !esFicha }));
    } else if (b.tipo === "codigo") {
      for (const l of b.lineas) {
        const texto = limpiar(l);
        if (texto.trim()) salida.push(new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: texto, font: "Courier New", size: 16 })] }));
      }
      salida.push(new Paragraph({ children: [] }));
    }
  }
  return salida;
}

function lineasParaNotas(titulo, cantidad = 6) {
  const salida = [new Paragraph({ spacing: { before: 240, after: 120 }, keepNext: true, children: runs(`**${titulo}**`, { color: COLOR.titulo }) })];
  // Renglones para escribir a mano: una tabla sin bordes verticales (los párrafos con borde se fusionan).
  const nada = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const renglon = { style: BorderStyle.SINGLE, size: 4, color: COLOR.borde };
  salida.push(new Table({
    width: { size: ANCHO_UTIL, type: WidthType.DXA },
    columnWidths: [ANCHO_UTIL],
    borders: { top: nada, left: nada, right: nada, bottom: renglon, insideHorizontal: renglon, insideVertical: nada },
    rows: Array.from({ length: cantidad }, () => new TableRow({
      height: { value: 460, rule: "exact" },
      children: [new TableCell({ width: { size: ANCHO_UTIL, type: WidthType.DXA }, children: [new Paragraph({ children: [] })] })],
    })),
  }));
  return salida;
}

// ---------- Contenido del libro ----------
const GUION = leer("GUION_EMILIA.md");
const PERSONAJES = leer("GUIONES_PERSONAJES.md");
const COMPANERA = leer("EMILIA_COMPANERA.md");
const COMPLEMENTO_ARCHIVO = path.join(DOCS, "GUIONES_COMPLEMENTARIOS.md");
const COMPLEMENTO = fs.existsSync(COMPLEMENTO_ARCHIVO) ? fs.readFileSync(COMPLEMENTO_ARCHIVO, "utf8") : null;
const comp = (t) => (COMPLEMENTO ? ajustarNiveles(seccion(COMPLEMENTO, t), 2) : `## ${t}\n\n(Pendiente)`);
const PENDIENTES_ARCHIVO = path.join(__dirname, "pendientes.json");
const PENDIENTES = fs.existsSync(PENDIENTES_ARCHIVO) ? JSON.parse(fs.readFileSync(PENDIENTES_ARCHIVO, "utf8")) : [];

const NUEVO = "> Contenido nuevo, escrito para este libro. Aún no ha sido revisado por una educadora: es el que más necesita tus correcciones.";

const PARTES = [
  {
    titulo: "Parte 1. Cómo hablan los personajes",
    md: [
      ajustarNiveles(seccion(GUION, "1. Cómo habla Emilia"), 2),
      ajustarNiveles(seccion(COMPANERA, "6. Límites sanos del lazo"), 2),
    ],
  },
  {
    titulo: "Parte 2. Emilia",
    md: [
      ajustarNiveles(seccion(PERSONAJES, "1. Emilia", { sin: ["1.4 Ratito de conversar (ejemplos)", "1.8 Pregúntale a Emilia (respuestas de ejemplo)", "1.7 Historias de Emilia (frases por etapa)"] }), 2)
        .replace(/^## 1\. Emilia$/m, "## Ficha y guion principal"),
      "## Historias de Emilia (primeras tres)\n\n" + ajustarNiveles(seccion(PERSONAJES, "1.7 Historias de Emilia (frases por etapa)"), 3).replace(/^### 1\.7 .*$/m, ""),
    ],
  },
  { titulo: "Parte 3. Ratito de conversar", md: [NUEVO, comp("Ratito de conversar")] },
  { titulo: "Parte 4. Pregúntale a Emilia", md: [NUEVO, comp("Pregúntale a Emilia")] },
  { titulo: "Parte 5. Historias, rituales, momentos especiales y retos", md: [NUEVO, comp("Historias, rituales, momentos especiales y retos")] },
  {
    titulo: "Parte 6. Frases base para la grabación",
    md: [
      "> Todas las frases codificadas que se graban. Cada código será el nombre del archivo de audio.",
      ...["2. Saludos y bienvenida", "3. ¿Cómo te sientes?", "4. Consignas e instrucciones", "5. Pistas y ánimo (ayuda en escalera)",
        "6. Celebraciones", "7. Transiciones y juego libre", "8. Fin del tiempo y despedidas", "9. Por lugar del barrio",
        "10. Modo noche y descanso", "11. Tito, el pudú (sin palabras)"].map((t) => ajustarNiveles(seccion(GUION, t), 2)),
    ],
  },
  {
    titulo: "Parte 7. Tito, la familia y los vecinos",
    md: ["2. Tito, el pudú", "3. Abuela Nina", "4. Doña Rosa", "5. Don Pedro", "6. Dr. Lucas", "7. La carabinera Paz", "9. Propuesta: la tía de la escuelita"]
      .map((t) => ajustarNiveles(seccion(PERSONAJES, t), 2)),
  },
  { titulo: "Parte 8. Los amigos de otros países", md: [ajustarNiveles(seccion(PERSONAJES, "8. Los amigos de otros países"), 2)] },
  { titulo: "Parte 9. Guiones por actividad: el barrio", md: [NUEVO, comp("Guiones por actividad: el barrio")] },
  { titulo: "Parte 10. Guiones por actividad: vida diaria", md: [NUEVO, comp("Guiones por actividad: vida diaria")] },
  { titulo: "Parte 11. Canciones y cuentos", md: [NUEVO, comp("Canciones y cuentos")] },
];

// ---------- Portada, instrucciones e índice ----------
function portada() {
  const centro = (texto, base, despues = 200) =>
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: despues }, children: runs(texto, base) });
  return [
    new Paragraph({ spacing: { before: 2400 }, children: [] }),
    centro("La Escuelita de Emilia", { size: 64, bold: true, color: COLOR.titulo }, 240),
    centro("Libro de guiones", { size: 44, color: COLOR.acento }, 120),
    centro("Todos los personajes, frases, conversaciones, canciones y cuentos del juego", { size: 24, color: COLOR.suave }, 1200),
    centro("Versión 1 · Borrador para revisión · Octubre 2026", { size: 22, color: COLOR.suave }, 1600),
    centro("Revisado por: ______________________________________", { size: 24 }, 360),
    centro("Fecha de revisión: _____________________", { size: 24 }, 360),
    centro("Firma: _____________________", { size: 24 }, 200),
  ];
}

const INSTRUCCIONES = `
## Para qué es este libro

Reúne **todo lo que dicen los personajes** de La Escuelita de Emilia: Emilia, Tito, la familia, los vecinos y los amigos de otros países. Está pensado para imprimirlo, leerlo con calma y **corregirlo a mano o en Word**.

Tus correcciones, especialmente las de una educadora de párvulos, son las que harán que el juego hable como se les habla de verdad a los niños de 3 a 6 años.

## Cómo corregir

- Cada tabla tiene una columna **Corrección** a la derecha y cada texto tiene un **margen libre** para escribir.
- Marca cada frase con una de estas señales:
  - **OK**: la frase está bien.
  - **X** y la frase corregida al lado: hay que cambiarla.
  - **?**: tienes una duda; anótala.
  - **+**: falta algo aquí; escríbelo.
- Al final de cada parte hay **líneas para notas generales**.
- Si corriges en Word, usa **Revisar → Control de cambios** para que se vean tus cambios.

## Qué mirar en cada frase

- ¿La entendería un niño de **3 años**? ¿Y uno de 5 le parecería entretenida?
- ¿Suena **natural** dicha en voz alta? ¿Es así como le hablarías a un niño en el jardín?
- ¿Es **verdad**? (sobre todo en Pregúntale a Emilia).
- ¿Es **positiva**, sin retar ni hacer sentir mal?
- ¿Sirve para **cualquier niño o niña**, sin asumir su género?
- ¿Falta alguna **canción, rutina o frase** que uses en tu jardín?

## Cómo leer los guiones

- **Código** (por ejemplo, SAL-01): identifica cada frase; será el nombre del archivo de audio.
- **Tono**: cómo se dice: alegre, cálida, tranquila, emocionada o chistosa.
- **Palabras entre llaves**, como {color_favorito} o {letra}: se reemplazan en el juego por lo que corresponda (el color favorito del niño, la letra que está aprendiendo).
- **Niño**: lo que hace el niño (tocar una imagen, hacer un gesto).
- Las partes marcadas como **contenido nuevo** se escribieron para este libro y todavía no las ha revisado nadie.
`;

function paginaIndice() {
  const salida = [titulo(1, "Índice")];
  indice.length = 0; // el índice no se lista a sí mismo
  for (const parte of PARTES) {
    salida.push(lineaIndice(parte.titulo, 1));
  }
  salida.push(lineaIndice("Anexo. Dudas pendientes y notas finales", 1));
  return salida;
}
function lineaIndice(texto, nivel) {
  const pagina = paginas[texto] ?? "";
  return new Paragraph({
    spacing: { after: nivel === 1 ? 160 : 40 },
    indent: { left: nivel === 1 ? 0 : 360 },
    tabStops: [{ type: TabStopType.RIGHT, position: ANCHO_UTIL, leader: "dot" }],
    children: [
      ...runs(texto, { bold: nivel === 1, size: nivel === 1 ? 24 : 20 }),
      new TextRun({ text: `\t${pagina}`, font: FUENTE, size: nivel === 1 ? 24 : 20 }),
    ],
  });
}

// ---------- Armado ----------
const cuerpo = [];
cuerpo.push(...portada());
cuerpo.push(titulo(1, "Cómo usar este libro"));
cuerpo.push(...bloquesWord(INSTRUCCIONES, { correccion: false }).map((p) => p));
const indicePaginas = paginaIndice();
cuerpo.push(...indicePaginas);

for (const parte of PARTES) {
  cuerpo.push(titulo(1, parte.titulo));
  for (const md of parte.md) cuerpo.push(...bloquesWord(md));
  cuerpo.push(...lineasParaNotas(`Notas generales sobre la ${parte.titulo.split(".")[0].toLowerCase()}`));
}

cuerpo.push(titulo(1, "Anexo. Dudas pendientes y notas finales"));
if (PENDIENTES.length) {
  cuerpo.push(parrafo("Durante la redacción quedaron estas dudas para que las decidan la educadora y el equipo. Escribe la decisión en la columna de la derecha."));
  cuerpo.push(...tabla([["#", "Parte", "Duda"], ...PENDIENTES.map((p, k) => [String(k + 1), p.parte, p.duda])]));
}
cuerpo.push(...lineasParaNotas("Notas finales", 14));

const doc = new Document({
  creator: "La Escuelita de Emilia",
  title: "Libro de guiones — La Escuelita de Emilia",
  description: "Guiones completos de los personajes para imprimir y corregir",
  styles: {
    default: { document: { run: { font: "Calibri", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: COLOR.titulo, font: "Calibri" },
        paragraph: { spacing: { before: 0, after: 240 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR.acento, space: 6 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: COLOR.titulo, font: "Calibri" },
        paragraph: { spacing: { before: 320, after: 140 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: COLOR.acento, font: "Calibri" },
        paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 2 } },
      { id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, color: COLOR.titulo, font: "Calibri" },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 3 } },
    ],
  },
  numbering: {
    config: [
      { reference: "vinetas", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1000, hanging: 270 } } } },
      ] },
      { reference: "numeros", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } },
        { level: 1, format: LevelFormat.LOWER_LETTER, text: "%2)", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1000, hanging: 300 } } } },
      ] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: ANCHO_PAGINA, height: ALTO_PAGINA }, margin: { top: MARGEN, bottom: MARGEN, left: MARGEN, right: MARGEN, header: 500, footer: 500 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: runs("La Escuelita de Emilia · Libro de guiones · Borrador v1", { size: 16, color: COLOR.suave }) })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ children: ["Página ", PageNumber.CURRENT, " de ", PageNumber.TOTAL_PAGES], size: 16, color: COLOR.suave, font: FUENTE }),
    ] })] }) },
    children: cuerpo,
  }],
});

// Lista de títulos de nivel 1 para calcular el índice en la segunda pasada.
fs.writeFileSync(SALIDA.replace(/\.docx$/, ".titulos.json"), JSON.stringify([...PARTES.map((p) => p.titulo), "Anexo. Dudas pendientes y notas finales"], null, 2));
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(SALIDA, buf);
  console.log(`Escrito ${SALIDA}`);
});
