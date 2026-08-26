# Challenge — Model Selection Report

> Sin starter. Tú diseñas el experimento, produces las mediciones y defiendes la decisión.

## Escenario

Eres el ingeniero responsable de llevar un asistente de IA a tres contextos con hardware y necesidades distintas:

1. **Kiosco de feria** — laptop vieja con 4 GB RAM total; tarea: responder preguntas frecuentes del stand, offline, respuestas cortas.
2. **Laptop de consultor** — 16 GB RAM; tarea: redactar y refinar borradores largos (importa la calidad del español y la coherencia en ~500 tokens).
3. **Tu máquina actual** — la que tengas; tarea: chat general de desarrollo.

Para CADA contexto: elige familia + escala + cuantización, justifica con la matriz de decisión (calidad × tarea × memoria × almacenamiento × latencia × contexto × hardware) y respalda con mediciones donde sea ejecutable (contexto 3 es tu máquina: mide de verdad).

## Requisitos

1. **Inventario honesto de hardware** con `getSystemResources` (y `qvac doctor` si tienes el CLI) para el contexto 3.
2. **Al menos una comparación ejecutada** entre dos variantes con el mismo prompt determinista (temp 0, seed fija).
3. **Reporte** por contexto: modelo elegido, por qué descartaste dos alternativas, riesgo principal de tu elección.
4. **Verificación de nombre**: decodifica el nombre completo de cada modelo elegido (familia/escala/INST/cuant) y confirma que coincide con tu intención.

## Restricciones

- Solo constantes de catálogo o rutas locales verificadas — nada de URLs inventadas.
- Contextos 1 y 2: si no tienes ese hardware, SIMULA la restricción en tu máquina (p. ej., límite de memoria con contenedor o eligiendo modelos que quepan en 4 GB) y decláralo explícitamente como simulación.
- Cero benchmarks fabricados: cada número tiene corrida que lo respalde.

## Acceptance Tests

| # | Test | Pasa si... |
|---|------|-----------|
| AT1 | Decodificación de nombres | 3 nombres explicados sin errores (familia/escala/INST/cuant) |
| AT2 | Comparación ejecutada | tabla con carga + TTFT + tok/s de 2 variantes, misma máquina y prompt |
| AT3 | Justificación con matriz | cada elección referencia explícitamente ≥ 4 factores de la matriz |
| AT4 | Riesgo declarado | cada contexto nombra el fallo más probable de su elección y cómo lo detectarías |
| AT5 | Honestidad de simulación | los contextos simulados están marcados como tales, sin presentar números ajenos como propios |

## Required Measurements

Carga (frío/tibio), TTFT, tok/s y tamaño en disco para cada modelo ejecutado.

## Required Explanation / Defense

Prepárate para defender:

1. ¿Por qué NO elegiste el modelo más grande que cabe en cada máquina?
2. ¿Qué cambiaría en tu elección si la tarea pasara de chat a código?
3. Tu comparación usó temp 0 y seed fija: ¿qué garantiza eso y qué NO garantiza?

## Stretch Goals

- Añade el factor "contexto": repite la medición del ganador con `ctx_size` 2048 vs 8192 y reporta el costo de memoria/tiempo.
- Script `recommend.ts`: dado un JSON de {ramGB, tarea}, sugiere candidato con la heurística y cita tu evidencia.
