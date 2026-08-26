# NotebookLM Detailed Slide Deck — Clase 1

> Pega este prompt en NotebookLM con SOLO las fuentes enfocadas de esta clase.

---

Genera un Detailed Slide Deck para:

**Clase 1 — Airplane-Mode Intelligence** (The Local-First AI Systems Masterclass)

Usa solo las fuentes seleccionadas de la clase (Introduction, How it works, Download lifecycle, System requirements, Text generation, Release notes v0.18.x).

Narrativa: problema → modelo mental → arquitectura → mecanismo → QVAC → experimento → fallo → medición → misconception → takeaway.

Idioma: español con términos técnicos en inglés donde corresponda.
Prefiere diagramas y flujos de ejecución a listas.

Haz visibles las fronteras donde sea relevante:
Dispositivo local / Runtime QVAC / Modelo / Almacenamiento / Red.

Incluye obligatoriamente:
- una diapositiva "¿Qué pasa si...?" (p. ej.: se borra el caché, se corta la red a mitad de descarga)
- una diapositiva "Measure It" (load time, TTFT, tok/s, bytes)
- una diapositiva "Common Misconception" (descargado ≠ local)
- una diapositiva "How this connects to the course" (Clase 2: GGUF · Clase 10: criterio offline del capstone)
- tres preguntas finales de checkpoint

No inventes comportamiento de QVAC. Si un detalle no está en las fuentes, márcalo como concepto general.
