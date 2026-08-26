# Clase 3 — Local Inference Fundamentals

> **The Local-First AI Systems Masterclass** · Módulo 1 — Your First Local Token
> **Baseline técnico:** QVAC SDK v0.18.x / v0.18.1, verificado contra la documentación oficial y npm el 2026-08-25. Revisa las release notes antes de impartir esta clase.

---

## Pregunta esencial

> **¿Qué ocurre entre un prompt y el siguiente token generado, y cómo podemos observar las consecuencias?**

---

## Resultados de aprendizaje

Al terminar esta lección puedes:

1. **Explicar** tokenización sin confundir tokens con palabras.
2. **Explicar** generación autoregresiva y el bucle token a token.
3. **Distinguir** prompt processing (prefill) de token decoding.
4. **Explicar** sampling y mapearlo a `generationParams` actuales (`temp`, `top_k`, `top_p`, `seed`, `predict`).
5. **Ejecutar** `completion()` con `events` + `final` como superficie canónica.
6. **Interpretar** `contentDelta`, `completionStats`, `completionDone` y campos de `final`.
7. **Interpretar** `stopReason`.
8. **Explicar** presión de contexto: qué entra en la ventana finita.
9. **Usar** KV cache y razonar cuándo puede ayudar un follow-up compatible.
10. **Distinguir** TTFT, latencia total y throughput.
11. **Usar** el profiler para evidencia de operaciones.
12. **Diagnosticar** generación limitada con evidencia observable.
13. **Diseñar** experimentos controlados antes de afirmar rendimiento.

---

## Por qué importa esto

Imagina dos configuraciones en la misma laptop:

- **Config A:** el modelo empieza a streamar a los 200 ms pero decodifica a 15 tok/s.
- **Config B:** tarda 2 s en el primer token pero luego decodifica a 40 tok/s.

¿Cuál "se siente" más rápida para el usuario? Depende de qué parte de la experiencia midas. Si solo miras tok/s, Config B parece ganadora; si el usuario espera en silencio antes del primer carácter, Config A puede sentirse mucho mejor aunque decodifique más lento.

Este escenario es la razón de existir de la Clase 3. Las Clases 1 y 2 respondieron *dónde* vive el modelo y *qué* contiene el artefacto. Hoy respondemos **qué ocurre mientras infiere** y **cómo observarlo** sin tratar la API como caja negra.

La transferencia que buscamos no es memorizar nombres de parámetros. Es poder recibir una configuración de generación y **predecir** qué mecanismo toca, **medir** qué métrica lo revela, y **explicar** lo observado con evidencia.

---

## Concepto: el texto no son tokens

Antes de hablar de `temperature` o KV cache, necesitas una imagen mental correcta del input.

Un LLM no consume "palabras" directamente. El **tokenizer** convierte texto en una secuencia de **tokens** — unidades sub-palabra que el vocabulario del modelo puede representar. Una palabra común puede ser un token; una palabra rara puede partirse en varios; la puntuación y los espacios también cuentan.

Implicaciones prácticas:

- **No equipes tokens con palabras.** "Hola" puede ser 1 token; un término técnico compuesto puede ser 3.
- **No adivines conteos exactos** sin medir con el tokenizer del modelo concreto. En QVAC, si no tienes API de conteo verificada, usa proxies de aplicación (caracteres, mensajes) y etiquétalos honestamente.
- **El costo de contexto escala con tokens procesados**, no con "número de frases" de forma lineal simple.

---

## Concepto: generación autoregresiva

Un LLM de texto no escribe la respuesta completa en una sola operación matricial gigante visible al usuario. El flujo normal es **autoregresivo**:

```text
history / prompt
      ↓
tokenización
      ↓
evaluación del prompt (prefill)
      ↓
distribución de probabilidad del siguiente token
      ↓
sampling / selección de un token
      ↓
append del token al contexto
      ↓
repetir hasta condición de parada
```

Cada token nuevo depende de todo lo anterior — incluidos los tokens que el propio modelo acaba de generar. Por eso la generación es incremental y por eso el streaming tiene sentido: puedes **observar** el bucle mientras ocurre.

---

## Modelo mental

Consolida la cadena causal que usarás en todo el bootcamp:

