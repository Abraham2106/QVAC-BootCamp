# Checkpoint — Clase 2: Models, GGUF and the QVAC Lifecycle

> 8 preguntas. Distribución: 1 recall · 2 explicación · 2 aplicación/predicción · 2 análisis/diagnóstico · 1 evaluación/diseño.

## Q1 — Recall *(10%)*

Decodifica `QWEN3_4B_INST_Q4_K_M`: ¿qué significa cada segmento del nombre?

## Q2 — Explicación

¿Por qué un checkpoint de entrenamiento (PyTorch/Safetensors) y un GGUF no son lo mismo? Nombra dos diferencias concretas de propósito o contenido.

## Q3 — Explicación

Explica la negociación de la cuantización usando la cadena: bits por peso → memoria → velocidad → calidad. ¿Qué factor NO se negocia (nunca baja al cuantizar)?

## Q4 — Aplicación/Predicción

Máquina con 6 GB de RAM disponibles. Tarea: chat general offline. ¿Qué escala y cuantización probarías primero, y qué margen dejarías para contexto y runtime?

## Q5 — Aplicación/Predicción

`loadModel()` de un 7B Q4 (~4 GB) con 3 GB disponibles. ¿En qué fase falla y qué tipo de mensaje esperas: de red, de disco o de memoria? ¿Por qué no puede ser de red si el asset ya está cacheado?

## Q6 — Diagnóstico

`modelRegistryList()` falla con error de red, pero tu aplicación sigue cargando modelos por constante de catálogo. Explica cómo es posible ese flujo (qué valida el SDK y contra qué).

## Q7 — Diagnóstico

Cargaste por **ruta local** un `.gguf` que te pasó otro equipo y produce tokens incoherentes. ¿Qué pieza de la anatomía sospechas primero? ¿Por qué la validación de catálogo no te ayudó aquí y qué harías para verificar el archivo?

## Q8 — Evaluación/Diseño

Con TU máquina medida (`getSystemResources`) y la tarea "resumir documentos personales offline": completa la matriz de decisión (≥ 5 factores) y defiende tu elección en 5 líneas, nombrando el riesgo principal y cómo lo detectarías.

---

## Soluciones esperadas (resumen)

- **Q1:** QWEN3 = familia · 4B = ~4 mil millones de parámetros · INST = instruction-tuned · Q4_K_M = 4 bits, K-quants, variante M (mixta).
- **Q2:** propósito (seguir entrenando vs inferir) y contenido/estructura (formato distinto; GGUF empaqueta tensors+tokenizer+metadata optimizado para runtime GGML/llama.cpp).
- **Q3:** menos bits → menos memoria → típicamente más velocidad → posible pérdida de calidad. Lo que no baja: el NÚMERO de pesos (parámetros).
- **Q4:** 1B–3B Q4 (≈ 0.6–2 GB) dejando ≥ 1.5–2 GB para contexto+runtime; p. ej. 1B Q4 con margen holgado.
- **Q5:** fase de carga; mensaje de memoria (OOM/reserva), no de red — el caché validado evita el registro.
- **Q6:** la carga por constante valida contra tamaño/checksum del catálogo usando el caché local, sin contactar el registro; solo la LISTA necesita red.
- **Q7:** tokenizer/metadata (o archivo corrupto). No hubo checksum de catálogo (ruta local = integridad propia). Verificar: hash conocido, tamaño, cargar por constante equivalente y comparar comportamiento.
- **Q8:** matriz con evidencia: memoria medida, tarea (resumen → contexto largo pesa), latencia aceptable, disco; riesgo típico: contexto grande consume el margen → detectar midiendo carga con ctx objetivo.
