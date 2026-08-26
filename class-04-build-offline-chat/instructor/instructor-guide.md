# Instructor Guide — Clase 4: Build the Offline Chat

## Teaching goal

El estudiante debe salir creyendo:

> **"Un chat confiable es una máquina de estados alrededor de inferencia, no un loop alrededor de una función prompt."**

## Misconcepción primaria a atacar

> "El modelo recuerda la conversación automáticamente."

Secundarias:

- streaming output = estado durable
- cancelación = error inesperado
- QVAC persiste el chat por ti
- offline sin provisioning previo

## Qué NO sobre-explicar todavía

- RAG / embeddings (Clases 5–6)
- Tool calling / agents
- UI frameworks
- Database migrations avanzadas

## Setup pre-clase

- [ ] Modelo demo provisionado
- [ ] `examples/01–06` verificados
- [ ] Directorio `app/data/` writable
- [ ] Break It (partial persist during stream) preparado

## Timing (180 min)

| Bloque | Min | Actividad |
|---|---|---|
| Hook | 8 | "¿Un completion demo es un chat?" |
| Tres lifecycles | 15 | Diagrama model/request/conversation |
| Demo multi-turn | 15 | `02-multi-turn.ts` |
| Streaming + commit | 20 | `03-streaming.ts` — provisional vs committed |
| Cancel | 15 | `04-cancellation.ts` |
| Break | 10 | — |
| Persistence | 15 | `05-persistence.ts` |
| App build | 35 | Completar `app/src/` modular |
| Break It | 15 | Cancel mid-stream + corrupt persist |
| Challenge | 20 | Offline Chat v1 acceptance tests |
| Airplane restart | 12 | `06-restart-offline.ts` |
| Exit | 5 | "¿Qué estado es de QVAC vs app?" |

## Demo script

1. **`01-single-turn.ts`** — baseline aislada
2. **`02-multi-turn.ts`** — history explícita; pregunta color test
3. **`03-streaming.ts`** — buffer provisional en terminal
4. **`04-cancellation.ts`** — cancel tras N chars; no commit
5. **`05-persistence.ts`** — JSON save/load
6. **`06-restart-offline.ts`** — restore + loadModel sin red

## Puntos de predicción

1. Antes de multi-turn — ¿modelo recuerda solo?
2. Antes de cancel — ¿qué queda en JSON?
3. Antes de restart offline — ¿qué activos necesitas locales?

## Facilitación Break It

Usar starter que persiste en cada `contentDelta`. Cancelar → restart → inspeccionar JSON corrupto semánticamente.

## Conexión Clase 5

Clase 5 añade embeddings — representación de significado externo. Clase 6 conecta RAG a esta arquitectura de chat.

## NotebookLM

Prompts en `notebooklm/`. Escenario recurrente: "usuario cancela a mitad de respuesta larga".

## Exit question

> ¿Qué estado pertenece a QVAC y qué estado pertenece a tu aplicación?
