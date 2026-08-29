# Bibliografía ampliada — Clase 01

## Airplane-Mode Intelligence · Local AI · offline / on-device inference

Esta bibliografía está organizada para que la clase no dependa de una sola narrativa. Las fuentes de QVAC sirven para verificar el runtime y el lifecycle actual; los papers de edge/on-device sirven para entender placement, hardware heterogéneo y offloading; Ink & Switch sirve para el marco local-first. Los resultados de rendimiento de los papers deben leerse dentro de su hardware y setup experimental, no como números universales.

### QVAC — documentación primaria

1. **QVAC — Introduction.** Arquitectura general del SDK, capacidades y modelo local-first.  
   https://docs.qvac.tether.io/introduction/

2. **QVAC — How it works.** Worker Bare, clientes, inicialización y modelo de ejecución.  
   https://docs.qvac.tether.io/about/how-it-works/

3. **QVAC — System requirements.** Requisitos de host, backends y `qvac doctor`.  
   https://docs.qvac.tether.io/system-requirements/

4. **QVAC — Download lifecycle.** Provisioning, caché, descargas reanudables, validación y uso offline posterior.  
   https://docs.qvac.tether.io/models/download-lifecycle/

5. **QVAC SDK — repositorio oficial.** Código, releases y contexto del proyecto.  
   https://github.com/tetherto/qvac

### Papers y arquitecturas on-device / edge

6. **Barros et al. — _Offline-First AIED: An Architectural Blueprint for On-Device LLM Integration in Low-Resource Educational Contexts_.** Marco de arquitectura on-device para contextos educativos con recursos limitados.  
   https://link.springer.com/chapter/10.1007/978-3-032-29773-0_32

7. **Intel — _On-Device-First Hybrid LLM Inference_.** Arquitectura device-first con escalamiento selectivo a cloud y discusión de privacidad, latencia y coste.  
   https://www.intel.com/content/www/us/en/developer/articles/technical/on-device-first-hybrid-llm-inference.html

8. **EdgeFM — _Efficient Edge Inference for Foundation Models_.** Trabajo sobre inferencia de modelos de lenguaje/visión en edge y comparación con runtimes como llama.cpp, MLC-LLM, Candle y PowerInfer.  
   https://arxiv.org/pdf/2604.27476

9. **Xu et al. — _llm.npu: Fast On-device LLM Inference with NPUs_.** Estudia el prefill como cuello de botella y offloading heterogéneo CPU/GPU/NPU.  
   https://arxiv.org/pdf/2407.05858

10. **TMO — Local-Cloud Inference Offloading.** Optimización conjunta de placement local/cloud bajo calidad, latencia, coste y restricciones.  
    https://dl.acm.org/doi/10.1145/3704413.3764429

11. **Arapai — _Offline-First LLM Architecture for Adaptive Learning_.** Arquitectura educativa offline-first orientada a equipos limitados.  
    https://arxiv.org/pdf/2603.03339

12. **Task Decomposition LLM Inference in WiFi-Offload Networks.** Descomposición y scheduling entre local y edge bajo costes de comunicación, compute y queueing.  
    https://arxiv.org/pdf/2604.21399

13. **_Offline AI: Analyzing Its Working Principles, Use Cases and Future Directions_.** Panorama complementario sobre offline AI y sus tradeoffs.  
    https://www.researchgate.net/publication/393516080_Offline_AI_Analyzing_Its_Working_Principles_Use_Cases_and_Future_Directions

### Local-first como marco de arquitectura

14. **Kleppmann et al. / Ink & Switch — _Local-first software_.** Texto central para ownership, network optional, longevity y control del usuario.  
    https://www.inkandswitch.com/essay/local-first/

15. **Paper completo de _Local-first software_.** Versión PDF para lectura académica y citas formales.  
    https://www.inkandswitch.com/local-first/static/local-first.pdf

16. **Wikipedia — Local-first software.** Solo como mapa secundario de conceptos y enlaces; no sustituye el paper original.  
    https://en.wikipedia.org/wiki/Local-first_software

## Orden de lectura recomendado

Para preparar la clase, conviene leer primero Ink & Switch para fijar qué significa local-first, luego la documentación de QVAC sobre runtime y download lifecycle, y después contrastar Intel, TMO, `llm.npu`, EdgeFM y WiFi-offload. El objetivo no es encontrar una arquitectura universalmente ganadora, sino entender cómo cambian privacidad, latencia, coste y failure domains cuando el placement del modelo cambia.