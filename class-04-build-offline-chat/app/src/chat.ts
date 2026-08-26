import {
  completion,
  type CompletionRun,
} from "@qvac/sdk";
import { appendAssistant, appendUser, toCompletionHistory, type CommittedHistory } from "./history.js";
import { createTurnMetrics, formatMetrics, type TurnMetrics } from "./metrics.js";

export interface TurnResult {
  history: CommittedHistory;
  metrics: TurnMetrics;
  committed: boolean;
}

let activeRun: CompletionRun | null = null;

export function getActiveRequestId(): string | undefined {
  return activeRun?.requestId;
}

/** TODO: orchestrate one chat turn with streaming, commit boundary, cancellation support */
export async function runChatTurn(
  modelId: string,
  history: CommittedHistory,
  userText: string,
): Promise<TurnResult> {
  const metricsTracker = createTurnMetrics();
  const withUser = appendUser(history, userText);

  const run = completion({
    modelId,
    history: [...toCompletionHistory(withUser)],
    stream: true,
    generationParams: { temp: 0.7, predict: 256 },
  });
  activeRun = run;

  let provisional = "";
  for await (const event of run.events) {
    if (event.type === "contentDelta") {
      metricsTracker.markFirstToken();
      provisional += event.delta;
      process.stdout.write(event.delta);
    }
  }

  const final = await run.final;
  activeRun = null;
  const metrics = metricsTracker.finalize(final);

  // TODO: apply commit policy by stopReason — do NOT commit on cancelled
  const shouldCommit = final.stopReason !== "cancelled";
  const next = shouldCommit
    ? appendAssistant(withUser, final.contentText)
    : withUser;

  if (shouldCommit) console.log("\n" + formatMetrics(metrics));

  return { history: next, metrics, committed: shouldCommit };
}
