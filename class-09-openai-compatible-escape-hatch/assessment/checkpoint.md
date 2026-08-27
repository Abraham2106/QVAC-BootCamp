# Checkpoint — Clase 9

1. ¿Qué significa “OpenAI-compatible” y qué no garantiza?
2. Explica la diferencia entre `baseURL` con `/v1` y el endpoint completo.
3. ¿Cómo parseas una respuesta SSE y por qué `[DONE]` no es JSON?
4. Clasifica `ECONNREFUSED`, `404` y `400`.
5. ¿Por qué un servidor local no demuestra por sí solo modo avión?
6. Nombra tres capacidades que debes volver a probar al cambiar de backend.
7. Diseña una política segura para datos privados cuando QVAC no está disponible.
8. ¿Qué métricas registrarías para comparar local y remoto y qué sesgo tienen?

## Respuestas esperadas, resumidas

Compatibilidad es contrato HTTP/forma aproximada; no calidad ni paridad de capacidades. `/v1` es prefijo, y duplicarlo rompe la ruta. SSE son eventos `data:` y `[DONE]` es sentinel. `ECONNREFUSED` es listener ausente, `404` ruta/modelo, `400` petición no aceptada. Hay que cortar red y repetir con asset/servidor activos. Probar tools, JSON, visión, contexto, límites y streaming. Para privado: fail-closed, aviso y decisión explícita. Medir TTFT, duración, tok/s, estado, tamaño y condiciones de hardware/modelo.
