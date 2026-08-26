# Instructor Guide — Clase 2: Models, GGUF and the QVAC Lifecycle

## Teaching goal

Que el estudiante lea un nombre de modelo como un CONTRATO (familia/escala/INST/cuant → memoria y expectativa de calidad), y elija con la matriz de decisión respaldada por mediciones propias. Salir de "el asset es una caja negra".

## Misconcepción primaria a atacar

> "Más parámetros siempre es mejor."

Secundarias: "Q4 destruye la calidad" · "el GGUF se ejecuta solo" · "el SDK trae los pesos".

## Qué NO sobre-explicar todavía

- Mecánica interna de inferencia (tokenización, prefill, KV-cache matemático) → **Clase 3**
- Fine-tuning LoRA, multimodal projection models, sharded GGUFs → clases/extensiones posteriores
- Esquemas K-quants internos (cómo funciona K_M por capa) → mencionar como "esquema mixto", sin detalle

## Conceptos diferidos intencionalmente

Chat templates en profundidad (se practican en Clase 4) · `parallel`/batching · profiler · embeddings (Clase 5).

## Setup pre-clase (checklist)

- [ ] Release notes revisadas contra v0.18.x
- [ ] `QWEN3_600M_INST_Q4` y `LLAMA_3_2_1B_INST_Q4_0` pre-descargados en la máquina de demo
- [ ] `qvac doctor` passing en el aula (Vulkan en Windows/Linux; Metal en Mac)
- [ ] Plan B si el registro está caído: los dos modelos ya cacheados + `fallbackSrc` documentado
- [ ] slides.html abierto; probar ←/→/N/E

## Timing (180 min)

| Bloque | Min | Actividad |
|---|---|---|
| Hook | 5 | "¿Por qué 0.6 GB y no 6?" — decodificar el nombre de la Clase 1 |
| Concepto | 20 | Anatomía → GGUF → cuantización → nombres (slides 3–9) |
| Predict | 5 | 4 predicciones por escrito |
| Demo | 15 | examples 01→02 en vivo con tabla comparativa |
| Coding guiado | 30 | Lab Partes 1–2 (starter) |
| Experimento | 15 | Partes 3–4 (corridas + tabla) |
| Break | 10 | — |
| Break It | 20 | Partes 5–6 (4 escenarios, unloadModel ENTRE intentos) |
| Measure It | 15 | Parte 7 (tabla frío/tibio + memoria) |
| Challenge | 30 | Model Selection Report |
| Explain/review | 10 | 2–3 defensas de elección |
| Checkpoint | 5 | Asignar checkpoint.md |

## Demo script

1. `01-registry-explorer.ts` — narrar: "las constantes son punteros, no pesos; el registro es red"
2. `03-memory-report.ts` — "¿qué puede ESTA máquina? heurística, no promesa"
3. `02-compare-models.ts` — tabla en vivo; leer las dos muestras en voz alta: "los números miden, la lectura elige"
4. Repetir 02 tras `unloadModel` — frío vs tibio

**Preguntas Predict en demo:** ¿cuál carga antes? ¿cuál genera más rápido? ¿qué cambia en la segunda corrida?

## Expected observations

- 600M: carga más rápida, más tok/s, texto más simple que 1B en tareas exigentes
- Carga tibia < fría; generación estable entre corridas
- `getSystemResources` puede no reportar todas las métricas según plataforma (manejado en examples)

## Break-It facilitation

REGLA DE SEGURIDAD: `unloadModel` ENTRE intentos + verificar memoria con `03`. B4 (archivo corrupto por ruta local) es el más valioso: no hay checksum de catálogo — la integridad es de la app. No reveles la causa: pregunta "¿quién valida aquí?"

Si un intento tumba el worker (proceso muere): también es lección — el worker es compartido; por eso la regla de seguridad.

## Discussion questions

1. ¿Qué factor de la matriz pesaría en TU app ideal?
2. Si Q4_K_M vs Q8 cambia poco en TU tarea, ¿por qué no siempre Q4?
3. ¿Cómo documentarías la elección de modelo para tu equipo (ADR preview)?

## Problemas comunes de entorno

- Registro caído → constantes cacheadas siguen; usar como oportunidad de B3
- RAM justa → usar 600M/1B; el 7B es para Break It, no para producción en esa máquina
- Windows sin Vulkan → `qvac doctor` lo marca; instalación de drivers/SDK Vulkan (documentado en system-requirements)
- `getModelInfo` firma distinta → verificar `.d.ts`; los examples degradan con try/catch a propósito

## Qué cuenta como mastery HOY

≥3 en criterios 1–5 de la rubric: anatomía explicada, GGUF vs checkpoint, nombres decodificados (incl. uno nuevo), ciclo de vida limpio, comparación determinista medida; + defensa de elección con matriz.

## Qué queda intencionalmente incompleto

Qué pasa DENTRO de la generación (sampling, KV-cache, por qué el TTFT incluye prefill) → Clase 3. Dejar la pregunta abierta: "mediste que el 600M es más rápido — ¿por qué, mecánicamente?"

## Transición a la Clase 3

Cerrar con: "hoy elegiste y cargaste la máquina. La próxima clase abrimos el motor: qué le pasa a tu prompt token a token, y por qué `predict` y `ctx_size` hacen lo que hacen."
