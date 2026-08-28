# Bibliografía ampliada — Clase 08

## Translation and Voice Relay · Bergamot · cascaded speech translation

Esta bibliografía estudia traducción local y el pipeline speech-to-speech como composición de ASR, MT y TTS. Bergamot es útil para comprender traducción local/offline; la literatura de simultaneous speech translation permite analizar latency, segmentation y calidad en pipelines cascaded. La documentación de QVAC define qué motores de traducción y voice-assistant capabilities existen realmente en la versión vigente.

### QVAC — traducción y voice assistant

1. **QVAC — Translation.** Capacidad oficial de traducción local y motores/modelos soportados.  
   https://docs.qvac.tether.io/ai-capabilities/translation/

2. **QVAC — Translation NMT addon.** Detalles del backend de traducción donde aplique.  
   https://docs.qvac.tether.io/addons/translation-nmtcpp/

3. **QVAC — Voice assistant.** Composición de ASR, LLM y TTS para flujos de voz.  
   https://docs.qvac.tether.io/ai-capabilities/voice-assistant/

4. **QVAC — API Summary.** Referencia de firmas actuales de traducción/audio.  
   https://docs.qvac.tether.io/reference/api/

### Bergamot y traducción local

5. **Mozilla — Project Bergamot / local translation.** Historia y objetivos de traducción on-device en navegador.  
   https://blog.mozilla.org/en/mozilla/local-translation-add-on-project-bergamot/

6. **Bergamot Translator — repositorio oficial.** Implementación upstream del motor de traducción.  
   https://github.com/browsermt/bergamot-translator

7. **Bergamot demo / browser.mt.** Demo y contexto del proyecto.  
   https://browser.mt/

8. **Wikipedia — Project Bergamot.** Referencia secundaria para historia y enlaces; no sustituye repo/documentación primaria.  
   https://en.wikipedia.org/wiki/Project_Bergamot

9. **ONLYOFFICE — Bergamot plugin (2026).** Ejemplo contemporáneo de integración local de Bergamot en una aplicación de productividad.  
   https://www.onlyoffice.com/blog/2026/02/introducing-the-bergamot-plugin-for-onlyoffice

### Speech-to-speech translation y streaming

10. **Deepgram — Real-time speech-to-speech translation.** Explicación de arquitectura cascaded y métricas como real-time factor; fuente técnica secundaria.  
    https://deepgram.com/learn/real-time-speech-to-speech-translation

11. **Timbre-Aware LLM-based Speech-to-Speech Translation.** Trabajo reciente que contextualiza sistemas cascaded y enfoques speech-to-speech.  
    https://arxiv.org/pdf/2601.16023

12. **Google Research — Real-time speech-to-speech translation.** Fuente primaria de investigación industrial sobre S2ST.  
    https://research.google/blog/real-time-speech-to-speech-translation/

13. **MT Beam Search in Cascaded Streaming Speech Translation.** Trabajo sobre búsqueda y latency/quality tradeoffs en cascaded streaming translation.  
    https://arxiv.org/pdf/2407.11010

14. **Automatic simultaneous speech translation overview.** Fuente de navegación secundaria para el campo.  
    https://www.emergentmind.com/topics/automatic-simultaneous-speech-translation

15. **Forasoft — real-time speech translation.** Walkthrough de arquitectura práctica; usar como lectura secundaria.  
    https://www.forasoft.com/learn/real-time-speech-translation-live-video

16. **Benchmarking Speech-to-Speech Translation Models (2026).** Evaluación comparativa reciente de sistemas S2ST.  
    https://arxiv.org/pdf/2606.03241

## Orden de lectura recomendado

El estudiante debería entender primero que voice relay no es una única “función de traducción”: audio entrante debe segmentarse/transcribirse, el texto debe traducirse y el resultado debe sintetizarse. Bergamot entra como caso de MT local. Después los papers de streaming muestran por qué esperar una oración completa puede mejorar contexto y empeorar latency, mientras traducir demasiado pronto puede aumentar errores o revisiones.