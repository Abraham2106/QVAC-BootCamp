# QVAC Module 2 — Own the Knowledge
## Proof-Checked Expanded Textbook — Embeddings, Retrieval, RAG and Private Knowledge

> **Proyecto:** The Local-First AI Systems Masterclass · Albatross / QVAC

> **Baseline técnico:** QVAC SDK v0.18.x. Las release notes oficiales actuales cubren
> v0.18.0 y v0.18.1; las firmas de este texto se basan en la API Summary v0.18.x y
> las páginas actuales de Text Embeddings y RAG. [W01] [W02] [W03] [W04]

> **Regla anti-alucinación:** ninguna capacidad se atribuye a QVAC salvo que las fuentes
> oficiales actuales la documenten. Reranking, hybrid retrieval, semantic/hierarchical
> chunking y otras extensiones se marcan como arquitectura general/investigación cuando
> no son primitivas built-in documentadas.

---

El Módulo 2 cambia la pregunta del bootcamp. En el Módulo 1 el estudiante aprendió a poseer la
ruta de inferencia. Ahora aparece una limitación inevitable: un modelo local no contiene
automáticamente los documentos privados del usuario ni conoce cada cambio que ocurrió después
de su entrenamiento. Own the Knowledge significa construir memoria externa que la aplicación
pueda inspeccionar, actualizar, buscar y usar como evidencia.

La progresión es deliberada. Primero se construye semantic search sin un LLM generador. Eso
obliga a entender embeddings, vectores, métricas, ranking y errores de retrieval. Solo después
se conecta retrieval con generation. Así, cuando una respuesta RAG falla, el estudiante puede
decidir si falló búsqueda o generación en vez de culpar a una caja negra.

QVAC documenta actualmente embeddings mediante qvac-fabric-llm.cpp, modelos de embeddings
llama.cpp-compatible en GGUF y embed() para una o varias entradas. Para RAG ofrece un vector
store integrado con workspaces, un flow gestionado y un flow segregado, además de ejemplos con
vector stores externos. [W01] [W02] [W06]

## Objetivo acumulativo del módulo

Construir un Private Knowledge Assistant que mantiene documentos, chunks, embeddings, vector
store, retrieval y generación en infraestructura controlada; muestra evidencia; conserva
provenance; se abstiene cuando el corpus no soporta la respuesta; y distingue retrieval
failure de generation failure.

## Resultados de aprendizaje

1. Explicar embeddings sin confundirlos con generación.
2. Calcular cosine similarity con normalización por norma.
3. Explicar cuándo dot product = cosine: vectores unit-normalized.
4. Comparar cosine, dot product y Euclidean sin declarar ganador universal.
5. Explicar que embedding geometry depende del modelo y tarea.
6. Usar loadModel + embed + unloadModel en QVAC actual.
7. Usar embed con single text y batch.
8. Interpretar stats documentadas de embed.
9. Construir semantic search local antes de RAG.
10. Evaluar Top-K con relevance labels.
11. Distinguir Precision@K, Recall@K y MRR.
12. Definir RAG como retrieval externo + generation condicionada.
13. Separar parametric memory de non-parametric memory.
14. Explicar chunking como decisión sustantiva de indexación.
15. Comparar familias fixed, structure-aware, semantic y hierarchical.
16. Explicar por qué no existe una estrategia de chunking universal demostrada.
17. Usar ragChunk con parámetros realmente documentados.
18. Usar ragIngest → ragSearch.
19. Usar ragChunk → embed → ragSaveEmbeddings.
20. Gestionar workspaces y persistence/close/delete.
21. Explicar RAG_WORKSPACE_MODEL_MISMATCH.
22. Usar ragReindex entendiendo el mínimo documentado para HyperDB.
23. Preservar provenance y metadata.
24. Construir grounded prompts con abstention policy.
25. Implementar Unknown Knowledge Tests.
26. Explicar por qué RAG reduce riesgos pero no garantiza cero hallucinations.
27. Separar retrieval quality de answer faithfulness/correctness.
28. Introducir reranking como capa general, no feature automática de QVAC.
29. Medir embedding, ingestion, search y generation por separado.
30. Actualizar/eliminar conocimiento sin reentrenar el LLM.
31. Explicar RAG vs fine-tuning.
32. Trazar dónde viven documentos, embeddings, índice, prompt y output.
33. Detectar riesgos de privacidad en logs y vector stores locales.
34. Diagnosticar retrieval failure.
35. Diagnosticar generation failure.
36. Defender decisiones con evidencia reproducible.

# Auditoría de fuentes del corpus compartido

La lista de fuentes entregada contiene materiales muy buenos, pero algunas etiquetas son más
amplias que el contenido real. Esta auditoría corrige esas asociaciones antes de usar los
papers para enseñar.

| Fuente | Estado | Uso correcto |
|---|---|---|
| arXiv:2602.13862 | Verificado / reclasificado | Self-rating bias + semantic similarity rating; aplicado, no survey general. [W21] |
| arXiv:2502.14862 | Central | Survey de interpretabilidad de embeddings/similarity. [W12] |
| arXiv:2403.05440 | Central | Cautela teórica sobre cosine; no dice que cosine sea siempre inútil. [W10] |
| arXiv:2512.02619 | Periférico | Quantum approach a semantic similarity; lectura opcional. [W22] |
| arXiv:2204.07922 | Central | Survey de similarity-query processing. [W11] |
| arXiv:1910.09129 | Contextual | Comparación task-specific; no generalizar el winner. [W13] |
| arXiv:2411.18947 | Relevante | Retriever benchmark orientado a downstream utility. [W14] |
| arXiv:2005.11401 | Fundacional | RAG parametric + non-parametric memory. [W09] |
| arXiv:2505.13668 | Reclasificado | FAQ annotation/reranking multi-agent, no paper fundacional de RAG. [W23] |
| arXiv:2410.19572 | Relevante | ChunkRAG semantic chunking + chunk filtering en su setup. [W15] |
| arXiv:2606.00881 | Central chunking | Comparación amplia, costes/limitaciones. [W16] |
| arXiv:2601.15457 | Evidencia de dominio | Policy QA RAG + reranking; números no universales. [W17] |
| arXiv:2607.01852 | Central cautela | Semantic cluster chunking no superó simple baselines en su setup. [W18] |
| arXiv:2509.11552 | Relevante | HiChunk/HiCBench; evidencia de enfoque jerárquico específico. [W19] |

# Mapa del Módulo 2
 
```text
MODULE 1 — local generation
       │
       ▼
CLASS 05 — EMBEDDINGS
text → vector → metric → ranking → Top-K
       │
       ▼
SEMANTIC SEARCH (sin generation)
       │
       ▼
CLASS 06 — RAG
documents → chunk → embed → persist
query → embed → retrieve → evidence → completion
       │
       ▼
PRIVATE KNOWLEDGE ASSISTANT
visible evidence + provenance + abstention + evaluation
```

---

# Clase 05 — Embeddings: Meaning as Geometry

## Pregunta esencial

**¿Cómo recupera una computadora significado relacionado sin depender de coincidencias exactas de palabras?**

## 1. Keyword y semantic search

Keyword search conserva señales simbólicas explícitas y sigue siendo muy valioso. Semantic
search agrega una representación aprendida para recuperar textos que expresan ideas
relacionadas aunque usen vocabulario distinto. No se enseña como reemplazo universal de
búsqueda léxica. [W11]

El módulo empieza con semantic search puro para evitar que un LLM generador esconda retrieval
deficiente detrás de una respuesta plausible.

## 2. Embedding

Un embedding es un vector numérico producido por un modelo. Se usa en clasificación,
clustering, semantic search y otras tareas. No es texto cifrado reversiblemente ni una
explicación de cada dimensión. [W12]

QVAC embed() refleja esa diferencia: single input devuelve number[] y batch input number[][].
[W01] [W03]

## 3. Geometría aprendida

Meaning as geometry es una metáfora útil: el training hace que ciertas relaciones de tarea se
expresen geométricamente. La geometría no es universal; otro embedding model produce otro
espacio.

Por eso no deben mezclarse vectores de modelos distintos. QVAC documenta explícitamente
RAG_WORKSPACE_MODEL_MISMATCH para workspaces ligados a otro modelo. [W03]

## 4. Dimensionalidad

Dimensión es longitud del vector. Más dimensiones no implican automáticamente mejor retrieval;
también afectan storage, index y compute.

El ejemplo MongoDB actual de QVAC fija 1024 dimensiones porque GTE Large usado ahí genera
1024; no generalices ese número a otros modelos. [W02]

## 5. Dot product

El dot product suma productos componente a componente. Con vectores normalizados a norma uno
coincide con cosine; sin esa garantía magnitud también influye.

Registra la métrica y normalización real de tu pipeline. No llames cosine a un dot product
salvo que la normalización esté establecida.

## 6. Cosine similarity

Cosine compara dirección: cos(a,b)=(a·b)/(||a|| ||b||) para vectores no nulos. Es una métrica
popular, pero su interpretación semántica depende del embedding model.

Steck et al. muestran razones teóricas para no usar cosine ciegamente. La conclusión es
validarla en la tarea, no descartarla automáticamente. [W10]

## 7. Euclidean distance

Euclidean distance mide L2. Para unit vectors, d²=2−2cos, por lo que induce el mismo ranking
que cosine; sin normalización no necesariamente.

Esto permite razonar sobre configuraciones de vector stores sin afirmar equivalencias que no
existen.

## 8. Similarity no es support

Un texto puede ser cercano pero contradecir la query por negación, fecha, entidad o
jurisdicción. Retrieval candidate no equivale a evidence verified.

Los labs incluyen hard negatives para entrenar este hábito antes de RAG.

## 9. Interpretabilidad

Dense embeddings son útiles pero explicar por qué un score concreto emergió sigue siendo un
problema abierto. [W12]

Por eso el UI debe mostrar contenido, metadata y score; no solo un número opaco.

## 10. Similarity query processing

En corpus pequeño puede hacerse exact scan; a gran escala aparecen nearest-neighbor indexes.
Representation y index son problemas distintos. [W11]

QVAC ofrece built-in RAG store y ejemplos con MongoDB/SQLite; no obliga a implementar un
índice desde cero. [W02]

## 11. Embedding model vs completion model

Embedding models producen vectores; completion models generan tokens. Son tareas y contratos
diferentes aunque puedan compartir engine.

QVAC Text Embeddings usa qvac-fabric-llm.cpp y modelos llama.cpp-compatible GGUF. [W01]

## 12. Lifecycle QVAC

El flujo oficial es loadModel → embed → unloadModel. Con GTE_LARGE_FP16 el descriptor permite
inferir tipo sin inventar strings de modelType. [W01]

Carga una vez y reutiliza para corpus/query; no cargues por documento.

## 13. Single y batch

embed() tiene overload single y batch. Stats opcionales actuales: backendDevice, contextSize,
tokensPerSecond, totalTime, totalTokens. [W03]

Valida que número de vectores corresponda al número de inputs.

## 14. requestId

embed() devuelve Promise decorada con requestId; cancel({requestId}) es el camino de
cancelación dirigida documentado. [W03]

Esto importa en ingestion grande y UI cancelable.

## 15. Caveat del ejemplo QVAC

La página Text Embeddings contiene una función llamada cosineSimilarity que suma productos.
Matemáticamente eso es dot product salvo unit normalization. La página no debe usarse como
prueba general de que cualquier embedding está normalizado. [W01]

El textbook usa la fórmula completa para evitar depender de una suposición no documentada.

## 16. Top-K

K controla cuántos candidatos continúan. K pequeño puede perder evidence; K grande añade noise
y después consume context budget.

No existe K universal; evalúalo sobre queries anotadas.

## 17. Precision@K / Recall@K

Precision@K mide proporción relevante entre K hits. Recall@K mide cobertura de toda la
evidence relevante conocida.

Son retrieval metrics, no answer quality metrics.

## 18. MRR

MRR premia que el primer hit relevante aparezca temprano y funciona bien cuando existe una
noción clara de first relevant result.

No reemplaza recall ni downstream evaluation.

## 19. Utility downstream

ICLERB cuestiona evaluar retrievers solo por semantic relevance y propone medir utilidad para
la tarea ICL/RAG downstream. [W14]

El mejor vecino geométrico no siempre es el contexto que más mejora la respuesta.

## 20. Domain shift

