# QVAC-BootCamp

**The Local-First AI Systems Masterclass** — bootcamp de 12 clases + capstone para
diseñar, construir, medir, romper y defender sistemas de IA local-first con QVAC.

- **Baseline técnico:** QVAC SDK v0.18.x / v0.18.1 (verificado contra docs oficiales y npm, 2026-08-25)

## Inicio rápido

```bash
npm install
npm run dev      # → http://localhost:5173
npm run build    # genera dist/ (SPA + assets estáticos)
npm run preview  # previsualizar build de producción
```

## Documentación

Ver **[docs/README.md](./docs/README.md)** — índice completo:

- [site-structure.md](./docs/site-structure.md) — rutas SPA, carpetas estáticas, añadir clases
- [slides-vs-lesson.md](./docs/slides-vs-lesson.md) — slides vs. lección canónica
- [development.md](./docs/development.md) — dev local, modo Ninja (solo dev)
- [deployment.md](./docs/deployment.md) — build y despliegue (Ninja deshabilitado en prod)

## Rutas principales

| Ruta | Qué es |
|---|---|
| `/` | Portada del bootcamp |
| `/curriculum` | Las 12 clases + capstone por módulo |
| `/class/01` … `/class/10` | Página de clase publicada |
| `/markdown/class-NN-…/lesson.md` | Visor SPA de markdown estático |

El progreso del estudiante se guarda en `localStorage` (sin backend).

## Clases publicadas

| # | Carpeta |
|---|---------|
| 01 | `class-01-airplane-mode-intelligence/` |
| 02 | `class-02-models-gguf-lifecycle/` |
| 03 | `class-03-local-inference-fundamentals/` |
| 04 | `class-04-build-offline-chat/` |
| 05 | `class-05-embeddings-meaning-as-geometry/` |
| 06 | `class-06-local-rag-private-knowledge/` |
| 07 | `class-07-speech-systems/` |
| 08 | `class-08-translation-voice-relay/` |
| 09 | `class-09-openai-compatible-escape-hatch/` |
| 10 | `class-10-local-first-architectures/` |

Cada paquete incluye `README`, `lesson.md`, `slides.html`, `lab/`, `examples/`, `challenge/`, `solution/`, `assessment/`, `instructor/` y `notebooklm/`.
