# Lab — Model Explorer

> Duración estimada: 60–75 min dentro del bloque guiado.
> Medio: **TypeScript CLI real** — es una utilidad de ciclo de vida, no un experimento de notebook.

## Goal

Construir `model-explorer`: una CLI que lista el catálogo, reporta metadata/caché de un modelo,
lo carga midiendo el tiempo, genera con parámetros deterministas, lo descarga, repite con una
segunda variante y imprime una tabla comparativa — tu herramienta de elección de modelos.

## Outcomes ejercitados

- Anatomía + nombres de modelo (Outcomes 1, 4) — leyendo metadata real
- Ciclo de vida completo gestionado explícitamente (Outcome 5)
- Comparación medida + justificación (Outcome 6)

## Prerequisitos

- Clase 1 completada; `qvac doctor` passing
- ~2–3 GB libres (dos modelos pequeños de catálogo)

```bash
mkdir model-explorer && cd model-explorer
npm init -y && npm pkg set type=module
npm i @qvac/sdk && npm i -D tsx
```

## Estado inicial

`starter/model-explorer-starter.ts` con 6 TODO + auto-verificación.

---

## Parte 1 — Worked Example

Corre los tres ejemplos de `examples/` en orden. Objetivo: ver registry → comparación → reporte de memoria antes de escribir código.

## Parte 2 — Modify

Completa el starter hasta `✔ EXPLORER OK`.

## Parte 3 — Predict (escríbelas ANTES)

1. 600M vs 1B: ¿cuál carga más rápido? ¿cuál genera más tok/s? ¿por qué?
2. Segunda corrida del mismo modelo: ¿qué métrica cambia más, carga o generación?
3. `ctx_size: 32768` con tu RAM: ¿falla en carga o en inferencia?
4. Si el registro está caído: ¿qué parte del explorer sigue funcionando?

## Parte 4 — Run and Observe

Corrida completa con ambos modelos. Guarda la salida completa.

## Parte 5 — Break It (predice primero; unloadModel ENTRE intentos)

| # | Acción | Tu predicción |
|---|--------|---------------|
| B1 | `ctx_size: 32768` en tu máquina | |
| B2 | Cargar un modelo mayor a tu RAM disponible (elige según `03-memory-report`) | |
| B3 | Registro caído (desconecta red) + constante SIN caché | |
| B4 | `modelSrc` = ruta local a un archivo de texto truncado con `modelType: "llamacpp-completion"` | |

**Regla de seguridad:** entre intentos, `unloadModel` + verifica con `getSystemResources` que la memoria volvió. No dejes modelos residentes acumulándose: el worker es compartido.

## Parte 6 — Diagnose

Por cada B: ¿fase (find/download/load/infer)? ¿red, disco o memoria? ¿el mensaje lo dice explícitamente o lo inferiste?

## Parte 7 — Measure It

| Métrica | Modelo A | Modelo B |
|---|---|---|
| Tamaño en disco (MB) | | |
| Carga fría / tibia (s) | | |
| TTFT (s) | | |
| tok/s | | |
| Memoria disponible antes/durante (GB) | | |

## Parte 8 — Independent Extension

Añade flag `--json`: la tabla comparativa también en JSON estable (para CI o para el Report).

## Reflection

- ¿Qué esperabas? ¿Qué pasó? ¿Qué evidencia lo sostiene?
- ¿Qué cambiaría en una máquina con la mitad de RAM?
- ¿Qué le dirías a un compañero que quiere "siempre el modelo más grande que quepa"?

## Entregable

`model-explorer/` con: `predictions.md`, salida completa, tabla de métricas, diagnósticos, script final con `--json`.
