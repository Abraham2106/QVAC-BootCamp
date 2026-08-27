# Clase 06 — Local RAG and Private Knowledge

> **Pregunta esencial:** ¿Cómo puede un modelo responder desde conocimiento que no vive en sus pesos?

## Resultados de aprendizaje

Al terminar podrás construir y depurar un pipeline RAG local, inspeccionar retrieval antes de generación y explicar si un fallo pertenece a búsqueda, contexto o generación.

## Por qué importa

Un LLM local conoce lo que está representado en sus pesos y lo que recibe en su contexto actual. Tus notas privadas, manuales internos o documentos recientes no aparecen mágicamente dentro de esos pesos.

RAG añade una memoria externa recuperable:

```text
modelo = conocimiento paramétrico
workspace/vector store = conocimiento externo recuperable
```

La separación es importante porque permite actualizar documentos sin volver a entrenar el modelo y mantener el corpus en una frontera local.

## Del embedding al RAG

Clase 05 terminó aquí:

```text
query → embedding → similarity → Top-K
```

Clase 06 agrega persistencia y generación:

```text
document
  ↓
chunk
  ↓
embed
  ↓
store
  ↓
retrieve Top-K
  ↓
construct context
  ↓
generate grounded answer
```

## Chunking

Un documento grande suele dividirse antes de embedding. El objetivo no es “hacer pedazos por hacerlos”, sino crear unidades recuperables que mantengan suficiente contexto sin introducir ruido excesivo.

Tradeoff conceptual:

```text
chunks muy pequeños → precisión local, contexto perdido
chunks muy grandes   → más contexto, más ruido y menor especificidad
```

La API actual de QVAC documenta `ragChunk()` con opciones como `chunkSize`, `chunkOverlap`, `chunkStrategy` y `splitStrategy`. Verifica firmas actuales antes de modificar el laboratorio.

## Inside QVAC: managed RAG

La documentación v0.18.x expone:

- `ragChunk()` — dividir documentos;
- `ragIngest()` — embed + persist en workspace;
- `ragSaveEmbeddings()` — persistir vectores precomputados;
- `ragSearch()` — recuperar resultados similares;
- `ragReindex()`;
- `ragDeleteEmbeddings()`;
- `ragListWorkspaces()`;
- `ragCloseWorkspace()`;
- `ragDeleteWorkspace()`.

El flujo gestionado más simple es:

```text
load embeddings model
      ↓
ragIngest({ modelId, workspace, documents })
      ↓
ragSearch({ modelId, workspace, query, topK })
      ↓
ragCloseWorkspace(...)
      ↓
unloadModel()
```

QVAC persiste los vectores del workspace. La aplicación sigue siendo responsable de decidir qué documentos, metadata, evidencias y políticas de grounding presentar.

## Retrieval antes de generation

Nunca escondas retrieval durante esta clase.

Antes de llamar al LLM, imprime:

```text
rank
score
content
source metadata disponible
```

Esto crea una frontera de diagnóstico:

```text
pregunta
  ↓
¿recuperamos evidencia correcta?
  ├─ NO → retrieval failure
  └─ SÍ
       ↓
   ¿la respuesta usa correctamente la evidencia?
       ├─ NO → generation/grounding failure
       └─ SÍ → pipeline correcto para este caso
```

## Grounding

Retrieval no es la respuesta. Los chunks recuperados deben entrar como contexto de una completion.

Una forma pedagógica simple:

```text
SYSTEM/INSTRUCTION:
Responde usando solamente la evidencia proporcionada.
Si la evidencia es insuficiente, dilo.

EVIDENCE:
[1] ...
[2] ...
[3] ...

QUESTION:
...
```

El formato exacto es lógica de aplicación, no una API mágica de citations.

## Provenance

Una respuesta grounded debe permitir que el usuario vea de dónde vino la evidencia. Usa metadata disponible en tus documentos/workspace o, en el laboratorio pequeño, IDs/fuentes mantenidos por la app.

**No inventes citas.** Si el resultado de retrieval no expone un campo concreto, no lo fabriques como si viniera de QVAC.

## Ejemplo gestionado

La documentación actual muestra este patrón:

