# Checkpoint — Clase 06

1. ¿Qué diferencia hay entre memoria paramétrica y conocimiento externo recuperable?
2. ¿Por qué `ragSearch()` debe inspeccionarse antes de llamar al LLM durante debugging?
3. Describe el tradeoff entre chunks demasiado pequeños y demasiado grandes.
4. El chunk correcto está Top-1, pero la respuesta contradice su contenido. ¿Qué etapa investigarías primero y por qué?
5. La respuesta es incorrecta y el documento relevante no aparece en Top-K. ¿Qué hipótesis investigarías?
6. ¿Por qué no existe un score threshold o Top-K universal para todos los corpora/modelos?
7. Diseña un Unknown Knowledge Test que detecte provenance inventada.
8. Si la latencia total sube, ¿qué etapas medirías por separado?

## Respuestas del instructor

1. Los pesos contienen conocimiento paramétrico; RAG conserva información fuera de los pesos y la recupera en query-time.
2. Porque permite separar retrieval failure de generation/grounding failure.
3. Pequeños: contexto fragmentado; grandes: más ruido/menor especificidad y más contexto downstream.
4. Grounding/generation, porque retrieval ya entregó evidencia correcta.
5. Corpus, chunking, query, modelo de embeddings, Top-K, metadata/filtros o workspace.
6. La distribución de scores depende del modelo, corpus, query y configuración.
7. Pregunta explícitamente por un dato ausente; verifica Top-K y que la respuesta no cree una fuente inexistente.
8. Retrieval/query embedding/vector search, TTFT y generation total; ingest si está indebidamente en query-time.