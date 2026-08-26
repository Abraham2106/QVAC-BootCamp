# Solución del Instructor — Inference Benchmark / Responsive Configuration

> Material para instructores. NO hay una "mejor configuración" universal — se evalúa el **proceso experimental** y la honestidad de las conclusiones.

## 1. Arquitectura de referencia (proceso)

```text
1. Definir qué significa "lento" (TTFT vs tok/s vs total vs UX)
2. Establecer baseline con events/final + wall-clock
3. Registrar: modelId, generationParams, history proxy, kvCache mode
4. Escribir hipótesis ANTES del cambio
5. Cambiar UNA variable
6. Repetir medición en la misma máquina
7. Comparar tabla predicción vs observación
8. Declarar limitaciones (hardware, una corrida, prompt específico)
9. Recomendar config O siguiente experimento
```

## 2. Baseline de referencia (código, no números)

Equivalente a `examples/01-streaming-events.ts`:

```ts
const run = completion({
  modelId,
  history: [{ role: "user", content: PROMPT }],
  stream: true,
  generationParams: { temp: 0.7, seed: 42, predict: 128 },
});
// TTFT = performance.now() al primer contentDelta
// tok/s = (await run.final).stats?.tokensPerSecond
```

## 3. Outcomes válidos (acepta variación)

| Observación | Conclusión válida |
|---|---|
| KV cache: TTFT follow-up menor | "En este workload multi-turn, cache reuse redujo prefill observable" |
| KV cache: diferencia mínima | "Prompts cortos: beneficio dentro del ruido; no generalizar" |
| temp 0 vs 1: textos distintos, tok/s similar | "Sampling cambió selección, no throughput" |
| History larga: TTFT sube, tok/s estable | "Más contexto → más prompt processing antes del decode" |
| Streaming UX: misma tok/s, mejor percepción | "Responsividad percibida ≠ decode rate" |

## 4. Break It — referencia

`generationParams: { predict: 8 }` + prompt "Escribe un ensayo de 500 palabras..."

Evidencia esperada:

- `final.stopReason === "length"` (contrato v0.18.x)
- Texto parcial coherente pero truncado
- **No** tratar como error de modelo

Contraste oral:

- `"eos"` — terminó naturalmente
- `"cancelled"` — `cancel({ requestId })`
- `"error"` — fallo real mid-stream

## 5. Comparación KV cache — referencia

Patrón de `examples/04-kv-cache.ts`:

1. Turno 1 con `kvCache: "session-demo"`
2. Follow-up con misma clave
3. Misma history con `kvCache: false`
4. Opcional: `deleteCache({ kvCacheKey: "session-demo", modelId })`

Usar `final.cacheableAssistantContent ?? final.contentText` al armar history del turno 2.

## 6. Soluciones incorrectas comunes

1. "KV cache siempre acelera 10×" — sin medición o con prompts triviales.
2. "tok/s bajo = modelo malo" — ignorando TTFT o contexto enorme.
3. "Temperature más alta = más inteligente" — confunde sampling con capacidad.
4. Números copiados de otro estudiante o inventados.
5. Cambiar temp Y predict Y cache en la misma corrida — experimento inválido.
6. Usar `tokenStream` como API canónica en código nuevo sin justificación pedagógica.

## 7. Preguntas de defensa oral

1. ¿Qué evidencia te diría que el cuello de botella es prefill y no decode?
2. ¿Por qué dos apps con el mismo modelo pueden sentirse distintas?
3. ¿Qué medirías antes de sustituir el modelo por uno más grande?
4. ¿Cómo distinguirías `stopReason: "length"` de un bug de aplicación?
5. ¿Qué mantendrías constante para aislar el efecto del tamaño de contexto?

## 8. Hints de debugging

- TTFT altísimo, tok/s normal → sospecha contexto largo o carga del sistema; revisa history y profiler.
- Sin eventos `contentDelta` → revisa `stream: true`, modelId válido, errores en `completionDone`.
- KV cache sin efecto → history incompatible con clave previa; turno 1 muy corto; medir ruido.
- Profiler vacío → verificar `profiler.enable()` antes de operaciones y `operationFilters`.

## 9. Arquitecturas alternativas válidas

- Reporte centrado solo en TTFT vs UX streaming (sin tocar sampling) — válido si la hipótesis es perceptual.
- Experimento de `predict` solo (Break It + latencia total) — válido para apps con respuestas acotadas.
- Tres repeticiones con mediana — stretch recomendado; superior a una sola corrida.

## Fuentes utilizadas

- QVAC Text Generation, Profiler, API Summary v0.18.x
- Ejemplos `01–05` de esta clase

## Nota de frescura / versión

Verificado 2026-08-25 contra `@qvac/sdk@0.18.1`. stopReason documentados: `eos`, `length`, `stopSequence`, `cancelled`, `error`.