```text
history
   ↓
tokenization / prompt processing
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

Cuando cambies un parámetro, pregúntate: **¿en qué eslabón de esta cadena actúa?**

---

## Dentro de QVAC: `completion()`

En QVAC SDK v0.18.x, `completion()` devuelve un **`CompletionRun`** con dos superficies principales:

| Superficie | Qué es |
|---|---|
| `events` | `AsyncIterable<CompletionEvent>` ordenado, tipado por `type` |
| `final` | `Promise<CompletionFinal>` con texto agregado, stats y stopReason |

**Código nuevo:** preferir `events` + `final`.

Superficies legacy (`tokenStream`, `text`, `stats` sueltos) pueden seguir existiendo por compatibilidad, pero no son el contrato canónico que enseñamos.

Ejemplo mínimo:

```ts
const run = completion({
  modelId,
  history: [{ role: "user", content: "Hola" }],
  stream: true,
  generationParams: { temp: 0.7, seed: 42, predict: 128 },
});

for await (const event of run.events) {
  if (event.type === "contentDelta") process.stdout.write(event.text);
}

const final = await run.final;
console.log(final.stopReason, final.stats?.tokensPerSecond);
```

---

## Streaming

El streaming expone progreso al cliente. **No acelera intrínsecamente el motor de inferencia** — cambia cuándo el usuario ve output.

Eventos que esta clase enfatiza:

| Evento | Rol pedagógico |
|---|---|
| `contentDelta` | Fragmento de texto visible; primer evento útil para TTFT observado |
| `completionStats` | Stats del runtime (p. ej. tok/s) durante o al final |
| `completionDone` | Señal de cierre del stream; puede incluir stopReason |

Otros eventos existen (`thinkingDelta`, `toolCall`, `toolError`, `rawDelta`) — relevantes en clases posteriores de agentes y tool calling; aquí solo los reconocemos.

Patrón de consumo:

```ts
for await (const event of run.events) {
  switch (event.type) {
    case "contentDelta": /* texto */ break;
    case "completionStats": /* métricas */ break;
    case "completionDone": /* terminal */ break;
  }
}
const final = await run.final;
```

---

## Stop reasons

La generación termina por una razón documentada. Valores habituales en el contrato actual:

| stopReason | Significado típico |
|---|---|
| `"eos"` | Fin natural (end-of-sequence) |
| `"length"` | Alcanzó límite de tokens nuevos (`predict`) |
| `"stopSequence"` | Encontró secuencia de parada configurada |
| `"cancelled"` | Cancelación (`cancel({ requestId })`) |
| `"error"` | Fallo mid-stream (distinto de parada intencional) |

**Diagnóstico:** `stopReason: "length"` no es "el modelo falló" — es el runtime obedeciendo un límite que **tú** configuraste. La evidencia está en `final.stopReason`, contenido parcial y stats.

---

## Sampling

El modelo calcula una distribución sobre candidatos al siguiente token. **Sampling** es la regla que elige uno.

Secuencia pedagógica:

```text
modelo predice posibles next tokens
        ↓
necesitamos una regla de selección
        ↓
sampling controla esa selección
        ↓
distintos settings → distinto comportamiento de salida
```

Parámetros documentados en `generationParams` (v0.18.x):

| Campo | Rol conceptual |
|---|---|
| `temp` | Escala la distribución; 0 tiende a greedy/determinista |
| `top_k` | Limita candidatos a los K más probables |
| `top_p` | Nucleus sampling — masa acumulada de probabilidad |
| `seed` | Semilla para reproducibilidad cuando el backend la respeta |
| `predict` | Máximo de tokens nuevos a generar |

**No confundas:** cambiar `temp` altera **selección**, no el conocimiento almacenado en los pesos. Tampoco prometas reproducibilidad total sin controlar todos los factores relevantes.

---

## Experimento predictivo: sampling

Antes de correr `examples/02-sampling-experiment.ts`, escribe:

1. Mismo prompt, `seed: 42`, `temp: 0` vs `temp: 1.0` — ¿salida idéntica?
2. Si tok/s es similar, ¿qué cambió realmente?
3. ¿Qué variable mantuviste constante además de temp?

Después compara JSON. La lección no es "temp alta = creatividad"; es "temp alta = más variabilidad en la selección de tokens".

---

## Contexto

`history` en `completion()` no es decoración — **es parte del input de inferencia**. Todo lo que entra en la ventana debe procesarse antes de generar la respuesta a la última pregunta:

```text
system / template (interno al runtime)
+
conversation history
+
retrieved context (RAG — Clase 6)
+
tool results (clases posteriores)
+
current user message
+
generation budget (predict)
=
presión finita de contexto
```

History más larga implica más trabajo de **prompt processing** antes del primer token de respuesta. Eso puede aumentar TTFT aunque el tok/s de decode se mantenga similar. **No afirmes una relación lineal universal** — mide en tu caso.

En `examples/03-context-experiment.ts` comparamos proxy de aplicación (message count, character count) porque no inventamos APIs de token count.

---

## TTFT

**Time To First Token** — tiempo desde que inicias la request hasta el primer output visible (`contentDelta`).

Antes del primer token ocurre, entre otras cosas:

- serialización/envío al worker (cliente)
- tokenización del prompt
- evaluación del prompt (prefill / attention sobre el contexto existente)
- primer paso de decode + sampling

TTFT explica la "espera en silencio" del usuario. Es la métrica clave de **responsividad percibida** al inicio.

---

## Tokens por segundo

**Throughput de decode** — qué tan rápido llegan tokens *después* del primero. QVAC expone esto vía `final.stats.tokensPerSecond` y eventos `completionStats`.

Describe la fase de **generación sostenida**, no la espera inicial.

---

## Latencia total

La duración wall-clock de la request incluye:

```text
TTFT + (tokens generados / throughput efectivo) + overhead de cliente/stream
```

Dos configs con el mismo tok/s pueden tener latencia total muy distinta si difieren en TTFT o en cuántos tokens producen (`predict`, stop temprano por `eos`).

Regla de oro:

```text
TTFT ≠ total latency ≠ tokens/sec
```

---

## KV cache

En conversaciones multi-turn, re-evaluar todo el history desde cero en cada mensaje es costoso. El **KV cache** guarda **attention state** (keys/values) ya computado para prefijos compatibles, para que el follow-up procese principalmente material nuevo.

```text
Turn 1 history
    ↓
