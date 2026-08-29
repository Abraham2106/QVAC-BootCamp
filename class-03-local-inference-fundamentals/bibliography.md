# Bibliografía ampliada — Clase 03

## Local Inference Fundamentals · prefill / decode · KV cache · sampling

La bibliografía de esta clase mezcla fundamentos de inferencia autoregresiva, sistemas de serving, compresión de KV cache y decoding. Las fuentes sobre sampling explican una capa distinta del sistema a las fuentes sobre prefill/decode; mantener esa separación ayuda a no confundir calidad del modelo, política de decoding y rendimiento del runtime.

### Inferencia autoregresiva, prefill y decode

1. **CachedAttention.** Trabajo sobre reutilización de KV state entre requests y el coste de reconstruir prefixes en serving multi-turn.  
   https://arxiv.org/pdf/2403.19708

2. **BentoML — How does LLM inference work?** Explicación técnica accesible de prefill, decode, batching y serving.  
   https://bentoml.com/llm/llm-inference-basics/how-does-llm-inference-work

3. **Machine Learning Mastery — KV Caching in LLMs.** Fuente pedagógica secundaria para visualizar qué se guarda y qué recomputación se evita.  
   https://machinelearningmastery.com/kv-caching-in-llms-a-guide-for-developers/

4. **Autoregressive next-token prediction + KV cache in Transformers.** Tutorial secundario para reforzar el loop autoregresivo.  
   https://medium.com/advanced-deep-learning/autoregressive-next-token-prediction-kv-cache-in-transformers-afad22285baf

5. **LLM Inference Serving: Survey.** Panorama de memory management, scheduling, batching y optimizaciones de serving.  
   https://arxiv.org/pdf/2407.12391

6. **Towards Pareto Optimal Throughput in SLM Serving.** Analiza capacidad, throughput y estrategias de serving para modelos pequeños bajo restricciones.  
   https://arxiv.org/pdf/2404.03353

7. **PHOTON — hierarchical autoregressive modeling.** Arquitectura de investigación que replantea parte de la secuencialidad autoregresiva; útil como contraste con decode convencional.  
   https://arxiv.org/pdf/2512.20687

### KV cache — memoria y compresión

8. **KV-CAR.** Investigación sobre compresión y reutilización de KV cache.  
   https://www.arxiv.org/pdf/2512.06727

9. **Lexico — Extreme KV Cache Compression.** Sparse coding aplicado al problema de memoria de KV.  
   https://arxiv.org/pdf/2412.08890

10. **CSR — 1-bit KV Cache via Sparse Representation.** Otra línea de investigación sobre compresión extrema de KV state.  
    https://arxiv.org/pdf/2412.11741

### Sampling y neural text degeneration

11. **Holtzman et al. — _The Curious Case of Neural Text Degeneration_.** Paper central para comprender por qué maximization decoding puede degenerar y de dónde surge nucleus sampling.  
    https://arxiv.org/pdf/1904.09751

12. **Sebastian Raschka — Temperature, top-k and top-p sampling.** Explicación matemática/pedagógica clara para acompañar el paper original.  
    https://sebastianraschka.com/faq/docs/temperature-topk-topp-sampling.html

13. **Understanding and Mitigating Language Confusion in LLMs.** Evidencia de que la política de sampling y temperature puede afectar comportamientos como language confusion.  
    https://arxiv.org/pdf/2406.20052

14. **Wikipedia — Top-p sampling.** Solo como referencia secundaria y mapa de terminología.  
    https://en.wikipedia.org/wiki/Top-p_sampling

15. **LLM inference fundamentals — temperature/top-p/sampling.** Tutorial complementario; verificar conceptos contra las fuentes primarias.  
    https://learncsdesigns.medium.com/day-9-llm-inference-fundamentals-temperature-top-p-and-sampling-92c7f16e9969

### Tokenización — fundamento transversal

16. **Tokenization as Finite-State Transduction.** Marco formal moderno para tokenización y BPE.  
    https://arxiv.org/pdf/2410.15696

17. **Byte Pair Encoding is Suboptimal for Language Model Pretraining.** Crítica a BPE y sus tradeoffs como tokenizer.  
    https://arxiv.org/pdf/2004.03720

18. **Kudo — Subword Regularization.** Trabajo clásico sobre alternativas/regularización en tokenización subword.  
    https://arxiv.org/pdf/1804.10959

19. **Boundless Byte Pair Encoding.** Extensión reciente del espacio de diseño de BPE.  
    https://arxiv.org/html/2504.00178v1

20. **APXML — Byte Pair Encoding.** Lectura pedagógica con referencias a Sennrich et al. y Gage.  
    https://apxml.com/courses/how-to-build-a-large-language-model/chapter-5-tokenization-large-vocabularies/byte-pair-encoding-bpe

### QVAC — superficie de inferencia vigente

21. **QVAC — Text generation.** `completion()`, `CompletionRun.events`, `final`, streaming, `kvCache`, concurrency y stop reasons.  
    https://docs.qvac.tether.io/ai-capabilities/text-generation/

22. **QVAC — Profiler.** Instrumentación para separar timings y observar el pipeline.  
    https://docs.qvac.tether.io/runtime/profiler/

23. **QVAC — Cancellation.** `requestId`, targeted cancellation y semántica de terminación.  
    https://docs.qvac.tether.io/runtime/cancellation/

24. **QVAC — API Summary.** Referencia actual para firmas públicas y tipos.  
    https://docs.qvac.tether.io/reference/api/

## Orden de lectura recomendado

Conviene construir primero el loop autoregresivo y la diferencia prefill/decode; después leer CachedAttention para entender por qué KV cache existe como problema de systems engineering. Solo entonces tiene sentido entrar a KV-CAR, Lexico o CSR. Para sampling, el orden ideal es logits/softmax → greedy → Holtzman → temperature/top-k/top-p. La documentación de QVAC se lee al final para mapear esos conceptos a la superficie real del SDK.