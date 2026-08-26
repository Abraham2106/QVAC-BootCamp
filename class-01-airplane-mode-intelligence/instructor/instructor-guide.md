# Instructor Guide — Clase 1: Airplane-Mode Intelligence

## Teaching goal

Que cada estudiante salga con **evidencia propia** de inferencia offline y el modelo mental de la ruta de datos. La clase no termina en "entendí": termina en "lo probé y tengo los números".

## Misconcepción primaria a atacar

> "Descargué el modelo ⇒ mi app es local."

Todo el diseño de la clase (fases, Airplane-Mode Test, clasificación de dependencias) existe para desmontar esta equivalencia falsa.

## Qué NO sobre-explicar todavía

- Interior del GGUF, pesos/tensors/tokenizer → **Clase 2**
- Tokenización, sampling, KV cache, TTFT formal → **Clase 3**
- Detalles de `parallel`, batching continuo, tools/MCP → Clases 4+

Si alguien pregunta, responde una frase y nombra la clase donde se abre la caja.

## Conceptos diferidos intencionalmente

Cuantización formal · nombres de modelos · sharded models · fallbackSrc profundo (menciónalo solo si alguien pregunta por redes inestables) · ciclo suspend()/resume() del runtime.

## Setup pre-clase (checklist del instructor)

- [ ] Verificar release notes de @qvac/sdk contra v0.18.x antes de impartir
- [ ] Pre-descargar `LLAMA_3_2_1B_INST_Q4_0` en la máquina de demo
- [ ] Ensayar la transición de red: cómo se desconecta rápido en el aula (Wi-Fi switch, hotspot)
- [ ] Tener plan B si el registro está caído: constantes + `fallbackSrc` documentado en download-lifecycle
- [ ] Abrir slides.html en navegador; probar teclas ←/→/N/E

## Timing (180 min — ritmo estándar)

| Bloque | Minutos | Actividad |
|--------|---------|-----------|
| Hook | 5 | Pregunta esencial (slide 2): ¿tu chat de IA funciona en un avión? |
| Concepto | 15 | Slides 3–7: cuatro categorías, cuatro fases, test |
| Predict | 5 | Slide 16 — predicciones POR ESCRITO |
| Demo | 15 | Slides 17: provision→medición fría→corte de red→offline |
| Coding guiado | 30 | Lab Partes 1–2 (examples + starter) |
| Experimento | 15 | Lab Partes 3–4: corridas A/B + tabla |
| Break | 10 | — |
| Break It | 20 | Lab Partes 5–6: 4 escenarios con predicción previa |
| Measure It | 15 | Lab Parte 7: completar tabla frío/tibio |
| Challenge | 35 | field-provision independiente |
| Explain/review | 10 | 2–3 estudiantes defienden su frontera red/local |
| Checkpoint | 5 | Asignar checkpoint.md como cierre/entrada siguiente |

## Demo script (guion minuto a minuto)

1. Correr `01-provision.ts` — narrar progreso: "esto es la ÚNICA vez que necesitamos red"
2. Correr `03-measure.ts` — señalar tabla: descarga sí, carga X s, TTFT, tok/s
3. Cortar la red físicamente (no emular) — decir qué esperas tú antes de correr
4. Correr `02-offline-inference.ts` — silencio mientras genera; luego celebrar la evidencia
5. Re-correr `03-measure.ts` offline — comparar filas en vivo

**Preguntas Predict durante la demo:** "¿fallará?", "¿qué fase?", "¿cuánto tardará más o menos?"

## Expected observations

- Carga tibia < carga fría (cacheo SO/SSD)
- TTFT local en cientos de ms para prompt corto en 1B Q4
- tok/s estable entre corridas offline vs online (la red no participa en decodificación)

## Facilitación del Break It

No reveles la causa al primer intento fallido. Secuencia: ¿qué dice el error? → ¿qué fase intentaba? → ¿red, disco o memoria? Solo si se atascan >3 min, sugiere revisar dónde vive el caché (`cacheDirectory` en configuración).

Escenario B4 (ctx_size grande con poca RAM) puede tardar en fallar o no fallar según plataforma — está bien: conviértelo en discusión de límites por hardware.

## Preguntas de discusión

1. ¿Qué features de SU app actual prometerían como locales? ¿Cómo lo verificarían?
2. Si el registro de modelos desaparece mañana, ¿qué sigue funcionando de lo que construyeron hoy?
3. ¿Qué medirían para detectar que una dependencia "local" empezó a usar red?

## Problemas comunes de entorno/hardware

- Registro inalcanzable pero red OK → usar constante con `fallbackSrc` (documentado) como plan B didáctico
- Laptop sin permiso para cortar red → hotspot móvil apagable / network namespace (Linux) / modo avión del SO
- Disco lleno → el fallo de descarga ES pedagógico: úsalo (Break It implícito)
- tsx no instalado → `npm i -D tsx` o usar Bun directo

## Qué cuenta como mastery HOY

Nivel ≥3 en criterios 1–5 de la rubric: distingue conceptos ante contraejemplos, traza la ruta, corre el ciclo offline con limpieza, diagnostica un fallo guiado leyendo el error, y reporta métricas propias con interpretación.

## Qué queda intencionalmente incompleto

El asset sigue siendo una caja negra. El estudiante debe SALIR preguntando "¿qué hay dentro de ese archivo?" — esa pregunta abre la Clase 2.

## Transición a la Clase 2

Deja planteada la pregunta en el último slide: "Descargaste ~0.6 GB. ¿Son todos iguales? ¿Qué decide cuánta RAM necesita? Trae tu tabla de métricas: la compararemos entre arquitecturas."
