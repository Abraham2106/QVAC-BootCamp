# Challenge — Offline Chat v1

> Sin starter paso a paso. Implementa desde requisitos y defiende tus decisiones de estado.

## Escenario

Construye un asistente CLI local que siga siendo útil cuando se elimina el acceso a red **después** de haber provisionado el modelo.

## Requisitos

1. Un modelo cargado y reutilizado entre turnos.
2. Historial multi-turno soportado.
3. Output streamed incrementalmente.
4. Una request activa puede cancelarse.
5. Output parcial cancelado no se convierte silenciosamente en turno completo comprometido.
6. Conversación comprometida almacenada localmente.
7. Conversación restaurada tras restart.
8. Métricas por turno visibles.
9. Recursos descargados en exit controlado.
10. Airplane-mode restart test pasa tras provisioning.

## Restricciones

- TypeScript CLI con `@qvac/sdk` v0.18.x
- Superficie canónica `events` + `final`
- Sin inferencia en la nube
- Sin framework frontend
- Persistencia JSON local (schema versionado)

## Acceptance Criteria

| # | Test | Pasa si... |
|---|------|-----------|
| AC1 | Multi-turn | pregunta de follow-up usa historial previo |
| AC2 | Streaming | `contentDelta` visible antes de `final` |
| AC3 | Cancel | `/cancel` detiene sin crash; política de commit documentada |
| AC4 | Persist | exit + restart restaura transcript |
| AC5 | Offline | sin red, carga modelo local + nueva completion |
| AC6 | Metrics | TTFT + duración + stopReason por turno |
| AC7 | Shutdown | `unloadModel` + `close()` en exit limpio |

## Entregable

Offline Chat v1 + breve **State Policy Note** (1 párrafo): cuándo commiteas un turno del asistente y qué haces con output cancelado.

## Stretch

- Comando `/new` sin descargar modelo
- KV cache con clave de sesión estable
- Manejo de JSON corrupto con recovery UX

## Defensa oral (3 min)

Responde: "¿Qué estado pertenece a QVAC y qué estado pertenece a tu aplicación?"
