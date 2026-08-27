# Lab — Semantic Search Explorer

**Duración:** 75–90 min

## Objetivo

Construir un semantic search transparente: generar embeddings, comparar una query con un corpus, ordenar Top-K y explicar un ranking inesperado.

## Parte 1 — Predice

Antes de ejecutar `examples/02-semantic-search.ts`, escribe qué tres documentos esperas recuperar para:

> `a car that runs on electricity`

## Parte 2 — Baseline

Ejecuta el ejemplo y registra:

| Métrica | Resultado |
|---|---:|
| corpus embedding ms | |
| query embedding ms | |
| application ranking ms | |
| dimensions observadas | |

No conviertas estas cifras en benchmarks universales.

## Parte 3 — Amplía el corpus

Lleva el corpus a 15–30 textos con al menos cuatro temas. Mantén frases cortas al principio para que puedas inspeccionar manualmente la relevancia.

## Parte 4 — Cambia la redacción

Haz dos queries semánticamente similares con vocabulario distinto. Compara el Top-K.

## Parte 5 — Break It

Añade textos sobre Apple como fruta y Apple como tecnología. Ejecuta:

> `apple performance`

Antes de correrla, predice la intención que crees que dominará. Después responde:

1. ¿Qué recuperó Top-1?
2. ¿El resultado es absurdo o la query es ambigua?
3. ¿Qué contexto adicional mejoraría la búsqueda?

## Parte 6 — Measure It

Separa:

- embedding del corpus;
- embedding de query;
- ranking en aplicación.

Para un corpus pequeño, el ranking puede ser trivial; eso también es evidencia.

## Parte 7 — Challenge independiente

Construye una CLI que reciba query y `--top-k`, imprima score + texto y guarde un JSON de resultados para tu reporte.

## Reflexión

- ¿Qué parte implementó QVAC?
- ¿Qué parte implementó tu aplicación?
- ¿Qué significa realmente el score?
- ¿Qué no puedes concluir del score?
- ¿Por qué esta clase todavía no es RAG?

## Fuentes

- https://docs.qvac.tether.io/ai-capabilities/text-embeddings/
- https://docs.qvac.tether.io/reference/api/
