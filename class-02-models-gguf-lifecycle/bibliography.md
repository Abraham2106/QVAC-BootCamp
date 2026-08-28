# Bibliografía ampliada — Clase 02

## Models, GGUF and the QVAC Model Lifecycle

Esta clase combina tres niveles de lectura. Primero está la especificación/formato y el tooling upstream de GGML/llama.cpp; después la literatura sobre quantization y sus tradeoffs; finalmente la documentación de QVAC que materializa provisioning, load, reuse, unload y observabilidad del modelo. Las guías de blogs son útiles para intuición y práctica, pero no sustituyen la especificación upstream ni la API vigente.

### GGUF y llama.cpp — fuentes primarias

1. **GGML — GGUF specification.** Estructura del formato, metadata, tensor descriptors, versionado y objetivos de deployment.  
   https://github.com/ggml-org/ggml/blob/master/docs/gguf.md

2. **llama.cpp — `llama-quantize` README.** Tooling oficial para convertir GGUFs de mayor precisión a representaciones cuantizadas y notas sobre pérdida/calibración.  
   https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md

3. **llama.cpp — repositorio oficial.** Código, loaders, kernels, formatos soportados y evolución del runtime.  
   https://github.com/ggml-org/llama.cpp

4. **APXML — GGUF format.** Explicación pedagógica del contenedor GGUF y su papel dentro del ecosistema llama.cpp.  
   https://apxml.com/courses/practical-llm-quantization/chapter-5-quantization-formats-tooling/gguf-format

### Quantization — evaluación y tradeoffs

5. **_Which Quantization Should I Use?_** Evaluación unificada de varias quantizations de llama.cpp —incluidas variantes K— sobre calidad, tamaño y rendimiento en un setup concreto.  
   https://arxiv.org/html/2601.14277v1

6. **Toni Sagrista — Quantization / GGUF guide (2026).** Lectura complementaria para intuition sobre precision, bits y deployment.  
   https://tonisagrista.com/blog/2026/quantization/

7. **Kaitchup — GGUF quantization for fast and memory-efficient inference.** Guía práctica secundaria sobre impacto de quants en tamaño/memoria.  
   https://kaitchup.substack.com/p/gguf-quantization-for-fast-and-memory

8. **KnightLi — llama-quantize GGUF guide (2026).** Walkthrough complementario del tooling de quantization.  
   https://knightli.com/en/2026/04/12/llama-quantize-gguf-guide/

9. **Wasif Mehmood — llama.cpp guide for creating GGUFs.** Fuente secundaria para el flujo de conversión; verificar siempre contra el tooling oficial.  
   https://medium.com/@wasifmehmood/llama-cpp-guide-for-creating-ggufs-ec380568e8fb

### QVAC — lifecycle del modelo

10. **QVAC SDK — repositorio oficial.** Fuente primaria para el SDK y su integración con runtimes/modelos.  
    https://github.com/tetherto/qvac

11. **QVAC — Quickstart.** Primer ciclo ejecutable de instalación, carga e inferencia.  
    https://docs.qvac.tether.io/quickstart/

12. **QVAC — Introduction.** Arquitectura general, fuentes de modelo y capacidades del SDK.  
    https://docs.qvac.tether.io/introduction/

13. **QVAC — API Summary v0.18.x.** Contratos actuales de `loadModel()`, `unloadModel()`, `close()`, `cancel()`, `requestId`, profiler y funciones de introspection.  
    https://docs.qvac.tether.io/reference/api/

14. **QVAC — SDK Release Notes.** Fuente para cambios de versión; útil para distinguir comportamiento vigente de ejemplos históricos.  
    https://docs.qvac.tether.io/reference/release-notes/

15. **QVAC — Download lifecycle.** Relación entre adquisición, cache, checksum, `fallbackSrc`, partial downloads y posterior load.  
    https://docs.qvac.tether.io/models/download-lifecycle/

16. **QVAC — System requirements.** Backends/plataformas y `qvac doctor` para validar el host antes del model selection.  
    https://docs.qvac.tether.io/system-requirements/

17. **Matteo Giardino — What is QVAC SDK.** Overview externo y secundario para contextualización; no sustituye la documentación oficial.  
    https://matteogiardino.com/en/blog/what-is-qvac-sdk

## Orden de lectura recomendado

La lectura más productiva comienza por la especificación GGUF y el README oficial de `llama-quantize`; después conviene leer el paper de evaluación de quantization para aprender a desconfiar de reglas universales del tipo “Q4 siempre es el mejor”. Solo entonces el lifecycle de QVAC adquiere contexto: el estudiante ya sabe qué artefacto se está descargando, por qué existe una variante cuantizada y qué significa realmente tener ese artefacto en disco frente a tener una instancia cargada en memoria.