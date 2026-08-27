# Solution notes (instructor)

Una solución sólida normaliza a PCM s16le mono a 16 kHz para ASR cuando el backend lo requiere, conserva timestamps de segmentos y etiqueta cada evento con `turnId`. El relay limita el número de chunks pendientes y cancela ambas operaciones al abortar un turno.

El fallo de audio acelerado suele indicar que el consumidor interpreta muestras a otro sample rate; el diagnóstico debe comparar el header/contrato con la configuración del reproductor. Un WER peor con ventanas sin solapamiento apunta a pérdida de contexto en fronteras, no necesariamente a un modelo “peor”.