attention state computed
    ↓
cache stored
    ↓
Turn 2 extiende history
    ↓
reuse compatible previous state
    ↓
process primarily new tokens
```

**KV cache NO es:**

- una base de datos de memoria conversacional semántica;
- RAG ni almacenamiento de largo plazo;
- garantía de speedup dramático en prompts diminutos.

### Modos en QVAC (v0.18.x)

| Valor de `kvCache` | Comportamiento |
|---|---|
| `false` / `undefined` | Sin cache (default) |
| `true` | Auto-cache gestionado por SDK (clave derivada del history) |
| `"mi-sesion-123"` | Cache caller-managed; identidad de sesión explícita |

Caches auto: retención documentada (24 h idle, cuotas de disco). Caches con clave string: limpiables con `deleteCache({ kvCacheKey })`.

Para follow-ups, construye `history` incluyendo turnos previos; usa `final.cacheableAssistantContent` cuando el runtime lo exponga para contenido cacheable.

---

## Caller-managed vs SDK-managed cache

**SDK-managed (`kvCache: true`):** conveniente para una sesión; no controlas la clave para cleanup manual.

**Caller-managed (string):** tú defines identidad de sesión — crítico si multiplexas usuarios o reinicias conversaciones. Permite `deleteCache({ kvCacheKey, modelId? })`.

Error común: reutilizar clave de sesión con history incompatible → comportamiento inesperado o cache miss. La identidad de sesión debe alinearse con el history que extiendes.

---

## Under the hood (sin ecuaciones)

Tres fases útiles para razonar:

1. **Prompt evaluation (prefill):** procesa tokens de entrada; costo crece con contexto.
2. **Attention state:** lo que KV cache intenta reutilizar en turnos compatibles.
3. **Decode loop:** un token nuevo por iteración autoregresiva hasta stop.

No necesitas las ecuaciones de atención para diseñar experimentos — necesitas saber **qué fase** afecta cada knob.

---

## Profiler

QVAC expone un **profiler process-wide** del SDK:

```ts
import { profiler } from "@qvac/sdk";

