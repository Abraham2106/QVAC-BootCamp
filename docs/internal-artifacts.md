# Artefactos internos (`_internal/`)

Material **local del equipo** que no forma parte del sitio en producción. Toda la carpeta `_internal/` está en `.gitignore`.

## Estructura

```
_internal/
├── prompts/          # Prompt packs de autoría (construction, study plan, clases)
├── drafts/           # Borradores de slides / HTML no enlazados desde la SPA
├── tooling/          # Herramientas de generación (p. ej. OpenCode + frontend-slides)
├── agents/           # Configuración local de agentes
├── scripts/          # Scripts de mantenimiento internos
└── workspace/        # Artefactos sueltos del workspace (presentations, cachés)
```

## Qué sí se versiona

- `class-NN-*/` — paquetes de clase (lesson, lab, slides, assessment)
- `src/`, `lessons/`, `assets/`, `docs/`
- Prompts **NotebookLM** dentro de `class-NN-*/notebooklm/` (parte del paquete de clase)

## Referencias en lecciones

Los `lesson.md` pueden citar rutas bajo `_internal/prompts/` para el autor; esas rutas son locales y no se despliegan.
