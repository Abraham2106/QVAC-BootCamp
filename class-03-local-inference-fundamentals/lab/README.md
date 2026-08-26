# Lab — Inference Benchmark Lab

> Duración estimada: 75–90 min dentro del bloque guiado.
> Medio: **TypeScript CLI** — experimentos repetidos con JSON importable para tablas.

## Goal

Construir `inference-lab`: un script que ejecuta el pipeline experimental de la clase —
streaming baseline, sampling, contexto, KV cache y Break It — e imprime un reporte
estructurado. Es tu banco de pruebas local antes del Inference Experiment Report.

## Outcomes ejercitados

- Event-stream literacy (Outcome 5–6)
- Sampling y contexto como variables controladas (Outcomes 4, 8–9)
- KV cache y medición (Outcomes 10–13)
- Diagnóstico de stopReason (Outcome 14)

## Prerequisitos

- Clases 1–2 completadas; modelo ligero provisionado
- Ejemplos `01–05` corridos al menos una vez

```bash
mkdir inference-lab && cd inference-lab
npm init -y && npm pkg set type=module
npm i @qvac/sdk && npm i -D tsx
cp ../examples/*.ts .   # o enlaza al repo del bootcamp
cp starter/inference-lab-starter.ts .
```

## Estado inicial

`starter/inference-lab-starter.ts` con **6 TODO** + auto-verificación (`✔ INFERENCE LAB OK`).

---

## Parte 1 — Worked Example

Corre `examples/01-streaming-events.ts` en vivo. Pausa en el **primer** `contentDelta`:

> ¿Qué ya ocurrió antes de ver este texto?

Luego `02` → `03` (guarda JSON) → `04` → `05`.

## Parte 2 — Modify

Completa el starter hasta pasar la auto-verificación.

## Parte 3 — Predict (escríbelas ANTES)

| # | Pregunta | Tu predicción |
|---|----------|---------------|
| P1 | ¿Streaming acelera tok/s del runtime? | |
| P2 | temp 0 vs temp 1.0 (misma seed): ¿texto idéntico? | |
| P3 | History larga vs corta: ¿qué métrica cambia más, TTFT o tok/s? | |
| P4 | Follow-up con KV cache: ¿siempre TTFT menor? | |
| P5 | `predict: 8` con prompt que pide ensayo largo: ¿stopReason? | |

## Parte 4 — Run and Observe

Corrida completa del starter + importa JSON de `02` y `03` en tu reporte.

## Parte 5 — Break It

Usa `generationParams.predict` bajo (p. ej. 8) con un prompt que pida respuesta larga.

| Evidencia | Capturada |
|-----------|-----------|
| `completionDone` | |
| `final.stopReason` | |
| Contenido parcial | |
| stats | |

**Pregunta:** ¿Falló el modelo o obedeció un límite configurado?

## Parte 6 — Measure It

| Métrica | Baseline | Tras cambio (una variable) |
|---|---|---|
| TTFT observado (ms) | | |
| Duración total (ms) | | |
| tok/s (runtime) | | |
| stopReason | | |
| Modo KV cache | | |
| History proxy (msgs/chars) | | |

## Parte 7 — Independent Extension

Añade flag `--json`: el reporte final también en JSON estable para CI o Notebook.

## Reflection

- ¿Qué afectó TTFT? ¿Qué afectó throughput?
- ¿Qué cambió el cache? ¿Qué es específico de tu máquina?
- ¿Qué probarías a continuación con **una** variable?

## Entregable

Carpeta `inference-lab/` con: `predictions.md`, salida del starter, JSON de experimentos,
tabla predicción vs observación, y borrador del Inference Experiment Report.