profiler.enable({
  mode: "verbose",
  includeServerBreakdown: true,
  includeResourceGauges: true,
  operationFilters: ["completion"],
});
// ... operaciones ...
console.log(profiler.exportSummary());
profiler.disable();
profiler.clear();
```

Tres capas de evidencia — no las mezcles:

| Fuente | Qué mide |
|---|---|
| `completionStats` / `final.stats` | Stats de esa generación (tok/s, tokens) |
| Profiler (`exportTable`, `exportJSON`) | Timing agregado por operación RPC/handler |
| Resource gauges (opt-in) | Señales de recursos cuando el backend las soporta |

El profiler añade overhead diagnóstico. Es evidencia **local y contextual**, no benchmark universal de QVAC.

---

## Worked example

Corre mentalmente `examples/01-streaming-events.ts`:

1. `loadModel` — modelo residente.
2. `completion({ stream: true })` — inicia run.
3. Primer `contentDelta` — marca TTFT observado.
4. Más `contentDelta` — decode en curso.
5. `completionStats` — runtime reporta tok/s.
6. `completionDone` — stream cerrado.
7. `await run.final` — texto completo + stopReason + stats agregadas.

Pregunta de checkpoint: ¿qué pasó **antes** del primer `contentDelta`?

---

## Build: Inference Benchmark Lab

El lab (`lab/starter/inference-lab-starter.ts`) consolida:

- baseline streaming medido;
- comparación de sampling;
- contexto corto vs largo;
- KV cache cached vs uncached;
- Break It con `predict` limitado.

Completa los 6 TODO y produce reporte JSON con `--json`.

---

## Break It

**Escenario:** prompt pide respuesta larga; `generationParams.predict` es intencionalmente bajo (p. ej. 8).

**Predicción antes de ejecutar:**

- ¿Qué evento confirma el fin?
- ¿Qué `stopReason` esperas?

**Evidencia:**

- `completionDone`
- `final.stopReason` (típicamente `"length"`)
- contenido parcial truncado
- stats

**Transferencia:** contrasta con `"eos"` (fin natural), `"cancelled"` (cancel explícito) y `"error"` (fallo real).

---

## Measure It

Mínimo en tu Inference Experiment Report:

| Medición | Cómo obtenerla |
|---|---|
| TTFT | wall-clock al primer `contentDelta` |
| Duración total | wall-clock request start → `final` |
| tok/s | `final.stats.tokensPerSecond` |
| stopReason | `final.stopReason` |
| Condición history | message/char proxy o conteo verificado |
| Modo cache | `kvCache` usado |

Etiqueta siempre resultados como **de tu máquina**.

---

## Misconcepciones comunes

1. **"Streaming hace que el modelo genere más rápido."** — No; expone progreso. tok/s del runtime puede ser idéntico con o sin streaming UX.
2. **"tok/s cuenta toda la historia de latencia."** — No; ignora TTFT y tiempo de prefill.
3. **"Subir temperature cambia lo que el modelo sabe."** — No; cambia cómo elige entre tokens probables.
4. **"Si cabe en contexto, es gratis."** — No; más contexto = más trabajo de procesamiento.
5. **"KV cache = el modelo recuerda toda la conversación para siempre."** — No; reutiliza estado de atención compatible, con límites de retención y cuota.
6. **"Mismo modelo = misma velocidad en todos los dispositivos."** — Falso; backend, RAM, GPU/CPU y carga del sistema cambian todo.

---

## Conexiones de arquitectura

**Hacia atrás (Clase 2):** el modelo cargado es un artefacto GGUF con lifecycle; hoy observamos qué hace **residente en memoria**.

**Hacia adelante:**

- **Clase 4 — Offline Chat:** convierte estos primitivos en app persistente con history y UX.
- **Clase 6 — RAG:** consume presupuesto de contexto con chunks recuperados; la misma ventana finita de hoy.

---

## Checkpoint

Responde antes de revisar soluciones en `assessment/checkpoint.md`:

1. ¿Por qué TTFT no es lo mismo que tok/s?
2. Stream a los 800 ms, luego decode lento — ¿qué métrica describe cada fase?
3. ¿Por qué streaming puede hacer sentir la app más rápida sin cambiar tok/s?
4. ¿Cuándo puede ayudar KV cache en un follow-up?
5. ¿Por qué KV cache no es RAG ni memoria de largo plazo?
6. `stopReason: "length"` — ¿falló necesariamente el modelo?
7. Mismo tok/s, TTFT muy distinto — dos causas plausibles a investigar.
8. Diseña un experimento controlado para probar si el tamaño de contexto afecta responsividad.

---

## Takeaway

> **La inferencia es un proceso con fases observables, no una llamada API opaca.**

Sales de esta clase cuando puedes separar prompt latency de decode throughput, leer el event stream, razonar sobre contexto y KV cache, diagnosticar stop reasons, y **diseñar un experimento antes de afirmar rendimiento**.

---

## Fuentes utilizadas

- QVAC Text Generation: https://docs.qvac.tether.io/ai-capabilities/text-generation/
- QVAC API Summary v0.18.x: https://docs.qvac.tether.io/reference/api/
- QVAC Profiler: https://docs.qvac.tether.io/runtime/profiler/
- QVAC How It Works: https://docs.qvac.tether.io/about/how-it-works/
- QVAC Release Notes: https://docs.qvac.tether.io/reference/release-notes/
- llama.cpp (contexto general): https://github.com/ggml-org/llama.cpp
- Prompt pack de autoría (local, gitignored): `_internal/prompts/class-03-local-inference-fundamentals-prompt-pack.md`

## Nota de frescura / versión

Verificado contra `@qvac/sdk@0.18.1` y documentación QVAC el 2026-08-25. Superficie canónica: `events` + `final`. Parámetros de generación: `temp`, `top_k`, `top_p`, `seed`, `predict` (no usar `temperature`). Revalidar release notes antes de impartir.
