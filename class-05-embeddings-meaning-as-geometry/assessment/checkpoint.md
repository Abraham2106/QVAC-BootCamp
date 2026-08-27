# Checkpoint — Clase 05

1. Explica por qué un embedding no es una respuesta generativa.
2. ¿Qué diferencia hay entre `embed(text)` y `embed(text[])` en la API actual de QVAC?
3. ¿Por qué documentos y query deben representarse con el mismo modelo/espacio vectorial?
4. Una query obtiene score alto contra un documento incorrecto. Da cuatro hipótesis que investigarías.
5. ¿Qué parte del semantic search de esta clase es lógica de aplicación y no API de QVAC?
6. Si el usuario dice “la búsqueda está lenta”, ¿qué tiempos separarías antes de optimizar?
7. Diseña una prueba que permita distinguir una query ambigua de un corpus insuficiente.

## Respuestas del instructor

1. `embed()` representa texto como vector; no ejecuta el bucle generativo de un LLM.
2. Un string produce un vector `number[]`; un array de strings produce `number[][]` según la API v0.18.x.
3. Espacios de modelos distintos no deben asumirse comparables.
4. Ambigüedad de query, corpus pobre, dominio/idioma, modelo, métrica, Top-K, preprocessing.
5. En el lab: cosine similarity, ordenamiento, Top-K y UX de resultados.
6. Load, corpus embedding si ocurre en query-time, query embedding y ranking.
7. Mantener corpus fijo y reformular la query con intención explícita; después mantener query y mejorar corpus, comparando rankings.