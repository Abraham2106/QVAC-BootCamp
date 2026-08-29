# Technical Summary — Class Build the Offline Chat

## 1. Technical Sheet

- **Session topic:** Reliable chat state around streaming, cancellation, persistence and restart.
- **Key concepts:** model lifecycle; request lifecycle; history; provisional output; commit; request identity; atomic persistence; restore.
- **Tools / Frameworks:** QVAC events, final result and cancellation plus local storage.
- **Position in the bootcamp:** Completes Module 1 by turning inference into a recoverable application.

## 2. Synopsis

A chat is a state machine, not a loop around one prompt. Model residency, an individual request and durable conversation each have separate transitions. Streaming updates provisional UI, while a product policy decides what becomes committed and recoverable.

## 3. Subtopic Breakdown

### 1. State separation

model, request and conversation must not be collapsed.

### 2. Commit policy

output deltas are temporary until a valid terminal outcome.

### 3. Recovery

transcript persistence requires schema validation and crash-aware writes.



### Conceptual Foundation

La Clase 3 observó el motor de inferencia: tokens, streaming, `stopReason`. Esta clase construye la **aplicación alrededor del motor**.

Lo que falta en un demo de completion no es "más prompts". Falta arquitectura de aplicación:

```text
model lifecycle
+
conversation state
+
request lifecycle
+
persistence
+
errors
+
user cancellation
+
metrics
+
shutdown
```

| Application state | Model / runtime state |
|---|---|
| conversation history | loaded weights |
| conversation id | runtime/backend |
| UI state | KV cache |
| persistence path | in-flight inference |
| active request id | |
| per-turn metrics | |

### Extended Technical Discussion

#### Tres estados que no deben confundirse

El **modelo** tiene lifecycle propio: provisionado, cargado, reutilizado, descargado y runtime
cerrado. Una **request** tiene otro: creada, streaming, terminada, cancelada o fallida. La
**conversación** es estado de aplicación: mensajes comprometidos, metadata, versión de schema y
retención. Tratar los tres como una única variable genera errores: recargar el modelo por turno,
persistir deltas como mensajes o suponer que KV cache sustituye history durable.

Una transición segura puede describirse así:

```text
user input -> validate -> persist user intent -> start request(requestId)
          -> provisional deltas -> final/stopReason
          -> commit policy -> atomically persist transcript -> durable UI
```

La política de commit pertenece a la aplicación. Puede no guardar output cancelado o conservar un
estado explícito de cancelación; lo peligroso es que quede implícita en callbacks de streaming.

#### Streaming, cancelación y carreras

Un `contentDelta` es provisional. Si la app cae tras mostrarlo y antes de persistir final, no
debe reconstruirse como mensaje confirmado sin política explícita. `requestId` relaciona
cancelación, eventos, métricas y commit con el turno correcto. Sin identidad estable, doble submit
o una respuesta tardía puede escribir sobre otro turno.

Cancelar no siempre significa “falló todo”. El controller distingue cancelación esperada, error de
runtime y terminación normal; limpia listeners y evita que una respuesta tardía reaparezca cuando
el usuario ya inició otro turno.

#### Persistencia: el crash es parte del diseño

Un transcript es primary data si la aplicación promete restaurar conversaciones. Un write directo
puede dejar JSON truncado. El patrón write-temporal -> flush según plataforma -> rename reduce la
exposición, pero requiere validación de schema al iniciar y manejo de temporales huérfanos.
Persistir no obliga a guardar todo: prompts y respuestas pueden ser sensibles; logs, backups y
retención necesitan política separada.

El acceptance test fuerte provisiona activos, termina la app, corta red, reinicia, restaura
transcript y formula una pregunta nueva. Luego prueba cancelación, crash simulado entre streaming
y commit, y shutdown con request activa.

#### Para estudiar y defender

1. Dibuja la máquina de estados de request y marca qué transiciones pueden persistir datos.
2. Explica qué debe ocurrir si el proceso cae tras `completionDone` pero antes del commit.
3. Diseña una prueba para doble submit y respuesta tardía tras cancelación.
4. Diferencia cerrar modelo, cerrar runtime y borrar transcript tras un restart.

---

## 4. Points of Confusion and Corner Cases

- KV cache does not replace conversation persistence.
- Cancellation is not necessarily a runtime failure.
- Late events must not write into a newer request.

## 5. Study Questions

1. Draw a request state machine including cancel and commit.
2. What should survive a crash before the final assistant message?
3. How would you test a double submit?

## Source Material

- [Canonical lesson](../class-04-build-offline-chat/lesson.md)
- **Module:** Módulo 1
