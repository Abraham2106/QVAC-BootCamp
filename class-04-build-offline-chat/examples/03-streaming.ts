/**
 * Example 03 — Streaming render (provisional buffer)
 * ==================================================
 * contentDelta → buffer de pantalla. Aún NO es historial comprometido.
 *
 * npx tsx examples/03-streaming.ts
 */

import {
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
    history: [{ role: "user", content: "Explica en 3 frases qué es un commit boundary." }],
    stream: true,
    generationParams: { temp: 0.7, predict: 128 },
  });

  let provisional = "";
  const t0 = performance.now();
  let ttft: number | null = null;

  process.stdout.write("\n▸ [provisional] ");
  for await (const event of run.events) {
    if (event.type === "contentDelta") {
      if (ttft === null) ttft = performance.now() - t0;
      provisional += event.delta;
      process.stdout.write(event.delta);
    }
  }

  const final = await run.final;
  console.log("\n\n▸ Provisional length:", provisional.length);
  console.log("▸ Final contentText length:", final.contentText.length);
  console.log("▸ TTFT (wall-clock):", ttft?.toFixed(0), "ms");
  console.log("▸ stopReason:", final.stopReason);
  console.log("\n▸ Commit solo tras final — provisional ≠ committed history");
} finally {
  if (modelId) await unloadModel({ modelId });
  await close();
}