Legal, médico, código, multilingüe o jerga interna pueden diferir del training distribution
del embedding model.

Benchmarks públicos son señal inicial; valida con queries reales de tu corpus.

## 21. Norm distributions

Antes de asumir unit embeddings, inspecciona normas de una muestra. Eso convierte una
suposición geométrica en una observación.

Si todas son ~1 por contrato/modelo, dot y cosine pueden coincidir; si no, no.

## 22. Hard negatives

Hard negatives son candidatos muy parecidos pero incorrectos. Son esenciales para probar
negaciones, fechas y entidades cercanas.

Un retriever que solo se evalúa con ejemplos fáciles sobreestima su utilidad.

## 23. Score calibration

Un score no tiene por sí solo un significado universal de probabilidad. Distribuciones cambian
por modelo y corpus.

No elijas threshold de abstention mirando un único ejemplo.

## 24. Semantic search como sistema auditable

Guarda query, modelo, vector dimension, metric, hits, scores, IDs y relevance labels.

Ese artefacto será el baseline que RAG debe superar, no ocultar.

## 25. QVAC embedding example
 
```typescript
import { embed, GTE_LARGE_FP16, loadModel, unloadModel } from "@qvac/sdk";

let modelId;
try {
  modelId = await loadModel({ modelSrc: GTE_LARGE_FP16 });

  const single = await embed({ modelId, text: "Private knowledge remains auditable." });
  console.log(single.embedding.length, single.stats);

  const texts = [
    "Embeddings map text into vectors.",
    "Semantic vectors support similarity search.",
    "A microphone captures audio."
  ];
  const batch = await embed({ modelId, text: texts });
  console.log(batch.embedding.length);
} finally {
  if (modelId) await unloadModel({ modelId });
}
```

## 26. Correct cosine implementation
 
```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("dimension mismatch");
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) throw new Error("zero vector");
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

## 27. Lab: semantic search sin LLM
 
- Indexa 30–100 notas con IDs estables.
- Define 15 queries y relevancia esperada antes de ver resultados.
- Calcula cosine explícito.
- Muestra Top-5 completo.
- Calcula Precision@K/Recall@K cuando tengas labels.
- Incluye negación, fechas, entidades y hard negatives.
- Documenta al menos cinco failure cases.

---

# Clase 06 — Local RAG and Private Knowledge

## Pregunta esencial

**¿Cómo puede un modelo responder usando evidencia privada que no está almacenada en sus pesos?**

## 1. Semantic search → RAG

RAG toma retrieval visible y añade generation condicionada por evidence. QVAC describe embed
docs, persist vectors, query Top-K y normalmente pasar retrieved text a completion(). [W02]

Generation añade utilidad y nuevos failure modes: puede ignorar, distorsionar o extender
evidencia.

## 2. Parametric / non-parametric memory

Lewis et al. combinan memoria paramétrica del generador con memoria externa explícita
recuperable. [W09]

La externa puede actualizarse sin reentrenar pesos y puede conservar provenance.

## 3. Qué resuelve

RAG sirve para conocimiento privado, reciente o de dominio que no está fiable/explícitamente
en pesos. [W09] [W20]

No convierte al LLM en DB ni garantiza factualidad.

## 4. Pipeline

Ingestion: normalize→chunk→embed→persist. Query: embed→search→select evidence→completion.

Separar phases permite medir y diagnosticar.

## 5. Normalización

PDF/HTML pueden traer headers, hyphenation, duplicates o tables corruptas.

No inventes estructura perdida; guarda fuente original y transformaciones.

## 6. Chunking importa

Chunk boundaries determinan qué evidence puede recuperarse.

Investigación reciente muestra costes/limitaciones y ausencia de winner universal. [W16] [W18]

## 7. Fixed-size

Barato, reproducible, baseline fuerte; puede cortar ideas arbitrariamente.

Siempre compáralo antes de justificar técnicas más caras.

## 8. Structure-aware

Usa párrafos/secciones cuando extraction preserva estructura.

QVAC API muestra chunkStrategy:"paragraph" en ejemplo actual; no inventamos una lista
adicional. [W03]

## 9. Semantic chunking

Busca fronteras semánticas; ChunkRAG reporta mejoras en su framework. [W15]

No universalizar: otros estudios no muestran superioridad consistente. [W16] [W18]

## 10. Hierarchical chunking

Representa múltiples escalas; HiChunk estudia este enfoque. [W19]

No es primitive built-in documentada de QVAC.

## 11. Overlap

Puede preservar continuidad y a la vez duplicar evidence/index size.

Evalúa overlap como variable, no default dogmático.

## 12. Metadata

IDs, source, page/section, version, timestamp, category permiten audit/update.

No inventes metadata que la extracción no puede soportar.

## 13. Stable IDs

Permiten delete/update y version correctness.

QVAC ragDeleteEmbeddings usa IDs; diseña identidad antes de ingest masivo. [W03]

## 14. ragIngest

Full pipeline documentado chunk→embed→save; implicit open/create workspace;
processed+droppedIndices; requestId. [W03]

Managed flow reduce plumbing pero no elimina la necesidad de inspección.

## 15. Segregated flow

ragChunk→embed→ragSaveEmbeddings hace cada fase visible. [W03]

Ideal para enseñanza/custom ingestion.

## 16. ragSearch

Busca similar docs con modelId/query/topK/workspace. Workspace inexistente devuelve [] según
API actual. [W03]

Una lista vacía no prueba por sí sola que la respuesta no exista en el universo.

## 17. Workspace lifecycle

ragCloseWorkspace libera Corestore/HyperDB/RAG resources y locks, conserva disk data salvo
deleteOnClose. [W03]

Close no es delete.

## 18. Isolation caveat

Workspaces separan colecciones lógicas.

No son automáticamente security boundaries criptográficas.

## 19. HyperDB

API menciona HyperDB adapter y reindex con k-means centroids. [W03]

No extrapolar internals no documentados.

## 20. ragReindex

Optimiza search; HyperDB requiere mínimo de documentos, 16 por defecto, y puede devolver
reindexed:false/details. [W03]

Skip documentado no es crash.

## 21. Model mismatch

RAG_WORKSPACE_MODEL_MISMATCH protege contra usar un workspace con modelo incompatible. [W03]

Cambiar embedding model requiere re-embedding/new compatible index.

## 22. Built-in vs external DB

QVAC tiene built-in workspace y ejemplos MongoDB/SQLite. [W02]

Storage/index es decisión separada de embedding generation.

## 23. Retrieval debugger

Muestra query, hits, score, metadata y final context antes de generation.

Sin esto, un chat plausible oculta retrieval failure.

## 24. Grounded prompt

Delimita evidence e instruye insuficiencia cuando no existe soporte.

Prompt policy no es garantía formal.

## 25. Retrieval failure

Evidence necesaria no entra por ingestion/chunk/embed/query/index/Top-K/ranking.

Arregla retrieval antes de ajustar sampling.

## 26. Generation failure

Evidence correcta entra pero LLM ignora/contradice/inventa.

Necesita debugging del prompt/context y output.

## 27. Hallucination

RAG puede reducir hallucination risk al groundear, pero no elimina hallucinations. [W09] [W20]

Puede fallar retrieval o generation de formas distintas.

## 28. Unknown Knowledge Test

Preguntas deliberadamente ausentes prueban abstention.

No uses un threshold arbitrario como verdad; calibra con test set.

## 29. Provenance

Conserva source identity desde ingestion hasta UI. [W09]

Retrieved source no implica que soporte cada claim generado.

## 30. Reranking

Segundo stage puede reordenar candidatos; policy QA reporta mejoras en su setup. [W17]

No es feature automática QVAC documentada en las fuentes actuales.

## 31. Downstream utility

ICLERB muestra motivación para evaluar retriever por utilidad downstream. [W14]

Similarity score no es objetivo final por definición.

## 32. Chunk filtering

ChunkRAG filtra retrieved chunks antes de generation. [W15]

Más stages = más latency/complexity/failures.

## 33. Context budget

Top-K y chunk size consumen context del LLM.

Recall y noise compiten con prefill/latency.

## 34. Duplicate evidence

Overlap/version duplicates pueden llenar Top-K.

Mide IDs únicos y diversity.

## 35. Updates

Delete/re-embed/reingest permite cambiar memory externa.

No requiere reentrenar LLM.

## 36. RAG vs fine-tuning

RAG resuelve knowledge access; fine-tuning cambia modelo/behavior.

Pueden combinarse, pero no son sustitutos directos.

## 37. Private RAG

Docs, vectors, workspace, retrieval y generation pueden permanecer locales/controlados. [W01]
[W02]

Local no implica cifrado/ACLs automáticos.

## 38. Sensitive embeddings

Vectors derivados de datos privados también requieren protección.

No copies corpus completo a logs para debug en producción.

## 39. Evaluation layers

Evalúa ingestion, retrieval, generation y end-to-end por separado.

Un único score oculta bottleneck.

## 40. Faithfulness

Pregunta si answer está soportada por supplied context.

No es igual a factual correctness respecto al mundo.

## 41. Metric caveat

Academic-text study halló reliability limitada de RAGAs faithfulness en su setup. [W18]

Evalúa también las métricas/evaluadores.

## 42. End-to-end latency

Descompón query embedding + search + optional rerank + prompt/prefill + decode.

Optimiza stage dominante.

## 43. Reproducibility

Guarda corpus snapshot, chunk config, embedding model, workspace, Top-K, prompt, LLM version.

Sin eso, la comparación no puede repetirse.

## 44. Versioned evidence

Document version/date deben formar parte de provenance cuando importan.

Semantic similarity puede recuperar una versión vieja muy parecida.

## 45. Negation trap

Shared vocabulary/semantics puede acercar afirmaciones opuestas.

Evalúa support, no solo score.

## 46. Citation support

Source displayed debe soportar el claim, no solo estar en Top-K.

Distingue retrieved sources de supporting sources.

## 47. Delete lifecycle

ragDeleteEmbeddings remueve IDs; ragDeleteWorkspace requiere workspace no loaded/in use. [W03]

Diseña cleanup/update seguro.

## 48. listWorkspaces

Lista workspaces on disk y open status. [W03]

Útil para restart/lifecycle tests.

## 49. Cancellation

ragIngest y ragReindex exponen requestId en API actual. [W03]

Long operations pueden cancelarse de forma dirigida.

## 50. Plugin build

Configurable QVAC builds requieren LLM + Embeddings plugins para RAG. [W08]

Bundle capability también es arquitectura.

# QVAC — API real para Own the Knowledge

Esta sección usa funciones presentes en API Summary v0.18.x. No se inventan helpers ni
estrategias.

## 1. embed signatures
 
```text
Single: embed({ modelId, text: string }) → { embedding: number[]; stats? } & requestId
Batch:  embed({ modelId, text: string[] }) → { embedding: number[][]; stats? } & requestId
Optional documented stats: backendDevice, contextSize, tokensPerSecond, totalTime, totalTokens
```

## 2. Managed RAG
 
```typescript
import { GTE_LARGE_FP16, loadModel, unloadModel, ragIngest, ragSearch, ragCloseWorkspace } from "@qvac/sdk";

const workspace = "private-notes";
let modelId;
try {
  modelId = await loadModel({ modelSrc: GTE_LARGE_FP16 });
  const ingest = await ragIngest({
    modelId,
    workspace,
    documents: [
      "Project Alpha uses an offline-first architecture.",
      "The release checklist requires an airplane-mode test.",
      "The office plants are watered on Friday."
    ],
    chunk: false,
  });
  console.log(ingest.processed.length, ingest.droppedIndices);
  const hits = await ragSearch({
    modelId,
    workspace,
    query: "How is offline operation tested?",
    topK: 3,
  });
  console.table(hits.map(h => ({ score: h.score, content: h.content })));
} finally {
  await ragCloseWorkspace({ workspace }); // keeps disk data by default
  if (modelId) await unloadModel({ modelId });
}
```

## 3. Segregated RAG
 
```typescript
import { ragChunk, embed, ragSaveEmbeddings, ragSearch } from "@qvac/sdk";

const chunks = await ragChunk({
  documents: [longDocument],
  chunkOpts: { chunkSize: 256, chunkOverlap: 50, chunkStrategy: "paragraph" },
});

const { embedding: vectors } = await embed({
  modelId: embeddingModelId,
  text: chunks.map(c => c.content),
});

