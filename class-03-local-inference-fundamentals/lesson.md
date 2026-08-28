# Clase 3 — Local Inference Fundamentals

> **The Local-First AI Systems Masterclass** · Módulo 1 — Your First Local Token
> **Baseline técnico:** QVAC SDK v0.18.x / v0.18.1, verificado contra la documentación oficial y npm el 2026-08-25. Revisa las release notes antes de impartir esta clase.

---

## Introducción

Un LLM no devuelve una respuesta completa en una sola operación. Convierte el historial en tokens, evalúa el prompt, elige el siguiente token y repite el ciclo hasta una condición de parada.

Las Clases 1 y 2 cubrieron dónde vive el modelo y qué contiene el artefacto GGUF. Esta clase cubre qué ocurre durante la inferencia y cómo observarlo con la API de QVAC v0.18.x.

---

## Qué aprenderás

Al terminar esta lección podrás:

1. **Explicar** tokenización sin confundir tokens con palabras.
2. **Distinguir** prefill (procesamiento del prompt) de decode (generación token a token).
3. **Describir** generación autoregresiva y el bucle que produce cada token.
4. **Mapear** sampling a `generationParams` (`temp`, `top_k`, `top_p`, `seed`, `predict`).
5. **Ejecutar** `completion()` con `events` + `final` como superficie canónica.
6. **Interpretar** `contentDelta`, `completionStats`, `completionDone`, `stopReason` y campos de `final`.
7. **Razonar** sobre presión de contexto y cuándo puede ayudar KV cache.
8. **Distinguir** TTFT, latencia total y throughput (tok/s).
9. **Usar** `cancel()`, `deleteCache()` y el profiler para diagnóstico.
10. **Diseñar** experimentos controlados antes de afirmar rendimiento.

---

## Definición y contexto

`completion()` parece una llamada única, pero internamente ejecuta fases distintas con costos distintos.

En la misma laptop, una configuración puede emitir el primer token a 200 ms y decodificar a 15 tok/s. Otra puede tardar 2 s en el primer token y luego decodificar a 40 tok/s. Si solo miras tok/s, la segunda parece mejor. Si el usuario espera en silencio antes del primer carácter, la primera puede sentirse más rápida.

La inferencia local expone estas fases. Tu trabajo es identificar qué mecanismo afecta cada parámetro, medir la métrica correcta y explicar lo observado con evidencia.

Cadena causal que usarás en todo el bootcamp:

```text
history
   ↓
tokenization / prompt processing (prefill)
   ↓
model state (incl. attention state)
   ↓
next-token distribution
   ↓
sampling
   ↓
token
   ↓
streamed event (contentDelta)
   ↓
repeat until stop condition
```

Cuando cambies un parámetro, pregúntate en qué eslabón de esta cadena actúa.

---

## Términos

### Índice rápido

| Término | Definición breve | Fase afectada |
|---|---|---|
| **Token** | Unidad sub-palabra del vocabulario del modelo | Entrada y salida |
| **Prefill** | Procesamiento del prompt e historial antes del primer token nuevo | Latencia inicial |
| **Decode** | Generación autoregresiva de un token por iteración | Throughput |
| **Autoregresión** | Cada token nuevo depende de todo lo anterior | Bucle completo |
| **Sampling** | Regla que elige el siguiente token de la distribución | Selección |
| **stopReason** | Razón documentada de fin de generación | Terminación |
| **KV cache** | Estado de atención reutilizable entre turnos compatibles | Follow-ups |
| **TTFT** | Tiempo hasta el primer `contentDelta` visible | Responsividad inicial |
| **tok/s** | Throughput de tokens generados después del primero | Velocidad sostenida |

### Token

**Definición:** Unidad sub-palabra que el tokenizer del modelo convierte desde texto o hacia texto.

**Uso:** El costo de contexto escala con tokens procesados, no con palabras. Una palabra común puede ser un token; un término técnico puede partirse en varios.

**Ejemplo:**

```text
"Hola"           → puede ser 1 token
"tokenización"   → puede ser 2–3 tokens
"QVAC"           → depende del vocabulario del modelo
```

**Resultado:** No equipes tokens con palabras sin medir con el tokenizer concreto.

