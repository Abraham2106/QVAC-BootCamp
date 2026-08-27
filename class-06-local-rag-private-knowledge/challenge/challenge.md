# Challenge — Private Notebook Assistant v1

Construye un asistente local sobre un corpus privado.

## Requirements

- corpus local de al menos 10 documentos/notas;
- workspace RAG gestionado o lifecycle equivalente claramente documentado;
- ingest separado de query-time;
- Top-K visible antes de generation;
- score + contenido visible;
- provenance real mantenida por el pipeline/app;
- generación grounded;
- política explícita de evidencia insuficiente;
- retrieval latency separada de generation latency;
- cleanup correcto de modelos/workspace.

## Acceptance tests

### A — Answerable
Una pregunta cuya respuesta existe debe recuperar evidencia relevante y producir una respuesta compatible con ella.

### B — Unknown knowledge
Una pregunta no soportada por el corpus no debe inventar provenance.

### C — Retrieval debugger
El usuario/instructor puede ver Top-K antes de la respuesta.

### D — Controlled failure
Provoca un retrieval failure y clasifícalo correctamente.

### E — Timing
Reporta retrieval y generation como etapas separadas.

### F — Defense
Responde: **¿falló retrieval o generation y qué evidencia lo demuestra?**

## Stretch

Compara dos chunking configurations manteniendo corpus/query/model constantes. No declares ganador universal: reporta el caso medido.