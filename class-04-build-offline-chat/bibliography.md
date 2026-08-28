# Bibliografía ampliada — Clase 04

## Build the Offline Chat · state · streaming · cancellation · persistence

La bibliografía de esta clase se concentra menos en modelos y más en application lifecycle. La documentación de QVAC define los contratos de logging, cancellation y runtime lifecycle; Ink & Switch aporta el marco para tratar el transcript como data durable bajo control del usuario. Las decisiones sobre atomic writes, schema evolution y restore pertenecen a la aplicación y deben evaluarse con las garantías reales del storage elegido.

### QVAC — runtime y request lifecycle

1. **QVAC — Logging.** `subscribeServerLogs()`, `loggingStream()` y logging de aplicación/runtime.  
   https://docs.qvac.tether.io/runtime/logging/

2. **QVAC — Cancellation.** `requestId`, `cancel({ requestId })`, `InferenceCancelledError`, partial turns y caveats de cancelación.  
   https://docs.qvac.tether.io/runtime/cancellation/

3. **QVAC — Runtime lifecycle.** `suspend()`, `resume()`, `state()` y comportamiento de operaciones mientras el runtime está suspendido.  
   https://docs.qvac.tether.io/runtime/lifecycle/

4. **QVAC — Text generation.** Event stream, `completionDone`, `stopReason`, `final` y `kvCache`.  
   https://docs.qvac.tether.io/ai-capabilities/text-generation/

5. **QVAC — API Summary.** Referencia vigente de firmas públicas usadas por la app.  
   https://docs.qvac.tether.io/reference/api/

### Local-first y persistencia

6. **Kleppmann et al. / Ink & Switch — _Local-first software_.** Referencia central para ownership, network optional, longevity y durable local data.  
   https://www.inkandswitch.com/essay/local-first/

7. **Paper completo de _Local-first software_.** Versión PDF para lectura académica.  
   https://www.inkandswitch.com/local-first/static/local-first.pdf

8. **Wikipedia — Local-first software.** Mapa secundario de conceptos y enlaces; no sustituye la fuente original.  
   https://en.wikipedia.org/wiki/Local-first_software

## Cómo usar estas fuentes en la clase

La documentación QVAC debe leerse como contrato de runtime: qué ocurre al cancelar, qué eventos llegan y qué puede continuar durante suspend. Ink & Switch responde otra pregunta: qué estado debe pertenecer y sobrevivir al usuario. La arquitectura del chat aparece al juntar ambos niveles. El SDK puede producir una respuesta y comunicar su terminal state; la aplicación decide cuándo ese output provisional se convierte en conversation state durable y cómo sobrevivirá a un restart offline.