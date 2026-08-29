# Technical Summary — Class Designing Local-First Architectures

## 1. Technical Sheet

- **Session topic:** Policies for local, hybrid and remote routes under explicit constraints.
- **Key concepts:** data boundary; execution boundary; trust boundary; request classification; consent; fallback; ADR; acceptance tests.
- **Tools / Frameworks:** QVAC local and compatible-server capabilities plus Architecture Decision Records.
- **Position in the bootcamp:** Synthesizes the earlier classes into a defensible design policy.

## 2. Synopsis

Local-first prefers local execution when it meets requirements; it is not local-only. A route is selected from request sensitivity, required capability, local resources, consent and acceptable failure behavior. The decision must be observable without logging unnecessary content.

## 3. Subtopic Breakdown

### 1. Boundaries

data movement, computation placement and trust are independent questions.

### 2. Fallback

timeout, consent and refusal turn hidden retry into policy.

### 3. ADR

context, options, decision, consequences and verification make tradeoffs reviewable.


### Extended Technical Discussion

> **Módulo 4 — Drop-in Sovereignty** · Baseline QVAC SDK v0.18.x / v0.18.1

### Pregunta esencial

> ¿Debe todo correr local? No: la arquitectura correcta hace visible qué datos, capacidades y fallos pueden cruzar una frontera.

### Resultados de aprendizaje

Al terminar puedes:

1. Definir “local-first” como política verificable, no como eslogan.
2. Dibujar fronteras de datos, ejecución y confianza.
3. Clasificar solicitudes por sensibilidad y capacidad requerida.
4. Escribir un Architecture Decision Record (ADR) defendible.
5. Diseñar fallback local/remoto con consentimiento, timeout y auditoría.
6. Separar degradación de disponibilidad de degradación de calidad.
7. Medir latencia, coste, disponibilidad y exposición de datos.
8. Probar que una política bloquea exfiltración accidental.

### Del “todo local” a una política

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

### Método ADR

Un ADR corto debe dejar auditable el razonamiento:

```text
Contexto → decisión → alternativas descartadas → invariantes
        → consecuencias → evidencia/experimento → fecha y dueño
```

Una decisión útil incluye al menos: clase de datos, capacidad, SLO, política ante fallo y cómo se verificará. “Usaremos IA local por privacidad” no es suficiente: no dice qué es privado, qué pasa si el modelo no está cargado, ni qué prueba lo demuestra.

### Matriz de enrutamiento

Clasifica antes de enrutar. Un ejemplo:

| Sensibilidad | Capacidad | Ruta por defecto | Fallback |
|---|---|---|---|
| alta (credenciales, salud) | resumen | local | rechazar |
| media | redacción | local | remoto solo con consentimiento |
| baja | modelo grande | local | remoto permitido, registrado |
| cualquiera | capacidad no instalada | instalación/local | explicar bloqueo |

El fallback no es un `catch` que envía el prompt a cualquier endpoint. Debe comprobar cuatro condiciones: autorización explícita, endpoint permitido, timeout acotado y ausencia de datos prohibidos. Si alguna falla, se rechaza de forma comprensible.

### Invariantes y degradación

Escribe invariantes antes de probar:

- **I1 — No exfiltración:** una solicitud de sensibilidad alta nunca sale.
- **I2 — Consentimiento:** la ruta remota requiere consentimiento vigente.
- **I3 — Transparencia:** la respuesta indica dónde se ejecutó.
- **I4 — Control temporal:** ningún fallback bloquea indefinidamente.
- **I5 — Reproducibilidad:** la decisión queda registrada sin guardar contenido sensible.

---

## 4. Points of Confusion and Corner Cases

- Quality degradation is different from availability degradation.
- Encryption does not decide who is allowed to receive data.
- A diagram does not prove behavior without executable tests.

## 5. Study Questions

1. Classify a sensitive request without local capacity.
2. Compare local, hybrid and remote options in an ADR.
3. What evidence proves fallback did not exfiltrate data?

## Source Material

- [Canonical lesson](../class-10-local-first-architectures/lesson.md)
- **Module:** Módulo 4
