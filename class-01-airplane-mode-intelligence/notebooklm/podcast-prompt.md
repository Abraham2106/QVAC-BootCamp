# NotebookLM Audio Overview — Clase 1

> Pega este prompt en NotebookLM con SOLO las fuentes enfocadas de esta clase seleccionadas.

---

Crea un Audio Overview en formato Deep Dive / Análisis detallado sobre:

**Clase 1 — Airplane-Mode Intelligence** (The Local-First AI Systems Masterclass)

Usa ÚNICAMENTE las fuentes seleccionadas de esta clase:
- QVAC Introduction y How it works
- QVAC Download lifecycle
- QVAC System requirements
- QVAC Text generation
- QVAC Release notes v0.18.x

Audiencia: developers aprendiendo sistemas de IA local-first.
Idioma: español; conserva términos técnicos en inglés cuando la traducción reduzca precisión: KV cache, GGUF, TTFT, Top-K, downloadAsset(), loadModel(), worker, runtime.

No resumas documentación: construye una conversación técnica de aprendizaje alrededor de:

1. ¿Qué problema de ingeniería resuelve la inferencia local?
2. ¿Qué es el concepto independiente de QVAC? (modelo local vs inferencia local vs app local-first)
3. ¿Cómo lo expone/implementa QVAC hoy? (downloadAsset, caché validada por checksum, loadModel)
4. ¿Qué pasa under the hood? (worker Bare perezoso/compartido, pesos residentes en memoria)
5. ¿Qué debe predecir el estudiante antes del experimento principal?
6. ¿Qué construirá? (Airplane-Mode Proof)
7. ¿Qué fallo deliberado importa y por qué? (borrar/mover caché, arranque sin provisionar)
8. ¿Qué medición importa y por qué? (load time, TTFT, tokens/segundo, bytes descargados)
9. ¿Cuáles son las tres misconceptions más comunes?
10. ¿Cómo se conecta hacia atrás (nada: es la primera clase) y hacia adelante (Clase 2: GGUF)?

Usa explicaciones causales: arquitectura → recursos → comportamiento → fallo.
Nunca inventes comportamiento actual de QVAC.

Cierra con: "¿Qué deberías poder explicar ahora sin mirar la documentación?"