**Nota:** En QVAC, si no tienes API de conteo verificada, usa proxies de aplicación (caracteres, mensajes) y etiquétalos honestamente.

### Prefill

**Definición:** Fase en la que el runtime procesa los tokens de entrada (prompt e historial) para construir el estado del modelo antes de generar el primer token nuevo.

**Uso:** Explica por qué un historial largo aumenta TTFT aunque tok/s se mantenga similar.

**Ejemplo:**

```text
history corta  → prefill rápido  → TTFT bajo
history larga  → prefill lento   → TTFT alto (tok/s puede ser similar)
```

**Resultado:** Más contexto implica más trabajo de procesamiento antes del primer token de respuesta.

**Nota:** No afirmes una relación lineal universal entre longitud y TTFT — mide en tu caso.

### Decode

**Definición:** Fase autoregresiva que produce un token nuevo por iteración, usando el estado construido en prefill.

**Uso:** Describe la generación sostenida después del primer token. El throughput (tok/s) mide principalmente esta fase.

**Ejemplo:**

```text
prefill completo
      ↓
decode: token₁ → token₂ → token₃ → … → stop
```

**Resultado:** Cada token generado se añade al contexto y alimenta la siguiente iteración.

**Nota:** Streaming expone el decode al cliente; no acelera intrínsecamente el motor de inferencia.

### Autoregresión

**Definición:** Patrón en el que cada token nuevo depende de todo lo anterior, incluidos los tokens que el propio modelo acaba de generar.

**Uso:** Modelo mental del bucle de inferencia. Explica por qué la generación es incremental y por qué el streaming tiene sentido.

**Sintaxis / API:** No es una función — es el comportamiento de `completion()`.

**Ejemplo:**

```text
history / prompt
      ↓
tokenización
      ↓
prefill
      ↓
distribución del siguiente token
      ↓
sampling
      ↓
append del token al contexto
      ↓
repetir hasta condición de parada
```

**Resultado:** Texto visible = consecuencia acumulada del bucle token a token.

**Nota:** Cuando cambies un parámetro, identifica en qué paso del bucle actúa.

### Sampling

**Definición:** Regla que elige un token de la distribución de probabilidad calculada por el modelo.

**Uso:** Controla variabilidad y determinismo de la salida. Se configura con `generationParams`.

**Sintaxis / API:**

| Campo | Rol |
|---|---|
| `temp` | Escala la distribución; 0 tiende a greedy/determinista |
| `top_k` | Limita candidatos a los K más probables |
| `top_p` | Nucleus sampling — masa acumulada de probabilidad |
| `seed` | Semilla para reproducibilidad cuando el backend la respeta |
| `predict` | Máximo de tokens nuevos a generar |

**Ejemplo:**

```ts
generationParams: { temp: 0.7, top_k: 40, top_p: 0.9, seed: 42, predict: 128 }
```

**Resultado:** Distintos settings producen distinto comportamiento de salida con el mismo prompt.

**Nota:** Cambiar `temp` altera selección, no el conocimiento en los pesos. Usa `temp`, no `temperature`. No prometas reproducibilidad total sin controlar todos los factores relevantes.

### stopReason

**Definición:** Campo en `final` (y opcionalmente en `completionDone`) que documenta por qué terminó la generación.

**Uso:** Diagnóstico de fin natural, límite configurado, cancelación o error.

**Sintaxis / API:**

| Valor | Significado típico |
|---|---|
| `"eos"` | Fin natural (end-of-sequence) |
| `"length"` | Alcanzó límite de tokens nuevos (`predict`) |
| `"stopSequence"` | Encontró secuencia de parada configurada |
| `"cancelled"` | Cancelación con `cancel({ requestId })` |
| `"error"` | Fallo mid-stream |

**Ejemplo:**

```ts
const final = await run.final;
console.log(final.stopReason); // p. ej. "length"
```

**Resultado:** `stopReason: "length"` no indica fallo del modelo — indica que el runtime obedeció un límite que tú configuraste.

**Nota:** Contrasta `"length"` con `"eos"` (fin natural), `"cancelled"` (cancel explícito) y `"error"` (fallo real).

### KV cache

