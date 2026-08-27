# Lab — Local Voice Pipeline

Duración sugerida: 90 minutos. Trabaja con un clip corto y un modelo ASR/TTS disponible localmente.

## Partes

1. **Contrato:** completa `AudioFormat` y valida PCM antes de inferir.
2. **ASR batch:** registra texto, segmentos, duración y razón terminal.
3. **ASR ventanas:** compara 1 ventana completa con ventanas de 1 s y solapamiento de 200 ms.
4. **TTS:** sintetiza la transcripción y verifica sample rate, canales y bytes.
5. **Relay:** correlaciona un turno ASR → TTS y emite eventos ordenados.
6. **Medición:** llena la tabla TTFT/TTFA/total; no compares máquinas distintas sin declararlo.
7. **Break It:** cambia sólo sample rate o endianess, predice y diagnostica.

## Tabla de evidencia

| corrida | modelo | formato entrada | first text | first audio | total | stop/error |
|---|---|---|---:|---:|---:|---|
| baseline | | | | | | |
| ventana | | | | | | |
| break-it | | | | | | |

El starter es deliberadamente pequeño: adapta los nombres de las funciones al cliente QVAC instalado y conserva el contrato de eventos. Entrega también `report.json` y una explicación de una página.

