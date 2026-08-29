# Bibliografía ampliada — Clase 06

## Local RAG and Private Knowledge

Esta bibliografía combina la formulación fundacional de Retrieval-Augmented Generation con trabajos recientes sobre chunking, filtering, reranking y evaluación, además de la superficie real de RAG en QVAC. La clase debe mantener una separación estricta entre una arquitectura propuesta en un paper y una capability built-in del SDK.

### QVAC — RAG actual

1. **QVAC — RAG.** Pipeline documentado, built-in vector store, workspaces y ejemplos con stores externos.  
   https://docs.qvac.tether.io/ai-capabilities/rag/

2. **QVAC — Text embeddings.** Base de representación usada por retrieval.  
   https://docs.qvac.tether.io/ai-capabilities/text-embeddings/

3. **QVAC — Text generation.** Etapa de generation que consume la evidencia recuperada.  
   https://docs.qvac.tether.io/ai-capabilities/text-generation/

4. **QVAC — API Summary.** `ragChunk()`, `ragIngest()`, `ragSaveEmbeddings()`, `ragSearch()`, `ragReindex()`, lifecycle de workspaces y errores.  
   https://docs.qvac.tether.io/reference/api/

### RAG — formulación y revisiones

5. **Lewis et al. — _Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks_.** Paper fundacional de RAG con memoria paramétrica y no paramétrica.  
   https://arxiv.org/pdf/2005.11401

6. **Semantic Scholar entry del paper de Lewis et al.** Útil para navegación de citas, no sustituye el paper original.  
   https://www.semanticscholar.org/paper/Retrieval-Augmented-Generation-for-NLP-Tasks-Lewis-Perez/659bf9ce7175e1ec266ff54359e2bd76e0b7ff31

7. **ResearchGate copy / discussion del paper original.** Fuente secundaria de acceso y conversación.  
   https://www.researchgate.net/publication/341639856_Retrieval-Augmented_Generation_for_Knowledge-Intensive_NLP_Tasks

8. **Klesel & Wittmann — RAG, Business & Information Systems Engineering.** Review conceptual moderno de RAG, aplicaciones y limitaciones.  
   https://link.springer.com/article/10.1007/s12599-025-00945-3

9. **Decoding the RAG paper / hybrid memory.** Lectura secundaria para intuition; usar Lewis et al. como autoridad primaria.  
   https://medium.com/@mudassar.hakim/decoding-the-rag-paper-why-hybrid-memory-matters-for-modern-nlp-systems-e013aba94e49

### Chunking, filtering y reranking

10. **ChunkRAG — LLM-Chunk Filtering for RAG Systems.** Combina semantic chunking con filtering y reporta resultados dentro de su framework.  
    https://arxiv.org/pdf/2410.19572

11. **_Chunking Methods on Retrieval-Augmented Generation: Effectiveness Evaluation Against Computational Cost and Limitations_.** Comparación amplia de estrategias y sus costes/limitaciones.  
    https://arxiv.org/html/2606.00881v1

12. **_Chunking, Retrieval, and Re-ranking: An Empirical Evaluation of RAG Architectures for Policy Document QA_.** Evidencia específica de dominio sobre chunking y cross-encoder reranking.  
    https://arxiv.org/pdf/2601.15457

13. **_Evaluating Chunking Strategies for Retrieval-Augmented Generation on Academic Texts_.** Resultado importante para discutir por qué estrategias semánticas sofisticadas no dominan universalmente.  
    https://arxiv.org/html/2607.01852v1

14. **HiChunk — Hierarchical Chunking for RAG.** Framework y benchmark para chunking jerárquico.  
    https://arxiv.org/pdf/2509.11552v3

15. **Enterprise chunking evaluation — oil and gas documents.** Evidencia aplicada de dominio; no debe generalizarse fuera de su corpus.  
    https://www.researchgate.net/publication/403154369_Evaluating_Chunking_Strategies_For_Retrieval-Augmented_Generation_in_Oil_and_Gas_Enterprise_Documents

16. **MAFA — multi-agent FAQ annotation/reranking.** Lectura periférica sobre ranking/annotation; no es una fuente fundacional de RAG.  
    https://arxiv.org/pdf/2505.13668

## Orden de lectura recomendado

La clase debería comenzar con Lewis et al. para entender por qué existe memoria externa recuperable. Después se estudia la primitive real de QVAC. Solo entonces tiene sentido abrir la discusión de chunking y reranking. Los papers recientes deben compararse entre sí, no leerse como una tabla de “mejores prácticas”: sus resultados cambian con corpus, preprocessing, embedding model, retriever, reranker y evaluación.