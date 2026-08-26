# NotebookLM Audio Overview — Clase 2

> Pega este prompt en NotebookLM con SOLO las fuentes enfocadas de esta clase seleccionadas.

---

Crea un Audio Overview en formato Deep Dive / Análisis detallado sobre:

**Clase 2 — Models, GGUF and the QVAC Lifecycle** (The Local-First AI Systems Masterclass)

Usa ÚNICAMENTE las fuentes seleccionadas de esta clase:
- QVAC Download lifecycle
- QVAC Text generation
- QVAC System requirements
- QVAC Release notes v0.18.x
- Repositorio llama.cpp / GGUF (ecosistema)
- Currículo canónico, Capítulo 4

Audiencia: developers aprendiendo sistemas de IA local-first.
Idioma: español; conserva términos técnicos en inglés: GGUF, tensors, tokenizer, Q4_K_M, KV-cache, TTFT, checkpoint, INST, runtime.

No resumas documentación: construye una conversación técnica alrededor de:

1. ¿Qué problema resuelve entender la anatomía del modelo?
2. ¿Qué es el concepto independiente de QVAC? (pesos/tensors/tokenizer/metadata; checkpoint ≠ formato de inferencia)
3. ¿Cómo lo expone QVAC hoy? (constantes = punteros al registro; modelRegistryList/Search; getModelInfo; tres fuentes de modelos)
4. ¿Qué pasa under the hood? (qué reserva la carga: pesos + contexto; por qué Q4 cabe donde F16 no; un worker compartido)
5. ¿Qué debe predecir el estudiante antes del experimento? (600M vs 1B: carga, tok/s, calidad)
6. ¿Qué construirá? (Model Explorer + Model Selection Report)
7. ¿Qué fallo deliberado importa? (modelo mayor a la RAM; ctx_size enorme; registro caído con caché válida)
8. ¿Qué medición importa y por qué? (disco, carga, memoria, TTFT, tok/s)
9. ¿Las tres misconceptions más comunes? (más grande = mejor; Q4 destruye calidad; el GGUF se ejecuta solo)
10. ¿Cómo conecta hacia atrás (Clase 1: la caja negra) y hacia adelante (Clase 3: mecánica de la inferencia)?

Usa explicaciones causales: anatomía → recursos → comportamiento → fallo.
Nunca inventes comportamiento actual de QVAC.

Cierra con: "¿Qué deberías poder explicar ahora sin mirar la documentación?"
