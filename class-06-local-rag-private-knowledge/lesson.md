# Clase 6 — Local RAG and Private Knowledge

> **The Local-First AI Systems Masterclass** · Módulo 2 — Private Knowledge
> **Baseline técnico:** QVAC SDK v0.18.x / v0.18.1, verificado contra la documentación oficial el 2026-08-27.

---

## Introducción

Un LLM local conoce lo que está representado en sus pesos y lo que recibe en su contexto actual. Tus notas privadas, manuales internos o documentos recientes no aparecen dentro de esos pesos.

RAG (Retrieval-Augmented Generation) añade una memoria externa recuperable: documentos se embeben, persisten y se recuperan en query-time para fundamentar la generación.

---

## Qué aprenderás

Al terminar esta lección podrás:

1. **Distinguir** conocimiento paramétrico de conocimiento externo recuperable.
2. **Construir** un pipeline RAG local con `ragIngest()` y `ragSearch()`.
3. **Inspeccionar** retrieval antes de invocar al LLM.
4. **Groundear** respuestas con evidencia recuperada y provenance real.
5. **Diagnosticar** si un fallo pertenece a búsqueda, contexto o generación.
6. **Medir** ingest, retrieval y generation por separado.

---

## Definición y contexto

Un LLM local tiene dos fuentes de información:

```text
modelo = conocimiento paramétrico
workspace/vector store = conocimiento externo recuperable
```

La separación permite actualizar documentos sin volver a entrenar el modelo y mantener el corpus en una frontera local.

**Del embedding al RAG:**

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

**Conexión arquitectónica:**

```text
Clase 05 → representación y ranking
Clase 06 → persistencia + retrieval + grounding
Clase 07 → la entrada/salida puede pasar a voz
Clase 12 → retrieval/inference podrán vivir en nodos distintos
```

---

## Términos

### Índice rápido

| Término | Definición breve | ¿Lo provee QVAC? |
|---|---|---|
| **Parametric vs external knowledge** | Pesos del modelo vs documentos recuperables | Parcial (RAG API) |
| **Chunk** | Fragmento de documento embebible | Sí (`ragChunk()`) |
| **Ingest** | Embed + persistir en workspace | Sí (`ragIngest()`) |
| **Retrieval** | Recuperar Top-K chunks similares a la query | Sí (`ragSearch()`) |
| **Grounding** | Generar usando solo evidencia recuperada | No (aplicación) |
| **Provenance** | Metadata de origen de la evidencia | Parcial (app + workspace) |
| **Workspace** | Contenedor persistente de vectores RAG | Sí |
| **ragChunk()** | Dividir documentos en chunks | Sí |
| **ragIngest()** | Ingestar documentos en workspace | Sí |
| **ragSearch()** | Buscar en workspace | Sí |

### Parametric vs external knowledge

**Definición:** El conocimiento **paramétrico** vive en los pesos del LLM. El conocimiento **externo** vive fuera de los pesos — en documentos embebidos y persistidos — y se recupera en query-time.

**Uso:** Separar lo que el modelo "sabe" de lo que tu corpus contiene. RAG no mete documentos en los pesos.

**Ejemplo:**

```text
modelo = conocimiento paramétrico
workspace = conocimiento externo recuperable
```

**Resultado:** Puedes actualizar documentos sin reentrenar el modelo.

**Nota:** Retrieval aporta contexto externo en query-time. No modifica los pesos.

### Chunk

**Definición:** Fragmento de un documento grande, embebible y recuperable como unidad.

**Uso:** Un documento largo suele dividirse antes de embedding para crear unidades con suficiente contexto sin ruido excesivo.

**Tradeoff:**

```text
chunks muy pequeños → precisión local, contexto perdido
chunks muy grandes   → más contexto, más ruido y menor especificidad
```

**Sintaxis / API:** `ragChunk()` con opciones como `chunkSize`, `chunkOverlap`, `chunkStrategy` y `splitStrategy`. Verifica firmas actuales antes de modificar el laboratorio.

**Nota:** El tamaño correcto debe evaluarse sobre el corpus concreto.

### Ingest

**Definición:** Proceso de embeber documentos y persistirlos en un workspace.

**Uso:** Preparar el corpus para retrieval. Combina chunking (opcional), embedding y almacenamiento.

**Sintaxis / API:** `ragIngest({ modelId, workspace, documents, chunk })`.

**Ejemplo:**

```ts
const result = await ragIngest({
  modelId: embeddingModelId,
  workspace: 'notes-demo',
  documents,
  chunk: false,
})
console.log('processed:', result.processed.length)
```

