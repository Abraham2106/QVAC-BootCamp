# Rubric — Clase 2

> Criterios ligados a evidencia observable. Nivel 4 en criterios 1–5 + ≥3 en 6 = mastery.

## Criterio 1 — Anatomía del modelo (Outcome 1)

| Nivel | Evidencia |
|---|---|
| **4** | Explica las piezas y predice qué rompe cada una si falta/corrupta (tokenizer, metadata, template) |
| **3** | Nombra y define arquitectura/tensors/pesos/tokenizer/metadata correctamente |
| **2** | Confunde pesos con tokenizer o cree que el GGUF "ejecuta" |
| **1** | "El modelo es un archivo que se ejecuta" |

## Criterio 2 — GGUF y cuantización (Outcomes 2, 3)

| Nivel | Evidencia |
|---|---|
| **4** | Distingue checkpoint vs GGUF Y razona el trade-off de cuantización con números propios medidos |
| **3** | Explica ambos conceptos con la regla 0.5–0.6 GB/1B y su carácter aproximado |
| **2** | Repite "Q4 es 4× más chico" sin poder explicar el trade-off de calidad |
| **1** | "Cuantizar mejora el modelo" |

## Criterio 3 — Lectura de nombres (Outcome 4)

| Nivel | Evidencia |
|---|---|
| **4** | Decodifica nombres NO vistos en clase y predice memoria aproximada solo del nombre |
| **3** | Decodifica correctamente los 3 nombres del checkpoint |
| **2** | Decodifica familia/escala pero falla INST o cuantización |
| **1** | Trata el nombre como string opaco |

## Criterio 4 — Ciclo de vida gestionado (Outcome 5)

| Nivel | Evidencia |
|---|---|
| **4** | find→download→validate→load→infer→reuse→unload→close completo, con limpieza en caminos de error y sin modelos residentes acumulados |
| **3** | Ciclo completo en camino feliz con limpieza |
| **2** | Ciclo funciona copiando examples; limpieza parcial |
| **1** | Modelos residentes acumulándose / proceso colgado |

## Criterio 5 — Comparación medida (Outcome 6)

| Nivel | Evidencia |
|---|---|
| **4** | Comparación determinista (temp 0, seed) + frío/tibio + interpretación de las 3 métricas y sus límites |
| **3** | Tabla completa con corridas reales e interpretación básica |
| **2** | Números sin contexto o comparación con parámetros distintos entre sí |
| **1** | Números inventados/copiados |

## Criterio 6 — Decisión defendida (Checkpoint Q8, defense)

| Nivel | Evidencia |
|---|---|
| **4** | Matriz ≥ 5 factores + riesgo principal + plan de detección, coherente con sus mediciones |
| **3** | Elección justificada con matriz parcial y riesgo nombrado |
| **2** | Elección sin factores o contradice sus propias mediciones |
| **1** | "Elegí el más grande" |

---

## Registro de mastery

- **Mastery hoy:** ≥3 en criterios 1–5 y ≥3 en 6.
- **Intencionalmente incompleto:** mecánica interna de inferencia (Clase 3), fine-tuning LoRA, modelos multimodales/projection, shards.
