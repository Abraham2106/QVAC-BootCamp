# Solución de referencia

La ADR recomienda local-first estricto: notas con PII y secretos son local-only; traducción y redacción de contenido público pueden usar un endpoint allowlisted únicamente con consentimiento. El cliente registra `route`, `reason`, modelo y métricas, nunca el prompt.

La política evalúa en orden: local disponible → usar local; sensibilidad alta → rechazar; consentimiento → exigir; endpoint allowlisted → exigir; timeout → rechazar; solo entonces usar remoto. Este orden hace que la disponibilidad no pueda vencer una restricción de privacidad.

Pruebas mínimas: alta sensibilidad con local caído (refuse), media sin consentimiento (refuse), baja con consentimiento (remote), endpoint desconocido (refuse), timeout (refuse). Cambiaría la decisión evidencia de que el modelo local no cumple el SLO o una nueva obligación regulatoria, documentada en otra ADR.