**Resultado:** Vectores persistidos en el workspace. QVAC gestiona el almacenamiento.

**Nota:** La aplicación decide qué documentos, metadata y políticas presentar.

### Retrieval

**Definición:** Recuperar los chunks más similares a una query desde el workspace.

**Uso:** Obtener evidencia antes de generar. Nunca escondas retrieval durante esta clase.

**Sintaxis / API:** `ragSearch({ modelId, workspace, query, topK })`.

**Ejemplo:**

```ts
const hits = await ragSearch({
  modelId: embeddingModelId,
  workspace: 'notes-demo',
  query,
  topK: 3,
})

hits.forEach((hit, index) => {
  console.log(`#${index + 1} score=${hit.score}`)
  console.log(hit.content)
})
```

**Resultado:** Lista de hits con `score` y `content` (según documentación v0.18.x).

**Nota:** Inspecciona rank, score, content y metadata disponible **antes** de llamar al LLM.

### Grounding

**Definición:** Construir una respuesta usando solamente la evidencia recuperada como contexto.

**Uso:** Evitar que el LLM invente hechos no presentes en el corpus. Retrieval no es la respuesta; los chunks entran como contexto de una completion.

**Ejemplo (lógica de aplicación):**

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

**Resultado:** Respuesta condicionada por evidencia. El formato exacto es lógica de aplicación, no una API mágica de citations.

**Nota:** Si la evidencia correcta aparece Top-1 pero el LLM responde algo incompatible, sospecha de grounding/generation — no de retrieval.

### Provenance

**Definición:** Información de origen que permite al usuario ver de dónde vino la evidencia.

**Uso:** Citas y trazabilidad. Usa metadata disponible en tus documentos/workspace o IDs/fuentes mantenidos por la app.

**Ejemplo:**

```ts
const notes = [
  { source: 'qvac-http.md', text: 'The QVAC OpenAI-compatible HTTP server defaults to http://localhost:11434/v1/.' },
]
// En retrieval, mapea hit.content → note.source
```

**Resultado:** Citas provenientes de metadata real.

**Nota:** **No inventes citas.** Si el resultado de retrieval no expone un campo concreto, no lo fabriques como si viniera de QVAC.

### Workspace

**Definición:** Contenedor persistente donde QVAC almacena los vectores de un corpus RAG.

**Uso:** Separar corpora distintos (p. ej. `notes-demo`, `manual-v2`). Lifecycle gestionado con `ragCloseWorkspace()`, `ragDeleteWorkspace()`, `ragListWorkspaces()`.

**Ejemplo:**

```ts
const workspace = 'notes-demo'
await ragIngest({ modelId, workspace, documents })
const hits = await ragSearch({ modelId, workspace, query, topK: 3 })
await ragCloseWorkspace({ workspace, deleteOnClose: true })
```

**Resultado:** Vectores persistidos bajo un nombre de workspace reutilizable entre sesiones (hasta cerrar/eliminar).

**Nota:** QVAC persiste los vectores. La app controla metadata y políticas.

### ragChunk()

**Definición:** Divide documentos en chunks antes de embedding.

**Uso:** Preparar documentos largos para ingest. Alternativa a pasar `chunk: true` en `ragIngest()`.

**Sintaxis / API:** Opciones documentadas incluyen `chunkSize`, `chunkOverlap`, `chunkStrategy`, `splitStrategy`.

**Nota:** Verifica firmas actuales en la documentación v0.18.x antes de modificar el laboratorio.

### ragIngest()

**Definición:** Embebe documentos y los persiste en un workspace.

**Uso:** Flujo gestionado principal de ingestión RAG en QVAC.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `modelId` | `string` | ID del modelo de embeddings cargado |
| `workspace` | `string` | Nombre del workspace |
| `documents` | `string[]` | Documentos a ingestar |
| `chunk` | `boolean` | Si dividir documentos antes de embeber |

**Resultado:** Objeto con `processed` y estadísticas de la operación.

### ragSearch()

**Definición:** Recupera chunks similares a la query desde un workspace.

**Uso:** Etapa de retrieval del pipeline RAG.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `modelId` | `string` | ID del modelo de embeddings |
| `workspace` | `string` | Workspace donde buscar |
| `query` | `string` | Texto de consulta |
| `topK` | `number` | Número de resultados |

**Resultado:** Array de hits con `score` y `content`.

---

## Referencia QVAC

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

Flujo gestionado más simple:

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

### ragIngest()

```ts
import { GTE_LARGE_FP16, loadModel, ragIngest } from '@qvac/sdk'

