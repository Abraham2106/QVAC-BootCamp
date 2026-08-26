# Clase 3 — Local Inference Fundamentals

> **The Local-First AI Systems Masterclass** · Módulo 1 — Your First Local Token
> **Baseline técnico:** QVAC SDK v0.18.x / v0.18.1, verificado contra la documentación oficial y npm el 2026-08-25. Revisa las release notes antes de impartir esta clase.

---

## Pregunta esencial

> **¿Qué ocurre entre un prompt y el siguiente token generado, y cómo podemos observar las consecuencias?**

En la Clase 1 demostraste que la IA puede ejecutarse localmente. En la Clase 2 abriste el artefacto del modelo. Hoy miramos **qué pasa mientras ese modelo cargado realmente infiere**: tokenización, bucle autoregresivo, streaming, sampling, contexto, KV cache y medición.

---

## Resultados de aprendizaje

Al terminar esta clase puedes:

1. **Explicar** tokenización sin equiparar tokens con palabras.
2. **Explicar** generación autoregresiva token a token.
3. **Distinguir** procesamiento del prompt de la decodificación de tokens nuevos.
4. **Explicar** sampling (`temp`, `top_k`, `top_p`, `seed`) como reglas de selección sobre la distribución del siguiente token.
5. **Ejecutar** `completion()` con la superficie canónica `events` + `final`.
6. **Interpretar** eventos `contentDelta`, `completionStats`, `completionDone` y campos de `final`.
7. **Interpretar** `stopReason` (`eos`, `length`, `stopSequence`, `cancelled`).
8. **Explicar** qué compone la ventana de contexto y por qué crece la presión computacional.
9. **Usar** KV cache (`kvCache: true` o clave string) y comparar follow-up con/sin cache.
10. **Distinguir** TTFT, latencia total y throughput (`tokens/sec`).
11. **Usar** el profiler de QVAC para recoger evidencia de timing.
12. **Diagnosticar** al menos un escenario de generación limitada con evidencia observable.
13. **Diseñar** un experimento controlado antes de afirmar una mejora de rendimiento.

---

## Prerrequisitos

Debes poder ya:

- Cargar, reutilizar y descargar un modelo (`loadModel` / `unloadModel` / `close`).
- Entender GGUF y cuantización a nivel conceptual (Clase 2).
- Ejecutar una `completion()` básica con streaming.

```bash
mkdir inference-lab && cd inference-lab
npm init -y && npm pkg set type=module
npm i @qvac/sdk && npm i -D tsx
```

## Antes de clase

Verifica:

- [ ] `qvac doctor` passing en tu máquina de demo
- [ ] Modelo ligero disponible: `LLAMA_3_2_1B_INST_Q4_0` o `QWEN3_600M_INST_Q4`
- [ ] RAM y disco suficientes para el modelo elegido
- [ ] `profiler.enable()` funciona en tu runtime (corre `examples/05-profiler.ts`)

## Mapa de la clase

```text
tokens
  → bucle de generación
  → streaming (events/final)
  → sampling
  → contexto / history
  → KV cache
  → profiler
  → Break It (stopReason)
  → reto de benchmark
```

| Momento | Artefacto |
|---|---|
| Concepto | [`lesson.md`](lesson.md) — mecánica de inferencia observable |
| Build guiado | [`lab/`](lab/README.md) — Inference Benchmark Lab |
| Ejemplos ejecutables | [`examples/01–05`](examples/) |
| Reto independiente | [`challenge/challenge.md`](challenge/challenge.md) |
| Evaluación | [`assessment/checkpoint.md`](assessment/checkpoint.md) |

## Entregable

**Inference Experiment Report** con:

- configuración del modelo y sampling;
- TTFT, duración total, tok/s (si disponible), `stopReason`;
- modo KV cache;
- tabla predicción vs observación;
- diagnóstico de un escenario limitado (p. ej. `stopReason: "length"`).

## Definition of Done

- [ ] Una corrida streaming interpretando `contentDelta` → `completionStats` → `completionDone`
- [ ] Comparación de sampling (mismo prompt, variable controlada)
- [ ] Experimento de contexto (history corta vs larga)
- [ ] Comparación KV cache on vs off en follow-up
- [ ] Diagnóstico Break It con evidencia (`stopReason`, stats, contenido parcial)
- [ ] Conclusión basada en medición — sin benchmarks universales fabricados

## Después de clase

NotebookLM con fuentes enfocadas: Audio Overview → flashcards → quiz
(prompts en [`notebooklm/`](notebooklm/)).

## Fuentes autoritativas de la clase

- https://docs.qvac.tether.io/ai-capabilities/text-generation/
- https://docs.qvac.tether.io/reference/api/
- https://docs.qvac.tether.io/runtime/profiler/
- https://docs.qvac.tether.io/about/how-it-works/
- https://docs.qvac.tether.io/reference/release-notes/
- https://github.com/ggml-org/llama.cpp (solo contexto general de inferencia)
