# NotebookLM Flashcards — Clase 4

> Pega este prompt en NotebookLM con SOLO las fuentes enfocadas de esta clase.

---

Genera flashcards difíciles para:

**Clase 4 — Build the Offline Chat**

Distribución aproximada:

- 15% foundation (token, tokenization, autoregressive)
- 25% cause/effect (sampling, context, cache)
- 20% prediction (TTFT vs tok/s; temp change; history growth)
- 15% compare (streaming UX vs decode rate; cached vs uncached)
- 15% debugging/diagnosis (stopReason; length limit; cache mismatch)
- 10% experiment design (controlled variables)

Cubrir:

token · tokenization · autoregressive generation · sampling · temp · top_k · top_p · streaming · contentDelta · completionStats · completionDone · stopReason · TTFT · tokens/sec · total latency · context · history · KV cache · profiler · events · final

Prefiere:

- "¿Por qué dos corridas pueden tener tok/s similar pero TTFT distinto?"
- "¿Qué cambia streaming desde la perspectiva del usuario?"
- "¿Por qué KV cache no es una memory database?"
- "¿Qué evidencia indica stopReason length?"
- "¿Qué mantendrías constante al probar efecto del context size?"

Respuestas: 2–5 oraciones explicativas, no una palabra.

Idioma: español, términos técnicos en inglés.
Solo fuentes seleccionadas para detalles QVAC.

## Fuentes utilizadas

- Prompt pack §32

## Nota de frescura / versión

2026-08-25
