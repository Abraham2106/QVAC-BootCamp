# Challenge — Design a Responsive Local Generation Configuration

> Sin starter. Tú defines el experimento, produces las mediciones y defiendes la configuración.

## Escenario

Estás construyendo un asistente local. Los usuarios se quejan:

> "Se siente lento."

Tienes **un** modelo cargado. Puedes cambiar generación, history, KV cache y UX de streaming — pero **no** puedes cambiar de modelo durante este reto.

## Requisitos

1. **Define qué puede significar "lento"** — TTFT alto, tok/s bajo, latencia total, percepción UX, etc.
2. **Mide baseline:**
   - TTFT observado (primer `contentDelta`);
   - throughput (`final.stats.tokensPerSecond`);
   - latencia total wall-clock;
   - `stopReason`.
3. **Formula una hipótesis** en una frase causal ("Si cambio X, predigo Y porque Z").
4. **Cambia UNA variable significativa** (mantén el resto constante).
5. **Corre comparación controlada** (misma máquina, mismo prompt base salvo que la variable sea history).
6. **Explica** si la evidencia apoya la hipótesis o la refuta.
7. **Recomienda** una configuración o el siguiente experimento.

Variables permitidas (si la API las soporta en tu versión):

- tamaño de history / contexto;
- `kvCache` (true, false, clave de sesión);
- `generationParams.predict`;
- sampling (`temp`, `top_k`, `top_p`, `seed`);
- streaming UX (mostrar primer token vs esperar `final` — mide percepción, declara que tok/s puede no cambiar).

## Restricciones

- Solo `@qvac/sdk` v0.18.x con `events` + `final`.
- Cero benchmarks fabricados: cada número respaldado por corrida.
- No extrapolar de una máquina a "QVAC en general".
- `unloadModel` + `close()` al terminar sesiones de medición.

## Acceptance Criteria

| # | Test | Pasa si... |
|---|------|-----------|
| AC1 | Predicción escrita | hipótesis registrada ANTES de la corrida modificada |
| AC2 | Variable controlada | identificas explícitamente la única variable cambiada |
| AC3 | Métricas completas | TTFT + tok/s + duración total + stopReason en baseline y modificado |
| AC4 | Conclusión honesta | distingue observación de especulación; menciona limitaciones |
| AC5 | Sin universalidad | no afirma "siempre más rápido" sin matiz de workload/dispositivo |

## Entregable

Inference Experiment Report (plantilla en prompt pack §34) + tabla:

| Cambio | Predicción | Observación | Explicación |
|---|---|---|---|
| (tu variable) | | | |

## Stretch

Diseña un harness que repite cada condición N veces y reporta min/max/media — la variación entre corridas también es evidencia.

## Defensa oral (prepárate)

1. Dos configs con el mismo tok/s pero distinto TTFT — ¿cuál recomiendas para chat interactivo y por qué?
2. ¿Cuándo activarías KV cache en producción y cuándo NO?
3. Un colega dice "subamos temp para que vaya más rápido" — ¿qué le respondes?

## Fuentes utilizadas

- `lesson.md` de esta clase
- QVAC Text Generation / API Summary v0.18.x

## Nota de frescura / versión

Baseline verificado 2026-08-25. Revalidar nombres de `generationParams` y contrato KV cache antes de entregar.