**Definición:** Almacenamiento de attention state (keys/values) ya computado para prefijos compatibles, evitando re-evaluar todo el historial en cada turno.

**Uso:** Puede reducir trabajo de prefill en follow-ups de conversación multi-turn.

**Sintaxis / API:**

| Valor de `kvCache` | Comportamiento |
|---|---|
| `false` / `undefined` | Sin cache (default) |
| `true` | Auto-cache gestionado por SDK |
| `"mi-sesion-123"` | Cache caller-managed con clave explícita |

**Ejemplo:**

```ts
// Turno 1 — construye cache
const run1 = completion({
  modelId,
  history: [{ role: "user", content: "Mi nombre es Ana." }],
  kvCache: "sesion-ana",
  stream: true,
  generationParams: { predict: 48 },
});

// Turno 2 — reutiliza cache compatible
const run2 = completion({
  modelId,
  history: [
    { role: "user", content: "Mi nombre es Ana." },
    { role: "assistant", content: await run1.final.then(f => f.contentText) },
    { role: "user", content: "¿Cómo me llamo?" },
  ],
  kvCache: "sesion-ana",
  stream: true,
  generationParams: { predict: 48 },
});
```

**Resultado:** El follow-up procesa principalmente tokens nuevos si el prefijo es compatible.

**Nota:** KV cache no es memoria semántica, RAG ni almacenamiento de largo plazo. Caches auto: retención documentada (24 h idle, cuotas de disco). Usa `final.cacheableAssistantContent` cuando el runtime lo exponga.

### TTFT

**Definición:** Time To First Token — tiempo desde que inicias la request hasta el primer output visible (`contentDelta`).

**Uso:** Métrica de responsividad percibida al inicio. Explica la "espera en silencio" del usuario.

**Ejemplo:**

```ts
const requestStart = performance.now();
let ttftMs: number | null = null;

for await (const event of run.events) {
  if (event.type === "contentDelta" && ttftMs === null) {
    ttftMs = performance.now() - requestStart;
  }
}
```

**Resultado:** TTFT incluye tokenización, prefill, primer paso de decode y overhead de cliente/worker.

**Nota:** TTFT ≠ latencia total ≠ tok/s. Los valores dependen del hardware.

### tok/s

**Definición:** Throughput de decode — tokens generados por segundo después del primero.

**Uso:** Describe velocidad de generación sostenida, no la espera inicial.

**Sintaxis / API:** `final.stats.tokensPerSecond` y eventos `completionStats`.

**Ejemplo:**

```ts
const final = await run.final;
console.log(final.stats?.tokensPerSecond); // p. ej. 28.4
```

**Resultado:** Dos configs con el mismo tok/s pueden tener latencia total distinta si difieren en TTFT o en cuántos tokens producen.

**Nota:** tok/s no incluye tiempo de prefill ni TTFT. Etiqueta resultados como de tu máquina.

---

## Referencia QVAC

Funciones documentadas en v0.18.x para esta clase.

### `completion()`

**Definición:** Ejecuta inferencia sobre un modelo cargado y produce tokens mediante generación autoregresiva.

**Uso:** Superficie principal para observar prefill, decode, sampling y métricas.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `modelId` | `string` | ID del modelo cargado |
| `history` | `{ role, content }[]` | Mensajes de conversación (parte del input) |
| `stream` | `boolean` | Si `true`, emite eventos incrementales |
| `generationParams` | `{ temp?, top_k?, top_p?, seed?, predict? }` | Parámetros de sampling |
| `kvCache` | `boolean \| string` | Modo de KV cache |

**Retorno:** `CompletionRun` con:

| Superficie | Qué es |
|---|---|
| `events` | `AsyncIterable<CompletionEvent>` ordenado, tipado por `type` |
| `final` | `Promise<CompletionFinal>` con texto agregado, stats y stopReason |
| `requestId` | ID para `cancel()` |

**Ejemplo:**

```ts
const run = completion({
  modelId,
  history: [{ role: "user", content: "Hola" }],
  stream: true,
  generationParams: { temp: 0.7, seed: 42, predict: 128 },
});

for await (const event of run.events) {
  switch (event.type) {
    case "contentDelta":
      process.stdout.write(event.text);
      break;
    case "completionStats":
      console.log(`${event.stats.tokensPerSecond} tok/s`);
      break;
    case "completionDone":
      console.log(`done: ${event.stopReason}`);
      break;
  }
}

const final = await run.final;
console.log(final.stopReason, final.stats?.tokensPerSecond);
```

