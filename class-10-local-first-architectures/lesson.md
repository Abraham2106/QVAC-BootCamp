# Clase 10 — Designing Local-First Architectures

> **Módulo 4 — Drop-in Sovereignty** · Baseline QVAC SDK v0.18.x / v0.18.1

## Pregunta esencial

> ¿Debe todo correr local? No: la arquitectura correcta hace visible qué datos, capacidades y fallos pueden cruzar una frontera.

## Resultados de aprendizaje

Al terminar puedes:

1. Definir “local-first” como política verificable, no como eslogan.
2. Dibujar fronteras de datos, ejecución y confianza.
3. Clasificar solicitudes por sensibilidad y capacidad requerida.
4. Escribir un Architecture Decision Record (ADR) defendible.
5. Diseñar fallback local/remoto con consentimiento, timeout y auditoría.
6. Separar degradación de disponibilidad de degradación de calidad.
7. Medir latencia, coste, disponibilidad y exposición de datos.
8. Probar que una política bloquea exfiltración accidental.

## Del “todo local” a una política

Local-first significa que la ruta local es la primera opción compatible con los requisitos. No significa que toda operación deba ser local: un modelo remoto podría ser necesario para una capacidad ausente, pero solo después de evaluar datos, consentimiento y riesgo.

```text
request → classify(data, capability, consent)
        → local route (preferred)
        → if unavailable: safe fallback or refuse
        → record decision + outcome (without sensitive content)
```

Hay tres fronteras que no deben confundirse:

| Frontera | Pregunta | Ejemplo de control |
|---|---|---|
| Datos | ¿Qué bytes salen del dispositivo? | red bloqueada para PII |
| Ejecución | ¿Dónde se calculan tokens? | QVAC local / endpoint compatible |
| Confianza | ¿Quién puede observar o cambiar el resultado? | allowlist, TLS, logs minimizados |

## Método ADR

Un ADR corto debe dejar auditable el razonamiento:

```text
Contexto → decisión → alternativas descartadas → invariantes
        → consecuencias → evidencia/experimento → fecha y dueño
```

Una decisión útil incluye al menos: clase de datos, capacidad, SLO, política ante fallo y cómo se verificará. “Usaremos IA local por privacidad” no es suficiente: no dice qué es privado, qué pasa si el modelo no está cargado, ni qué prueba lo demuestra.

## Matriz de enrutamiento

Clasifica antes de enrutar. Un ejemplo:

| Sensibilidad | Capacidad | Ruta por defecto | Fallback |
|---|---|---|---|
| alta (credenciales, salud) | resumen | local | rechazar |
| media | redacción | local | remoto solo con consentimiento |
| baja | modelo grande | local | remoto permitido, registrado |
| cualquiera | capacidad no instalada | instalación/local | explicar bloqueo |

El fallback no es un `catch` que envía el prompt a cualquier endpoint. Debe comprobar cuatro condiciones: autorización explícita, endpoint permitido, timeout acotado y ausencia de datos prohibidos. Si alguna falla, se rechaza de forma comprensible.

## Invariantes y degradación

Escribe invariantes antes de probar:

- **I1 — No exfiltración:** una solicitud de sensibilidad alta nunca sale.
- **I2 — Consentimiento:** la ruta remota requiere consentimiento vigente.
- **I3 — Transparencia:** la respuesta indica dónde se ejecutó.
- **I4 — Control temporal:** ningún fallback bloquea indefinidamente.
- **I5 — Reproducibilidad:** la decisión queda registrada sin guardar contenido sensible.

Distingue estados: `local-success`, `remote-consented`, `local-unavailable`, `remote-denied`, `quality-degraded`. La disponibilidad no justifica romper I1–I2.

## Qué medir

Mide por clase de solicitud, no solo un promedio global: TTFT y latencia total; tasa de éxito; porcentaje de rutas locales; fallos por timeout; coste estimado; y número de intentos remotos bloqueados. Un número sin contexto de hardware, modelo, prompt y ventana temporal no es una comparación reproducible.

## Checkpoint mental

Antes de implementar, responde: ¿qué dato jamás puede salir?, ¿qué permiso activa el fallback?, ¿cómo sabe el usuario dónde se ejecutó?, ¿qué ocurre si no hay ruta segura? Si no puedes responder, la arquitectura aún no está lista.
