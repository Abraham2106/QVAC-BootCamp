# Instructor Guide — Clase 9

## Objetivo

Que el alumno vea `baseURL` como frontera arquitectónica: el mismo cliente puede hablar con QVAC local, pero debe verificar modelo, capacidades, seguridad y rendimiento.

## Timing (180 min)

| Bloque | Min |
|---|---:|
| Hook: cambiar URL | 10 |
| Contrato normal + SSE | 25 |
| Demo smoke/stream | 20 |
| Lab guiado | 40 |
| Break It + diagnóstico | 25 |
| Medición/offline | 20 |
| Challenge + ADR | 30 |
| Checkpoint | 10 |

## Preguntas clave

- ¿Qué parte de la aplicación cambió al editar solo `baseURL`?
- ¿Qué sigue siendo una dependencia aunque sea localhost?
- ¿Qué dato probarías antes de permitir fallback cloud?

## Fallos frecuentes

- `/v1/v1`: normalizar URL una vez.
- Modelo cloud inexistente: consultar `/v1/models`.
- Leer SSE con `response.json()`: usar `TextDecoderStream` y sentinel.
- Confundir servidor activo con offline: cortar red y repetir.
- Fallback automático con contenido privado: detener y requerir opt-in.

## Cierre

Conectar un cliente conocido no elimina la necesidad de medir ni de razonar sobre colocación. La siguiente clase convierte esta ruta local en una arquitectura con fronteras de privacidad, fallbacks y ADRs.