**Resultado:** Eventos tipados durante el stream y promesa `final` con `.contentText`, `.stats`, `.stopReason`.

**Nota:** Preferir `events`/`final` sobre legacy (`tokenStream`, `text`, `stats` sueltos). Otros eventos existen (`thinkingDelta`, `toolCall`, `toolError`, `rawDelta`) — relevantes en clases posteriores.

### `cancel()`

**Definición:** Cancela una operación en curso identificada por `requestId`.

**Uso:** Detener generación mid-stream. Produce `stopReason: "cancelled"`.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `requestId` | `string` | ID de la operación (p. ej. `run.requestId`) |

**Ejemplo:**

```ts
const run = completion({ modelId, history, stream: true });
// … tras algunos contentDelta …
await cancel({ requestId: run.requestId });
const final = await run.final;
console.log(final.stopReason); // "cancelled"
```

**Resultado:** El iterable de eventos se cierra. `final` refleja contenido parcial generado hasta la cancelación.

**Nota:** Cancelación de producto ≠ error. No captures todos los errores y los etiquetes `"cancelled"`.

### `deleteCache()`

**Definición:** Elimina una entrada de KV cache caller-managed.

**Uso:** Limpiar sesiones explícitas al cerrar conversaciones o multiplexar usuarios.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `kvCacheKey` | `string` | Clave de sesión usada en `kvCache` |
| `modelId` | `string` (opcional) | Restringe la limpieza a un modelo |

**Ejemplo:**

```ts
await deleteCache({ kvCacheKey: "sesion-ana", modelId });
```

**Resultado:** Cache eliminada. El siguiente turno con la misma clave reprocesará el historial completo.

**Nota:** Reutilizar clave con history incompatible produce comportamiento inesperado o cache miss. La identidad de sesión debe alinearse con el history que extiendes.

### `profiler`

**Definición:** Instrumentación process-wide del SDK para timing agregado por operación.

**Uso:** Evidencia diagnóstica de operaciones RPC/handler. Complementa stats de `completion()`, no las reemplaza.

| Método | Descripción |
|---|---|
| `enable(config)` | Activa el profiler con filtros y modo |
| `disable()` | Desactiva recolección |
| `clear()` | Borra datos acumulados |
| `exportSummary()` | Resumen legible |
| `exportTable()` / `exportJSON()` | Export estructurado |
| `isEnabled()` | Estado actual |
| `getConfig()` | Configuración activa |

**Ejemplo:**

```ts
import { profiler } from "@qvac/sdk";

profiler.clear();
profiler.enable({
  mode: "verbose",
  includeServerBreakdown: true,
  includeResourceGauges: true,
  operationFilters: ["completion"],
});
// … operaciones completion …
console.log(profiler.exportSummary());
profiler.disable();
```

**Resultado:** Timing agregado por operación. Resource gauges (opt-in) cuando el backend las soporta.

**Nota:** El profiler añade overhead diagnóstico. Es evidencia local y contextual, no benchmark universal de QVAC. No mezcles profiler con `completionStats` como si midieran lo mismo.

---

## Ejemplo completo

Flujo mínimo: cargar modelo → completar con eventos → medir TTFT → leer final.

```ts
import {
  close, completion, loadModel,
  LLAMA_3_2_1B_INST_Q4_0, unloadModel,
} from "@qvac/sdk";

const modelId = await loadModel({
  modelSrc: LLAMA_3_2_1B_INST_Q4_0,
  modelConfig: { ctx_size: 2048 },
});

const run = completion({
  modelId,
  history: [{ role: "user", content: "Explica prefill y decode en una frase." }],
  stream: true,
  generationParams: { temp: 0.7, seed: 42, predict: 128 },
});

const requestStart = performance.now();
let ttftMs: number | null = null;

for await (const event of run.events) {
  if (event.type === "contentDelta") {
    if (ttftMs === null) ttftMs = performance.now() - requestStart;
    process.stdout.write(event.text);
  }
}

const final = await run.final;
console.log("\n", {
  stopReason: final.stopReason,
  tokPerSec: final.stats?.tokensPerSecond,
  ttftMs,
  totalMs: performance.now() - requestStart,
});

await unloadModel({ modelId, clearStorage: false });
void close();
```

