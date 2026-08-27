# Clase 9 — The OpenAI-Compatible Escape Hatch

Cambiar dónde corre la inteligencia sin rediseñar el cliente. El servidor HTTP compatible con OpenAI permite conservar la forma de `/v1/chat/completions` mientras QVAC ejecuta localmente.

## Paquete de la clase

- `lesson.md`: conceptos, contrato HTTP, seguridad y migración.
- `lab/README.md` y `lab/starter/`: proxy cliente con configuración por entorno.
- `examples/`: smoke test, streaming SSE y comparación local/cloud.
- `challenge/challenge.md`: migración de una app que depende de la nube.
- `assessment/`: checkpoint y rúbrica.
- `instructor/instructor-guide.md`: facilitación y problemas frecuentes.

## Requisitos

- Clases 1–4 completadas.
- QVAC SDK v0.18.x/v0.18.1 y un modelo local disponible.
- Servidor local escuchando por defecto en `http://localhost:11434/v1/`.

```bash
npm install @qvac/sdk tsx
# En otra terminal, inicia el servidor OpenAI-compatible de QVAC.
npx tsx examples/01-smoke-test.ts
npx tsx examples/02-stream-sse.ts
```

> No confundas compatibilidad de API con equivalencia de modelo: el contrato de transporte puede ser igual, pero tokens, capacidades, latencia y calidad dependen del backend.
