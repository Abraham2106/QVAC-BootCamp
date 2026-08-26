# Lab — Offline Chat Application Lab

> Duración estimada: 75–90 min dentro del bloque guiado.
> Medio: **TypeScript CLI modular** — aplicación con ciclo de vida completo, no un script de una sola completion.

## Goal

Construir **Offline Chat v1**: CLI que carga historial persistido, reutiliza un modelo, ejecuta turnos con streaming, commitea solo tras éxito, soporta cancelación y sobrevive a restart + modo avión.

## Outcomes ejercitados

- Tres ciclos de vida (modelo, request, conversación) — Outcomes 1–3
- Commit boundary y cancelación — Outcomes 4–6
- Persistencia y restore — Outcomes 7–8
- Métricas y shutdown — Outcomes 11–12
- Airplane-mode verification — Outcome 13

## Prerequisitos

- Clases 1–3 completadas; modelo ligero provisionado
- Ejemplos `01–06` corridos al menos una vez

```bash
cd app
npm init -y && npm pkg set type=module
npm i @qvac/sdk && npm i -D tsx
```

## Arquitectura de referencia

```text
app/src/
  index.ts       — startup, chat loop, comandos /exit /cancel /new
  chat.ts        — orquestación de un turno (events/final + commit)
  history.ts     — tipos y helpers de historial comprometido
  persistence.ts — load/save JSON local
  metrics.ts     — TTFT, duración, stats por turno
  shutdown.ts    — señales, cancelación activa, unload/close
```

## Estado inicial

Los módulos en `app/src/` incluyen esqueletos con **TODO** marcados. Completa cada módulo siguiendo la lección y los ejemplos incrementales.

---

## Parte 1 — Worked Example (examples/)

Corre en orden:

1. `01-single-turn.ts` — una completion aislada
2. `02-multi-turn.ts` — history explícita en el request
3. `03-streaming.ts` — render incremental
4. `04-cancellation.ts` — `requestId` + cancel
5. `05-persistence.ts` — save/load transcript
6. `06-restart-offline.ts` — simulación de restart sin red

## Parte 2 — Modify

Completa los TODO en `app/src/` hasta que el CLI pase los acceptance tests A–G del README de clase.

## Parte 3 — Predict (escríbelas ANTES)

| # | Pregunta | Tu predicción |
|---|----------|---------------|
| P1 | Si cancelas tras 40 chars streamados, ¿deben persistirse como turno completo? | |
| P2 | ¿El modelo "recuerda" el chat sin que la app pase history? | |
| P3 | Tras restart sin red, ¿qué falla primero: modelo o transcript? | |
| P4 | ¿Streaming implica que el output ya es estado durable? | |
| P5 | ¿Cancelación y error inesperado deben tratarse igual en la UI? | |

## Parte 4 — Run and Observe

Ejecuta el chat completo. Documenta cada acceptance test con evidencia (captura o log).

## Parte 5 — Break It

Usa la variante defectuosa descrita en la lección: persistir output parcial durante el stream, cancelar a mitad, restart, inspeccionar transcript.

| Evidencia | Capturada |
|-----------|-----------|
| Output parcial en pantalla | |
| Contenido en archivo persistido | |
| Estado tras restart | |
| Diagnóstico (provisional vs committed) | |

## Parte 6 — Measure It

| Métrica | Turno 1 | Turno 2 | Turno cancelado |
|---|---|---|---|
| TTFT | | | |
| Duración total | | | |
| tok/s | | | |
| stopReason | | | |

## Parte 7 — Airplane Mode

1. Provisiona modelo con red
2. Cierra app con transcript guardado
3. Desactiva red
4. Restart → restore → nueva completion

## Extension

Implementa `/new` para iniciar conversación limpia sin borrar el modelo cargado.
