# Clase 05 — Embeddings: Meaning as Geometry

> **Pregunta esencial:** ¿Cómo puede una máquina encontrar significado relacionado sin buscar las mismas palabras?

## Resultados de aprendizaje

Al terminar podrás explicar qué representa un embedding, generar vectores con QVAC, comparar similitud, construir un ranking semántico, medirlo y diagnosticar cuándo el ranking no coincide con tu expectativa.

## Por qué importa

La búsqueda por palabras falla cuando la intención y el vocabulario no coinciden. “Vehículo eléctrico” y “auto a batería” pueden referirse al mismo concepto sin compartir casi las mismas palabras. Un sistema de conocimiento privado necesita una representación que permita comparar significado antes de que exista RAG.

## Concepto: significado como geometría

Un embedding transforma una entrada en un vector numérico de dimensión fija para el modelo seleccionado:

```text
texto
  ↓
embedding model
  ↓
[x1, x2, x3, ... xn]
```

Las dimensiones individuales no deben interpretarse como etiquetas humanas independientes. Lo útil es la posición relativa del vector frente a otros vectores producidos por **el mismo modelo y la misma configuración**.

## Embeddings no son respuestas

Un embedding no “contesta” una pregunta. Produce una representación. La generación de texto y la representación semántica son capacidades distintas:

```text
embedding: texto → vector
LLM:       history → texto generado
```

En QVAC, la documentación actual expone embeddings mediante un modelo cargado como `modelType: "embeddings"` y la función `embed()`.

## Inside QVAC

El flujo documentado es:

```text
loadModel()
   ↓
embed()
   ↓
vector / vectores
   ↓
unloadModel()
```

QVAC v0.18.x documenta `embed()` con dos overloads: un `string` devuelve `number[]`; un arreglo de strings devuelve `number[][]`. La respuesta puede incluir `stats` de la operación.

## Ejemplo mínimo

```ts
import { embed, GTE_LARGE_FP16, loadModel, unloadModel } from '@qvac/sdk'

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
}
```

El tamaño del vector debe observarse en ejecución; no lo adivines para un modelo distinto.

## Similitud: lógica de aplicación

QVAC genera los vectores. Para esta clase, la similitud coseno se calcula explícitamente en la aplicación para que el estudiante vea la matemática de comparación:

```text
cosine(a,b) = dot(a,b) / (||a|| · ||b||)
```

Implementarla en aplicación es una decisión pedagógica; no se presenta como una API de QVAC.

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

## Query embeddings y document embeddings

El buscador semántico más pequeño posible es:

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

Todavía **no** hay RAG. No hay chunking gestionado, workspace persistente ni generación grounded. Eso pertenece a la Clase 06.

## Predict

Antes de ejecutar, ordena mentalmente estos textos para la query **“un coche que funciona con electricidad”**:

1. “Los vehículos eléctricos almacenan energía en baterías.”
2. “Los motores de combustión queman gasolina.”
3. “Una receta de pan necesita harina y levadura.”
4. “Un automóvil a batería se recarga conectándolo a la red.”

Escribe tu ranking esperado antes de medir.

## Build — Semantic Search

1. Define 15–30 frases pequeñas.
2. Genera embeddings en batch.
3. Embebe una query.
4. Calcula similitud coseno.
5. Ordena de mayor a menor.
6. Imprime Top-K con score y texto.
7. Registra latencia de embedding/query + ranking.

## Measure It

Separa al menos:

- tiempo de carga del modelo;
- tiempo de embedding del corpus;
- tiempo de embedding de la query;
- tiempo de ranking en aplicación;
- Top-K observado.

No presentes estos tiempos como rendimiento universal de QVAC: dependen de modelo, backend, hardware, tamaño del batch y corpus.

## Break It — Ambigüedad

Prueba una query como **“apple performance”** en un corpus que contenga textos sobre fruta y sobre computadores. Antes de ejecutar, predice si el modelo entenderá la intención. Después inspecciona el ranking.

La pregunta correcta no es “¿el embedding está mal?”, sino:

- ¿la query es ambigua?
- ¿el corpus ofrece suficiente contexto?
- ¿el modelo de embeddings representa bien este dominio/idioma?
- ¿Top-K está ocultando un resultado útil?

## Common misconceptions

### “Cada dimensión significa una cosa concreta”

No hay una lectura humana simple de cada componente. El poder aparece en las relaciones geométricas aprendidas.

### “Un score alto significa verdad”

El score describe cercanía según el modelo y la métrica; no valida hechos.

### “Embeddings generan conocimiento”

Representan entradas. No generan una respuesta grounded por sí solos.

### “Top-1 siempre basta”

Una consulta puede tener varios textos relevantes o ser ambigua.

### “Puedo comparar vectores de modelos distintos”

No asumas espacios compatibles entre modelos diferentes.

## Conexión arquitectónica

```text
Clase 04: historial conversacional
Clase 05: significado externo como vector
Clase 06: vectores + persistencia + retrieval + generación grounded
```

## Checkpoint

1. ¿Por qué un embedding no es una respuesta generativa?
2. ¿Qué parte del semantic search implementa QVAC y qué parte implementamos nosotros en este laboratorio?
3. ¿Por qué debes usar el mismo modelo para documentos y query?
4. Una query devuelve un Top-1 sorprendente. Enumera tres hipótesis antes de culpar al modelo.
5. ¿Qué métrica separarías si el usuario dice “la búsqueda semántica está lenta”?
6. Diseña un experimento para comparar dos formas de redactar la misma query.

## Takeaway

> **Los embeddings convierten significado en una representación comparable. El ranking semántico es una medición sobre esa representación, no una respuesta ni una garantía de verdad.**

## Fuentes usadas

- https://docs.qvac.tether.io/ai-capabilities/text-embeddings/
- https://docs.qvac.tether.io/reference/api/
- https://docs.qvac.tether.io/runtime/profiler/
- https://docs.qvac.tether.io/about/how-it-works/
- https://github.com/ggml-org/llama.cpp

**Baseline técnico:** QVAC SDK v0.18.x / v0.18.1. Revisa release notes antes de impartir la clase.