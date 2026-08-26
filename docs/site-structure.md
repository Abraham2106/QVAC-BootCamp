# Estructura del sitio

El bootcamp es una **SPA React** servida por Vite. El contenido pedagógico (markdown, slides HTML, labs) vive en carpetas estáticas copiadas a `dist/` en cada build.

## Diagrama de alto nivel

```
QVAC-BootCamp/
├── src/                    # Aplicación React (rutas, layout, componentes)
├── class-NN-*/             # Paquetes de clase (contenido estático)
├── lessons/                # Lecciones HTML legacy (class-NN.html)
├── assets/                 # CSS/JS compartido para slides y sitio
├── docs/                   # Documentación del proyecto (este directorio)
├── _internal/              # Local-only (gitignored): prompts, drafts, tooling
├── index.html              # Shell SPA + script anti-FOUC de tema/modo
└── vite.config.js          # Plugin que copia STATIC_DIRS → dist/
```

## Rutas SPA

| Ruta | Componente | Propósito |
|------|------------|-----------|
| `/` | `Home` | Portada del bootcamp |
| `/curriculum` | `Curriculum` | Las 12 clases + capstone por módulo |
| `/class/01` … `/class/04` | `Class01` … `Class04` | Página de clase: slides embebidos, artefactos, progreso |
| `/markdown/*` | `MarkdownPage` | Visor SPA de archivos `.md` estáticos |
| `*` | `NotFound` | 404 |

## Carpetas estáticas (`STATIC_DIRS`)

Definidas en `vite.config.js`. En **dev** se sirven por middleware; en **build** se copian recursivamente a `dist/`:

- `class-01-airplane-mode-intelligence`
- `class-02-models-gguf-lifecycle`
- `class-03-local-inference-fundamentals`
- `class-04-build-offline-chat`
- `lessons`
- `assets`

Ejemplo: `/class-01-airplane-mode-intelligence/lesson.md` → archivo estático; el visor SPA lo abre en `/markdown/class-01-airplane-mode-intelligence/lesson.md`.

## Layout y modos de UI

- **`DocsLayout`** envuelve todas las rutas: header, footer, crossfade de modo.
- **Modo Docs** (default): tema claro/oscuro, tipografía editorial, contenido pedagógico.
- **Modo Ninja** (solo desarrollo): UI alternativa oscura con acentos neón. Ver [development.md](./development.md).

La lógica vive en `src/lib/uiMode.js`. En producción `isNinjaEnabled()` devuelve `false` (`import.meta.env.PROD`).

## Progreso del estudiante

Sin backend. El progreso se persiste en `localStorage` vía `src/hooks/useProgress.js`.

## Añadir una clase nueva

1. Crear carpeta `class-NN-slug/` con el paquete estándar (`lesson.md`, `slides.html`, etc.).
2. Añadir la carpeta a `STATIC_DIRS` en `vite.config.js`.
3. Registrar la clase en `src/data/curriculum.js`.
4. Crear `src/pages/ClassNN.jsx` y la ruta en `src/App.jsx`.
5. Actualizar `markdownBackLink()` en `src/lib/markdown.js` si aplica.
6. Renovar slides siguiendo [slides-vs-lesson.md](./slides-vs-lesson.md).

## Currículo

La fuente de verdad del índice de clases en el sitio es `src/data/curriculum.js`. Los módulos 1–5 y el capstone están definidos ahí; las clases 05–12 aparecen como *coming soon* hasta que exista su paquete.
