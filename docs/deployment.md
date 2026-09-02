# Despliegue en producción

El sitio es una **SPA estática**. No hay servidor Node en runtime: se despliega el contenido de `dist/`.

> Estado actual: Ninja está habilitado en producción. Antes de desplegar, valida que el toggle Docs/Ninja se muestra y que la preferencia `bootcamp.uiMode` se conserva al recargar.

## Build

Desde `QVAC-BootCamp/`:

```bash
npm ci          # o npm install en CI
npm run build
```

El script ejecuta:

1. **`vite build`** — bundle React → `dist/` + copia de carpetas estáticas (`class-*`, `lessons`, `assets`).
2. **`vite build --config vite.mermaid.config.js`** — bundle Mermaid para diagramas en lecciones.

Salida: carpeta **`dist/`** lista para hosting estático (Netlify, Vercel, S3 + CloudFront, GitHub Pages, etc.).

## Previsualización local del build

```bash
npm run preview
```

Abre la URL que indique Vite (típicamente `http://localhost:4173`) y valida navegación SPA, slides embebidos y assets de clase.

## Configuración del host

| Aspecto | Recomendación |
|---------|---------------|
| **Document root** | Contenido de `dist/` |
| **Fallback SPA** | Todas las rutas desconocidas → `index.html` (history API de React Router) |
| **Cache** | Hashes en assets JS/CSS de Vite; HTML con cache corto o `no-cache` |
| **HTTPS** | Obligatorio en producción |

### Ejemplo: fallback SPA (Netlify)

Archivo `public/_redirects` o regla equivalente:

```
/*    /index.html   200
```

(Vite copia `public/` a `dist/` si existe.)

## Modo Ninja — deshabilitado en producción

En producción **no** debe estar disponible el modo Ninja:

- `isNinjaEnabled()` retorna `false` cuando `import.meta.env.PROD` es verdadero.
- El toggle Docs/Ninja **no se muestra**.
- Cualquier preferencia `ninja` en `localStorage` se resetea a `docs`.
- El script inline en `index.html` que evita FOUC de tema tiene ninja desactivado en el HTML generado por build.

**No** hace falta variable de entorno adicional: el comportamiento correcto viene del build de Vite (`command === 'build'`).

## Secretos y datos sensibles

- No hay API keys en el frontend actual.
- No commitear `.env` ni credenciales.
- El progreso del usuario vive solo en `localStorage` del navegador.

## Checklist pre-deploy

- [ ] `npm run build` termina sin errores
- [ ] `npm run preview` — rutas principales OK
- [ ] Toggle Ninja **ausente** en preview
- [ ] Slides de al menos una clase cargan en iframe/embed
- [ ] Links a markdown de lab/challenge resuelven en `/markdown/...`
- [ ] `dist/` no incluye `_internal/`, `_prompts/`, `.env`, ni `node_modules/`

## Baseline publicado

Footer del sitio referencia **QVAC SDK v0.18.x / v0.18.1**. Actualizar copy y lecciones cuando suba la versión canónica del SDK.
