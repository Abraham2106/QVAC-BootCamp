# QVAC Bootcamp — Documentación del proyecto

Índice de la documentación técnica del sitio **The Local-First AI Systems Masterclass**.

| Documento | Descripción |
|-----------|-------------|
| [site-structure.md](./site-structure.md) | Arquitectura del SPA, rutas, carpetas estáticas y flujo de contenido |
| [slides-vs-lesson.md](./slides-vs-lesson.md) | División de responsabilidades entre `slides.html` y `lesson.md` |
| [development.md](./development.md) | Entorno local, scripts npm, modo Ninja (solo dev) |
| [deployment.md](./deployment.md) | Build de producción, despliegue y restricciones de prod |
| [internal-artifacts.md](./internal-artifacts.md) | Carpeta `_internal/` (prompts, borradores, tooling — gitignored) |

## Inicio rápido

```bash
cd QVAC-BootCamp   # desde la raíz del workspace
npm install
npm run dev        # http://localhost:5173
```

Para detalle completo, ver [development.md](./development.md) y [deployment.md](./deployment.md).

## Contenido del bootcamp

Las clases publicadas viven en carpetas `class-NN-*` en la raíz de `QVAC-BootCamp/`:

| Clase | Carpeta | Ruta SPA |
|-------|---------|----------|
| 01 — Airplane-Mode Intelligence | `class-01-airplane-mode-intelligence/` | `/class/01` |
| 02 — Models, GGUF and the QVAC Lifecycle | `class-02-models-gguf-lifecycle/` | `/class/02` |
| 03 — Local Inference Fundamentals | `class-03-local-inference-fundamentals/` | `/class/03` |
| 04 — Build the Offline Chat | `class-04-build-offline-chat/` | `/class/04` |

Cada paquete incluye `lesson.md`, `slides.html`, `lab/`, `examples/`, `challenge/`, `assessment/`, `instructor/` y prompts NotebookLM en `notebooklm/` (contenido del bootcamp, versionado en git).

## Baseline técnico

- **QVAC SDK:** v0.18.x / v0.18.1
- **Stack del sitio:** React 19 + Vite 7 + React Router 7 + Tailwind CSS 4
