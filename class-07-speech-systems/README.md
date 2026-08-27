# Clase 7 — Speech Systems: ASR and TTS

Módulo 3 · Beyond Text · QVAC SDK v0.18.x

Construye un relay de voz local: captura PCM, transcribe con Whisper/Parakeet y sintetiza la respuesta con TTS. El objetivo no es una demo que reproduce un archivo, sino una tubería observable, cancelable y privada.

## Ruta

1. Leer [`lesson.md`](lesson.md).
2. Ejecutar los ejemplos 01–05 con un modelo de audio provisionado.
3. Completar [`lab/README.md`](lab/README.md) y su starter.
4. Resolver [`challenge/challenge.md`](challenge/challenge.md).
5. Entregar el reporte y responder [`assessment/checkpoint.md`](assessment/checkpoint.md).

## Definition of Done

- [ ] PCM con sample rate, canales, formato y duración documentados.
- [ ] ASR produce texto y segmentos/timestamps sin enviar audio a la nube.
- [ ] TTS produce audio reproducible con formato declarado.
- [ ] Relay ASR → texto → TTS conserva correlación por turno.
- [ ] Backpressure y cancelación se observan en una prueba controlada.
- [ ] Se miden latencia de primer texto, primer audio y duración total.
- [ ] Break It diagnosticado: audio truncado o sample rate incompatible.

