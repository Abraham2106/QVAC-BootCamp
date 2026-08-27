# Instructor Solution — Private Notebook Assistant v1

## Reference architecture

```text
local documents
   ↓
ragIngest / managed workspace
   ↓
query
   ↓
ragSearch Top-K
   ↓
visible evidence + provenance
   ↓
grounded prompt
   ↓
local completion
```

## Diagnostic rule

Always inspect retrieval first.

- Relevant evidence absent from Top-K → start with retrieval/corpus/chunking/query.
- Relevant evidence present but answer conflicts with it → start with grounding/generation.
- Evidence absent from corpus → unknown-knowledge case, not necessarily retrieval malfunction.

## Reference behavior

A strong solution:

1. separates ingest from query-time;
2. shows Top-K before generation;
3. maps provenance from real metadata/IDs rather than model-generated citations;
4. has an explicit insufficient-evidence policy;
5. measures retrieval separately from completion;
6. closes workspace and unloads models deliberately.

## Common incorrect solutions

- send every document directly to the LLM and call it RAG;
- hide retrieved chunks;
- invent source URLs in the prompt;
- assume `score > X` is universally correct without evaluation;
- increase Top-K whenever an answer is bad;
- blame generation when the relevant document never entered context.

## Alternative valid architectures

QVAC also documents external vector DB flows using `embed()` with MongoDB/SQLite. They are valid but add infrastructure that is unnecessary for the core managed-workspace learning objective.

## Oral defense

1. Where is private knowledge stored?
2. Which model embeds the query?
3. What evidence proves retrieval worked?
4. What makes your answer grounded?
5. What happens when the corpus cannot answer?
6. What would change if Top-K doubled?