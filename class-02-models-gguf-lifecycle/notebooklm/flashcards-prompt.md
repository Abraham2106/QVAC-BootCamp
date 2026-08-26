# NotebookLM Flashcards — Clase 2

> Pega este prompt en NotebookLM con SOLO las fuentes enfocadas de esta clase.

---

Genera flashcards difíciles para:

**Clase 2 — Models, GGUF and the QVAC Lifecycle** (The Local-First AI Systems Masterclass)

NO crees un mazo solo de vocabulario.

Mezcla aproximada:
- 20% fundamentos (anatomía del modelo; checkpoint vs GGUF)
- 30% explicación (por qué Q4 cabe donde F16 no; qué valida el caché; qué reserva la carga)
- 20% predicción (¿qué pasa si ctx_size enorme? ¿registro caído con caché válida?)
- 15% debugging (OOM en carga; salida basura con ruta local; registro falla pero la app carga)
- 10% comparación (600M vs 1B vs 7B; Q4 vs Q8; INST vs base)
- 5% decisiones de arquitectura (matriz de decisión; presupuesto de memoria primero)

Tipos de tarjeta:
Concept · Cause → Effect · Compare · Predict the System · Architecture ·
Under the Hood · QVAC-specific (constantes=punteros, modelRegistrySearch, getModelInfo, fallbackSrc) ·
Debugging · Measurement (disco, carga, memoria, TTFT, tok/s) · Connection to another class (Clase 1/3/10).

Prefiere "¿por qué…?", "¿qué pasa si…?", "¿cómo distinguirías…?", "¿qué métrica…?" antes que trivia.
Usa únicamente las fuentes seleccionadas para detalles actuales de QVAC.

Idioma: español, términos técnicos en inglés cuando aplique.
