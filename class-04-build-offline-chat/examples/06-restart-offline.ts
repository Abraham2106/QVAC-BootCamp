/**
 * Example 06 — Restart offline simulation
 * ========================================
 * Tras provisionar modelo, simula restart: load history + loadModel from cache.
 * Ejecuta SIN red solo si el modelo ya está provisionado (Clase 1).
 *
 * npx tsx examples/06-restart-offline.ts
 */

import {
  close,
  completion,
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  unloadModel,
  type HistoryMessage,
} from "@qvac/sdk";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const FILE = join(process.cwd(), "data", "conversation.json");

let modelId: string | undefined;

try {
  let history: HistoryMessage[] = [];
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw);
    history = parsed.messages ?? [];
    console.log("▸ Restored", history.length, "committed messages");
  } catch {
    console.log("▸ No persisted history — starting fresh");
  }

  console.log("▸ Loading model from local cache (requires prior provisioning)...");
  modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    modelConfig: { ctx_size: 2048 },
  });

  history.push({ role: "user", content: "Confirm you are running offline after restart." });

  const run = completion({
    modelId,
    history,
    stream: true,
    generationParams: { temp: 0.5, predict: 96 },
  });

  process.stdout.write("\n▸ ");
  for await (const event of run.events) {
    if (event.type === "contentDelta") process.stdout.write(event.delta);
  }

  const final = await run.final;
  console.log("\n\n▸ stopReason:", final.stopReason);
  console.log("▸ Airplane-mode test: model from cache + restored history + new completion");
} finally {
  if (modelId) await unloadModel({ modelId });
  await close();
}
