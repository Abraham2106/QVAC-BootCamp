# Challenge — ADR para un asistente de campo

Diseña la arquitectura de un asistente que resume notas de técnicos sin conexión estable, traduce instrucciones y permite mejorar calidad con un endpoint remoto opcional.

Entrega: ADR, matriz de datos/capacidades, política ejecutable, cinco pruebas de fallo, métricas y defensa de tres minutos. Debes demostrar que secretos y datos personales nunca cruzan la frontera sin una política explícita.

Restricciones: el fallback no puede ser silencioso; el timeout debe ser finito; el log no puede contener prompts completos; y una ruta rechazada debe devolver una alternativa accionable.
