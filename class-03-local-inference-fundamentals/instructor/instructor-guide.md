# Instructor Guide — Clase 3: Local Inference Fundamentals

## Teaching goal

El estudiante debe salir creyendo:

> **"La inferencia es un proceso observable con fases y tradeoffs — no una llamada API opaca."**

Debe poder ejecutar **Predict → Run → Measure → Explain** antes de tocar cualquier knob de rendimiento.

## Misconcepción primaria a atacar

> "Streaming hace que el modelo vaya más rápido."

Secundarias:

- tok/s = toda la latencia
- tokens = palabras
- temp = inteligencia del modelo
- KV cache = base de datos de memoria conversacional
- contexto "gratis" hasta el límite hard del modelo

## Qué NO sobre-explicar todavía

- Matemática detallada de attention / transformers
- RAG architecture (Clase 6)
- Tool calling / MCP / agent loops
- Concurrent serving / continuous batching avanzado
- P2P latency
- Multimodal context

Menciones breves solo para conectar con clases futuras.

## Setup pre-clase (checklist)

- [ ] Release notes vs v0.18.x revisadas
- [ ] Contrato `events` + `final` verificado en docs y `.d.ts`
- [ ] Modelo demo provisionado: `QWEN3_600M_INST_Q4` o `LLAMA_3_2_1B_INST_Q4_0`
- [ ] Nombres `generationParams`: `temp`, `seed`, `predict` (NO `temperature`)
- [ ] KV cache: `true`, string key, `deleteCache({ kvCacheKey })`
- [ ] `examples/05-profiler.ts` corre en máquina de demo
- [ ] Break It (`predict` bajo) probado — confirmar `stopReason: "length"`
- [ ] Hardware lento disponible o simulado para variabilidad (opcional)

## Timing (180 min)

| Bloque | Min | Actividad |
|---|---|---|
| Hook | 8 | "¿100 tokens = respuesta escrita de una vez?" — recoger predicciones |
| Tokens + autoregresivo | 15 | Cadena causal en pizarra |
| Demo streaming | 15 | `01-streaming-events.ts` — pausa en primer contentDelta |
| Sampling | 13 | Modelo mental → `02-sampling-experiment.ts` |
| Experimento sampling | 17 | Predicción escrita → JSON |
| Contexto | 15 | History crece → `03-context-experiment.ts` |
| Break | 10 | — |
| KV cache | 17 | Modelo → `04-kv-cache.ts` |
| Experimento cache | 20 | Medir, no prometer speedup |
| Profiler | 15 | `05-profiler.ts` + distinguir stats vs profiler |
| Break It | 16 | predict limitado — diagnóstico stopReason |
| Challenge | 17 | Inference Experiment Report / reto responsive config |
| Exit | 5 | "Mismo tok/s, distinto TTFT — ¿igual UX?" |

## Puntos de predicción (obligatorios)

1. Antes del demo streaming — ¿qué pasó antes del primer token?
2. Antes de cambiar `temp`
3. Antes de comparar history corta/larga
4. Antes de cached vs uncached follow-up
5. Antes de Break It — ¿stopReason esperado?

## Demo script

1. **`01-streaming-events.ts`** — narrar eventos; medir TTFT wall-clock; leer `final.stopReason`.
2. **`02-sampling-experiment.ts`** — temp 0 vs 1; comparar JSON; tok/s puede empatar.
3. **`03-context-experiment.ts`** — enfatizar proxy NOT token count.
4. **`04-kv-cache.ts`** — turno 1 + follow-up; no dramatizar diferencias pequeñas.
5. **`05-profiler.ts`** — exportSummary + exportTable; overhead del profiler mencionado.

**Pregunta entre demos:** ¿En qué eslabón de la cadena actuó el cambio?

## Expected observations (variabilidad OK)

- Primer `contentDelta` siempre después de prefill observable como delay.
- temp 0 + seed: salidas repetibles por corrida; temp 1: más variación.
- History larga: TTFT often ↑; tok/s puede ser similar.
- KV cache: beneficio más visible en multi-turn real; prompts tiny → ruido.
- Break It: `"length"` con contenido parcial coherente.

**Nunca digas:** "En el aula vimos X tok/s, therefore QVAC = X."

## Break-It facilitation

Escenario preferido: ensayo largo + `predict: 8`.

Preguntas:

- ¿Falló o terminó correctamente?
- ¿Qué evento lo confirma?
- ¿Cómo se diferencia de cancel?

## Discussion questions

1. Si solo pudieras optimizar UNA métrica para chat, ¿TTFT o tok/s?
2. ¿Cuándo desactivarías KV cache?
3. ¿Qué llevarías a un ADR de inferencia para Clase 4?

## Problemas comunes de entorno

- Sin `contentDelta` → `stream: false` por error; modelId inválido
- Profiler vacío → enable antes de completion; revisar filters
- KV sin efecto → history mal armada; clave inconsistente
- OOM con history larga → reducir ctx o acortar history de prueba

## Transición a Clase 4

Clase 4 convierte estos primitivos en **Offline Chat**: history persistente, UX de streaming continuo, lifecycle de sesión. El estudiante ya debe leer eventos y métricas — mañana las integra en producto.

## Fuentes utilizadas

- Prompt pack Clase 3 · QVAC docs v0.18.x · ejemplos locales

## Nota de frescura / versión

Guía verificada 2026-08-25. Preferir `events`/`final` en todo código demo.
