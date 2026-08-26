# Rubric — Clase 3: Local Inference Fundamentals

> Criterios ligados a evidencia observable. Nivel 4 en criterios A–G + ≥3 en H = mastery.

## Criterio A — Modelo mental de generación (Outcomes 1–3)

| Nivel | Evidencia |
|---|---|
| **4** | Explica cadena history→token→prefill→sample→decode; predice efecto de cambios en el eslabón correcto |
| **3** | Distingue autoregresivo vs "respuesta de una vez"; separa prefill de decode |
| **2** | Repite definiciones sin cadena causal |
| **1** | "El modelo devuelve texto" sin mecanismo |

## Criterio B — Event-stream literacy (Outcomes 5–7)

| Nivel | Evidencia |
|---|---|
| **4** | Usa `events`+`final`; interpreta contentDelta/stats/Done/stopReason en corrida real |
| **3** | Consume stream correctamente; identifica stopReason |
| **2** | Código funciona pero mezcla APIs legacy como preferida |
| **1** | No puede leer salida de una corrida instrumentada |

## Criterio C — Razonamiento de sampling (Outcome 4)

| Nivel | Evidencia |
|---|---|
| **4** | Experimento controlado temp/seed; explica selección vs conocimiento vs tok/s |
| **3** | Compara dos configs y describe diferencia cualitativa |
| **2** | "temp = creatividad" sin mecanismo |
| **1** | Confunde sampling con entrenamiento o inteligencia |

## Criterio D — Razonamiento de contexto (Outcomes 8–9)

| Nivel | Evidencia |
|---|---|
| **4** | Experimento history corta/larga; proxy honesto; no afirma ley universal |
| **3** | Explica presión de contexto y mide TTFT |
| **2** | "Más history no cuesta" o token count inventado |
| **1** | Ignora history como input de inferencia |

## Criterio E — Razonamiento KV cache (Outcomes 10–11)

| Nivel | Evidencia |
|---|---|
| **4** | Compara cached/uncached follow-up; distingue cache de memoria/RAG; usa clave o `true` correctamente |
| **3** | Explica reuse de attention state con medición |
| **2** | "KV cache = recuerda todo" |
| **1** | No sabe qué es kvCache |

## Criterio F — Calidad de medición (Outcomes 12–13)

| Nivel | Evidencia |
|---|---|
| **4** | TTFT + total + tok/s + profiler/stats; distingue wall-clock vs runtime; sin números fabricados |
| **3** | Tabla de métricas completa de su máquina |
| **2** | Métricas parciales o sin etiqueta de hardware |
| **1** | Benchmarks inventados o copiados |

## Criterio G — Diagnóstico stop / constraint (Outcome 14)

| Nivel | Evidencia |
|---|---|
| **4** | Break It con evidencia (length/eos/cancelled); distingue constraint de fallo |
| **3** | Identifica stopReason correcto en escenario guiado |
| **2** | Adivina sin evidencia de eventos/final |
| **1** | Trata length limit como error de modelo |

## Criterio H — Diseño experimental (Challenge, Q8)

| Nivel | Evidencia |
|---|---|
| **4** | Una variable; hipótesis previa; limitaciones declaradas; decisión o next test |
| **3** | Experimento reconocible con constantes nombradas |
| **2** | Cambia múltiples variables sin control |
| **1** | Sin predicción ni metodología |

---

## Registro de mastery

- **Mastery hoy:** ≥3 en criterios A–G y ≥3 en H.
- **Nivel 4 global:** explicación causal + API v0.18.x correcta + medición controlada + distinción observación/generalización en ≥5 criterios.

## Regla de oro

No otorgues mastery por código que corre pero no puede explicarse en términos de fases de inferencia.

## Fuentes utilizadas

- Prompt pack Clase 3 · Evidence of Mastery §8

## Nota de frescura / versión

Rubrica alineada a outcomes verificados 2026-08-25.
