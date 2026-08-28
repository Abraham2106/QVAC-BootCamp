# Lab — Transparent Local RAG Debugger

**Duración:** 90 min

## Objetivo

Construir RAG sin esconder etapas. Debes ver retrieval **antes** de generation y poder responder: “¿falló retrieval o falló generation?”

## Parte 1 — Corpus

Crea 8–15 notas pequeñas con una fuente/ID mantenida por tu aplicación.

## Parte 2 — Prediction

Antes de buscar, escribe qué nota debería aparecer Top-1 para una pregunta conocida.

## Parte 3 — Ingest

Carga el modelo de embeddings e ingesta el corpus en un workspace mediante `ragIngest()`.

Registra ingest time. No lo mezcles con query-time latency.

## Parte 4 — Retrieval

Ejecuta `ragSearch({ modelId, workspace, query, topK: 3 })`.

Imprime:

- rank;
- `score`;
- `content`;
- source/ID que tu aplicación pueda resolver honestamente.

No llames al LLM todavía.

## Parte 5 — Diagnosis gate

Pregunta:

> ¿La evidencia necesaria está en Top-K?

Si NO, detente. Ese es un retrieval problem. Cambiar el prompt generativo no repara documentos ausentes.

## Parte 6 — Grounded generation

Construye un bloque EVIDENCE y pide al LLM responder solo con esa evidencia. Incluye una política explícita para evidencia insuficiente.

Mide retrieval y generation por separado.

## Parte 7 — Unknown Knowledge Test

Haz una pregunta cuya respuesta no exista en el corpus. Registra:

- Top-K;
- scores;
- respuesta;
- si el sistema comunicó correctamente falta de evidencia.

No uses un threshold universal inventado.

## Parte 8 — Break It

Elige una sola variable:

- elimina el documento relevante;
- reduce Top-K;
- usa una query vaga;
- cambia chunking en un corpus largo.

Escribe Prediction antes de ejecutar. Después clasifica el fallo:

- retrieval;
- context construction;
- generation/grounding.

## Parte 9 — Versiona y revoca evidencia

1. Registra un `snapshotId`, modelo de embeddings, chunk policy y los IDs de los documentos.
2. Cambia un hecho en un documento, crea una nueva versión y vuelve a indexar solo la evidencia
   afectada según tu estrategia.
3. Pregunta por el hecho modificado y comprueba que no se muestra la versión anterior.
4. Elimina un documento de prueba mediante el mecanismo correspondiente a tu store y vuelve a
   ejecutar la query. Registra el resultado y no aceptes únicamente “no hubo error”.

## Parte 10 — Measure It

| Stage | Time / evidence |
|---|---:|
| ingest | |
| retrieval | |
| generation TTFT (opcional) | |
| generation total | |
| Top-K | |
| answer faithfulness | |

## Reflection

1. ¿Qué etapa resultó más fácil de observar?
2. ¿Qué error habría sido imposible de diagnosticar si ocultaras los chunks?
3. ¿Qué provenance es real y qué etiquetas añadió tu aplicación?
4. ¿Qué cambiarías para un corpus de miles de documentos?

## Fuentes

- https://docs.qvac.tether.io/ai-capabilities/rag/
- https://docs.qvac.tether.io/ai-capabilities/text-generation/
- https://docs.qvac.tether.io/reference/api/
