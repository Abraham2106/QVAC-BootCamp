# Instructor Solution — Semantic Search v1

## Reference architecture

```text
corpus
  ↓ batch embed
vectors in memory

query
  ↓ embed
query vector
  ↓
cosine similarity
  ↓
sort descending
  ↓
Top-K
```

QVAC owns model loading and `embed()`. The cosine function, ranking and CLI behavior are application logic in this exercise.

## Expected reasoning

A strong submission explains that a high similarity score means “near according to this embedding model and metric,” not “factually true.” It also separates model-load cost, query embedding latency and application ranking latency.

## Common incorrect solutions

- comparing vectors produced by different embedding models;
- using dot product without knowing/handling vector normalization and calling it universally cosine;
- sorting scores ascending accidentally;
- treating Top-1 as ground truth;
- hiding scores so the learner cannot inspect retrieval behavior;
- measuring model load + query + ranking as one number and calling it “retrieval latency”.

## Valid alternatives

For a tiny corpus, vectors can live in memory. An external vector DB is unnecessary for the learning objective. Class 06 introduces persistence/workspaces and the RAG pipeline.

## Oral defense

1. What would make you change the embedding model?
2. Which operation grows with corpus size in your implementation?
3. Why is an ambiguous query not necessarily a model bug?
4. What would you need before calling this RAG?