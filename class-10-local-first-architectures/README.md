# Clase 10 — Designing Local-First Architectures

> **The Local-First AI Systems Masterclass** · Módulo 4 — Drop-in Sovereignty
> **Baseline:** QVAC SDK v0.18.x / v0.18.1. Verifica las release notes antes de impartir.

## Pregunta esencial

> ¿Qué debe correr localmente, qué puede delegarse y cómo defendemos esa frontera con evidencia?

Esta clase convierte “local-first” en una decisión arquitectónica explícita. Partimos del cliente OpenAI-compatible de la Clase 9 y diseñamos políticas de privacidad, disponibilidad, coste y calidad sin asumir que “todo local” siempre es la respuesta.

## Artefactos

| Artefacto | Propósito |
|---|---|
| [`lesson.md`](lesson.md) | Conceptos, método y ejemplo trabajado |
| [`lab/README.md`](lab/README.md) | Laboratorio guiado de ADR y fallbacks |
| [`examples/01-privacy-classifier.ts`](examples/01-privacy-classifier.ts) | Clasificador reproducible de solicitudes |
| [`examples/02-fallback-policy.ts`](examples/02-fallback-policy.ts) | Política local-first con fallback explícito |
| [`challenge/challenge.md`](challenge/challenge.md) | Diseño independiente para un producto real |
| [`solution/solution.md`](solution/solution.md) | Solución de referencia razonada |
| [`assessment/checkpoint.md`](assessment/checkpoint.md) | Checkpoint de evidencia |
| [`assessment/rubric.md`](assessment/rubric.md) | Rúbrica de evaluación |
| [`instructor/instructor-guide.md`](instructor/instructor-guide.md) | Guía de facilitación y fallos deliberados |

## Definition of Done

- [ ] ADR con decisión, alternativas, invariantes y consecuencias.
- [ ] Matriz que clasifica datos y capacidades por frontera local/remota.
- [ ] Fallback implementado con consentimiento, timeout y trazabilidad.
- [ ] Prueba de que ninguna solicitud prohibida cruza la frontera.
- [ ] Break It ejecutado: runtime local caído, timeout y respuesta de calidad insuficiente.
- [ ] Métricas comparables de latencia, disponibilidad y coste.

## Fuentes autoritativas

- https://docs.qvac.tether.io/reference/api/
- https://docs.qvac.tether.io/ai-capabilities/text-generation/
- https://docs.qvac.tether.io/reference/release-notes/
