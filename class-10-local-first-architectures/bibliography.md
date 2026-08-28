# Bibliografía ampliada — Clase 10

## Designing Local-First Architectures · ADR · zero trust · data boundaries

Esta clase conecta decisiones de arquitectura con evidencia y threat models. Local-first responde dónde vive el estado y qué ocurre cuando la red falla; ADR responde cómo registrar decisiones y sus tradeoffs; Zero Trust obliga a no convertir “está dentro de mi red” en una suposición de confianza. Son marcos complementarios, no sinónimos.

### Local-first software

1. **Kleppmann et al. / Ink & Switch — _Local-first software_.** Fuente principal para los siete ideales: ownership, network optional, longevity, privacy y colaboración.  
   https://www.inkandswitch.com/essay/local-first/

2. **Paper completo de _Local-first software_.** PDF para lectura académica y citas formales.  
   https://www.inkandswitch.com/local-first/static/local-first.pdf

3. **PowerSync — Local-first software resources.** Explicación moderna de arquitecturas local-first, sync y offline-first.  
   https://docs.powersync.com/resources/local-first-software

4. **PowerSync — Origins and evolution of local-first software.** Historia/contexto del movimiento.  
   https://powersync.com/blog/local-first-software-origins-and-evolution

5. **The Morning Paper — Local-first software.** Resumen técnico del paper original; fuente secundaria.  
   https://blog.acolyer.org/2019/11/20/local-first-software/

### Architecture Decision Records

6. **Joel Parker Henderson — Architecture Decision Record repository.** Colección de formatos, ejemplos y prácticas ADR.  
   https://github.com/joelparkerhenderson/architecture-decision-record

7. **ADR GitHub organization.** Recursos comunitarios dedicados a ADRs.  
   https://adr.github.io/

8. **ADR templates.** Plantillas para capturar contexto, decisión, alternativas y consecuencias.  
   https://adr.github.io/adr-templates/

9. **arc42 — Decision examples using ADRs.** Ejemplos prácticos de decisiones arquitectónicas.  
   https://docs.arc42.org/examples/decision-use-adrs/

10. **ADR templates and operations.** Lectura complementaria sobre mantenimiento de ADRs en proyectos.  
    https://hidekazu-konishi.com/entry/architecture_decision_records_templates_and_operations.html

### Zero Trust y trust boundaries

11. **NIST SP 800-207 — Zero Trust Architecture.** Documento base para el modelo Zero Trust: no confiar implícitamente por ubicación de red y evaluar acceso explícitamente.  
    https://nvlpubs.nist.gov/nistpubs/specialpublications/NIST.SP.800-207.pdf

12. **NIST — Planning for a Zero Trust Architecture.** Guía complementaria para adopción y planeación.  
    https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.20.pdf

13. **NCCoE — Implementing Zero Trust Architecture.** Recursos de implementación y casos de referencia.  
    https://www.nccoe.nist.gov/projects/implementing-zero-trust-architecture

14. **NIST — Zero Trust Architecture landing page/publication.** Punto de entrada oficial y referencias relacionadas.  
    https://www.nist.gov/publications/zero-trust-architecture

15. **Survey of Data Security / Zero Trust tenets.** Survey académico complementario para ampliar el threat model.  
    https://arxiv.org/pdf/2310.04513

### QVAC — arquitectura y fronteras del runtime

16. **QVAC — How it works.** Worker/client boundary y lifecycle del runtime local.  
    https://docs.qvac.tether.io/about/how-it-works/

17. **QVAC — Configuration.** Configuración de modelos, plugins y servidor; útil para documentar qué queda local y qué dependencias se habilitan.  
    https://docs.qvac.tether.io/configuration/

18. **QVAC — Runtime lifecycle.** Estados suspend/resume y límites operacionales del runtime.  
    https://docs.qvac.tether.io/runtime/lifecycle/

## Orden de lectura recomendado

La mejor secuencia para esta clase es Ink & Switch → ADR → NIST SP 800-207. Primero se define qué propiedades queremos preservar; después se aprende a registrar decisiones y alternativas; finalmente se somete la arquitectura a un trust model donde “local” no equivale automáticamente a “trusted”. El resultado final debe ser un ADR defendible que diga qué corre localmente, qué puede salir del dispositivo, qué ocurre offline y qué amenazas siguen existiendo.