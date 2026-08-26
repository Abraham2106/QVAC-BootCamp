# Rubric — Clase 4: Build the Offline Chat

> 8 criterios · escala 1–4 · ligada a evidencia observable del Offline Chat v1.

| Nivel | Descripción |
|---|---|
| 1 | No demuestra comprensión; artefacto ausente o no ejecutable |
| 2 | Parcial; confunde estado de app vs runtime |
| 3 | Competente; pasa mayoría de acceptance tests con evidencia |
| 4 | Exemplar; defiende políticas de estado con diagnóstico Break It |

## Criterio 1 — Tres ciclos de vida

| 1 | 2 | 3 | 4 |
|---|---|---|---|
| No distingue model/request/conversation | Nombra uno o dos | Explica tres con ejemplo | Diagrama ownership app vs QVAC |

## Criterio 2 — Multi-turn history

| 1 | 2 | 3 | 4 |
|---|---|---|---|
| Single-turn only | History manual incorrecta | Follow-up funciona | Explica por qué app debe pasar history |

## Criterio 3 — Streaming + commit boundary

| 1 | 2 | 3 | 4 |
|---|---|---|---|
| No stream | Stream sin distinguir provisional | Commit solo tras final | Política documentada por stopReason |

## Criterio 4 — Cancelación

| 1 | 2 | 3 | 4 |
|---|---|---|---|
| No implementada | Cancel crashea app | Cancel limpia sin commit parcial | Distingue cancel vs error vs length |

## Criterio 5 — Persistencia

| 1 | 2 | 3 | 4 |
|---|---|---|---|
| Sin persist | Save sin schema | Restore tras restart | Validación + atomic write |

## Criterio 6 — Offline restart

| 1 | 2 | 3 | 4 |
|---|---|---|---|
| No probado | Falla sin explicación | Pasa con modelo provisionado | Documenta precondición exacta |

## Criterio 7 — Métricas por turno

| 1 | 2 | 3 | 4 |
|---|---|---|---|
| Sin métricas | Solo duración | TTFT + stopReason | Tabla comparativa turno normal vs cancelado |

## Criterio 8 — Break It diagnosticado

| 1 | 2 | 3 | 4 |
|---|---|---|---|
| No intentado | Bug sin diagnóstico | Identifica provisional vs committed | Fix con commit boundary explícita |

## Umbral de aprobación sugerido

Nivel ≥3 en criterios 1–6; ≥2 en 7–8.
