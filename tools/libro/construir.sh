#!/usr/bin/env bash
# Construye el libro de guiones en Word y PDF, con índice paginado (dos pasadas).
# Uso: tools/libro/construir.sh [carpeta_salida]
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
SALIDA="${1:-$DIR/../../docs/imprimible}"
TMP="$(mktemp -d)"
NOMBRE="Libro_de_guiones_La_Escuelita_de_Emilia"
export DOCX_MODULE="${DOCX_MODULE:-$(npm root -g 2>/dev/null)/docx}"
[ -d "$DOCX_MODULE" ] || DOCX_MODULE=/opt/node-tools/node_modules/docx
mkdir -p "$SALIDA"

pasada() {
  node "$DIR/construir_libro.js" "$TMP/$NOMBRE.docx" "${1:-}"
  (cd "$TMP" && soffice --headless --convert-to pdf "$NOMBRE.docx" >/dev/null 2>&1)
}

pasada
python3 "$DIR/paginar.py" "$TMP/$NOMBRE.pdf" "$TMP/$NOMBRE.titulos.json" "$TMP/indice.json"
pasada "$TMP/indice.json"

cp "$TMP/$NOMBRE.docx" "$TMP/$NOMBRE.pdf" "$SALIDA/"
echo "Listo: $SALIDA/$NOMBRE.docx y .pdf ($(pdfinfo "$SALIDA/$NOMBRE.pdf" | awk '/Pages/{print $2}') páginas)"
