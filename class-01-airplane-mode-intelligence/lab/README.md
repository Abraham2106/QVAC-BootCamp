# Lab — Airplane-Mode Proof

> Duración estimada: 60–75 min dentro del bloque guiado de la clase.
> Medio elegido: **TypeScript CLI real**, NO Jupyter. Razón: es una aplicación con ciclo de vida (provisionar → cargar → inferir → descargar → cerrar), no un experimento iterativo con tablas ni gráficos.

## Goal

Producir evidencia verificable de inferencia 100% local: dos corridas completas del ciclo de vida de QVAC, una con red y otra sin ella, más tu tabla de métricas.

## Outcomes ejercitados

- Provisionar un asset con `downloadAsset()` (Outcome 3)
- Ejecutar inferencia offline post-provisión (Outcome 4)
- Clasificar dependencias local vs red (Outcome 5)
- Medir load time, TTFT, tok/s (Outcome 6)

## Prerequisitos

- Node.js ≥ 18 o Bun; `npx tsx` disponible
- ~1 GB libres en disco para `LLAMA_3_2_1B_INST_Q4_0`
- Permisos para desconectar la red del equipo (Wi-Fi o cable)
- Proyecto inicializado:

```bash
mkdir airplane-lab && cd airplane-lab
npm init -y && npm pkg set type=module
npm i @qvac/sdk && npm i -D tsx
```

## Estado inicial

`starter/airplane-mode-starter.ts` contiene el esqueleto con `// TODO:` en los puntos que debes completar, apoyándote en `../examples/`.

---

## Parte 1 — Worked Example

Corre los tres ejemplos de `examples/` en orden (01 con red, luego desconecta, 02 y 03). Objetivo: ver el ciclo completo funcionando antes de escribir código propio.

## Parte 2 — Modify

Completa el starter hasta que pase su propia verificación interna (`✔ CICLO COMPLETO OK`). No copies-pegues ciegamente: cada TODO corresponde a una función documentada de la lección.

## Parte 3 — Predict (escríbelas ANTES)

En `predictions.md` (créalo junto al script):

1. Segunda corrida con red: ¿qué fase será visiblemente más rápida?
2. Corrida offline tras provisionar: ¿fallará algo? ¿Qué?
3. Si borro la carpeta de caché del SDK y corro offline: ¿en qué línea muere?
4. Durante generación offline, ¿cuántos paquetes de red esperas? (puedes verificarlo con un monitor)

## Parte 4 — Run and Observe

Ejecuta: **corrida A** (red completa) → registra métricas → **corrida B** (modo avión) → registra métricas. Captura la salida completa de ambas (texto, no memoria).

## Parte 5 — Break It

Predice primero, luego rompe (un escenario por corrida):

| # | Acción | Tu predicción |
|---|--------|---------------|
| B1 | Borra los archivos cacheados del modelo | |
| B2 | Mueve/renamea la caché a otra ruta | |
| B3 | Corre offline SIN haber provisionado nunca | |
| B4 | Pide `ctx_size: 8192` con poca RAM libre | |

Para saber dónde vive la caché configurada, revisa la opción `cacheDirectory` en la [configuración del SDK](https://docs.qvac.tether.io/configuration/).

## Parte 6 — Diagnose

Por cada Break It: ¿qué fase falló (descarga/carga/inferencia)? ¿El mensaje de error menciona red, disco o memoria? ¿Cómo lo sabes? Escribe 2–3 líneas por caso en `predictions.md` (columna "diagnóstico").

## Parte 7 — Measure It

Completa esta tabla con TUS números (dos decimales; unidades explícitas):

| Métrica | Corrida A (con red) | Corrida B (offline) |
|---|---|---|
| Descarga requerida (sí/no) | | |
| Bytes descargados | | |
| Tiempo de descarga | | |
| Tiempo de carga (`loadModel`) | | |
| TTFT | | |
| tok/s (runtime) | | |
| Tiempo total de generación | | |

## Parte 8 — Independent Extension

Añade al script un modo `--strict-offline`: si detecta que la operación actual requeriría red (falla de descarga), debe terminar con exit code distinto y un mensaje que nombre la fase exacta. Sin telemetría, sin llamadas externas.

## Reflection

Responde en 5–10 líneas totales:

- ¿Qué esperabas? ¿Qué pasó?
- ¿Qué evidencia sostiene tu explicación (salida, timestamps, errores)?
- ¿Qué cambiaría en otra máquina (HDD vs SSD, RAM menor)?
- ¿Qué dependencia de red descubriste que no esperabas?

## Entregable

`airplane-mode-proof/` con: `predictions.md`, salida completa de las corridas A y B, tabla de métricas, diagnósticos de Break It, y el script final con `--strict-offline`.
