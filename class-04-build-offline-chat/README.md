# Clase 4 — Build the Offline Chat

> **The Local-First AI Systems Masterclass** · Módulo 1 — Your First Local Token
> **Baseline técnico:** QVAC SDK v0.18.x / v0.18.1, verificado contra la documentación oficial y npm el 2026-08-26. Revisa las release notes antes de impartir esta clase.

---

## Pregunta esencial

> **¿Cómo convertimos la inferencia local en una aplicación de conversación confiable que preserve estado, maneje interrupciones y siga funcionando tras reinicio sin la nube?**

En la Clase 3 observaste el motor de inferencia. Hoy construyes la **aplicación alrededor del motor**: historial multi-turno, streaming con frontera de commit, cancelación, persistencia local y verificación offline tras restart.

---

## Resultados de aprendizaje

Al terminar esta clase puedes:

1. **Distinguir** estado de inferencia de estado de aplicación.
2. **Representar** una conversación multi-turno como historial ordenado de mensajes.
3. **Construir** un bucle de chat event-driven con la superficie canónica `events` + `final`.
4. **Commitear** la salida del asistente solo tras un estado terminal válido.
5. **Cancelar** una completion en vuelo usando su `requestId`.
6. **Manejar** cancelación por separado de errores inesperados.
7. **Persistir** historial comprometido localmente en un formato propio de la app.
8. **Restaurar** una conversación previa tras reinicio del proceso.
9. **Reutilizar** un modelo cargado a través de múltiples turnos.
10. **Aplicar** KV cache donde el runtime actual lo soporte.
11. **Exponer** métricas por turno (TTFT, duración, tok/s, stopReason).
12. **Cerrar** recursos de modelo/runtime limpiamente.
13. **Verificar** que el chat provisionado funciona en modo avión tras restart.
14. **Diagnosticar** al menos un fallo de consistencia de estado.
15. **Defender** una política de persistencia (cuándo commitear un turno).

---

## Prerrequisitos

Debes poder ya:

- Ejecutar `completion()` con streaming (`events` + `final`).
- Interpretar `contentDelta`, `completionDone`, `stopReason`.
- Cargar, reutilizar y descargar un modelo.

```bash
mkdir offline-chat && cd offline-chat
npm init -y && npm pkg set type=module
npm i @qvac/sdk && npm i -D tsx
```

## Antes de clase

Verifica:

- [ ] Modelo ligero provisionado (`LLAMA_3_2_1B_INST_Q4_0` o `QWEN3_600M_INST_Q4`)
- [ ] `examples/01–06` corridos al menos una vez
- [ ] Directorio de datos de clase disponible (`app/data/`)

## Mapa de la clase

```text
completion aislada
  → historial multi-turno
  → streaming + frontera de commit
  → cancelación por requestId
  → persistencia JSON local
  → restart + restore
  → verificación modo avión
  → Offline Chat v1
```

| Momento | Artefacto |
|---|---|
| Concepto | [`lesson.md`](lesson.md) — tres ciclos de vida y ownership de estado |
| Build guiado | [`app/`](app/) — referencia CLI modular + lab README |
| Ejemplos ejecutables | [`examples/01–06`](examples/) |
| Reto independiente | [`challenge/challenge.md`](challenge/challenge.md) |
| Evaluación | [`assessment/checkpoint.md`](assessment/checkpoint.md) |

## Entregable

**Offline Chat v1** que pasa los siete acceptance tests (A–G):

- multi-turn state · streaming · cancellation · persistence · offline restart · metrics · clean shutdown

## Definition of Done

- [ ] Multi-turn: el modelo responde usando historial de turnos previos
- [ ] Streaming: salida visible incrementalmente vía `contentDelta`
- [ ] Cancelación: `/cancel` detiene generación sin commitear turno parcial
- [ ] Persistencia: transcript restaurado tras exit + restart
- [ ] Modo avión: nueva respuesta tras restart sin red (modelo ya provisionado)
- [ ] Métricas por turno registradas (TTFT, duración, tok/s, stopReason)
- [ ] Break It diagnosticado: cancelación entre stream y commit

## Después de clase

NotebookLM con fuentes enfocadas: Audio Overview → flashcards → quiz
(prompts en [`notebooklm/`](notebooklm/)).

## Fuentes autoritativas de la clase

- https://docs.qvac.tether.io/ai-capabilities/text-generation/
- https://docs.qvac.tether.io/reference/api/
- https://docs.qvac.tether.io/about/how-it-works/
- https://docs.qvac.tether.io/reference/release-notes/
