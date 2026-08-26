/**
 * Example 05 — Profiler de QVAC
 * =============================
 *
 * PROPÓSITO
 *   Instrumentación a nivel de operación con el profiler del SDK.
 *   Distinguir stats de completion vs profiler vs gauges de recursos.
 *
 * NOTAS
 *   - El profiler es process-wide; añade overhead diagnóstico.
 *   - includeResourceGauges es opt-in; métricas no soportadas quedan explícitas.
 *   - exportSummary/exportTable/exportJSON son evidencia diagnóstica, no benchmark universal.
 *
 * CÓMO EJECUTAR
 *   npx tsx examples/05-profiler.ts
 */

import {
  close,
  completion,
  loadModel,
  profiler,
  QWEN3_600M_INST_Q4,
  unloadModel,
} from "@qvac/sdk";

let modelId: string | undefined;

try {
  profiler.clear();
  profiler.enable({
    mode: "verbose",
    includeServerBreakdown: true,
    includeResourceGauges: true,
    operationFilters: ["completion"],
  });

  console.log("▸ Profiler habilitado:", profiler.isEnabled());
  console.log("▸ Config:", JSON.stringify(profiler.getConfig(), null, 2));

  modelId = await loadModel({
    modelSrc: QWEN3_600M_INST_Q4,
    modelConfig: { ctx_size: 2048 },
  });

  const run = completion({
    modelId,
    history: [
      {
        role: "user",
        content: "Resume en una frase qué mide el profiler de QVAC.",
      },
    ],
    stream: true,
    generationParams: { temp: 0, seed: 42, predict: 64 },
  });

  for await (const event of run.events) {
    if (event.type === "contentDelta") process.stdout.write(event.text);
    if (event.type === "completionStats") {
      console.log(
        `\n▸ completionStats (runtime): ${event.stats.tokensPerSecond?.toFixed(1) ?? "n/a"} tok/s`
      );
    }
  }

  const final = await run.final;
  console.log(`\n\n▸ final.stopReason: ${final.stopReason ?? "n/a"}`);

  console.log("\n▸ profiler.exportSummary():");
  console.log(profiler.exportSummary());

  console.log("\n▸ profiler.exportTable():");
  console.log(profiler.exportTable());

  const exported = profiler.exportJSON({ includeRecentEvents: true });
  console.log("\n▸ profiler.exportJSON() — claves top-level:");
  console.log(Object.keys(exported));
  console.log("   operaciones agregadas:", Object.keys(exported.aggregates).join(", ") || "(ninguna)");

  profiler.disable();
  profiler.clear();
  console.log("\n▸ Profiler deshabilitado y limpiado.");
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
