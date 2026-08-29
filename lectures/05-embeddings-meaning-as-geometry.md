# Technical Summary — Class Embeddings: Meaning as Geometry

## 1. Technical Sheet

- **Session topic:** Vector representation and semantic retrieval before RAG.
- **Key concepts:** embedding space; norm; dimension; cosine; dot product; Top-K; relevance; support; Precision at K; Recall at K; MRR.
- **Tools / Frameworks:** QVAC embedding model lifecycle and embed; application-side ranking.
- **Position in the bootcamp:** Opens private knowledge with inspectable retrieval.

## 2. Synopsis

An embedding maps text into a learned vector space. A search system still chooses preprocessing, metric and Top-K. The class makes a critical distinction: numerical similarity is not factual support, especially for dates, negation, entities and exceptions.

## 3. Subtopic Breakdown

### 1. Metric conditions

cosine requires nonzero vectors; dot product only matches it under unit normalization.

### 2. Ranking versus evidence

similarity, relevance and claim support are different judgments.

### 3. Evaluation

labeled queries and hard negatives expose retrieval behavior.


### Extended Technical Discussion

#### Ficha técnica de la sesión

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

#### De texto a ranking: qué calcula realmente cada etapa

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

#### Conceptos que no deben colapsarse en una sola palabra

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

#### Casos de esquina que el ranking ingenuo oculta

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

#### Para estudiar y defender

1. Deriva por qué producto punto y cosine son iguales solo después de normalizar ambos vectores.
2. Diseña un corpus de seis textos donde una query obtenga un Top-1 temáticamente cercano pero
   factualmente incorrecto. Explica qué etiqueta de relevancia usarías y por qué.
3. Propón un experimento que separe el efecto del modelo de embeddings del efecto de cambiar la
   métrica. ¿Qué variables mantienes fijas?
4. Tienes `Recall@5` alto y una respuesta final incorrecta. Da dos explicaciones que no culpen de
   inmediato al embedding model.
5. Explica por qué mezclar embeddings de dos modelos con la misma dimensión sigue siendo un error
   de diseño.

---

## 4. Points of Confusion and Corner Cases

- Higher dimension is not a universal quality score.
- High score does not prove entailment, freshness or authority.
- Vectors from different models are not comparable just because dimensions match.

## 5. Study Questions

1. When do cosine and dot product agree?
2. Create a hard negative involving negation.
3. Why can Recall at 5 be high while an answer is wrong?

## Source Material

- [Canonical lesson](../class-05-embeddings-meaning-as-geometry/lesson.md)
- **Module:** Módulo 2
