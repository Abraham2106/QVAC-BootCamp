# NotebookLM Audio Overview — Clase 4

> Pega este prompt en NotebookLM con SOLO las fuentes enfocadas de esta clase seleccionadas.

---

Crea un Audio Overview en formato Deep Dive / Análisis detallado sobre:

**Clase 4 — Build the Offline Chat** (The Local-First AI Systems Masterclass)

Usa ÚNICAMENTE las fuentes seleccionadas:

- Class 04 lesson.md
- QVAC Text Generation (v0.18.x)
- QVAC API Summary
- QVAC Profiler
- QVAC How It Works
- Release notes relevantes

Audiencia: developers aprendiendo sistemas de IA local-first.
Idioma: español; conserva términos técnicos en inglés: token, TTFT, throughput, KV cache, contentDelta, completionStats, stopReason, prefill, decode, sampling, events, final.

Construye este modelo mental en conversación:

```text
prompt → tokens → prompt processing → next-token prediction
→ sampling → streamed output → stop reason
```

Explora:

1. Por qué texto y tokens no son lo mismo.
2. Por qué la generación LLM es autoregresiva.
3. Qué ocurre antes del primer token visible.
4. Por qué TTFT importa para UX.
5. Por qué tok/s describe otra parte de la experiencia.
6. Qué cambia streaming y qué NO cambia.
7. Cómo sampling afecta selección de tokens.
8. Por qué context/history es trabajo computacional.
9. Qué reutiliza KV cache realmente.
10. Por qué KV cache no es memoria de largo plazo ni RAG.
11. Cómo QVAC expone completion con events/final.
12. Cómo completionStats y completionDone ayudan a observar inferencia.
13. Qué añade el profiler vs stats de completion.
14. Qué revela stopReason.
15. Por qué un benchmark no generaliza a todos los dispositivos.

Incluye misconceptions (streaming = faster model; temp = intelligence; KV cache = memory DB).

Cierra con: **"Si una app se siente lenta, ¿qué medirías exactamente antes de cambiar el modelo?"**

No inventes comportamiento de QVAC fuera de las fuentes.

## Fuentes utilizadas

- Ver lista arriba · Prompt pack §30

## Nota de frescura / versión

Prompt alineado a QVAC v0.18.x — 2026-08-25.
