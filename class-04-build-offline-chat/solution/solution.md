# Solution — Offline Chat v1 (instructor)

> Referencia arquitectónica. No copies monolíticamente — usa para validar acceptance tests.

## Commit policy (referencia)

| stopReason | Commit assistant turn |
|---|---|
| `eos` | Sí |
| `length` | Sí (parcial terminal) |
| `stopSequence` | Sí |
| `cancelled` | No |
| error | No |

## Módulos clave

### history.ts

- Schema version 1 con `messages: { role, content }[]`
- Helpers: `appendUser`, `appendAssistant`, `toCompletionHistory`

### chat.ts

- `runChatTurn`: crea run → stream provisional → await final → commit si policy allows
- Guarda `activeRequestId` para `/cancel`
- Buffer provisional separado de `committedHistory`

### persistence.ts

- Path: `app/data/conversation.json`
- Write temp + rename
- Validate version on load

### shutdown.ts

- SIGINT → cancel active → persist → unload → close

## Acceptance test scripts

```bash
# A — Multi-turn
echo "My favorite color is orange." | npm start
echo "What color did I tell you?" | npm start

# C — Cancel during long generation
# start long prompt, /cancel after partial output, inspect JSON

# E — Offline restart
# provision → exit → airplane mode → restart → new message
```

## Break It fix

Mover `saveHistory()` de dentro del loop `contentDelta` a **después** de `await run.final` con policy check.

## Preguntas de defensa

1. ¿Qué pierdes si borras transcript pero no modelo?
2. ¿Por qué cancelación ≠ error?
3. ¿Cuándo usarías KV cache en chat?
