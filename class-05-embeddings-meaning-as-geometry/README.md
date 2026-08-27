# Clase 05 — Embeddings: Meaning as Geometry

**Módulo 2 · Private Knowledge — Own the knowledge**

> **Pregunta esencial:** ¿Cómo puede una máquina encontrar significado relacionado sin buscar las mismas palabras?

## Al terminar podrás

- explicar un embedding como una representación vectorial aprendida;
- distinguir embeddings de generación de texto;
- generar embeddings locales con QVAC;
- calcular similitud coseno en código de aplicación;
- ordenar un pequeño corpus por similitud semántica;
- medir latencia de embedding y retrieval;
- diagnosticar una consulta ambigua o un ranking débil.

## Antes de clase

Debes poder cargar/reutilizar/descargar un modelo QVAC y medir operaciones básicas de inferencia. Ejecuta `qvac doctor` si forma parte de tu instalación y verifica espacio suficiente para el modelo de embeddings seleccionado.

## Mapa

`texto → embedding → vector → similitud → ranking → semantic search`

Luego:

`Predict → Run → Inspect → Break → Measure → Explain`

## Entregable

**Semantic Search Report** con corpus, query, Top-K, scores, latencia y una explicación de un caso ambiguo.

## Definition of Done

Consulta la checklist en `/class/05`.

## Fuentes

- https://docs.qvac.tether.io/ai-capabilities/text-embeddings/
- https://docs.qvac.tether.io/reference/api/
- https://docs.qvac.tether.io/about/how-it-works/
- https://docs.qvac.tether.io/reference/release-notes/
- https://github.com/ggml-org/llama.cpp

**Baseline:** QVAC SDK v0.18.x / v0.18.1. Verifica release notes antes de enseñar APIs concretas.