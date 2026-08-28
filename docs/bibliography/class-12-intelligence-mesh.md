# Bibliografía preparada — Clase 12

## Intelligence Mesh · orchestration · distributed / edge inference

La Clase 12 todavía no tiene paquete publicado en `main`. Esta bibliografía queda preparada para integrarla cuando se implemente la clase. El objetivo de las lecturas no es convertir el mesh en una abstracción vaga, sino estudiar placement, model heterogeneity, scheduling, communication cost, failure handling y distribución de artefactos entre dispositivos.

### QVAC — primitives para construir el mesh

1. **QVAC — Delegated inference.** Primitive base para delegar inferencia directamente a otro provider.  
   https://docs.qvac.tether.io/p2p-capabilities/delegated-inference/

2. **QVAC — Blind relays.** Conectividad P2P cuando la conexión directa no es posible.  
   https://docs.qvac.tether.io/p2p-capabilities/blind-relays/

3. **QVAC — How it works.** Runtime/client/worker model que cada nodo del mesh puede ejecutar localmente.  
   https://docs.qvac.tether.io/about/how-it-works/

4. **QVAC — API Summary.** Contratos públicos actuales para model lifecycle y P2P.  
   https://docs.qvac.tether.io/reference/api/

### Orquestación distribuida y edge inference

5. **_Intelligent Orchestration of Distributed LFM Inference at the Edge_.** Investigación sobre placement/orchestration de modelos en edge.  
   https://arxiv.org/pdf/2504.03668

6. **_Toward Edge General Intelligence with Multi-LLM_.** Arquitecturas edge con múltiples LLMs y selección/orquestación.  
   https://arxiv.org/html/2507.00672v1

7. **_Network Edge Inference for Large Language Models: A Survey_.** Survey reciente sobre inferencia de LLMs en edge y tradeoffs de comunicación/computación.  
   https://arxiv.org/html/2604.22906v1

8. **ACM Computing Surveys — Network Edge Inference for LLMs.** Publicación/survey relacionado para lectura formal.  
   https://dl.acm.org/doi/10.1145/3809166

9. **Distributed Inference of LLMs on Edge Devices.** Arquitectura master-worker y distribución de inferencia entre dispositivos edge.  
   https://dl.acm.org/doi/10.1145/3731806.3731859

10. **Distributed On-Device LLM Inference with Over-the-Air Computation.** Investigación sobre inferencia distribuida y comunicación inalámbrica.  
    https://arxiv.org/pdf/2502.12559

11. **EdgePier — P2P Container Image Distribution.** Aunque estudia distribución de imágenes de contenedor y no modelos LLM directamente, aporta un patrón útil para pensar en distribución P2P de artefactos en edge.  
    https://arxiv.org/pdf/2109.12983

## Nota de integración futura

Cuando exista `class-12-*`, mover o copiar esta bibliografía a su `bibliography.md`. La lectura debe comparar al menos tres problemas distintos que suelen confundirse bajo “distributed AI”: delegar una request completa, partir una inferencia/modelo entre dispositivos y distribuir artefactos/modelos. QVAC delegated inference pertenece a la primera categoría según la documentación actual; no debe presentarse automáticamente como tensor/model parallelism.