/**
 * Offline Chat v1 — starter entry point
 * Complete TODOs in src/ modules. Run: npx tsx src/index.ts
 */
import { cancel, loadModel, LLAMA_3_2_1B_INST_Q4_0 } from "@qvac/sdk";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { runChatTurn, getActiveRequestId } from "./chat.js";
import { loadHistory, saveHistory } from "./persistence.js";
import { bindShutdownSignals } from "./shutdown.js";

let modelId: string | undefined;
let history = await loadHistory();

try {
  console.log("▸ Loading model (requires prior provisioning)...");
  modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    modelConfig: { ctx_size: 4096 },
  });

  bindShutdownSignals(modelId, () => saveHistory(history));

  const rl = readline.createInterface({ input, output });
  console.log("▸ Offline Chat v1 — commands: /exit /cancel /history\n");

  while (true) {
    const line = (await rl.question("You: ")).trim();
    if (!line) continue;
    if (line === "/exit") break;
    if (line === "/cancel") {
      const id = getActiveRequestId();
      if (id) await cancel({ requestId: id });
      console.log("\n▸ Cancel requested\n");
      continue;
    }
    if (line === "/history") {
      console.log(JSON.stringify(history.messages, null, 2));
      continue;
    }

    process.stdout.write("\nAssistant: ");
    const result = await runChatTurn(modelId, history, line);
    history = result.history;
    if (result.committed) await saveHistory(history);
    console.log("\n");
  }

  rl.close();
  await saveHistory(history);
} finally {
  if (modelId) {
    const { unloadModel, close } = await import("@qvac/sdk");
    await unloadModel({ modelId });
    await close();
  }
}