const modelId = await loadModel({ modelSrc: GTE_LARGE_FP16, modelType: 'embeddings' })

const result = await ragIngest({
  modelId,
  workspace: 'notes-demo',
  documents: [
    'The QVAC OpenAI-compatible server uses http://localhost:11434/v1/ by default.',
    'GGUF is the model format used by llama.cpp-compatible local inference workflows.',
  ],
  chunk: false,
})
```

### ragSearch()

```ts
import { ragSearch } from '@qvac/sdk'

const hits = await ragSearch({
  modelId,
  workspace: 'notes-demo',
  query: 'Where should an OpenAI-compatible client connect locally?',
  topK: 3,
})

hits.forEach((hit, i) => {
  console.log(`#${i + 1} score=${hit.score} ${hit.content}`)
})
```

### ragCloseWorkspace()

```ts
await ragCloseWorkspace({ workspace: 'notes-demo', deleteOnClose: true })
```

---

## Ejemplo completo

Retrieval transparente — inspeccionar hits antes de generar:

```ts
import {
  close,
  GTE_LARGE_FP16,
  loadModel,
  ragCloseWorkspace,
  ragIngest,
  ragSearch,
  unloadModel,
} from '@qvac/sdk'

const workspace = 'class06-managed-demo'
const documents = [
  'The QVAC OpenAI-compatible server uses http://localhost:11434/v1/ by default.',
  'GGUF is the model format used by llama.cpp-compatible local inference workflows.',
  'A basic bread recipe can use flour, water, yeast, and salt.',
]

const query = 'Where should an OpenAI-compatible client connect locally?'
let modelId: string | undefined

try {
  modelId = await loadModel({ modelSrc: GTE_LARGE_FP16, modelType: 'embeddings' })

  const ingestStart = performance.now()
  await ragIngest({ modelId, workspace, documents, chunk: false })
  const ingestMs = performance.now() - ingestStart

  const retrievalStart = performance.now()
  const hits = await ragSearch({ modelId, workspace, query, topK: 3 })
  const retrievalMs = performance.now() - retrievalStart

  hits.forEach((hit, index) => {
    console.log(`\n#${index + 1} score=${hit.score}`)
    console.log(hit.content)
  })
  console.log('\ningestMs:', ingestMs.toFixed(1), 'retrievalMs:', retrievalMs.toFixed(1))
} finally {
  await ragCloseWorkspace({ workspace, deleteOnClose: true }).catch(() => {})
  if (modelId) await unloadModel({ modelId })
  await close()
}
```

RAG grounded — retrieval + completion:

```ts
import {
  close, completion, GTE_LARGE_FP16, loadModel, QWEN3_600M_INST_Q4,
  ragCloseWorkspace, ragIngest, ragSearch, unloadModel,
} from '@qvac/sdk'

const workspace = 'class06-grounded-demo'
const notes = [
  { source: 'qvac-http.md', text: 'The QVAC OpenAI-compatible HTTP server defaults to http://localhost:11434/v1/.' },
  { source: 'models.md', text: 'QVAC supports llama.cpp-compatible GGUF models for local text generation.' },
]

const query = 'What local base URL should an OpenAI-compatible client use?'
let embeddingModelId: string | undefined
let llmModelId: string | undefined

