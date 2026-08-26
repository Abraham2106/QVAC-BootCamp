# Solución del Instructor — Model Selection Report

> Material para instructores. La referencia NO es la única solución válida: lo que se evalúa es la matriz aplicada con evidencia, no un modelo "correcto" universal.

## 1. Arquitectura de referencia (proceso, no código único)

```text
Para cada contexto:
  1. inventario de hardware  → getSystemResources / qvac doctor (contexto real)
                              → restricción declarada (contextos simulados)
  2. shortlist               → decodificar nombres de catálogo (familia/escala/INST/cuant)
                              → descartar los que violan memoria/disco ANTES de descargar
  3. experimento             → mismo prompt determinista (temp 0, seed fija, predict fijo)
                              → loadMs, TTFT, tok/s, disco; unloadModel entre variantes
  4. matriz de decisión      → ≥ 4 factores explícitos + riesgo principal
  5. reporte                 → elección + descartes + verificación del nombre
```

## 2. Ejemplo de resolución esperada (valores ORIENTATIVOS — cada estudiante reporta los suyos)

### Contexto 1 — Kiosco (4 GB total, ~2 GB disponibles)

- Elección razonable: **600M–1B INST Q4** (p. ej. `QWEN3_600M_INST_Q4`).
- Descartes: cualquier 7B (ni carga: documentado que < 4 GB totales falla la mayoría); Q8 del 1B (memoria justa con contexto).
- Riesgo principal: calidad para preguntas fuera del dominio del stand → mitigación: system prompt cerrado + respuestas cortas (`predict` bajo).

### Contexto 2 — Consultor (16 GB, calidad de redacción)

- Elección razonable: **7B–8B INST Q4_K_M** (p. ej. `QWEN3_1_7B_INST_Q4` si se prefiere conservador, u otro 7B/8B Q4_K_M del catálogo verificado).
- Descartes: 600M/1B (calidad de redacción insuficiente para el perfil); F16 de 7B (~14 GB: no cabe con contexto).
- Riesgo: latencia en primeros segundos tras cargar; mitigación: precargar al inicio de la sesión.

### Contexto 3 — Tu máquina

- Lo que digan TUS mediciones del lab. El reporte debe citar la corrida (tabla) y la matriz.

## 3. Comparación ejecutada — núcleo de referencia

Idéntico a `examples/02-compare-models.ts`: mismo prompt, `generationParams: { temp: 0, seed: 42, predict: 128 }`, `unloadModel` entre variantes, tabla final. Puntos que el estudiante debe replicar sin copiar:

- determinismo declarado (y su límite: no garantiza calidad, solo reproducibilidad por modelo);
- limpieza entre variantes;
- medición de memoria con `getSystemResources` antes/durante si la plataforma lo reporta.

## 4. Comportamiento observable esperado

- 600M carga más rápido y genera más tok/s que 1B/7B en el mismo hardware (menos pesos por token).
- Carga tibia < carga fría (cacheo de SO/SSD).
- Con temp 0 + seed: misma salida por modelo entre corridas; textos distintos entre modelos.

## 5. Fallos esperados y su lectura

- 7B con RAM insuficiente → fallo en fase de carga (mensaje del runtime/worker, no de red).
- `ctx_size` enorme → fallo de reserva de memoria en carga o primera inferencia.
- Registro caído + caché válida → carga OK (checksum local); `modelRegistryList` falla solo a él.
- `.gguf` corrupto por ruta local → fallo en carga SIN validación de catálogo (la integridad era responsabilidad de la app).

## 6. Mediciones orientativas (para reconocer absurdos — NO valores oficiales)

En laptop moderna x64 con Vulkan/CPU: 600M carga en ~1 s y decodifica decenas de tok/s; 1B algo menos; 7B Q4 varios segundos de carga y tok/s sensiblemente menores en CPU. TTFT con prompt corto: sub-segundo para 600M/1B.

## 7. Soluciones incorrectas comunes

1. Elegir "el más grande que quepa" sin evaluar tarea (falla la matriz: calidad ≠ solo tamaño).
2. Números sin corrida que los respalde, o simular contextos sin declararlo (viola AT5).
3. Comparar variantes con prompts/parámetros distintos entre sí (experimento inválido).
4. Dejar ambos modelos residentes durante la comparación (contamina la medición de memoria).
5. Confundir `INST` con "modelo de instrucciones de sistema" (es instruction-tuned vs base).

## 8. Hints de debugging

- OOM en carga → revisa RAM disponible (no total) y `ctx_size`; prueba el hermano menor de la familia.
- Todo el registro falla → red/registry; el resto del explorer debe seguir (caché).
- Salida incoherente con ruta local → archivo corrupto o tokenizer/template no coincidentes; valida contra catálogo.

## 9. Arquitecturas alternativas válidas

- Reporte centrado en una sola familia comparando 3 cuantizaciones (si el catálogo las expone) — válido si la matriz se aplica igual.
- Enfoque "presupuesto primero": fijar presupuesto de memoria y filtrar antes de medir — válido y eficiente.

## 10. Preguntas de defensa oral

1. ¿Qué factor de la matriz pesó más en tu contexto 2 y por qué los números solos no decidieron?
2. ¿Qué garantiza `seed: 42` entre corridas y qué NO dice nada sobre calidad?
3. Si mañana el catálogo añade `QWEN3_4B_INST_Q8_0`, ¿cómo cambiaría tu análisis del contexto 2?
4. ¿Por qué la validación por checksum del catálogo no aplica cuando cargas por ruta local, y qué harías tú entonces?
5. Explica con la anatomía del modelo por qué un tokenizer incorrecto rompe la salida aunque los pesos sean perfectos.
