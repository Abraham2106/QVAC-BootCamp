# Clase 06 — Local RAG and Private Knowledge

**Módulo 2 · Private Knowledge — Own the knowledge**

> **Pregunta esencial:** ¿Cómo puede un modelo responder desde conocimiento que no vive en sus pesos?

## Al terminar podrás

- distinguir memoria paramétrica de conocimiento externo;
- construir `document → chunk → embed → store → retrieve`;
- usar el vector store gestionado de QVAC con `ragIngest()` / `ragSearch()`;
- inspeccionar Top-K antes de generar;
- construir un prompt grounded con evidencia recuperada;
- mostrar provenance visible al usuario;
- distinguir retrieval failure de generation failure;
- medir retrieval y generation por separado.

## Prerrequisito

Clase 05: embeddings, semantic similarity, ranking y Top-K.

## Mapa

```text
documents → chunk → embed → workspace
                         ↓
query → embed → Top-K retrieval
                         ↓
               grounded context
                         ↓
                    completion
```

## Entregable

**Private Notebook Assistant v1** + diagnóstico de un caso sin evidencia + un retrieval failure controlado.

## Fuentes

- https://docs.qvac.tether.io/ai-capabilities/rag/
- https://docs.qvac.tether.io/ai-capabilities/text-embeddings/
- https://docs.qvac.tether.io/ai-capabilities/text-generation/
- https://docs.qvac.tether.io/reference/api/
- https://docs.qvac.tether.io/reference/release-notes/
- https://arxiv.org/abs/2005.11401

**Baseline:** QVAC SDK v0.18.x / v0.18.1.