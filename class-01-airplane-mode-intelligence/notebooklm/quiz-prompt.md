# NotebookLM Quiz — Clase 1

> Pega este prompt en NotebookLM con SOLO las fuentes enfocadas de esta clase.

---

Genera un quiz difícil de evaluación para:

**Clase 1 — Airplane-Mode Intelligence** (The Local-First AI Systems Masterclass)

Usa las fuentes seleccionadas de la clase. Incluye:

- preguntas conceptuales (distinción modelo/inferencia/local-first);
- escenarios de arquitectura (dónde corre qué en la ruta App→SDK→worker→modelo);
- predicción de sistema (segunda loadModel() del día; descarga interrumpida al 40%);
- debugging (error menciona "download" en modo avión: tres hipótesis distinguibles);
- interpretación de mediciones (frío vs tibio, TTFT manual mal instrumentado, tok/s del runtime);
- UN problema de transferencia no visto textualmente (p. ej.: diseñar el test de CI que garantice "offline" en cada release de una app de aerolínea).

Exige explicación en las respuestas difíciles — no solo opción correcta.
Evita convertirlo en un quiz de trivia de API.
El quiz debe revelar si el estudiante puede PREDECIR el comportamiento del sistema.

Idioma: español, términos técnicos en inglés cuando aplique.
No inventes comportamiento de QVAC fuera de las fuentes seleccionadas.
