# Checkpoint — Clase 4: Build the Offline Chat

> 7 preguntas. Distribución: 2 explicación · 2 predicción · 1 diagnóstico · 1 diseño · 1 evaluación de política.

## Q1 — Explicación

Nombra los **tres ciclos de vida** de Clase 4 y da un ejemplo de evento/transición en cada uno.

## Q2 — Explicación

¿Por qué multi-turn behavior requiere que la **aplicación** pase historial? ¿Qué NO provee QVAC automáticamente?

## Q3 — Predicción

Usuario cancela tras 40 caracteres streamados. Con política "commit solo en EOS/length/stopSequence", ¿qué hay en el transcript persistido? Justifica.

## Q4 — Predicción

Borras `data/conversation.json` pero mantienes el modelo cargado. ¿Qué pierde el usuario? ¿Puede seguir chateando "desde cero"?

## Q5 — Diagnóstico

Tras cancelación, ves `stopReason: "cancelled"` pero el archivo JSON contiene un mensaje assistant completo con texto parcial. ¿Qué bug arquitectónico indica?

## Q6 — Diseño

Diseña el schema JSON mínimo para persistir conversación. Lista campos obligatorios y qué validarías al cargar.

## Q7 — Evaluación de política

Defiende cuándo commitearías un turno con `stopReason: "length"`. ¿Es diferente de `"cancelled"`? ¿Por qué?

---

## Soluciones esperadas (resumen — instructor)

- **Q1:** Model (load/unload), Request (completion/cancel/final), Conversation (append/commit/persist).
- **Q2:** Modelo stateless entre calls; app owns history, persistence, commit policy.
- **Q3:** No assistant turn committed (o turno vacío según política); solo user turn previo si ya committed.
- **Q4:** Pierde transcript; puede chatear fresh si app lo permite, pero sin memoria previa.
- **Q5:** Confundió provisional stream buffer con committed history — falta commit boundary.
- **Q6:** version, conversationId, timestamps, messages[{role, content}]; validar version y roles.
- **Q7:** length = terminal configurado, contenido parcial pero válido para commit; cancelled = acción usuario, no commit por defecto.

## Fuentes utilizadas

- `lesson.md` Clase 4 · QVAC SDK v0.18.x

## Nota de frescura / versión

Checkpoint alineado a `CompletionRun.requestId/events/final` y cancel API documentados el 2026-08-26.
