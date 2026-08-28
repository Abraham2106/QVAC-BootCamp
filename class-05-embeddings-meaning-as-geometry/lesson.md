# Clase 5 — Embeddings: Meaning as Geometry

> **The Local-First AI Systems Masterclass** · Módulo 2 — Private Knowledge
> **Baseline técnico:** QVAC SDK v0.18.x / v0.18.1, verificado contra la documentación oficial el 2026-08-27.

---

## Introducción

La búsqueda por palabras exactas falla cuando la intención y el vocabulario no coinciden. "Vehículo eléctrico" y "auto a batería" pueden referirse al mismo concepto sin compartir casi las mismas palabras.

Un **embedding** transforma texto en un vector numérico. La posición relativa de ese vector frente a otros — generados con el mismo modelo — permite comparar significado antes de construir RAG.

---

## Qué aprenderás

Al terminar esta lección podrás:

1. **Explicar** qué representa un embedding y por qué no es una respuesta generativa.
2. **Generar** vectores con `loadModel({ modelType: "embeddings" })` y `embed()`.
3. **Calcular** similitud coseno como lógica de aplicación.
4. **Construir** un ranking semántico mínimo con Top-K.
5. **Medir** latencia de carga, corpus, query y ranking por separado.
6. **Diagnosticar** cuándo un ranking sorprendente se debe a query, corpus o modelo — no al embedding "roto".

---

## Definición y contexto

Un embedding model mapea una entrada de texto a un vector de dimensión fija:

```text
texto
  ↓
embedding model
  ↓
[x1, x2, x3, ... xn]
```

Las dimensiones individuales no deben interpretarse como etiquetas humanas independientes. Lo útil es la **posición relativa** del vector frente a otros vectores producidos por el mismo modelo y la misma configuración.

Dos capacidades distintas en QVAC:

```text
embedding: texto → vector
LLM:       history → texto generado
```

Un embedding **representa** una entrada. No genera una respuesta grounded por sí solo.

**Conexión arquitectónica:**

```text
Clase 04: historial conversacional
Clase 05: significado externo como vector
Clase 06: vectores + persistencia + retrieval + generación grounded
```

Esta clase termina en ranking semántico en memoria. Todavía **no** hay workspace persistente, chunking gestionado ni generación grounded.

---

## Términos

### Índice rápido

| Término | Definición breve | ¿Lo provee QVAC? |
|---|---|---|
| **Embedding** | Representación numérica de un texto | Sí (`embed()`) |
| **Vector** | Arreglo `number[]` de dimensión fija | Sí (salida de `embed()`) |
| **Cosine similarity** | Métrica de cercanía entre dos vectores | No (aplicación) |
| **Semantic search** | Búsqueda por significado, no por palabras exactas | Parcial (vectores sí; ranking no) |
| **Top-K** | Los K documentos con mayor score | No (aplicación) |
| **Batch embed** | Embeber varios textos en una sola llamada | Sí (`embed()` con array) |
| **loadModel(embeddings)** | Cargar un modelo de tipo embeddings | Sí |
| **embed()** | Convertir texto en vector(es) | Sí |

### Embedding

**Definición:** Representación numérica de un texto producida por un modelo de embeddings.

**Uso:** Comparar significado entre textos sin depender de coincidencia léxica. Prerrequisito para búsqueda semántica y RAG.

