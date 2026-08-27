# Challenge — Semantic Search v1

Construye una herramienta local de búsqueda semántica sobre 15–30 textos.

## Requisitos

- input de query desde CLI;
- embeddings generados localmente con QVAC;
- mismo modelo para corpus y query;
- Top-K configurable;
- score visible junto a cada resultado;
- tiempo de embedding de query visible;
- tiempo de ranking visible;
- un caso ambiguo documentado;
- cleanup correcto del modelo.

## Acceptance tests

1. Una query con vocabulario distinto al documento relevante debe recuperar al menos un resultado semánticamente razonable.
2. `--top-k 1` y `--top-k 3` deben cambiar la cantidad de resultados, no recalcular una verdad distinta.
3. La salida debe distinguir `query embedding` de `application ranking`.
4. Debes explicar un ranking inesperado sin asumir automáticamente que el modelo “falló”.

## Entregable

Incluye `Semantic Search Report` con Prediction → Observation → Explanation.

## Stretch

Compara dos formulaciones de la misma intención y analiza cuánto cambia el ranking.