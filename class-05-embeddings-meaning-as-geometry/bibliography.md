# Bibliografía ampliada — Clase 05

## Embeddings: Meaning as Geometry

Esta bibliografía separa fundamentos matemáticos y de retrieval de las primitives concretas de QVAC. Las fuentes académicas ayudan a entender qué significa comparar representaciones y por qué cosine similarity no debe interpretarse como una noción universal de significado. La documentación de QVAC define cómo producir embeddings hoy, qué formatos/modelos soporta y cómo se integra la capacidad con el resto del SDK.

### QVAC — embeddings actuales

1. **QVAC — Text embeddings.** Fuente primaria para `embed()`, single/batch embeddings, lifecycle y modelos compatibles con llama.cpp/GGUF.  
   https://docs.qvac.tether.io/ai-capabilities/text-embeddings/

2. **QVAC — API Summary.** Firmas actuales de `embed()` y stats públicas.  
   https://docs.qvac.tether.io/reference/api/

3. **QVAC — `@qvac/embed-llamacpp`.** Addon estable de embeddings sobre `qvac-fabric-llm.cpp`.  
   https://docs.qvac.tether.io/addons/embed-llamacpp/

4. **QVAC — AI capabilities.** Mapa general de capacidades y relación de embeddings con RAG.  
   https://docs.qvac.tether.io/ai-capabilities/

### Similarity y embeddings — fuentes académicas

5. **Steck, Ekanadham & Kallus — _Is Cosine-Similarity of Embeddings Really About Similarity?_** Cautela teórica contra interpretar cosine como medida universal de significado.  
   https://arxiv.org/abs/2403.05440

6. **Opitz et al. — _Interpretable Text Embeddings and Text Similarity Explanation: A Survey_.** Survey sobre interpretabilidad de embeddings y explicación de similarity.  
   https://arxiv.org/pdf/2502.14862

7. **Wang — _A Survey on Efficient Processing of Similarity Queries over Neural Embeddings_.** Separa representation quality del problema de procesar similarity queries a escala.  
   https://arxiv.org/abs/2204.07922

8. **Comparison of Semantic Similarity Methods.** Comparación de varias estrategias de similitud en un dominio concreto; útil para discutir dependencia del corpus.  
   https://arxiv.org/pdf/1910.09129

9. **ICLERB — In-Context Learning Embedding and Reranker Benchmark.** Replantea retrieval evaluation desde utilidad downstream además de semantic relevance.  
   https://arxiv.org/pdf/2411.18947

10. **Semantic Similarity Framework / scale mapping.** Aplicación reciente de embeddings y cosine; lectura periférica, no survey general de embeddings.  
    https://arxiv.org/pdf/2602.13862

11. **Quantum LLM embeddings / cosine similarity.** Aplicación de nicho; útil como lectura opcional, no como fundamento del módulo.  
    https://arxiv.org/pdf/2512.02619

### Fuente pedagógica de apoyo

12. **CodeSignal — Similarity search with cosine similarity.** Tutorial introductorio para practicar el cálculo/ranking; contrastar siempre la interpretación con las fuentes académicas anteriores.  
    https://codesignal.com/learn/courses/implementing-semantic-search-with-chromadb-1/lessons/understanding-similarity-search-with-cosine-similarity

## Orden de lectura recomendado

Primero debe construirse la intuición matemática con dot product, norma y cosine. Después conviene leer Steck et al. para romper la idea ingenua de que cosine es “porcentaje de significado”, y Wang para separar el embedding del sistema de query processing. Solo al final se entra en `embed()` de QVAC: la API se entiende mejor cuando el estudiante ya sabe qué representación está pidiendo y qué decisiones quedan fuera del SDK.