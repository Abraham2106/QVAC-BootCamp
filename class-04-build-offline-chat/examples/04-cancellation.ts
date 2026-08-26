/**
 * Example 04 — Cancellation by requestId
 * ======================================
 * Cancela generación en vuelo. Output parcial NO debe commitearse.
 *
 * npx tsx examples/04-cancellation.ts
 */

import {
  cancel,
  close,
  completion,
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  unloadModel,
} from "@qvac/sdk";

let modelId: string | undefined;

try {
  modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    modelConfig: { ctx_size: 2048 },
  });

  const run = completion({
    modelId,
    history: [{ role: "user", content: "Escribe un ensayo largo sobre sistemas local-first." }],
    stream: true,
    generationParams: { temp: 0.7, predict: 512 },
  });

  console.log("▸ requestId:", run.requestId);

  let chars = 0;
  const cancelAfter = 120;

  try {
    for await (const event of run.events) {
      if (event.type === "contentDelta") {
        chars += event.delta.length;
        process.stdout.write(event.delta);
        if (chars >= cancelAfter) {
          console.log("\n\n▸ Cancelando...");
          await cancel({ requestId: run.requestId });
          break;
        }
      }
    }
    const final = await run.final;
    console.log("▸ stopReason:", final.stopReason);
  } catch (err) {
    console.log("\n▸ Cancel/error:", err instanceof Error ? err.message : err);
  }

  console.log("\n▸ Política: NO commitear output parcial tras cancelación");
} finally {
  if (modelId) await unloadModel({ modelId });
  await close();
}
