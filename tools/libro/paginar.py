"""Busca en qué página del PDF empieza cada parte del libro, para escribir el índice."""
import json
import re
import subprocess
import sys

pdf, titulos_json, salida = sys.argv[1:4]
texto = subprocess.run(["pdftotext", "-layout", pdf, "-"], capture_output=True, text=True, check=True).stdout
paginas = texto.split("\f")
titulos = json.load(open(titulos_json, encoding="utf-8"))


def normal(s):
    return re.sub(r"\s+", "", s).lower()


# El índice también lista los títulos: se busca a partir de la página siguiente al índice.
inicio = next(i for i, p in enumerate(paginas) if "Índice" in p and titulos[0] in p) + 1
resultado = {}
for titulo in titulos:
    clave = normal(titulo)[:40]
    for i in range(inicio, len(paginas)):
        primeras = "".join(paginas[i].splitlines()[:6])
        if clave in normal(primeras):
            resultado[titulo] = i + 1
            inicio = i + 1
            break
    else:
        print(f"Aviso: no se encontró '{titulo}'", file=sys.stderr)
json.dump(resultado, open(salida, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(json.dumps(resultado, ensure_ascii=False))
