# Rubric — Clase 06

| Criterio | 4 — Independiente | 3 — Funcional | 2 — Procedimiento | 1 — Copia/recall |
|---|---|---|---|---|
| RAG mental model | Separa parametric/external y todas las etapas | Explica pipeline con leves huecos | Repite pipeline | Confunde RAG con training |
| Retrieval transparency | Top-K visible + razonado | Top-K visible | Retrieval escondido parcialmente | No puede inspeccionarlo |
| Grounding | Respuesta limitada por evidencia y política insuficiente | Prompt grounded funcional | Grounding débil | Responde sin evidencia |
| Provenance | Fuentes reales, trazables | IDs/fuentes correctas | Parcial | Citas inventadas |
| Diagnosis | Distingue retrieval/generation con evidencia | Clasifica correctamente | Necesita guía | No distingue etapas |
| Measurement | Separa ingest/retrieval/generation | Separa retrieval/generation | Tiempo agregado | Sin medición |
| Failure handling | Unknown + retrieval failure controlados | Un failure bien analizado | Failure sin diagnosis | No prueba fallos |
| Transfer | Defiende chunking/Top-K según caso | Reconoce tradeoffs | Generaliza | Usa constantes mágicas universales |