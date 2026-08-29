# Technical Summary — Class Local Inference Fundamentals

## 1. Technical Sheet

- **Session topic:** Token-by-token generation, sampling, context and runtime observability.
- **Key concepts:** tokenization; logits; prefill; decode; softmax; temperature; top-k; top-p; KV cache; TTFT; tokens per second.
- **Tools / Frameworks:** QVAC completion event stream, final result, profiler and cache controls.
- **Position in the bootcamp:** Makes the loaded model observable before the chat application is built.

## 2. Synopsis

A completion tokenizes history, processes a prompt, scores candidate tokens and emits selected tokens incrementally. The class distinguishes time to first token from sustained decode throughput and treats sampling as an explicit decision policy rather than a creativity switch.

## 3. Subtopic Breakdown

### 1. Prefill and decode

prompt processing and next-token generation have different cost profiles.

### 2. Sampling

logits become probabilities; temperature and candidate limits alter selection.

### 3. KV cache

compatible attention work can be reused but history remains application state.



### Conceptual Foundation

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

### Extended Technical Discussion

#### Del texto al siguiente token

El runtime no recibe palabras directamente: el tokenizer transforma texto en IDs. Durante el
**prefill**, el modelo procesa los tokens del prompt y construye estado de attention. En cada paso
de **decode**, produce logits para el siguiente token, aplica una política de sampling, emite uno y
repite. La interfaz que parece devolver “un string” está observando un proceso incremental con
perfiles de costo distintos.

TTFT incluye el trabajo previo al primer token observable: preparación, tokenización, prefill,
cola y overhead del runtime. `tokensPerSecond` describe principalmente el ritmo de decode. Una
respuesta puede tener TTFT excelente y decode lento, o TTFT alto y después fluir rápidamente. No
mezcles ambas métricas en un solo número de “velocidad”.

#### Sampling: puntuaciones no son probabilidades

El modelo produce logits `z_i`, no decisiones terminadas. Softmax crea una distribución:

```text
p_i = exp(z_i / T) / sum_j exp(z_j / T)
```

Con `T` baja se amplifican diferencias entre logits; con `T` alta la distribución se aplana.
Esto modifica la selección entre opciones puntuadas, no hace que el modelo “sepa más”. Greedy
elige la mayor probabilidad; top-k limita candidatos; top-p selecciona una masa acumulada. Cada
política debe evaluarse en la tarea y con controles adecuados.

#### KV cache, contexto y streaming

La KV cache guarda representaciones de tokens anteriores para evitar recalcular prefijos
compatibles. Puede mejorar follow-ups, pero consume memoria según capas, dimensiones, dtype y
contexto. No sustituye el historial de aplicación ni garantiza cache hit si cambian history, clave
o configuración.

La context window es un presupuesto para instrucciones, historial y salida. “Cabe” no significa
gratis: prompts mayores suelen aumentar prefill y cache. Streaming no acelera mágicamente decode;
expone progreso antes del texto final. Por eso los eventos son provisionales y `final`,
`stopReason` y stats son el contrato de observabilidad.

#### Para estudiar y defender

1. Predice qué ocurre con TTFT y tok/s si duplicas solo la longitud del prompt.
2. Explica cómo cambia softmax al reducir temperatura para tres logits diferentes.
3. Explica por qué un cache reduce cálculo sin convertir el chat en persistente.
4. Diseña un experimento que pruebe UX de streaming sin afirmar más throughput.

---

## 4. Points of Confusion and Corner Cases

- TTFT is not total latency or tokens per second.
- Streaming exposes progress; it does not automatically increase model throughput.
- A length stop reason can be an intended output limit.

## 5. Study Questions

1. What changes if only prompt length doubles?
2. Why does temperature not add knowledge?
3. Why is KV cache not durable conversation memory?

## Source Material

- [Canonical lesson](../class-03-local-inference-fundamentals/lesson.md)
- **Module:** Módulo 1