**Sintaxis / API:** Ver sección [Referencia QVAC](#referencia-qvac).

**Ejemplo:**

```ts
const { embedding } = await embed({
  modelId,
  text: 'Local AI keeps inference on the device.',
})
console.log('dimensions:', embedding.length)
```

**Resultado:** Un arreglo `number[]`. La longitud depende del modelo; obsérvala en ejecución.

**Nota:** Un embedding no "contesta" una pregunta. Produce una representación.

### Vector

**Definición:** Arreglo `number[]` de dimensión fija que almacena la salida de `embed()`.

**Uso:** Unidad de comparación en similitud coseno y ranking semántico.

**Ejemplo:**

```ts
// Un string → number[]
const { embedding: one } = await embed({ modelId, text: 'hello' })

// Un array → number[][]
const { embedding: many } = await embed({ modelId, text: ['a', 'b', 'c'] })
```

**Resultado:** `one.length` es la dimensión del modelo. `many.length` es el número de textos embebidos.

**Nota:** No compares vectores de modelos distintos. No asumas espacios compatibles entre modelos diferentes.

### Cosine similarity

**Definición:** Métrica que mide el ángulo entre dos vectores del mismo espacio.

**Uso:** Ranking semántico. Un score alto describe cercanía según el modelo y la métrica; **no prueba verdad**.

**Sintaxis / API:** Lógica de aplicación (no es API de QVAC):

```text
cosine(a,b) = dot(a,b) / (||a|| · ||b||)
```

**Ejemplo:**

```ts
function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length) throw new Error('Dimension mismatch')
  let dot = 0, aa = 0, bb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    aa += a[i] * a[i]
    bb += b[i] * b[i]
  }
  return dot / (Math.sqrt(aa) * Math.sqrt(bb))
}
```

**Resultado:** Valor típicamente entre -1 y 1. Scores más altos indican vectores más alineados.

**Nota:** Implementarla en aplicación es una decisión pedagógica de esta clase.

### Semantic search

**Definición:** Búsqueda que ordena documentos por significado, no por coincidencia de palabras.

**Uso:** Encontrar contenido relevante cuando la query y el documento usan vocabulario distinto.

**Flujo mínimo:**

```text
documentos ──embed──→ vectores guardados en memoria
query       ──embed──→ vector de consulta
                           ↓
                    similarity(query, doc)
                           ↓
                        ordenar
                           ↓
                         Top-K
```

**Resultado:** Lista ordenada de textos con score de similitud.

**Nota:** QVAC genera los vectores. El ranking lo implementa la aplicación.

### Top-K

**Definición:** Los K documentos con mayor score de similitud tras ordenar.

**Uso:** Limitar resultados a los más relevantes. Una query puede tener varios textos relevantes o ser ambigua; Top-1 no siempre basta.

**Ejemplo:**

```ts
const topK = ranked.slice(0, 3)
topK.forEach(({ text, score }, i) => {
  console.log(`#${i + 1} score=${score.toFixed(4)} ${text}`)
})
```

**Resultado:** Los K mejores candidatos con score y texto.

**Nota:** Si Top-K oculta un resultado útil, prueba aumentar K o revisar el corpus.

### Batch embed

**Definición:** Embeber varios textos en una sola llamada a `embed()`.

**Uso:** Reducir overhead al procesar un corpus. Más eficiente que llamar `embed()` por cada frase.

**Sintaxis / API:**

| Entrada | Salida |
|---|---|
| `string` | `number[]` |
| `string[]` | `number[][]` |

**Ejemplo:**

```ts
const { embedding } = await embed({
  modelId,
  text: [
    'Electric cars store energy in batteries.',
    'Gasoline engines burn fuel inside cylinders.',
    'Bread recipes usually contain flour and yeast.',
  ],
})
console.log('vectors:', embedding.length)
console.log('dimensions:', embedding[0]?.length)
```

**Resultado:** Un vector por cada string del array. La respuesta puede incluir `stats` de la operación.

**Nota:** El tiempo depende del tamaño del batch, del backend y del hardware.

### loadModel(embeddings)

**Definición:** Carga un modelo de embeddings en memoria antes de llamar `embed()`.

**Uso:** Prerrequisito para generar vectores. Usa el mismo `modelId` para documentos y query.

**Sintaxis / API:**

```ts
modelId = await loadModel({
  modelSrc: GTE_LARGE_FP16,
  modelType: 'embeddings',
})
```

**Resultado:** Un `modelId` string reutilizable en llamadas `embed()`.

**Nota:** Descarga con `unloadModel({ modelId })` cuando termines.

### embed()

**Definición:** Función de QVAC que convierte texto en vector o vectores.

**Uso:** Núcleo del pipeline de embeddings. Acepta un string o un array de strings.

**Sintaxis / API:** Ver [Referencia QVAC](#referencia-qvac).

**Resultado:** `{ embedding: number[] | number[][], stats?: ... }`.

**Nota:** El tamaño del vector debe observarse en ejecución; no lo adivines para un modelo distinto.

---

## Referencia QVAC

Flujo documentado:

```text
loadModel()
   ↓
