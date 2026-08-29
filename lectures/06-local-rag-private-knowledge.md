# Technical Summary — Class Local RAG and Private Knowledge

## 1. Technical Sheet

- **Session topic:** External knowledge, chunking, retrieval, grounding and index lifecycle.
- **Key concepts:** parametric memory; external knowledge; chunks; ingestion; workspace; provenance; grounding; abstention; stale evidence.
- **Tools / Frameworks:** QVAC chunking, ingestion, search and workspace lifecycle APIs.
- **Position in the bootcamp:** Turns Class 05 retrieval into an evidence-oriented assistant.

## 2. Synopsis

RAG preserves knowledge outside weights by indexing documents into recoverable units. Retrieval and generation must remain separately observable: absent evidence is a search problem, while contradiction of present evidence is a generation or grounding problem.

## 3. Subtopic Breakdown

### 1. Evidence contract

hits retain IDs, source version, snapshot, score and metadata.

### 2. Chunking

small units lose context, large units add noise, and overlap adds redundancy.

### 3. Lifecycle

update and deletion are verified with queries, not just successful API calls.


### Extended Technical Discussion

#### Ficha técnica de la sesión

**Objeto de estudio:** RAG no es “un prompt largo”. Es un sistema con estado externo que recibe
documentos, crea unidades recuperables, las representa, las persiste y selecciona evidencia en
tiempo de consulta. La generación es una etapa posterior que puede usar esa evidencia, ignorarla
o interpretarla mal; por eso se mide y depura por separado.

**Identidad mínima de un índice:**

```text
corpus snapshot + texto/preprocessing + chunk policy
+ embedding model + dimensión + métrica/store + metadata de versión
```

Cambiar cualquiera de esos componentes altera el significado operativo de “buscar en mi
conocimiento”. Un workspace con el mismo nombre no garantiza que conserve el mismo corpus ni que
sus vectores sean compatibles con un modelo nuevo.

#### La anatomía del pipeline, sin cajas negras

El flujo gestionado puede resumirse como `document → chunk → embed → save`; al consultar, la
aplicación crea la representación de la query, pide vecinos similares y recibe un Top-K. QVAC
documenta primitivas para chunking, ingestión, almacenamiento de embeddings precomputados,
búsqueda, mantenimiento y lifecycle del workspace. La aplicación todavía decide qué documentos
acepta, qué metadata conserva, qué resultados están autorizados y cómo convierte evidencia en una
respuesta.

Un contrato útil para un hit no es solo `{ content, score }`. Incluye, como mínimo:

```ts
{
  documentId, chunkId, content, score,
  sourceVersion, corpusSnapshot, accessClass,
  embeddingModel, chunkPolicy
}
```

Estos campos permiten contestar preguntas que un score no responde: ¿de qué documento salió este
texto?, ¿cuándo era vigente?, ¿qué configuración produjo el vector?, ¿el usuario puede verlo?,
¿la cita mostrada por la interfaz corresponde a este pasaje exacto?

#### Chunking es una decisión de representación, no un corte estético

Un chunk muy pequeño puede recuperar una frase con alta especificidad, pero separar su condición,
definición o excepción. Uno muy grande puede conservar contexto, pero competir con más ruido y
consumir el presupuesto de la generación. El overlap reduce algunos cortes bruscos a cambio de
duplicar evidencia y hacer que Top-K contenga variaciones del mismo pasaje.

Por eso la pregunta no es “¿cuál chunk size es correcto?”, sino “¿qué unidad recuperable permite
resolver las queries etiquetadas de este corpus con el costo y la latencia aceptables?”. Compara
un baseline simple contra una alternativa sobre el mismo set. Si la alternativa no mejora una
métrica o un fallo concreto, el resultado honesto es conservar el baseline.

#### Tres fallos que suenan iguales desde la interfaz

**Fallo de ingestión:** el documento no entró, fue extraído mal, recibió un ID incorrecto o se
guardó en otro workspace. Antes de ajustar prompts, inspecciona corpus, chunks y metadata.

**Fallo de retrieval:** el documento existe, pero no aparece dentro del Top-K de la query. Cambia
la query, la representación, el chunking, los filtros o K de forma controlada y observa cuál
hipótesis explica el resultado.

**Fallo de generación:** el chunk correcto está presente, pero la respuesta lo contradice, omite
una condición o inventa una fuente. El arreglo pertenece a la política de evidencia, el prompt,
el modelo generador o la interfaz de citas; aumentar K a ciegas puede empeorar el contexto.

#### Lifecycle, versiones y revocación

Cerrar un workspace no es necesariamente borrar los datos: distingue recursos abiertos en memoria
de persistencia en disco. Del mismo modo, borrar una fuente requiere identificar los chunks que
derivaron de ella y verificar mediante una consulta que ya no se recuperan. Un sistema defendible
mantiene un manifiesto con hashes, IDs, versión de fuente, modelo y política de chunks; sin él,
no puede explicar si una respuesta vieja provino de un índice anterior o de memoria paramétrica.

El test mínimo de actualización contiene dos versiones de un hecho que cambia. Se indexa la nueva
versión, se retira o marca la anterior según la política de producto y se repite exactamente la
misma query. El resultado no se acepta solo porque no lanzó un error: debe demostrar que la
evidencia vigente es la que entra al Top-K.

#### Para estudiar y defender

1. Explica por qué un `score` alto no prueba que un pasaje soporte toda una respuesta con dos
   afirmaciones independientes.
2. Diseña un manifiesto mínimo para reproducir una respuesta RAG emitida hace una semana.
3. El documento correcto aparece en Top-7 pero la aplicación usa Top-5. Compara dos soluciones y
   qué métrica o costo podría empeorar cada una.
4. Construye un Unknown Knowledge Test que detecte tanto una respuesta inventada como provenance
   inventada.
5. Explica qué inspeccionarías, en orden, si un documento eliminado sigue apareciendo después de
   una actualización.

---

## 4. Points of Confusion and Corner Cases

- A retrieved source is not automatically a sufficient citation.
- Closing a workspace is not automatically deleting persisted data.
- More Top-K can add noise and duplicate evidence.

## 5. Study Questions

1. What makes an old RAG answer reproducible?
2. Design a stale-policy test.
3. How do retrieval and generation failures differ?

## Source Material

- [Canonical lesson](../class-06-local-rag-private-knowledge/lesson.md)
- **Module:** Módulo 2
