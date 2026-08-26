# Clase 1 — Airplane-Mode Intelligence

> **The Local-First AI Systems Masterclass** · Módulo 1 — Your First Local Token
> Baseline: QVAC SDK v0.18.x / v0.18.1 · verificado 2026-08-25

## Pregunta esencial

¿Qué significa *realmente* que una aplicación de IA sea local — y cómo lo demuestras?

## Resultados de aprendizaje

Al cerrar la clase puedes:

1. **Distinguir** modelo local / inferencia local / app local-first / app que cachea
2. **Trazar** la ruta de datos de QVAC (App → SDK → worker Bare → modelo → tokens)
3. **Provisionar** un asset de catálogo con `downloadAsset()`
4. **Ejecutar** inferencia completamente offline tras el aprovisionamiento
5. **Clasificar** dependencias locales vs. de red de una app de IA
6. **Medir** descarga, load time, TTFT y tokens/segundo en tu máquina

## Prerrequisitos y setup

```bash
# Node ≥ 18 o Bun + ~1 GB libres en disco
mkdir airplane-lab && cd airplane-lab
npm init -y && npm pkg set type=module
npm i @qvac/sdk && npm i -D tsx
```

Permisos para desconectar la red durante el lab.

## Mapa de la clase

| Momento | Artefacto |
|---|---|
| Concepto | [`lesson.md`](lesson.md) — lectura canónica |
| Presentación | [`slides.html`](slides.html) — ábrela en el navegador |
| Build guiado | [`lab/`](lab/README.md) — Airplane-Mode Proof |
| Ejemplos ejecutables | [`examples/01–03`](examples/) |
| Reto independiente | [`challenge/challenge.md`](challenge/challenge.md) |
| Evaluación | [`assessment/checkpoint.md`](assessment/checkpoint.md) |

## Entregable

**Airplane-Mode Proof**: evidencia de las corridas con y sin red + tabla de métricas propia + explicación de la ruta de datos con tus palabras.

## Definition of Done

- [ ] Corrida A (con red) documentada con salida completa
- [ ] Corrida B (modo avión) generando texto desde caché
- [ ] Tabla frío/tibio con unidades (descarga, carga, TTFT, tok/s)
- [ ] Los 4 escenarios Break It con predicción previa + diagnóstico
- [ ] Checkpoint respondido con nivel ≥3 en criterios 1–5 de la rúbrica

## Revisión post-clase (NotebookLM)

Con las fuentes enfocadas de esta clase en tu notebook:

1. Genera un **Audio Overview** con `notebooklm/podcast-prompt.md`
2. Practica recuperación con `notebooklm/flashcards-prompt.md`
3. Autoevalúate con `notebooklm/quiz-prompt.md`

## Fuentes autoritativas de la clase

- https://docs.qvac.tether.io/introduction/ · https://docs.qvac.tether.io/about/how-it-works/
- https://docs.qvac.tether.io/models/download-lifecycle/
- https://docs.qvac.tether.io/system-requirements/
- https://docs.qvac.tether.io/ai-capabilities/text-generation/
- https://docs.qvac.tether.io/reference/release-notes/
