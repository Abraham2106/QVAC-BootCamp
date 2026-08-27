# Clase 08 — Translation and the Voice Relay

> Pregunta esencial: ¿Cómo convertimos audio local en una conversación traducida en tiempo casi real sin enviar la voz ni el texto a la nube?

## Resultados de aprendizaje

1. Descomponer un intérprete en contratos de captura PCM, ASR, traducción y TTS.
2. Distinguir frames PCM, hipótesis parciales y segmentos finales.
3. Elegir una ruta local: qvac-fabric-llm.cpp para un modelo generativo o Bergamot para traducción especializada.
4. Encadenar ASR → traducción → TTS sin bloquear la captura.
5. Aplicar IDs de segmento, backpressure, cancelación y descarte de resultados obsoletos.
6. Medir primer audio, duración por etapa, real-time factor y errores.
7. Defender qué datos permanecen locales y cómo falla cada etapa.

## Por qué importa

La voz añade tiempo y estado que no aparecen en un chat de texto. Un ASR puede emitir hipótesis parciales; una traducción parcial puede cambiar cuando llega el final de la frase; TTS necesita audio reproducible y ordenado. Si conectamos callbacks sin contratos, el relay repite palabras, habla frases viejas o acumula una cola imposible de vaciar.

La ruta local es micrófono → PCM → ASR → texto → traductor → texto → TTS → altavoz. Ningún paso necesita un proveedor remoto. La privacidad se demuestra observando dependencias, sockets y artefactos en caché.

## Cuatro relojes

- Captura: frames PCM mono con frecuencia de muestreo explícita.
- ASR: segmentos con hipótesis partial y resultado final.
- Traducción: traduce resultados finales o ventanas estables.
- TTS: reproduce una cola ordenada de segmentos traducidos.

Cada segmento lleva segmentId. Un evento tardío con ID anterior no puede sobrescribir el estado actual.

## Contratos mínimos

    { type: "audio", pcm, sampleRate: 16000, timestampMs }
    { type: "transcript", segmentId, text, final: false }
    { type: "transcript", segmentId, text, final: true }
    { type: "translation", segmentId, sourceText, targetText }
    { type: "audio", segmentId, pcm, sampleRate, final: true }

No confundas partial con contenido durable. La política segura traduce y sintetiza únicamente final. La política de menor latencia puede emitir parciales, pero debe cancelar o reemplazar el audio provisional.

## Rutas de traducción local

qvac-fabric-llm.cpp permite tratar un modelo de lenguaje local como traductor mediante prompt y runtime QVAC. Es flexible, pero puede introducir texto extra y variación; exige un formato de salida estricto.

Bergamot es una ruta especializada de traducción neuronal local. Puede ser más predecible y eficiente para pares soportados, a costa de modelos y pares concretos. Decide con cobertura, latencia, tamaño, calidad y licencia. La clase no prescribe una ruta universal: el proceso debe funcionar sin red con modelos previamente provisionados.

## Relay y backpressure

La captura nunca espera a TTS. Cada cola necesita una política: bloquear con límite, descartar parciales o degradar a texto. En el laboratorio se conserva el último parcial de cada segmento y se limita la cola de finales a dos segmentos. El ejemplo hace visible la política de conservar solo el segmento más reciente; una conversación rápida puede requerir FIFO ordenado.

## Break It

Predice antes de ejecutar:

1. TTS tarda más que ASR: ¿crece la cola o se descartan segmentos?
2. Traducción falla en segmento 3: ¿se bloquean 4 y 5?
3. Final del segmento 2 llega después del 3: ¿se reproduce audio obsoleto?
4. Se cierra durante TTS: ¿se oye audio después de apagarlo?
5. Se corta la red antes de iniciar: ¿qué artefacto local falta?

Reporta el fallo por etapa y degrada a transcript cuando sea posible.

## Measure It

Por segmento registra captureToFinalMs, translationMs, ttsMs, firstAudioMs, audioDurationMs, queueDepthMax, droppedPartials y stageErrors. Calcula real-time factor = ttsMs / audioDurationMs. En voz importa sostener el ritmo de reproducción, no solo la media de tok/s.

## Definition of Done

- [ ] Cinco segmentos traducidos y sintetizados sin red.
- [ ] Parciales actualizan UI, pero no se reproducen como frases definitivas.
- [ ] segmentId evita resultados fuera de orden.
- [ ] Fallos de traducción/TTS se reportan por etapa.
- [ ] Backpressure y queueDepthMax están documentados.
- [ ] Break It incluye predicción, observación y explicación.
- [ ] Tabla de latencias para al menos cinco segmentos.

## Checkpoint

1. ¿Por qué el relay necesita cuatro contratos?
2. ¿Cuál es la diferencia entre partial y final de ASR?
3. ¿Cuándo elegirías Bergamot frente a un LLM local?
4. ¿Qué hace segmentId ante resultados fuera de orden?
5. ¿Qué significa RTF?
6. ¿Qué política aplicarías si TTS no alcanza tiempo real?
7. ¿Qué evidencia demuestra que no hubo red?

## Takeaway

Un intérprete local confiable es un sistema de colas y contratos alrededor de modelos especializados. La experiencia en tiempo real emerge de políticas de orden, cancelación y backpressure.