if (vectors.length !== chunks.length) throw new Error("embedding/chunk count mismatch");

await ragSaveEmbeddings({
  workspace: "private-notes",
  documents: chunks.map((chunk, i) => ({
    ...chunk,
    embedding: vectors[i],
    embeddingModelId,
  })),
});

const hits = await ragSearch({
  modelId: embeddingModelId,
  workspace: "private-notes",
  query: "query",
  topK: 5,
});
```

## 4. Grounded generation
 
```typescript
import { GTE_LARGE_FP16, LLAMA_3_2_1B_INST_Q4_0, loadModel, unloadModel, ragSearch, completion } from "@qvac/sdk";

const embedModelId = await loadModel({ modelSrc: GTE_LARGE_FP16 });
const llmModelId = await loadModel({ modelSrc: LLAMA_3_2_1B_INST_Q4_0 });

try {
  const question = "What does the private corpus say about offline testing?";
  const hits = await ragSearch({ modelId: embedModelId, workspace: "private-notes", query: question, topK: 4 });
  const evidence = hits.map((h, i) => `[SOURCE ${i+1}]
${h.content}`).join("

");

  const run = completion({
    modelId: llmModelId,
    history: [{ role: "user", content:
`Answer using only the evidence below. If evidence is insufficient, say so.

QUESTION:
${question}

EVIDENCE:
${evidence}` }],
    stream: true,
  });

  for await (const event of run.events) {
    if (event.type === "contentDelta") process.stdout.write(event.text);
  }
  const final = await run.final;
  console.log("
stopReason:", final.stopReason);
} finally {
  await unloadModel({ modelId: llmModelId });
  await unloadModel({ modelId: embedModelId });
}
```

## 5. Workspace lifecycle
 
```text
ragIngest / ragSaveEmbeddings
        │
        └─ implicit open/create
                  ▼
            workspace OPEN
         ┌────────┼──────────┐
         ▼        ▼          ▼
     ragSearch ragReindex ragDeleteEmbeddings
                  │
                  ▼
        ragCloseWorkspace
         ├─ default: release resources + keep disk data
         └─ deleteOnClose: true: delete data

ragDeleteWorkspace requires workspace not loaded/in use.
```

## 6. Documented RAG error family

| Code | Meaning at API level |
|---|---|
| `RAG_SAVE_FAILED` | save embeddings failed |
| `RAG_SEARCH_FAILED` | search failed |
| `RAG_DELETE_FAILED` | delete failed |
| `RAG_HYPERDB_FAILED` | HyperDB operation failed |
| `RAG_WORKSPACE_MODEL_MISMATCH` | workspace uses another model |
| `RAG_WORKSPACE_NOT_FOUND` | workspace not found |
| `RAG_WORKSPACE_IN_USE` | workspace currently in use |
| `RAG_WORKSPACE_CLOSE_FAILED` | close failed |
| `RAG_LIST_WORKSPACES_FAILED` | list failed |
| `RAG_CHUNK_FAILED` | chunking failed |
| `RAG_WORKSPACE_NOT_OPEN` | workspace required open |

# Chunking — evidence synthesis, not folklore

Recent evidence directly argues against teaching one chunking recipe as universal. Treat
chunking as an experimental variable.

### ChunkRAG [W15]

**Finding.** Semantic chunking + LLM chunk filtering improved its evaluated pipeline.

**Limit.** Does not prove semantic chunking always wins.

### Chunking Methods 2026 [W16]

**Finding.** Systematic comparison highlights effectiveness/cost/limitations.

**Limit.** Do not ignore compute/preprocessing cost.

### Policy QA [W17]

**Finding.** Advanced RAG + cross-encoder reranking improved faithfulness in its CDC-policy
setup.

**Limit.** Numbers are not expected QVAC performance.

### Academic texts [W18]

**Finding.** Cluster semantic chunking did not beat simple strategies in tested setup.

**Limit.** Strong caution against universal claims.

### HiChunk [W19]

**Finding.** Hierarchical framework reports gains in its benchmark.

**Limit.** Not built-in QVAC primitive or universal default.

# Evaluation framework

| Dimension | Question |
|---|---|
| Ingestion coverage | Did all expected inputs process; any droppedIndices? |
| Chunk integrity | Does each chunk preserve needed context? |
| Recall@K | Is required evidence in K? |
| Precision@K | How much of K is relevant? |
| MRR | How early is first relevant hit? |
| Duplicate rate | How diverse are Top-K source IDs? |
| Provenance | Do source IDs resolve correctly? |
| Correctness | Does answer match ground truth? |
| Faithfulness | Are claims supported by supplied evidence? |
| Abstention | Does unknown knowledge trigger uncertainty? |
| Citation support | Do cited sources support claims? |
| Embed latency | Query/document vectorization time |
| Search latency | Vector search time |
| Generation TTFT | First model output time |
| End-to-end | Total question-to-answer time |
| Update correctness | Are stale versions removed? |
| Persistence | Does workspace survive close/restart? |
| Privacy | What sensitive content/vectors appear in disk/logs/network? |

# Parte III — Embeddings en profundidad

Esta parte reemplaza deliberadamente bancos de fichas y worksheets por
explicación técnica. La meta es que el lector pueda razonar sobre una búsqueda
vectorial sin depender de metáforas vagas como “los textos parecidos quedan
cerca”. Esa frase es una intuición de entrada, no una especificación.

El principio de trabajo será siempre el mismo: representación, métrica,
ranking, evaluación. Si cualquiera de esas cuatro piezas cambia, el sistema de
retrieval puede cambiar aunque el corpus textual sea idéntico.

## 1. El embedding no contiene “el significado” en forma literal

Un embedding no es una traducción reversible del texto a coordenadas con
significado humano independiente por dimensión. Es una representación numérica
producida por un modelo entrenado para que ciertas relaciones geométricas
resulten útiles para objetivos concretos. Dos modelos distintos pueden mapear
la misma frase a espacios de distinta dimensionalidad, escala y estructura, y
ambos pueden ser útiles para retrieval aun cuando sus coordenadas no sean
comparables entre sí.

Esta observación tiene consecuencias de ingeniería. No debes persistir
vectores sin registrar qué modelo los produjo. Si cambias de embedding model,
el índice existente no se vuelve mágicamente compatible con el nuevo espacio.
QVAC hace visible esta propiedad con `RAG_WORKSPACE_MODEL_MISMATCH`: el
workspace queda asociado a un modelo y la API rechaza una mezcla incompatible.
[W03]

Por tanto, “actualizar el embedding model” debe tratarse como una migración de
datos. Debes decidir si re-embebes todo el corpus, creas un workspace
paralelo, comparas ambos sistemas sobre un test set y después retiras el
anterior. El vector no es solo un valor; es un dato derivado cuyo significado
operacional depende de su modelo de origen.

## 2. Por qué la dimensionalidad no es una escala de inteligencia

La dimensionalidad de un embedding indica cuántos componentes contiene el
vector. Es tentador asumir que 1536 dimensiones son necesariamente “más
semánticas” que 768, pero la dimensionalidad por sí sola no establece calidad.
Un modelo puede aprender una representación más útil con menos dimensiones si
su objetivo de entrenamiento, arquitectura y datos están mejor alineados con
la tarea.

La dimensionalidad sí tiene costes físicos. Para `N` vectores almacenados como
float32, el almacenamiento bruto de los componentes crece aproximadamente como
`N × D × 4 bytes`, antes de metadata e índices. Un millón de vectores de 1024
dimensiones ocupan unos 4.096 GB solamente en valores float32. Esa aritmética
no dice cuánto ocupará un vector store real, pero muestra por qué `D` es una
decisión de sistemas, no solo de model quality.

La documentación RAG de QVAC usa un ejemplo externo con una dimensión que
corresponde al embedding model elegido. Eso debe leerse como propiedad de ese
modelo, no como dimensión requerida por QVAC. [W02] El runtime trabaja con el
vector devuelto por el modelo; el esquema del storage externo debe coincidir
con esa dimensionalidad.

## 3. Norma del vector y por qué importa antes de hablar de cosine

La norma L2 de un vector mide su magnitud geométrica. Cosine similarity divide
el dot product por las normas de ambos vectores; por eso ignora magnitud y se
concentra en dirección. Si los vectores están previamente normalizados a norma
uno, cosine y dot product son numéricamente equivalentes. Si no lo están, esa
equivalencia desaparece.

Este detalle es importante porque la página actual de Text Embeddings de QVAC
muestra una función llamada `cosineSimilarity` que suma únicamente productos
de componentes. [W01] Matemáticamente, esa función es dot product salvo que la
representación ya esté normalizada. El ejemplo demuestra una comparación útil
para ese flujo, pero no debe convertirse en afirmación general de que todos
los embedding models de QVAC emiten unit vectors.

Un textbook riguroso debe enseñar a verificar. Puedes calcular la norma de una
muestra de embeddings y observar si se aproxima consistentemente a uno. Aun si
lo hace, la garantía contractual debe venir del modelo o la documentación, no
de cinco observaciones. En una implementación general de cosine, normaliza
explícitamente o usa la fórmula completa.

## 4. Cosine similarity es una herramienta, no una ontología del significado

Cosine similarity se usa ampliamente porque es simple, estable y muy útil en
muchos espacios de embeddings. Sin embargo, el paper de Steck, Ekanadham y
Kallus demuestra por qué es incorrecto identificarla automáticamente con una
noción universal de semantic similarity. Bajo ciertos modelos regularizados,
la geometría resultante puede hacer que las similitudes cosine dependan de
detalles de entrenamiento que no corresponden a una interpretación semántica
única. [W10]

La lección no es “no uses cosine”. La lección es “valida la métrica sobre el
problema real”. Si tu tarea es buscar políticas internas, construye queries
con relevancia anotada y mide si el ranking es útil. Si dot product produce
mejor retrieval que cosine para un modelo concreto, el sistema debe seguir la
evidencia y no un dogma geométrico.

También conviene separar score de confianza. Un cosine 0.82 no significa “82 %
de probabilidad de que este documento responda”. Es una medida geométrica en
un espacio aprendido. Para convertir scores en umbrales de producto necesitas
calibración sobre datos etiquetados y, aun así, la calibración depende del
corpus y de la distribución de queries.

## 5. Euclidean distance y su relación con cosine

La distancia Euclidean mide separación absoluta entre dos puntos. Si `a` y `b`
están normalizados a norma uno, entonces `||a-b||² = 2 - 2 cos(a,b)`. En esa
situación, ordenar por menor distancia L2 produce el mismo orden que ordenar
por mayor cosine. La puntuación cambia, pero el ranking es monotónicamente
equivalente.

Fuera de la esfera unitaria, magnitud vuelve a importar y los rankings pueden
divergir. Esta es una razón por la cual no conviene discutir “qué métrica es
mejor” sin describir las propiedades de los embeddings y el objetivo. El
vector store puede exponer varias métricas, pero la configuración correcta es
parte del contrato entre modelo e índice.

En un laboratorio educativo, una buena práctica es ejecutar tres rankings:
dot, cosine explícito y Euclidean. Si cosine y dot producen exactamente el
mismo orden, inspecciona las normas y explica por qué. Si divergen, no
declares uno correcto por intuición; compáralos contra relevance labels.

## 6. Similaridad semántica no es soporte factual

Un retriever puede considerar cercanas dos frases que comparten tema y
estructura aunque difieran en la condición que decide la respuesta. “La
política permite exportar datos” y “la política no permite exportar datos”
comparten casi todo el vocabulario. Fechas diferentes, límites numéricos y
nombres de entidades también pueden quedar semánticamente próximos.

Esto obliga a distinguir dos preguntas: “¿este fragmento trata sobre el tema?”
y “¿este fragmento soporta la afirmación que quiero producir?”. La primera es
retrieval relevance; la segunda es evidence support. RAG necesita ambas, y un
score alto solo responde parcialmente a la primera.

Por eso el Private Knowledge Assistant debe mostrar el texto recuperado. El
usuario o un evaluador debe poder ver la cláusula concreta, su fuente y
versión. La generación no debe ocultar que el retriever recuperó un documento
parecido pero jurídicamente distinto.

## 7. Hard negatives: el test que separa un retriever útil de uno superficial

Un hard negative es un documento que parece muy relevante pero no contiene la
respuesta correcta. Es una herramienta de evaluación extremadamente valiosa
porque obliga al retriever a discriminar detalles, no solo tema general. Para
un corpus de recursos humanos, un hard negative puede ser la política del año
anterior; para APIs, una versión deprecada; para contratos, una cláusula
similar de otro cliente.

Los datasets de demo suelen ser demasiado fáciles: una frase habla de zorros,
otra de Python y la query pregunta por zorros. Ese ejemplo demuestra que
`embed()` produce vectores, pero no demuestra que el sistema esté listo para
conocimiento privado. La evaluación real debe contener ambigüedad y documentos
competidores.

Un buen set de hard negatives se construye a partir de los errores del
sistema. Cada vez que una consulta trae un fragmento convincente pero
incorrecto, conviértelo en test de regresión. Así el corpus de evaluación
crece a partir de failure modes observados y evita que una mejora futura
vuelva a introducirlos.

## 8. Negación, cantidades y fechas son enemigos del ranking ingenuo

Los embedding models pueden capturar parte de estas distinciones, pero no
debes asumir que semantic similarity es suficiente para todos los datos
discretos. Una consulta por “máximo 30 días” puede recuperar una política de
“máximo 90 días” porque ambas comparten casi toda la semántica. Lo mismo
ocurre con “antes de 2025” frente a “después de 2025”.

En dominios donde una cifra o fecha cambia la decisión, retrieval debe
evaluarse con ejemplos deliberadamente cercanos. Metadata estructurada también
puede ayudar: la fecha efectiva del documento, la jurisdicción o la versión
pueden filtrar el candidate set antes o después de vector search, según la
arquitectura elegida.

QVAC proporciona las primitivas de embeddings y RAG; no documenta en las
fuentes usadas aquí una política automática que resuelva fechas, negaciones o
filtros de dominio. Esa lógica debe diseñarse en la aplicación o en el vector
store externo cuando corresponda.

## 9. Score distributions importan más que un threshold copiado de Internet

Es común encontrar tutoriales que afirman que un cosine mayor de 0.7 es
“relevante”. Esa cifra carece de significado universal. La distribución de
scores depende del embedding model, el corpus, la longitud de textos, el tipo
de query y la métrica. Un threshold razonable para un conjunto puede destruir
recall en otro.

La forma correcta de definir un umbral es observar distribuciones en queries
etiquetadas. Compara scores de positivos, hard negatives y negativos fáciles.
Si hay separación, puedes estudiar un threshold. Si las distribuciones se
solapan, el score por sí solo no puede resolver el problema y tal vez
necesites reranking, filtros o una política distinta.

Para un Unknown Knowledge Test, esto es crítico. Un threshold no debe
interpretarse como “prueba de que la respuesta existe”. Solo puede actuar como
una señal calibrada dentro de una política de abstención más amplia.

## 10. Single embedding y batch embedding son el mismo concepto con distinto coste operativo

QVAC v0.18.x documenta dos overloads de `embed()`: un string produce
`number[]`; un array de strings produce `number[][]`. Ambos exponen un
`requestId` síncrono y pueden devolver stats opcionales como `backendDevice`,
`contextSize`, `tokensPerSecond`, `totalTime` y `totalTokens`. [W03]

El batch no cambia la definición matemática del embedding. Cambia cómo agrupas
trabajo y overhead. Para ingestion de muchos chunks, batch puede reducir el
número de round trips hacia el worker y mejorar utilización. El tamaño óptimo
depende de modelo, memoria y backend, por lo que debe medirse.

También exige disciplina de correspondencia: el vector `i` debe permanecer
asociado al texto y metadata `i`. Una desalineación de arrays puede producir
un índice aparentemente sano pero semánticamente corrupto, uno de los fallos
más difíciles de detectar porque cada embedding individual sigue siendo
válido.

## 11. Las stats de embed sirven para observabilidad, no para evaluar semantic quality

`tokensPerSecond` o `totalTime` explican el coste de producir vectores; no
indican si esos vectores recuperan buenos documentos. De forma inversa,
Precision@K y Recall@K explican retrieval quality; no dicen cuánto tarda el
pipeline. Mezclar ambos planos produce decisiones erróneas.

Puedes elegir entre dos embedding models donde A genera vectores el doble de
rápido pero pierde evidencia importante, y B es más lento pero mejora recall.
La elección depende de latency budget y calidad requerida. La única
comparación honesta reporta ambos ejes.

La API de QVAC hace esto visible al separar `embed()` de `ragSearch()`. Mantén
esa separación también en tus métricas. Si solo registras end-to-end latency,
no sabrás si la regresión vino del embedding model, del índice o del LLM.

## 12. El modelo de embeddings debe formar parte de la identidad del índice

Un índice vectorial no es simplemente “los documentos convertidos a números”.
Es `corpus + preprocessing + chunking + embedding model + metric + index
configuration`. Cambiar cualquiera de esas variables puede alterar el ranking.

QVAC formaliza parte de esa identidad en workspaces y la incompatibilidad de
modelos. [W03] En una arquitectura externa debes hacer lo mismo de forma
explícita: guarda un `embeddingModelVersion`, dimensión, métrica y versión del
pipeline en metadata del índice.

Esto también facilita rollback. Si un nuevo embedding model degrada retrieval,
puedes conservar el workspace anterior, construir uno paralelo y comparar
ambos sobre el mismo test set antes de migrar tráfico. Re-embedding no debería
ser una operación destructiva sin benchmark.

# Parte IV — Retrieval engineering: de vecinos cercanos a evidencia útil

Semantic search deja de ser un juguete cuando el corpus contiene documentos
parecidos, versiones, ruido, metadata y preguntas que no tienen respuesta. Esta
parte estudia retrieval como un subsistema con objetivos propios.

## 13. Top-K es una política de producto y de sistemas

`Top-K` determina cuántos candidatos avanzan desde el índice. Aumentar K suele
aumentar la probabilidad de incluir evidencia relevante, pero también aumenta
ruido, duplicación y context tokens si todos los resultados llegan al LLM. Por
eso K conecta directamente retrieval con inferencia.

Un K óptimo no existe fuera de una tarea. Para FAQ muy precisa, K=3 puede ser
suficiente; para una respuesta que requiere combinar varias secciones de un
manual, K=3 puede ser insuficiente. La evaluación debe incluir preguntas de
uno y múltiples documentos.

En QVAC, `ragSearch()` recibe `topK` como parámetro documentado. [W03] La API
no decide por ti qué K es correcto. Un buen benchmark hace un sweep y
representa curvas de recall, precision, latency y context size.

## 14. Precision@K y Recall@K responden preguntas distintas

Precision@K mide qué proporción de los K resultados devueltos es relevante.
Recall@K mide qué proporción de toda la evidencia relevante disponible
apareció en esos K. Un sistema puede tener alta precision y bajo recall si
devuelve pocos fragmentos muy buenos pero omite una segunda pieza necesaria.

En RAG composicional esto es crucial. Si la pregunta requiere la fecha de una
política y una excepción almacenada en otro fragmento, recuperar solo uno
puede hacer imposible una respuesta correcta aun con Precision@1 perfecta.

Las métricas requieren ground truth. Si no etiquetas qué fragmentos son
relevantes, no puedes calcularlas honestamente. En una primera versión del
bootcamp basta un pequeño test set humano, pero debe existir antes de
optimizar chunking o Top-K.

## 15. MRR es útil cuando importa que el primer hit aparezca pronto

Mean Reciprocal Rank recompensa colocar el primer resultado relevante en una
posición alta. Si el primer relevante está en rank 1, su reciprocal rank es 1;
si está en rank 5, es 0.2. La media sobre queries da una señal del orden de
los primeros hits.

MRR es menos informativo cuando una pregunta necesita varias piezas de
evidencia. Un sistema puede lograr MRR alto y aun fallar porque la segunda
evidencia nunca aparece. Por eso no debes seleccionar una sola métrica por
costumbre.

La selección de métricas debe reflejar el uso downstream. ICLERB cuestiona
precisamente la idea de medir retrievers solo por semantic relevance: un
documento puede ser relevante y aun no ser el contexto que más mejora la tarea
del LLM. [W14]

## 16. Retrieval utility: el mejor vecino no siempre es el mejor contexto

El objetivo de semantic search clásico puede ser encontrar el texto más
parecido. El objetivo de RAG es proporcionar evidence que permita responder.
Esas funciones objetivo se solapan pero no son idénticas. Un fragmento que
repite las palabras de la pregunta puede ser menos útil que otro que contiene
el procedimiento, tabla o condición necesaria.

Esto justifica evaluar downstream task success además de ranking. Una mejora
de cosine score no es una mejora de producto si answer correctness baja. La
evaluación de retrieval debe seguir el uso real que tendrá el contexto.

Este principio también explica reranking. El primer stage prioriza eficiencia
y recall; un segundo stage puede evaluar utilidad con una función más rica.
QVAC no documenta un reranker automático en el `ragSearch()` actual, por lo
que ese stage debe describirse como arquitectura adicional cuando se
implemente.

## 17. Exact search es un baseline valioso aunque no escale

Para un corpus pequeño, calcular similarity contra todos los vectores es fácil
y tiene una ventaja científica: elimina aproximaciones del índice. Sirve como
baseline para saber si un error proviene de la representación o del mecanismo
de nearest-neighbor search.

Cuando la colección crece, índices aproximados sacrifican algo de exactitud a
cambio de velocidad y memoria. El survey de similarity queries sobre neural
embeddings explica este problema de procesamiento a escala. [W11]

En el bootcamp, empezar con búsqueda exhaustiva en 100 notas hace visible la
matemática. Después, el built-in RAG store de QVAC o una base externa permiten
estudiar lifecycle y escala sin confundir index engineering con embedding
quality.

## 18. Metadata no sustituye embeddings; los complementa

Embeddings son buenos para relaciones semánticas difusas. Metadata
estructurada es mejor para condiciones exactas: departamento, fecha efectiva,
versión, idioma, cliente o nivel de acceso. Un sistema puede reducir candidate
space con metadata y después usar vector ranking.

Las APIs RAG de QVAC permiten persistir texto y metadata junto con embeddings
en el flujo documentado. [W02] Cómo filtrar por metadata depende del store y
de la lógica de aplicación; no debemos atribuir a `ragSearch()` filtros que la
referencia actual no especifica.

La regla de diseño es no forzar cada problema al embedding. Si una condición
debe cumplirse exactamente, represéntala explícitamente cuando sea posible.

## 19. Duplicados deforman el Top-K

Si un documento se ingiere dos veces o overlap produce fragmentos casi
idénticos, varias posiciones del Top-K pueden representar la misma evidencia.
El score parece excelente, pero la diversidad informativa cae. Esto es
especialmente problemático cuando K es pequeño.

Puedes medir duplicate rate agrupando por document ID o hash de contenido. Si
Top-5 contiene cuatro fragmentos del mismo párrafo, el retriever quizá
necesita deduplicación o una política de diversificación.

La solución no siempre es eliminar overlap. Overlap puede preservar contexto
en fronteras. El punto es medir el efecto que tiene sobre el candidate set y
no suponer que “más overlap = más recall = mejor”.

## 20. Corpus drift convierte buenos benchmarks en recuerdos históricos

Un retriever evaluado hoy puede degradarse cuando llegan documentos nuevos.
Nuevas versiones crean competidores semánticos; vocabulario interno cambia; el
corpus crece y modifica distribuciones de score. Esta evolución se denomina
aquí corpus drift.

Por eso los reportes deben registrar snapshot o versión del corpus. Cuando una
regresión aparece después de una actualización de documentos, necesitas saber
si cambió el modelo, el índice o simplemente el universo de candidatos.

El Private Knowledge Assistant debería mantener versioning suficiente para
reconstruir el conjunto usado en una evaluación. Sin snapshot, “antes teníamos
Recall@5 de 0.88” es difícil de interpretar.

## 21. Stale evidence es un fallo de lifecycle, no de similarity

Un retriever puede hacer exactamente su trabajo y devolver la versión antigua
de una política porque esa versión sigue en el índice. El problema no está en
el embedding; está en la política de actualización.

Cada documento versionado necesita IDs o metadata que permitan retirar o
reemplazar embeddings anteriores. QVAC expone `ragDeleteEmbeddings()` por IDs
y `ragDeleteWorkspace()` para borrado total del workspace. [W03]

El test correcto para una actualización no es solo “la nueva versión aparece”.
También debes preguntar algo cuya respuesta difería en la versión antigua y
confirmar que esa evidencia dejó de recuperarse.

## 22. Retrieval debe poder inspeccionarse sin generation

Una arquitectura opaca que llama a una función `ask()` y devuelve texto final
no permite saber por qué falló. Durante desarrollo, registra query, Top-K,
scores, IDs, metadata y contenido antes de invocar `completion()`.

Este “RAG debugger” transforma una respuesta incorrecta en un árbol de
diagnóstico. Si la evidencia necesaria no está en Top-K, investiga ingestion,
chunking, embedding o ranking. Si está presente y clara, investiga prompt y
generation.

Separar retrieval de generation es la decisión pedagógica que más reduce
confusión en el Módulo 2. También permite construir tests unitarios del
retriever sin cargar un LLM generador.

## 23. Empty search result no prueba que el conocimiento no exista

La API actual de QVAC documenta que `ragSearch()` devuelve `[]` si el
workspace no existe. [W03] Eso significa que una lista vacía puede expresar un
problema de lifecycle, no una conclusión semántica.

Antes de interpretar “no encontré nada” como “el corpus no responde”, verifica
que el workspace correcto existe, fue ingerido, usa el modelo esperado y
contiene los documentos. `ragListWorkspaces()` ayuda a inspeccionar existencia
y estado open. [W03]

Este detalle es importante para abstention. La aplicación no debe decir “la
documentación no contiene la respuesta” cuando en realidad buscó en un
workspace inexistente por un typo.

## 24. Retrieval thresholds necesitan un estado de error separado

Si usas un threshold de score, distingue tres estados: retrieval operativo sin
hits suficientes, retrieval operativo con evidencia y retrieval no operativo.
Un error de workspace o model mismatch no debe convertirse en “no sé”.

Este patrón evita un failure mode silencioso donde la app responde con
abstención y parece segura, aunque el subsistema de conocimiento esté roto.
Observability debe poder distinguir “unknown” de “unavailable”.

QVAC expone errores RAG específicos como `RAG_SEARCH_FAILED`,
`RAG_WORKSPACE_MODEL_MISMATCH` y `RAG_WORKSPACE_NOT_FOUND`. [W03] Úsalos para
clasificar fallos de infraestructura aparte de semántica.

# Parte V — Chunking con evidencia, no folklore

Chunking es una de las zonas donde más recetas sin fundamento circulan en
tutoriales de RAG. La investigación reciente no respalda una regla simple como
“500 tokens con 20 % de overlap” para todos los dominios. Lo correcto es
establecer baselines y medir.

## 25. Por qué el chunk es una unidad de recuperación, no solo una unidad de almacenamiento

El retriever no recupera “el documento” en abstracto; recupera las unidades
que fueron indexadas. Si una cláusula importante queda dividida entre dos
chunks, el vector de cada mitad puede perder contexto. Si un chunk mezcla tres
temas, la representación puede diluir cuál es central.

Esto hace que chunking determine la granularidad de evidence disponible para
generation. La unidad adecuada depende de estructura documental y tipos de
pregunta. Un FAQ, un contrato y un manual de API requieren diferentes
experimentos.

La variable debe evaluarse junto con Top-K. Chunks más pequeños pueden
necesitar K mayor para reconstruir contexto; chunks grandes consumen más
context tokens por hit. No optimices tamaño aisladamente.

## 26. Fixed-size chunking merece ser baseline, no insulto

Fixed-size chunking es barato, determinista y fácil de reproducir. Su
debilidad es que corta según longitud, no estructura. Pero precisamente por
ser simple sirve como control experimental.

Si un semantic chunker cuesta mucho más pero apenas mejora Recall@K, tal vez
no justifique complejidad. Investigaciones recientes de chunking encuentran
que métodos sofisticados no dominan en todos los corpora; un estudio sobre
textos académicos reportó que cluster-based semantic chunking no superó
baselines simples bajo su configuración. [W18]

Una mejora solo existe respecto a un baseline medido. Sin fixed-size bien
configurado, decir “nuestro chunker inteligente mejoró RAG” carece de
referencia.

## 27. Paragraph chunking aprovecha estructura disponible, pero depende de la extracción

La API actual de QVAC muestra `chunkStrategy: "paragraph"` en el ejemplo de
`ragChunk()`, junto con `chunkSize` y `chunkOverlap`. [W03] Esta estrategia
tiene sentido cuando los saltos de párrafo del documento representan unidades
coherentes.

En PDFs, sin embargo, extracción puede insertar saltos por layout, columnas o
páginas. Un párrafo visual puede fragmentarse en líneas; headers repetidos
pueden aparecer en cada página. Antes de culpar al chunker, inspecciona el
texto normalizado.

Por eso ingestion debe conservar una etapa de observabilidad previa a
embedding. Muestra los primeros chunks, longitudes, metadata y fronteras. Un
pipeline que no permite ver su segmentación es difícil de depurar.

## 28. Overlap es una póliza de continuidad con coste de redundancia

Overlap repite una ventana entre chunks vecinos para reducir el riesgo de
cortar una relación en la frontera. Esto puede aumentar recall cuando la
evidencia cruza el límite, pero también aumenta número de chunks,
almacenamiento, tiempo de embedding y probabilidad de recuperar duplicados.

No existe un porcentaje universal. El overlap necesario depende de la forma
del texto y del tamaño del chunk. Un overlap fijo de 100 tokens significa algo
muy distinto en chunks de 200 y de 2000.

Evalúa el porcentaje de Top-K ocupado por siblings del mismo documento. Si
overlap mejora recall pero destruye diversidad, puede ser preferible expandir
contexto después de retrieval en lugar de duplicar tanto durante indexación.

## 29. Semantic chunking añade una segunda dependencia de embeddings

Semantic chunking detecta posibles fronteras usando cambios de representación
o similaridad. Eso puede alinear unidades con temas, pero añade un modelo,
thresholds y costo de cómputo a ingestion.

ChunkRAG reporta mejoras usando semantic chunking y chunk filtering en su
evaluación. [W15] Otros trabajos de 2026 muestran que métodos adaptativos o
query-aware pueden mejorar ciertos corpora. Pero la literatura también
contiene resultados donde estrategias simples ganan. [W16] [W18]

La conclusión proof-checked es condicional: semantic chunking es una familia
de técnicas prometedora, no una best practice universal ni una primitive que
deba atribuirse automáticamente a QVAC.

## 30. Query-adaptive chunking cambia incluso qué significa “ingestion”

QASC, publicado en 2026, propone usar la query para seleccionar semillas y
expandir ventanas contextuales, en vez de fijar completamente los chunks antes
de conocer la consulta. Sus autores reportan mejoras sobre los baselines
evaluados. Ese enfoque demuestra que chunking puede moverse de una fase
offline a una estrategia parcialmente query-time. [academia26]

Esto introduce nuevos tradeoffs: mayor coste por query, menos reutilización de
un índice estático y más complejidad de reproducibilidad. También puede
resultar útil cuando documentos son largos y la necesidad de contexto depende
fuertemente de la consulta.

QVAC no documenta QASC como feature built-in. Si se explora en el bootcamp
debe implementarse como arquitectura experimental encima de las primitivas
actuales.

## 31. Adaptive chunking recuerda que documentos distintos merecen estrategias distintas

El trabajo Adaptive Chunking de 2026 cuestiona el one-size-fits-all y propone
seleccionar estrategias según propiedades del documento. Sus resultados
reportados pertenecen al corpus y framework evaluados, pero la idea conceptual
es valiosa: un manual técnico, una sentencia y una conversación no tienen la
misma estructura. [academia29]

Incluso sin implementar ese framework, puedes clasificar documentos por tipo y
usar políticas diferentes. La clave es que cada política se registre como
metadata de ingestion para poder reproducir retrieval.

La complejidad adicional debe justificar su mantenimiento. Si dos estrategias
producen resultados equivalentes en tu corpus, la simple tiene ventajas de
operación, debugging y actualización.

## 32. Hierarchical chunking intenta conservar contexto a varias escalas

Un enfoque jerárquico puede indexar unidades pequeñas para matching preciso y
mantener relaciones con secciones o documentos mayores para ampliar contexto
después. HiChunk es un ejemplo de investigación de esta familia y propone un
benchmark asociado. [W19]

El beneficio potencial es evitar el dilema “chunk pequeño preciso vs chunk
grande con contexto” mediante dos niveles. El coste es metadata adicional, más
lógica de retrieval y la posibilidad de duplicar contenido.

No se atribuye esta estrategia al built-in RAG de QVAC porque las fuentes
actuales no la documentan como primitive. Es una extensión de diseño sobre
`ragChunk`/embeddings/storage si el proyecto la necesita.

## 33. Tablas desafían a los chunkers de texto lineal

Una tabla contiene relaciones entre filas, columnas y encabezados. Convertirla
a texto lineal sin preservar headers puede producir chunks imposibles de
interpretar: “12 34 56” no dice qué significan esos valores.

La ingestión debe decidir cómo serializar tablas: repetir encabezados por
fila, convertir a Markdown, mantener JSON estructurado o crear summaries. La
elección debe validarse con preguntas reales que consulten celdas y
condiciones.

Este problema pertenece a preprocessing, no a embeddings exclusivamente. Un
embedding model no puede recuperar estructura que fue destruida antes de
recibir el texto.

## 34. Código fuente necesita fronteras semánticas diferentes a prosa

Funciones, clases, imports y signatures son unidades naturales que no
coinciden con párrafos narrativos. Cortar una función a mitad puede separar el
nombre de su comportamiento; agrupar diez funciones puede diluir la consulta.

Una estrategia de código puede usar parser/AST para producir chunks y
conservar ruta de archivo, símbolo y language en metadata. Eso es arquitectura
de aplicación, no comportamiento built-in de `ragChunk()` establecido por las
fuentes actuales.

La lección general es que chunking debe respetar la estructura informativa que
el usuario consultará. El mismo embedding model puede recibir unidades
preparadas de formas muy distintas.

## 35. PDF layout corruption puede dominar más que cualquier tuning de chunk size

Cuando un PDF se extrae mal, aparecen headers repetidos, footers, columnas
intercaladas y guiones de final de línea. Ajustar Top-K sobre ese texto
optimiza un índice de ruido.

Antes de embedding, calcula señales simples: porcentaje de líneas repetidas,
longitudes extremas, caracteres extraños y secuencias duplicadas por página.
Muestra muestras al humano.

RAG fiable empieza por corpus fiable. La sofisticación del retriever no
compensa una tabla cuyas columnas fueron fusionadas durante extracción.

## 36. Chunking evaluation debe mirar retrieval y downstream

Un chunk puede parecer coherente intrínsecamente y aun recuperar mal. Otro
puede ser feo lingüísticamente pero contener exactamente la unidad que
responde. Por eso métricas internas de chunk cohesion deben complementarse con
retrieval tests.

El trabajo Adaptive Chunking propone métricas intrínsecas para propiedades
como cohesión y block integrity, pero sus resultados downstream siguen siendo
parte esencial de la validación. [academia29]

Para el bootcamp, la secuencia recomendada es: inspección humana de chunks,
Recall@K/Precision@K sobre queries, después answer correctness/faithfulness
del pipeline. Evita optimizar solo una capa.

# Parte VI — QVAC RAG v0.18.x: lifecycle y comportamiento documentado

Esta parte se limita deliberadamente a comportamiento establecido por la
documentación actual de QVAC. Cuando se propone una extensión, se etiqueta como
arquitectura de aplicación.

## 37. `ragIngest()` es un pipeline gestionado, no magia

La referencia v0.18.x define `ragIngest()` como el pipeline completo `chunk →
embed → save`. La operación abre o crea el workspace implícitamente y lo deja
abierto hasta que se cierre explícitamente. Devuelve `processed` y
`droppedIndices`, además de un `requestId` síncrono para cancelación dirigida.
[W03]

Eso significa que ingestion debe inspeccionar ambos resultados. No basta con
“la Promise resolvió”: `droppedIndices` identifica inputs que no terminaron en
la colección. Un contador de documentos fuente y un contador de documentos
procesados deben formar parte de observabilidad.

Managed flow reduce boilerplate, pero también oculta etapas. Para debugging o
preprocessing custom, el segregated flow puede ser preferible.

## 38. El segregated flow existe para hacer visibles las transformaciones

QVAC documenta `ragChunk() → embed() → ragSaveEmbeddings()` como flujo
separado. `ragChunk()` devuelve `RagDoc[]`; `embed()` produce vectores; los
documentos resultantes se guardan junto con `embeddingModelId`. [W03]

Este camino permite inspeccionar contenido antes de vectorizar, añadir
metadata, controlar batching y verificar que el número de embeddings coincide
con el número de chunks.

No es automáticamente “más avanzado” ni “más rápido”. Su ventaja principal es
control y auditabilidad. Managed y segregated son dos ergonomías sobre la
misma necesidad conceptual: producir unidades, representarlas y persistirlas.

## 39. `ragSearch()` requiere separar query embedding de workspace state mentalmente

La firma documentada recibe `modelId`, `query`, `topK` y workspace dentro de
`RagSearchParams`. El workspace debe existir; si no existe, la API actual
devuelve un array vacío. [W03]

Aunque la función haga el embedding de query internamente, sigue siendo útil
pensar en dos pasos: representar query y ejecutar search. Esa separación
explica model mismatch y ayuda a estimar latency.

Si necesitas controlar o medir el query vector directamente, puedes construir
un pipeline externo; no inventes un overload de `ragSearch()` que reciba un
vector si la API actual no lo documenta.

## 40. `ragListWorkspaces()` expone persistencia en disco vs recursos abiertos

La API devuelve todos los workspaces existentes en disco y un campo `open` que
indica si el workspace está actualmente cargado en memoria y mantiene recursos
como Corestore, HyperDB adapter y posiblemente una RAG instance. [W03]

Esta distinción es muy útil para enseñar lifecycle. “Existe” no significa
“está abierto”; “cerrado” no significa “borrado”. Un restart puede reencontrar
un workspace persistente aunque no estuviera abierto al cerrar la app.

Una UI administrativa puede usar esta lista para debugging, migraciones o
limpieza, pero debe evitar exponer nombres sensibles sin control.

## 41. `ragCloseWorkspace()` libera recursos y conserva datos por defecto

Cerrar un workspace libera recursos en memoria y file locks. La documentación
actual especifica que los datos permanecen en disco salvo `deleteOnClose:
true`. [W03]

Esta semántica permite una prueba clara: ingiere, busca, cierra, reinicia el
proceso y vuelve a buscar. Si los datos desaparecen sin haber pedido borrado,
hay un problema de lifecycle o configuración.

`deleteOnClose` es útil en tests temporales, pero es una opción destructiva.
No debe usarse por costumbre en una aplicación que promete memoria
persistente.

## 42. `ragDeleteWorkspace()` y `ragDeleteEmbeddings()` sirven a dos escalas de borrado

`ragDeleteEmbeddings()` elimina documentos por IDs dentro de un workspace
existente. `ragDeleteWorkspace()` elimina la colección completa y requiere que
no esté actualmente cargada/en uso. [W03]

El primer mecanismo es el que permite lifecycle documental fino: retirar una
versión antigua sin perder toda la colección. El segundo sirve para reset,
desinstalación o destrucción total.

Un sistema de actualización debe poder mapear documento fuente → IDs
derivados. Sin esa provenance operacional, no sabrás qué embeddings eliminar
cuando el archivo cambie.

## 43. `ragReindex()` es mantenimiento del índice, no re-embedding

QVAC documenta que `ragReindex()` optimiza el índice de búsqueda y, para
HyperDB, rebalancea centroids mediante k-means. No se describe como operación
que vuelva a generar embeddings. [W03]

La referencia también indica un mínimo de 16 documentos por defecto para
clustering en HyperDB. Con menos documentos, `reindexed` puede ser `false` y
`details` explicar el motivo. [W03]

Este es un ejemplo perfecto de respuesta no binaria: “no reindexó” no implica
error. La app debe leer el resultado y distinguir skip documentado de
excepción.

## 44. Workspace-model mismatch protege de una corrupción semántica sutil

Si un workspace fue construido con un embedding model y se consulta con otro,
los vectores pueden tener otra dimensión o, incluso con igual dimensión, otra
geometría. QVAC expone explícitamente `RAG_WORKSPACE_MODEL_MISMATCH`. [W03]

La solución correcta no es capturar el error y continuar. Debes usar el modelo
original o construir un nuevo workspace re-embebiendo el corpus. Mezclar
vectores de espacios incompatibles destruiría el significado del ranking.

Este error es también una señal de que model identity debe ser parte de
configuration management, no un detalle escondido en un script.

## 45. Los errores RAG son parte de la API de diagnóstico

La API Summary lista errores específicos como `RAG_SAVE_FAILED`,
`RAG_SEARCH_FAILED`, `RAG_DELETE_FAILED`, `RAG_HYPERDB_FAILED`,
`RAG_WORKSPACE_MODEL_MISMATCH`, `RAG_WORKSPACE_NOT_FOUND`,
`RAG_WORKSPACE_IN_USE`, `RAG_WORKSPACE_CLOSE_FAILED`,
`RAG_LIST_WORKSPACES_FAILED`, `RAG_CHUNK_FAILED` y `RAG_WORKSPACE_NOT_OPEN`.
[W03]

No todos indican el mismo layer. Agruparlos bajo un genérico “RAG failed”
elimina información que puede guiar recuperación o mensaje de usuario.

El production design debería mapear errores técnicos a acciones: retry,
reopen, migrate, reingest, inform user o abort. El texto exacto del `cause`
debe conservarse en logs técnicos cuando sea seguro.

## 46. Cancellation aplica también a operaciones largas de conocimiento

La API de QVAC usa `requestId` como mecanismo principal de cancelación para
operaciones largas, incluyendo `embed()` y `ragIngest()`. [W03]

Esto es importante para ingestion interactiva. El usuario puede cancelar una
importación de miles de documentos sin cerrar todo el SDK. La aplicación debe
decidir qué hacer con resultados ya procesados antes de la cancelación.

La cancelación no elimina automáticamente la necesidad de transacciones o
idempotencia a nivel de corpus. Después debes verificar qué documentos
quedaron persistidos y poder reanudar o limpiar de forma consistente.

## 47. El plugin system revela las dependencias reales de RAG

QVAC documenta que RAG depende de los plugins LLM y Embeddings en builds
configurables. El catálogo actual asocia text embeddings y RAG al plugin
`@qvac/sdk/llamacpp-embedding/plugin`, y RAG también depende de la capacidad
LLM en la configuración documentada. [W05]

Esta información importa para bundle design. Un build mínimo puede habilitar
solo capacidades necesarias, pero si eliminas embeddings no puedes esperar que
RAG funcione.

El plugin system es una dependencia de build, no un cambio en el modelo
conceptual: retrieval sigue necesitando una representación y generation sigue
necesitando un LLM cuando quieres una respuesta generada.

## 48. El HTTP server ya expone embeddings y RAG, pero eso pertenece a otra frontera

El servidor OpenAI-compatible actual de QVAC soporta `/v1/embeddings` y
endpoints de Files/Vector stores para RAG, además de text generation. [W06]
Eso permite que aplicaciones compatibles usen las capacidades locales a través
de HTTP.

Para el Módulo 2, sin embargo, conviene aprender primero la API SDK directa
para ver lifecycle y datos. El servidor añade otra capa de protocolo que puede
ocultar detalles útiles durante aprendizaje.

Más adelante, la misma arquitectura puede exponerse como servicio local sin
cambiar la distinción conceptual entre embedding, storage, retrieval y
generation.

# Parte VII — De retrieval a generation: RAG que puede explicarse

Una respuesta generada es el último stage, no la evidencia de que el sistema
funciona. Esta parte analiza cómo convertir hits en contexto sin perder
provenance ni capacidad de abstención.

## 49. RAG agrega memoria externa, no reescribe los pesos

El paper fundacional de Lewis et al. separa memoria paramétrica del generador
y memoria no paramétrica recuperable. [W09] Esa separación es útil incluso si
la implementación moderna difiere del setup original.

Cuando agregas un PDF al vector store, el LLM no “aprende” ese documento en
sus pesos. La próxima pregunta recupera fragments y los coloca en contexto. Si
eliminas el índice, ese acceso desaparece sin haber modificado el modelo.

Esta propiedad hace RAG adecuado para conocimiento que cambia. También explica
por qué no debes llamar “training” a ingestion.

## 50. El prompt grounded debe separar instrucciones de evidence

Un prompt RAG robusto delimita la pregunta, las reglas y los fragmentos
recuperados. Etiquetas de source ayudan a conservar provenance y a evitar que
el generador trate todos los textos como una masa sin origen.

Una instrucción útil puede decir que use únicamente la evidencia proporcionada
y declare insuficiencia cuando no sea suficiente. Esto reduce grados de
libertad, pero sigue siendo una instrucción probabilística: no es un mecanismo
formal que garantice obediencia.

La evaluación debe verificar la respuesta, no asumir que el prompt funcionó
porque estaba bien redactado.

## 51. Retrieval failure y generation failure son dos bugs distintos

Si el fragmento correcto no aparece entre los hits, hablamos de retrieval
failure. Puede provenir de preprocessing, chunking, embeddings, ranking,
filtros, Top-K o stale corpus.

Si el fragmento correcto está presente y la respuesta lo contradice o ignora,
el problema se desplaza hacia generation, prompt construction o capacidad del
modelo. Cambiar embedding model no es la primera intervención.

Un RAG debugger debe mostrar ambos lados: evidence recuperada y respuesta
final. Esta separación convierte debugging en un proceso causal.

## 52. RAG reduce ciertos riesgos de hallucination, no los elimina

La memoria externa permite proporcionar hechos y provenance que no dependen
exclusivamente de los parámetros del modelo. El paper original reportó mejoras
de factualidad en sus tareas; reviews posteriores presentan grounding como una
estrategia para reducir hallucination risk. [W09]

Pero el pipeline puede alucinar de varias formas: evidence incorrecta,
evidence correcta ignorada, mezcla de fuentes incompatibles, extrapolación más
allá del texto o citas que no soportan la afirmación.

Por eso “usa RAG” no es un claim de seguridad. Debe acompañarse de retrieval
tests, faithfulness tests y unknown-knowledge tests.

## 53. Unknown Knowledge Test mide una capacidad distinta: abstenerse

Un sistema puede tener excelente accuracy en preguntas respondibles y ser
peligroso cuando no hay evidencia. El Unknown Knowledge Test crea consultas
deliberadamente fuera del corpus.

El resultado correcto no debe evaluarse por una frase exacta. Debe evaluarse
por la propiedad: no inventa soporte, no cita documentos irrelevantes como
prueba y comunica que la evidencia disponible es insuficiente.

Un threshold de similarity puede ayudar, pero no es suficiente por sí solo.
Debes calibrarlo y distinguir falta de evidencia de fallo operativo del
workspace.

## 54. Provenance empieza en ingestion, no en la interfaz

No puedes añadir fuentes fiables al final si perdiste identidad del documento
durante chunking. Cada chunk debe mantener un vínculo estable con source,
document version y, cuando sea posible, sección o posición.

Cuando `ragSearch()` devuelve resultados, esa metadata debe viajar a prompt y
UI sin ser reemplazada por una etiqueta inventada. El usuario debe poder abrir
o inspeccionar la fuente original.

La provenance más útil es bidireccional: de respuesta a evidence y de evidence
a documento fuente. También permite eliminar todos los chunks derivados de una
versión obsoleta.

## 55. “Fuentes recuperadas” no equivale a “citas que soportan la respuesta”

Un sistema puede mostrar tres sources debajo de una respuesta simplemente
porque fueron Top-3. Eso no garantiza que cada source soporte cada claim. Esta
práctica crea una ilusión de grounding.

Una interfaz más rigurosa distingue retrieved sources de claim support. Para
respuestas críticas, puedes mapear oraciones a fragments o al menos pedir al
usuario que inspeccione el evidence exacto.

La evaluación de citation support pregunta si la fuente citada realmente
respalda la afirmación. Es una dimensión diferente de retrieval relevance.

## 56. Faithfulness y correctness deben mantenerse separadas

Faithfulness pregunta si la respuesta se deriva del contexto suministrado.
Correctness pregunta si coincide con la realidad o ground truth. Una respuesta
puede ser perfectamente faithful a un documento obsoleto y estar equivocada
respecto a la política vigente.

Por eso version management pertenece a knowledge quality. RAG no corrige
documentos incorrectos; amplifica lo que recupera.

También debes ser prudente con métricas automáticas de faithfulness. El
estudio de chunking en textos académicos de 2026 reportó limitaciones de
fiabilidad de una métrica RAGAs bajo su setup. [W18] Una métrica debe
validarse, no venerarse.

## 57. Context packing decide qué evidencia recibe realmente el LLM

Después de retrieval todavía debes ordenar y empacar chunks dentro del context
budget. Incluir demasiados hits aumenta prefill, ruido y riesgo de que
evidence importante quede diluida.

Puedes ordenar por score, diversificar por source, agrupar por documento o
reservar espacio para instrucciones. Cada política tiene tradeoffs.

QVAC documenta el retrieval y `completion()` como capacidades separadas; no
atribuimos al SDK una estrategia automática de packing que las fuentes
actuales no especifican. Esta es una decisión de aplicación.

## 58. Reranking es útil cuando first-stage recall es bueno pero el orden no

Un first-stage vector retriever puede recuperar Top-20 rápidamente. Un
reranker más costoso puede evaluar cada pareja query-document con mayor
detalle y producir un Top-5 mejor ordenado.

El estudio de policy QA incluido en las fuentes reporta mejoras con
cross-encoder reranking en su dominio. [W17] Eso es evidencia de una
configuración, no una garantía universal.

Como QVAC no documenta un reranker built-in en `ragSearch()`, implementarlo
debe describirse honestamente como una capa app-level o externa.

## 59. Chunk filtering es otro stage y debe pagar su propia factura

ChunkRAG añade filtering de chunks antes de generation y reporta mejoras en su
evaluación. [W15] El mecanismo puede reducir evidence irrelevante, pero
consume cómputo y añade otro modelo o criterio susceptible de error.

Cuando agregas un stage, mide qué problema resuelve. Si elimina 60 % de tokens
de context sin perder answer accuracy, puede justificar su costo. Si añade 400
ms y apenas cambia resultados, quizá no.

RAG systems se vuelven complejos por acumulación de etapas “inteligentes”.
Cada una debe tener métrica y failure mode propios.

## 60. La memoria externa debe actualizarse sin volver a entrenar el LLM

Una de las ventajas operativas centrales de RAG es desacoplar actualización de
knowledge de actualización de model weights. Si cambia una política, puedes
retirar chunks antiguos e ingerir la nueva versión.

Ese proceso necesita IDs estables, document version y re-embedding de la nueva
representación. La actualización debe incluir pruebas que confirmen ausencia
de stale hits.

Fine-tuning tiene otro objetivo: adaptar comportamiento o representación del
modelo mediante entrenamiento. Puede complementar RAG, pero no es sustituto
natural de un corpus actualizable y auditable.

# Parte VIII — Evaluación real: cómo saber qué está roto

La calidad de un RAG no debe resumirse en “respondió bien a mis tres preguntas”.
Esta parte propone una evaluación por capas que produce evidencia diagnóstica.

## 61. Un test set de retrieval debe escribirse antes de optimizar

Selecciona queries representativas y anota qué documentos/chunks contienen la
evidencia necesaria. Incluye preguntas fáciles, hard negatives, negaciones,
versiones y preguntas sin respuesta.

Si optimizas primero y construyes el test después, corres el riesgo de diseñar
casos que favorecen el sistema actual. El benchmark debe ser una restricción
externa, no una celebración de lo que ya funciona.

Empieza pequeño: 30–50 queries bien pensadas pueden enseñar más que mil
queries sintéticas sin relevance labels confiables.

## 62. Evaluar ingestion evita culpar al retriever por datos ausentes

Antes de medir search, verifica coverage: número de documentos recibidos,
procesados y descartados. En QVAC, `ragIngest()` devuelve `droppedIndices`,
información que debe formar parte del report. [W03]

Después inspecciona chunks resultantes. Si la respuesta real nunca quedó en
una unidad indexada, ninguna métrica del vector search puede rescatarla.

El pipeline de evaluación debe tener gates: corpus correcto → chunks correctos
→ embeddings correctos → retrieval → generation.

## 63. Retrieval regression tests deben preservar failures reales

Cada query que falló en producción o en un lab debe entrar a un conjunto de
regresión con su evidence esperado. Después de cambiar chunking, model o
Top-K, ejecuta el suite completo.

Esto evita optimizar un subconjunto y romper otro. Una mejora de average
Recall puede ocultar pérdida en consultas críticas.

Agrupa tests por categoría: negation, date, multi-hop, duplicate, short query,
long query, out-of-domain. Así puedes ver qué tipo de comportamiento cambió.

## 64. Latency debe descomponerse por stage

End-to-end latency es útil para UX pero insuficiente para optimización. Separa
query embedding, vector search, optional rerank/filter, prompt construction,
LLM TTFT y decode.

Si search tarda 8 ms y prefill 1.8 s, optimizar el índice no mueve la
experiencia. Si query embedding tarda 500 ms en un móvil, batch o model choice
sí pueden importar.

Esta descomposición conecta directamente con el Módulo 1: RAG añade trabajo
antes de `completion()`, pero TTFT del generador sigue siendo una métrica
independiente.

## 65. Quality y latency forman un frente de Pareto

Top-K alto, reranking, semantic chunking y modelos más grandes pueden mejorar
quality y también aumentar coste. No existe una configuración “mejor” sin
restricciones.

Un diseño útil compara configuraciones en un plano quality-latency. Una opción
puede dominar otra si es mejor en ambos ejes; muchas veces tendrás un frente
de compromisos.

La selección final debe responder al producto: una herramienta offline
personal puede tolerar 2 s y priorizar privacidad; autocomplete interactivo
puede exigir mucho menos.

## 66. Ground-truth incompleto puede castigar al retriever correcto

En corpora complejos puede haber varios fragments válidos. Si el dataset marca
solo uno, un retriever que devuelve otra evidencia suficiente parecerá
incorrecto.

Las relevance labels deben permitir múltiples positives y actualizarse cuando
se descubre nueva evidencia. La evaluación humana debe revisar disagreements
de forma sistemática.

Esto también evita sobreajustar el ranking a una única formulación documental
cuando el corpus contiene redundancia legítima.

## 67. LLM-as-judge necesita calibración contra humanos

Un LLM puede acelerar evaluación de faithfulness o correctness, pero también
tiene sesgos y errores. No debe convertirse en ground truth por definición.

Selecciona una muestra, haz evaluación humana ciega y compara al judge.
Estudia falsos positivos y negativos. Si el judge no correlaciona
suficientemente con tu criterio, cambia prompt/modelo o evita usarlo para
decisiones críticas.

La evaluación es otro sistema de IA y merece el mismo rigor que el producto.

## 68. Unknown Knowledge necesita métricas propias

Mide abstention precision: cuando el sistema se abstiene, ¿realmente faltaba
evidencia? Y abstention recall: de las preguntas sin evidencia, ¿en cuántas se
abstuvo?

Si fuerzas abstención demasiado agresiva, puedes mejorar seguridad aparente y
rechazar preguntas respondibles. Si eres demasiado permisivo, aumentan answers
sin soporte.

El objetivo es una política calibrada, no “si score < 0.7, no responder”.

## 69. Citation evaluation debe comprobar soporte, no existencia del link

Una cita es correcta si el documento existe, pero eso no basta. Debe contener
la evidencia que soporta el claim. Puedes evaluar una muestra de
claim-citation pairs manualmente y calcular citation precision.

También registra cases donde una afirmación requiere fuente pero no tiene una.
Eso aproxima citation recall.

Esta disciplina evita interfaces donde las referencias son decoración de
credibilidad.

## 70. Reproducibility requiere fijar más que el modelo

Para reproducir un run debes conocer snapshot del corpus, preprocessing,
chunking, overlap, embedding model/version, vector metric, workspace/index,
Top-K, reranker, prompt template y LLM config.

Si cualquiera cambia, la comparación histórica puede dejar de ser válida.
Guarda un manifest junto con cada benchmark.

El objetivo no es burocracia: es poder responder “¿qué cambió?” cuando una
release mejora una métrica y empeora otra.

# Parte IX — Private Knowledge como sistema local-first

La privacidad del Módulo 2 no se demuestra diciendo que “los embeddings son
anónimos”. Los documentos, vectores, metadata, logs y prompts son parte de la
superficie de datos y deben trazarse.

## 71. Un embedding derivado de datos sensibles sigue siendo dato sensible

Un vector no es legible como una oración, pero eso no autoriza a tratarlo como
información pública. Representa propiedades del contenido y puede ser útil
para inferencia, linkage o ataques dependiendo del modelo y acceso.

Por tanto, el vector store debe heredar controles proporcionales al corpus:
permisos de filesystem, backups, encryption si el producto lo requiere y
políticas de borrado.

La ventaja local-first es reducir tránsito hacia terceros, no transformar
datos sensibles en inocuos.

## 72. Logs son una fuga frecuente en RAG debugging

Durante desarrollo es cómodo imprimir query, chunks, prompt y answer. Con
documentos reales, esos logs pueden convertirse en una segunda copia del
corpus distribuida por terminales, CI y sistemas de observabilidad.

Diseña logging con redaction. IDs y timings suelen ser suficientes para muchas
métricas; content completo debe habilitarse conscientemente y en entornos
controlados.

Un pipeline puede ser local en inferencia y aun violar privacidad si envía
logs a un collector remoto. La data path audit debe incluir observability.

## 73. Workspace isolation es organización, no security boundary garantizada

QVAC workspaces separan colecciones y lifecycle, pero las fuentes actuales no
afirman que el nombre del workspace implemente autorización, cifrado o un
sandbox criptográfico entre usuarios.

Si dos usuarios no deben acceder a los mismos documentos, la aplicación
necesita un modelo de autorización y storage adecuado. No construyas seguridad
sobre una propiedad que la API no promete.

Esta distinción es parte de proof-checking: “separado lógicamente” y “aislado
frente a un atacante” son claims diferentes.

## 74. Airplane-mode RAG debe probar todo el path, no solo el LLM

Un RAG verdaderamente local para el caso de uso debe tener disponibles offline
el embedding model, el workspace/index, los documentos/chunks necesarios y el
LLM.

La prueba completa es: provisionar, cerrar, cortar red, reiniciar,
abrir/buscar workspace, generar query embedding, recuperar y completar una
respuesta nueva.

Si el LLM funciona offline pero el vector store vive en cloud, la app no posee
la ruta de conocimiento. Own the Knowledge exige que esa dependencia sea
explícita.

## 75. Backups y exportabilidad son parte de ownership

Una memoria local valiosa necesita estrategia de backup. Perder el único
índice puede ser recuperable si conservas documentos originales, pero
re-embedding puede ser costoso.

Idealmente el sistema conserva fuentes en formatos exportables y un manifest
que permita reconstruir el índice. No trates el vector store como única copia
de información original.

Esto conecta con local-first: control implica poder mover, restaurar y
reconstruir tus datos sin depender de un proveedor.

## 76. Borrado debe ser verificable a nivel de conocimiento

Cuando el usuario elimina un documento, el sistema debe retirar sus chunks del
índice y evitar que una copia stale siga siendo recuperada. El test posterior
debe buscar frases distintivas del documento eliminado.

`ragDeleteEmbeddings()` proporciona el mecanismo de borrado por IDs en QVAC.
[W03] La aplicación debe mantener el mapping desde documento a IDs derivados.

Eliminar el archivo fuente pero dejar vectores/chunks en el workspace no
cumple un requisito fuerte de borrado de conocimiento.

# Parte X — Casos completos de diagnóstico

Los casos siguientes no son formularios. Cada uno contiene una situación,
hipótesis, análisis y solución razonada para mostrar cómo se usa el modelo
mental del módulo.

## Caso A — La respuesta cita una política vieja

El sistema tiene una política 2025 y una revisión 2026. La pregunta se refiere
a la regla vigente, pero Top-3 contiene dos chunks de la versión 2025 y uno de
2026. El LLM responde con la regla antigua y cita correctamente el documento
antiguo.

Esto no es un generation failure puro: la respuesta es fiel a evidence que no
debería haber competido como vigente. El problema principal es lifecycle del
corpus y, quizá, metadata/version filtering. La corrección es retirar o marcar
versiones obsoletas, reconstruir los IDs derivados y añadir un regression test
que pregunte por la regla modificada.

Después de la corrección, no basta con que 2026 aparezca. La versión 2025 debe
dejar de recuperarse para queries de vigencia actual, salvo que la aplicación
ofrezca explícitamente búsqueda histórica.

## Caso B — El chunk correcto está en rank 7 y Top-K es 5

El retriever conoce la evidencia pero la política de K la excluye. El LLM
recibe cinco chunks temáticamente relacionados y produce una respuesta
plausible sin la condición específica.

El diagnóstico se obtiene ejecutando búsqueda con K mayor y observando que el
fragmento requerido aparece en rank 7. Esto es retrieval-policy failure, no
embedding failure necesariamente.

Las opciones son mejorar ranking, aumentar K, rerankear candidatos o cambiar
chunking. Cada opción tiene coste. La decisión debe medirse sobre todo el test
set para evitar solucionar esta query y degradar latency/context en las demás.

## Caso C — Top-K perfecto, respuesta equivocada

Los tres hits contienen claramente la respuesta. El prompt final muestra esos
fragments, pero el modelo resume una excepción al revés.

Aquí retrieval funciona. Cambiar embedding model no ataca la causa. Investiga
prompt structure, model capability, context ordering y generation config. Un
modelo pequeño puede ser insuficiente para una regla complicada aun con
evidence correcto.

Este caso demuestra por qué answer correctness debe medirse aparte de
Recall@K. Un RAG puede tener retrieval perfecto y generation mediocre.

## Caso D — `ragSearch()` devuelve [] después de un typo

La aplicación usa workspace `private-note` en lugar de `private-notes`. Según
la API actual, buscar en un workspace que no existe devuelve un array vacío.
[W03] La capa de producto interpreta el array como “no hay evidencia” y
muestra abstención.

El comportamiento parece seguro, pero el sistema está roto. Antes de semantic
abstention, valida lifecycle: workspace esperado existe y contiene datos.
`ragListWorkspaces()` ayuda a distinguir typo de ausencia real.

La corrección incluye un estado operativo explícito: UNKNOWN por falta de
evidencia no es lo mismo que UNAVAILABLE por índice inexistente.

## Caso E — Un nuevo embedding model rompe el workspace

El equipo actualiza el modelo de embeddings y reutiliza el nombre del
workspace. QVAC devuelve `RAG_WORKSPACE_MODEL_MISMATCH`. [W03]

La excepción es correcta: mezclar espacios vectoriales sería semánticamente
inválido. El plan de migración debe crear un workspace nuevo, re-embedder
corpus, ejecutar el benchmark viejo contra ambos y promover el nuevo solo si
cumple.

Después se puede cerrar y borrar el workspace anterior cuando rollback ya no
sea necesario.

## Caso F — Semantic chunking cuesta mucho y no mejora

El pipeline reemplaza paragraph chunking por un segmentador semántico y
triplica el tiempo de ingestion. Recall@5 pasa de 0.91 a 0.912, sin cambio
significativo en answer correctness.

Aunque la técnica sea más sofisticada, la evidencia no justifica complejidad
en este corpus. Investigación reciente también muestra que chunkers complejos
no dominan universalmente. [W16] [W18]

La decisión correcta puede ser mantener el baseline simple y documentar que el
semantic chunker fue evaluado. Engineering maturity incluye descartar mejoras
que no pagan su coste.

## Caso G — Overlap duplica evidence y reduce diversidad

Con overlap alto, Top-5 contiene cinco chunks contiguos del mismo documento.
Recall de ese documento es alto, pero la pregunta requiere combinar dos
fuentes.

El problema no es necesariamente la métrica: el índice está haciendo ranking
de un conjunto redundante. Reduce overlap, aplica deduplicación por document
ID o recupera más candidatos y diversifica antes de context packing.

Mide “unique source count@K” además de Precision@K para detectar este patrón.

## Caso H — Unknown Knowledge produce una respuesta correcta por memoria paramétrica

La pregunta no existe en el corpus, pero el LLM conoce la respuesta general de
su pretraining. Desde perspectiva de conocimiento privado, esto es un fallo de
la política grounded: el sistema no puede demostrar que la respuesta provino
de evidence local.

Si el producto promete “responde solo con mis documentos”, la salida correcta
es abstención aunque el hecho sea verdadero externamente. Si el producto
permite mezclar conocimiento del modelo, debe etiquetar esa diferencia.

La arquitectura necesita definir qué significa “correcto” según la promesa de
producto, no solo según factualidad mundial.

## Caso I — El documento fue borrado pero sigue apareciendo

El archivo original desapareció del directorio, pero sus chunks permanecen en
el workspace. Vector search sigue recuperándolos.

Esto prueba que filesystem source y vector store tienen lifecycles
independientes. La eliminación debe mapear el documento a IDs de embeddings y
ejecutar `ragDeleteEmbeddings()` o reconstruir el workspace. [W03]

Un deletion acceptance test busca una frase única del documento antes y
después del borrado para demostrar que el conocimiento realmente dejó de ser
recuperable.

## Caso J — RAG es local pero los logs no

Modelos, vector store y documentos viven en la laptop. Sin embargo, el logger
de la app envía prompts y chunks a un SaaS de observabilidad.

La ruta de inferencia es local, pero la ruta de datos sensibles no lo es. La
afirmación “todo queda en tu dispositivo” sería falsa.

La corrección puede usar redaction, logging local, desactivar payloads o
cambiar el collector. El test de privacidad debe observar tráfico de red, no
confiar en la ubicación del modelo.

# Parte XI — Proyecto final del módulo, explicado como arquitectura

El Private Knowledge Assistant debe ser demostrable por capas. La implementación
concreta puede variar, pero las responsabilidades siguientes no deben
desaparecer detrás de un framework.

## 77. Ingestion service

Recibe documentos, conserva una identidad estable y ejecuta preprocessing.
Produce una representación inspeccionable antes de chunking. Si la entrada es
un PDF, guarda tanto el archivo original como el texto derivado o una referencia
que permita reconstruir provenance.

El servicio registra pipeline version, chunk config y embedding model. Si
`ragIngest()` se usa como managed flow, registra `processed` y
`droppedIndices`. Si se usa el segregated flow, valida correspondencia uno a uno
entre chunks y embeddings.

La aceptación no es “terminó sin throw”. Es poder responder cuántos documentos
entraron, cuántos chunks se produjeron, qué modelo los representó y dónde se
persistieron.

## 78. Retrieval service

Recibe query y devuelve una estructura de debugging, no solo texto:

```ts
{
  query,
  workspace,
  topK,
  hits: [
    { id, score, content, metadata }
  ],
  timings
}
```

Esta estructura permite tests sin LLM. Debe distinguir errores operativos de
lista vacía válida y conservar source IDs.

## 79. Generation service

Recibe una pregunta y evidence ya seleccionada. Construye un prompt donde
instrucciones, pregunta y sources están delimitados. No busca documentos por su
cuenta, de modo que retrieval puede testearse independientemente.

La respuesta final incluye `stopReason` y el conjunto de sources recuperados.
Si el producto ofrece citas, mantiene el mapping necesario para que el usuario
pueda inspeccionarlas.

## 80. Unknown-knowledge policy

Antes de confiar en wording del LLM, la aplicación determina si hay evidence
suficiente según una política calibrada. Esa política puede combinar número de
hits, scores, tipos de documento y una instrucción de abstención.

No se usa un threshold universal. Se selecciona con el test set y se documentan
falsos positivos/falsos negativos.

## 81. Update service

Cuando un documento cambia, la aplicación identifica todos sus chunks previos,
los elimina o crea una nueva versión explícita, genera nuevos embeddings y
actualiza metadata.

El test de actualización pregunta por una condición que cambió entre versiones.
El sistema debe recuperar la vigente y, si no ofrece búsqueda histórica, dejar
de recuperar la antigua.

## 82. Offline acceptance test

Provisiona ambos modelos y el corpus. Cierra la app. Desactiva conectividad.
Reinicia. Ejecuta semantic search y una pregunta RAG nueva.

La prueba debe observar que no hay dependencia remota en el critical path. Si
el producto usa una base vectorial externa en otra máquina, no puede llamar a
esa ruta “offline local” sin explicar la topología.

## 83. Informe final

El informe del módulo contiene resultados reales, no líneas para rellenar:

1. Arquitectura y data path.
2. Corpus y snapshot.
3. Embedding model y razón de selección.
4. Chunking baseline y alternativa evaluada.
5. Retrieval metrics.
6. Unknown-knowledge metrics.
7. Answer correctness/faithfulness.
8. Latency breakdown.
9. Failure cases encontrados.
10. Limitaciones conocidas.
11. Privacy/data-boundary analysis.
12. Decisiones que cambiarían con otro corpus.

# Parte XII — Checklist de afirmaciones que el alumno debe poder defender

Esta lista no es un worksheet. Cada punto es una afirmación que debe poder
explicarse con evidencia del sistema construido.

1. Puedo identificar exactamente qué embedding model produjo cada vector.
2. Puedo demostrar qué corpus snapshot fue indexado.
3. Puedo calcular cosine correctamente y explicar cuándo dot product es equivalente.
4. Puedo mostrar queries donde semantic similarity falla por negación, fecha o entidad.
5. Puedo medir Recall@K sobre evidence etiquetada.
6. Puedo explicar por qué Top-K alto no es siempre mejor.
7. Puedo mostrar los chunks antes de embedding.
8. Puedo justificar el chunking elegido contra un baseline.
9. Puedo demostrar que el workspace persiste después de `ragCloseWorkspace()`.
10. Puedo provocar y explicar `RAG_WORKSPACE_MODEL_MISMATCH`.
11. Puedo explicar qué hace y qué no hace `ragReindex()`.
12. Puedo actualizar un documento sin reentrenar el LLM.
13. Puedo borrar knowledge y verificar que dejó de recuperarse.
14. Puedo distinguir retrieved source de supporting citation.
15. Puedo mostrar un retrieval failure real.
16. Puedo mostrar un generation failure real.
17. Puedo hacer que el sistema se abstenga cuando el corpus no soporta la respuesta.
18. Puedo distinguir faithfulness de factual correctness.
19. Puedo descomponer end-to-end latency por stage.
20. Puedo trazar documentos, embeddings, logs y prompts respecto a la frontera de privacidad.
21. Puedo demostrar el core RAG en modo offline después del provisioning.
22. Puedo explicar qué partes son primitivas QVAC y qué partes son arquitectura de mi aplicación.

# Fuentes verificadas para esta revisión

## QVAC / Tether — fuentes primarias

- **[W01] Text embeddings**
  https://docs.qvac.tether.io/ai-capabilities/text-embeddings/

- **[W02] RAG**
  https://docs.qvac.tether.io/ai-capabilities/rag/

- **[W03] API Summary — v0.18.x**
  https://docs.qvac.tether.io/reference/api/

- **[W04] SDK Release Notes — v0.18.x**
  https://docs.qvac.tether.io/reference/release-notes/

- **[W05] Plugin system**
  https://docs.qvac.tether.io/configuration/plugins/

- **[W06] OpenAI-compatible HTTP server**
  https://docs.qvac.tether.io/cli/http-server/

## Fundamentos y research

- **[W09] Lewis et al. — Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks**
  https://arxiv.org/abs/2005.11401

- **[W10] Steck, Ekanadham, Kallus — Is Cosine-Similarity of Embeddings Really About Similarity?**
  https://arxiv.org/abs/2403.05440

- **[W11] Similarity Queries over Neural Embeddings**
  https://arxiv.org/abs/2204.07922

- **[W14] ICLERB**
  https://arxiv.org/abs/2411.18947

- **[W15] ChunkRAG**
  https://arxiv.org/abs/2410.19572

- **[W16] Chunking Methods on RAG — 2026**
  https://arxiv.org/abs/2606.00881

- **[W17] Policy QA RAG evaluation**
  https://arxiv.org/abs/2601.15457

- **[W18] Chunking in academic texts — 2026**
  https://arxiv.org/abs/2607.01852

- **[W19] HiChunk / HiCBench**
  https://arxiv.org/abs/2509.11552

## Fuentes adicionales verificadas en esta revisión

- **[academia26] Query-Adaptive Semantic Chunking**
  https://arxiv.org/abs/2605.22834

- **[academia29] Adaptive Chunking: Optimizing Chunking-Method Selection for RAG**
  https://arxiv.org/abs/2603.25333
