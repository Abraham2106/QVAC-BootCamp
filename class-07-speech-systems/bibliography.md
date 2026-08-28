# Bibliografía ampliada — Clase 07

## Speech Systems · ASR · TTS · VAD · PCM

Esta bibliografía separa reconocimiento de voz, actividad de voz y síntesis. Whisper y Parakeet representan familias distintas de ASR; VAD resuelve un problema previo —detectar regiones con habla— y PCM define parte de la interfaz física de audio. La documentación de QVAC debe usarse para saber qué backends y formatos soporta hoy el SDK; los repositorios y papers externos explican los modelos y técnicas.

### QVAC — capacidades de voz

1. **QVAC — Transcription.** Superficie oficial de ASR y modelos soportados, incluidos Whisper y Parakeet donde corresponda.  
   https://docs.qvac.tether.io/ai-capabilities/transcription/

2. **QVAC — Text to speech.** Capacidad oficial de TTS, modelos/familias soportadas y lifecycle.  
   https://docs.qvac.tether.io/ai-capabilities/text-to-speech/

3. **QVAC — TTS addon.** Referencia técnica adicional para el backend de síntesis cuando aplique.  
   https://docs.qvac.tether.io/addons/tts-ggml/

4. **QVAC — API Summary.** Firmas actuales de ASR/TTS y tipos públicos.  
   https://docs.qvac.tether.io/reference/api/

### Whisper

5. **OpenAI — Whisper announcement.** Introducción oficial al modelo y al enfoque de robust speech recognition con large-scale weak supervision.  
   https://openai.com/index/whisper/

6. **OpenAI Whisper — repositorio oficial.** Código, modelos y usage reference upstream.  
   https://github.com/openai/whisper

7. **Whisper large-v3 — Hugging Face model card.** Configuración/model card para una variante moderna de Whisper.  
   https://huggingface.co/openai/whisper-large-v3

8. **Review de Whisper.** Lectura secundaria del paper y su arquitectura; usar repo/paper como autoridad primaria.  
   https://sh-tsang.medium.com/review-openai-whisper-robust-speech-recognition-via-large-scale-weak-supervision-f7b9bb646356

### Parakeet / NVIDIA ASR

9. **NVIDIA NeMo — ASR models.** Documentación oficial sobre familias FastConformer/Parakeet y modelos ASR.  
   https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/models.html

10. **NVIDIA Riva — ASR model reference.** Referencia oficial de modelos desplegados dentro de Riva.  
    https://docs.nvidia.com/deeplearning/riva/user-guide/docs/reference/models/asr.html

11. **Parakeet TDT 0.6B v2 — model card.** Información del modelo, arquitectura y uso previsto.  
    https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2

12. **Parakeet TDT 1.1B — model card.** Variante de mayor escala para comparar tradeoffs.  
    https://huggingface.co/nvidia/parakeet-tdt-1.1b

13. **On-device streaming ASR (2026).** Trabajo reciente sobre límites de ASR streaming on-device y modelos Parakeet/Nemotron Speech.  
    https://arxiv.org/pdf/2604.14493

14. **AWS — Hosting NVIDIA speech NIM models.** Fuente de deployment cloud como contraste; no es necesaria para el camino local de la clase.  
    https://aws.amazon.com/blogs/machine-learning/hosting-nvidia-speech-nim-models-on-amazon-sagemaker-ai-parakeet-asr/

### VAD y audio PCM

15. **WebRTC VAD — Python bindings.** Implementación popular que hace explícitos requisitos como PCM mono de 16 bits y sample rates soportados.  
    https://github.com/wiseman/py-webrtcvad

16. **Android VAD.** Implementaciones/alternativas prácticas para dispositivos Android.  
    https://github.com/gkonovalov/android-vad

17. **SpeechBrain — Voice Activity Detection tutorial.** Introducción práctica a pipelines de VAD.  
    https://speechbrain.readthedocs.io/en/latest/tutorials/tasks/voice-activity-detection.html

18. **The Gradient — VAD overview.** Lectura conceptual sobre detectores de voz modernos.  
    https://thegradient.pub/one-voice-detector-to-rule-them-all/

19. **Picovoice — Complete guide to VAD.** Guía práctica secundaria para parámetros y real-time pipelines.  
    https://picovoice.ai/blog/complete-guide-voice-activity-detection-vad/

## Orden de lectura recomendado

Para la clase conviene empezar por la física del audio: sample rate, channels, PCM frames y buffering. Después VAD responde a la pregunta de cuándo merece la pena enviar audio al ASR. Whisper/Parakeet entran solo entonces. La documentación QVAC se utiliza al final para mapear esa arquitectura conceptual a los modelos y APIs que el runtime soporta realmente.