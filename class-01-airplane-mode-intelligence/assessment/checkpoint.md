# Checkpoint — Clase 1: Airplane-Mode Intelligence

> 8 preguntas. Distribución Bloom: 1 recall · 2 explicación · 2 aplicación/predicción · 2 análisis/diagnóstico · 1 evaluación/diseño.
> Regla: responde con tus palabras; las respuestas que solo repiten la lección sin evidencia no puntúan completo.

## Q1 — Recall *(10%)*

¿Qué función del SDK descarga un asset de catálogo **sin** cargarlo en memoria, y qué función lo carga después desde el caché?

## Q2 — Explicación

Explica la diferencia entre **modelo local**, **inferencia local** y **aplicación local-first**. Da un ejemplo concreto de un sistema que tenga modelo local pero NO inferencia local.

## Q3 — Explicación

Dibuja o describe la ruta de datos de una completación en QVAC (de tu teclado al texto en pantalla), indicando qué corre en tu proceso y qué corre en el worker.

## Q4 — Aplicación/Predicción

Provisionaste `LLAMA_3_2_1B_INST_Q4_0` hoy a las 10:00 con éxito. A las 11:00, con red disponible, corres `loadModel()` con la misma constante por segunda vez. Predice: ¿contacta el registro remoto? ¿qué hace en su lugar? ¿cómo afecta esto al tiempo total?

## Q5 — Aplicación/Predicción

Tu script mide TTFT como "momento en que imprime el primer carácter" pero imprime un banner de bienvenida antes de enviar el prompt. ¿Qué está mal en esa medición y cómo lo corriges?

## Q6 — Análisis/Diagnóstico

Un compañero reporta: *"mi app falla en modo avión con un error que menciona download"*. Formula las tres hipótesis más probables sobre su código y describe cómo distinguirlas entre sí con un experimento cada una.

## Q7 — Análisis/Diagnóstico

Comparas dos corridas: la A (fría) tardó 4.1 s en cargar; la B (tibia) 0.9 s. Un tercero afirma: *"el SDK tiene un bug, los tiempos deberían ser iguales porque es el mismo archivo"*. Analiza la afirmación: ¿qué supuesto es falso y qué explica realmente la diferencia?

## Q8 — Evaluación/Diseño

Una aerolínea quiere "asistente de cabina con IA que funcione sin Wi-Fi a bordo". Redacta (máx. 8 líneas): qué funcionalidades prometerías como locales, cuáles NO prometerías, y el test automático que instalarías en CI para verificar la promesa en cada release.

---

## Soluciones esperadas (resumen para autoevaluación)

- **Q1:** `downloadAsset()` → `loadModel()`.
- **Q2:** pesos en disco ≠ computación en el dispositivo ≠ diseño que sobrevive sin red. Ejemplo válido: app que descarga un GGUF pero envía prompts a una API.
- **Q3:** App → SDK → worker Bare (perezoso/compartido) → modelo residente → eventos/tokens → App. El prompt no sale del equipo.
- **Q4:** No contacta registro si el caché valida contra tamaño/checksum; reutiliza caché; carga notablemente más rápida que la primera vez.
- **Q5:** Mide I/O de consola, no inferencia. Corregir: timestamp justo antes de `completion()` vs. primer evento `contentDelta` recibido.
- **Q6:** Hipótesis típicas: (a) intenta descargar porque nunca provisionó, (b) provisionó con otro `cacheDirectory`, (c) usa ruta/URL directa sin catálogo. Experimentos: correr provision con red; comparar configuración de caché; inspeccionar el `assetSrc` usado.
- **Q7:** Supuesto falso: "cargar = leer el mismo archivo siempre". Intervienen caché del SO/SSD, reserva de memoria distinta por contexto, estado frío del runtime.
- **Q8:** Promete: chat/resumen offline post-provisión. No promete: información actualizada, funciones que consulten servicios externos. Test CI: runner con red deshabilitada (network namespace/offline emulation) que ejecuta el ciclo completo y falla ante cualquier intento de socket saliente.