embed()
   ↓
vector / vectores
   ↓
unloadModel()
```

### loadModel() — embeddings

**Definición:** Carga un modelo de tipo embeddings desde caché o fuente remota.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `modelSrc` | `CatalogConstant \| string` | Origen del modelo (p. ej. `GTE_LARGE_FP16`) |
| `modelType` | `"embeddings"` | Tipo de modelo requerido para `embed()` |

```ts
import { GTE_LARGE_FP16, loadModel } from '@qvac/sdk'

const modelId = await loadModel({
  modelSrc: GTE_LARGE_FP16,
  modelType: 'embeddings',
})
```

### embed()

**Definición:** Genera embedding(s) para el texto dado.

| Parámetro | Tipo | Descripción |
|---|---|---|
| `modelId` | `string` | ID del modelo de embeddings cargado |
| `text` | `string \| string[]` | Texto o batch de textos |

```ts
import { embed } from '@qvac/sdk'

// Single
const { embedding } = await embed({ modelId, text: 'hello' })

// Batch
const { embedding: vectors } = await embed({ modelId, text: ['a', 'b'] })
```

**Resultado:** `embedding` es `number[]` para un string o `number[][]` para un array. Puede incluir `stats`.

### unloadModel()

**Definición:** Descarga el modelo de embeddings de memoria.

```ts
await unloadModel({ modelId })
```

---

## Ejemplo completo

Ejemplo mínimo — un solo texto:

```ts
import { close, embed, GTE_LARGE_FP16, loadModel, unloadModel } from '@qvac/sdk'

let modelId: string | undefined
try {
  modelId = await loadModel({
    modelSrc: GTE_LARGE_FP16,
    modelType: 'embeddings',
  })

  const { embedding } = await embed({
    modelId,
    text: 'Local AI keeps inference on the device.',
  })

  console.log('dimensions:', embedding.length)
} finally {
  if (modelId) await unloadModel({ modelId })
  await close()
}
```

Ejemplo de búsqueda semántica — corpus + query + Top-K:

```ts
import { close, embed, GTE_LARGE_FP16, loadModel, unloadModel } from '@qvac/sdk'

const corpus = [
  'Los vehículos eléctricos almacenan energía en baterías.',
  'Los motores de combustión queman gasolina.',
  'Una receta de pan necesita harina y levadura.',
  'Un automóvil a batería se recarga conectándolo a la red.',
]

function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length) throw new Error('Dimension mismatch')
  let dot = 0, aa = 0, bb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    aa += a[i] * a[i]
    bb += b[i] * b[i]
  }
  return dot / (Math.sqrt(aa) * Math.sqrt(bb))
}

const query = 'un coche que funciona con electricidad'
let modelId: string | undefined

