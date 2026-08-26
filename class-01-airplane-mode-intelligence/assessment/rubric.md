# Rubric — Clase 1

> Criterios ligados a evidencia observable, no a impresiones. Nivel 4 en todos los criterios = mastery de la clase.

## Criterio 1 — Distinción conceptual (Outcome 1)

| Nivel | Evidencia observable |
|-------|---------------------|
| **4** | Distingue modelo/inferencia/local-first sin guion y aplica la distinción a un sistema NO visto en clase (transfer) |
| **3** | Distingue los tres conceptos con precisión usando los ejemplos de clase |
| **2** | Repite definiciones pero confunde modelo local con app local-first ante un contraejemplo |
| **1** | Usa "local" como etiqueta única; no puede separar las categorías |

## Criterio 2 — Ruta de datos QVAC (Outcomes 2, 3)

| Nivel | Evidencia observable |
|-------|---------------------|
| **4** | Trazar la ruta completa incluyendo worker perezoso/compartido Y explicar qué cambia si falla cada etapa |
| **3** | Traza correctamente App → SDK → worker → modelo → tokens |
| **2** | Traza parcialmente; ubica mal dónde vive el modelo residente |
| **1** | No puede ubicar dónde ocurre la inferencia |

## Criterio 3 — Ejecución técnica (Outcomes 3, 4)

| Nivel | Evidencia observable |
|-------|---------------------|
| **4** | Ciclo completo provision→inferir offline funciona, con limpieza correcta en caminos de éxito Y de error |
| **3** | Ciclo completo funciona en camino feliz; limpieza presente |
| **2** | Funciona solo copiando los examples; limpieza ausente o rota |
| **1** | No logra corrida offline funcional |

## Criterio 4 — Diagnóstico de fallos (Outcome 5, Break It)

| Nivel | Evidencia observable |
|-------|---------------------|
| **4** | Ante un fallo nuevo (no ensayado), forma hipótesis, diseña experimento mínimo y lo resuelve citando evidencia |
| **3** | Diagnostica los Break It guiados correctamente leyendo mensajes de error |
| **2** | Reconoce que falló pero no ubica la fase ni la causa |
| **1** | Concluye "el SDK no sirve para offline" |

## Criterio 5 — Medición e interpretación (Outcome 6, Measure It)

| Nivel | Evidencia observable |
|-------|---------------------|
| **4** | Tabla completa frío/tibio + explica por qué difieren + identifica al menos una limitación de su propia medición |
| **3** | Tabla completa con unidades y dos corridas; interpretación básica |
| **2** | Números presentes sin contexto ni comparación |
| **1** | Reporta números inventados o copiados |

## Criterio 6 — Juicio arquitectónico (Checkpoint Q8, defense)

| Nivel | Evidencia observable |
|-------|---------------------|
| **4** | Promesa de alcance precisa (qué sí/no) + test verificable + reconoce límites del propio diseño |
| **3** | Promesa correcta con test razonable; límites parciales |
| **2** | Promete "todo offline" sin distinciones |
| **1** | No articula criterio alguno de promesa/verificación |

---

## Registro de mastery

- **Mastery hoy:** niveles ≥3 en criterios 1–5 y ≥3 en al menos uno de 4 o 6.
- **Intencionalmente incompleto hoy:** interior del GGUF, cuantización formal, sampling — llegan en Clases 2–3.
