# Estructura del sitio

El bootcamp es una **SPA React** servida por Vite. El contenido pedagógico (markdown, slides HTML, labs) vive en carpetas estáticas copiadas a `dist/` en cada build.

## Diagrama de alto nivel

```
QVAC-BootCamp/
├── src/                    # Aplicación React (rutas, layout, componentes)
├── class-NN-*/             # Paquetes de clase (contenido estático)
├── lessons/                # Lecciones HTML (class-01.html … class-08.html)
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
| `/class/01` … `/class/10` | `Class01` … `Class10` (páginas dedicadas con DoD y progreso) | Página de clase: lección HTML, artefactos, progreso |
| `/markdown/*` | `MarkdownPage` | Visor SPA de archivos `.md` estáticos |
| `*` | `NotFound` | 404 |

## Carpetas estáticas (`STATIC_DIRS`)

Definidas en `vite.config.js`. En **dev** se sirven por middleware; en **build** se copian recursivamente a `dist/`:

- `class-01-airplane-mode-intelligence`
- `class-02-models-gguf-lifecycle`
- `class-03-local-inference-fundamentals`
- `class-04-build-offline-chat`
- `class-05-embeddings-meaning-as-geometry`
- `class-06-local-rag-private-knowledge`
- `class-07-speech-systems`
- `class-08-translation-voice-relay`
- `class-09-openai-compatible-escape-hatch`
- `class-10-local-first-architectures`
- `lessons`
- `assets`

Ejemplo: `/class-06-local-rag-private-knowledge/lesson.md` → archivo estático; el visor SPA lo abre en `/markdown/class-06-local-rag-private-knowledge/lesson.md`.

## Lecciones HTML y estilo editorial

Las clases **01–10** tienen lección completa en dos formatos sincronizados:

| Formato | Ruta | Uso |
|---------|------|-----|
| Markdown canónico | `class-NN-slug/lesson.md` | Fuente de verdad, visor SPA |
| HTML con sidebar | `lessons/class-NN.html` | Lectura con TOC agrupado |

Ambos siguen la guía [lesson-w3schools-style.md](./lesson-w3schools-style.md): definiciones por término, tablas de referencia API, ejemplos con resultado esperado, tono factual (estilo W3Schools). El layout HTML conserva `lesson-layout` (sidebar + artículo); no se altera la SPA.

Regla: editar primero `lesson.md`, luego replicar en `lessons/class-NN.html`. Ver también [slides-vs-lesson.md](./slides-vs-lesson.md).

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
6. Crear `lessons/class-NN.html` siguiendo [lesson-w3schools-style.md](./lesson-w3schools-style.md) (paridad con `lesson.md`).
7. Renovar slides siguiendo [slides-vs-lesson.md](./slides-vs-lesson.md).

## Currículo

La fuente de verdad del índice de clases en el sitio es `src/data/curriculum.js`. Los módulos 1–5 y el capstone están definidos ahí; las clases 07–12 aparecen como *coming soon* hasta que exista su paquete.
