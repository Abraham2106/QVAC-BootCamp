# Checkpoint — Clase 3: Local Inference Fundamentals

> 8 preguntas. Distribución: 1 recall · 2 explicación · 2 predicción · 1 interpretación de métricas · 1 diagnóstico · 1 decisión de ingeniería.

## Q1 — Recall *(10%)*

Define **token** y **tokenización** en una frase cada uno. ¿Por qué no debes asumir 1 palabra = 1 token?

## Q2 — Explicación

Describe el bucle de **generación autoregresiva** en 4–6 pasos. ¿Por qué el modelo no escribe toda la respuesta en una sola operación visible?

## Q3 — Explicación

¿Qué diferencia hay entre **prompt processing (prefill)** y **token decoding**? ¿Qué métrica está más ligada a cada fase?

## Q4 — Predicción

Mismo modelo, mismo prompt, `seed: 42`, cambias solo `temp` de 0 a 1.0. ¿Qué predices sobre (a) texto de salida, (b) tok/s? Justifica con el mecanismo de sampling.

## Q5 — Predicción

Duplicas la longitud de `history` (mismos parámetros de generación). ¿Qué predices sobre TTFT y tok/s de decode? ¿Qué proxy de aplicación reportarías si no tienes token count?

## Q6 — Interpretación de métricas

Una corrida streama el primer token a 800 ms; `final.stats.tokensPerSecond` es 12. Otra tiene TTFT 2.5 s pero tok/s 35. ¿Qué parte de la experiencia describe cada métrica? ¿Cuál puede sentirse más responsive al inicio?

## Q7 — Diagnóstico

Una completion termina con `stopReason: "length"`. El prompt pedía un ensayo largo y configuraste `predict: 16`. ¿Falló el modelo? ¿Qué evidencia lo demuestra? Contrasta con `"eos"` y `"error"`.

## Q8 — Decisión / diseño experimental

Diseña **un** experimento controlado para probar si el tamaño de contexto afecta la responsividad (TTFT). Lista: variable cambiada, variables constantes, métricas, hipótesis, y una limitación que impediría generalizar el resultado.

---

## Soluciones esperadas (resumen — instructor)

- **Q1:** Token = unidad sub-palabra del vocabulario del modelo; tokenización = conversión texto→tokens. Palabras ≠ tokens (longitud variable, subwords, puntuación).
- **Q2:** tokenizar → evaluar prompt → distribución next-token → sampling → append → repetir hasta stop. Autoregresivo: cada token condiciona el siguiente.
- **Q3:** Prefill procesa input existente (history); decode genera tokens nuevos uno a uno. TTFT/prefill vs tok/s/decode.
- **Q4:** (a) salidas probablemente distintas con temp 1; temp 0 más determinista con seed. (b) tok/s puede ser similar — sampling no cambia necesariamente throughput.
- **Q5:** TTFT probablemente sube (más prefill); tok/s puede mantenerse. Proxy: message count / character count, etiquetado como NO token count.
- **Q6:** 800 ms = TTFT/responsividad inicial; 12 tok/s = decode sostenido. Segunda config decode más rápido pero peor arranque; primera más responsive al inicio.
- **Q7:** No falló — runtime obedeció límite `predict`. Evidencia: stopReason length, texto parcial, stats. eos = fin natural; error = fallo mid-stream.
- **Q8:** Una variable (history length); constantes: model, generationParams, final question; métricas: TTFT wall-clock + stats; hipótesis causal; limitación: una máquina / sin token count exacto / un solo prompt.

## Fuentes utilizadas

- `lesson.md` Clase 3 · QVAC Text Generation v0.18.x

## Nota de frescura / versión

Checkpoint alineado a API `events`/`final` y stopReason documentados el 2026-08-25.
