# Challenge — Diseña un relay de voz local defendible

Un equipo quiere un intérprete local para clips de 10 segundos. Su prototipo transcribe, pero a veces el audio sale acelerado y el buffer crece cuando el sintetizador tarda.

Entrega un diseño y una prueba ejecutable que:

- declare contratos PCM y valide entradas;
- compare dos estrategias de ventana;
- incluya ASR y TTS locales con correlación por turno;
- mida first-text, first-audio, total y bytes;
- implemente cancelación y backpressure;
- reproduzca un fallo de sample rate o endianess y lo diagnostique;
- explique cuándo usar Whisper o Parakeet.

No se evalúa una métrica absoluta. Se evalúa que la conclusión sea reproducible y que el sistema no oculte fallos detrás de “silencio”.

