/**
 * Example 01 — Single-turn completion
 * ====================================
 * Una completion aislada — punto de partida antes de historial multi-turno.
 *
 * npx tsx examples/01-single-turn.ts
 */

import {
  close,
  completion,
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  unloadModel,
} from "@qvac/sdk";

const PROMPT = "Responde en una frase: ¿qué es un turno de chat?";

let modelId: string | undefined;

try {
  modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    modelConfig: { ctx_size: 2048 },
  });

  const run = completion({
    modelId,
    history: [{ role: "user", content: PROMPT }],
    stream: true,
    generationParams: { temp: 0.7, predict: 64 },
  });

  process.stdout.write("\n▸ ");
  for await (const event of run.events) {
    if (event.type === "contentDelta") process.stdout.write(event.delta);
  }

  const final = await run.final;
  console.log(`\n\n▸ stopReason: ${final.stopReason}`);
} finally {
  if (modelId) await unloadModel({ modelId });
  await close();
}
