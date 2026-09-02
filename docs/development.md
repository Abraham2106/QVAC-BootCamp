# Desarrollo local

Guía para trabajar en el sitio del bootcamp en tu máquina.

## Requisitos

- **Node.js** 20+ (recomendado LTS)
- **npm** 10+

## Instalación

```bash
cd QVAC-BootCamp
npm install
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo Vite → `http://localhost:5173` |
| `npm run build` | Build de producción → `dist/` (SPA + assets estáticos + bundle Mermaid) |
| `npm run build:mermaid` | Solo el bundle estático de Mermaid |
| `npm run preview` | Sirve `dist/` localmente para validar el build |

## Modo Ninja

El modo Ninja está habilitado tanto en desarrollo como en el build de producción. La preferencia Docs/Ninja se guarda en `localStorage` bajo `bootcamp.uiMode`.

El **modo Ninja** es una variante visual experimental (UI oscura, acentos neón). Está pensado para pruebas de diseño, **no** para estudiantes en producción.

- **Habilitado** cuando `import.meta.env.PROD === false` (servidor `npm run dev`).
- **Deshabilitado** en builds de producción: el toggle no se renderiza, `localStorage` se sanitiza y el script inline de `index.html` no aplica ninja (plugin `disable-ninja-in-prod-html` en `vite.config.js`).

Archivos relevantes:

- `src/lib/uiMode.js` — `isNinjaEnabled()`, persistencia de modo
- `src/components/UiModeToggle.jsx` — toggle Docs / Ninja
- `src/styles/ninja.css` — estilos del modo alternativo

## Variables de entorno

El proyecto no requiere `.env` para desarrollo ni despliegue estático. Si añades variables en el futuro, usa el prefijo `VITE_` (convención Vite) y documenta en este archivo. **No commitear** archivos `.env` con secretos.

## Artefactos internos (`_internal/`)

Material local del equipo (prompt packs, borradores, tooling OpenCode, agentes) vive en **`_internal/`** en la raíz de `QVAC-BootCamp/`. Esa carpeta está en `.gitignore` — no se despliega ni se versiona. Ver [internal-artifacts.md](./internal-artifacts.md).

Los prompts **NotebookLM** dentro de `class-NN-*/notebooklm/` sí forman parte del paquete de clase y **sí** se versionan.

## Herramientas opcionales

- **`_internal/tooling/opencode/`** — skill `frontend-slides` para generar/iterar decks (uso interno).
- Slides publicados de clase: `class-NN-*/slides.html` servidos estáticamente e embebidos vía `SlidesEmbed.jsx`.

## Verificación antes de PR

```bash
npm run build
npm run preview
```

Comprobar rutas `/`, `/curriculum`, `/class/01`–`/class/04` y que no aparece el toggle Ninja en el preview (build de prod).
