# NotebookLM Detailed Slide Deck — Clase 3

> Pega este prompt en NotebookLM con SOLO las fuentes enfocadas de esta clase.

---

Genera un Detailed Slide Deck para:

**Local Inference Fundamentals** (The Local-First AI Systems Masterclass)

Narrativa visual:

```text
prompt → token → loop → stream → context → cache → measurement
```

Fuentes: lesson Clase 3, QVAC Text Generation, API Summary, Profiler, How It Works, release notes v0.18.x.

Idioma: español con términos técnicos en inglés.
Diagramas progresivos, no muros de texto.

Diapositivas obligatorias:

1. Text ≠ tokens
2. Autoregressive generation loop
3. Before first token (prefill)
4. TTFT
5. QVAC CompletionRun — events + final
6. contentDelta → completionStats → completionDone
7. Sampling intuition (temp / top_k / top_p)
8. Context pressure / growing history
9. KV-cache reuse mental model
10. Cached vs uncached follow-up
11. TTFT vs throughput vs total latency
12. Profiler (stats vs operation profiler vs gauges)
13. What happens when generation hits predict limit? (stopReason length)
14. Common misconceptions
15. Connection to Offline Chat (Clase 4)

Incluye explícitamente:

- **Predict Before We Run**
- **Watch the Event Stream**
- **Break It**
- **Measure the System, Not Your Intuition**

No inventes valores de benchmark universales.

Cierra con **3 preguntas de razonamiento** (TTFT vs tok/s; KV cache scenario; diseño experimental).

## Fuentes utilizadas

- Prompt pack §31

## Nota de frescura / versión

2026-08-25 · API canónica events/final
