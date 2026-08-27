# Lab — Drop-in Local Client

Duración: 75–90 min. Construirás un cliente que puede alternar entre un endpoint local y uno remoto mediante variables de entorno, con streaming, métricas y política de fallback segura.

## Preparación

```bash
mkdir local-client && cd local-client
npm init -y && npm pkg set type=module
npm i -D tsx typescript @types/node
```

## Partes

1. **Predict:** anota qué pasa con servidor detenido, modelo incorrecto y `/v1` duplicado.
2. **Modify:** completa `starter/client-starter.ts` usando `fetch`; no pongas una clave real en el archivo.
3. **Run:** ejecuta normal y `--stream`; guarda respuestas sanitizadas.
4. **Break It:** cambia solo una variable por intento y clasifica el fallo (URL, contrato, modelo o recurso).
5. **Measure:** calcula TTFT, duración, bytes y estado HTTP.
6. **Offline proof:** desconecta red sin detener QVAC; repite. Después detén QVAC y compara el diagnóstico.
7. **Extend:** agrega `--json` y un ADR con capacidades verificadas.

Entregable: `predictions.md`, script final, mediciones, evidencia offline, diagnóstico de cuatro fallos y `ADR-009.md`.
