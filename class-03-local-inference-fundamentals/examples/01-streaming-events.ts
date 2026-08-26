/**
 * Example 01 — Streaming con events/final (superficie canónica)
 * ==============================================================
 *
 * PROPÓSITO
 *   Enseñar el contrato actual de QVAC: `CompletionRun` con `events` +
 *   `final`. Preferir esta superficie sobre `tokenStream`/`text` (legacy).
 *
 * ENTRADA ESPERADA
 *   Modelo ligero ya provisionado (caché válida).
 *
 * SALIDA ESPERADA
 *   Texto streamed + TTFT observado (wall-clock) + stats del runtime +
 *   stopReason. Los números son DE TU MÁQUINA.
 *
 * QUÉ OBSERVAR
 *   - El primer `contentDelta` llega DESPUÉS de tokenización + prompt eval.
 *   - `completionStats` puede aparecer durante o al final del stream.
 *   - `completionDone` cierra el stream; `final` agrega contentText/stats.
 *   - TTFT medido aquí ≠ necesariamente el TTFT interno del profiler.
 *
 * CÓMO EJECUTAR
 *   npx tsx examples/01-streaming-events.ts
 *
 * LIMPIEZA
 *   unloadModel + close en finally.
 */

import {
  close,
  completion,
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  unloadModel,
  type CompletionEvent,
} from "@qvac/sdk";

const PROMPT =
  "Explica en tres frases qué es la generación autoregresiva en un LLM.";

let modelId: string | undefined;

function labelOther(event: CompletionEvent): void {
  if (
    event.type === "thinkingDelta" ||
    event.type === "toolCall" ||
    event.type === "toolError" ||
    event.type === "rawDelta"
  ) {
    console.log(`\n▸ [evento: ${event.type}]`);
  }
}

try {
  console.log("▸ Cargando modelo...");
  modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    modelConfig: { ctx_size: 2048 },
  });

  const run = completion({
    modelId,
    history: [{ role: "user", content: PROMPT }],
    stream: true,
    generationParams: { temp: 0.7, seed: 42, predict: 128 },
  });

  const requestStart = performance.now();
  let firstContentMs: number | null = null;
  let contentDeltaCount = 0;
  let sawCompletionStats = false;
  let sawCompletionDone = false;

  console.log("\n▸ Stream de eventos:\n");

  for await (const event of run.events) {
    switch (event.type) {
      case "contentDelta":
        contentDeltaCount++;
        if (firstContentMs === null) {
          firstContentMs = performance.now() - requestStart;
          console.log(
            `\n▸ Primer contentDelta a ${(firstContentMs / 1000).toFixed(3)} s (TTFT observado)\n`
          );
        }
        process.stdout.write(event.text);
        break;
      case "completionStats":
        sawCompletionStats = true;
        console.log(
          `\n▸ completionStats: ${event.stats.tokensPerSecond?.toFixed(1) ?? "n/a"} tok/s`
        );
        break;
      case "completionDone":
        sawCompletionDone = true;
        console.log(`\n▸ completionDone (stopReason stream: ${event.stopReason ?? "n/a"})`);
        break;
      default:
        labelOther(event);
    }
  }

  const final = await run.final;
  const totalMs = performance.now() - requestStart;

  console.log("\n\n▸ Resultado agregado (final):");
  console.log(`   contentText (${final.contentText.length} chars): ${final.contentText.slice(0, 120)}…`);
  console.log(`   stopReason: ${final.stopReason ?? "n/a"}`);
  if (final.stats?.tokensPerSecond) {
    console.log(`   stats.tokensPerSecond: ${final.stats.tokensPerSecond.toFixed(1)} tok/s`);
  }

  console.log("\n▸ Mediciones wall-clock (aplicación):");
  console.table({
    "TTFT observado (s)": {
      valor: firstContentMs === null ? "n/a" : (firstContentMs / 1000).toFixed(3),
    },
    "duración total (s)": { valor: (totalMs / 1000).toFixed(3) },
    "eventos contentDelta": { valor: String(contentDeltaCount) },
    "vió completionStats": { valor: sawCompletionStats ? "sí" : "no" },
    "vió completionDone": { valor: sawCompletionDone ? "sí" : "no" },
  });

  console.log(`
▸ Qué observar
  - Antes del primer contentDelta: tokenización + evaluación del prompt.
  - Streaming NO acelera el modelo; expone progreso incremental al cliente.
  - stats del runtime y wall-clock miden cosas relacionadas pero no idénticas.
`);
} catch (error) {
  console.error("✖", error);
  process.exit(1);
} finally {
  if (modelId) {
    try {
      await unloadModel({ modelId, clearStorage: false });
    } catch (cleanupError) {
      console.error("✖ Fallo durante limpieza:", cleanupError);
    }
  }
  void close();
}
