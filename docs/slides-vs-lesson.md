# Slides vs. Lección canónica

Las diapositivas (`slides.html`) y la lección (`lesson.md`) cubren el **mismo currículo**, pero con roles distintos. No deben duplicarse.

## Regla de oro

**Ningún párrafo de `lesson.md` se copia verbatim a `slides.html`.**  
Las slides destilan, visualizan y provocan; la lección explica, demuestra y referencia.

## División de responsabilidades

| Lección canónica (`lesson.md`) | Presentación (`slides.html`) |
|--------------------------------|------------------------------|
| Lectura profunda, pruebas, walkthroughs de código | Historia visual, hooks, una idea por slide |
| Explicaciones completas y citas | Diagramas, antes/después, árboles de decisión |
| Detalle ejecutable (snippets completos, schemas) | Ritmo del instructor, preguntas de discusión, checkpoints de demo |
| Material de referencia permanente | Marcos memorables, analogías, anti-patrones en rojo |

## Estructura típica del deck (15–25 slides)

1. **Título** — gancho de clase (no el título literal de la lección)
2. **Pregunta esencial** — 1 slide, tipografía grande
3. **Por qué importa** — 1–2 slides (historia/analogía propia)
4. **Modelo mental** — diagrama o flujo
5. **Predict → Run → Explain** — compromiso antes de ejecutar
6. **Conceptos núcleo** — 3–5 slides, UN concepto cada una
7. **Live demo beats** — checkpoints numerados para el instructor
8. **Break It · Measure It** — modos de fallo
9. **DoD preview** — checklist icónica, no rúbrica completa
10. **Puente** — qué lleva a la siguiente clase

## Qué queda solo en la lección

- Snippets de código completos y explicación línea a línea
- Tablas extensas de API, schemas JSON, acceptance tests A–G
- Enlaces a documentación QVAC y release notes
- Rúbrica, checkpoint completo, solución del instructor
- Derivaciones, matices de runtime (Bare vs Node), edge cases

## Qué queda solo en las slides

- Analogías de aula (“modo avión”, “tres ciclos de vida”)
- Preguntas Predict escritas en vivo
- Anti-patrones resaltados para memoria rápida
- Secuencia de demo en vivo (qué correr, qué preguntar)
- Puente narrativo entre clases

## Auditoría rápida (Clases 01–04)

| Clase | Slides | Overlap estimado | Notas |
|-------|--------|-----------------|-------|
| 01 | 25 | ~35% temático | Deck visual complementario; sin copy-paste literal |
| 02 | ~24 | ~40% temático | Anatomía GGUF en slides; detalle de catálogo en lección |
| 03 | ~24 | ~40% temático | Inferencia/fases en slides; experimentos y profiler en lección |
| 04 | 22 | ~25% temático | **Renovado 2026-08-26** — app/chat/state; ya no repite Clase 3 |

## Mantenimiento

Al actualizar una clase:

1. Edita primero `lesson.md` (fuente de verdad).
2. Renueva `slides.html` con ideas **nuevas en redacción**, no extractos.
3. Verifica que `SlidesEmbed.jsx` sigue resolviendo la ruta y el contador de slides.
4. Si `lessons/class-NN.html` está desactualizado, prioriza enlace a Markdown canónico.
