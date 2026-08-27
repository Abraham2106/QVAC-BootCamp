# Challenge — The Great Swap

Una aplicación usa un cliente OpenAI con una URL cloud fija. Migra el flujo a QVAC local sin cambiar la UI.

## Acceptance tests

1. `QVAC_BASE_URL` y `QVAC_MODEL` cambian la ruta sin editar código.
2. La ruta local completa `/v1/chat/completions` en modo normal.
3. El stream SSE muestra deltas y termina limpiamente en `[DONE]`.
4. Un `400/404/500` conserva status y mensaje sanitizado.
5. El servidor local detenido produce un error accionable y no activa cloud silenciosamente.
6. El mismo prompt registra TTFT, duración y modelo en JSON.
7. Un ADR lista capacidades verificadas y límites no verificados.

Entrega una demo de 5 minutos: contrato, migración, un Break It y evidencia de modo avión.
