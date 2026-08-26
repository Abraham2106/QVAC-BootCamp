# Clase 2 — Models, GGUF and the QVAC Lifecycle

> **The Local-First AI Systems Masterclass** · Módulo 1 — Your First Local Token
> **Baseline técnico:** QVAC SDK v0.18.x / v0.18.1, verificado contra la documentación oficial y npm el 2026-08-25. Revisa las release notes antes de impartir esta clase.

---

## Pregunta esencial

> **¿Qué estamos cargando realmente cuando "cargamos un modelo"?**

En la Clase 1 el asset fue una caja negra de ~0.6 GB. Hoy abrimos la caja: pesos, tensors,
tokenizer, metadata — y el contrato que codifica un nombre como `QWEN3_4B_INST_Q4_K_M`.

---

## Resultados de aprendizaje

Al terminar esta clase puedes:

1. **Explicar** qué contiene un modelo: arquitectura, tensors, pesos aprendidos, tokenizer, metadata y chat template.
2. **Explicar** el papel de GGUF como formato de inferencia y por qué no es lo mismo que un checkpoint de entrenamiento.
3. **Razonar** sobre cuantización: qué se gana y qué se arriesga al bajar de F16 a Q4.
4. **Interpretar** nombres de modelos de catálogo (familia, escala, INST/base, cuantización).
5. **Gestionar** el ciclo de vida completo: find → download → validate → load → infer → reuse → unload → close.
6. **Comparar** variantes de modelo con mediciones propias (disco, carga, memoria, TTFT, tok/s) y justificar una elección.

---

## Prerrequisitos y setup

- Clase 1 completada (ciclo de vida básico + Airplane-Mode Proof)
- `qvac doctor` passing (Node ≥ 18 —preferible 20+—, RAM total ≥ 4 GB recomendado, ≥ 5 GB libres)
- Dos modelos pre-descargados para el lab (ver `examples/02-compare-models.ts`)

```bash
mkdir model-explorer && cd model-explorer
npm init -y && npm pkg set type=module
npm i @qvac/sdk && npm i -D tsx
```

## Mapa de la clase

| Momento | Artefacto |
|---|---|
| Concepto | [`lesson.md`](lesson.md) — anatomía, GGUF, cuantización, nombres |
| Presentación | [`slides.html`](slides.html) |
| Build guiado | [`lab/`](lab/README.md) — Model Explorer |
| Ejemplos ejecutables | [`examples/01–03`](examples/) |
| Reto independiente | [`challenge/challenge.md`](challenge/challenge.md) |
| Evaluación | [`assessment/checkpoint.md`](assessment/checkpoint.md) |

## Entregable

**Model Selection Report**: para tu máquina (medida con `getSystemResources`) y dos perfiles de tarea,
el modelo + cuantización elegido, la justificación con la matriz de decisión y tus mediciones de carga,
TTFT y tok/s.

## Definition of Done

- [ ] Explicas las 5+ piezas internas de un GGUF sin mirar la lección
- [ ] Decodificas 3 nombres de catálogo correctamente (familia/escala/INST/cuant)
- [ ] Comparación medida de 2 modelos (misma tabla frío/tibio de la Clase 1, ahora con memoria)
- [ ] Un Break It de recurso insuficiente diagnosticado por fase (sin tumbar el worker compartido)
- [ ] Model Selection Report con matriz de decisión + defensa oral de 3 minutos

## Revisión post-clase (NotebookLM)

Con las fuentes enfocadas de esta clase: Audio Overview → flashcards → quiz
(prompts en [`notebooklm/`](notebooklm/)).

## Fuentes autoritativas de la clase

- https://docs.qvac.tether.io/models/download-lifecycle/
- https://docs.qvac.tether.io/ai-capabilities/text-generation/
- https://docs.qvac.tether.io/system-requirements/
- https://docs.qvac.tether.io/reference/release-notes/
- https://github.com/ggml-org/llama.cpp (ecosistema GGUF)
- Currículo canónico: `QVAC_Course_Expanded_Learning_Edition.md`, Cap. 4 (§4.1–4.10)
