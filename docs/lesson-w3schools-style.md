# Guía editorial: estilo W3Schools para lecciones QVAC

Contrato de redacción para `lesson.md` y `lessons/class-NN.html`. El layout (sidebar, `.block`, `.codebox`) no cambia; cambia el contenido y la estructura interna de secciones.

## Tono

- Oraciones cortas y declarativas. Un hecho por frase.
- Evitar retórica vacía: *"la demostración más pura"*, *"revoluciona"*, *"dominarás"*, promesas sin condición.
- Mantener honestidad técnica: baseline SDK, límites, *"depende del hardware"*, *"no prueba verdad"*.
- Español claro; términos en inglés cuando son API (`loadModel`, `contentDelta`) con definición la primera vez.

## Patrón por concepto

Cada término nuevo sigue este ciclo:

```markdown
### [Término]

**Definición:** qué es, en una oración.

**Uso:** cuándo aplica y qué problema resuelve.

**Sintaxis / API:** tabla o firma mínima.

**Ejemplo:** snippet ejecutable.

**Resultado:** qué deberías observar (salida, evento, métrica).

**Nota:** matices, versiones, errores comunes.
```

### Mapeo HTML

```html
<section id="termino-slug">
  <h3>Término</h3>
  <p><strong>Definición:</strong> …</p>
  <p><strong>Uso:</strong> …</p>
  <table class="booktabs api-ref">…</table>
  <div class="block example">
    <div class="block-title">Ejemplo</div>
    <div class="block-body">…</div>
  </div>
  <pre class="codebox"><code>…</code></pre>
  <div class="block">
    <div class="block-title">Resultado</div>
    <div class="block-body">…</div>
  </div>
  <div class="block alert">
    <div class="block-title">Nota</div>
    <div class="block-body">…</div>
  </div>
</section>
```

## Secciones estándar

| Sección | Contenido |
|---------|-----------|
| **Introducción** | 2–3 frases de contexto técnico |
| **Qué aprenderás** | Capacidades verificables (lista numerada) |
| **Definición y contexto** | Problema técnico, no storytelling |
| **Términos** | Glosario con tabla índice + subsecciones Definición/Uso/Ejemplo |
| **Referencia QVAC** | Una subsección por función con tabla de parámetros |
| **Ejemplo completo** | Flujo mínimo ejecutable |
| **Antes de ejecutar** | Hipótesis concretas antes del lab |
| **Práctica guiada** | Pasos numerados del lab |
| **Errores comunes** | Síntoma → causa → corrección |
| **Medición** | Qué medir, unidad, interpretación |
| **Resumen** | 3–5 bullets factuales |
| **Fuentes** | Enlaces a docs QVAC |

## Sidebar TOC agrupado

```html
<span class="toc-head">INTRODUCCIÓN</span>
<a href="#intro">…</a>
<span class="toc-head">TÉRMINOS</span>
<a href="#…">…</a>
<span class="toc-head">REFERENCIA QVAC</span>
<a href="#…">…</a>
<span class="toc-head">EJEMPLOS</span>
<a href="#…">…</a>
<span class="toc-head">PRÁCTICA</span>
<a href="#…">…</a>
```

## Sincronía lesson.md ↔ HTML

1. Editar primero `lesson.md` (fuente canónica).
2. Replicar el mismo contenido en `lessons/class-NN.html` con markup semántico.
3. No resumir en HTML: paridad completa de texto.

## Qué no tocar

- `slides.html` — complemento visual (ver `docs/slides-vs-lesson.md`).
- Labs, challenges, assessment — fuera de alcance salvo enlaces rotos.
- Componentes React de la SPA — sin cambios estructurales.