```ts
const result = await ragIngest({
  modelId: embeddingModelId,
  workspace: 'notes-demo',
  documents,
  chunk: false,
})

const hits = await ragSearch({
  modelId: embeddingModelId,
  workspace: 'notes-demo',
  query,
  topK: 3,
})
```

Los resultados documentados incluyen `score` y `content` en el ejemplo oficial.

## Predict

Tienes tres notas:

1. “El servidor OpenAI-compatible de QVAC usa localhost:11434/v1.”
2. “GGUF es el formato de modelo usado por llama.cpp.”
3. “La receta usa 500 g de harina.”

Pregunta:

> “¿En qué endpoint local conectaría un cliente OpenAI-compatible?”

Antes de ejecutar, predice cuál chunk debería ser Top-1.

## Build — Transparent RAG Debugger

1. Carga modelo de embeddings.
2. Ingesta 8–15 notas en un workspace.
3. Haz `ragSearch()`.
4. Imprime Top-K **antes** de generation.
5. Construye el bloque EVIDENCE.
6. Carga/reutiliza un LLM local.
7. Ejecuta completion.
8. Muestra respuesta + fuentes.
9. Registra retrieval latency y generation latency por separado.

## Unknown Knowledge Test

Pregunta algo que **no exista** en el corpus.

La conducta deseada no es “responder de todas formas”. El sistema debe detectar que no posee evidencia suficiente según la política que diseñes y responder de forma explícita.

La detección puede depender de contenido, ranking, thresholds evaluados o una instrucción de grounding; no inventes un threshold universal.

## Break It — Poor Retrieval

Provoca un fallo controlado. Ejemplos:

- chunking demasiado agresivo;
- documento relevante omitido del corpus;
- query extremadamente vaga;
- Top-K demasiado pequeño.

Predice el efecto antes de ejecutar.

Después responde:

> ¿Falló retrieval o generation?

## Measure It

Separa:

- ingest/chunking time;
- query embedding + vector search / retrieval latency;
- LLM TTFT si lo mides;
- generation total latency;
- Top-K y scores observados;
- qualitative answer correctness/faithfulness.

No sumes todo bajo una única etiqueta “RAG latency” si quieres diagnosticar.

## Common misconceptions

### “RAG mete los documentos en los pesos”

No. Retrieval aporta contexto externo en query-time.

### “Si el LLM alucina, RAG falló”

Tal vez retrieval fue correcto y generation ignoró/malinterpretó evidencia.

### “Top-K alto siempre mejora”

Más contexto puede añadir ruido. Debe evaluarse.

### “Un score define un threshold universal”

Los scores dependen del modelo, corpus, distribución y métrica. Evalúa tu caso.

### “Citation = URL inventada por el LLM”

Provenance debe venir de metadata real mantenida por el pipeline.

## Architecture connection

```text
Clase 05 → representación y ranking
Clase 06 → persistencia + retrieval + grounding
Clase 07 → la entrada/salida puede pasar a voz
Clase 12 → retrieval/inference podrán vivir en nodos distintos
```

## Checkpoint

1. Distingue memoria paramétrica y externa.
2. ¿Por qué hay que inspeccionar retrieval antes de generation?
3. ¿Qué tradeoff introduce chunk size?
4. La evidencia correcta aparece Top-1, pero el LLM responde algo incompatible. ¿Qué etapa sospechas primero?
5. La respuesta parece incorrecta y el documento relevante ni aparece en Top-K. ¿Dónde empiezas a depurar?
6. ¿Por qué no existe un Top-K o score threshold universal para todos los corpora?
7. Diseña un Unknown Knowledge Test.

## Takeaway

> **RAG no es una sola llamada. Es una cadena observable donde retrieval y generation pueden fallar de formas distintas.**

## Fuentes usadas

- https://docs.qvac.tether.io/ai-capabilities/rag/
- https://docs.qvac.tether.io/ai-capabilities/text-embeddings/
- https://docs.qvac.tether.io/ai-capabilities/text-generation/
- https://docs.qvac.tether.io/reference/api/
- https://docs.qvac.tether.io/reference/release-notes/
- https://arxiv.org/abs/2005.11401

**Baseline:** QVAC SDK v0.18.x / v0.18.1.