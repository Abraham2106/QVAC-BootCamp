/**
 * Example 02 — Multi-turn with explicit history
 * =============================================
 * La app debe pasar historial — el modelo no recuerda entre llamadas aisladas.
 *
 * npx tsx examples/02-multi-turn.ts
 */

import {
  close,
  completion,
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  unloadModel,
  type HistoryMessage,
} from "@qvac/sdk";

let modelId: string | undefined;

try {
  modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    modelConfig: { ctx_size: 2048 },
  });

  const history: HistoryMessage[] = [
    { role: "user", content: "My favorite color for this test is orange." },
  ];

  const run1 = completion({
    modelId,
    history,
    stream: false,
    generationParams: { temp: 0.3, predict: 64 },
  });
  const final1 = await run1.final;
  history.push({ role: "assistant", content: final1.contentText });
  console.log("▸ Turn 1 assistant:", final1.contentText.slice(0, 80));

  history.push({ role: "user", content: "What color did I tell you?" });

  const run2 = completion({
    modelId,
    history,
    stream: false,
    generationParams: { temp: 0.3, predict: 64 },
  });
  const final2 = await run2.final;
  console.log("▸ Turn 2 assistant:", final2.contentText);
  console.log("\n▸ History length:", history.length, "messages");
} finally {
  if (modelId) await unloadModel({ modelId });
  await close();
}
