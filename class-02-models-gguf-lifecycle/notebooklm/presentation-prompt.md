# NotebookLM Detailed Slide Deck — Clase 2

> Pega este prompt en NotebookLM con SOLO las fuentes enfocadas de esta clase.

---

Genera un Detailed Slide Deck para:

**Clase 2 — Models, GGUF and the QVAC Lifecycle** (The Local-First AI Systems Masterclass)

Usa solo las fuentes seleccionadas (Download lifecycle, Text generation, System requirements, Release notes v0.18.x, llama.cpp/GGUF, currículo Cap. 4).

Narrativa: problema → anatomía → formato (GGUF) → cuantización → nombres → catálogo QVAC → ciclo de vida → experimento → fallo → medición → decisión → takeaway.

Idioma: español con términos técnicos en inglés.
Prefiere diagramas (anatomía del archivo, pipeline checkpoint→GGUF, ciclo de vida) a listas.

Haz visibles las fronteras:
Disco (asset) / Caché / Memoria (modelo residente) / Registro distribuido / Tu aplicación.

Incluye obligatoriamente:
- una diapositiva "¿Qué pasa si...?" (cargas un 7B sin RAM; ctx_size enorme; registro caído con caché válida)
- una diapositiva "Measure It" (disco, carga, memoria, TTFT, tok/s)
- una diapositiva "Common Misconception" (más grande = mejor / el GGUF se ejecuta solo)
- una diapositiva "How this connects to the course" (Clase 1 caja negra → Clase 3 mecánica → Clase 10 ADR)
- tres preguntas finales de checkpoint

No inventes comportamiento de QVAC. Detalles no cubiertos por las fuentes: márcalos como concepto general.
