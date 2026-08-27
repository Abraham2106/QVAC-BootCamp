# Lab — Architecture Decision Record + Safe Fallback

Duración sugerida: 75–90 min. Trabaja con una app pequeña de la Clase 9 o con los ejemplos de esta carpeta.

## Parte 1 — Predice

Antes de ejecutar, escribe qué ocurrirá si: (P1) el modelo local está descargado pero no cargado; (P2) una solicitud médica encuentra el runtime local caído; (P3) el usuario no dio consentimiento remoto; (P4) el endpoint remoto tarda más que el timeout.

## Parte 2 — Clasifica

Amplía `01-privacy-classifier.ts` para clasificar al menos seis solicitudes en sensibilidad alta/media/baja y justificar la decisión sin imprimir el contenido.

## Parte 3 — ADR

Escribe `ADR-001-local-first.md` con contexto, decisión, alternativas, invariantes, consecuencias, métricas, fecha y dueño. Incluye un diagrama de las fronteras de datos, ejecución y confianza.

## Parte 4 — Fallback

Ejecuta `02-fallback-policy.ts`. Añade una simulación de timeout y una solicitud de alta sensibilidad. La salida esperada es: fallback remoto solo cuando hay consentimiento y nunca para datos prohibidos.

## Parte 5 — Break It

Fuerza cada condición: runtime local no disponible, consentimiento revocado, endpoint no permitido y timeout. Para cada caso registra ruta, motivo, datos expuestos (debe ser cero para alta sensibilidad) y mensaje al usuario.

## Parte 6 — Medición y defensa

Entrega una tabla con p50/p95 de latencia, éxito local, fallos de fallback y decisiones bloqueadas. Defiende la ADR en tres minutos: qué proteges, qué sacrificas y qué evidencia cambiaría tu decisión.