try {
  modelId = await loadModel({ modelSrc: GTE_LARGE_FP16, modelType: 'embeddings' })

  const { embedding: documentVectors } = await embed({ modelId, text: corpus })
  const { embedding: queryVector } = await embed({ modelId, text: query })

  const ranked = corpus
    .map((text, i) => ({ text, score: cosineSimilarity(queryVector, documentVectors[i]) }))
    .sort((a, b) => b.score - a.score)

  ranked.slice(0, 3).forEach(({ text, score }, i) => {
    console.log(`#${i + 1} score=${score.toFixed(4)} ${text}`)
  })
} finally {
  if (modelId) await unloadModel({ modelId })
  await close()
}
```

Ejemplos ejecutables en `examples/`.

---

## Antes de ejecutar

Antes del lab, ordena mentalmente estos textos para la query **"un coche que funciona con electricidad"**:

1. "Los vehículos eléctricos almacenan energía en baterías."
2. "Los motores de combustión queman gasolina."
3. "Una receta de pan necesita harina y levadura."
4. "Un automóvil a batería se recarga conectándolo a la red."

Escribe tu ranking esperado antes de medir.

**Checkpoint:**

1. ¿Por qué un embedding no es una respuesta generativa?
2. ¿Qué parte del semantic search implementa QVAC y qué parte implementamos nosotros?
3. ¿Por qué debes usar el mismo modelo para documentos y query?
4. Una query devuelve un Top-1 sorprendente. Enumera tres hipótesis antes de culpar al modelo.
5. ¿Qué métrica separarías si el usuario dice "la búsqueda semántica está lenta"?
6. Diseña un experimento para comparar dos formas de redactar la misma query.

---

## Práctica guiada

### Build — Semantic Search

1. Define 15–30 frases pequeñas.
2. Genera embeddings en batch.
3. Embebe una query.
4. Calcula similitud coseno.
5. Ordena de mayor a menor.
6. Imprime Top-K con score y texto.
7. Registra latencia de embedding/query + ranking.

Guía en `lab/README.md`.

### Break It — Ambigüedad

Prueba una query como **"apple performance"** en un corpus que contenga textos sobre fruta y sobre computadores. Antes de ejecutar, predice si el modelo entenderá la intención. Después inspecciona el ranking.

La pregunta correcta no es "¿el embedding está mal?", sino:

- ¿la query es ambigua?
- ¿el corpus ofrece suficiente contexto?
- ¿el modelo de embeddings representa bien este dominio/idioma?
- ¿Top-K está ocultando un resultado útil?

### Práctica integrada — buscador semántico evaluable

Construye un corpus pequeño pero intencional: diez textos relevantes, cinco distractores y dos casos ambiguos. Define antes de ejecutar qué documentos deberían aparecer en `Top-K=3` para cinco queries. Después registra:

- `recall@3`: cuántas respuestas esperadas aparecen;
- latencia de carga, corpus, query y ranking;
- dimensión y modelo usados;
- un resultado sorprendente y tres hipótesis verificables.

Repite una query con redacción literal y otra conversacional. La conclusión debe separar calidad del corpus, calidad del modelo y costo de la consulta. Cambia una sola variable por experimento.

---

## Errores comunes

| Síntoma | Causa probable | Corrección |
|---|---|---|
| Top-1 irrelevante | Query ambigua, idioma o corpus inadecuado | Revisar query, idioma y contenido del corpus |
| Dimensiones incompatibles | Model ID distinto o longitud de vector | Usar el mismo modelo para documentos y query |
| Consulta lenta | Embedding de query vs ranking | Medir por separado; no culpar al modelo completo |
| Score bajo en todo | Normalización, dominio o corpus vacío | Verificar que exista contenido relevante |

### Notas adicionales

1. **"Cada dimensión significa una cosa concreta."** No hay lectura humana simple de cada componente. El poder está en las relaciones geométricas.
2. **"Un score alto significa verdad."** El score describe cercanía; no valida hechos.
3. **"Embeddings generan conocimiento."** Representan entradas; no generan respuesta grounded.
4. **"Top-1 siempre basta."** Una query puede tener varios textos relevantes o ser ambigua.
5. **"Puedo comparar vectores de modelos distintos."** No asumas espacios compatibles.

### Troubleshooting guiado

| Síntoma | Primera comprobación | No concluyas todavía |
|---|---|---|
| Top-1 irrelevante | query, idioma y corpus | que el embedding esté roto |
| dimensiones incompatibles | model ID y longitud | que cosine sea el problema |
| consulta lenta | embedding de query vs ranking | que el modelo completo sea lento |
| score bajo en todo | normalización y dominio | que no exista contenido relevante |

---

## Medición

Separa al menos:

| Métrica | Cómo obtenerla | Unidad | Interpretación |
|---|---|---|---|
| Tiempo de carga del modelo | `performance.now()` alrededor de `loadModel()` | ms | Costo de arranque |
| Tiempo de embedding del corpus | Antes/después de `embed()` con array | ms | Costo del corpus |
| Tiempo de embedding de la query | Antes/después de `embed()` con query | ms | Costo por consulta |
| Tiempo de ranking | Loop de cosine + sort | ms | Costo de aplicación |
| Top-K observado | Salida del ranking | texto + score | Calidad aparente |

No presentes estos tiempos como rendimiento universal de QVAC: dependen de modelo, backend, hardware, tamaño del batch y corpus.

Registro sugerido:

```text
model, dimensions, corpusSize, loadMs, corpusMs, queryMs, rankMs, topK
```

---

## Resumen

- Los embeddings convierten significado en una representación comparable (`number[]`).
- QVAC genera vectores con `loadModel({ modelType: "embeddings" })` + `embed()`. El ranking semántico es lógica de aplicación.
- Cosine similarity mide cercanía; un score alto no prueba verdad.
- Usa el mismo modelo para documentos y query. No compares vectores de modelos distintos.
- Mide carga, corpus, query y ranking por separado. Los tiempos dependen del hardware.

**Siguiente clase:** RAG local — persistencia, retrieval y generación grounded (Clase 6).

---

## Profundización V2 — de similitud a retrieval defendible

### La norma del vector no es un detalle invisible

Cosine similarity divide el producto punto entre las normas de ambos vectores. Por eso no es
correcto llamar “cosine” a un producto punto si no se ha establecido que los vectores tienen
norma uno. En este curso se calcula la métrica explícitamente y se registra qué normalización
usa el pipeline. Una dimensión mayor tampoco prueba que un modelo sea mejor: la calidad depende
de la tarea, el dominio, el idioma, el corpus y la evaluación.

### Similaridad no equivale a soporte

Un hit puede ser semánticamente cercano y aun así no responder la pregunta. Es especialmente
frecuente con negación, fechas, cantidades, excepciones y entidades parecidas. Antes de construir
RAG, etiqueta qué chunk respalda cada consulta y evalúa si aparece en Top-K. El ranking debe ser
visible; una respuesta generada no puede compensar evidencia ausente.

### Mini protocolo de evaluación

Construye un set con una paráfrasis, una consulta exacta y cinco hard negatives. Para cada query
guarda el documento relevante, la versión del corpus, la posición del primer hit relevante y el
Top-K completo. Reporta Precision@K, Recall@K y MRR como métricas distintas: una no sustituye a
las otras. Si aparece un fallo real, conviértelo en regresión antes de cambiar modelo, métrica o
chunking en la siguiente clase.

### Puente a la Clase 06

El resultado de esta clase no es una “base de conocimiento” todavía: es una función de ranking
en memoria. En Clase 06, el modelo de embeddings, el corpus, la política de chunks y el índice
deben formar una identidad verificable. Nunca se mezclan vectores de modelos distintos solo
porque tienen la misma dimensión.

## Estudio profundo — la mecánica de una representación semántica

### Ficha técnica de la sesión

**Objeto de estudio:** una función de embeddings no responde preguntas ni recupera documentos por
sí sola; transforma una entrada `x` en un vector `e = f_θ(x)` de dimensión fija. El buscador es
el sistema que decide qué textos comparar, con qué métrica, cuántos resultados mostrar y cómo
evaluar si un resultado sirve para la tarea.

**Invariantes que debe conservar un experimento:** mismo modelo para query y documentos, misma
preparación de texto, vectores de igual dimensión, métrica declarada, corpus identificado y
criterio de relevancia etiquetado. Si cambia cualquiera de esos elementos, el resultado ya no es
una comparación limpia con el experimento anterior.

**Pregunta de control:** si dos documentos tienen un score parecido, ¿qué información adicional
necesitas antes de afirmar que son igualmente útiles? La respuesta puede incluir versión,
autoridad, fecha, entidad, negación o la parte exacta de la pregunta que cada uno cubre. El score
por sí solo no contiene esas decisiones de producto.

### De texto a ranking: qué calcula realmente cada etapa

Supón un corpus `D = {d₁, d₂, …, dₙ}` y una consulta `q`. El proceso mínimo es:

```text
normalizar q y dᵢ
        ↓