Pasos del flujo (`examples/01-streaming-events.ts`):

1. `loadModel` — modelo residente.
2. `completion({ stream: true })` — inicia run.
3. Primer `contentDelta` — marca TTFT observado.
4. Más `contentDelta` — decode en curso.
5. `completionStats` — runtime reporta tok/s.
6. `completionDone` — stream cerrado.
7. `await run.final` — texto completo + stopReason + stats agregadas.

Ejemplos ejecutables en [`examples/`](examples/).

---

## Antes de ejecutar

Escribe tus respuestas antes del lab:

1. Mismo prompt, `seed: 42`, `temp: 0` vs `temp: 1.0` — ¿salida idéntica?
2. Si tok/s es similar entre ambos, ¿qué cambió realmente?
3. History larga vs corta — ¿qué métrica cambia más, TTFT o tok/s?
4. Follow-up con KV cache — ¿siempre TTFT menor?
5. `predict: 8` con prompt que pide ensayo largo — ¿qué `stopReason` esperas?
6. ¿Streaming acelera tok/s del runtime o solo expone progreso?

---

## Práctica guiada

Construye el [Inference Benchmark Lab](lab/):

1. Corre `examples/01-streaming-events.ts` y anota TTFT observado.
2. Corre `examples/02-sampling-experiment.ts` y compara JSON (`temp: 0` vs `temp: 1.0`).
3. Corre `examples/03-context-experiment.ts` (history corta vs larga).
4. Corre `examples/04-kv-cache.ts` (follow-up con y sin cache).
5. Corre `examples/05-profiler.ts` y exporta resumen.
6. Completa los 6 TODO de `lab/starter/inference-lab-starter.ts` y produce reporte JSON con `--json`.

Entregable: **Inference Experiment Report** con TTFT, duración total, tok/s, stopReason, condición de history y modo cache. Etiqueta resultados como de tu máquina.

---

## Errores comunes

| Síntoma | Causa probable | Corrección |
|---|---|---|
| "Streaming hace el modelo más rápido" | Confundir UX con throughput del runtime | Medir tok/s con y sin streaming UX; suelen ser idénticos |
| tok/s "bajo" pero respuesta rápida | TTFT bajo enmascara decode lento | Medir TTFT y tok/s por separado |
| `stopReason: "length"` interpretado como fallo | Límite `predict` configurado bajo | Verificar `generationParams.predict`; es comportamiento esperado |
| KV cache sin speedup | Prompt diminuto o history incompatible | Medir en follow-ups reales; alinear clave con history |
| Cache miss inesperado | Clave reutilizada con history distinto | Usar clave por sesión; invalidar con `deleteCache()` |
| Métricas inconsistentes entre corridas | Sin controlar seed, contexto o carga del sistema | Diseñar experimento con una variable a la vez |
| Usar `temperature` en lugar de `temp` | Parámetro legacy o incorrecto | Usar `temp` según API v0.18.x |

### Notas adicionales

1. **"Subir temperature cambia lo que el modelo sabe."** No; cambia cómo elige entre tokens probables.
2. **"Si cabe en contexto, es gratis."** No; más contexto = más trabajo de prefill.
3. **"KV cache = memoria de largo plazo."** No; reutiliza attention state compatible con límites de retención.
4. **"Mismo modelo = misma velocidad."** Falso; backend, RAM, GPU/CPU y carga del sistema cambian todo.

---

## Medición

| Métrica | Cómo obtenerla | Unidad | Interpretación |
|---|---|---|---|
| TTFT | `performance.now()` al primer `contentDelta` | ms | Responsividad inicial; incluye prefill |
| Duración total | request start → `await run.final` | ms | Tiempo wall-clock del turno completo |
| tok/s | `final.stats.tokensPerSecond` o `completionStats` | tok/s | Throughput de decode sostenido |
| stopReason | `final.stopReason` | enum | Por qué terminó la generación |
| Condición history | message count / char count (proxy) | conteo | Variable controlada en experimentos |
| Modo cache | valor de `kvCache` usado | bool/string | Condición del experimento KV |

