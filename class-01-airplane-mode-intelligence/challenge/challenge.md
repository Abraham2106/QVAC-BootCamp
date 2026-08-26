# Challenge — Provisioner de Campo con Verificación Offline

> Sin andamiaje: aquí no hay starter ni pasos de implementación. Tú diseñas, construyes y defiendes.

## Escenario

Una ONG despliega laptops de campo para registrar entrevistas en zonas sin conectividad. Antes de cada salida, el equipo pasa por una oficina con red. Necesitan una herramienta CLI `field-provision` que garantice que la laptop queda lista para generar texto offline, y un modo de verificación que pueda ejecutarse en campo para probarlo.

## Requisitos

1. **Modo provision** (`provision`): descarga y valida el asset de catálogo elegido, mostrando progreso y reanudando si se interrumpe.
2. **Modo verify** (`verify --offline`): ejecuta el ciclo completo de inferencia local y falla con exit code ≠ 0 nombrando la fase exacta (red/carga/inferencia) si algo falla.
3. **Reporte**: al terminar cualquier modo, imprime un resumen con las métricas de la clase (descarga sí/no, bytes, load time, TTFT, tok/s).
4. **Clasificación de dependencias**: el reporte debe listar qué operaciones de la tool son locales y cuáles requieren red, con una línea de justificación por cada una.

## Restricciones

- Solo APIs documentadas de `@qvac/sdk` v0.18.x — cero llamadas HTTP propias.
- El modo `verify --offline` no puede intentar ninguna descarga (debe detectar caché ausente ANTES de intentar cargar).
- Limpieza completa del ciclo de vida en todos los caminos, incluidos los de error.
- Debe correr en Node ≥ 18 sin frameworks de UI.

## Acceptance Tests

| # | Test | Pasa si... |
|---|------|-----------|
| AT1 | `provision` con red | termina con asset validado y progreso visible |
| AT2 | `verify --offline` tras AT1, sin red | genera texto e imprime métricas |
| AT3 | `verify --offline` sin caché previa | exit ≠ 0, mensaje nombra "fase: caché/provisión" |
| AT4 | `provision` interrumpido a mitad (Ctrl+C) y re-ejecutado | retoma desde el parcial, sin empezar de cero |
| AT5 | Cualquier fallo | el proceso limpia recursos y sale con código significativo |

## Required Measurements

TTFT y tok/s en cada `verify`, más bytes/tiempo cuando hubo descarga. Dos corridas mínimo (fría y tibia).

## Required Explanation / Defense

Prepárate para defender oralmente:

1. ¿Por qué tu `verify` nunca toca la red? Muéstralo en el código.
2. ¿Qué valida QVAC antes de cargar desde caché y por qué eso permite confiar en una copia local?
3. ¿Qué romperías tú primero para probar esta herramienta, y qué mensaje esperarías?

## Stretch Goals

- Soportar dos constantes de catálogo y comparar sus métricas de carga.
- Modo `audit`: lee un directorio de caché y reporta qué assets están completos según tamaño/checksum expuestos por el SDK.
- Exportar el resumen de métricas como JSON estable para CI.
