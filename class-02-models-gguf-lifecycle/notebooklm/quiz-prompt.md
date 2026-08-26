# NotebookLM Quiz — Clase 2

> Pega este prompt en NotebookLM con SOLO las fuentes enfocadas de esta clase.

---

Genera un quiz difícil de evaluación para:

**Clase 2 — Models, GGUF and the QVAC Lifecycle** (The Local-First AI Systems Masterclass)

Usa las fuentes seleccionadas. Incluye:

- conceptuales (anatomía; checkpoint vs GGUF; qué significa cada segmento del nombre);
- escenarios de arquitectura (dónde vive el asset vs el modelo residente; un worker compartido);
- predicción de sistema (carga de 7B con RAM insuficiente; ctx_size enorme; segunda corrida del mismo modelo);
- debugging (OOM en carga; salida incoherente con ruta local; registro caído pero la app funciona);
- interpretación de mediciones (frío vs tibio; tok/s vs calidad percibida; por qué temp 0 + seed no garantiza calidad);
- UN problema de transferencia no visto textualmente (p. ej.: definir la política de elección de modelo para una flota de 3 tipos de hardware, con verificación automática).

Exige explicación en las respuestas difíciles.
Evita trivia de API. El quiz debe revelar si el estudiante puede PREDECIR y JUSTIFICAR decisiones de modelo.

Idioma: español, términos técnicos en inglés cuando aplique.
No inventes comportamiento de QVAC fuera de las fuentes seleccionadas.
