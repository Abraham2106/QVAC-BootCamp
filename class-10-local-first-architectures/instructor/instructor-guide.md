# Guía docente

## Flujo sugerido (90 min)

10 min pregunta y predicciones; 15 min fronteras y ADR; 25 min clasificador; 20 min fallback; 10 min Break It; 10 min defensas.

## Fallos deliberados

Pide quitar el chequeo de sensibilidad, eliminar consentimiento o usar un timeout infinito. El objetivo es que el grupo observe cómo una “mejora de disponibilidad” rompe un invariante. También cambia el endpoint por uno no allowlisted y verifica que la solicitud se rechace.

## Preguntas de facilitación

- ¿Qué exactamente se protege: contenido, metadatos o ambos?
- ¿Quién autoriza el fallback y cuánto dura ese permiso?
- ¿Cómo probarías una afirmación de “no salió nada”?
- ¿Qué dato mínimo puedes registrar para depurar sin copiar el prompt?

No presentes el fallback remoto como solución automática. Enfatiza que una negativa segura y explicable forma parte del producto.