try {
  embeddingModelId = await loadModel({ modelSrc: GTE_LARGE_FP16, modelType: 'embeddings' })
  llmModelId = await loadModel({ modelSrc: QWEN3_600M_INST_Q4, modelConfig: { ctx_size: 4096 } })

  await ragIngest({
    modelId: embeddingModelId,
    workspace,
    documents: notes.map((n) => n.text),
    chunk: false,
  })

  const hits = await ragSearch({ modelId: embeddingModelId, workspace, query, topK: 3 })

  console.log('\nRETRIEVED EVIDENCE')
  hits.forEach((hit, i) => {
    const note = notes.find((n) => n.text === hit.content)
    console.log(`[${i + 1}] score=${hit.score} source=${note?.source ?? 'unknown'}`)
    console.log(hit.content)
  })

  const evidence = hits.map((hit, i) => `[${i + 1}] ${hit.content}`).join('\n')
  const prompt = `You answer only from EVIDENCE. If insufficient, say "Insufficient evidence".\n\nEVIDENCE:\n${evidence}\n\nQUESTION:\n${query}`

  const run = completion({ modelId: llmModelId, history: [{ role: 'user', content: prompt }], stream: true })
  for await (const event of run.events) {
    if (event.type === 'contentDelta') process.stdout.write(event.delta)
  }
  await run.final
} finally {
  await ragCloseWorkspace({ workspace, deleteOnClose: true }).catch(() => {})
  if (llmModelId) await unloadModel({ modelId: llmModelId })
  if (embeddingModelId) await unloadModel({ modelId: embeddingModelId })
  await close()
}
```

Ejemplos ejecutables en `examples/`.

---

## Antes de ejecutar

Tienes tres notas:

1. "El servidor OpenAI-compatible de QVAC usa localhost:11434/v1."
2. "GGUF es el formato de modelo usado por llama.cpp."
3. "La receta usa 500 g de harina."

Pregunta:

> "¿En qué endpoint local conectaría un cliente OpenAI-compatible?"

Antes de ejecutar, predice cuál chunk debería ser Top-1.

**Frontera de diagnóstico:**

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

**Checkpoint:**

1. Distingue memoria paramétrica y externa.
2. ¿Por qué hay que inspeccionar retrieval antes de generation?
3. ¿Qué tradeoff introduce chunk size?
4. La evidencia correcta aparece Top-1, pero el LLM responde algo incompatible. ¿Qué etapa sospechas primero?
5. La respuesta parece incorrecta y el documento relevante ni aparece en Top-K. ¿Dónde empiezas a depurar?
6. ¿Por qué no existe un Top-K o score threshold universal para todos los corpora?
7. Diseña un Unknown Knowledge Test.

---

## Práctica guiada

### Build — Transparent RAG Debugger

1. Carga modelo de embeddings.
2. Ingesta 8–15 notas en un workspace.
3. Haz `ragSearch()`.
4. Imprime Top-K **antes** de generation.
5. Construye el bloque EVIDENCE.
6. Carga/reutiliza un LLM local.
7. Ejecuta completion.
8. Muestra respuesta + fuentes.
9. Registra retrieval latency y generation latency por separado.

Guía en `lab/README.md`.

### Unknown Knowledge Test

Pregunta algo que **no exista** en el corpus.

La conducta deseada no es "responder de todas formas". El sistema debe detectar que no posee evidencia suficiente según la política que diseñes y responder de forma explícita.

La detección puede depender de contenido, ranking, thresholds evaluados o una instrucción de grounding; no inventes un threshold universal.

### Break It — Poor Retrieval

Provoca un fallo controlado. Ejemplos:

- chunking demasiado agresivo;
- documento relevante omitido del corpus;
- query extremadamente vaga;
- Top-K demasiado pequeño.

Predice el efecto antes de ejecutar. Después responde: **¿Falló retrieval o generation?**

### Práctica integrada — RAG transparente

Implementa un flujo que permita inspeccionar cada etapa antes de generar:

1. ingesta tres documentos con `source`, `title`, `version` y `section`;
2. divide cada documento en chunks y muestra sus límites;
3. recupera `Top-K=3` para una pregunta contestable y otra fuera del corpus;
4. presenta score, texto y metadata antes de invocar al LLM;
5. genera una respuesta con citas provenientes únicamente de esa metadata;
6. conserva un registro de latencias y de la decisión `answerable`/`insufficient-evidence`.

Evalúa por separado recuperación y generación. Si el chunk correcto no aparece, el problema está antes del prompt; si aparece y la respuesta lo contradice, investiga grounding y política de generación.

---

## Errores comunes

| Síntoma | Causa probable | Corrección |
|---|---|---|
| No aparece la fuente | Chunking, ingestión o query | Revisar índice, metadata y Top-K |
| Aparece evidencia incorrecta | Corpus o ranking | Inspeccionar score y textos vecinos |
| Cita inventada | Provenance ausente | Usar metadata original; no confiar en el LLM |
| Respuesta no sustentada | Contexto o prompt | Revisar contexto exacto enviado al LLM |

### Notas adicionales

1. **"RAG mete los documentos en los pesos."** No. Retrieval aporta contexto externo en query-time.
2. **"Si el LLM alucina, RAG falló."** Tal vez retrieval fue correcto y generation ignoró/malinterpretó evidencia.
3. **"Top-K alto siempre mejora."** Más contexto puede añadir ruido. Debe evaluarse.
4. **"Un score define un threshold universal."** Los scores dependen del modelo, corpus, distribución y métrica.
5. **"Citation = URL inventada por el LLM."** Provenance debe venir de metadata real mantenida por el pipeline.

### Troubleshooting guiado

| Síntoma | Hipótesis inicial | Evidencia que debes pedir |
|---|---|---|
| no aparece la fuente | chunking, ingestión o query | índice, metadata y Top-K |
| aparece evidencia incorrecta | corpus o ranking | score y textos vecinos |
| cita inventada | provenance ausente | metadata original |
| respuesta no sustentada | contexto o prompt | contexto exacto enviado al LLM |

---

## Medición

Separa:

| Métrica | Cómo obtenerla | Unidad | Interpretación |
|---|---|---|---|
| Ingest/chunking time | Antes/después de `ragIngest()` | ms | Costo de preparación del corpus |
| Retrieval latency | Antes/después de `ragSearch()` | ms | Costo de búsqueda vectorial |
| LLM TTFT | Primer `contentDelta` − envío del prompt | ms | Latencia percibida hasta primer token |
| Generation total latency | `final` resuelto − inicio | ms | Tiempo completo de generación |
| Top-K y scores | Salida de `ragSearch()` | score + texto | Calidad de retrieval |
| Answer correctness | Evaluación manual o checklist | cualitativo | Faithfulness de la respuesta |

No sumes todo bajo una única etiqueta "RAG latency" si quieres diagnosticar.

Registro sugerido:

```text
workspace, ingestMs, retrievalMs, generationMs, topK, scores, answerable
```

---

## Resumen

- RAG combina conocimiento externo recuperable con generación local. No modifica los pesos del LLM.
- QVAC gestiona chunking, ingest, persistencia y search via workspace. Grounding y provenance son responsabilidad de la app.
- Inspecciona retrieval antes de generation. Retrieval y generation pueden fallar de forma independiente.
- Chunk size es un tradeoff entre contexto y especificidad. No existe Top-K ni threshold universal.
- Mide ingest, retrieval y generation por separado.

**Siguiente clase:** entrada/salida por voz (Clase 7).

---

## Profundización V2 — RAG como sistema de evidencia

### Contrato de evidencia

La salida de retrieval debe conservar más que texto: `documentId`, `chunkId`, versión de fuente,
modelo de embeddings, Top-K, score y snapshot del corpus. Una fuente recuperada no se convierte
automáticamente en una cita que soporte la respuesta. La aplicación debe mostrar el pasaje y
asociar cada afirmación material con evidencia que el usuario pueda inspeccionar.

### Lifecycle y actualizaciones

Un índice es la combinación de texto fuente, preprocessing, chunk policy, modelo y store. Cuando
cambia un documento, identifica sus chunks previos, actualiza o elimina los IDs afectados y
comprueba con una query que la evidencia obsoleta ya no se recupera. `ragCloseWorkspace()` y
borrado son operaciones diferentes: cerrar libera recursos; la retención y eliminación deben
seguir una política explícita. Consulta siempre la firma actual antes de automatizar lifecycle.

### Tres gates antes de confiar en una respuesta

1. **Ingestion gate:** el documento y sus chunks existen, tienen IDs estables y pertenecen al
   snapshot esperado.
2. **Retrieval gate:** la evidencia etiquetada aparece en Top-K y no hay conflicto de versión o
   autorización.
3. **Generation gate:** la respuesta se mantiene dentro de la evidencia; si falta soporte, se
   abstiene o solicita una fuente.

Esto separa fallo de datos, fallo de recuperación y fallo de generación. Un buen prompt ayuda,
pero no prueba por sí mismo factualidad ni impide toda instrucción maliciosa dentro de documentos
recuperados. Trátalos como datos no confiables y prueba explícitamente el comportamiento.

### Evaluación de entrega

Además de un caso exitoso, el proyecto debe mostrar: una pregunta fuera de corpus, un documento
actualizado, un hard negative y un caso donde la respuesta generada no sigue evidencia aunque el
chunk correcto sí fue recuperado. La corrección elegida debe atacar la etapa responsable, no
añadir más contexto de forma ciega.

## Fuentes

- [QVAC — RAG](https://docs.qvac.tether.io/ai-capabilities/rag/)
- [QVAC — Text embeddings](https://docs.qvac.tether.io/ai-capabilities/text-embeddings/)
- [QVAC — Text generation](https://docs.qvac.tether.io/ai-capabilities/text-generation/)
- [QVAC — API v0.18.x](https://docs.qvac.tether.io/reference/api/)
- [QVAC — Release notes](https://docs.qvac.tether.io/reference/release-notes/)
- [RAG paper (Lewis et al., 2020)](https://arxiv.org/abs/2005.11401)
