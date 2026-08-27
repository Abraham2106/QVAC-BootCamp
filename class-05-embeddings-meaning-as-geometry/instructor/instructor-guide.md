# Instructor Guide — Clase 05

## Teaching goal

El alumno debe dejar de pensar “semantic search = magia” y empezar a inspeccionar `query → vector → similarity → ranking`.

## Misconcepción principal

Un score alto no es verdad ni relevancia humana garantizada.

## No sobre-explicar todavía

No enseñar RAG completo, chunking gestionado, vector-store lifecycle ni grounding. Eso pertenece a Clase 06.

## Timing sugerido

- 0–15 min: hook + embeddings vs keyword search
- 15–35: vector mental model + cosine
- 35–50: QVAC `embed()` demo
- 50–75: guided search
- 75–85: break
- 85–110: ranking experiments
- 110–130: Break It ambiguo
- 130–165: independent challenge
- 165–180: checkpoint + transición

## Predicciones

Detén la clase antes de: primer ranking, cambio de query y caso `apple performance`.

## Pre-class checklist

- verificar v0.18.x docs/release notes;
- verificar `GTE_LARGE_FP16` o el modelo elegido;
- ejecutar ambos ejemplos;
- confirmar que no se inventan dimensiones: observar `embedding.length`;
- preparar corpus alternativo en español si el grupo trabaja principalmente en español.

## Mastery

El estudiante puede explicar por qué un resultado subió/bajó en ranking, qué evidencia tiene y qué probaría después.

## Transition

“Ahora sabemos representar y comparar significado. Clase 06 añade persistencia, chunking, retrieval y generación grounded para convertir esto en conocimiento privado.”