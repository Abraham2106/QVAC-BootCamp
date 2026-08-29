# Bibliografía ampliada — Clase 09

## OpenAI-Compatible Escape Hatch · API compatibility · local migration

Esta clase estudia compatibilidad de API como estrategia de desacoplamiento. Las fuentes oficiales de OpenAI definen la forma del ecosistema que muchas aplicaciones esperan; Ollama ofrece un ejemplo ampliamente usado de compatibility layer local; QVAC aporta su servidor HTTP compatible. La lectura debe distinguir compatibilidad de superficie —paths, request/response shapes— de equivalencia semántica completa.

### QVAC — servidor HTTP compatible

1. **QVAC — HTTP server.** Fuente primaria para el servidor OpenAI-compatible, endpoints soportados y configuración.  
   https://docs.qvac.tether.io/cli/http-server/

2. **QVAC — HTTP server connection.** Detalles para conexión de clientes y configuración del endpoint local.  
   https://docs.qvac.tether.io/cli/http-server/connection/

3. **QVAC — Configuration.** `serve.models`, aliases, preload/lazy load y configuración del servidor/modelos.  
   https://docs.qvac.tether.io/configuration/

4. **QVAC — API Summary.** Contratos del SDK que existen debajo de la compatibility layer.  
   https://docs.qvac.tether.io/reference/api/

### OpenAI — superficie de referencia

5. **OpenAI — Streaming events reference.** Fuente oficial para comprender el modelo de eventos/streaming en APIs OpenAI modernas.  
   https://developers.openai.com/api/reference/resources/chat/subresources/completions/streaming-events

6. **OpenAI — Streaming responses guide.** Guía oficial para consumo incremental de respuestas.  
   https://developers.openai.com/api/docs/guides/streaming-responses

7. **OpenAI Cookbook — How to stream completions.** Ejemplos oficiales/complementarios de streaming.  
   https://developers.openai.com/cookbook/examples/how_to_stream_completions

8. **openai-python streaming internals overview.** Fuente secundaria para inspeccionar cómo clientes modelan streaming; no sustituye la documentación oficial.  
   https://deepwiki.com/openai/openai-python/4.1.2-streaming-chat-completions

### Ollama como caso de compatibilidad local

9. **Ollama — OpenAI compatibility documentation.** Documentación oficial sobre la compatibility layer de Ollama.  
   https://docs.ollama.com/api/openai-compatibility

10. **Ollama documentation — OpenAI compatibility.** Referencia alternativa/documentación histórica.  
    https://ollama.readthedocs.io/en/openai/

11. **Ollama blog — OpenAI compatibility.** Contexto oficial del feature.  
    https://ollama.com/blog/openai-compatibility

12. **MLJourney — using Ollama's OpenAI-compatible API.** Tutorial secundario de integración.  
    https://mljourney.com/how-to-use-ollamas-openai-compatible-api/

13. **PromptQuorum — local LLM OpenAI-compatible API.** Lectura práctica secundaria sobre migración de clientes.  
    https://www.promptquorum.com/local-llms/local-llm-openai-compatible-api

14. **RidgeRun — creating an OpenAI-compatible wrapper for Ollama.** Ejemplo para comprender qué trabajo implica construir una compatibility layer.  
    https://www.ridgerun.ai/post/how-to-create-an-openai-compatible-wrapper-for-ollama

## Cómo usar estas fuentes en la clase

El objetivo no es memorizar endpoints sino aprender qué significa que una aplicación pueda cambiar de backend con cambios mínimos. La prueba útil compara la misma app contra un endpoint remoto y uno local, identifica qué campos son realmente compatibles y documenta divergencias. La documentación QVAC debe ser autoridad para saber qué endpoints/parámetros están soportados hoy; las fuentes OpenAI sirven como referencia del contrato esperado por clientes existentes.