Regla: **TTFT ≠ latencia total ≠ tok/s**.

Corre cada medición al menos dos veces. Etiqueta resultados como de tu equipo, no como benchmark universal de QVAC.

---

## Resumen

- La inferencia es un proceso con fases observables: tokenización, prefill, decode y sampling.
- `completion()` expone el bucle vía `events` (incremental) y `final` (agregado).
- TTFT mide responsividad inicial; tok/s mide throughput de decode; son métricas distintas.
- `stopReason` documenta por qué terminó — `"length"` indica límite configurado, no fallo.
- KV cache reutiliza attention state en follow-ups compatibles; no es memoria semántica ni RAG.
- Diseña experimentos con una variable a la vez antes de afirmar rendimiento.

**Siguiente clase:** Clase 4 — Build the Offline Chat (history persistente, cancelación y UX).

---

## Estudio profundo — una completion es una secuencia de decisiones y estado

### Del texto al siguiente token

El runtime no recibe palabras directamente: el tokenizer transforma texto en IDs. Durante el
**prefill**, el modelo procesa los tokens del prompt y construye estado de attention. En cada paso
de **decode**, produce logits para el siguiente token, aplica una política de sampling, emite uno y
repite. La interfaz que parece devolver “un string” está observando un proceso incremental con
perfiles de costo distintos.

TTFT incluye el trabajo previo al primer token observable: preparación, tokenización, prefill,
cola y overhead del runtime. `tokensPerSecond` describe principalmente el ritmo de decode. Una
respuesta puede tener TTFT excelente y decode lento, o TTFT alto y después fluir rápidamente. No
mezcles ambas métricas en un solo número de “velocidad”.

### Sampling: puntuaciones no son probabilidades

El modelo produce logits `z_i`, no decisiones terminadas. Softmax crea una distribución:

```text
p_i = exp(z_i / T) / sum_j exp(z_j / T)
```

Con `T` baja se amplifican diferencias entre logits; con `T` alta la distribución se aplana.
Esto modifica la selección entre opciones puntuadas, no hace que el modelo “sepa más”. Greedy
elige la mayor probabilidad; top-k limita candidatos; top-p selecciona una masa acumulada. Cada
política debe evaluarse en la tarea y con controles adecuados.

### KV cache, contexto y streaming

La KV cache guarda representaciones de tokens anteriores para evitar recalcular prefijos
compatibles. Puede mejorar follow-ups, pero consume memoria según capas, dimensiones, dtype y
contexto. No sustituye el historial de aplicación ni garantiza cache hit si cambian history, clave
o configuración.

La context window es un presupuesto para instrucciones, historial y salida. “Cabe” no significa
gratis: prompts mayores suelen aumentar prefill y cache. Streaming no acelera mágicamente decode;
expone progreso antes del texto final. Por eso los eventos son provisionales y `final`,
`stopReason` y stats son el contrato de observabilidad.

### Para estudiar y defender

1. Predice qué ocurre con TTFT y tok/s si duplicas solo la longitud del prompt.
2. Explica cómo cambia softmax al reducir temperatura para tres logits diferentes.
3. Explica por qué un cache reduce cálculo sin convertir el chat en persistente.
4. Diseña un experimento que pruebe UX de streaming sin afirmar más throughput.

## Fuentes

- QVAC — Text generation: https://docs.qvac.tether.io/ai-capabilities/text-generation/
- QVAC — API Summary v0.18.x: https://docs.qvac.tether.io/reference/api/
- QVAC — Profiler: https://docs.qvac.tether.io/runtime/profiler/
- QVAC — How it works: https://docs.qvac.tether.io/about/how-it-works/
- QVAC — Release notes: https://docs.qvac.tether.io/reference/release-notes/
- llama.cpp (contexto general): https://github.com/ggml-org/llama.cpp
- npm @qvac/sdk 0.18.1: https://www.npmjs.com/package/@qvac/sdk

Superficie canónica: `events` + `final`. Parámetros de generación: `temp`, `top_k`, `top_p`, `seed`, `predict` (no usar `temperature`).