e_q = f_θ(q),  e_i = f_θ(dᵢ)
        ↓
s_i = metric(e_q, e_i)
        ↓
ordenar por s_i y mostrar Top-K
```

La función `f_θ` fija el espacio vectorial; la métrica fija cómo se interpreta cercanía en ese
espacio; el ranking es lógica de aplicación. Ninguna de estas tres capas equivale a “verdad”. Un
modelo puede aproximar bien paráfrasis y fallar cuando una sola palabra cambia el sentido de una
política: *permitido* frente a *no permitido*, una fecha de vigencia o una excepción para un rol.

Para vectores no nulos, la similitud coseno se define como:

```text
cos(a, b) = (a · b) / (||a|| ||b||)
```

Si previamente normalizas `a` y `b` a norma uno, entonces `||a|| = ||b|| = 1` y el producto punto
coincide numéricamente con cosine. Sin esa condición, el producto punto mezcla orientación y
magnitud. Por ello se debe medir y declarar la normalización real, en vez de deducirla del nombre
de un índice o de un ejemplo externo.

### Conceptos que no deben colapsarse en una sola palabra

**Dimensión** es el número de componentes del vector. Afecta almacenamiento y cómputo, pero no es
una escala universal de inteligencia. Dos modelos de la misma dimensión pueden aprender espacios
muy diferentes; dos modelos de dimensión distinta no deben compararse componente a componente.

**Norma** es la magnitud del vector. Puede ser una señal presente en la salida del modelo, un efecto
de su entrenamiento o una magnitud eliminada por normalización. No debe interpretarse como
“confianza” sin evidencia de que, para ese modelo y tarea, correlaciona con el fenómeno deseado.

**Similitud** es una función numérica aplicada a dos representaciones. **Relevancia** es una
etiqueta de tarea: un documento es relevante si ayuda a cumplir el objetivo de la consulta.
**Soporte** es aún más estricto: un pasaje soporta una afirmación si contiene evidencia para ella.
Un resultado puede ser similar sin ser relevante; relevante sin cubrir todas las subpreguntas; o
relevante para explorar, pero insuficiente para justificar una respuesta factual.

### Casos de esquina que el ranking ingenuo oculta

**Colisión de entidad.** “Saldo de Ana” y “saldo de Andrea” comparten vocabulario y contexto. El
test no evalúa si el buscador encuentra documentos financieros, sino si conserva la identidad.

**Negación y excepción.** “No se permite reembolso salvo…” puede quedar cerca de “se permite
reembolso”. La cercanía temática no codifica necesariamente la polaridad que importa al usuario.

**Deriva temporal.** Dos documentos sobre la misma política pueden ser vecinos excelentes aunque
uno ya no esté vigente. La fecha y la versión deben entrar en metadata y en la política de
selección; cambiar Top-K no repara contenido obsoleto.

**Vector cero o dimensión inconsistente.** Cosine no está definido si una norma es cero, y ningún
ranking es válido si las dimensiones difieren. Son errores de contrato que se detectan antes de
interpretar scores.

### Para estudiar y defender

1. Deriva por qué producto punto y cosine son iguales solo después de normalizar ambos vectores.
2. Diseña un corpus de seis textos donde una query obtenga un Top-1 temáticamente cercano pero
   factualmente incorrecto. Explica qué etiqueta de relevancia usarías y por qué.
3. Propón un experimento que separe el efecto del modelo de embeddings del efecto de cambiar la
   métrica. ¿Qué variables mantienes fijas?
4. Tienes `Recall@5` alto y una respuesta final incorrecta. Da dos explicaciones que no culpen de
   inmediato al embedding model.
5. Explica por qué mezclar embeddings de dos modelos con la misma dimensión sigue siendo un error
   de diseño.

## Fuentes

- [QVAC — Text embeddings](https://docs.qvac.tether.io/ai-capabilities/text-embeddings/)
- [QVAC — API v0.18.x](https://docs.qvac.tether.io/reference/api/)
- [QVAC — Profiler](https://docs.qvac.tether.io/runtime/profiler/)
- [QVAC — How it works](https://docs.qvac.tether.io/about/how-it-works/)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
