import { cancel, close, unloadModel } from "@qvac/sdk";
import { getActiveRequestId } from "./chat.js";

/** TODO: cancel active request, persist history, unload model, close SDK */
export async function gracefulShutdown(modelId: string | undefined, onPersist: () => Promise<void>): Promise<void> {
  const requestId = getActiveRequestId();
  if (requestId) {
    try {
      await cancel({ requestId });
    } catch {
      /* may already be terminal */
    }
  }
  await onPersist();
  if (modelId) await unloadModel({ modelId });
  await close();
}

export function bindShutdownSignals(modelId: string | undefined, onPersist: () => Promise<void>): void {
  process.on("SIGINT", async () => {
    console.log("\n▸ Shutting down...");
    await gracefulShutdown(modelId, onPersist);
    process.exit(0);
  });
}
